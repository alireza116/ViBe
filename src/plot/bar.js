// @ts-check
import { isBand, bandwidthOf, baselineOf } from '../core/scales.js';
import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

// bar: a rectangular mark that composes across orientations. The band axis is
// the categorical/position axis (sets the bar's position + thickness) and the
// linear axis is the value/length axis (sets the bar's length from a baseline).
//
//   x: band,   y: linear  -> vertical bars   (barY)
//   x: linear, y: band     -> horizontal bars (barX)
//
// `bar` auto-detects orientation from the scale types (or takes an explicit
// `orientation`); `barY` / `barX` force one. In all cases the mark reads the
// x-channel via the `x` accessor and the y-channel via `y`, so which channel is
// the "value" and which is the "category" follows the scales — matching the spec.
//
// The value axis also accepts an explicit SPAN instead of a single value: two
// endpoint channels (x1/x2 for barX, y1/y2 for barY) place the bar between them
// rather than from the baseline — e.g. a Gantt-style "years active" span per
// category. x1/x2 share the same resolved scale as x (and y1/y2 as y — see
// core/resolve.js's axis aliasing), so they're read through encodeChannel exactly
// like the single-value form.
//
// Optional `stack: true | <seriesField>` stacks bars that share a category: each
// segment sits on the cumulative sum of prior series in that band. Declare a
// schema domain that covers the stacked total. Span mode and stack are mutually
// exclusive (span wins).

/**
 * Cumulative data-space baselines for stacked bars, keyed by datum index.
 * @param {any[]} data
 * @param {string} catKey
 * @param {string} valueKey
 * @param {string | null} seriesField
 * @returns {Map<number, { y0: number, y1: number }>}
 */
function stackOffsets(data, catKey, valueKey, seriesField) {
    /** @type {Map<any, number>} */
    const running = new Map();
    /** @type {Map<number, { y0: number, y1: number }>} */
    const out = new Map();
    // Stable series order: first-seen series key.
    /** @type {any[]} */
    const seriesOrder = [];
    if (seriesField) {
        for (const d of data) {
            const s = d[seriesField];
            if (!seriesOrder.includes(s)) seriesOrder.push(s);
        }
    }
    const ordered = seriesField
        ? [...data].map((d, i) => ({ d, i })).sort((a, b) =>
            seriesOrder.indexOf(a.d[seriesField]) - seriesOrder.indexOf(b.d[seriesField]))
        : data.map((d, i) => ({ d, i }));

    for (const { d, i } of ordered) {
        const cat = d[catKey];
        const y0 = running.get(cat) || 0;
        const y1 = y0 + (Number(d[valueKey]) || 0);
        running.set(cat, y1);
        out.set(i, { y0, y1 });
    }
    return out;
}

/**
 * @param {any} options
 * @param {string | null} forcedOrientation
 * @returns {any}
 */
