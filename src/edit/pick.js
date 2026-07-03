// @ts-check
// pick.js — target selection for edits. `pick: 'direct'` uses the mark the
// gesture landed on (handled by the renderer's node events); `pick: 'nearest'`
// resolves the closest mark to the pointer within a pixel threshold, so small
// marks are grabbable from nearby empty space (bars from anywhere in their
// column, dots from adjacent space). This folds the old proximityDrag interactor
// into the edit model — proximity is just how an edit picks its target.

/**
 * Distance from pointer to a mark, per mark type:
 *   circle -> euclidean distance to the centre.
 *   rect   -> distance to the bar's band interval (its category slot), measured
 *             along the band axis, so any point in the column/row selects the bar
 *             regardless of its length. `bandAxis` is set by the bar mark.
 * @param {any} mark
 * @param {number} px
 * @param {number} py
 * @returns {number}
 */
export function distanceToMark(mark, px, py) {
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
 * The nearest mark within `threshold` (or null). Returns the mark's index so the
 * edit can address the datum.
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @param {number} threshold
 * @returns {number | null}
 */
export function nearestMark(marks, px, py, threshold) {
    let bestIndex = null;
    let bestDist = Infinity;
    (marks || []).forEach((mark, i) => {
        const d = distanceToMark(mark, px, py);
        if (d < bestDist) { bestDist = d; bestIndex = i; }
    });
    return bestIndex != null && bestDist <= threshold ? bestIndex : null;
}

// A nearest edit needs a usable snap radius; 0 (makeEdit's default) would mean
// "exact hit only", which defeats the purpose, so fall back to a sane default.
export const DEFAULT_PICK_THRESHOLD = 40;

/**
 * @param {import('../types').Edit} edit
 * @returns {number}
 */
export function pickThreshold(edit) {
    return edit.threshold && edit.threshold > 0 ? edit.threshold : DEFAULT_PICK_THRESHOLD;
}

