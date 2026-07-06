// @ts-check
// pure math scale definitions to avoid tying the core directly to d3-scale if not needed,
// though we can use d3-scale under the hood for now.
import * as d3 from 'd3';

/**
 * Coerce a domain value to a Date for the `time` scale. Accepts Dates, epoch
 * numbers, and ISO/parseable date strings; leaves an already-Date untouched.
 * @param {any} v
 * @returns {Date}
 */
function toDate(v) {
    return v instanceof Date ? v : new Date(v);
}

/**
 * The single scale factory for every channel — positional (x/y) and beyond
 * (color, size, opacity). `range` is the channel's visual output range: pixels
 * for x/y, a radius interval for size, a palette or two-stop ramp for color.
 *   linear     -> continuous field   -> continuous output (pixel | radius | …)
 *   band       -> categorical field   -> an interval per category (bars: the band
 *                                        gives the bar its thickness)
 *   point      -> categorical field   -> a point per category (dots: a circle sits
 *                                        on the category's tick, no width)
 *   ordinal    -> discrete field      -> discrete output (category -> colour)
 *   sequential -> continuous field    -> continuous colour along a ramp
 *
 * band vs point is the categorical split that matters per MARK: a bar needs the
 * interval (bandwidth), a circle wants the tick. The mark declares which it wants
 * (`categoricalScale`) and the resolver picks accordingly; an explicit `type`
 * still overrides.
 * @param {any} spec
 * @param {any[]} range
 * @returns {import('../types').Scale | null}
 */
export function createScale(spec, range) {
    if (!spec) return null;

    const type = spec.type || 'linear';
    /** @type {any} */
    let scale;

    if (type === 'time') {
        // Temporal axis — continuous like linear, but over Dates. Domain values
        // may be Dates, epoch numbers, or date strings; coerce them.
        scale = d3.scaleTime().domain(spec.domain.map(toDate)).range(range);
    } else if (type === 'band') {
        scale = d3.scaleBand().domain(spec.domain).range(range).padding(0.1);
    } else if (type === 'point') {
        scale = d3.scalePoint().domain(spec.domain).range(range).padding(0.5);
    } else if (type === 'ordinal') {
        scale = d3.scaleOrdinal().domain(spec.domain).range(range);
    } else if (type === 'sequential') {
        // Callable ramp with the d3-scale shape downstream code expects.
        const [lo, hi] = [Math.min(...spec.domain), Math.max(...spec.domain)];
        const t = d3.scaleLinear().domain([lo, hi]).range([0, 1]).clamp(true);
        const ramp = d3.interpolateRgb(range[0], range[1]);
        scale = (/** @type {any} */ value) => ramp(t(value));
        scale.domain = () => spec.domain;
        scale.range = () => range;
    } else {
        scale = d3.scaleLinear().domain(spec.domain).range(range);
    }

    // Attach type metadata for interactors to validate
    scale.type = type;

    // Attach domain configuration for constraints to access easily
    scale.domainConfig = spec.domain;

    // Unified channel API. Every scale exposes the same pair, so marks and
    // interactors never branch on scale type:
    //   encode(value)      -> visual output (band center | linear pixel | colour | radius)
    //   invertValue(pixel) -> data value    (nearest category | clamped invert)
    // Only continuous/band scales are invertible; colour scales are not, so
    // `invertible` tells interactors which channels a gesture can drive.
    // These are the x/y special case of the general channel model in
    // core/encoding.js; positionOnScale/invertOnScale are the shared impl.
    scale.invertible = (type === 'linear' || type === 'time' || type === 'band' || type === 'point');
    scale.encode = (/** @type {any} */ value, /** @type {any} */ fallback) => positionOnScale(scale, value, fallback);
    scale.invertValue = scale.invertible ? (/** @type {any} */ pixel) => invertOnScale(scale, pixel) : () => undefined;

    return scale;
}

// --- Scale helpers shared by marks -----------------------------------------
// These let marks be composed across scale types (band vs linear) and axis
// orientations without special-casing each mark.

/**
 * @param {any} scale
 * @returns {boolean}
 */
