// @ts-check
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
//     constrain constraint(s) to also apply on this edit's commit. Constraints
//               are DATA-LAYER INVARIANTS — pure rules over the dataset, named by
//               data field — so the canonical home is the feature's `constraints`
//               (they then hold for every edit, not just this one). This per-edit
//               list is sugar for a guard you only want on one edit.
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

import { nearestSeries, DEFAULT_PICK_THRESHOLD } from './pick.js';
import { resolveSamples } from '../core/samples.js';

/**
 * @param {any} v
 * @returns {any[]}
 */
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * A fresh series key not already present in the data — the identity of a new line.
 * Uses the smallest non-negative integer free among the existing keys, so colors
 * (an ordinal scale over the keys) stay stable as lines come and go.
 * @param {any[]} data
 * @param {string | null} seriesField
 * @returns {number}
 */
function nextSeriesKey(data, seriesField) {
    if (!seriesField) return 0;
    const existing = new Set((data || []).map((d) => d[seriesField]));
    let n = 0;
    while (existing.has(n)) n++;
    return n;
}

/**
 * The starting values a minted datum gets from the dataset schema: every declared
 * field, set to its explicit `default` when given, else `null` (present but unset,
 * to be set later by an edit). Returns {} when no schema is declared.
 * @param {Record<string, import('../types').FieldSchema> | undefined} schema
 * @returns {Record<string, any>}
 */
function schemaDefaults(schema) {
    /** @type {Record<string, any>} */
    const out = {};
    if (!schema) return out;
    for (const [field, spec] of Object.entries(schema)) {
        out[field] = spec && spec.default !== undefined ? spec.default : null;
    }
    return out;
}

/**
 * @param {any} spec
 * @returns {import('../types').Edit}
 */
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

/**
 * Centre of a scene node: circles carry cx/cy; rects carry x/y/width/height.
 * @param {any} node
 * @returns {{ cx: number, cy: number } | null}
 */
function markCenter(node) {
    if (!node) return null;
    if (node.cx != null) return { cx: node.cx, cy: node.cy };
    if (node.x != null && node.width != null) {
        return { cx: node.x + node.width / 2, cy: node.y + node.height / 2 };
    }
    return null;
}

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
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                next[ch.field] = ch.scale.invertValue(visual);
            }
            return next;
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
 * to delete, plain click to recolour. (The opinionated preset layer will wire
 * this pairing for you; at the primitive level you compose it explicitly.)
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

