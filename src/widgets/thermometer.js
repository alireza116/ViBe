// @ts-check
// thermometer.js — single continuous value as a vertical bar (chart twin of slider).
// Plain-chart twin: barY + probe drag + snap/clamp.

import { barY } from '../plot/index.js';
import { drag } from '../edit/index.js';
import { clamp, snap } from '../constraints/index.js';
import { prompt } from './theme.js';
import { widgetTheme } from './shared.js';

/**
 * @param {import('../types').WidgetOptions & { domain?: [number, number], step?: number, value?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function thermometer(opts = {}) {
    const {
        question = 'Set the value',
        domain = [0, 100],
        step,
        value,
        onChange,
        width = 200,
        height = 320,
        stage,
        theme
    } = opts;
    const t = widgetTheme(theme);

    /** @type {any[]} */
    const constraints = [clamp({ min: domain[0], max: domain[1], field: 'value' })];
    if (step) constraints.push(snap({ field: 'value', step, origin: domain[0] }));

    return {
        width,
        height,
        theme,
        margins: { top: 40, right: 40, bottom: 36, left: 48 },
        schema: {
            cat: { type: 'categorical', domain: ['v'] },
            value: { type: 'quantitative', domain }
        },
        data: [{ cat: 'v', value: value != null ? value : domain[0] }],
        constraints,
        onChange,
        guides: [prompt(question)],
        features: [
            barY({
                id: 'thermo',
                fill: t.widget.accent,
                fillOpacity: 0.8,
                channels: {
                    x: { field: 'cat' },
                    y: { field: 'value' }
                },
                edits: [drag({ pick: 'probe', channels: ['y'], advance: false, guide: true, stage })]
            })
        ]
    };
}
