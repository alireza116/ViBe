// @ts-check
// probabilityTokens.js — discrete probability mass via stacked tokens.
// Plain-chart twin: dotStack + create/remove + count.

import { dotStackY } from '../plot/index.js';
import { create, remove } from '../edit/index.js';
import { count } from '../constraints/index.js';
import { prompt, THEME } from './theme.js';

/**
 * @param {{ question?: string, bins?: string[], maxTokens?: number,
 *   onChange?: (data: any[]) => void, width?: number, height?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function probabilityTokens(opts = {}) {
    const {
        question = 'Place tokens to express probability',
        bins = ['Low', 'Med', 'High'],
        maxTokens = 20,
        onChange,
        width = 420,
        height = 300
    } = opts;

    return {
        width,
        height,
        margins: { top: 40, right: 24, bottom: 36, left: 40 },
        schema: {
            bin: { type: 'categorical', domain: bins }
        },
        data: [],
        constraints: [count({ max: maxTokens, strategy: 'reject' })],
        onChange,
        guides: [prompt(question)],
        features: [
            dotStackY({
                id: 'tokens',
                fill: THEME.accent,
                channels: {
                    x: { field: 'bin' }
                },
                edits: [
                    create({ channels: ['x'], defaults: {} }),
                    remove({ pick: 'direct' })
                ]
            })
        ]
    };
}
