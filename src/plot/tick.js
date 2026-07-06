// @ts-check
import { isBand, bandSpan } from '../core/scales.js';
import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

// tick: a thin line-segment mark (Observable Plot's tick). It marks a VALUE on
// one axis (the linear/continuous axis) and SPANS the other axis — a category
// band when the span axis is ordinal, or the full extent otherwise (a rug /
// strip plot). It is bar's zero-thickness sibling: same categorical/value
// decomposition, but the mark draws a line at the value instead of a rect from
// a baseline.
//
//   x: band,   y: linear  -> horizontal ticks (tickY): value on y, span the x band
//   x: linear, y: band     -> vertical ticks   (tickX): value on x, span the y band
//
// `tick` auto-detects which axis is the value axis from the scale types;
// `tickY` / `tickX` force one (matching Plot). Editing, proximity pick, create,
// remove, constraints and the style surface all come from the shared model —
// a tick with `encoding.y.edit = drag()` is draggable with no mark-specific code.
//
// The span across the band is customizable with `inset` (px shrink each end) or
// an explicit `length` (px, centred) — see bandSpan in core/scales.js, a
// mark-agnostic helper other marks can reuse.

/**
 * @param {any} options
 * @param {'x' | 'y' | null} forcedValueAxis which axis carries the value
 * @returns {any}
 */
function buildTick(options, forcedValueAxis) {
    // Desugar top-level style shorthands (stroke: '…', strokeWidth: …) into the
    // encoding so tick reads style the same way every mark does.
    const opts = normalizeMarkOptions(options);
    const {
        data = [],
        encoding = {},
        id,
        interactors,
        edits,
        constraints,
        onChange,
        inset = 0,
        length
    } = opts;

    const xKey = (encoding.x && encoding.x.field) || options.x || 'x';
    const yKey = (encoding.y && encoding.y.field) || options.y || 'y';

    return {
        id,
        data,
        interactors,
        encoding,
        edits,
        constraints,
        onChange,
        // A tick sits within a band (like a bar) — it wants the band interval to
        // span, so it asks for the band variant of the categorical scale.
        categoricalScale: 'band',
        xKey,
        yKey,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            const { x: xScale, y: yScale } = scales;

            // Which axis carries the value (the line's position)? Explicit wins;
            // otherwise the band axis is the span, so the OTHER axis is the value.
            let valueAxis = forcedValueAxis;
            if (!valueAxis) {
                if (isBand(xScale)) valueAxis = 'y';
                else if (isBand(yScale)) valueAxis = 'x';
                else valueAxis = 'y';
            }

            return currentData.map((d, i) => {
                // Standard style surface; a tick reads as a stroked line, so its
                // per-mark defaults are stroke/strokeWidth rather than a fill.
                const style = resolveStyle(scales, encoding, d, {
                    stroke: 'steelblue',
                    strokeWidth: 2
                });

                if (valueAxis === 'x') {
                    // Vertical tick: value on x (linear), span the y band.
                    const valuePos = encodeChannel(scales, encoding, 'x', d, width / 2);
                    const [y1, y2] = bandSpan(yScale, d[yKey], height, { inset, length });
                    return {
                        type: 'line',
                        x1: valuePos,
                        x2: valuePos,
                        y1,
                        y2,
                        ...style,
                        data: d,
                        index: i,
                        bandAxis: 'y', // proximity measures distance along y (rows)
                        cursor: 'ew-resize'
                    };
                }

                // Horizontal tick: value on y (linear), span the x band.
                const valuePos = encodeChannel(scales, encoding, 'y', d, height / 2);
                const [x1, x2] = bandSpan(xScale, d[xKey], width, { inset, length });
                return {
                    type: 'line',
                    x1,
                    x2,
                    y1: valuePos,
                    y2: valuePos,
                    ...style,
                    data: d,
                    index: i,
                    bandAxis: 'x', // proximity measures distance along x (columns)
                    cursor: 'ns-resize'
                };
            });
        }
    };
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function tick(options = {}) {
    return buildTick(options, null);
}

/**
 * Horizontal ticks: value on y, spanning the x band.
 * @param {any} [options]
 * @returns {any}
 */
export function tickY(options = {}) {
    return buildTick(options, 'y');
}

/**
 * Vertical ticks: value on x, spanning the y band.
 * @param {any} [options]
 * @returns {any}
 */
export function tickX(options = {}) {
    return buildTick(options, 'x');
}
