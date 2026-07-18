// @ts-check
// needle.js — a pivoted pointer (NYT-style gauge / software dial). Encodes a
// value on the `angle` channel (degrees via the channel's scale) and draws a
// tapered triangle + hub about a pivot. Pair with axisRadial for chrome and
// text for a center readout — compose via composite / features.
//
//   needle({
//     orient: 'top',         // default semi: left → right through the top
//     // orient: 'right' | 'bottom' | 'left', or arc: 'full', or start/end
//     length: 100,
//     channels: {
//       angle: { field: 'n', scale: { range: [180, 0] },
//                edit: rotate({ pivot: 'mark', fold: false, pick: 'direct' }) },
//       fill: { value: '#c00' },
//     },
//   })
//
// Pivot defaults to the plot centre; optional x/y channels place it on a
// categorical or linear axis (many small needles across a chart).
// discreteScale is 'point' so categorical fields land on ticks.

import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';
import { arcSpan, needleTriangle } from './polar.js';

/**
 * @param {any} [options]
 * @returns {any}
 */
export function needle(options = {}) {
    const opts = normalizeMarkOptions(options);
    const {
        channels = {},
        id,
        edits,
        constraints,
        length: lengthOpt,
        // The hub is this needle's handle (the pivot you grab), so it takes the
        // library-wide sub-element radius name — `handleSize`, as on line/area/
        // trend/arc/face — not a per-mark synonym.
        handleSize = 5,
        baseWidth = 10,
        arc: arcOpt,
        orient,
        start,
        end,
    } = opts;

    // Documented span — keep scale.range in sync (default orient:'top' → [180, 0]).
    void arcSpan({ arc: arcOpt, orient, start, end });
    const angleField = channels.angle && channels.angle.field;
    const xField = channels.x && channels.x.field;
    const yField = channels.y && channels.y.field;

    return {
        id,
        channels,
        edits,
        constraints,
        discreteScale: 'point',
        xKey: xField || angleField,
        yKey: yField || angleField,
        /**
         * @param {any[]} currentData
         * @param {any} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            currentData.forEach((/** @type {any} */ d, /** @type {number} */ i) => {
                const cx = encodeChannel(scales, channels, 'x', d, width / 2);
                const cy = encodeChannel(scales, channels, 'y', d, height / 2);
                const deg = encodeChannel(scales, channels, 'angle', d, 0);
                const len = lengthOpt != null
                    ? lengthOpt
                    : encodeChannel(scales, channels, 'size', d, Math.min(width, height) * 0.4);
                const style = resolveStyle(scales, channels, d, {
                    fill: '#1e293b',
                    stroke: '#1e293b',
                    strokeWidth: 1,
                }, i, currentData);
                const pts = needleTriangle(cx, cy, len, deg, baseWidth);
                const dPath = `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} Z`;

                nodes.push({
                    type: 'path',
                    d: dPath,
                    ...style,
                    cx, cy,
                    index: i,
                    cursor: 'grab',
                });

                nodes.push({
                    type: 'circle',
                    cx, cy,
                    r: handleSize,
                    ...style,
                    stroke: style.stroke || '#0f172a',
                    strokeWidth: 1,
                    index: i,
                    cursor: 'grab',
                });
            });

            return nodes;
        },
    };
}
