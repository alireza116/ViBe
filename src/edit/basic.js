// @ts-check
// basic.js — the universal edits: every one applies to any mark with the
// channels it governs. `drag` moves, `resize` scales a magnitude, `cycle`
// advances a discrete channel, `create` mints a datum, `remove` deletes one, and
// `custom` is the escape hatch. Line-scoped authoring edits live in line.js.
//
// An edit is the inverse of encoding: where `encode` maps data -> visual, an
// edit's apply() maps a gesture -> that channel's data, through the SAME scale.

import { makeEdit, markCenter, schemaDefaults, resolveMarkNode, invertChannel, recenterSpan } from './shared.js';
// The swatch grid edit.legend hit-tests is the same one guides.legend draws.
import { legendLayout } from '../guides/legend.js';
import { axisOf, pointerDegrees, unwrapDegrees } from '../core/encoding.js';

/**
 * drag — position edit: invert the pointer coordinate on each positional channel.
 * On x AND y it's a 2D move; on y alone it's a bar drag. On `angle` (with a mark
 * centre) it is a rotate. Works on any invertible scale (linear pixel, band ->
 * nearest category) via scale.invertValue.
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
            const center = markCenter(resolveMarkNode(ctx));
            for (const ch of ctx.channels) {
                const value = invertChannel(ch, ctx.pointer, center);
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
 * brushRect — the 2-D sibling of brushSpan: composable edge / corner / body editing
 * of a rect's four extents (x1/x2 AND y1/y2 spans). Grab near an EDGE to resize
 * that one side, near a CORNER to resize two extents at once, or the BODY to move
 * the whole rect. Which zone a gesture means is classified ONCE at dragstart by the
 * brushRect driver (src/edit/drivers/brushRect.js) and locked in the feature's
 * session for the gesture — this apply() is stateless per tick, branching on the
 * driver's lock (`ctx.drawState.zone` + `ctx.drawState.fields`), exactly like
 * brushSpan reads its 1-D lock.
 *
 * Editing is OPT-IN and composable, via two options the driver reads directly (the
 * same way it reads `edgeInset`):
 *   resize — 'both' (default) | 'x' | 'y' | 'none'. Which axes' edges/corners are
 *            live. 'x'/'y' resize only that axis; 'none' disables resize (move-only).
 *   move   — true (default) | false. Whether a body drag translates the whole rect.
 * A disabled resize zone degrades to `body` (when `move`), so brushRect({ resize:'x' })
 * behaves like a per-axis brushSpan, brushRect({ resize:'none' }) is a pure 2-D move,
 * and brushRect({ move:false }) is resize-only.
 *
 * Like brushSpan, the endpoint fields aren't guaranteed to stay ordered mid-gesture
 * (dragging an edge past its partner is fine — rect.js always takes min/max). At
 * dragend the driver re-invokes with `zone:'canonicalize'`, a one-time data cleanup
 * that swaps any inverted pair's VALUES (on both axes) with no visual change.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function brushRect(options = {}) {
    // `pick` is dropped (brushRect only works with its driver, which sets the
    // zone lock). `resize`/`move`/`edgeInset` are driver-only knobs: makeEdit keeps
    // only canonical Edit fields, so they're attached to the descriptor AFTER it's
    // built (the driver reads them off the edit object, like edgeInsetOf does).
    const { channels, edgeInset, resize = 'both', move = true, pick: _pick, ...rest } = options;
    const edit = makeEdit({
        type: 'brushRect',
        gesture: 'drag',
        channels: channels || ['x1', 'x2', 'y1', 'y2'],
        ...rest,
        pick: 'brushRect',
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const zone = ctx.drawState && ctx.drawState.zone;
            const datum = ctx.datum;
            if (!zone || !datum) return undefined;

            // Group the resolved endpoint channels by axis into [lo, hi] pairs.
            const xPair = ctx.channels.filter((ch) => axisOf(ch.name) === 'x');
            const yPair = ctx.channels.filter((ch) => axisOf(ch.name) === 'y');
            const node = resolveMarkNode(ctx);

            if (zone === 'canonicalize') {
                const out = { ...datum };
                let changed = false;
                for (const [a, b] of [xPair, yPair]) {
                    if (!a || !b) continue;
                    const va = datum[a.field], vb = datum[b.field];
                    if (va == null || vb == null || va <= vb) continue;
                    out[a.field] = vb;
                    out[b.field] = va;
                    changed = true;
                }
                return changed ? out : undefined;
            }

            if (zone === 'body') {
                // Recenter BOTH spans on the pointer — the 2-D whole-rect move.
                const out = { ...datum };
                let placed = false;
                for (const [a, b] of [xPair, yPair]) {
                    if (!a || !b) continue;
                    const span = recenterSpan(node, a, b, ctx.pointer);
                    if (!span) continue;
                    out[a.field] = span.a;
                    out[b.field] = span.b;
                    placed = true;
                }
                return placed ? out : undefined;
            }

            // edge / corner: the driver named which field(s) the grab locked.
            const fields = (ctx.drawState && ctx.drawState.fields) || [];
            const out = { ...datum };
            let placed = false;
            for (const ch of ctx.channels) {
                if (!ch.field || !fields.includes(ch.field)) continue;
                const value = invertChannel(ch, ctx.pointer);
                if (value === undefined) continue;
                out[ch.field] = value;
                placed = true;
            }
            return placed ? out : undefined;
        }
    });
    // Attach the driver-only knobs (dropped by makeEdit's canonical filter).
    const e = /** @type {any} */ (edit);
    e.edgeInset = edgeInset;
    e.resize = resize;
    e.move = move;
    return edit;
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
            // resolveMarkNode, not ctx.node: a plane-pick gesture (nearest/sweep)
            // carries no node, so reading ctx.node directly made this universal
            // edit silently dead under any pick but 'direct'. drag() and rotate()
            // resolve the same way.
            const c = markCenter(resolveMarkNode(ctx));
            if (!ch || !ch.scale || !ch.scale.invertible || !c) return undefined;
            const radius = Math.hypot(ctx.pointer.x - c.cx, ctx.pointer.y - c.cy);
            return { ...ctx.datum, [ch.field]: ch.scale.invertValue(radius) };
        }
    });
}

