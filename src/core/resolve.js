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
    channelRange
} from './encoding.js';

export function resolveScales(features, state, spec, dims) {
    // Accumulate, per channel: an explicit spec (type/domain/range) and the flat
    // list of its values across all marks (for domain inference).
    const acc = {};
    const ensure = (ch) => (acc[ch] || (acc[ch] = { values: [] }));

    // 1. Legacy top-level positional scale specs.
    for (const ch of ['x', 'y']) {
        if (spec[ch]) {
            const a = ensure(ch);
            a.type = spec[ch].type;
            a.domain = spec[ch].domain;
            a.range = spec[ch].range;
        }
    }

    // 2 + 3. Per-mark encodings: carry explicit sub-specs, gather values.
    for (const feature of features) {
        const enc = normalizeEncoding(feature);
        const data = state[feature.id] || feature.data || [];
        for (const [ch, chSpec] of Object.entries(enc)) {
            const a = ensure(ch);
            if (a.type == null && chSpec.type != null) a.type = chSpec.type;
            if (a.domain == null && chSpec.domain != null) a.domain = chSpec.domain;
            if (a.range == null && chSpec.range != null) a.range = chSpec.range;
            if (chSpec.field != null) {
                for (const d of data) a.values.push(d[chSpec.field]);
            }
        }
    }

    // Build one scale per channel that is actually used.
    const scales = {};
    for (const [ch, a] of Object.entries(acc)) {
        const hasSpec = a.type != null || a.domain != null;
        const hasData = a.values.some((v) => v != null);
        if (!hasSpec && !hasData) continue; // channel unused (e.g. 1D dropped axis)

        const type = a.type || inferScaleType(ch, a.values);
        const domain = a.domain || inferDomainFromValues(type, a.values);
        const range = a.range || channelRange(ch, type, dims);
        scales[ch] = createScale({ type, domain }, range);
    }

    return scales;
}
