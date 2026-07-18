// @ts-check
// likert.js — a Likert scale as a survey instrument. Opinionated styling, but no
// new machinery: a `point` on a band of the response options, `create` under the
// `probe` driver (the answer follows the pointer, a click sets it), and
// `count({ max: 1, strategy: 'replace' })` to keep exactly one. The survey look —
// option rings, a track, labels under each ring — is the guide layer (theme.js).
//
// Returns an ElicitSpec: Elicit(likert({ question, options })).
//
// The plain-API twin is the same mark + edit + constraint + guides; see
// docs/widgets.html — expand the widget to customize.

import { point } from '../plot/index.js';
import { create } from '../edit/index.js';
import { count } from '../constraints/index.js';
import { optionRings, prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { options?: any[], value?: any }} [opts]
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
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    return {
        width,
        height,
        theme,
        margins: { top: 34, right: 60, bottom: 44, left: 60 },
        // The contract of the elicited dataset. `ordinal`, not `categorical`: a
        // Likert's options run from one pole to the other, so the domain's order is
        // meaningful. The schema is what lets the scales resolve with zero rows.
        schema: { choice: { type: 'ordinal', domain: options } },
        // A `point` would give each option a tick; the rings want the interval a
        // band provides, so the chart overrides the mark's preference.
        scales: { x: { type: 'band' } },
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
                size: t.widget.radius - 3,
                fill: t.widget.accent,
                channels: {
                    x: { field: 'choice' }
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
