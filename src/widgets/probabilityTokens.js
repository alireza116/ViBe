// @ts-check
// probabilityTokens.js — discrete probability mass via stacked tokens.
// Plain-chart twin: dotStack + probe-create/remove + count.
//
// `create` runs under the `probe` driver (hover/drag shows a GHOST token in the bin
// under the cursor; a click or drag-release drops it for real), matching every other
// survey instrument and the documented "tentative token" example. `remove` stays a
// direct alt-click on an existing token.

import { dotStackY } from '../plot/index.js';
import { create, remove } from '../edit/index.js';
import { count } from '../constraints/index.js';
import { prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { bins?: string[], maxTokens?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function probabilityTokens(opts = {}) {
    const {
        question = 'Place tokens to express probability',
        bins = ['Low', 'Med', 'High'],
        maxTokens = 20,
        onChange,
        width = 420,
        height = 300,
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    return {
        width,
        height,
        theme,
        margins: { top: 40, right: 24, bottom: 36, left: 40 },
        schema: {
            bin: { type: 'categorical', domain: bins }
        },
        data: [],
        constraints: [count({ max: maxTokens, strategy: 'reject' })],
        onChange,
        guides: [prompt(question)],
        marks: [
            dotStackY({
                id: 'tokens',
                fill: t.widget.accent,
                channels: {
                    x: { field: 'bin' }
                },
                edits: [
                    // A tentative token: the ghost shows where it would drop; a click
                    // (or drag-release) commits. Alt-click removes an existing one.
                    create({ pick: 'probe', channels: ['x'], defaults: {}, advance: false, stage }),
                    remove({ pick: 'direct', stage })
                ]
            })
        ]
    };
}
