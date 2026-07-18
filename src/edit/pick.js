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
 *   line   -> true point-to-segment distance to the tick. Along the span you can
 *             still grab it from anywhere (distance 0 on the segment), but two
 *             ticks stacked in the SAME band are disambiguated by the pointer's
 *             distance to each one's value position — the band-interval shortcut
 *             (used for rects) can't, since it ties every tick in the column at 0.
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
    if (mark.type === 'line') {
        return segDist(px, py, mark.x1, mark.y1, mark.x2, mark.y2);
    }
    if (mark.type === 'path') {
        // Distance to the polyline: the min over its consecutive segments, so a
        // click anywhere ALONG a connected line (not just at a vertex) is "on" it.
        const pts = mark.points || [];
        let best = Infinity;
        for (let i = 1; i < pts.length; i++) {
            const d = segDist(px, py, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
            if (d < best) best = d;
        }
        return best;
    }
    return Infinity;
}

/**
 * Distance from a point to the segment (ax,ay)-(bx,by): project the point onto the
 * segment, clamp to its ends, measure to that closest point.
 * @param {number} px @param {number} py
 * @param {number} ax @param {number} ay @param {number} bx @param {number} by
 * @returns {number}
 */
function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * The nearest mark within `threshold` (or null). Returns the mark's DATUM index so
 * the edit can address the datum. An optional `series` scopes the search to one
 * line's handles (used by a series-locked 2D sweep).
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @param {number} threshold
 * @param {any} [series] restrict to marks with this `series` key
 * @returns {number | null}
 */
export function nearestMark(marks, px, py, threshold, series) {
    let best = null;
    let bestDist = Infinity;
    (marks || []).forEach((mark) => {
        if (mark.index == null) return; // datum-bearing marks only (skip a line's path)
        if (mark.locked) return;        // a read-only row is not a target (spec.lock)
        if (series !== undefined && mark.series !== series) return;
        const d = distanceToMark(mark, px, py);
        // Address the DATUM (mark.index), not the array slot — a feature may emit
        // extra nodes (a line's connecting path) that offset handle positions.
        if (d < bestDist) { bestDist = d; best = mark.index; }
    });
    return best != null && bestDist <= threshold ? best : null;
}

/**
 * The `series` key of the line closest to the pointer within `threshold` (or
 * null) — measured to the LINE ITSELF (its connecting path's segments), not just
 * its vertices, so a click anywhere along a sparse line still resolves to it. Falls
 * back to handle distance for a one-point series (which has no path yet). This is
 * how a gesture decides WHICH line it means: a sweep locks onto it, an `anchor`
 * attaches to it, and being far from every line (null) starts a new one.
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @param {number} threshold
 * @returns {any | null}
 */
export function nearestSeries(marks, px, py, threshold) {
    let bestSeries = null;
    let bestDist = Infinity;
    (marks || []).forEach((mark) => {
        if (mark.series === undefined) return;
        // A fully locked line is not there as far as a gesture is concerned, so a
        // drag beside it draws a new line instead of grabbing a frozen one.
        if (mark.locked) return;
        // Prefer the drawn line (path); fall back to a handle's centre.
        let d;
        if (mark.type === 'path') d = distanceToMark(mark, px, py);
        else if (mark.cx != null) d = Math.hypot(px - mark.cx, py - mark.cy);
        else return;
        if (d < bestDist) { bestDist = d; bestSeries = mark.series; }
    });
    return bestSeries != null && bestDist <= threshold ? bestSeries : null;
}

/**
 * The nearest mark measured ALONG ONE AXIS only (the you-draw-it sweep target):
 * distance is |px - cx| on 'x' or |py - cy| on 'y', so the pointer's position on
 * the other axis is ignored and a horizontal sweep always selects the point in
 * the column it is over. Only handle nodes with a centre (circles) are eligible.
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @param {number} threshold
 * @param {'x' | 'y'} axis
 * @param {any} [series] restrict to marks with this `series` key (series-locked sweep)
 * @returns {number | null}
 */
