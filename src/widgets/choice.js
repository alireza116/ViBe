// @ts-check
// choice.js — multiple choice as a survey instrument. Same rings as `likert`, but
// the answer is a set: `toggle` under the `probe` driver means hovering an option
// previews picking it (or un-picking it, if it is already yours) and the click
// commits that. `unique` blocks a double-pick of one option; `count` caps the total.
//
// Returns an ElicitSpec: Elicit(multipleChoice({ question, options, max })).

import { point } from '../plot/index.js';
import { toggle } from '../edit/index.js';
import { unique, count } from '../constraints/index.js';
import { optionRings, prompt, THEME } from './theme.js';

/**
 * @param {{ question?: string, options?: any[], max?: number, value?: any[],
 *   onChange?: (data: any[]) => void, width?: number, height?: number,
 *   stage?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function multipleChoice(opts = {}) {
    const {
        question,
        options = [],
        max = Infinity,
        value = [],
        onChange,
        width = 560,
        height = 130,
        stage
    } = opts;

    /** @type {any[]} */
    const constraints = [unique({ field: 'choice', strategy: 'reject' })];
    if (max !== Infinity) constraints.push(count({ max, strategy: 'reject' }));

    return {
        width,
        height,
        margins: { top: 34, right: 60, bottom: 44, left: 60 },
        x: { type: 'band', domain: options },
        // The elicited dataset: one row per pick.
        data: value.map((v) => ({ choice: v })),
        constraints,
        onChange,
        axes: false,
        guides: [prompt(question || ''), optionRings()],
        features: [
            point({
                id: 'choice',
                encoding: {
                    x: { field: 'choice', type: 'band', domain: options },
                    size: { value: THEME.radius - 3 },
                    fill: { value: THEME.accent }
                },
                // One gesture, both directions: click an empty option to pick it,
                // click a pick to take it back. The hover shows which it will be.
                edits: [toggle({ pick: 'probe', channels: ['x'], advance: false, stage })]
            })
        ]
    };
}
