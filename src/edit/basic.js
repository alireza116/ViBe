// @ts-check
// basic.js — the universal edits: every one applies to any mark with the
// channels it governs. `drag` moves, `resize` scales a magnitude, `cycle`
// advances a discrete channel, `create` mints a datum, `remove` deletes one, and
// `custom` is the escape hatch. Line-scoped authoring edits live in line.js.
//
// An edit is the inverse of encoding: where `encode` maps data -> visual, an
// edit's apply() maps a gesture -> that channel's data, through the SAME scale.

import { makeEdit, markCenter, schemaDefaults, resolveMarkNode, invertChannel, recenterSpan } from './shared.js';

/**
 * drag — position edit: invert the pointer coordinate on each positional channel.
 * On x AND y it's a 2D move; on y alone it's a bar drag. Works on any invertible
 * scale (linear pixel, band -> nearest category) via scale.invertValue.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function drag(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'drag',
        gesture: 'drag',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const next = { ...ctx.datum };
            for (const ch of ctx.channels) {
                const value = invertChannel(ch, ctx.pointer);
                if (value !== undefined) next[ch.field] = value;
            }
            return next;
        }
    });
}

/**
 * dragSpan — whole-span move: translate a PAIR of endpoint channels (x1+x2 or
 * y1+y2) together, preserving the distance between them, so grabbing a span
 * bar's body shifts both ends rather than editing one. Stateless like `drag`:
 * each tick recenters the mark's CURRENT pixel span on the pointer (no
 * dragstart/delta tracking) — the same "gesture sets the absolute value"
 * model `drag` already uses, just applied to two fields at once.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function dragSpan(options = {}) {
    const { channels, ...rest } = options;
    return makeEdit({
        type: 'dragSpan',
        gesture: 'drag',
        channels: channels || null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const [chA, chB] = ctx.channels;
            const node = resolveMarkNode(ctx);
            const span = recenterSpan(node, chA, chB, ctx.pointer);
            if (!span) return undefined;
            return { ...ctx.datum, [chA.field]: span.a, [chB.field]: span.b };
        }
    });
}

/**
 * brushSpan — the combined Gantt-bar interaction: grabbing near one endpoint
 * resizes THAT edge only (like a lone `drag()` on that channel); grabbing the
 * body translates both together (like `dragSpan`). Which zone a gesture means
 * is resolved once, at dragstart, by the `brush` driver (src/edit/drivers/
 * brush.js) — this apply() is stateless per tick, just branching on the
 * driver's lock (`ctx.drawState.zone`), exactly how `draw()` (line.js) reads
 * its own driver-set `ctx.drawState` to pick edit-vs-draw behavior.
 *
 * x1 is not guaranteed to stay the smaller of the pair mid-gesture (dragging
 * an edge past the other is allowed, and renders fine — bar.js's rect always
 * takes min/max of the two, so it never cares which field is which). Only at
 * `dragend` does the driver re-invoke this with `zone: 'canonicalize'`, which
 * swaps the two field VALUES if they ended up inverted — a one-time, purely
 * data-side cleanup that changes nothing on screen (rendering is already
 * order-agnostic), so it can't cause the mid-drag jump a per-tick sort would.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function brushSpan(options = {}) {
    // `pick` is dropped, not just defaulted: brushSpan only works with the brush
    // driver (it reads ctx.drawState.zone, which only that driver sets), so
    // unlike other edits it can't be repointed at a different pick strategy.
    const { channels, edgeInset, pick: _pick, ...rest } = options;
    return makeEdit({
        type: 'brushSpan',
        gesture: 'drag',
        channels: channels || null,
        // Not a standard Edit field; the brush driver reads edit.edgeInset
        // directly (the same way pickThreshold reads edit.threshold).
        edgeInset,
        ...rest,
        pick: 'brush',
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const [chA, chB] = ctx.channels;
            const datum = ctx.datum;
            if (!chA || !chB || !datum) return undefined;
            const zone = ctx.drawState && ctx.drawState.zone;
            if (!zone) return undefined; // driver sets the lock on dragstart

            if (zone === 'canonicalize') {
                const a = datum[chA.field], b = datum[chB.field];
                if (a == null || b == null || a <= b) return undefined;
                return { ...datum, [chA.field]: b, [chB.field]: a };
            }

            if (zone === 'body') {
                const node = resolveMarkNode(ctx);
                const span = recenterSpan(node, chA, chB, ctx.pointer);
                if (!span) return undefined;
                return { ...datum, [chA.field]: span.a, [chB.field]: span.b };
            }

            // zone is an edge lock: the driver names which physical field it grabbed.
            const lockedField = ctx.drawState && ctx.drawState.field;
            const target = lockedField === chA.field ? chA
                : lockedField === chB.field ? chB : null;
            if (!target) return undefined;
            const value = invertChannel(target, ctx.pointer);
            if (value === undefined) return undefined;
            return { ...datum, [target.field]: value };
        }
    });
}

/**
 * resize — magnitude edit: the gesture's radius (distance from the mark centre)
 * inverts back to the channel's value, mirroring how the channel encodes value
 * -> radius. Usually placed on `size`.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function resize(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'resize',
        gesture: 'drag',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            const c = markCenter(ctx.node);
            if (!ch || !ch.scale || !ch.scale.invertible || !c) return undefined;
            const radius = Math.hypot(ctx.pointer.x - c.cx, ctx.pointer.y - c.cy);
            return { ...ctx.datum, [ch.field]: ch.scale.invertValue(radius) };
        }
    });
}

/**
 * rotate — angular edit: the pointer's ANGLE about the plot centre inverts back
 * to the channel's value, mirroring how the channel encodes value -> degrees. It
 * is the angular sibling of `resize` (which inverts the pointer's radius): the
 * gesture-geometry half is the atan2 below; the data half goes through the SAME
 * channel scale (its `range` is in degrees), so encode and edit stay exact
 * inverses. Used for a correlation line: `angle: { field:'r', domain:[-1,1],
 * range:[-45,45], edit: rotate() }` maps a drag to a slope in [-1, 1].
 *
 * A line through the centre is direction-agnostic (up-right == down-left), so the
 * raw pointer angle is folded into (-90, 90] before it hits the scale (which then
 * clamps to its own range). `relativeTo` names another angular channel and makes
 * the gesture measure the ABSOLUTE angular distance from that channel's current
 * angle — the "open the cone" spread gesture, where widening the gap from the
 * mean line increases the value. `pick: 'plane'` (the whole plane is the target).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function rotate(options = {}) {
    const { channel, relativeTo, ...rest } = options;
    // Fold a screen-space pointer into a math-convention angle in (-90, 90].
    const pointerAngle = (/** @type {import('../types').EditContext} */ ctx) => {
        const cx = (ctx.width || 0) / 2;
        const cy = (ctx.height || 0) / 2;
        let deg = Math.atan2(-(ctx.pointer.y - cy), ctx.pointer.x - cx) * 180 / Math.PI;
        if (deg > 90) deg -= 180;
        else if (deg <= -90) deg += 180;
        return deg;
    };
    return makeEdit({
        type: 'rotate',
        gesture: 'drag',
        pick: 'plane',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            const scale = ch && ch.scale;
            if (!scale || !scale.invertible || !ctx.data.length) return undefined;
            const deg = pointerAngle(ctx);
            if (!relativeTo) {
                return ctx.data.map((d) => ({ ...d, [ch.field]: scale.invertValue(deg) }));
            }
            // Spread: |pointer angle − the reference channel's encoded angle|.
            const refSpec = ctx.markChannels[relativeTo];
            const refField = refSpec ? refSpec.field : null;
            const refScale = ctx.scales[relativeTo];
            return ctx.data.map((d) => {
                const refDeg = refField != null && refScale?.encode ? refScale.encode(d[refField]) : 0;
                const delta = Math.abs(deg - refDeg);
                return { ...d, [ch.field]: scale.invertValue(delta) };
            });
        }
    });
}

