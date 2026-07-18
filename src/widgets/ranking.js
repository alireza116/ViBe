// @ts-check
// ranking.js — drag-to-reorder items along a vertical rank axis.
// Plain-chart twin: point + text + edit.rank() on a point/band y scale.

import { point, text } from '../plot/index.js';
import { rank } from '../edit/index.js';
import { prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { items?: string[] }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function ranking(opts = {}) {
    const {
        question = 'Rank these items',
        items = ['A', 'B', 'C', 'D'],
        onChange,
        width = 420,
        height = 280,
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    const ranks = items.map((_, i) => i + 1);
    const data = items.map((item, i) => ({ item, rank: i + 1 }));

    return {
        width,
        height,
        theme,
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
                size: t.widget.radius - 2,
                fill: t.widget.accent,
                channels: {
                    x: { value: 40 },
                    y: { field: 'rank', edit: rank({ stage }) }
                }
            }),
            text({
                id: 'rank-labels',
                fontSize: 13,
                fill: t.widget.label,
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
