import { defineConstraint } from './define.js';

// maintainSum: keeps the total of all values at or below `targetSum`.
//
// A *limiting* constraint (cross-datum): rather than rejecting an overshoot
// (which freezes the drag), it bounds the value of the datum being dragged so
// the total can rise only until it reaches `targetSum`. The user can drag freely
// up to the remaining "budget" and is stopped there.
// `field` (and optional `channel` for its scale) names the field summed. When
// omitted it falls back to the interaction's value axis (legacy). Naming it makes
// the constraint mean the same field no matter which edit runs it.
export function maintainSum(options = {}) {
    const { targetSum, field, channel } = options;

    return defineConstraint(
        ({ data, value, activeX, xKey, valueKey }) => {
            if (activeX === undefined) return value;

            // Sum of every datum except the one being dragged. `valueKey` resolves
            // to the constraint's own `field` when set, so this always sums the
            // intended field regardless of which edit invoked it.
            const sumOthers = data.reduce(
                (sum, d) => (d[xKey] === activeX ? sum : sum + d[valueKey]),
                0
            );
            const headroom = Math.max(0, targetSum - sumOthers);
            return Math.min(value, headroom);
        },
        { type: 'maintainSum', options: { targetSum }, field, channel }
    );
}
