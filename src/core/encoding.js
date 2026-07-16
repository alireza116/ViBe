// @ts-check
// encoding.js — the channel layer (Vega-Lite / Observable-Plot style).
//
// A CHANNEL is a named binding of a data field to a visual property; a mark's
// `channels` is just a map of them:
//
//   channels: {
//     x:    { field: "height" },                  // scale inferred from the schema
//     y:    { field: "weight", edit: drag() },    // ... and writable
//     fill: { field: "group" },                   // -> ordinal palette
//     size: { field: "pop", scale: { range: [4, 20] } },  // -> radius
//     opacity: { value: 0.8 }                     // a visual constant (no scale)
//   }
//
// The payoff: every channel — positional OR not — maps a datum the same way,
// through `scale.encode(value)`.
//
// ── type vs scale ───────────────────────────────────────────────────────────
// A channel's `type` is the DATA type (quantitative | categorical | ordinal |
// temporal) — what the field means. It is normally declared once on the schema
// and never repeated here. The SCALE type (linear | band | point | ordinal | …)
// is how a channel draws that data, and is derived: `scaleTypeFor` is the one
// place that decision lives. So a bar's x channel is a band because the field is
// categorical AND a bar needs an interval — nobody writes `type: "band"`.
//
// Scales are built by the single factory in core/scales.js (`createScale`), and
// resolved GLOBALLY per channel across all marks by core/resolve.js (the
// Observable Plot model). This module supplies the inference and the per-channel
// output ranges that resolver needs.

import * as d3 from 'd3';

// Default categorical palette — 10 distinct hues (Tableau-style) so a domain of
// up to ten categories gets its own colour before an ordinal scale recycles.
// Override per-channel with `scale: { range: [...] }` or `scale: { scheme: '…' }`.
export const DEFAULT_PALETTE = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
];
// Default two-stop ramp for a continuous colour channel.
export const DEFAULT_RAMP = ['#e6f0ff', '#08519c'];
// Default three-stop ramp for a DIVERGING colour channel: two hues meeting at a
// near-white neutral, so the pivot reads as "neither side" and distance from it
// reads in either direction. (ColorBrewer RdBu's ends — colour-blind safe.)
export const DEFAULT_DIVERGING = ['#2166ac', '#f7f7f7', '#b2182b'];

// Default glyph range for the `symbol` channel — neutral unicode SHAPES (like
// Observable Plot's symbol channel), so a symbol channel always renders something
// before an author supplies emoji. Override with `scale: { range: ['😢', …] }` or a
// named `scheme` (see SYMBOL_SCHEMES). Emoji are a special case of a symbol range.
export const DEFAULT_SYMBOLS = ['●', '■', '▲', '◆', '★', '✚', '▼', '◀', '▶', '⬟'];

// Named symbol/emoji schemes — the "emoji is a special case" shortcut, so an author
// writes `scale: { scheme: 'faces' }` instead of listing the glyphs. Ordered
// low → high so they line up with an ordinal domain sorted the same way.
/** @type {Record<string, readonly string[]>} */
const SYMBOL_SCHEMES = {
    faces: ['😞', '😐', '🙂'],
    faces5: ['😢', '🙁', '😐', '🙂', '😄'],
    hearts: ['🖤', '💛', '❤️'],
    weather: ['☀️', '⛅', '☁️', '🌧️', '⛈️'],
    arrows: ['⬇️', '↘️', '➡️', '↗️', '⬆️'],
    shapes: DEFAULT_SYMBOLS,
};

