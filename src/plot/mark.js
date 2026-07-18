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
// Declarative first. A channel is one of:
//   { field }              a data field, through the channel's global scale
//   { value }              a VISUAL-space constant — skips the scale
//   { datum }              a DATA-space constant — goes THROUGH the scale, so
//                          `y: { datum: 25 }` lands where y=25 is, not at 25px
//   { field, scale: null } a raw field, unscaled (the datum holds a literal)
//   { fn }                 a DERIVED channel — fn(d, i, data) is computed per
//                          datum in VISUAL space (its result is used as-is, never
//                          scaled). e.g. fill: d => d.x > 50 ? 'red' : 'blue'.
// The first four stay serializable and introspectable by the edit/elicitation
// layer. `{ fn }` is the one deliberate exception: it is opaque to that layer, so
// it is READ-ONLY — a derived channel can't carry an `edit` (it recomputes from
// the committed rows on every render, so a source-field edit re-derives it for
// free). A top-level function shorthand (`fill: d => …`) desugars to `{ fn }`; an
// explicit `{ value: someFn }` stays an opaque constant, never invoked.
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
//
// ── pointerEvents: who silences what ────────────────────────────────────────
// The engine silences a mark that carries no direct-pick edit, because the
// renderer defaults nodes to pointer-events:auto and paints later features/parts
// on top — an inert rule overlapping a handle would otherwise swallow its drag.
// That rule is per-FEATURE and all-or-nothing, and it only fills in a value the
// mark left unset (`node.pointerEvents == null`).
//
// So the split is:
//   - Don't silence your WHOLE mark to make it inert — leave pointerEvents alone
//     and let the engine decide (see rule.js). Setting it yourself there also
//     disables the mark when it DOES carry an edit.
//   - DO set it per-node on a glyph's CHROME — a line's path, a trend's fitted
//     line, a dotStack's ghosts, a cone's samples — when the same feature also
//     emits handles. The engine can't make that distinction for you (it sees one
//     feature), and without it the chrome, drawn last, eats the handles' drags.
//     `pointerEvents: 'stroke'` narrows a hit area to a shape's outline.

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
// node — so it belongs here and NOT in STANDARD_STYLE_CHANNELS. `text`/`fontSize`/
// `textAnchor`/`lineAnchor`/`dx`/`dy` are the text mark's own constants (read raw
// by the mark, not swept by resolveStyle), so `text({ text: 'hi', dy: -8 })`
// reads like every other shorthand. (`format` is a mark-level option, not a
// channel — it stays off this list.)
const SHORTHANDS = [
    ...STANDARD_STYLE_CHANNELS,
    'size', 'symbol', 'text', 'fontSize', 'textAnchor', 'lineAnchor', 'dx', 'dy',
    // Orientation in math degrees (0° = +x, CCW). Constant form is a visual-space
    // shorthand; a scaled field goes through the angle channel's scale so rotate()
    // is an exact inverse. Not a style channel — marks that care read it themselves.
    'angle',
];

// The theme helpers a mark's build() reads its DEFAULT ink/fonts from. Re-exported
// here so a mark imports its whole style vocabulary from one module (marks already
// import resolveStyle/encodeChannel from mark.js). `themeOf(scales)` reads the theme
// the engine stamped on the scale map; `markDefaults(scales, name, fallbacks)` layers
// any `theme.marks[name]` overrides over the mark's built-in fallbacks. See
// core/theme.js for the precedence rules.
export { themeOf, markDefaults } from '../core/theme.js';

const DEV = !!(import.meta.env && import.meta.env.DEV);

// A derived channel's fn re-runs on every render, so a warning would repeat
// forever. Warn once per offending channel, the way resolve.js's guards do.
/** @type {Set<string>} */
const warnedFn = new Set();

/**
 * Evaluate a derived channel's `fn(d, i, data)` in VISUAL space. The result is
 * used as-is (never scaled). A null/undefined datum resolves to the fallback
 * rather than calling `fn(undefined)` (constant-resolving callers pass no datum);
 * a fn that returns null/undefined or throws also falls back, so a bad accessor
 * never blanks the chart.
 * @param {any} spec the channel spec (must have a function `fn`)
 * @param {string} channel channel name, for the DEV warning key
 * @param {import('../types').Datum | null} datum
 * @param {number | undefined} index
 * @param {import('../types').Datum[] | undefined} data
 * @param {any} fallback
 * @returns {any}
 */
