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
                    const bandStart = yScale(d[yKey]);
                    const thickness = bandwidthOf(yScale, 20);
                    const baseline = baselineOf(xScale);
                    const valuePos = xScale(d[xKey]);
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
                const bandStart = xScale(d[xKey]);
                const thickness = bandwidthOf(xScale, 20);
                const baseline = baselineOf(yScale);
                const valuePos = yScale(d[yKey]);
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

export function bar(options = {}) {
    return buildBar(options, null);
}

export function barY(options = {}) {
    return buildBar(options, 'vertical');
}

export function barX(options = {}) {
    return buildBar(options, 'horizontal');
}
