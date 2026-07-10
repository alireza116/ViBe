// @ts-check
// rule: a straight reference line across the plot at a value on one axis, built on
// the shared mark foundation like every other mark.
//
//   ruleY({ y: 50 })  -> horizontal line at y = 50 (spans the full width)
//   ruleX({ x: 30 })  -> vertical line at x = 30 (spans the full height)
//   rule({ y: 50 })   -> infers the axis from whichever of x / y is given
//
// SPAN mode (Observable Plot's ruleX/ruleY with y1/y2 or x1/x2): declaring a pair
// of endpoint channels draws a SEGMENT between them at the datum's category on the
// other axis, rather than a full-extent line — a lollipop stem or an error-bar
// whisker. It mirrors bar's span model (see bar.js): the endpoints resolve through
// encodeChannel exactly like bar's x1/x2·y1/y2, a missing endpoint defaults to the
// value-axis baseline (so `y2` alone spans baseline -> y2), and the perpendicular
// position comes from the category channel (band centre) via encodeChannel.
//
// Styleable through the standard surface (stroke, strokeWidth, opacity) plus a
// strokeDasharray passthrough. Data-bindable: pass `data` + an encoding on the
// value axis to draw one rule per datum (e.g. per-category thresholds). Reference
// lines are non-interactive (pointerEvents:'none').

import { baselineOf } from '../core/scales.js';
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
    const { encoding = {}, id, strokeDasharray } = opts;
    // A scalar x / y option is the constant reference value (ruleY({ y: 50 })).
    const constValue = { x: opts.x, y: opts.y };

    // Span mode: a pair of endpoint channels on one axis draws a segment between
    // them (a stem / whisker), positioned at the datum's category on the other.
    // Decided once per mark (not per datum), like bar's span. The presence of a
    // y1/y2 (or x1/x2) endpoint — distinct channel names from the reference-line
    // x/y — is the switch; a lone endpoint spans from the value-axis baseline.
    const hasYSpan = !!(encoding.y1 || encoding.y2);
    const hasXSpan = !!(encoding.x1 || encoding.x2);
    const spanAxis = hasYSpan ? 'y' : hasXSpan ? 'x' : null;

    // Which axis carries the value? Forced by ruleX/ruleY; else inferred from
    // whichever of x / y is provided (as a constant or an encoding).
    const valueAxis = forcedValueAxis
        || (encoding.x || constValue.x != null ? 'x' : 'y');

    return {
        id,
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
                // Span mode: a segment between two endpoints on spanAxis, at the
                // datum's category on the other axis. Endpoints resolve through
                // encodeChannel (like bar's span); a missing one falls to the
                // value-axis baseline, so `y2` alone spans baseline -> y2.
                if (spanAxis) {
                    const posAxis = spanAxis === 'y' ? 'x' : 'y';
                    const posLen = posAxis === 'x' ? width : height;
                    const baseline = baselineOf(scales[spanAxis]);
                    const [c1, c2] = spanAxis === 'y' ? ['y1', 'y2'] : ['x1', 'x2'];
                    const a = encoding[c1] ? encodeChannel(scales, encoding, c1, datum, baseline) : baseline;
                    const b = encoding[c2] ? encodeChannel(scales, encoding, c2, datum, baseline) : baseline;
                    if (a === undefined || b === undefined) return;
                    // Perpendicular position: the datum's category centre, else centre.
                    const posAt = encoding[posAxis]
                        ? encodeChannel(scales, encoding, posAxis, datum, posLen / 2)
                        : posLen / 2;
                    const spanStyle = resolveStyle(scales, encoding, datum || {}, {
                        stroke: 'black', strokeWidth: 1
                    });
                    /** @type {import('../types').FeatureNode} */
                    const spanNode = {
                        type: 'line',
                        ...(spanAxis === 'y'
                            ? { x1: posAt, x2: posAt, y1: a, y2: b }
                            : { x1: a, x2: b, y1: posAt, y2: posAt }),
                        ...spanStyle,
                        pointerEvents: 'none' // a stem/whisker is a non-interactive visual
                    };
                    if (strokeDasharray != null) spanNode.strokeDasharray = strokeDasharray;
                    nodes.push(spanNode);
                    return;
                }

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
