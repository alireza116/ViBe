// @ts-check
// arc.js — pie / donut slices. Each row's magnitude (the `value` channel's field)
// is stacked into an angular span and drawn as an annular sector. Shares arcPath
// with axisRadial.
//
//   arc({
//     outerRadius: 100, innerRadius: 40,   // donut
//     channels: {
//       value: { field: 'share' },         // magnitude → slice width
//       fill:  { field: 'party' },
//     },
//   })
//
// ── A GRID / SCATTER of donuts ───────────────────────────────────────────────
// A donut is a view over a GROUP of rows the way `face` is a view over one row —
// so it scatters into the plane the same way. Bind `x` (and optionally `y`) to a
// field and each distinct position becomes a SLOT holding its own donut; the rows
// at that slot are its slices. There is no group transform — the encoding IS the
// grouping (rows sharing the x/y value share a donut). A `size` field scales each
// donut independently; `outerRadius` (px) pins one radius for all; otherwise the
// radius fits the slot (a band category's cell, or a shrunk scatter default).
//
//   donut({
//     channels: {
//       x:     { field: 'state' },         // band axis → one donut per state
//       value: { field: 'share' },         // party's share within its state
//       fill:  { field: 'party' },
//       size:  { field: 'voters' },        // (optional) donut size = turnout
//     },
//     edits: [edit.arc.edge()],            // drag a boundary — within that state
//   })
//
// A boundary drag redistributes share between the two adjacent slices of ONE
// donut (its stamped `members`), holding that slot's total fixed — the per-slot
// "maintainSum" a pie enforces by construction — and never disturbs another slot.
//
// The magnitude channel is `value`, NOT `angle`. Across this library `angle` means
// a rotation/angular POSITION (needle's direction, text's rotation, axisRadial's
// angular scale) — it is inverted back to data by rotate()/move() as an angle. A
// slice's `share` is nothing of the sort: it's a quantity that the pie layout
// normalizes into a sweep. Naming it `angle` made one channel mean two unrelated
// things depending on the mark, so it's `value` here (see CLAUDE.md, "one
// documented name per behavior").
//
// Layout normalizes by the sum of magnitudes over the mark's rows (stacked bar in
// polar form). Slice boundaries are draggable via edit.arc.edge(); sibling controls
// work with maintainSum.

import { encodeChannel, resolveStyle, normalizeMarkOptions, markDefaults, resolveHandles } from './mark.js';
import { arcSpan, arcPath, polarToXY } from './polar.js';
import { isBand, bandwidthOf } from '../core/scales.js';

/**
 * @param {any} [options]
 * @returns {import('../types').Mark}
 */
