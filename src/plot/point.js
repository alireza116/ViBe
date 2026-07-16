// @ts-check
// point.js — a channel-driven mark. It reads a `channels` map and resolves every
// channel — positional or not — through the same GLOBAL scale (Observable Plot
// model): the engine builds one scale per channel and the mark just looks it up
// by name. Adding a colour or size channel is data, not new mark code:
//
//   vibe.plot.point({
//     channels: {
//       x:    { field: "gdp" },        // linear   (schema: quantitative)
//       y:    { field: "region" },     // point    (schema: categorical)
//       fill: { field: "region" },     // ordinal palette
//       size: { field: "population" }, // radius
//     }
//   })
//
// Channel resolution + the standard style surface (fill, stroke, strokeWidth,
// opacity, fillOpacity, strokeOpacity) come from the shared mark foundation, so
// point stays styleable in one line and matches every other mark. `size` is the
// dot's radius channel, in px — as a field it ramps, and `point({ size: 9 })` is
// the constant shorthand.
//
// A missing positional channel parks the dot at the centre of that dimension —
// symmetric across x and y, so 1D-along-x and 1D-along-y are the same code path.

import { encodeChannel, resolveStyle, resolveSymbol, symbolNode, normalizeMarkOptions } from './mark.js';

/**
 * @param {any} [options]
 * @returns {any}
 */
export function point(options = {}) {
    const opts = normalizeMarkOptions(options);
    const { channels = {}, id, edits, constraints } = opts;

    return {
        id,
        channels,
        // Mark-level edits (joint / arbitrary); channel-level edits live in
        // channels[ch].edit. Both are gathered by the engine via collectEdits.
        edits,
        // Data invariants, promoted by the engine into the dataset's constraint set
        // and run on every edit commit, from any mark (see elicit.js).
        constraints,
        // A dot's categorical axis wants a point per category (a tick, no width).
        discreteScale: 'point',
        // Field keys the interaction/constraint layer reads, derived from channels.
        xKey: channels.x && channels.x.field,
        yKey: channels.y && channels.y.field,

        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            return currentData.map((d, i) => {
                const style = resolveStyle(scales, channels, d, { fill: 'steelblue' });
                const cx = encodeChannel(scales, channels, 'x', d, width / 2);
                const cy = encodeChannel(scales, channels, 'y', d, height / 2);
                const size = encodeChannel(scales, channels, 'size', d, 5);
                // A `symbol` channel turns the dot into a glyph (emoji / unicode
                // shape) — the same category->encoding path, rendered as text. `size`
                // still sets its px extent so a glyph point and a circle point match.
                const glyph = resolveSymbol(scales, channels, d);
                if (glyph !== undefined) {
                    return symbolNode(glyph, cx, cy, size, { ...style, data: d, index: i });
                }
                return {
                    type: 'circle',
                    cx,
                    cy,
                    r: size,
                    ...style,
                    data: d,
                    index: i
                };
            });
        }
    };
}
