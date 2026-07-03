// @ts-check
import { isBand, bandwidthOf, baselineOf } from '../core/scales.js';

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
    const {
        data = [],
        encoding,
        fill = 'steelblue',
        id,
        interactors,
        edits,
        onChange,
        orientation: orientationOption
    } = options;

    // Channel-native: read the x/y field from the encoding, falling back to the
    // legacy x/y accessor options. Either way the scale for each channel is the
    // global one the engine resolves and passes in as scales.x / scales.y.
    const xKey = (encoding && encoding.x && encoding.x.field) || options.x || 'x';
    const yKey = (encoding && encoding.y && encoding.y.field) || options.y || 'y';

    return {
        id,
        data,
        interactors,
        encoding,
        edits,
        onChange,
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
                        fill,
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
                    fill,
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
