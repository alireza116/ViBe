// @ts-check
// resolve.js — the Observable Plot scale model for the engine.
//
// One scale per channel, GLOBAL to the plot, shared by every mark. Each mark is
// a channel producer (it declares field-per-channel via its encoding); the
// engine unions each channel's values across all marks to infer its domain, then
// builds one scale. Marks then read scales by channel name (scales.x, scales.color)
// and interactors invert through the same objects.
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
    channelRange
} from './encoding.js';

/**
 * Resolves global scales across features.
 * @param {any[]} features
 * @param {Record<string, any[]>} state
 * @param {import('../types').ElicitSpec} spec
 * @param {{ width: number, height: number }} dims
 * @returns {import('../types').ScaleMap}
 */
export function resolveScales(features, state, spec, dims) {
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

    // 1. Legacy top-level positional scale specs.
    /** @type {any} */
    const rawSpec = spec;
    for (const ch of ['x', 'y']) {
        if (rawSpec[ch]) {
            const a = ensure(ch);
            a.type = rawSpec[ch].type;
            a.domain = rawSpec[ch].domain;
            a.range = rawSpec[ch].range;
        }
    }

    // 2 + 3. Per-mark encodings: carry explicit sub-specs, gather values, and note
    // each mark's preferred categorical scale ('band' for bars, 'point' for dots).
    // When marks disagree on a shared categorical axis, 'band' wins — a bar needs
    // the interval, and a dot renders fine on a band (it just uses the centre).
    for (const feature of features) {
        const enc = normalizeEncoding(feature);
        const data = state[feature.id] || feature.data || [];
        const pref = feature.categoricalScale || 'band';
        for (const [ch, chSpec] of Object.entries(enc)) {
            const a = ensure(ch);
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

    // Build one scale per channel that is actually used.
    /** @type {import('../types').ScaleMap} */
    const scales = {};
    for (const [ch, a] of Object.entries(acc)) {
        const hasSpec = a.type != null || a.domain != null;
        const hasSchema = a.schema != null;
        const hasData = a.values.some((v) => v != null);
        // A schema-backed channel counts as used even with no data — this is what
        // lets an EMPTY chart resolve its scales (place marks, invert for create).
        if (!hasSpec && !hasSchema && !hasData) continue; // channel unused (e.g. 1D dropped axis)

        const catPref = a.catPref || 'band';
        // Precedence: explicit channel spec > schema declaration > data inference.
        const type = a.type
            || (a.schema ? measureToScaleType(ch, a.schema.type, catPref) : inferScaleType(ch, a.values, catPref));
        const domain = a.domain
            || (a.schema && a.schema.domain) || inferDomainFromValues(type, a.values);
        const range = a.range || channelRange(ch, type, dims);
        const scale = createScale({ type, domain }, range);
        if (scale) {
            scales[ch] = scale;
        }
    }

    return scales;
}

