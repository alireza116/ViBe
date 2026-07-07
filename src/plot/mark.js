// @ts-check
// mark.js — the shared foundation every mark builds on (Observable Plot's mark
// model, adapted for belief elicitation). It gives marks two things uniformly:
//
//   1. Channel resolution — turn a datum into a visual value through the GLOBAL
//      per-channel scale the engine resolved (positional OR style), the same way
//      for every mark. `encodeChannel` is the one place that logic lives.
//   2. A standard STYLE surface — fill, stroke, strokeWidth, opacity,
//      fillOpacity, strokeOpacity — resolved the same way (constant, field, or
//      unscaled) and spread onto the scene node, so any mark is styleable in one
//      line and the renderer applies them uniformly.
//
// Declarative only: a channel is `{ field }` (scaled), `{ value }` (a constant),
// or `{ field, scale: null }` (a raw field, unscaled). No accessor functions —
// specs stay serializable and introspectable by the edit/elicitation layer.
//
// ── The mark contract ───────────────────────────────────────────────────────
// A mark factory returns a plain feature object the engine consumes. Required:
//   build(currentData, scales, width, height) -> FeatureNode[]
//     the one method — emit scene nodes ({ type: 'circle'|'rect'|'line'|'path'|
//     'text', … }); resolve every position/style through encodeChannel/resolveStyle.
// Common optional fields the engine reads:
//   encoding                 the channel map (also the source scales resolve from)
//   categoricalScale         'band' (bar/tick: interval) | 'point' (dot/line: tick)
//   xKey / yKey              value field names the edit/constraint layer reads back
//   edits / constraints / onChange / id
//   seriesKey / order / supportsSeries   line-family grouping (see plot/line.js)
// Every data mark should resolve a datum -> pixel through encodeChannel (band+value
// marks use it for the value axis and band-geometry helpers for the category axis),
// so positions are computed exactly one way across marks.

/**
 * The standard style channels every mark understands, with their default
 * fallbacks (used when the mark doesn't set the channel at all). `undefined`
 * means "leave the attribute off" — the renderer supplies its own default.
 * @type {Record<string, any>}
 */
export const STYLE_DEFAULTS = {
    fill: undefined,
    stroke: undefined,
    strokeWidth: undefined,
    opacity: undefined,
    fillOpacity: undefined,
    strokeOpacity: undefined
};

/** @type {string[]} */
export const STANDARD_STYLE_CHANNELS = Object.keys(STYLE_DEFAULTS);

// Top-level option shorthands that desugar to constant channels. Kept in sync
// with the style channels (an author writes `fill: 'red'`, not
// `encoding: { fill: { value: 'red' } }`).
const STYLE_SHORTHANDS = STANDARD_STYLE_CHANNELS;

/**
 * Map a datum through one channel using the global scale. Handles constant
 * channels (`{ value }`), scaled fields (`{ field }`), unscaled raw fields
 * (`{ field, scale: null }`), and missing scales/fields (fall back). Declarative
 * only — a function `value` is treated as an opaque constant, never invoked.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} encoding
 * @param {string} channel
 * @param {import('../types').Datum} datum
 * @param {any} [fallback]
 * @returns {any}
 */
export function encodeChannel(scales, encoding, channel, datum, fallback) {
    const spec = encoding[channel];
    if (!spec) return fallback;
    // Constant channel — no field. Subsumes static options like fill: "steelblue".
    if (spec.field === undefined && spec.value !== undefined) return spec.value;
    const raw = datum ? datum[spec.field] : undefined;
    // A datum may lack this channel's field (e.g. a freshly created point with
    // no group/mag yet) — fall back rather than encoding undefined -> NaN.
    if (raw === undefined || raw === null) return fallback;
    // Unscaled field: the datum already holds a literal (a CSS colour, a pixel).
    if (spec.scale === null) return raw;
    const scale = scales[channel];
    if (!scale) return fallback;
    return scale.encode(raw, fallback);
}

/**
 * Resolve the standard style channels for one datum into a style object ready to
 * spread onto a scene node. Only channels the mark actually declared (or that
 * carry a non-undefined default) are included, so a node stays sparse and the
 * renderer's own defaults apply to the rest.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} encoding
 * @param {import('../types').Datum} datum
 * @param {Record<string, any>} [defaults] per-mark default fallbacks (e.g. fill)
 * @returns {Record<string, any>}
 */
export function resolveStyle(scales, encoding, datum, defaults = {}) {
    /** @type {Record<string, any>} */
    const style = {};
    for (const ch of STANDARD_STYLE_CHANNELS) {
        const fallback = ch in defaults ? defaults[ch] : STYLE_DEFAULTS[ch];
        const value = encodeChannel(scales, encoding, ch, datum, fallback);
        if (value !== undefined) style[ch] = value;
    }
    return style;
}

/**
 * Desugar top-level style shorthands into `encoding` as constant channels,
 * without clobbering an explicit `encoding[ch]` (explicit encoding wins). Keeps
 * `bar({ fill: 'steelblue' })` working through the unified channel path. Returns
 * a new options object with a merged `encoding` and the shorthands stripped.
 * @param {any} [options]
 * @returns {any}
 */
export function normalizeMarkOptions(options = {}) {
    const { encoding = {}, ...rest } = options;
    /** @type {Record<string, any>} */
    const mergedEncoding = { ...encoding };
    for (const ch of STYLE_SHORTHANDS) {
        if (rest[ch] === undefined) continue;
        // Explicit encoding for this channel wins over the shorthand.
        if (mergedEncoding[ch] === undefined) mergedEncoding[ch] = { value: rest[ch] };
        delete rest[ch];
    }
    return { ...rest, encoding: mergedEncoding };
}
