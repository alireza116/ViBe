export function dragY(options = {}) {
    const { onChange, constraints = [], showGuides = false } = options;

    return {
        // Interactor name/type
        type: 'dragY',
        target: 'mark',
        onChange,
        constraints,
        // When truthy, the core auto-adds a constraints guide for this feature.
        // May be `true` or an options object, e.g. { color: "#2a9d5c" }.
        showGuides,

        // Event handlers
        drag: (context) => {
            const { y, data, scales, nodeData, xKey = 'x', yKey = 'y' } = context;

            if (!scales.y) return undefined; // no y channel to drag

            // Map screen coordinate back to data space via the unified scale API
            // (nearest category for band, clamped invert for linear) — so a drag
            // works on any y-scale, not just linear.
            const newY = scales.y.invertValue(y);

            // Produce the proposed dataset: update only the dragged datum,
            // matched by its x-accessor value.
            const updatedData = data.map(d =>
                d[xKey] === nodeData[xKey] ? { ...d, [yKey]: newY } : d
            );

            return updatedData;
        }
    };
}

// dragXY: 2D "change" interaction for scatter marks. Moves the dragged datum in
// both x and y. Requires continuous (linear) x and y scales.
export function dragXY(options = {}) {
    const { onChange, constraints = [], showGuides = false } = options;

    return {
        type: 'dragXY',
        target: 'mark',
        onChange,
        constraints,
        showGuides,

        drag: (context) => {
            const { x, y, data, scales, nodeIndex, xKey = 'x', yKey = 'y' } = context;

            if (nodeIndex === undefined) return undefined;

            // Unified scale API: works for linear, band, or mixed x/y. A missing
            // channel scale (1D) simply isn't updated.
            const patch = {};
            if (scales.x) patch[xKey] = scales.x.invertValue(x);
            if (scales.y) patch[yKey] = scales.y.invertValue(y);

            // Match the dragged datum by index (data values aren't unique in 2D).
            return data.map((d, i) =>
                i === nodeIndex ? { ...d, ...patch } : d
            );
        }
    };
}
