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
// The magnitude channel is `value`, NOT `angle`. Across this library `angle` means
// a rotation/angular POSITION (needle's direction, text's rotation, axisRadial's
// angular scale) — it is inverted back to data by rotate()/drag() as an angle. A
// slice's `share` is nothing of the sort: it's a quantity that the pie layout
// normalizes into a sweep. Naming it `angle` made one channel mean two unrelated
// things depending on the mark, so it's `value` here (see CLAUDE.md, "one
// documented name per behavior").
//
// Layout normalizes by the sum of magnitudes over the mark's rows (stacked bar in
// polar form). Slice boundaries are draggable via edit.arc.edge(); sibling controls
// work with maintainSum.

import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';
import { arcSpan, arcPath, polarToXY } from './polar.js';

/**
 * @param {any} [options]
 * @returns {any}
 */
export function arc(options = {}) {
    const opts = normalizeMarkOptions(options);
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
        handleSize = 5,
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
        channels,
        edits: markEdits,
        constraints,
        discreteScale: 'point',
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
            const cx = encodeChannel(scales, channels, 'x', currentData[0], width / 2);
            const cy = encodeChannel(scales, channels, 'y', currentData[0], height / 2);
            const outer = outerOpt != null
                ? outerOpt
                : Math.min(width, height) * 0.4;

            // Magnitude per row: prefer the raw field (so stacking is in data units),
            // not the encoded angle — pie layout owns the angular math.
            const mags = currentData.map((/** @type {any} */ d) => {
                if (valueField != null) {
                    const v = Number(d[valueField]);
                    return Number.isFinite(v) && v > 0 ? v : 0;
                }
                // Constant / scaled fallback.
                const enc = encodeChannel(scales, channels, 'value', d, 0);
                return Number.isFinite(enc) && enc > 0 ? Number(enc) : 0;
            });
            const total = mags.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
            const span = spanEnd - spanStart;
            const pad = padAngle;
            const usable = total > 0 ? span - pad * currentData.length : 0;

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            // Trailing edge angle of each drawn slice (a1), by row index — the
            // interior boundaries an edge handle sits on.
            /** @type {Record<number, number>} */
            const edgeAngle = {};
            let cursor = spanStart + pad / 2;

            currentData.forEach((/** @type {any} */ d, /** @type {number} */ i) => {
                const share = total > 0 ? mags[i] / total : 0;
                const sweep = usable * share;
                const a0 = cursor;
                const a1 = cursor + sweep;
                cursor = a1 + pad;
                edgeAngle[i] = a1;

                if (sweep <= 0) return;

                const style = resolveStyle(scales, channels, d, {
                    fill: '#4f46e5',
                    stroke: '#fff',
                    strokeWidth: 1,
                });
                const pathD = arcPath(cx, cy, outer, a0, a1, { innerRadius });
                if (!pathD) return;

                nodes.push({
                    type: 'path',
                    d: pathD,
                    ...style,
                    cx, cy,
                    index: i,
                    // Slice boundary angles: mid for labels, a0/a1 for edge editing.
                    angle: (a0 + a1) / 2,
                    a0, a1,
                });
            });

            // Boundary handles — one per movable interior boundary between adjacent
            // slices (loIndex, hiIndex). Direct-pick draggable; the arc edge edit
            // reads the stamped geometry and pair-shifts the two neighbouring rows.
            // The full-circle seam is also the fixed layout anchor at spanStart, so it
            // is intentionally not a handle: with a fixed orientation and total,
            // n slices have exactly n−1 independently movable boundaries.
            const n = currentData.length;
            if (editable && total > 0 && n > 1) {
                /** @type {{ lo: number, hi: number, angle: number }[]} */
                const boundaries = [];
                for (let i = 0; i < n - 1; i++) {
                    boundaries.push({ lo: i, hi: i + 1, angle: edgeAngle[i] + pad / 2 });
                }

                for (const b of boundaries) {
                    const p = polarToXY(cx, cy, outer, b.angle);
                    nodes.push({
                        type: 'circle',
                        cx: p.x, cy: p.y,
                        r: handleSize,
                        fill: handles ? '#0f172a' : 'transparent',
                        stroke: handles ? '#fff' : 'none',
                        strokeWidth: handles ? 1.5 : 0,
                        cursor: 'grab',
                        index: b.lo,
                        // Edge-edit payload (read by edit.arc.edge's apply / when).
                        edge: true,
                        loIndex: b.lo,
                        hiIndex: b.hi,
                        pivotX: cx, pivotY: cy,
                        spanStart, spanEnd, pad,
                    });
                }
            }

            return nodes;
        },
    };
}

/** Donut convenience: arc with a default inner radius. */
export function donut(/** @type {any} */ options = {}) {
    const inner = options.innerRadius != null
        ? options.innerRadius
        : (options.outerRadius != null ? options.outerRadius * 0.55 : undefined);
    return arc({ ...options, arc: options.arc || 'full', innerRadius: inner ?? 40 });
}

/** Pie convenience: arc with innerRadius 0. */
export function pie(/** @type {any} */ options = {}) {
    return arc({ ...options, arc: options.arc || 'full', innerRadius: 0 });
}
