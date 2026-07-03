// @ts-check
// defineConstraint: the abstract base every constraint is built on, and the
// extension point for user-authored constraints.
//
// The core runs constraints as `(newData, oldData, context) => false | true |
// newData`. That contract is powerful but repetitive to author: you always have
// to locate the datum being interacted with, map over the array, and return a
// new one. `defineConstraint` factors that plumbing out so an author only writes
// the *rule* against a clean context, and returns a value in whatever shape is
// most natural:
//
//   number  -> the constrained value for the active datum's y-field
//   object  -> fields merged into the active datum (e.g. constrain x and y)
//   array   -> a full replacement dataset (for cross-datum rules)
//   false   -> reject the whole interaction
//   true /
//   undefined -> accept unchanged
//
// The reducer receives:
//   { data, oldData, scales, xKey, yKey, nodeData, index, active, activeX, value }
// where `active` is the datum being interacted with, `value` is its y-field, and
// `data` is the proposed dataset (with the interaction already applied).
//
// Example — a custom "snap to nearest 5" constraint:
//   const snap5 = vibe.constraints.define(({ value }) => Math.round(value / 5) * 5);
//
// `meta` may carry { type, options } for guide introspection, and/or a
// `guide(ctx)` function so a custom constraint can draw its own visual guide.

/**
 * Creates a constraint.
 * @param {(ctx: import('../types').ConstraintContext) => any} reducer
 * @param {any} [meta]
 * @returns {import('../types').Constraint}
 */
export function defineConstraint(reducer, meta = {}) {
    /** @type {import('../types').Constraint} */
    const constraint = (newData, oldData, context) => {
        const xKey = context.xKey || 'x';
        const yKey = context.yKey || 'y';
        // Which field this constraint governs. Precedence:
        //   1. the constraint's OWN `field` (explicit — same meaning no matter
        //      which edit runs; this is what prevents a sum-on-y constraint from
        //      silently acting on the size field during a resize)
        //   2. the interaction's valueKey (legacy implicit binding)
        //   3. the y field (default)
        const valueKey = meta.field || context.valueKey || yKey;
        // Prefer the scale of the constraint's own channel when named.
        const ownScale = meta.channel && context.scales && context.scales[meta.channel];
        const valueScale = ownScale || context.valueScale || (context.scales && context.scales.y);
        const nodeData = context.nodeData;

        // Locate the active datum in the proposed dataset: prefer the explicit
        // index (set by mark/plane interactors), else match by x-accessor.
        let index = context.nodeIndex;
        let active = (index != null && index >= 0) ? newData[index] : undefined;
        if (active === undefined && nodeData !== undefined) {
            index = newData.findIndex(d => d[xKey] === nodeData[xKey]);
            active = index >= 0 ? newData[index] : undefined;
        }

        const ctx = {
            data: newData,
            oldData,
            scales: context.scales,
            xKey,
            yKey,
            valueKey,
            valueScale,
            nodeData,
            index,
            active,
            activeX: active ? active[xKey] : (nodeData ? nodeData[xKey] : undefined),
            value: active ? active[valueKey] : undefined,
            pointer: context.pointer,
            node: context.node,
            event: context.event,
            channels: context.channels,
            encoding: context.encoding
        };

        const result = reducer(ctx);

        // Pass-through control values.
        if (result === false || result === true || result === undefined) return result;
        // A full dataset.
        if (Array.isArray(result)) return result;

        const hasActive = active !== undefined && index != null && index >= 0;

        // A constrained scalar for the active datum's value field.
        if (typeof result === 'number') {
            if (!hasActive) return newData; // nothing to apply it to
            return newData.map((d, i) => (i === index ? { ...d, [valueKey]: result } : d));
        }
        // A partial datum merged into the active datum (e.g. constrain x and y).
        if (result && typeof result === 'object') {
            if (!hasActive) return newData;
            return newData.map((d, i) => (i === index ? { ...d, ...result } : d));
        }

        return newData;
    };

    // Metadata for guides (vibe.guides.constraints).
    constraint.constraintType = meta.type;
    constraint.options = meta.options;
    if (typeof meta.guide === 'function') constraint.guide = meta.guide;

    return constraint;
}

