export function ruleY(options = {}) {
    const {
        y = 0,
        stroke = 'black',
        strokeDasharray = '0',
        id
    } = options;

    return {
        id,
        build: (currentData, scales, width, height) => {
            const { y: yScale } = scales;
            const yPos = yScale(y);

            return [{
                type: 'line',
                x1: 0,
                x2: width,
                y1: yPos,
                y2: yPos,
                stroke: stroke,
                strokeDasharray: strokeDasharray,
                pointerEvents: 'none' // reference lines usually don't capture events
            }];
        }
    };
}
