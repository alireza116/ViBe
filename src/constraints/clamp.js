import { defineConstraint } from './define.js';

// clamp: restricts a field's value to a [min, max] range.
//
// A *limiting* constraint: the point being dragged follows the cursor but stops
// at `min` / `max`. When a bound is omitted, the field's scale domain is used.
// `field` (+ optional `channel` for the scale) names the field it governs; when
// omitted it falls back to the interaction's value axis (legacy).
export function clamp(options = {}) {
    const { min, max, field, channel } = options;

    return defineConstraint(
        ({ value, valueScale }) => {
            let lo = min;
            let hi = max;
            if (lo === undefined && valueScale && valueScale.domainConfig) lo = Math.min(...valueScale.domainConfig);
            if (hi === undefined && valueScale && valueScale.domainConfig) hi = Math.max(...valueScale.domainConfig);

            let v = value;
            if (lo !== undefined) v = Math.max(lo, v);
            if (hi !== undefined) v = Math.min(hi, v);
            return v;
        },
        { type: 'clamp', options: { min, max }, field, channel }
    );
}