/**
 * rotate — angular edit: the pointer's ANGLE about a pivot inverts back to the
 * channel's value, mirroring how the channel encodes value -> degrees. It is the
 * angular sibling of `resize` (which inverts the pointer's radius): the
 * gesture-geometry half is atan2; the data half goes through the SAME channel
 * scale (its `range` is in degrees), so encode and edit stay exact inverses.
 *
 * Options:
 *   pivot: 'plot' (default) — plot centre; 'mark' — markCentre of the hit node
 *   fold:  true (default) — fold into (-90, 90] for direction-agnostic lines
 *          (cone); false — full-circle degrees for gauges/dials
 *   pick:  'plane' (default) updates the whole dataset; 'direct' updates the
 *          hit datum only (needle handle); 'probe' keeps the hover/click flow
 *
 * `relativeTo` names another angular channel and makes the gesture measure the
 * ABSOLUTE angular distance from that channel's current angle — the "open the
 * cone" spread gesture.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function rotate(options = {}) {
    const { channel, relativeTo, pivot = 'plot', fold = true, ...rest } = options;
    const pick = rest.pick || 'plane';
    const pointerAngle = (/** @type {import('../types').EditContext} */ ctx) => {
        let cx = (ctx.width || 0) / 2;
        let cy = (ctx.height || 0) / 2;
        if (pivot === 'mark') {
            const c = markCenter(resolveMarkNode(ctx));
            if (c) { cx = c.cx; cy = c.cy; }
        }
        let deg = pointerDegrees(ctx.pointer, { cx, cy });
        if (fold) {
            if (deg > 90) deg -= 180;
            else if (deg <= -90) deg += 180;
        } else {
            // Gauge/dial (unfolded): unwrap the raw atan2 angle onto the channel's
            // authored degree span so dragging past an endpoint clamps to THAT end
            // instead of wrapping across the ±180° seam to the far value.
            const scale = /** @type {any} */ (ctx.channels[0] && ctx.channels[0].scale);
            const range = scale && typeof scale.range === 'function' ? scale.range() : null;
            if (range && range.length >= 2
                && typeof range[0] === 'number' && typeof range[range.length - 1] === 'number') {
                deg = unwrapDegrees(deg, range[0], range[range.length - 1]);
            }
        }
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
            if (!scale || !scale.invertible) return undefined;
            const deg = pointerAngle(ctx);
            const writeOne = (/** @type {any} */ d) => {
                if (!relativeTo) {
                    return { ...d, [ch.field]: scale.invertValue(deg) };
                }
                const refSpec = ctx.markChannels[relativeTo];
                const refField = refSpec ? refSpec.field : null;
                const refScale = ctx.scales[relativeTo];
                const refDeg = refField != null && refScale?.encode ? refScale.encode(d[refField]) : 0;
                const delta = Math.abs(deg - refDeg);
                return { ...d, [ch.field]: scale.invertValue(delta) };
            };
            // Direct-pick (needle): write the hit datum only.
            if (pick === 'direct') {
                if (!ctx.datum) return undefined;
                return writeOne(ctx.datum);
            }
            if (!ctx.data.length) return undefined;
            return ctx.data.map(writeOne);
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
        // The minted row is the one a constraint should resolve around.
        cardinality: 'append',
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
        // No `cardinality`: this gesture mints on an empty slot and drops on a full
        // one, so "the row the gesture touched" has no single answer. Left null,
        // which resolves nothing around it — the honest reading for a slot edit.
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
        // The row is gone; no datum is active for a constraint to resolve around.
        cardinality: 'delete',
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            if (ctx.index == null) return undefined; // no target resolved
            return ctx.data.filter((_, i) => i !== ctx.index);
        }
    });
}

/**
 * The one apply `set` and `editText` share: write the value carried in `ctx.value`
 * into the first channel's field. There is no pixel to invert — the value arrives
 * whole (a typed string, a picked category, a slider number), via the `commit`
 * gesture. Factored so "write a value into a field" has one implementation.
 * @param {import('../types').EditContext} ctx
 * @returns {any}
 */
