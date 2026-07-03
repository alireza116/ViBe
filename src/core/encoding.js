// @ts-check
// encoding.js — the channel/encoding layer (Vega-Lite / Observable-Plot style).
//
// A CHANNEL is a named binding of a data field to a scale; an ENCODING is just a
// map of them:
//
//   encoding: {
//     x:     { field: "height" },                       // scale/type inferred
//     y:     { field: "weight",  type: "linear" },
//     color: { field: "group" },                        // -> ordinal palette
//     size:  { field: "pop",     range: [4, 20] },      // -> radius
//     shape: { value: "circle" }                        // constant (no field)
//   }
//
// The payoff: every channel — positional OR not — maps a datum the same way,
// `channel.encode(datum)`. Position through a band/linear scale, colour through
// an ordinal/sequential scale, size through a linear scale to a radius range.
//
// Scales are built by the single factory in core/scales.js (`createScale`); this
// module adds the *inference* (type/domain from data), the per-channel output
// ranges, and the interaction primitives (invert a pointer/gesture back to data).
// The engine (core/resolve.js) reuses the same inference helpers to resolve
// GLOBAL per-channel scales across all marks (the Observable Plot model).

import * as d3 from 'd3';
import { createScale } from './scales.js';

// Illustrative categorical palette (swap for a real design-system palette later).
export const DEFAULT_PALETTE = ['#4f46e5', '#0d9488', '#e4572e', '#f2b705', '#7b2d8b', '#3aa5d1'];
// Default two-stop ramp for a continuous colour channel.
export const DEFAULT_RAMP = ['#e6f0ff', '#08519c'];

// ---------------------------------------------------------------------------
// Inference (value-based, so both the per-mark resolver here and the engine's
// cross-mark resolver can share it). `values` is the flat list of a field's
// values — from one mark here, or unioned across marks in the engine.
// ---------------------------------------------------------------------------

/**
 * Choose a scale type from a channel name + its data values.
 * @param {string} channelName
 * @param {any[]} values
 * @returns {import('../types').ScaleType}
 */
export function inferScaleType(channelName, values) {
    const sample = values.find((v) => v != null);
    const isNumeric = typeof sample === 'number';
    if (channelName === 'color') return isNumeric ? 'sequential' : 'ordinal';
    // positional / size / opacity: strings are categorical (band), else linear.
    return isNumeric ? 'linear' : (sample !== undefined ? 'band' : 'linear');
}

/**
 * Infer a scale domain from data values: unique set for discrete scales, extent
 * for continuous ones.
 * @param {import('../types').ScaleType} type
 * @param {any[]} values
 * @returns {any[]}
 */
export function inferDomainFromValues(type, values) {
    if (type === 'band' || type === 'ordinal') {
        return [...new Set(values.filter((v) => v != null))];
    }
    const nums = values.filter((v) => v != null);
    return nums.length ? [Math.min(...nums), Math.max(...nums)] : [0, 1];
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
        case 'opacity': return [0.15, 1];
        case 'color': return type === 'sequential' ? DEFAULT_RAMP : DEFAULT_PALETTE;
        default: return [0, 1];
    }
}

/**
 * Normalize a feature to an encoding map. New marks carry `encoding` directly;
 * legacy marks (dot/bar) expose xKey/yKey accessors, which desugar to
 * { x: { field }, y: { field } } (their scale type/domain still comes from the
 * top-level spec.x / spec.y).
 * @param {any} feature
 * @returns {any}
 */
export function normalizeEncoding(feature) {
    if (feature.encoding) return feature.encoding;
    const enc = {};
    if (feature.xKey != null) enc.x = { field: feature.xKey };
    if (feature.yKey != null) enc.y = { field: feature.yKey };
    return enc;
}

// ---------------------------------------------------------------------------
// Channel: binds a field (or a constant) to a resolved scale, and knows how to
// encode a datum and (for invertible channels) invert a visual value to data.
// Used for the standalone / per-mark path (tests, self-contained marks). The
// engine's global path resolves scales via core/resolve.js and reads them by
// channel name, but Channels share the same scale objects and semantics.
// ---------------------------------------------------------------------------

/**
 * @param {string} name
 * @param {any} spec
 * @param {any[]} data
 * @param {{ width: number, height: number }} dims
 * @returns {any}
 */
