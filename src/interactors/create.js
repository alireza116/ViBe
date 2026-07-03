// create: a "create" interaction bound to the plot plane (background) rather
// than to an existing mark. Clicking empty space appends a new datum at the
// clicked location.
//
// Works on any scale a mark can be positioned on — the clicked pixel is mapped
// back through each channel's scale via invertOnScale (the inverse of how marks
// are placed). So it supports linear x/y (scatter), band x/y (categorical
// scatter, snapping to the nearest category), and 1D plots (the missing channel
// is simply omitted from the new datum).
//
// The `trigger` option selects the plane gesture that creates a point:
// 'click' (default) or 'dblclick' (useful to differentiate create from a
// click/drag "move" interaction on the same plane).
//
//   vibe.interactors.create({ trigger: "dblclick", defaults: { group: "a" } })
import { invertOnScale } from '../core/scales.js';

export function create(options = {}) {
    const { onChange, constraints = [], showGuides = false, defaults = {}, trigger = 'click' } = options;

    const handler = (context) => {
        const { x, y, data, scales, xKey = 'x', yKey = 'y' } = context;

        // Map the clicked pixel back to data space per channel. A channel with
        // no scale (1D plots) resolves to undefined and is left off the datum.
        const xValue = invertOnScale(scales.x, x);
        const yValue = invertOnScale(scales.y, y);

        // Need at least one positionable channel to place a point.
        if (xValue === undefined && yValue === undefined) {
            console.warn('create interactor requires at least one positionable (linear or band) scale.');
            return undefined;
        }

        const point = { ...defaults };
        if (xValue !== undefined) point[xKey] = xValue;
        if (yValue !== undefined) point[yKey] = yValue;

        // Tell constraints the new point is the active datum, so they bound it
        // just like a dragged one.
        context.nodeIndex = data.length;
        context.nodeData = point;

        return [...data, point];
    };

    const interactor = {
        type: 'create',
        target: 'plane', // listens on the background, not on marks
        onChange,
        constraints,
        showGuides
    };
    // Bind the create handler to the chosen plane gesture ('click' | 'dblclick').
    interactor[trigger] = handler;
    return interactor;
}
