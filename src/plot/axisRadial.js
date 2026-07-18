// @ts-check
// axisRadial.js — a circular / semicircular axis as a composable mark. Sibling of
// axisX/axisY: reads the global `angle` scale and draws an arc spine, ticks,
// labels, and optional colored categorical bands (the NYT gauge chrome).
//
//   axisRadial({
//     orient: 'top',          // default: left → right through the top (NYT)
//     radius: 110, bands: true, ticks: 5,
//     channels: { angle: { field: 'chance' }, fill: { field: 'chance' } },
//   })
//
// Inert by default (background layer, pointer-events none). Domain editing is
// out of scope — Cartesian edit.axis.* stays on linear axes.

import { positionOnScale, isDiscrete } from '../core/scales.js';
import { DEFAULT_PALETTE } from '../core/encoding.js';
import { encodeChannel, normalizeMarkOptions, AXIS_CHROME, themeOf } from './mark.js';
import { tickData } from './axis.js';
import {
    arcSpan,
    arcSpine,
    arcPath,
    angularBand,
    polarToXY,
} from './polar.js';

/**
 * Horizontal text anchor for a label sitting at pixel `x` relative to the ring
 * centre `cx`: labels on the right grow rightward (`start`), on the left grow
 * leftward (`end`), near the vertical stay centred. Keeps long category names
 * (e.g. "VERY LIKELY D") from overflowing a centred anchor at the arc ends.
 * @param {number} x @param {number} cx @param {number} [eps]
 * @returns {'start' | 'middle' | 'end'}
 */
function anchorFor(x, cx, eps = 1) {
    if (x > cx + eps) return 'start';
    if (x < cx - eps) return 'end';
    return 'middle';
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function axisRadial(options = {}) {
    // An axis's stroke/fontSize are chrome, not per-datum style, so they stay
    // top-level options (AXIS_CHROME) while x/y/angle desugar as usual.
    const opts = normalizeMarkOptions(options, { except: AXIS_CHROME });
    const {
        channels = {},
        id,
        edits,
        constraints,
        channel = 'angle',
        radius: radiusOpt,
        innerRadius = 0,
        bandWidth = 18,
        ticks = 5,
        tickValues,
        tickFormat,
        tickSize = 6,
        labelOffset = 14,
        bands = false,
        title,
        arc: arcOpt,
        orient,
        start,
        end,
        // Chrome colours/size default to the theme's axis tokens at build time.
        labelFill: labelFillOpt,
        stroke: strokeOpt,
        strokeWidth = 1.25,
        fontSize: fontSizeOpt,
    } = opts;

    const [spanStart, spanEnd] = arcSpan({ arc: arcOpt, orient, start, end });
    const xField = channels.x && channels.x.field;
    const yField = channels.y && channels.y.field;

    return {
        id,
        channels,
        edits,
        constraints,
        discreteScale: 'point',
        isAxis: true,
        /**
         * @param {any[]} currentData
         * @param {any} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            const scale = scales[channel];
            if (!scale) return [];

            // Resolve chrome from the theme (option overrides > theme.axis tokens).
            const thm = themeOf(scales);
            const labelFill = labelFillOpt ?? thm.axis.labelFill;
            const stroke = strokeOpt ?? thm.axis.stroke;
            const fontSize = fontSizeOpt ?? thm.axis.fontSize;

            // Prefer the scale's own range as the arc span when the author set one;
            // otherwise fall back to the mark's arc/start/end options.
            const range = typeof scale.range === 'function' ? scale.range() : null;
            let a0 = spanStart;
            let a1 = spanEnd;
            if (range && range.length >= 2 && typeof range[0] === 'number') {
                a0 = range[0];
                a1 = range[range.length - 1];
            }

            const bg = { background: true, pointerEvents: 'none' };
            const { values, format } = tickData(scale, { ticks, tickValues, tickFormat });
            const fillField = channels.fill && channels.fill.field;

            /**
             * Emit one radial axis (bands + spine + ticks + labels + title) about a
             * centre. Reused for the single centred axis and for the per-datum rings
             * that surround small-multiple needles.
             * @param {number} cx @param {number} cy @param {number} r
             * @returns {import('../types').FeatureNode[]}
             */
            const drawAxis = (cx, cy, r) => {
                /** @type {import('../types').FeatureNode[]} */
                const out = [];

                // Colored categorical / ordinal sectors.
                if (bands && isDiscrete(scale)) {
                    const domain = scale.domain();
                    domain.forEach((/** @type {any} */ v, /** @type {number} */ i) => {
                        const band = angularBand(scale, v);
                        if (!band) return;
                        const [lo, hi] = band;
                        const row = fillField ? { [fillField]: v } : {};
                        let fill = encodeChannel(scales, channels, 'fill', row, null);
                        // No fill channel declared -> a stable categorical palette (the
                        // same default an ordinal fill scale would produce).
                        if (fill == null) fill = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
                        const inner = innerRadius > 0 ? innerRadius : Math.max(0, r - bandWidth);
                        const d = arcPath(cx, cy, r, lo, hi, { innerRadius: inner });
                        if (!d) return;
                        out.push({ type: 'path', d, fill, stroke: 'none', fillOpacity: 0.9, ...bg });
                    });
                }

                // Arc spine.
                const spine = arcSpine(cx, cy, r, a0, a1);
                if (spine) {
                    out.push({ type: 'path', d: spine, fill: 'none', stroke, strokeWidth, ...bg });
                }

                // Ticks + labels.
                values.forEach((/** @type {any} */ v) => {
                    const deg = positionOnScale(scale, v);
                    if (deg == null || Number.isNaN(deg)) return;
                    const outer = polarToXY(cx, cy, r, deg);
                    const inner = polarToXY(cx, cy, r - tickSize, deg);
                    if (tickSize > 0) {
                        out.push({
                            type: 'line',
                            x1: outer.x, y1: outer.y,
                            x2: inner.x, y2: inner.y,
                            stroke, strokeWidth: 1, ...bg,
                        });
                    }
                    const label = polarToXY(cx, cy, r + labelOffset, deg);
                    out.push({
                        type: 'text',
                        x: label.x,
                        y: label.y,
                        text: format(v),
                        textAnchor: anchorFor(label.x, cx),
                        dominantBaseline: 'middle',
                        fontSize,
                        fill: labelFill,
                        ...bg,
                    });
                });

                if (title) {
                    out.push({
                        type: 'text',
                        x: cx,
                        y: cy + r + labelOffset + fontSize + 8,
                        text: title,
                        textAnchor: 'middle',
                        fontSize: fontSize + 1,
                        fill: '#0f172a',
                        ...bg,
                    });
                }

                return out;
            };

            // Per-datum rings: when an x/y channel places pivots (small-multiple
            // needles), ring each one. Otherwise a single axis at the plot centre.
            if (xField || yField) {
                /** @type {import('../types').FeatureNode[]} */
                const nodes = [];
                const r = radiusOpt != null ? radiusOpt : Math.min(width, height) * 0.42;
                currentData.forEach((/** @type {any} */ d) => {
                    const cx = encodeChannel(scales, channels, 'x', d, width / 2);
                    const cy = encodeChannel(scales, channels, 'y', d, height / 2);
                    nodes.push(...drawAxis(cx, cy, r));
                });
                return nodes;
            }

            const cx = encodeChannel(scales, channels, 'x', currentData[0], width / 2);
            const cy = encodeChannel(scales, channels, 'y', currentData[0], height / 2);
            const r = radiusOpt != null ? radiusOpt : Math.min(width, height) * 0.42;
            return drawAxis(cx, cy, r);
        },
    };
}
