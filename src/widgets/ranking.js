// @ts-check
// ranking.js — drag-to-reorder items along a vertical rank axis.
// Plain-chart twin: point + text + edit.rank() on a point/band y scale.

import { point, text } from '../plot/index.js';
import { rank } from '../edit/index.js';
import { prompt, THEME } from './theme.js';

/**
 * @param {{ question?: string, items?: string[], onChange?: (data: any[]) => void,
 *   width?: number, height?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function ranking(opts = {}) {
    const {
        question = 'Rank these items',
        items = ['A', 'B', 'C', 'D'],
        onChange,
        width = 420,
        height = 280
    } = opts;

    const ranks = items.map((_, i) => i + 1);
    const data = items.map((item, i) => ({ item, rank: i + 1 }));

    return {
        width,
        height,
        margins: { top: 40, right: 24, bottom: 24, left: 100 },
        schema: {
            item: { type: 'categorical', domain: items },
            rank: { type: 'ordinal', domain: ranks }
        },
        data,
        onChange,
        axes: false,
        guides: [prompt(question)],
        features: [
            point({
                id: 'rank-dots',
                size: THEME.radius - 2,
                fill: THEME.accent,
                channels: {
                    x: { value: 40 },
                    y: { field: 'rank', edit: rank() }
                }
            }),
            text({
                id: 'rank-labels',
                fontSize: 13,
                fill: '#111',
                channels: {
                    x: { value: 56 },
                    y: { field: 'rank' },
                    text: { field: 'item' },
                    textAnchor: { value: 'start' }
                }
            })
        ]
    };
}