// Named colour schemes. Categorical entries are ready-made palettes (d3-scale-
// chromatic scheme arrays); ramp entries are interpolators sampled to N swatches.
// Keys are lowercase so authors write `scheme: 'tableau10'` / `scheme: 'RdBu'`
// without worrying about d3's internal CamelCase.
/** @type {Record<string, readonly string[]>} */
const CATEGORICAL_SCHEMES = {
    category10: d3.schemeCategory10,
    tableau10: d3.schemeTableau10,
    observable10: d3.schemeObservable10,
    accent: d3.schemeAccent,
    dark2: d3.schemeDark2,
    paired: d3.schemePaired,
    pastel1: d3.schemePastel1,
    pastel2: d3.schemePastel2,
    set1: d3.schemeSet1,
    set2: d3.schemeSet2,
    set3: d3.schemeSet3,
};
/** @type {Record<string, (t: number) => string>} */
const RAMP_SCHEMES = {
    rdbu: d3.interpolateRdBu,
    rdylbu: d3.interpolateRdYlBu,
    rdylgn: d3.interpolateRdYlGn,
    brbg: d3.interpolateBrBG,
    piyg: d3.interpolatePiYG,
    spectral: d3.interpolateSpectral,
    blues: d3.interpolateBlues,
    greens: d3.interpolateGreens,
    greys: d3.interpolateGreys,
    oranges: d3.interpolateOranges,
    purples: d3.interpolatePurples,
    reds: d3.interpolateReds,
    viridis: d3.interpolateViridis,
    magma: d3.interpolateMagma,
    inferno: d3.interpolateInferno,
    plasma: d3.interpolatePlasma,
    cividis: d3.interpolateCividis,
    turbo: d3.interpolateTurbo,
    warm: d3.interpolateWarm,
    cool: d3.interpolateCool,
};
// ColorBrewer discrete diverging/sequential palettes (arrays indexed by n = 3..11).
// Prefer these for ordinal colour so a 7-class RdBu is the true Brewer set, not a
// quantized sample of the continuous interpolator (which overshoots the ends).
/** @type {Record<string, { [n: number]: readonly string[] } | readonly string[][]>} */
const DISCRETE_RAMP_SCHEMES = {
    rdbu: d3.schemeRdBu,
    rdylbu: d3.schemeRdYlBu,
    rdylgn: d3.schemeRdYlGn,
    brbg: d3.schemeBrBG,
    piyg: d3.schemePiYG,
    spectral: d3.schemeSpectral,
    blues: d3.schemeBlues,
    greens: d3.schemeGreens,
    greys: d3.schemeGreys,
    oranges: d3.schemeOranges,
    purples: d3.schemePurples,
    reds: d3.schemeReds,
};

/**
 * Resolve a named colour `scheme` to a concrete range array, or null if the name
 * is unknown / not given. A categorical scheme returns its palette as-is (an
 * ordinal scale recycles it if the domain is longer); a ramp scheme uses the
 * ColorBrewer discrete palette sized to the domain when available, otherwise is
 * sampled into `count` swatches — or handed to createScale as a two-stop range
 * for a continuous (sequential) colour channel.
 * @param {string | undefined} scheme
 * @param {import('../types').ScaleType} type the resolved scale type
 * @param {number} count domain length (categories), min 1
 * @returns {any[] | null}
 */
export function schemeRange(scheme, type, count) {
    if (!scheme || typeof scheme !== 'string') return null;
    const key = scheme.toLowerCase();
    // Symbol/emoji schemes are ready-made glyph palettes (an ordinal scale recycles
    // them if the domain is longer), same shape as a categorical colour scheme.
    if (SYMBOL_SCHEMES[key]) return [...SYMBOL_SCHEMES[key]];
    if (CATEGORICAL_SCHEMES[key]) return [...CATEGORICAL_SCHEMES[key]];
    const interp = RAMP_SCHEMES[key];
    if (!interp) return null;
    // A continuous colour channel wants a ramp for createScale; a discrete one wants
    // one swatch per category. A diverging scale needs the ramp's MIDPOINT too —
    // that's the colour its pivot takes, and on a Brewer diverging scheme it's the
    // neutral the two hues meet at.
    if (type === 'diverging') return [interp(0), interp(0.5), interp(1)];
    if (type === 'sequential') return [interp(0), interp(1)];
    const n = Math.max(2, count || 2);
    const discrete = DISCRETE_RAMP_SCHEMES[key];
    if (discrete) {
        // Brewer discrete sets exist for n = 3..11; clamp into that window.
        const k = Math.max(3, Math.min(11, n));
        const palette = discrete[k];
        if (palette) return [...palette];
    }
    return d3.quantize(interp, n);
}

// Channel families that share scale semantics, so a field-driven fill/stroke is
// colour-scaled and a field-driven fillOpacity/strokeOpacity is opacity-scaled —
// symmetric with the base `opacity` channel.
const COLOR_CHANNELS = new Set(['fill', 'stroke']);
const OPACITY_CHANNELS = new Set(['opacity', 'fillOpacity', 'strokeOpacity']);
// The `symbol` channel maps a category -> a glyph (emoji / unicode shape) through
// an ordinal scale, exactly as `fill` maps a category -> a colour. It is
// non-positional and non-invertible (a glyph isn't a coordinate a drag inverts),
// so it never enters AXIS_OF / visualForChannel — it's edited with cycle/legend.
const SYMBOL_CHANNELS = new Set(['symbol']);

