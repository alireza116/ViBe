// @ts-check
// samples.js — resolve a set of anchor positions on a domain axis. Mark-agnostic,
// used when authoring a line's points (newSeries seeding, sweep): "where along
// the domain do the anchors sit?" The default reads the scale's own ticks, so a
// drawn line lands on the same nice values an axis would show — even when no axis
// is rendered. Overridable with a count, explicit positions, or a time interval.
import * as d3 from 'd3';
import { isDiscrete } from './scales.js';

// Named time intervals -> d3 interval, for `{ every: 'month' }` on a time domain.
/** @type {Record<string, any>} */
const TIME_INTERVALS = {
    year: d3.timeYear,
    month: d3.timeMonth,
    week: d3.timeWeek,
    day: d3.timeDay,
    hour: d3.timeHour,
    minute: d3.timeMinute
};

/**
 * @param {any} scale a domain-axis scale (from createScale)
 * @param {number | any[] | { every?: string, count?: number } | undefined} samples
 * @returns {any[]} anchor values in DATA space (feed each through scale.encode to place)
 */
export function resolveSamples(scale, samples) {
    if (!scale) return [];

    // Categorical domain: the categories ARE the samples. Read the capability
    // flag, not `type` — an adopted d3.scaleBand() carries no type at all.
    if (isDiscrete(scale) || scale.kind === 'discrete') {
        return [...scale.domain()];
    }

    // Explicit positions.
    if (Array.isArray(samples)) return samples;

    // Fixed count -> evenly spaced across the (numeric/temporal) domain extent.
    if (typeof samples === 'number') return evenly(scale, samples);

    // Time interval -> ticks at that cadence.
    if (samples && typeof samples === 'object') {
        if (typeof samples.count === 'number') return evenly(scale, samples.count);
        if (samples.every && scale.temporal && TIME_INTERVALS[samples.every]
            && typeof scale.ticks === 'function') {
            return scale.ticks(TIME_INTERVALS[samples.every]);
        }
    }

    // Default: the scale's own ticks (nice values; time scales get date ticks).
    if (typeof scale.ticks === 'function') {
        const t = scale.ticks();
        if (t && t.length) return t;
    }
    return [...scale.domain()];
}

/**
 * N values evenly spaced across a numeric/temporal domain's extent (inclusive).
 * @param {any} scale
 * @param {number} n
 * @returns {any[]}
 */
function evenly(scale, n) {
    const domain = scale.domain();
    const lo = Number(domain[0]);
    const hi = Number(domain[domain.length - 1]);
    const isTime = !!scale.temporal;
    if (n <= 1) return [domain[0]];
    const out = [];
    for (let i = 0; i < n; i++) {
        const v = lo + ((hi - lo) * i) / (n - 1);
        out.push(isTime ? new Date(v) : v);
    }
    return out;
}
