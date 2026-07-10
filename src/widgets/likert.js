// @ts-check
// likert.js — a Likert scale as a survey instrument. Opinionated styling, but no
// new machinery: a `point` on a band of the response options, `create` under the
// `probe` driver (the answer follows the pointer, a click sets it), and
// `count({ max: 1, strategy: 'replace' })` to keep exactly one. The survey look —
// option rings, a track, labels under each ring — is the guide layer (theme.js).
//
// Returns an ElicitSpec: Elicit(likert({ question, options })).
//
// The plain-chart equivalent is the same mark + edit + constraint with the default
// axes instead of the ring guides; see docs/widgets.html.

import { point } from '../plot/index.js';
import { create } from '../edit/index.js';
import { count } from '../constraints/index.js';
import { optionRings, prompt, THEME } from './theme.js';

/**
 * @param {{ question?: string, options?: any[], value?: any,
 *   onChange?: (data: any[]) => void, width?: number, height?: number,
 *   stage?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function likert(opts = {}) {
    const {
        question,
        options = [],
        value,
        onChange,
        width = 560,
        height = 130,
        stage
    } = opts;

    return {
        width,
        height,
        margins: { top: 34, right: 60, bottom: 44, left: 60 },
        x: { type: 'band', domain: options },
        // The elicited dataset: the one answer, or no rows until the first click.
        data: value != null ? [{ choice: value }] : [],
        // Each click appends; count trims back to the single newest point.
        constraints: [count({ max: 1, strategy: 'replace' })],
        onChange,
        // The instrument draws its own scale (rings + labels); no chart axes.
        axes: false,
        guides: [prompt(question || ''), optionRings()],
        features: [
            point({
                id: 'likert',
                encoding: {
                    x: { field: 'choice', type: 'band', domain: options },
                    size: { value: THEME.radius - 3 },
                    fill: { value: THEME.accent }
                },
                edits: [
                    // Hover previews the answer in the ring under the cursor; the
                    // click commits it. `advance: false` — a Likert has one stage,
                    // and re-clicking simply moves the answer.
                    create({ pick: 'probe', channels: ['x'], advance: false, stage })
                ]
            })
        ]
    };
}
