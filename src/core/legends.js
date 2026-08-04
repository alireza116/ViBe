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

import { legend } from '../plot/legend.js';

/** @typedef {{ top: number, right: number, bottom: number, left: number }} Sides */

/**
 * The channels a legend can describe: the non-positional ones a reader needs a key
 * for. x/y are excluded because an AXIS is the key for those.
 * @type {string[]}
 */
const LEGENDABLE = ['fill', 'stroke', 'size', 'symbol'];

/**
 * Resolve the global `legends` convenience into composable legend marks — the same
 * IMPLICIT layer `axes` has (core/axes.js), for the same reason: a chart shouldn't
 * have to hand-compose the key for a scale it already declared.
 *
 * `axes` had this and `legends` did not, so an axis was one word and a legend was a
 * mark you had to know the name of. The default stays OFF, though — unlike axes,
 * because a legend RESERVES layout space, and silently shrinking a plot because a
 * `fill` channel exists would be a surprise.
 *
 *   undefined / false -> no legends (the default)
 *   true              -> one per non-positional scale that is bound to a field
 *   { fill: {...}, size: false }
 *                     -> per-channel config; `false` suppresses that channel
 *
 * An explicit legend mark in `marks` always wins for its channel, exactly as an
 * explicit `axisX(...)` wins over the injected one.
 * Reads the MARKS' channel maps rather than the resolved scales, because legends
 * are composed at setup — before resolveScales runs — exactly like autoAxes. A
 * channel bound to a field on any mark is a channel that will get a scale.
 * @param {any[]} features the user's marks
 * @param {any} legendsOpt
 * @returns {any[]} the legend marks to append
 */
export function autoLegends(features, legendsOpt) {
    if (!legendsOpt) return [];
    const flat = /** @type {any[]} */ (features || []).flat(Infinity).filter(
        (f) => f && typeof f === 'object'
    );
    /** @param {string} ch */
    const hasExplicit = (ch) => flat.some((f) => f.isLegend && f.channel === ch);
    /** @param {string} ch */
    const isBound = (ch) => flat.some((f) => {
        const spec = f.channels && f.channels[ch];
        return !!(spec && spec.field != null);
    });

    /** @type {any[]} */
    const injected = [];
    for (const ch of LEGENDABLE) {
        const cfg = legendsOpt === true ? undefined : legendsOpt[ch];
        if (cfg === false) continue;                 // channel suppressed
        if (hasExplicit(ch)) continue;               // the author composed their own
        // With `legends: { size: {...} }` the author named the channels explicitly;
        // with `legends: true` take every one bound to a field. A CONSTANT channel
        // never gets a legend either way: one colour has nothing to explain.
        if (legendsOpt !== true && cfg === undefined) continue;
        if (!isBound(ch)) continue;
        injected.push(legend({ ...(cfg || {}), channel: ch }));
    }
    return injected;
}

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
