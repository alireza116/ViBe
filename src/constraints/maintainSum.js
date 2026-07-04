// @ts-check
import { defineConstraint } from './define.js';

// maintainSum: keeps the total of a field at or below `targetSum` — a cross-datum
// data invariant.
//
// Rather than rejecting an overshoot (which would freeze the gesture), it bounds
// the value of the datum just touched so the total can rise only until it reaches
// `targetSum`: the user drags freely up to the remaining budget and stops there.
// `field` names the data field summed (default 'y'). Because this is a dataset
// invariant, it holds no matter which edit moved a value — a drag, a resize, or a
// create can't push the total past the target.

/**
 * @param {{ targetSum: number, field?: string }} options
 * @returns {import('../types').Constraint}
 */
export function maintainSum(options) {
    const { targetSum, field = 'y' } = options;

    return defineConstraint(
        ({ data, activeIndex, value }) => {
            if (activeIndex == null || value === undefined) return value;

            // Sum of every datum except the one just touched (by index, so ties on
            // the category key don't matter).
            const sumOthers = data.reduce(
                (sum, d, i) => (i === activeIndex ? sum : sum + (d[field] || 0)),
                0
            );
            const headroom = Math.max(0, targetSum - sumOthers);
            return Math.min(value, headroom);
        },
        { type: 'maintainSum', options: { targetSum }, field }
    );
}
