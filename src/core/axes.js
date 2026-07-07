// @ts-check
// axes.js — the IMPLICIT layer of the Observable-Plot axis model: resolve the
// global `axes` convenience into composable axis/grid marks. Kept out of the
// engine so elicit.js stays setup + render loop.

import { axisX, axisY, gridX, gridY } from '../plot/axis.js';

/**
 * Resolve the global `axes` convenience into composable axis/grid marks. Only
 * channels the user did not already compose an explicit axis mark for are
 * auto-injected, so an explicit `axisX(...)` in `features` always wins. `axesOpt`:
 *   undefined -> default axis on both positional channels (today's behaviour)
 *   false     -> no axes at all
 *   { x, y }  -> per-channel config object, or `false` to suppress that channel.
 * @param {any[]} features
 * @param {any} axesOpt
 * @returns {any[]} the axis/grid marks to prepend (drawn behind marks)
 */
export function autoAxes(features, axesOpt) {
    if (axesOpt === false) return [];
    /** @type {any[]} */
    const injected = [];
    /** @param {string} ch */
    const hasExplicit = (ch) => features.some(f => (f.isAxis || f.isGrid) && f.channel === ch);
    const builders = { x: { axis: axisX, grid: gridX }, y: { axis: axisY, grid: gridY } };
    for (const ch of /** @type {const} */ (['x', 'y'])) {
        const cfg = axesOpt ? axesOpt[ch] : {};
        if (cfg === false) continue;           // channel suppressed
        if (hasExplicit(ch)) continue;         // user composed their own
        const opts = cfg || {};
        injected.push(builders[ch].axis(opts));
        if (opts.grid) injected.push(builders[ch].grid(opts));
    }
    return injected;
}
