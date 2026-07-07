// @ts-check
// rule: a straight reference line across the plot at a value on one axis, built on
// the shared mark foundation like every other mark.
//
//   ruleY({ y: 50 })  -> horizontal line at y = 50 (spans the full width)
//   ruleX({ x: 30 })  -> vertical line at x = 30 (spans the full height)
//   rule({ y: 50 })   -> infers the axis from whichever of x / y is given
//
// Styleable through the standard surface (stroke, strokeWidth, opacity) plus a
// strokeDasharray passthrough. Data-bindable: pass `data` + an encoding on the
// value axis to draw one rule per datum (e.g. per-category thresholds). Reference
// lines are non-interactive (pointerEvents:'none').

import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

/**
 * @param {any} options
 * @param {'x' | 'y' | null} forcedValueAxis which axis carries the value
 * @returns {any}
 */
function buildRule(options, forcedValueAxis) {
    // Desugar style shorthands (stroke, strokeWidth, opacity) into the encoding so
    // a rule reads style the same way every mark does.
    const opts = normalizeMarkOptions(options);
    const { data = [], encoding = {}, id, strokeDasharray } = opts;
    // A scalar x / y option is the constant reference value (ruleY({ y: 50 })).
    const constValue = { x: opts.x, y: opts.y };

    // Which axis carries the value? Forced by ruleX/ruleY; else inferred from
    // whichever of x / y is provided (as a constant or an encoding).
    const valueAxis = forcedValueAxis
        || (encoding.x || constValue.x != null ? 'x' : 'y');

    return {
        id,
        data,
        encoding,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            /** @param {any} datum */
            const emit = (datum) => {
                // Value pixel: from the datum's encoded channel, else the constant.
                let at;
                if (encoding[valueAxis]) {
                    at = encodeChannel(scales, encoding, valueAxis, datum, undefined);
                } else {
                    const scale = /** @type {any} */ (scales[valueAxis]);
                    const v = constValue[valueAxis];
                    at = scale && v != null ? scale.encode(v, 0) : (v != null ? v : undefined);
                }
                if (at === undefined) return;

                const style = resolveStyle(scales, encoding, datum || {}, {
                    stroke: 'black', strokeWidth: 1
                });
                /** @type {import('../types').FeatureNode} */
                const node = {
                    type: 'line',
                    ...(valueAxis === 'y'
                        ? { x1: 0, x2: width, y1: at, y2: at }
                        : { x1: at, x2: at, y1: 0, y2: height }),
                    ...style,
                    pointerEvents: 'none' // reference lines don't capture events
                };
                if (strokeDasharray != null) node.strokeDasharray = strokeDasharray;
                nodes.push(node);
            };

            if (currentData.length) currentData.forEach(emit);
            else emit(null); // single constant reference line
            return nodes;
        }
    };
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function rule(options = {}) {
    return buildRule(options, null);
}

/**
 * A horizontal reference line at a y value (spans the full width).
 * @param {any} [options]
 * @returns {any}
 */
export function ruleY(options = {}) {
    return buildRule(options, 'y');
}

/**
 * A vertical reference line at an x value (spans the full height).
 * @param {any} [options]
 * @returns {any}
 */
export function ruleX(options = {}) {
    return buildRule(options, 'x');
}
