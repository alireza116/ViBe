// @ts-check
// point.js — a channel-driven mark (the encoding-layer counterpart to dot.js).
// Instead of fixed x/y accessors + a static fill option, it reads an `encoding`
// map and resolves every channel — positional or not — through the same GLOBAL
// scale (Observable Plot model): the engine builds one scale per channel and the
// mark just looks it up by name. Adding a colour or size encoding is data, not
// new mark code:
//
//   vibe.plot.point({
//     data,
//     encoding: {
//       x:     { field: "gdp",    type: "linear" },
//       y:     { field: "region" },              // band, inferred
//       color: { field: "region" },              // ordinal palette
//       size:  { field: "population" },          // radius
//     }
//   })
//
// A missing positional channel parks the dot at the centre of that dimension —
// symmetric across x and y, so 1D-along-x and 1D-along-y are the same code path.

/**
 * Map a datum through one channel using the global scale. Handles constant
 * channels ({ value }) and missing scales (fall back to a default).
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} encoding
 * @param {string} channel
 * @param {import('../types').Datum} datum
 * @param {any} fallback
 * @returns {any}
 */
function encodeChannel(scales, encoding, channel, datum, fallback) {
    const spec = encoding[channel];
    if (!spec) return fallback;
    if (spec.field === undefined && spec.value !== undefined) return spec.value; // constant
    const scale = scales[channel];
    if (!scale) return fallback;
    // A datum may lack this channel's field (e.g. a freshly created point with
    // no group/mag yet) — fall back rather than encoding undefined -> NaN.
    const raw = datum[spec.field];
    if (raw === undefined || raw === null) return fallback;
    return scale.encode(raw, fallback);
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function point(options = {}) {
    const { data = [], encoding = {}, id, interactors, edits, onChange } = options;

    return {
        id,
        data,
        encoding,
        interactors,
        // Mark-level edits (joint / arbitrary); channel-level edits live in
        // encoding[ch].edit. Both are gathered by the engine via collectEdits.
        edits,
        onChange,
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
            return currentData.map((d, i) => ({
                type: 'circle',
                cx: encodeChannel(scales, encoding, 'x', d, width / 2),
                cy: encodeChannel(scales, encoding, 'y', d, height / 2),
                r: encodeChannel(scales, encoding, 'size', d, 5),
                fill: encodeChannel(scales, encoding, 'color', d, 'steelblue'),
                opacity: encodeChannel(scales, encoding, 'opacity', d, 1),
                data: d,
                index: i
            }));
        }
    };
}
