import { positionOnScale } from '../core/scales.js';

// dot: a circle mark that composes across scale types and dimensionality.
// Each channel is mapped through its scale via `positionOnScale`, so it works
// for:
//   - linear x + linear y      -> scatter plot
//   - band x   + linear y      -> categorical scatter (dot centered in its band)
//   - linear x (no y)          -> 1D strip plot (place a dot on the scale)
// A missing scale (1D) parks the dot at the center of that dimension.
export function dot(options = {}) {
    const {
        data = [],
        x = 'x',
        y = 'y',
        r = 5,
        fill = 'steelblue',
        id,
        interactors
    } = options;

    return {
        id,
        data,
        interactors,
        xKey: x,
        yKey: y,
        build: (currentData, scales, width, height) => {
            const { x: xScale, y: yScale } = scales;

            return currentData.map((d, i) => ({
                type: 'circle',
                cx: positionOnScale(xScale, d[x], width / 2),
                cy: positionOnScale(yScale, d[y], height / 2),
                r,
                fill,
                data: d,
                index: i
            }));
        }
    };
}