function buildBar(options, forcedOrientation) {
    // Desugar top-level style shorthands (e.g. the legacy `fill: 'steelblue'`)
    // into the channels as constant channels, so bar reads style the same way
    // every mark does. Explicit `channels.fill` still wins.
    const opts = normalizeMarkOptions(options);
    const {
        channels = {},
        id,
        edits,
        constraints,
        orientation: orientationOption,
        stack
    } = opts;

    // Channel-native: read the x/y field from the channels, falling back to the
    // legacy x/y accessor options. Either way the scale for each channel is the
    // global one the engine resolves and passes in as scales.x / scales.y.
    const xKey = (channels.x && channels.x.field) || 'x';
    const yKey = (channels.y && channels.y.field) || 'y';
    // Span mode: both endpoint channels declared on that axis. Decided once per
    // mark (not per datum) — the missing form (baseline+value) stays the default.
    const hasXSpan = !!(channels.x1 && channels.x2);
    const hasYSpan = !!(channels.y1 && channels.y2);
    const seriesField = stack === true
        ? (opts.series || (channels.fill && channels.fill.field) || null)
        : (typeof stack === 'string' ? stack : null);
    const doStack = !!stack && !hasXSpan && !hasYSpan;

    return {
        id,
        channels,
        edits,
        constraints,
        // A bar's categorical axis wants the band interval (its thickness).
        discreteScale: 'band',
        xKey,
        yKey,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales) => {
            const { x: xScale, y: yScale } = scales;

            let orientation = forcedOrientation || orientationOption;
            if (!orientation) {
                if (isBand(xScale)) orientation = 'vertical';
                else if (isBand(yScale)) orientation = 'horizontal';
                else orientation = 'vertical';
            }

            const stacks = doStack
                ? stackOffsets(
                    currentData,
                    orientation === 'horizontal' ? yKey : xKey,
                    orientation === 'horizontal' ? xKey : yKey,
                    seriesField
                )
                : null;

            return currentData.map((d, i) => {
                // Standard style surface (fill/stroke/opacity/…), resolved per
                // datum through the same channels every mark uses. Defaults to the
                // classic steelblue fill when no fill channel/shorthand is set.
                const style = resolveStyle(scales, channels, d, { fill: 'steelblue' });

                if (orientation === 'horizontal') {
                    // Category on y (band geometry), value/length on x. The value
                    // axis resolves through encodeChannel like every other mark; the
                    // band axis keeps its interval geometry (start + thickness).
                    const bandStart = yScale ? yScale(d[yKey]) : 0;
                    const thickness = bandwidthOf(yScale, 20);
                    const baseline = baselineOf(xScale);
                    let lo, hi;
                    if (hasXSpan) {
                        const v1 = encodeChannel(scales, channels, 'x1', d, baseline);
                        const v2 = encodeChannel(scales, channels, 'x2', d, baseline);
                        lo = Math.min(v1, v2);
                        hi = Math.max(v1, v2);
                    } else if (stacks) {
                        const { y0, y1 } = stacks.get(i) || { y0: 0, y1: d[xKey] };
                        const p0 = xScale ? xScale.encode(y0, baseline) : baseline;
                        const p1 = xScale ? xScale.encode(y1, baseline) : baseline;
                        lo = Math.min(p0, p1);
                        hi = Math.max(p0, p1);
                    } else {
                        const valuePos = encodeChannel(scales, channels, 'x', d, baseline);
                        lo = Math.min(valuePos, baseline);
                        hi = Math.max(valuePos, baseline);
                    }
                    return {
                        type: 'rect',
                        x: lo,
                        y: bandStart,
                        width: hi - lo,
                        height: thickness,
                        ...style,
                        data: d,
                        index: i,
                        orientation,
                        bandAxis: 'y' // proximity measures distance along y (rows)
                    };
                }

                // Vertical: category on x (band geometry), value/length on y. Value
                // via encodeChannel (as every mark); band axis keeps its interval.
                const bandStart = xScale ? xScale(d[xKey]) : 0;
                const thickness = bandwidthOf(xScale, 20);
                const baseline = baselineOf(yScale);
                let lo, hi;
                if (hasYSpan) {
                    const v1 = encodeChannel(scales, channels, 'y1', d, baseline);
                    const v2 = encodeChannel(scales, channels, 'y2', d, baseline);
                    lo = Math.min(v1, v2);
                    hi = Math.max(v1, v2);
                } else if (stacks) {
                    const { y0, y1 } = stacks.get(i) || { y0: 0, y1: d[yKey] };
                    const p0 = yScale ? yScale.encode(y0, baseline) : baseline;
                    const p1 = yScale ? yScale.encode(y1, baseline) : baseline;
                    lo = Math.min(p0, p1);
                    hi = Math.max(p0, p1);
                } else {
                    const valuePos = encodeChannel(scales, channels, 'y', d, baseline);
                    lo = Math.min(valuePos, baseline);
                    hi = Math.max(valuePos, baseline);
                }
                return {
                    type: 'rect',
                    x: bandStart,
                    y: lo,
                    width: thickness,
                    height: hi - lo,
                    ...style,
                    data: d,
                    index: i,
                    orientation,
                    bandAxis: 'x' // proximity measures distance along x (columns)
                };
            });
        }
    };
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function bar(options = {}) {
    return buildBar(options, null);
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function barY(options = {}) {
    return buildBar(options, 'vertical');
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function barX(options = {}) {
    return buildBar(options, 'horizontal');
}