export function nearestMarkOnAxis(marks, px, py, threshold, axis, series) {
    let best = null;
    let bestDist = Infinity;
    (marks || []).forEach((mark, i) => {
        if (mark.locked) return;        // a read-only row is not a target (spec.lock)
        if (series !== undefined && mark.series !== series) return;
        const center = axis === 'x' ? mark.cx : mark.cy;
        if (center == null) return; // not a point handle
        const d = Math.abs((axis === 'x' ? px : py) - center);
        // Return the datum index, not the array slot (see nearestMark): a line's
        // connecting path precedes its handles, so positions are offset by one.
        if (d < bestDist) { bestDist = d; best = mark.index != null ? mark.index : i; }
    });
    return best != null && bestDist <= threshold ? best : null;
}

// How far outside a thin mark's outline still counts as "on" it, in px. A stroked
// line or path has no area, so a bare containment test would be unhittable; this is
// the grab tolerance the SVG hit-tester effectively grants via the stroke width.
const HIT_TOLERANCE = 4;

/**
 * The topmost mark the pointer is actually ON (containment), or null — the geometric
 * replacement for the browser's SVG hit-test, used by renderers with no DOM elements
 * to hit (the canvas renderer). Distinct from `nearestMark`: `direct` pick means "the
 * mark under the pointer", not "the closest mark within 40px", so this tests real
 * containment and walks the scene BACK-TO-FRONT (last drawn wins, matching paint /
 * z-order).
 *
 * It also honours what SVG enforced for free: a node is only a target if its feature
 * has a direct-pick edit (`editable`) and it isn't locked, a guide, background, or
 * explicitly `pointerEvents:'none'` — the pointer-transparency invariant, which the
 * DOM hit-tester applied via CSS and a geometric hit-test must apply itself.
 *
 * Reuses `distanceToMark` for the genuine distance cases (circle centre, line/path
 * segments); a rect is a real point-in-bounds test rather than `distanceToMark`'s
 * band-proximity shortcut, because "anywhere in the column" is what NEAREST wants,
 * not what a direct hit is.
 * @param {any[]} marks
 * @param {number} px
 * @param {number} py
 * @returns {any | null} the hit node object (not its index), or null
 */
export function hitTest(marks, px, py) {
    const list = marks || [];
    for (let i = list.length - 1; i >= 0; i--) {
        const mark = list[i];
        if (!mark || !mark.editable) continue;
        if (mark.locked || mark.guide || mark.background) continue;
        if (mark.pointerEvents === 'none') continue;
        if (containsPoint(mark, px, py)) return mark;
    }
    return null;
}

/**
 * @param {any} mark @param {number} px @param {number} py @returns {boolean}
 */
function containsPoint(mark, px, py) {
    if (mark.type === 'circle') {
        const r = mark.r != null ? mark.r : 5;
        return distanceToMark(mark, px, py) <= r + HIT_TOLERANCE;
    }
    if (mark.type === 'rect') {
        const w = mark.width || 0;
        const h = mark.height || 0;
        return px >= mark.x - HIT_TOLERANCE && px <= mark.x + w + HIT_TOLERANCE
            && py >= mark.y - HIT_TOLERANCE && py <= mark.y + h + HIT_TOLERANCE;
    }
    if (mark.type === 'line' || mark.type === 'path') {
        const half = (mark.strokeWidth || 1) / 2;
        return distanceToMark(mark, px, py) <= half + HIT_TOLERANCE;
    }
    if (mark.type === 'text') {
        // A text mark's box is unknown to geometry; treat a small radius about its
        // anchor as the hit area (enough to grab a label handle).
        return Math.hypot(px - mark.x, py - mark.y) <= (mark.fontSize || 10) + HIT_TOLERANCE;
    }
    return false;
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

// A brush's edge zone needs a usable px radius; 0 would mean "the exact pixel
// only", making the edge essentially ungrabbable.
export const DEFAULT_EDGE_INSET = 8;

/**
 * @param {import('../types').Edit} edit
 * @returns {number}
 */
export function edgeInsetOf(edit) {
    const inset = /** @type {any} */ (edit).edgeInset;
    return inset && inset > 0 ? inset : DEFAULT_EDGE_INSET;
}