export function callChannelFn(spec, channel, datum, index, data, fallback) {
    if (datum == null) return fallback;
    try {
        const out = spec.fn(datum, index, data);
        return out == null ? fallback : out;
    } catch (err) {
        if (DEV && !warnedFn.has(channel)) {
            warnedFn.add(channel);
            console.warn(`[vibe] fn on channel "${channel}" threw: ` +
                `${err instanceof Error ? err.message : err}; using the fallback.`);
        }
        return fallback;
    }
}

/**
 * Map a datum through one channel using the global scale. Handles derived
 * channels (`{ fn }`, computed per datum in visual space), visual constants
 * (`{ value }`), data-space constants (`{ datum }`), scaled fields (`{ field }`),
 * unscaled raw fields (`{ field, scale: null }`), and missing scales/fields (fall
 * back). A function `value` (not `fn`) stays an opaque constant, never invoked.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} channels
 * @param {string} channel
 * @param {import('../types').Datum | null} datum a null datum resolves constants only
 * @param {any} [fallback]
 * @param {number} [index] row index, passed to a derived channel's fn
 * @param {import('../types').Datum[]} [data] the dataset, passed to a derived fn
 * @returns {any}
 */
export function encodeChannel(scales, channels, channel, datum, fallback, index, data) {
    const spec = channels[channel];
    if (!spec) return fallback;
    if (spec.field === undefined) {
        // Derived channel — fn(d, i, data) computed in visual space, used as-is.
        // Wins over value/datum so `{ fn }` is unambiguous.
        if (typeof spec.fn === 'function') {
            return callChannelFn(spec, channel, datum, index, data, fallback);
        }
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
 * Resolve the `angle` channel to math degrees (0° = +x, CCW, y-up — the same
 * convention as needle / pointerDegrees). Scaled when an angle scale exists so
 * `rotate()` is an exact inverse; otherwise raw (a `{ value }` constant or the
 * field's literal degrees). Marks stamp the result on `FeatureNode.angle`; the
 * renderer converts to SVG with `rotate(-deg cx cy)`.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} channels
 * @param {import('../types').Datum | null} datum
 * @param {number} [fallback=0]
 * @param {number} [index] row index, passed to a derived channel's fn
 * @param {import('../types').Datum[]} [data] the dataset, passed to a derived fn
 * @returns {number}
 */
export function encodeAngle(scales, channels, datum, fallback = 0, index, data) {
    if (!channels || !channels.angle) return fallback;
    // scales is an index signature — angle is optional.
    const angleScale = /** @type {any} */ (scales)['angle'];
    if (angleScale) return encodeChannel(scales, channels, 'angle', datum, fallback, index, data);
    const spec = channels.angle;
    // Derived angle — fn returns degrees directly (visual space, no scale).
    if (typeof spec.fn === 'function') {
        return +callChannelFn(spec, 'angle', datum, index, data, fallback);
    }
    if (spec.field != null) {
        const v = datum ? datum[spec.field] : undefined;
        return v == null ? fallback : +v;
    }
    if (spec.value !== undefined) return +spec.value;
    return fallback;
}

/**
 * Resolve a datum's glyph on the `symbol` channel, or `undefined` when the mark
 * declares no symbol channel (or the datum's category maps to nothing). A glyph is
 * a category -> string map through the channel's ordinal scale — the same path
 * `fill` takes to a colour — so a shape mark can render it as a text node in place
 * of its circle/rect. Returns a string glyph or undefined.
 * @param {import('../types').ScaleMap} scales
 * @param {Record<string, any>} channels
 * @param {import('../types').Datum} datum
 * @param {number} [index] row index, passed to a derived channel's fn
 * @param {import('../types').Datum[]} [data] the dataset, passed to a derived fn
 * @returns {string | undefined}
 */
export function resolveSymbol(scales, channels, datum, index, data) {
    if (!channels || !channels.symbol) return undefined;
    const glyph = encodeChannel(scales, channels, 'symbol', datum, undefined, index, data);
    return (glyph == null || glyph === '') ? undefined : String(glyph);
}

/**
 * Build a `text` scene node for a glyph centred at (cx, cy), sized so its box is
 * roughly the diameter of a circle of radius `size`. Shared by every shape mark
 * that can render a `symbol` (point / dotStack / waffle), so a glyph token looks
 * the same everywhere. `extra` carries the caller's style/data/index/pointer opts.
 * @param {string} glyph
 * @param {number} cx @param {number} cy
 * @param {number} size the radius the mark would have used for a circle, in px
 * @param {Record<string, any>} [extra]
 * @returns {import('../types').FeatureNode}
 */
export function symbolNode(glyph, cx, cy, size, extra = {}) {
    return {
        type: 'text',
        x: cx,
        y: cy,
        text: glyph,
        fontSize: Math.max(1, size * 2),
        textAnchor: 'middle',
        dominantBaseline: 'central',
        ...extra,
    };
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
 * @param {number} [index] row index, passed to a derived channel's fn
 * @param {import('../types').Datum[]} [data] the dataset, passed to a derived fn
 * @returns {Record<string, any>}
 */
export function resolveStyle(scales, channels, datum, defaults = {}, index, data) {
    /** @type {Record<string, any>} */
    const style = {};
    for (const ch of STANDARD_STYLE_CHANNELS) {
        const fallback = ch in defaults ? defaults[ch] : STYLE_DEFAULTS[ch];
        const value = encodeChannel(scales, channels, ch, datum, fallback, index, data);
        if (value !== undefined) style[ch] = value;
    }
    return style;
}

/**
 * The field that identifies a SERIES — which rows belong to the same line, area,
 * geoLine, or stack segment. One rule for the whole mark layer, because "what
 * groups these rows?" is one question: the marks that ask it were each answering
 * it differently (line read stroke, area read fill-then-stroke), so a coloured
 * area and a coloured line grouped by different channels.
 *
 * Precedence: the explicit option (`series`, or Plot's `z` alias) wins; otherwise
 * the field behind a paint channel, fill before stroke — Observable Plot's `z`
 * default, so a coloured chart groups with no extra config.
 *
 * `series` is the public option name; `seriesKey` is the internal feature field.
 * @param {any} opts normalized mark options
 * @param {Record<string, any>} channels the mark's channel map
 * @returns {string | null}
 */
export function seriesFieldOf(opts, channels = {}) {
    return opts.series || opts.z
        || (channels.fill && channels.fill.field)
        || (channels.stroke && channels.stroke.field)
        || null;
}

/**
 * Desugar top-level constant shorthands into `channels`, without clobbering an
 * explicit `channels[ch]` (an explicit channel wins). Keeps
 * `bar({ fill: 'steelblue' })` and `point({ size: 9 })` working through the one
 * channel path. Returns a new options object with a merged `channels` map and the
 * shorthands stripped.
 *
 * `except` keeps named shorthands as plain top-level options instead of desugaring
 * them. That's for a mark where the name is CHROME rather than per-datum style:
 * an axis's `stroke` paints its spine and its `fontSize` its labels — there is no
 * datum to resolve them against, so turning them into channels would only create
 * a channel nothing reads (and force the mark to reach back into raw options for
 * the real value, which is what axisRadial used to do).
 * @param {any} [options]
 * @param {{ except?: string[] }} [opts]
 * @returns {any}
 */
export function normalizeMarkOptions(options = {}, { except = [] } = {}) {
    const { channels = {}, ...rest } = options;
    /** @type {Record<string, any>} */
    const merged = { ...channels };
    for (const ch of SHORTHANDS) {
        if (rest[ch] === undefined || except.includes(ch)) continue;
        // An explicit channel for this name wins over the shorthand.
        // A function shorthand (`fill: d => …`) desugars to a DERIVED channel
        // (`{ fn }`), computed per datum in visual space; any other value is a
        // visual-space constant (`{ value }`).
        if (merged[ch] === undefined) {
            merged[ch] = typeof rest[ch] === 'function' ? { fn: rest[ch] } : { value: rest[ch] };
        }
        delete rest[ch];
    }
    return { ...rest, channels: merged };
}

/**
 * The style names an AXIS mark treats as chrome (its spine, ticks and labels)
 * rather than as per-datum channels — pass to normalizeMarkOptions's `except`.
 * @type {string[]}
 */
export const AXIS_CHROME = ['stroke', 'strokeWidth', 'fill', 'fontSize'];
