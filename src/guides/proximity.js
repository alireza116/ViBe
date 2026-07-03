// guides.proximity: highlights the current proximity selection produced by a
// proximityDrag interactor. It reads the transient interaction state (ui) and
// draws:
//   - a dashed "threshold" ring around the pointer (the snap radius), and
//   - a bright highlight around the currently-snapped mark (a ring for circles,
//     an outline for bars). If nothing is within threshold, only the ring shows.
//
// Added automatically when a proximityDrag has `highlight: true`, or declared
// explicitly: vibe.guides.proximity({ target: "my-feature" }).

const DEFAULT_COLOR = '#ff9800';

export function proximity(options = {}) {
    const { target, color = DEFAULT_COLOR } = options;

    return {
        isGuide: true,
        build: (ctx) => {
            const info = ctx.ui && ctx.ui.proximity && ctx.ui.proximity[target];
            if (!info) return [];

            const nodes = [];

            // Threshold ring at the pointer (the snap zone).
            if (info.px != null && info.py != null && info.threshold != null) {
                nodes.push({
                    type: 'circle',
                    cx: info.px, cy: info.py, r: info.threshold,
                    fill: 'none', stroke: color, strokeDasharray: '2 4',
                    strokeWidth: 1, opacity: 0.45, guide: true
                });
            }

            // Highlight the snapped mark (active drag selection wins over hover).
            const index = info.activeIndex != null ? info.activeIndex : info.hoverIndex;
            if (index != null) {
                const marks = (ctx.featureNodes && ctx.featureNodes[target]) || [];
                const mark = marks[index];
                if (mark && mark.type === 'circle') {
                    nodes.push({
                        type: 'circle',
                        cx: mark.cx, cy: mark.cy, r: (mark.r || 5) + 5,
                        fill: 'none', stroke: color, strokeWidth: 2.5,
                        opacity: 0.95, guide: true
                    });
                } else if (mark && mark.type === 'rect') {
                    nodes.push({
                        type: 'rect',
                        x: mark.x - 2, y: mark.y - 2,
                        width: mark.width + 4, height: mark.height + 4,
                        fill: 'none', stroke: color, strokeWidth: 2.5,
                        opacity: 0.95, guide: true
                    });
                }
            }

            return nodes;
        }
    };
}
