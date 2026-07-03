// edit/ — the `edit` primitive: how a gesture changes a channel's data. It is
// the inverse of encoding. Where `encode` maps data -> visual, an `edit` maps a
// gesture -> that channel's data, through the SAME scale.
//
// An edit is a descriptor the engine routes to:
//   { type, gesture, channels, when, pick, threshold, constrain, guide, apply }
//     gesture   'drag' | 'click' | 'dblclick' — the raw gesture that triggers it
//     channels  channel names it governs; null = inject the channel it's placed on
//     when      (ctx) => boolean — arbitration (e.g. only on Shift-drag)
//     pick      'direct' | 'nearest' | 'plane' — how the gesture selects its target
//                 direct  : the mark the gesture landed on
//                 nearest : the closest mark within `threshold` (proximity)
//                 plane   : no target — the edit produces a new datum (create)
//     constrain constraint(s) scoped to this edit (they carry their own field)
//     guide     true to self-draw this edit's guide (constraint bounds / snap
//               ring), retiring the old `target` indirection
//     apply     (ctx) => datum | dataset | undefined — performs the edit
//
// The engine resolves `channels` (names) into ctx.channels = [{ name, field,
// scale }] before calling apply, so an edit never has to look up its own field —
// which is exactly what removes the implicit valueKey coupling.
//
// Placed on a channel (co-located) for the simple case:
//   size: { field: "mag", edit: vibe.edit.resize() }
// Or at mark level for joint / arbitrary edits:
//   edits: [ vibe.edit.drag({ channels: ["x", "y"] }), vibe.edit.custom(fn) ]

const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function makeEdit(spec) {
    return {
        type: spec.type,
        gesture: spec.gesture || 'drag',
        channels: spec.channels || null,
        when: spec.when || null,
        pick: spec.pick || 'direct',
        threshold: spec.threshold != null ? spec.threshold : 0,
        constrain: asList(spec.constrain),
        guide: spec.guide || null,
        guideColor: spec.guideColor || null,
        apply: spec.apply
    };
}

// Centre of a scene node: circles carry cx/cy; rects carry x/y/width/height.
function markCenter(node) {
    if (!node) return null;
    if (node.cx != null) return { cx: node.cx, cy: node.cy };
    if (node.x != null && node.width != null) {
        return { cx: node.x + node.width / 2, cy: node.y + node.height / 2 };
    }
    return null;
}

// drag — position edit: invert the pointer coordinate on each positional channel.
// On x AND y it's a 2D move; on y alone it's a bar drag. Works on any invertible
// scale (linear pixel, band -> nearest category) via scale.invertValue.
export function drag(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'drag',
        gesture: 'drag',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (ctx) => {
            const next = { ...ctx.datum };
            for (const ch of ctx.channels) {
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                next[ch.field] = ch.scale.invertValue(visual);
            }
            return next;
        }
    });
}

// resize — magnitude edit: the gesture's radius (distance from the mark centre)
// inverts back to the channel's value, mirroring how the channel encodes value
// -> radius. Usually placed on `size`.
export function resize(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'resize',
        gesture: 'drag',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (ctx) => {
            const ch = ctx.channels[0];
            const c = markCenter(ctx.node);
            if (!ch || !ch.scale || !ch.scale.invertible || !c) return undefined;
            const radius = Math.hypot(ctx.pointer.x - c.cx, ctx.pointer.y - c.cy);
            return { ...ctx.datum, [ch.field]: ch.scale.invertValue(radius) };
        }
    });
}

// cycle — discrete edit: advance the channel to the next value in its domain.
// Usually placed on an ordinal `color`. Needs a stable domain (see notes).
export function cycle(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'cycle',
        gesture: 'click',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (ctx) => {
            const ch = ctx.channels[0];
            if (!ch || !ch.scale || !ch.scale.domain) return undefined;
            const domain = ch.scale.domain();
            if (!domain.length) return undefined;
            const i = domain.indexOf(ctx.datum[ch.field]);
            return { ...ctx.datum, [ch.field]: domain[(i + 1) % domain.length] };
        }
    });
}

// create — its own declaration (not a channel edit): a plane gesture that mints a
// NEW datum. It reuses the exact same scale inverses as `drag` — the clicked
// pixel is inverted through each positional channel — plus `defaults` for the
// non-positional fields (group, mag, …). Editing the created mark afterwards
// routes through the channel edits like any other mark, so create and edit share
// one bidirectional model. `trigger` picks the plane gesture ('click' default,
// or 'dblclick' to keep create distinct from a plane drag).
//
//   edits: [ vibe.edit.create({ defaults: { group: "a" } }) ]
export function create(options = {}) {
    const { channels, defaults = {}, trigger = 'click', ...rest } = options;
    return makeEdit({
        type: 'create',
        gesture: trigger,
        // Default to the positional channels; resolveChannels drops any the
        // feature doesn't encode (so a 1D likert create just omits the missing y).
        channels: channels || ['x', 'y'],
        pick: 'plane',
        ...rest,
        apply: (ctx) => {
            const datum = { ...defaults };
            let placed = false;
            for (const ch of ctx.channels) {
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                datum[ch.field] = ch.scale.invertValue(visual);
                placed = true;
            }
            if (!placed) return undefined; // no positionable channel: nothing to place
            return [...ctx.data, datum];
        }
    });
}

// custom — the escape hatch: arbitrary edit over the whole datum + event.
//   edits: [ vibe.edit.custom((datum, event, ctx) => ({ ...datum, ... })) ]
export function custom(fn, options = {}) {
    return makeEdit({
        type: 'custom',
        gesture: options.gesture || 'drag',
        channels: options.channels || null,
        ...options,
        apply: (ctx) => fn(ctx.datum, ctx.event, ctx)
    });
}

// Arbitration predicates for `when` — kept separate from the edits so the same
// edit works under any strategy (see the gate() rationale).
export const when = {
    shift: (ctx) => !!(ctx.event && ctx.event.shiftKey),
    noShift: (ctx) => !(ctx.event && ctx.event.shiftKey),
    alt: (ctx) => !!(ctx.event && ctx.event.altKey),
    noAlt: (ctx) => !(ctx.event && ctx.event.altKey),
    modifier: (key) => (ctx) => !!(ctx.event && ctx.event[key]),
    noModifier: (key) => (ctx) => !(ctx.event && ctx.event[key])
};
