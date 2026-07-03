// @ts-check
// guides.rule — a declarative reference line, positioned in DATA space through
// the scales. It's the guide counterpart of a mark: you give it a value on a
// channel and it draws a line across the plot at that position, using the SAME
// scale.encode() a mark would. Non-interactive.
//
//   vibe.guides.rule({ y: 50, label: "target" })   // horizontal line at y = 50
//   vibe.guides.rule({ x: "Neutral" })              // vertical line at a category
//
// Because it positions through scale.encode, it works on any scale type (linear
// pixel, band centre) with no special-casing — a reference line on a Likert band
// axis is the same call as one on a continuous axis.

/**
 * @param {{ x?: any, y?: any, stroke?: string, strokeDasharray?: string, label?: string }} [options]
 * @returns {any}
 */
export function rule(options = {}) {
    const { x, y, stroke = '#64748b', strokeDasharray = '5 4', label } = options;

    return {
        isGuide: true,
        /**
         * @param {any} ctx
         * @returns {import('../types').FeatureNode[]}
         */
        build: (ctx) => {
            const { scales, width, height } = ctx;
            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            if (y !== undefined && scales.y) {
                const py = scales.y.encode(y);
                nodes.push({
                    type: 'line', x1: 0, x2: width, y1: py, y2: py,
                    stroke, strokeDasharray, strokeWidth: 1, opacity: 0.9,
                    pointerEvents: 'none', guide: true
                });
                if (label) nodes.push({
                    type: 'text', x: width - 4, y: py - 4, text: label,
                    fill: stroke, fontSize: 10, textAnchor: 'end',
                    pointerEvents: 'none', guide: true
                });
            }

            if (x !== undefined && scales.x) {
                const px = scales.x.encode(x);
                nodes.push({
                    type: 'line', x1: px, x2: px, y1: 0, y2: height,
                    stroke, strokeDasharray, strokeWidth: 1, opacity: 0.9,
                    pointerEvents: 'none', guide: true
                });
                if (label) nodes.push({
                    type: 'text', x: px + 4, y: 10, text: label,
                    fill: stroke, fontSize: 10, textAnchor: 'start',
                    pointerEvents: 'none', guide: true
                });
            }

            return nodes;
        }
    };
}
