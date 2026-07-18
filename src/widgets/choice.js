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
import { optionRings, prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { options?: any[], max?: number, value?: any[] }} [opts]
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
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    /** @type {any[]} */
    const constraints = [unique({ field: 'choice', strategy: 'reject' })];
    if (max !== Infinity) constraints.push(count({ max, strategy: 'reject' }));

    return {
        width,
        height,
        theme,
        margins: { top: 34, right: 60, bottom: 44, left: 60 },
        // The contract of the elicited dataset: one categorical pick per row.
        schema: { choice: { type: 'categorical', domain: options } },
        // A `point` would give each option a tick; the rings want the interval a
        // band provides, so the chart overrides the mark's preference.
        scales: { x: { type: 'band' } },
        // The elicited dataset: one row per pick.
        data: value.map((v) => ({ choice: v })),
        constraints,
        onChange,
        axes: false,
        guides: [prompt(question || ''), optionRings()],
        features: [
            point({
                id: 'choice',
                size: t.widget.radius - 3,
                fill: t.widget.accent,
                channels: {
                    x: { field: 'choice' }
                },
                // One gesture, both directions: click an empty option to pick it,
                // click a pick to take it back. The hover shows which it will be.
                edits: [toggle({ pick: 'probe', channels: ['x'], advance: false, stage })]
            })
        ]
    };
}
