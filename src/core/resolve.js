// @ts-check
// resolve.js — the Observable Plot scale model for the engine.
//
// One scale per channel, GLOBAL to the plot, shared by every mark. Each mark is
// a channel producer (it declares field-per-channel via its encoding); the
// engine unions each channel's values across all marks to infer its domain, then
// builds one scale. Marks then read scales by channel name (scales.x, scales.color)
// and edits invert through the same objects.
//
// Precedence for a channel's scale spec:
//   1. Legacy top-level spec.x / spec.y            (explicit global positional scales)
//   2. An explicit type/domain/range on any mark's channel encoding
//   3. Inference from the union of that channel's data across marks
//
// A channel that no mark actually uses (no data, no spec) gets NO scale — this
// preserves 1D plots (drop y -> no y scale -> marks fall back to centre).

import { createScale } from './scales.js';
import {
    normalizeEncoding,
    inferScaleType,
    inferDomainFromValues,
    measureToScaleType,
    channelRange,
    axisOf
} from './encoding.js';

/**
 * Resolves global scales across features.
 * @param {any[]} features
 * @param {any[]} dataset the chart's one dataset (every mark is a view over it)
 * @param {import('../types').ElicitSpec} spec
 * @param {{ width: number, height: number }} dims
 * @returns {import('../types').ScaleMap}
 */
export function resolveScales(features, dataset, spec, dims) {
    // The dataset schema (field -> measurement type/domain/default). It is the
    // declared source of truth for a field's scale, ranked above data inference —
    // so a chart resolves its scales with ZERO data (see the skip guard below).
    /** @type {Record<string, import('../types').FieldSchema>} */
    const schema = (/** @type {any} */ (spec).schema) || {};

    // Accumulate, per channel: an explicit spec (type/domain/range), the field's
    // schema entry (if any), the mark's preferred categorical scale, and the flat
    // list of its values across all marks (for domain inference).
    /** @type {Record<string, { type?: import('../types').ScaleType, domain?: any[], range?: any[], catPref?: import('../types').ScaleType, schema?: import('../types').FieldSchema, values: any[] }>} */
    const acc = {};

    /** @param {string} ch */
    const ensure = (ch) => (acc[ch] || (acc[ch] = { values: [] }));

    // A channel's scale is keyed by the AXIS it shares, not its own literal name —
    // x1/x2 (span endpoints) union into the same bucket as x, y1/y2 into y, so they
    // share one inferred domain/range/scale instead of getting their own. Track
    // which raw channel names fed each bucket, so the built scale can be aliased
    // back onto every one of them below.
    /** @type {Record<string, Set<string>>} */
    const bucketMembers = {};
    /** @param {string} ch @returns {string} */
    const bucketOf = (ch) => {
        const bucket = axisOf(ch) || ch;
        (bucketMembers[bucket] || (bucketMembers[bucket] = new Set())).add(ch);
        return bucket;
    };

    // 1. Legacy top-level positional scale specs.
    /** @type {any} */
    const rawSpec = spec;
    for (const ch of ['x', 'y']) {
        if (rawSpec[ch]) {
            const a = ensure(bucketOf(ch));
            a.type = rawSpec[ch].type;
            a.domain = rawSpec[ch].domain;
            a.range = rawSpec[ch].range;
        }
    }

    // 2 + 3. Per-mark encodings: carry explicit sub-specs, gather values, and note
    // each mark's preferred categorical scale ('band' for bars, 'point' for dots).
    // When marks disagree on a shared categorical axis, 'band' wins — a bar needs
    // the interval, and a dot renders fine on a band (it just uses the centre).
    //
    // Every mark reads the SAME dataset, so several marks encoding one field push
    // its values into that channel's bucket more than once. Harmless:
    // inferDomainFromValues takes min/max for continuous and dedupes discrete.
    for (const feature of features) {
        const enc = normalizeEncoding(feature);
        const data = dataset;
        const pref = feature.categoricalScale || 'band';
        for (const [ch, chSpec] of Object.entries(enc)) {
            const a = ensure(bucketOf(ch));
            if (a.type == null && chSpec.type != null) a.type = chSpec.type;
            if (a.domain == null && chSpec.domain != null) a.domain = chSpec.domain;
            if (a.range == null && chSpec.range != null) a.range = chSpec.range;
            if (a.catPref !== 'band') a.catPref = pref;
            // The field's schema entry — the declared type/domain, ranked below an
            // explicit channel spec but above data inference (first field wins).
            if (a.schema == null && chSpec.field != null && schema[chSpec.field]) {
                a.schema = schema[chSpec.field];
            }
            if (chSpec.field != null) {
                for (const d of data) a.values.push(d[chSpec.field]);
            }
        }
    }

    // Build one scale per bucket that is actually used, then alias it onto every
    // raw channel name that fed the bucket (so scales.x1 === scales.x2 === scales.x).
    /** @type {import('../types').ScaleMap} */
    const scales = {};
    for (const [bucket, a] of Object.entries(acc)) {
        const hasSpec = a.type != null || a.domain != null;
        const hasSchema = a.schema != null;
        const hasData = a.values.some((v) => v != null);
        // A schema-backed channel counts as used even with no data — this is what
        // lets an EMPTY chart resolve its scales (place marks, invert for create).
        if (!hasSpec && !hasSchema && !hasData) continue; // channel unused (e.g. 1D dropped axis)

        const catPref = a.catPref || 'band';
        // Precedence: explicit channel spec > schema declaration > data inference.
        const type = a.type
            || (a.schema ? measureToScaleType(bucket, a.schema.type, catPref) : inferScaleType(bucket, a.values, catPref));
        const domain = a.domain
            || (a.schema && a.schema.domain) || inferDomainFromValues(type, a.values);
        const range = a.range || channelRange(bucket, type, dims);
        const scale = createScale({ type, domain }, range);
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

