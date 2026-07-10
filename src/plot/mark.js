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
// Declarative only. A channel is one of:
//   { field }              a data field, through the channel's global scale
//   { value }              a VISUAL-space constant — skips the scale
//   { datum }              a DATA-space constant — goes THROUGH the scale, so
//                          `y: { datum: 25 }` lands where y=25 is, not at 25px
//   { field, scale: null } a raw field, unscaled (the datum holds a literal)
// No accessor functions — specs stay serializable and introspectable by the
// edit/elicitation layer.
//
// ── The mark contract ───────────────────────────────────────────────────────
// A mark NEVER owns data. `Elicit` owns the chart's one dataset; a mark is a view
// over it that encodes some columns and, where a channel carries an `edit`, writes
// them back. The engine hands the current rows to build() — so there is no `data`
// option and no `onChange` (both live on the Elicit spec). Nor does a mark own a
// DOMAIN: that belongs to the data, and is declared once on the spec's schema.
//
// A mark factory returns a plain feature object the engine consumes. Required:
//   build(currentData, scales, width, height) -> FeatureNode[]
//     the one method — emit scene nodes ({ type: 'circle'|'rect'|'line'|'path'|
//     'text', … }); resolve every position/style through encodeChannel/resolveStyle.
// Common optional fields the engine reads:
//   channels                 the channel map (also the source scales resolve from)
//   discreteScale            'band' (bar/tick: interval) | 'point' (dot/line: tick)
//   xKey / yKey              value field names the edit/constraint layer reads back
//   edits / constraints / id     (constraints are promoted to the dataset's set)
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

// The channels resolveStyle sweeps onto every scene node.
/** @type {string[]} */
export const STANDARD_STYLE_CHANNELS = Object.keys(STYLE_DEFAULTS);

// Top-level option shorthands that desugar to constant channels, so an author
// writes `fill: 'red'` rather than `channels: { fill: { value: 'red' } }`.
//
// A superset of the style channels: `size` is a constant a mark reads itself
// (a circle's radius, via encodeChannel), not one resolveStyle spreads onto a
// node — so it belongs here and NOT in STANDARD_STYLE_CHANNELS.
const SHORTHANDS = [...STANDARD_STYLE_CHANNELS, 'size'];

/**
 * Map a datum through one channel using the global scale. Handles visual
 * constants (`{ value }`), data-space constants (`{ datum }`), scaled fields
 * (`{ field }`), unscaled raw fields (`{ field, scale: null }`), and missing
 * scales/fields (fall back). Declarative only — a function `value` is treated as
 * an opaque constant, never invoked.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} channels
 * @param {string} channel
 * @param {import('../types').Datum | null} datum a null datum resolves constants only
 * @param {any} [fallback]
 * @returns {any}
 */
export function encodeChannel(scales, channels, channel, datum, fallback) {
    const spec = channels[channel];
    if (!spec) return fallback;
    if (spec.field === undefined) {
        // Visual-space constant — the value IS the output. Subsumes static options
        // like fill: "steelblue".
        if (spec.value !== undefined) return spec.value;
        // Data-space constant — the value is in the field's units, so it goes
        // through the scale exactly as a field's value would. `y: { datum: 25 }`
        // is a reference line at y=25, not at pixel 25.
        if (spec.datum !== undefined) {
            const scale = scales[channel];
            return scale ? scale.encode(spec.datum, fallback) : fallback;
        }
        return fallback;
    }
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
 * @param {Record<string, any>} channels
 * @param {import('../types').Datum} datum
 * @param {Record<string, any>} [defaults] per-mark default fallbacks (e.g. fill)
 * @returns {Record<string, any>}
 */
export function resolveStyle(scales, channels, datum, defaults = {}) {
    /** @type {Record<string, any>} */
    const style = {};
    for (const ch of STANDARD_STYLE_CHANNELS) {
        const fallback = ch in defaults ? defaults[ch] : STYLE_DEFAULTS[ch];
        const value = encodeChannel(scales, channels, ch, datum, fallback);
        if (value !== undefined) style[ch] = value;
    }
    return style;
}

/**
 * Desugar top-level constant shorthands into `channels`, without clobbering an
 * explicit `channels[ch]` (an explicit channel wins). Keeps
 * `bar({ fill: 'steelblue' })` and `point({ size: 9 })` working through the one
 * channel path. Returns a new options object with a merged `channels` map and the
 * shorthands stripped.
 * @param {any} [options]
 * @returns {any}
 */
export function normalizeMarkOptions(options = {}) {
    const { channels = {}, ...rest } = options;
    /** @type {Record<string, any>} */
    const merged = { ...channels };
    for (const ch of SHORTHANDS) {
        if (rest[ch] === undefined) continue;
        // An explicit channel for this name wins over the shorthand.
        if (merged[ch] === undefined) merged[ch] = { value: rest[ch] };
        delete rest[ch];
    }
    return { ...rest, channels: merged };
}
