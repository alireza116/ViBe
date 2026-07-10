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

// Illustrative categorical palette (swap for a real design-system palette later).
export const DEFAULT_PALETTE = ['#4f46e5', '#0d9488', '#e4572e', '#f2b705', '#7b2d8b', '#3aa5d1'];
// Default two-stop ramp for a continuous colour channel.
export const DEFAULT_RAMP = ['#e6f0ff', '#08519c'];

// Channel families that share scale semantics, so a field-driven fill/stroke is
// colour-scaled and a field-driven fillOpacity/strokeOpacity is opacity-scaled —
// symmetric with the base `opacity` channel.
const COLOR_CHANNELS = new Set(['fill', 'stroke']);
const OPACITY_CHANNELS = new Set(['opacity', 'fillOpacity', 'strokeOpacity']);

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
    }
    // Family-based ranges: any opacity/colour channel gets the same output range
    // as its base channel, so fillOpacity/strokeOpacity and fill/stroke behave
    // like opacity when driven by a field.
    if (OPACITY_CHANNELS.has(channelName)) return [0.15, 1];
    if (COLOR_CHANNELS.has(channelName)) return type === 'sequential' ? DEFAULT_RAMP : DEFAULT_PALETTE;
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
 * The gesture->visual half of a channel-scoped interaction: given a pointer and
 * (for radial channels) the mark's centre, what visual value is the user
 * setting on `channelName`?  Positional channels read the pointer coordinate;
 * `size` reads the distance from the mark centre (a resize handle). New
 * draggable channels register here — this is the one place gestures are mapped.
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
    return undefined; // channel isn't spatially adjustable this way
}