function resolveChannel(name, spec, data, dims) {
    // Constant channel — no field, no scale. Subsumes today's static options
    // like `fill: "steelblue"`:  color: { value: "steelblue" }.
    if (spec.value !== undefined && spec.field === undefined) {
        return {
            name, field: undefined, constant: spec.value, invertible: false,
            encode: () => spec.value, invert: () => undefined
        };
    }

    const field = spec.field;
    const values = data.map((d) => d[field]);
    const type = spec.type || inferScaleType(name, values);
    const domain = spec.domain || inferDomainFromValues(type, values);
    const range = spec.range || channelRange(name, type, dims);
    const scale = createScale({ type, domain }, range);

    return {
        name, field, type, scale,
        invertible: scale ? scale.invertible : false,
        encode: (/** @type {any} */ datum) => (scale && field) ? scale.encode(datum[field]) : undefined,
        invert: (/** @type {any} */ visual) => scale ? scale.invertValue(visual) : undefined,
        domain: () => domain
    };
}

/**
 * Resolve a whole encoding map to { channelName: Channel } against one dataset.
 * @param {any} encoding
 * @param {any[]} data
 * @param {{ width: number, height: number }} dims
 * @returns {any}
 */
export function resolveEncoding(encoding = {}, data = [], dims = { width: 0, height: 0 }) {
    /** @type {Record<string, any>} */
    const resolved = {};
    for (const [name, spec] of Object.entries(encoding)) {
        resolved[name] = resolveChannel(name, spec, data, dims);
    }
    return resolved;
}

// ---------------------------------------------------------------------------
// Interaction primitives — the inverse direction (gesture/pointer -> data).
// ---------------------------------------------------------------------------

/**
 * Turn a pointer (x, y) into a partial datum via the positional channels. The
 * single primitive `create` shares — linear, band, and 1D (missing channel) all
 * work symmetrically, on either axis, with zero per-scale branching. `enc` is a
 * resolved-encoding or scale map exposing invertible + invert per channel.
 * @param {any} enc
 * @param {{ x?: number, y?: number }} pointer
 * @returns {any}
 */
export function datumFromPointer(enc, { x, y }) {
    /** @type {Record<string, any>} */
    const datum = {};
    for (const item of [['x', x], ['y', y]]) {
        const name = /** @type {string} */ (item[0]);
        const px = item[1];
        const ch = enc[name];
        if (ch && ch.invertible && ch.field && px !== undefined) {
            datum[ch.field] = ch.invert(px);
        }
    }
    return datum;
}

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
    switch (channelName) {
        case 'x': return pointer.x;
        case 'y': return pointer.y;
        case 'size': // radius = distance from centre -> a resize gesture
            return center ? Math.hypot(pointer.x - center.cx, pointer.y - center.cy) : undefined;
        default: return undefined; // channel isn't spatially adjustable this way
    }
}

/**
 * The discrete-select analogue of adjustDatum: set one channel's field on the
 * datum at `index` to `value` (a member of the channel's domain). This is the
 * shared core of every "channel editor" interaction — a legend swatch pick, a
 * click-to-cycle, a menu — which differ only in HOW they choose `value` and
 * `index`, not in how the write happens. That shared core is what makes those
 * editing layers interchangeable.
 * @param {any[]} data
 * @param {number | null} index
 * @param {string} field
 * @param {any} value
 * @returns {any[] | undefined}
 */
export function assignChannel(data, index, field, value) {
    if (index == null || index < 0 || field == null) return undefined;
    return data.map((d, i) => (i === index ? { ...d, [field]: value } : d));
}

/**
 * The generic "change" operation behind move / resize / 1D-placement: for each
 * target channel, turn the gesture into a visual value, invert it back to data,
 * and write it onto a copy of `datum`. `channels` is what makes one interactor
 * move (['x','y']), resize (['size']) or drag a bar (['y']).
 * @param {any} enc
 * @param {any} datum
 * @param {string[]} channels
 * @param {{ x: number, y: number }} pointer
 * @param {any} [center]
 * @returns {any}
 */
export function adjustDatum(enc, datum, channels, pointer, center) {
    const next = { ...datum };
    for (const name of channels) {
        const ch = enc[name];
        if (!ch || !ch.invertible || ch.field === undefined) continue;
        const visual = visualForChannel(name, pointer, center);
        if (visual === undefined) continue;
        next[ch.field] = ch.invert(visual);
    }
    return next;
}