export function isBand(scale) {
    return !!scale && scale.type === 'band';
}

/**
 * The min/max pixel bounds of a scale's (possibly reversed) range.
 * @param {any} scale
 * @returns {[number, number]}
 */
export function rangeExtent(scale) {
    const r = scale.range();
    return [Math.min(r[0], r[1]), Math.max(r[0], r[1])];
}

/**
 * Center pixel position of a value on a scale:
 *   band   -> band start + bandwidth/2 (the category's center)
 *   linear -> scale(value)
 *   missing scale (1D plots) -> the provided fallback (usually the range center)
 * @param {any} scale
 * @param {any} value
 * @param {any} [fallback]
 * @returns {any}
 */
export function positionOnScale(scale, value, fallback) {
    if (!scale) return fallback;
    if (scale.type === 'band') {
        const p = scale(value);
        return p == null ? fallback : p + scale.bandwidth() / 2;
    }
    if (scale.type === 'point') {
        // scalePoint already returns the tick position (no bandwidth to offset).
        const p = scale(value);
        return p == null ? fallback : p;
    }
    // Temporal: coerce the value to a Date so string/epoch data still positions.
    if (scale.type === 'time') return scale(toDate(value));
    return scale(value);
}

/**
 * Thickness a band occupies (bar width/height); fallback for non-band scales.
 * @param {any} scale
 * @param {any} [fallback]
 * @returns {any}
 */
export function bandwidthOf(scale, fallback) {
    return scale && scale.bandwidth ? scale.bandwidth() : fallback;
}

/**
 * Inverse of positionOnScale: map a pixel position back to a data value.
 * The mirror image of how marks are placed, so any scale a mark can be drawn
 * on is also a scale a mark can be created on.
 *   linear -> scale.invert(pixel), clamped into the domain
 *   band   -> the category whose band center is nearest the pixel (band scales
 *             have no invert(); we pick the closest category instead)
 *   missing scale (1D plots) -> undefined (that channel isn't positionable)
 * Returns undefined when the value can't be resolved (e.g. empty band domain).
 * @param {any} scale
 * @param {number} pixel
 * @returns {any}
 */
export function invertOnScale(scale, pixel) {
    if (!scale) return undefined;
    // Colour scales (ordinal/sequential) don't map a pixel back to data.
    if (scale.type !== 'band' && scale.type !== 'point' && scale.type !== 'linear' && scale.type !== 'time') return undefined;

    if (scale.type === 'band' || scale.type === 'point') {
        const domain = scale.domain();
        if (!domain.length) return undefined;
        // Categorical scales aren't invertible, so find the category whose center
        // is closest to the pixel. This mirrors positionOnScale: a band's center
        // is offset by half its bandwidth, a point's center is the tick itself.
        const half = scale.type === 'band' ? scale.bandwidth() / 2 : 0;
        let nearest = domain[0];
        let bestDist = Infinity;
        for (const category of domain) {
            const center = scale(category) + half;
            const dist = Math.abs(center - pixel);
            if (dist < bestDist) {
                bestDist = dist;
                nearest = category;
            }
        }
        return nearest;
    }

    // Continuous (linear | time) scale: invert then clamp into the (possibly
    // reversed) domain so created values never escape the axis. Time inverts to a
    // Date; clamp numerically on epoch ms and hand back a Date.
    const value = scale.invert(pixel);
    const domain = scale.domain();
    if (scale.type === 'time') {
        const lo = Math.min(...domain.map(Number));
        const hi = Math.max(...domain.map(Number));
        return new Date(Math.max(lo, Math.min(hi, Number(value))));
    }
    const lo = Math.min(...domain);
    const hi = Math.max(...domain);
    return Math.max(lo, Math.min(hi, value));
}

/**
 * Pixel baseline (value origin) of a value scale — where a bar starts from.
 * Uses 0 when in the domain, clamped into the range so bars never escape it.
 * @param {any} valueScale
 * @returns {number}
 */
export function baselineOf(valueScale) {
    const [lo, hi] = rangeExtent(valueScale);
    const zero = valueScale(0);
    return Math.max(lo, Math.min(hi, zero));
}

