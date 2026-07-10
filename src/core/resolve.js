// @ts-check
// resolve.js — the Observable Plot scale model for the engine.
//
// One scale per channel, GLOBAL to the plot, shared by every mark. Each mark is
// a channel producer (it declares field-per-channel via its `channels` map); the
// engine unions each channel's fields across all marks, asks the schema what they
// are, and builds one scale. Marks then read scales by channel name (scales.x,
// scales.fill) and edits invert through the same objects.
//
// ── Who owns what ───────────────────────────────────────────────────────────
// The SCHEMA owns a field's data type and DOMAIN — they are properties of the
// data, not of a mark's view of it. A mark owns only which field lands on which
// channel, and (rarely) how that channel draws it:
//
//   measure (data type):  channel `type` > schema `type` > inference from values
//   scale (how to draw):  spec.scales[ch] > channel `scale` > scaleTypeFor(...)
//   domain:               the UNION of the schema domains of every field on the
//                         axis, else inferred from the union of their values
//
// The domain union is load-bearing: an error bar puts `mean`, `lo` and `hi` on y,
// and the axis must span all three. Reading one field's domain and discarding the
// rest is what forced charts to hand-write a chart-level y domain.

import { createScale, adoptScale } from './scales.js';
import {
    normalizeChannels,
    inferMeasureType,
    inferDomainFromValues,
    unionDomains,
    scaleTypeFor,
    channelRange,
    axisOf
} from './encoding.js';

const DEV = !!(import.meta.env && import.meta.env.DEV);

// Scales re-resolve on every render, so a dev warning would repeat forever. Warn
// once per offending field/channel, the way elicit.js's guards do.
/** @type {Set<string>} */
const warnedOnce = new Set();
/** @param {string} key @param {string} message */
function warnOnce(key, message) {
    if (warnedOnce.has(key)) return;
    warnedOnce.add(key);
    console.warn(message);
}

/**
 * Bring the three forms a `scale` option can take to one shape.
 *   'log'                          -> { type: 'log' }
 *   { type: 'sqrt', range: [...] } -> itself
 *   d3.scaleBand().padding(0.3)    -> { instance }
 * @param {any} opt
 * @returns {{ type?: import('../types').ScaleType, range?: any[], instance?: any, [k: string]: any }}
 */
function normalizeScaleOption(opt) {
    if (opt == null) return {};
    if (typeof opt === 'function') return { instance: opt };
    if (typeof opt === 'string') return { type: /** @type {import('../types').ScaleType} */ (opt) };
    return opt;
}

/**
 * Resolves global scales across features.
 * @param {any[]} features
 * @param {any[]} dataset the chart's one dataset (every mark is a view over it)
 * @param {import('../types').ElicitSpec} spec
 * @param {{ width: number, height: number }} dims
 * @returns {import('../types').ScaleMap}
 */