function writeValue(ctx) {
    const ch = ctx.channels[0];
    if (!ch || !ch.field || ctx.value === undefined || !ctx.datum) return undefined;
    return { ...ctx.datum, [ch.field]: ctx.value };
}

/**
 * set — the universal value edit: write `ctx.value` into the channel's field,
 * whatever the field's TYPE (quantitative, colour, categorical, temporal). Unlike
 * the positional edits its input isn't a pixel to invert — it's the value itself,
 * carried on the `commit` gesture in `ctx.value`. This is the edit an EXTERNAL
 * controller drives with `el.control(name).set(value)`: a picker sets a category,
 * a swatch sets a colour, a number field sets a magnitude — all through the same
 * `commit` path `editText` uses, so the engine treats it as an ordinary direct
 * gesture (no new pick/driver). The channel's scale still declares what values are
 * ACCEPTED (`el.control(name).accepts()` reads that domain), so the UI can offer
 * only valid choices.
 *
 * Placed on any channel (`fill: { field:'group', edit: set() }`) or at mark level
 * (`edits: [set({ channels:['fill'] })]`).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function set(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'set',
        gesture: 'commit',
        pick: 'direct',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: writeValue
    });
}

/**
 * editText — content edit: write a typed string back into the text channel's field.
 * The text specialization of `set`: same `commit`/`ctx.value` write, but named and
 * defaulted for text so the renderer's inline-keyboard lifecycle (double-click a
 * text mark → inline input → Enter/blur commits, Esc cancels) reads clearly. The
 * renderer owns that lifecycle and emits a single `commit` gesture carrying the
 * value in `ctx.value`; this edit just stores it, so the engine treats `commit` as
 * an ordinary direct gesture (no new pick/driver), staying ignorant of the mode.
 *
 * Placed on the text channel (`text: { field:'label', edit: editText() }`) or at
 * mark level (`edits: [editText({ channels:['text'] })]`).
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function editText(options = {}) {
    const { channel, channels, ...rest } = options;
    return makeEdit({
        type: 'editText',
        gesture: 'commit',
        pick: 'direct',
        channels: channels || (channel ? [channel] : ['text']),
        ...rest,
        apply: writeValue
    });
}

/**
 * rank — reorder by dragging along a discrete (band/point) or quantitative rank
 * axis. Inverts the pointer to a rank slot, then SWAPS with whoever currently
 * occupies that slot so ranks stay unique. Returns a full dataset (whole-dataset
 * edit). Place on the rank channel: `y: { field: 'rank', edit: rank() }` or
 * `edits: [rank({ channels: ['y'] })]`.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function rank(options = {}) {
    const { channel, channels, field, ...rest } = options;
    return makeEdit({
        type: 'rank',
        gesture: 'drag',
        pick: rest.pick || 'direct',
        channels: channels || (channel ? [channel] : null),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            if (!ch || !ctx.datum || ctx.index == null) return undefined;
            const f = field || ch.field;
            if (!f) return undefined;
            const nextRank = invertChannel(ch, ctx.pointer);
            if (nextRank === undefined) return undefined;
            const oldRank = ctx.datum[f];
            if (oldRank === nextRank) return undefined;
            // Swap: the dragged datum takes nextRank; whoever held it gets oldRank.
            return ctx.data.map((d, i) => {
                if (i === ctx.index) return { ...d, [f]: nextRank };
                if (d[f] === nextRank) return { ...d, [f]: oldRank };
                return d;
            });
        }
    });
}

/**
 * legend — pick a discrete domain value by clicking a swatch in a legend row.
 * Pair with `guides.legend({ channel })` for the visual row, passing it the SAME
 * layout options (`x`, `y`, `size`, `gap`, `columns`, `labelWidth`): both go
 * through the one `legendLayout`, so the box you can click is the swatch you can
 * see. Writes the chosen domain value into the channel's field on the active
 * (or sole) datum.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function legend(options = {}) {
    const {
        channel, channels,
        x, y, size, gap, columns, labelWidth,
        ...rest
    } = options;
    const layout = { x, y, size, gap, columns, labelWidth };
    return makeEdit({
        type: 'legend',
        gesture: 'click',
        pick: 'plane',
        channels: channels || (channel ? [channel] : ['fill']),
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const ch = ctx.channels[0];
            if (!ch || !ch.field || !ch.scale || typeof ch.scale.domain !== 'function') return undefined;
            const domain = ch.scale.domain();
            if (!domain.length) return undefined;
            const { size: sw, slotAt } = legendLayout(layout, domain.length, ctx);
            const px = ctx.pointer.x, py = ctx.pointer.y;
            let hit = null;
            domain.forEach((value, i) => {
                const { x: sx, y: sy } = slotAt(i);
                if (px >= sx && px <= sx + sw && py >= sy && py <= sy + sw) hit = value;
            });
            if (hit == null) return undefined;
            if (ctx.datum && ctx.index != null) {
                return { ...ctx.datum, [ch.field]: hit };
            }
            if (ctx.data.length === 1) {
                return [{ ...ctx.data[0], [ch.field]: hit }];
            }
            return undefined;
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
