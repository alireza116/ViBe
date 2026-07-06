// @ts-check
// point.js — a channel-driven mark (the encoding-layer counterpart to dot.js).
// It reads an `encoding` map and resolves every channel — positional or not —
// through the same GLOBAL scale (Observable Plot model): the engine builds one
// scale per channel and the mark just looks it up by name. Adding a colour or
// size encoding is data, not new mark code:
//
//   vibe.plot.point({
//     data,
//     encoding: {
//       x:    { field: "gdp",    type: "linear" },
//       y:    { field: "region" },              // band, inferred
//       fill: { field: "region" },              // ordinal palette
//       size: { field: "population" },          // radius
//     }
//   })
//
// Channel resolution + the standard style surface (fill, stroke, strokeWidth,
// opacity, fillOpacity, strokeOpacity) come from the shared mark foundation, so
// point stays styleable in one line and matches every other mark. `size` is the
// dot's radius channel; the legacy `color` channel is honoured as the fill
// fallback (the standard `fill` channel/shorthand takes precedence).
//
// A missing positional channel parks the dot at the centre of that dimension —
// symmetric across x and y, so 1D-along-x and 1D-along-y are the same code path.

import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

/**
 * @param {any} [options]
 * @returns {any}
 */
export function point(options = {}) {
    const opts = normalizeMarkOptions(options);
    const { data = [], encoding = {}, id, interactors, edits, constraints, onChange } = opts;

    return {
        id,
        data,
        encoding,
        interactors,
        // Mark-level edits (joint / arbitrary); channel-level edits live in
        // encoding[ch].edit. Both are gathered by the engine via collectEdits.
        edits,
        // Feature-level data invariants, run on every edit commit (see elicit.js).
        constraints,
        onChange,
        // A dot's categorical axis wants a point per category (a tick, no width).
        categoricalScale: 'point',
        // Field keys the interaction/constraint layer reads, derived from encoding.
        xKey: encoding.x && encoding.x.field,
        yKey: encoding.y && encoding.y.field,

        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            return currentData.map((d, i) => {
                // Legacy `color` channel is the fill fallback; an explicit `fill`
                // channel (or shorthand) wins via resolveStyle's defaults.
                const colorFallback = encodeChannel(scales, encoding, 'color', d, 'steelblue');
                const style = resolveStyle(scales, encoding, d, { fill: colorFallback });
                return {
                    type: 'circle',
                    cx: encodeChannel(scales, encoding, 'x', d, width / 2),
                    cy: encodeChannel(scales, encoding, 'y', d, height / 2),
                    r: encodeChannel(scales, encoding, 'size', d, 5),
                    ...style,
                    data: d,
                    index: i
                };
            });
        }
    };
}
