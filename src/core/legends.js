// @ts-check
// legends.js — the layout-negotiation step for legends, kept out of the engine
// the same way core/axes.js keeps the axis desugar out of elicit.js.
//
// Legends are the first chrome in this codebase that RESERVES space: a legend on
// a side shrinks the plot so it never overlaps the marks. Nothing else does this —
// margins are otherwise a fixed author input, and axes merely draw into the slack
// the author already left. So this module measures every legend, sums the space
// each side needs, and hands back per-side band sizes the engine adds to the
// author margins (effective margins). It also stamps each legend's `_place` with
// where its band landed, so the mark's build() can position itself there without a
// widened signature (the same mutable-object transport `_place` documents).

/** @typedef {{ top: number, right: number, bottom: number, left: number }} Sides */

/**
 * Measure the legends in `features` against the resolved `scales` and return the
 * extra space each side needs. Each legend's `_place` is stamped with `offset`
 * (distance from the plot edge to the legend's near edge, past the author margin
 * and any earlier legend on that side) and `size` (its extent across the side).
 *
 * @param {any[]} features
 * @param {import('../types').ScaleMap} scales
 * @param {Sides} authorMargins the author's declared margins (outer padding / axis room)
 * @param {number} [gap] pixels between the plot edge (and stacked legends) and a legend
 * @returns {Sides} band size to add to each side
 */
export function reserveLegends(features, scales, authorMargins, gap = 8) {
    /** @type {Sides} */
    const bands = { top: 0, right: 0, bottom: 0, left: 0 };
    const legends = (features || []).filter((f) => f && f.isLegend && typeof f.measure === 'function');
    if (!legends.length) return bands;

    // Running near-edge offset per side: start past the author's margin (where an
    // axis lives) so a bottom legend clears the x-axis, a left legend the y-axis.
    /** @type {Sides} */
    const offset = {
        top: authorMargins.top + gap,
        right: authorMargins.right + gap,
        bottom: authorMargins.bottom + gap,
        left: authorMargins.left + gap,
    };

    for (const lg of legends) {
        const side = /** @type {keyof Sides} */ (lg.anchor || 'right');
        // May be absent at runtime (channel not bound to a field); the ScaleMap
        // index type says otherwise, so read it loosely.
        const scale = /** @type {any} */ (scales)[lg.channel];
        const box = scale ? lg.measure(scales) : null;
        if (!box) { lg._place.offset = 0; lg._place.size = 0; continue; }
        // A vertical legend reserves its WIDTH on the side; a horizontal one its HEIGHT.
        const across = lg.orient === 'vertical' ? box.width : box.height;
        lg._place.offset = offset[side];
        lg._place.size = across;
        offset[side] += across + gap;
        bands[side] += across + gap;
    }
    return bands;
}
