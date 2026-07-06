// @ts-check
import { isBand, bandwidthOf, baselineOf } from '../core/scales.js';
import { resolveStyle, normalizeMarkOptions } from './mark.js';

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

/**
 * @param {any} options
 * @param {string | null} forcedOrientation
 * @returns {any}
 */
function buildBar(options, forcedOrientation) {
    // Desugar top-level style shorthands (e.g. the legacy `fill: 'steelblue'`)
    // into the encoding as constant channels, so bar reads style the same way
    // every mark does. Explicit `encoding.fill` still wins.
    const opts = normalizeMarkOptions(options);
    const {
        data = [],
        encoding = {},
        id,
        interactors,
        edits,
        constraints,
        onChange,
        orientation: orientationOption
    } = opts;

    // Channel-native: read the x/y field from the encoding, falling back to the
    // legacy x/y accessor options. Either way the scale for each channel is the
    // global one the engine resolves and passes in as scales.x / scales.y.
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
        // A bar's categorical axis wants the band interval (its thickness).
        categoricalScale: 'band',
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

            return currentData.map((d, i) => {
                // Standard style surface (fill/stroke/opacity/…), resolved per
                // datum through the same channels every mark uses. Defaults to the
                // classic steelblue fill when no fill channel/shorthand is set.
                const style = resolveStyle(scales, encoding, d, { fill: 'steelblue' });

                if (orientation === 'horizontal') {
                    // Category on y (band), value/length on x (linear).
                    const bandStart = yScale ? yScale(d[yKey]) : 0;
                    const thickness = bandwidthOf(yScale, 20);
                    const baseline = baselineOf(xScale);
                    const valuePos = xScale ? xScale(d[xKey]) : 0;
                    return {
                        type: 'rect',
                        x: Math.min(valuePos, baseline),
                        y: bandStart,
                        width: Math.abs(valuePos - baseline),
                        height: thickness,
                        ...style,
                        data: d,
                        index: i,
                        orientation,
                        bandAxis: 'y' // proximity measures distance along y (rows)
                    };
                }

                // Vertical: category on x (band), value/length on y (linear).
                const bandStart = xScale ? xScale(d[xKey]) : 0;
                const thickness = bandwidthOf(xScale, 20);
                const baseline = baselineOf(yScale);
                const valuePos = yScale ? yScale(d[yKey]) : 0;
                return {
                    type: 'rect',
                    x: bandStart,
                    y: Math.min(valuePos, baseline),
                    width: thickness,
                    height: Math.abs(baseline - valuePos),
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
