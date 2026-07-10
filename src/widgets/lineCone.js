// @ts-check
// lineCone.js — the two-step correlation elicitation as a named instrument:
//
//   "What is the most likely relationship?"  -> the line follows the pointer,
//                                               a click sets it.
//   "What are the plausible alternatives?"   -> the cone opens with the pointer,
//                                               a click sets that too.
//
// It is `plot.cone` + two `rotate` edits on the `probe` driver, staged. Nothing
// else: stage 0 owns the angle, stage 1 owns the spread, and the driver's click
// commits the stage's field and advances — so once a field is set, its edit is
// gated off and the value is frozen, exactly as the original study instrument
// behaved.
//
// Read the answer at any point with container.getData('lineCone') →
// [{ r, spread }] where `r` is the correlation in [-1, 1] and `spread` is the
// half-width of the plausible envelope in the same units. `container.on('stage')`
// tells you which question the reader is on (2 = both answered).
//
// Returns an ElicitSpec: Elicit(lineCone({ x: 'Exercise', y: 'Body weight' })).

import { cone } from '../plot/index.js';
import { rotate } from '../edit/index.js';
import { crosshair, prompt } from './theme.js';

/**
 * @param {{ question?: string, x?: string, y?: string, r?: number, spread?: number,
 *   samples?: number, seed?: number, wedge?: boolean,
 *   onChange?: (data: any[]) => void, width?: number, height?: number }} [opts]
 * @returns {import('../types').ElicitSpec}
 */
export function lineCone(opts = {}) {
    const {
        question,
        x = 'x',
        y = 'y',
        r = 0,
        spread = 0,
        samples = 60,
        seed = 7,
        wedge = true,
        onChange,
        width = 460,
        height = 400
    } = opts;

    return {
        width,
        height,
        // Side margins hold the two-line x labels; the top margin stacks the prompt
        // above the "y (high)" label.
        margins: { top: 56, right: 92, bottom: 52, left: 92 },
        // The elicited dataset: the correlation and its envelope half-width.
        data: [{ r, spread }],
        onChange,
        axes: false,
        guides: [prompt(question || '', { y: -32 }), crosshair({ x, y })],
        features: [
            cone({
                id: 'lineCone',
                encoding: {
                    // Stage 0: the pointer's angle IS the correlation.
                    angle: {
                        field: 'r', type: 'linear', domain: [-1, 1], range: [-45, 45],
                        edit: rotate({ pick: 'probe', stage: 0 })
                    },
                    // Stage 1: the pointer's angular distance from the committed line
                    // is the envelope half-width — so the cone edge sits under the cursor.
                    spread: {
                        field: 'spread', type: 'linear', domain: [0, 1], range: [0, 45],
                        edit: rotate({ pick: 'probe', stage: 1, relativeTo: 'angle' })
                    }
                },
                samples,
                seed,
                wedge
            })
        ]
    };
}