// Position family: x1/x2 and y1/y2 are SPAN ENDPOINTS on the x/y axis, not their
// own axes (Observable Plot's model — a bar's x1/x2 are both "x" units). The one
// place a channel name resolves to the axis it shares a scale with, so x1/x2/y1/y2
// union into the same domain/range/scale as x/y instead of getting their own.
/** @type {Record<string, 'x' | 'y'>} */
const AXIS_OF = { x: 'x', x1: 'x', x2: 'x', y: 'y', y1: 'y', y2: 'y' };

/**
 * The positional axis a channel shares its scale with ('x' or 'y'), or
 * undefined for a non-positional channel (fill, size, opacity, ...).
 * @param {string} channelName
 * @returns {'x' | 'y' | undefined}
 */
export function axisOf(channelName) {
    return AXIS_OF[channelName];
}

// ---------------------------------------------------------------------------
// Inference. The engine's resolver (core/resolve.js) unions a field's values
// across marks and asks these two questions in order: what IS this data, and
// how should this channel draw it.
// ---------------------------------------------------------------------------

/**
 * What a field's values ARE, from a sample: a Date is temporal, a number is
 * quantitative, anything else is categorical. The fallback for a channel with no
 * values at all is quantitative — but the resolver never gets here in that case,
 * because a field with neither a schema type nor data is an error.
 * @param {any[]} values
 * @returns {import('../types').MeasureType}
 */
export function inferMeasureType(values) {
    const sample = values.find((v) => v != null);
    if (sample instanceof Date) return 'temporal';
    if (typeof sample === 'number') return 'quantitative';
    if (sample === undefined) return 'quantitative';
    return 'categorical';
}

/**
 * Route a channel + its data type to a concrete scale type. THE one place the
 * "what does this channel do with continuous vs discrete vs temporal data"
 * decision lives — so a schema-declared type and an inferred one can never
 * disagree about the scale they produce.
 *
 * `discrete` is the concrete scale a mark wants for discrete data: a bar needs
 * the interval ('band'), a dot wants the tick ('point'). The MARK declares it
 * (`discreteScale`), defaulting to 'band'.
 * @param {string} channelName
 * @param {import('../types').MeasureType} measure
 * @param {import('../types').ScaleType} [discrete]
 * @returns {import('../types').ScaleType}
 */
export function scaleTypeFor(channelName, measure, discrete = 'band') {
    const continuous = measure === 'quantitative' || measure === 'temporal';
    // Colour family: continuous data -> a ramp, discrete -> a palette.
    if (COLOR_CHANNELS.has(channelName)) return continuous ? 'sequential' : 'ordinal';
    // Symbol family: always an ordinal category -> glyph map. (Binning a
    // quantitative field into glyph buckets is out of scope for v1 — declare the
    // field categorical/ordinal to drive it.)
    if (SYMBOL_CHANNELS.has(channelName)) return 'ordinal';
    // positional / size / opacity: dates -> time, numbers -> linear, categories ->
    // the mark's discrete scale (band|point).
    if (measure === 'temporal') return 'time';
    if (measure === 'quantitative') return 'linear';
    return discrete;
}

/**
 * Infer a scale domain from data values: unique set for discrete scales, extent
 * for continuous ones. Only reached when the schema declares no domain.
 * @param {import('../types').ScaleType} type
 * @param {any[]} values
 * @returns {any[]}
 */
export function inferDomainFromValues(type, values) {
    if (type === 'band' || type === 'point' || type === 'ordinal') {
        return [...new Set(values.filter((v) => v != null))];
    }
    const nums = values.filter((v) => v != null);
    return nums.length ? [Math.min(...nums), Math.max(...nums)] : [0, 1];
}

/**
 * Union the declared domains of every field feeding one axis. An error bar puts
 * `mean`, `lo` and `hi` on y; the axis must span all three, not whichever field
 * happened to be encoded first.
 * @param {import('../types').MeasureType} measure
 * @param {any[][]} domains one per field that declared one
 * @returns {any[] | undefined}
 */
export function unionDomains(measure, domains) {
    if (!domains.length) return undefined;
    if (domains.length === 1) return domains[0];
    if (measure === 'quantitative' || measure === 'temporal') {
        const lows = domains.map((d) => Math.min(...d.map(Number)));
        const highs = domains.map((d) => Math.max(...d.map(Number)));
        const [lo, hi] = [Math.min(...lows), Math.max(...highs)];
        return measure === 'temporal' ? [new Date(lo), new Date(hi)] : [lo, hi];
    }
    // Discrete: ordered union, first-seen order (ordinal's order is significant).
    return [...new Set(domains.flat())];
}

/**
 * The default visual output range for a channel: pixels for x/y, a radius
 * interval for size, a palette/ramp for colour, [0,1] for opacity.
 * @param {string} channelName
 * @param {import('../types').ScaleType} type
 * @param {{ width: number, height: number }} dims
 * @returns {any[]}
 */
