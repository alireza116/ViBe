// guides.region — a declarative shaded band between two values on an axis (an
// "acceptable range", a target zone). Like guides.rule it positions in data
// space through scale.encode, so it composes across scale types.
//
//   vibe.guides.region({ y: [40, 60] })          // horizontal band, y in [40,60]
//   vibe.guides.region({ x: ["Agree", "Strongly agree"] })
export function region(options = {}) {
    const { x, y, fill = '#64748b', opacity = 0.1 } = options;

    return {
        isGuide: true,
        build: (ctx) => {
            const { scales, width, height } = ctx;
            const nodes = [];

            if (Array.isArray(y) && scales.y) {
                const a = scales.y.encode(y[0]);
                const b = scales.y.encode(y[1]);
                nodes.push({
                    type: 'rect', x: 0, y: Math.min(a, b), width, height: Math.abs(b - a),
                    fill, opacity, pointerEvents: 'none', guide: true
                });
            }

            if (Array.isArray(x) && scales.x) {
                const a = scales.x.encode(x[0]);
                const b = scales.x.encode(x[1]);
                nodes.push({
                    type: 'rect', x: Math.min(a, b), y: 0, width: Math.abs(b - a), height,
                    fill, opacity, pointerEvents: 'none', guide: true
                });
            }

            return nodes;
        }
    };
}
