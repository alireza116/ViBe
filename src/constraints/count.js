import { defineConstraint } from './define.js';

// count: a dataset *cardinality* constraint — keeps the number of data elements
// within `max`. Like maintainSum it is a whole-dataset (cross-datum) rule, so it
// returns a full dataset and composes in the constraint pipeline.
//
// When an interaction pushes the count over the limit:
//   strategy 'replace' (default) -> keep the newest `max` (drop the oldest)
//   strategy 'reject'            -> refuse the interaction entirely
//
// A Likert "one point on the scale" is just count({ max: 1 }): each create
// appends, then this trims back to the single newest point (a place-to-replace).
// count({ max: 5 }) gives "pick your top five", etc.
export function count(options = {}) {
    const { max = Infinity, strategy = 'replace' } = options;

    return defineConstraint(
        ({ data }) => {
            if (data.length <= max) return undefined;      // within budget: accept as-is
            if (strategy === 'reject') return false;       // refuse the whole interaction
            return data.slice(data.length - max);          // keep the newest `max`
        },
        { type: 'count', options: { max, strategy } }
    );
}