export function channelRange(channelName, type, dims) {
    switch (channelName) {
        case 'x': return [0, dims.width];
        case 'y': return [dims.height, 0];   // pixel y is inverted
        case 'size': return [3, 18];         // radius, px
        // Degrees in math convention (y-up). Default matches arcSpan semi/`orient:
        // 'top'` — left (180°) → right (0°) through the top (NYT / speedometer).
        case 'angle': return [180, 0];
    }
    // Family-based ranges: any opacity/colour channel gets the same output range
    // as its base channel, so fillOpacity/strokeOpacity and fill/stroke behave
    // like opacity when driven by a field.
    if (OPACITY_CHANNELS.has(channelName)) return [0.15, 1];
    if (COLOR_CHANNELS.has(channelName)) {
        if (type === 'diverging') return DEFAULT_DIVERGING;
        return type === 'sequential' ? DEFAULT_RAMP : DEFAULT_PALETTE;
    }
    // Symbol channel: a glyph palette (author overrides with scale.range/scheme).
    if (SYMBOL_CHANNELS.has(channelName)) return [...DEFAULT_SYMBOLS];
    return [0, 1];
}

/**
 * A feature's channel map. Marks carry `channels` directly; this is the one
 * accessor, so the engine never reaches into a feature's shape.
 * @param {any} feature
 * @returns {Record<string, any>}
 */
export function normalizeChannels(feature) {
    return feature.channels || {};
}

// ---------------------------------------------------------------------------
// Interaction primitive — the inverse direction (gesture -> data).
// ---------------------------------------------------------------------------

/**
 * Math-convention angle in degrees (y-up, 0° = +x, counterclockwise) of a
 * pointer about a centre. Shared by visualForChannel('angle') and rotate().
 * @param {{ x: number, y: number }} pointer
 * @param {{ cx: number, cy: number }} center
 * @returns {number}
 */
export function pointerDegrees(pointer, center) {
    return Math.atan2(-(pointer.y - center.cy), pointer.x - center.cx) * 180 / Math.PI;
}

/**
 * Bring a raw atan2 angle (from pointerDegrees, in (-180, 180]) onto the
 * continuous line an authored arc SPAN lives on, then clamp to that span. This
 * kills the ±180° branch-cut discontinuity: a top gauge's 0 endpoint sits at
 * 180°, so dragging just past it wraps atan2 to ≈-179° — without unwrapping,
 * scale.invert reads that as the FAR end (a jump to the max value). We instead
 * normalize `deg` (mod 360) to the representative within ±180° of the span
 * centre, then clamp to [min, max] of the span. A full circle (|span| ≈ 360)
 * leaves every angle inside its own window, so this is a no-op there (the dial
 * is untouched). Shared by rotate() and the arc edge edit.
 * @param {number} deg raw angle in (-180, 180]
 * @param {number} spanStart degrees (scale.range[0])
 * @param {number} spanEnd degrees (scale.range[last])
 * @returns {number}
 */
export function unwrapDegrees(deg, spanStart, spanEnd) {
    const lo = Math.min(spanStart, spanEnd);
    const hi = Math.max(spanStart, spanEnd);
    const center = (lo + hi) / 2;
    // Shift by whole turns into (center - 180, center + 180].
    const unwrapped = center + ((((deg - center) % 360) + 540) % 360) - 180;
    return Math.max(lo, Math.min(hi, unwrapped));
}

/**
 * The gesture->visual half of a channel-scoped interaction: given a pointer and
 * (for radial channels) the mark's centre, what visual value is the user
 * setting on `channelName`?  Positional channels read the pointer coordinate;
 * `size` reads the distance from the mark centre (a resize handle); `angle`
 * reads atan2 about the centre (a rotate gesture). New draggable channels
 * register here — this is the one place gestures are mapped.
 * @param {string} channelName
 * @param {{ x: number, y: number }} pointer
 * @param {{ cx: number, cy: number } | null} [center]
 * @returns {number | undefined}
 */
export function visualForChannel(channelName, pointer, center) {
    const axis = axisOf(channelName);
    if (axis === 'x') return pointer.x;
    if (axis === 'y') return pointer.y;
    if (channelName === 'size') { // radius = distance from centre -> a resize gesture
        return center ? Math.hypot(pointer.x - center.cx, pointer.y - center.cy) : undefined;
    }
    if (channelName === 'angle') {
        return center ? pointerDegrees(pointer, center) : undefined;
    }
    return undefined; // channel isn't spatially adjustable this way
}