/**
 * anchor — add ONE point to a connected path (a line's bezier-style anchor). The
 * inverse of `remove` for paths, and proximity-aware where `create` is not: it
 * resolves WHICH line the gesture means.
 *   into 'nearest' -> attach to the closest line within `threshold`; if none is
 *                     near (empty space) it falls back to starting a fresh series,
 *                     so repeated clicks draw a new line point-by-point, then extend
 *                     it (each later click is now near the line it just started).
 *   into 'new'     -> always start a fresh series.
 * The new point's series is written to the feature's series field; its position is
 * the inverted pointer on each positional channel (2D by default). Order is handled
 * by the mark's `order` (domain sort or as-drawn), so anchor just appends.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function anchor(options = {}) {
    const { into = 'nearest', at = 'append', channels, trigger = 'click', series: seriesField, ...rest } = options;
    const threshold = options.threshold != null && options.threshold > 0 ? options.threshold : DEFAULT_PICK_THRESHOLD;
    return makeEdit({
        type: 'anchor',
        gesture: trigger,
        channels: channels || ['x', 'y'],
        pick: 'plane',
        into,
        at,
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const sField = seriesField || ctx.seriesKey || null;
            // Resolve the target line: the nearest one, or a fresh series when
            // 'new' (or 'nearest' found none within threshold — empty space).
            let seriesVal = null;
            if (into === 'nearest') {
                seriesVal = nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, threshold);
            }
            if (seriesVal == null) seriesVal = nextSeriesKey(ctx.data, sField);

            const datum = { ...schemaDefaults(ctx.schema) };
            if (sField) datum[sField] = seriesVal;
            let placed = false;
            for (const ch of ctx.channels) {
                const visual = ch.name === 'x' ? ctx.pointer.x
                    : ch.name === 'y' ? ctx.pointer.y : undefined;
                if (visual === undefined || !ch.scale || !ch.scale.invertible) continue;
                datum[ch.field] = ch.scale.invertValue(visual);
                placed = true;
            }
            if (!placed) return undefined;
            return [...ctx.data, datum];
        }
    });
}

/**
 * newSeries — seed a WHOLE new line at once: one anchor per sampled domain
 * position (see resolveSamples: the scale's ticks by default, or a count / explicit
 * positions / time interval), each starting at the pointer's value on the value
 * axis (a flat line you then sweep into shape). This is the draw-from-scratch
 * primitive; `youDrawIt` composes it with a series-scoped sweep.
 *   domain / value : the positional axes ('x'/'y'); default domain 'x', value 'y'.
 *   samples        : passed to resolveSamples for the anchor domain positions.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function newSeries(options = {}) {
    const { domain = 'x', value = 'y', samples, trigger = 'dblclick', series: seriesField, ...rest } = options;
    return makeEdit({
        type: 'newSeries',
        gesture: trigger,
        channels: [domain, value],
        pick: 'plane',
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const sField = seriesField || ctx.seriesKey || null;
            const domainField = (ctx.encoding[domain] && ctx.encoding[domain].field)
                || (domain === 'x' ? ctx.xKey : ctx.yKey);
            const valueField = (ctx.encoding[value] && ctx.encoding[value].field)
                || (value === 'x' ? ctx.xKey : ctx.yKey);
            const domainScale = ctx.scales[domain];
            const valueScale = ctx.scales[value];
            if (!domainScale || !domainField) return undefined;

            const positions = resolveSamples(domainScale, samples);
            if (!positions.length) return undefined;

            // Flat line at the clicked value (or the value-domain start if the
            // value axis can't invert here).
            const seedVisual = value === 'x' ? ctx.pointer.x : ctx.pointer.y;
            const seedValue = valueScale && valueScale.invertible
                ? valueScale.invertValue(seedVisual)
                : (valueScale && valueScale.domain ? valueScale.domain()[0] : null);
            const seriesVal = nextSeriesKey(ctx.data, sField);

            const seeded = positions.map((pos) => {
                const datum = { ...schemaDefaults(ctx.schema) };
                if (sField) datum[sField] = seriesVal;
                datum[domainField] = pos;
                if (valueField) datum[valueField] = seedValue;
                return datum;
            });
            return [...ctx.data, ...seeded];
        }
    });
}

/**
 * sweep — you-draw-it painting: a drag that repaints the value of each point the
 * pointer crosses (series-scoped in the engine). Convenience over `drag`.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function sweep(options = {}) {
    return drag({ pick: 'sweep', guide: true, ...options });
}

/**
 * youDrawIt — alias of `sweep`, named for the interaction it implements.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function youDrawIt(options = {}) {
    return sweep(options);
}

// Arbitration predicates for `when` — kept separate from the edits so the same
// edit works under any strategy (see the gate() rationale).
export const when = {
    /** @param {import('../types').EditContext} ctx */
    shift: (ctx) => !!(ctx.event && ctx.event.shiftKey),
    /** @param {import('../types').EditContext} ctx */
    noShift: (ctx) => !(ctx.event && ctx.event.shiftKey),
    /** @param {import('../types').EditContext} ctx */
    alt: (ctx) => !!(ctx.event && ctx.event.altKey),
    /** @param {import('../types').EditContext} ctx */
    noAlt: (ctx) => !(ctx.event && ctx.event.altKey),
    /** @param {string} key */
    modifier: (key) => (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.event && ctx.event[key]),
    /** @param {string} key */
    noModifier: (key) => (/** @type {import('../types').EditContext} */ ctx) => !(ctx.event && ctx.event[key]),
    // Proximity arbitration for path authoring: is the pointer near an existing
    // line, or out in empty space? Pair anchor({ when: when.near }) with
    // newSeries({ when: when.far }) to add-to-nearest vs start-a-new-line.
    /** @param {import('../types').EditContext} ctx */
    near: (ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, DEFAULT_PICK_THRESHOLD) != null,
    /** @param {import('../types').EditContext} ctx */
    far: (ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, DEFAULT_PICK_THRESHOLD) == null,
    /** @param {number} t @returns {(ctx: import('../types').EditContext) => boolean} */
    nearWithin: (t) => (/** @type {import('../types').EditContext} */ ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, t) != null
};
