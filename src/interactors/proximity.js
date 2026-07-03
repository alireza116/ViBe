// @ts-check
// proximityDrag: a "change" interaction that selects the nearest mark by
// proximity instead of requiring a precise hit on the mark itself. It lives on
// the plane (background), so it captures the pointer anywhere and resolves the
// closest mark within a pixel `threshold`. When the pointer is farther than the
// threshold from every mark, nothing is selected (no snap).
//
// This makes small bars grabbable anywhere in their column, and circles
// grabbable from nearby empty space. Pair it with `guides.proximity` (added
// automatically when `highlight` is true) to visualize the current selection.
//
//   vibe.interactors.proximityDrag({ threshold: 40, axis: "y" })   // bars
//   vibe.interactors.proximityDrag({ threshold: 40, axis: "xy" })  // scatter

/**
 * Distance from pointer to a mark, using a per-mark-type metric:
 *   circle -> euclidean distance to the center.
 *   rect   -> distance to the bar's band interval (the category slot), measured
 *             along the band axis so any point in the column/row selects the bar
 *             regardless of the bar's length. `bandAxis` ('x' for vertical bars,
 *             'y' for horizontal bars) is set by the bar mark.
 * @param {any} mark
 * @param {number} px
 * @param {number} py
 * @returns {number}
 */
function distanceToMark(mark, px, py) {
    if (mark.type === 'circle') {
        return Math.hypot(px - mark.cx, py - mark.cy);
    }
    if (mark.type === 'rect') {
        if (mark.bandAxis === 'y') {
            const top = mark.y;
            const bottom = mark.y + mark.height;
            if (py < top) return top - py;
            if (py > bottom) return py - bottom;
            return 0;
        }
        const left = mark.x;
        const right = mark.x + mark.width;
        if (px < left) return left - px;
        if (px > right) return px - right;
        return 0;
    }
    return Infinity;
}

/**
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @param {number} threshold
 * @returns {any}
 */
function nearestMark(marks, px, py, threshold) {
    let best = null;
    let bestDist = Infinity;
    (marks || []).forEach(mark => {
        const d = distanceToMark(mark, px, py);
        if (d < bestDist) {
            bestDist = d;
            best = mark;
        }
    });
    return best && bestDist <= threshold ? best : null;
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function proximityDrag(options = {}) {
    const {
        threshold = 40,
        axis = 'xy',
        onChange,
        constraints = [],
        highlight = true,
        showGuides = false
    } = options;

    // Transient selection state lives in the shared `ui` object, keyed by
    // feature id, so the highlight guide can read it.
    /**
     * @param {any} ui
     * @param {string} featureId
     * @param {any} patch
     */
    const writeInfo = (ui, featureId, patch) => {
        ui.proximity = ui.proximity || {};
        ui.proximity[featureId] = { ...(ui.proximity[featureId] || {}), ...patch };
    };
    
    /**
     * @param {any} ui
     * @param {string} featureId
     * @returns {any}
     */
    const readInfo = (ui, featureId) => (ui.proximity && ui.proximity[featureId]) || null;

    /**
     * @param {any} context
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @returns {any[]}
     */
    const moveDatum = (context, index, x, y) => {
        const { data, scales, xKey = 'x', yKey = 'y' } = context;
        const updated = { ...data[index] };
        // Unified scale API: band (nearest category) and linear (clamped invert)
        // both work, so proximity drag composes across scale types. A missing
        // channel scale (1D) is skipped.
        if (axis.includes('x') && scales.x) updated[xKey] = scales.x.invertValue(x);
        if (axis.includes('y') && scales.y) updated[yKey] = scales.y.invertValue(y);
        // Tell constraints which datum is active (plane events carry no node) and
        // which axis carries the value being constrained (x for a horizontal /
        // 1D-x drag, y otherwise).
        context.nodeIndex = index;
        context.nodeData = updated;
        context.valueKey = axis === 'x' ? xKey : yKey;
        context.valueScale = axis === 'x' ? scales.x : scales.y;
        return data.map((/** @type {any} */ d, /** @type {number} */ i) => (i === index ? updated : d));
    };

    return {
        type: 'proximityDrag',
        target: 'plane',
        onChange,
        constraints,
        // Signals the core to auto-add a proximity highlight guide for this feature.
        highlight,
        // Signals the core to auto-add a constraints guide for this feature.
        showGuides,
        threshold,
        axis,

        // Pointer moved (no button): update the hovered selection + ring.
        /**
         * @param {any} context
         * @returns {boolean}
         */
        hover: (context) => {
            const { marks, x, y, ui, featureId } = context;
            const hit = nearestMark(marks, x, y, threshold);
            writeInfo(ui, featureId, {
                px: x, py: y, threshold,
                hoverIndex: hit ? hit.index : null
            });
            return true; // redraw only (no data change)
        },

        // Pointer left the plane: clear the highlight.
        /**
         * @param {any} context
         * @returns {boolean}
         */
        hoverout: (context) => {
            const { ui, featureId } = context;
            if (ui.proximity) delete ui.proximity[featureId];
            return true;
        },

        // Drag started: lock onto the nearest mark within threshold (if any).
        /**
         * @param {any} context
         * @returns {boolean}
         */
        dragstart: (context) => {
            const { marks, x, y, ui, featureId } = context;
            const hit = nearestMark(marks, x, y, threshold);
            writeInfo(ui, featureId, {
                px: x, py: y, threshold,
                hoverIndex: hit ? hit.index : null,
                activeIndex: hit ? hit.index : null
            });
            return true; // redraw only; movement happens on subsequent drag events
        },

        // Dragging: move the locked mark's datum (axis-constrained).
        /**
         * @param {any} context
         * @returns {any[] | boolean}
         */
        drag: (context) => {
            const { x, y, ui, featureId } = context;
            const info = readInfo(ui, featureId);
            if (info) { info.px = x; info.py = y; } // ring follows pointer
            const index = info ? info.activeIndex : null;
            if (index == null) return true; // nothing locked; just redraw the ring
            return moveDatum(context, index, x, y);
        },

        // Drag ended: release the lock (keep hover highlight).
        /**
         * @param {any} context
         * @returns {boolean}
         */
        dragend: (context) => {
            const { ui, featureId } = context;
            const info = readInfo(ui, featureId);
            if (info) info.activeIndex = null;
            return true;
        }
    };
}
