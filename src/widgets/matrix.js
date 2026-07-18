// @ts-check
// matrix.js — a question matrix (a grid of Likert rows) as a survey instrument.
// One chart: a band y of the questions crossed with a band x of the shared
// options. The cell grid, the column headers and the row labels are guides, so the
// grid reads as clickable area without ever capturing the gesture.
//
// `toggle` on the (x, y) tuple names a CELL: hovering previews the answer landing
// there, clicking commits it, and `unique({ field: 'question', strategy: 'replace' })`
// keeps exactly one answer per row — a second pick in a row replaces the first.
//
// Returns an ElicitSpec: Elicit(matrix({ questions, options })).

import { point } from '../plot/index.js';
import { toggle } from '../edit/index.js';
import { unique } from '../constraints/index.js';
import { cellGrid, prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { questions?: any[], options?: any[], value?: any[] }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function matrix(opts = {}) {
    const {
        question,
        questions = [],
        options = [],
        value = [],
        onChange,
        width = 620,
        height = 100 + questions.length * 46,
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    const margins = { top: 62, right: 30, bottom: 20, left: 130 };
    const innerHeight = height - margins.top - margins.bottom;

    return {
        width,
        height,
        theme,
        margins,
        // The contract of the elicited dataset: which option answers which question.
        schema: {
            option: { type: 'ordinal', domain: options },
            question: { type: 'categorical', domain: questions }
        },
        scales: {
            // A `point` would give each option a tick; the cell grid wants the
            // interval a band provides.
            x: { type: 'band' },
            // A y band defaults to the range [height, 0] (a value axis grows upward),
            // so the first question would sit at the BOTTOM. A questionnaire reads
            // top-down, so pin the range explicitly.
            y: { type: 'band', range: [0, innerHeight] }
        },
        // The elicited dataset: one row per answered question.
        data: value,
        // One answer per row: a pick elsewhere in the row replaces it.
        constraints: [unique({ field: 'question', strategy: 'replace' })],
        onChange,
        axes: false,
        guides: [prompt(question || '', { y: -38 }), cellGrid()],
        features: [
            point({
                id: 'matrix',
                size: t.widget.radius - 3,
                fill: t.widget.accent,
                channels: {
                    x: { field: 'option' },
                    y: { field: 'question' }
                },
                edits: [toggle({ pick: 'probe', channels: ['x', 'y'], advance: false, stage })]
            })
        ]
    };
}