export function arc(options = {}) {
    const opts = normalizeMarkOptions(options, {
        mark: 'arc',
        allow: [
            'outerRadius', 'innerRadius', 'padAngle', 'arc', 'start', 'end',
            'handles', 'handleSize', 'handleColor',
        ],
    });
    const {
        channels = {},
        id,
        edits,
        constraints,
        outerRadius: outerOpt,
        innerRadius = 0,
        padAngle = 0,
        arc: arcOpt,
        start,
        end,
        // Boundary editing chrome: `handles: true` draws a grab dot on each interior
        // edge, `false` keeps the edge grabbable but invisible. handleSize is the dot
        // radius (also the invisible grab target). Only emitted when an edge edit is
        // wired (see markEdits below).
        handles = true,
        handleSize,
        handleColor,
    } = opts;

    const markEdits = edits || [];
    const editable = markEdits.length > 0;

    const [spanStart, spanEnd] = arcSpan({
        arc: arcOpt || 'full',
        start: start != null ? start : (arcOpt ? undefined : -180),
        end: end != null ? end : (arcOpt ? undefined : 180),
    });
    const valueField = channels.value && channels.value.field;

    return {
        id,
        markName: 'arc',
        channels,
        edits: markEdits,
        constraints,
        // When `x`/`y` carry a categorical field, each category is a SLOT that holds
        // one donut, so a discrete position axis wants a band (an interval to fit the
        // ring into), not a point tick. Harmless when nothing is gridded — arc's
        // classic single donut binds no positional field, so this preference never
        // fires. (See `build`: rows are bucketed by their resolved x/y position.)
        discreteScale: 'band',
        // The magnitude is the mark's value axis; there is no category axis to key
        // (a pie's rows are its own layout order), so xKey stays undefined rather
        // than aliasing the same field twice.
        yKey: valueField,
        // Capability flag: what edit.arc.* needs to work (see SCOPE_CAPABILITY).
        supportsArc: true,
        /**
         * @param {any[]} currentData
         * @param {any} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            // ── Which rows form one donut ────────────────────────────────────────
            // A donut is a view over a GROUP of rows (its slices), the way a face is
            // a view over ONE row. When a positional channel carries a field, that
            // field partitions the dataset into slots — one donut per slot, placed at
            // the slot's x/y (a band category's centre, or a scatter coordinate). No
            // group transform: the ENCODING is the grouping. Bind neither x nor y and
            // every row is one bucket — the classic single donut, unchanged.
            const posFields = ['x', 'y']
                .filter((/** @type {string} */ c) => channels[c] && channels[c].field != null)
                .map((/** @type {string} */ c) => channels[c].field);
            // NUL joins the slot's x/y into one key because it cannot occur in a
            // field value, so two different pairs can never collide. Write it as the
            // ESCAPE, never as a literal NUL byte: a raw one makes git classify the
            // whole file as binary, which silently costs you diffs, line-level review
            // and merges — this file was in exactly that state.
            /** @param {any} d */
            const keyOf = (d) => (posFields.length ? posFields.map((f) => d[f]).join('\u0000') : '__all__');

            // Bucket rows, keeping each row's GLOBAL index (its address in the engine's
            // one dataset) and first-seen order — both for the slot and within it — so
            // slice/handle indices and the edge edit still address that one dataset.
            /** @type {Map<string, { rep: any, members: number[] }>} */
            const buckets = new Map();
            currentData.forEach((/** @type {any} */ d, /** @type {number} */ i) => {
                const k = keyOf(d);
                let b = buckets.get(k);
                if (!b) { b = { rep: d, members: [] }; buckets.set(k, b); }
                b.members.push(i);
            });
            const bucketList = [...buckets.values()];

            // Default outer radius that FITS a slot. A band position axis gives a
            // natural cell (its bandwidth); a continuous scatter has none, so shrink
            // when there are several donuts. `outerRadius` (px) overrides for all
            // donuts; a `size` field drives each donut's radius independently.
            const bandX = isBand(scales.x), bandY = isBand(scales.y);
            const cellW = bandX ? bandwidthOf(scales.x, width) : width;
            const cellH = bandY ? bandwidthOf(scales.y, height) : height;
            const fitR = (bandX || bandY)
                ? 0.42 * Math.min(cellW, cellH)
                : (bucketList.length > 1 ? 0.14 : 0.4) * Math.min(width, height);

            const span = spanEnd - spanStart;
            const pad = padAngle;

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            // One handle contract for every mark that draws one: shared radius
            // default, one meaning per `handles` value, paint from the theme rather
            // than the literals ('#0f172a' / '#fff') that used to live here and made
            // an arc's boundary handles invisible on a dark theme.
            const handleStyle = resolveHandles(scales, { handles, handleSize, handleColor });

            bucketList.forEach((bucket) => {
                const rep = bucket.rep;
                const members = bucket.members;
                // A slot's position/radius resolve from its REPRESENTATIVE row, so a
                // derived ({ fn }) channel gets that row's own global index.
                const repIndex = members[0];
                const cx = encodeChannel(scales, channels, 'x', rep, width / 2, repIndex, currentData);
                const cy = encodeChannel(scales, channels, 'y', rep, height / 2, repIndex, currentData);
                // Outer radius: explicit px > per-donut `size` field > fit default.
                const outer = outerOpt != null
                    ? outerOpt
                    : (channels.size ? encodeChannel(scales, channels, 'size', rep, fitR, repIndex, currentData) : fitR);
                // innerRadius in (0,1] is a RATIO of outer (so a data-driven radius
                // keeps its ring proportional); >1 is absolute px, clamped inside.
                const innerR = innerRadius > 0 && innerRadius <= 1
                    ? innerRadius * outer
                    : Math.min(innerRadius, outer * 0.95);

                // Magnitude per slice: prefer the raw field (so stacking is in data
                // units), not the encoded angle — pie layout owns the angular math.
                const mags = members.map((/** @type {number} */ gi) => {
                    const d = currentData[gi];
                    if (valueField != null) {
                        const v = Number(d[valueField]);
                        return Number.isFinite(v) && v > 0 ? v : 0;
                    }
                    const enc = encodeChannel(scales, channels, 'value', d, 0, gi, currentData);
                    return Number.isFinite(enc) && enc > 0 ? Number(enc) : 0;
                });
                const total = mags.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
                const nSlices = members.length;
                const usable = total > 0 ? span - pad * nSlices : 0;

                // Trailing edge angle of each drawn slice, by LOCAL slice position —
                // the interior boundaries a handle sits on, within this donut.
                /** @type {Record<number, number>} */
                const edgeAngle = {};
                let cursor = spanStart + pad / 2;

                members.forEach((/** @type {number} */ gi, /** @type {number} */ local) => {
                    const d = currentData[gi];
                    const share = total > 0 ? mags[local] / total : 0;
                    const sweep = usable * share;
                    const a0 = cursor;
                    const a1 = cursor + sweep;
                    cursor = a1 + pad;
                    edgeAngle[local] = a1;

                    if (sweep <= 0) return;

                    const style = resolveStyle(scales, channels, d,
                        markDefaults(scales, 'arc', { fill: '#4f46e5', stroke: '#fff', strokeWidth: 1 }), gi, currentData);
                    const pathD = arcPath(cx, cy, outer, a0, a1, { innerRadius: innerR });
                    if (!pathD) return;

                    nodes.push({
                        type: 'path',
                        d: pathD,
                        ...style,
                        cx, cy,
                        index: gi,
                        // Slice boundary angles: `midAngle` for labels, a0/a1 for edge
                        // editing. NOT `angle` — across this library `FeatureNode.angle`
                        // means a ROTATION the renderer applies about the node's centre
                        // (see types.d.ts and the `angle` channel). Stamping a slice's
                        // mid-angle there was harmless only under the SVG renderer,
                        // which skips the rotate for paths; the canvas renderer applies
                        // it to every node type (renderers/canvas/draw.js's withAngle),
                        // so every slice was being spun about its own centre.
                        midAngle: (a0 + a1) / 2,
                        a0, a1,
                    });
                });

                // Boundary handles — one per movable interior boundary between two
                // adjacent slices of THIS donut. Direct-pick draggable; the arc edge
                // edit reads the stamped `members` (this slot's global indices, in
                // slice order) and pair-shifts within them, so a drag redistributes
                // one donut's shares and never touches another slot. The full-circle
                // seam is the fixed layout anchor at spanStart, so it is intentionally
                // not a handle: with a fixed orientation and total, n slices have
                // exactly n−1 independently movable boundaries.
                if (editable && handleStyle.grabbable && total > 0 && nSlices > 1) {
                    for (let local = 0; local < nSlices - 1; local++) {
                        const angle = edgeAngle[local] + pad / 2;
                        const p = polarToXY(cx, cy, outer, angle);
                        nodes.push({
                            type: 'circle',
                            cx: p.x, cy: p.y,
                            // Placement: on the OUTER rim, at the boundary angle plus
                            // half the pad — i.e. exactly on the gap between the two
                            // slices it redistributes.
                            r: handleStyle.size,
                            fill: handleStyle.visible ? handleStyle.fill : 'transparent',
                            stroke: handleStyle.visible ? handleStyle.stroke : 'none',
                            strokeWidth: handleStyle.visible ? handleStyle.strokeWidth : 0,
                            cursor: 'grab',
                            index: members[local],
                            // Edge-edit payload (read by edit.arc.edge's apply / when).
                            edge: true,
                            loIndex: members[local],
                            hiIndex: members[local + 1],
                            members,
                            pivotX: cx, pivotY: cy,
                            spanStart, spanEnd, pad,
                        });
                    }
                }
            });

            return nodes;
        },
    };
}

/**
 * Donut convenience: arc with a default inner radius. When no outerRadius is
 * pinned (so the radius is chosen per slot — a fit default or a `size` field),
 * the inner radius is a RATIO of the outer, keeping every ring proportional.
 * @param {any} [options]
 * @returns {import('../types').Mark}
 */
export function donut(/** @type {any} */ options = {}) {
    const inner = options.innerRadius != null
        ? options.innerRadius
        : (options.outerRadius != null ? options.outerRadius * 0.55 : 0.55);
    return arc({ ...options, arc: options.arc || 'full', innerRadius: inner });
}

/**
 * Pie convenience: arc with innerRadius 0.
 * @param {any} [options]
 * @returns {import('../types').Mark}
 */
export function pie(/** @type {any} */ options = {}) {
    return arc({ ...options, arc: options.arc || 'full', innerRadius: 0 });
}