/**
 * cycle — discrete edit: advance the channel to the next value in its domain.
 * Usually placed on an ordinal `color`. Needs a stable domain (see notes).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function cycle(options = {}) {
    const { channel, ...rest } = options;
    return makeEdit({
        type: 'cycle',
        gesture: 'click',
        channels: channel ? [channel] : null,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            if (!ch || !ch.scale || !ch.scale.domain || !ctx.datum) return undefined;
            const domain = ch.scale.domain();
            if (!domain.length) return undefined;
            const i = domain.indexOf(ctx.datum[ch.field]);
            return { ...ctx.datum, [ch.field]: domain[(i + 1) % domain.length] };
        }
    });
}

/**
 * create — its own declaration (not a channel edit): a plane gesture that mints a
 * NEW datum. It reuses the exact same scale inverses as `drag` — the clicked
 * pixel is inverted through each positional channel — plus `defaults` for the
 * non-positional fields (group, mag, …). Editing the created mark afterwards
 * routes through the channel edits like any other mark, so create and edit share
 * one bidirectional model. `trigger` picks the plane gesture ('click' default,
 * or 'dblclick' to keep create distinct from a plane drag).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
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
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            // Seed every declared schema field first (its `default`, else null —
            // present-but-unset, editable later), so a minted datum matches the
            // elicited shape. Explicit create `defaults` then win, and the inverted
            // pointer wins last for the positional channels below.
            const datum = { ...schemaDefaults(ctx.schema), ...defaults };
            let placed = false;
            for (const ch of ctx.channels) {
                const value = invertChannel(ch, ctx.pointer);
                if (value === undefined) continue;
                datum[ch.field] = value;
                placed = true;
            }
            if (!placed) return undefined; // no positionable channel: nothing to place
            return [...ctx.data, datum];
        }
    });
}

/**
 * toggle — slot edit: the pointer names a slot (each governed channel inverted to
 * its data value); if a datum already occupies that slot it is removed, otherwise
 * one is minted there. It is `create` and `remove` folded into the one gesture a
 * checkbox has, which is why the multiple-choice and matrix widgets are built on
 * it: click an empty option to pick it, click your pick to take it back.
 *
 * Slot identity is the tuple of the governed channels' fields, so a 1-D scale
 * (`channels: ['x']`) toggles an option and a 2-D grid (`channels: ['x', 'y']`)
 * toggles a cell. Pairs naturally with `unique` (one pick per row) and `count`
 * (a cap on picks) — both reject or replace the minted datum as usual.
 *
 * `pick: 'plane'` by default (a click in empty space). Give it `pick: 'probe'` and
 * the hover previews the toggle before the click commits it.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function toggle(options = {}) {
    const { channel, channels, defaults = {}, ...rest } = options;
    return makeEdit({
        type: 'toggle',
        gesture: 'click',
        channels: channels || (channel ? [channel] : ['x']),
        pick: 'plane',
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            // Mint the datum the pointer names — the same inversion `create` does.
            const datum = { ...schemaDefaults(ctx.schema), ...defaults };
            let placed = false;
            for (const ch of ctx.channels) {
                const value = invertChannel(ch, ctx.pointer);
                if (value === undefined) continue;
                datum[ch.field] = value;
                placed = true;
            }
            if (!placed) return undefined; // no positionable channel: no slot named

            // The slot's identity is the governed fields' tuple.
            const keys = ctx.channels.map((ch) => ch.field);
            const occupant = ctx.data.findIndex((d) => keys.every((k) => d[k] === datum[k]));
            return occupant >= 0
                ? ctx.data.filter((_, i) => i !== occupant)
                : [...ctx.data, datum];
        }
    });
}

/**
 * remove — deletes the targeted datum. Like every other edit it is just a
 * { gesture, when, pick } descriptor, so it shares the dispatch and arbitration:
 * `when` decides whether it (vs. a sibling edit on the same gesture) claims the
 * event, and `pick` selects the target — 'direct' (the mark clicked) or 'nearest'
 * (the closest mark within threshold, deletable from empty space).
 *
 * Trigger defaults to a plain click. When another click edit already lives on the
 * mark (e.g. `cycle` recolour), pair them with a modifier so they don't both
 * fire: `cycle({ when: when.noAlt })` + `remove({ when: when.alt })` — Alt-click
 * to delete, plain click to recolour.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function remove(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'remove',
        gesture: options.gesture || 'click',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            if (ctx.index == null) return undefined; // no target resolved
            return ctx.data.filter((_, i) => i !== ctx.index);
        }
    });
}

/**
 * custom — the escape hatch: arbitrary edit over the whole datum + event.
 * @param {(datum: any, event: any, ctx: import('../types').EditContext) => any} fn
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function custom(fn, options = {}) {
    return makeEdit({
        type: 'custom',
        gesture: options.gesture || 'drag',
        channels: options.channels || null,
        ...options,
        apply: (/** @type {import('../types').EditContext} */ ctx) => fn(ctx.datum, ctx.event, ctx)
    });
}
