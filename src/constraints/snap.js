// @ts-check
import { defineConstraint } from './define.js';

// snap: quantizes a field's value to a discrete grid — a data invariant.
//
// The active datum's `field` is rounded to the nearest multiple of `step`,
// measured from `origin` (default 0). This is how a waffle picker lands on whole
// cells and a stepped slider lands on ticks: the gesture inverts to a continuous
// value in the edit's apply(), then this invariant snaps it — pure data, no
// pixels. `field` names the data field it governs (default 'y', the value axis).
//
// It draws no guide (the switch in edit/guide.js has no snap case); a snapped
// value is a cardinality-style rule whose boundaries aren't a single line.

/**
 * @param {{ step?: number, origin?: number, field?: string }} [options]
 * @returns {import('../types').Constraint}
 */
export function snap(options = {}) {
    const { step = 1, origin = 0, field = 'y' } = options;

    return defineConstraint(
        ({ value }) => {
            if (value === undefined || step <= 0) return value;
            return origin + Math.round((value - origin) / step) * step;
        },
        { type: 'snap', options: { step, origin }, field }
    );
}