export function resolveScales(features, dataset, spec, dims) {
    /** @type {Record<string, import('../types').FieldSchema>} */
    const schema = spec.schema || {};
    /** @type {Record<string, import('../types').ScaleSpec>} */
    const chartScales = spec.scales || {};

    // Accumulate, per channel: the fields feeding it (in first-seen order), any
    // explicit data type or scale option, the mark's preferred discrete scale, and
    // the flat list of values across all marks (for inference).
    /** @type {Record<string, { fields: string[], measure?: any, scaleOpt?: any, discretePref?: any, values: any[] }>} */
    const acc = {};

    /** @param {string} ch */
    const ensure = (ch) => (acc[ch] || (acc[ch] = { fields: [], values: [] }));

    // A channel's scale is keyed by the AXIS it shares, not its own literal name —
    // x1/x2 (span endpoints) union into the same bucket as x, y1/y2 into y, so they
    // share one domain/range/scale instead of getting their own. Track which raw
    // channel names fed each bucket, so the built scale can be aliased back onto
    // every one of them below.
    /** @type {Record<string, Set<string>>} */
    const bucketMembers = {};
    /** @param {string} ch @returns {string} */
    const bucketOf = (ch) => {
        const bucket = axisOf(ch) || ch;
        (bucketMembers[bucket] || (bucketMembers[bucket] = new Set())).add(ch);
        return bucket;
    };

    // Every mark reads the SAME dataset, so several marks encoding one field push
    // its values into that channel's bucket more than once. Harmless:
    // inferDomainFromValues takes min/max for continuous and dedupes discrete.
    for (const feature of features) {
        const channels = normalizeChannels(feature);
        // Which concrete scale this mark wants for discrete data. When marks
        // disagree on a shared axis, 'band' wins — a bar needs the interval, and a
        // dot renders fine on a band (it just uses the centre).
        const pref = feature.discreteScale || 'band';
        for (const [ch, chSpec] of Object.entries(channels)) {
            if (!chSpec) continue;
            // `scale: null` reads the field raw (the datum holds a literal colour /
            // pixel). No scale to build, so it contributes nothing — and needs no
            // schema entry.
            if (chSpec.scale === null) continue;

            const a = ensure(bucketOf(ch));
            if (a.measure == null && chSpec.type != null) a.measure = chSpec.type;
            if (a.scaleOpt == null && chSpec.scale != null) a.scaleOpt = chSpec.scale;
            if (a.discretePref !== 'band') a.discretePref = pref;

            if (chSpec.field != null) {
                if (!a.fields.includes(chSpec.field)) a.fields.push(chSpec.field);
                for (const d of dataset) a.values.push(d[chSpec.field]);
            } else if (chSpec.datum !== undefined) {
                // A data-space constant still needs the axis to exist and to span it.
                a.values.push(chSpec.datum);
            }
        }
    }

    // Build one scale per bucket that is actually used, then alias it onto every
    // raw channel name that fed the bucket (so scales.x1 === scales.x2 === scales.x).
    /** @type {import('../types').ScaleMap} */
    const scales = {};
    for (const [bucket, a] of Object.entries(acc)) {
        const hasData = a.values.some((v) => v != null);
        // A constant-only channel (`fill: { value: 'red' }`, `size: 9`) declares no
        // field and no datum — there is nothing to scale. Leave it unresolved; a
        // 1D plot with a dropped axis relies on this too (marks fall back to centre).
        if (!a.fields.length && !hasData) continue;

        const entries = a.fields.map((f) => schema[f]).filter(Boolean);
        if (DEV) {
            for (const f of a.fields) {
                if (schema[f]) continue;
                warnOnce(`schema:${f}:${bucket}`,
                    `[vibe] field "${f}" is encoded on channel "${bucket}" but not declared in ` +
                    `schema; inferring its type and domain from data. Declare it in the Elicit ` +
                    `spec's schema — the schema is the contract of the elicited dataset.`);
            }
        }
        if (!entries.length && !hasData) {
            throw new Error(
                `[vibe] cannot resolve a scale for channel "${bucket}": field(s) ` +
                `${a.fields.map((f) => `"${f}"`).join(', ')} have no schema entry and there is no data ` +
                `to infer from. Declare them in the Elicit spec's schema.`
            );
        }

        const opt = { ...normalizeScaleOption(a.scaleOpt), ...normalizeScaleOption(chartScales[bucket]) };

        // 1. What the data IS. An explicit channel type overrides the schema, which
        //    overrides inference. Fields sharing an axis must agree.
        const declared = entries.map((e) => e.type).filter(Boolean);
        if (DEV && new Set(declared).size > 1) {
            warnOnce(`measure:${bucket}`,
                `[vibe] fields ${a.fields.map((f) => `"${f}"`).join(', ')} share channel "${bucket}" ` +
                `but declare different schema types (${[...new Set(declared)].join(', ')}). ` +
                `Using "${declared[0]}".`);
        }
        /** @type {import('../types').MeasureType} */
        const measure = a.measure || declared[0] || inferMeasureType(a.values);

        // 2. How this channel DRAWS it.
        /** @type {import('../types').ScaleType} */
        const type = opt.type || scaleTypeFor(bucket, measure, a.discretePref || 'band');

        // 3. The domain, unioned across every field on the axis (the schema owns it).
        /** @type {any[][]} */
        const declaredDomains = [];
        for (const e of entries) if (e.domain) declaredDomains.push(e.domain);
        const domain = unionDomains(measure, declaredDomains)
            || inferDomainFromValues(type, a.values);

        const positional = !!axisOf(bucket);
        const range = opt.range || channelRange(bucket, type, dims);

        // A scale the author built themselves is adopted as-is: we only sniff its
        // capabilities and hand it the pixel range if it's positional and named none.
        const scale = opt.instance
            ? adoptScale(opt.instance, { range: opt.range ? undefined : range, positional, domain })
            : createScale({ ...opt, type, domain }, range);

        if (scale) {
            // Always alias onto the bucket key itself (e.g. 'x'), even when only
            // x1/x2 were declared and 'x' was never literally used as a channel —
            // baselineOf/bandwidthOf and other axis-keyed lookups expect scales.x
            // to exist whenever any x-axis channel is in play.
            scales[bucket] = scale;
            for (const name of (bucketMembers[bucket] || [])) scales[name] = scale;
        }
    }

    return scales;
}
