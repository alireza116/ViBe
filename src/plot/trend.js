// @ts-check
// trend.js — an intercept-then-slope line glyph. A single datum { intercept,
// slope } is a belief about a linear relationship; the mark draws the line
// y = intercept + slope*x across the x domain plus two handles:
//   - an INTERCEPT handle at x = anchor (default the x-domain min): dragging it
//     translates the line vertically (holds slope), setting the value there.
//   - a SLOPE handle at x = probe (default the x-domain max): dragging it rotates
//     the line about the anchor point (holds the anchor's value), setting slope.
// Stage the two handles (interceptStage / slopeStage) to elicit intercept first,
// then slope — the "first pick the level, then pick the trend" flow.
//
//   Elicit({ data: [{ intercept: 0, slope: 1 }],
//            features: [ trend({ interceptStage: 0, slopeStage: 1 }) ] })
//   // with spec.x / spec.y (or a schema) establishing the plot's scales.
//
// The line is a non-interactive visual and each handle is a draggable circle
// tagged with a `channel` ('intercept' | 'slope'); the two edits are hoisted to
// the feature with a `when` that fires only on their own handle, so grabbing one
// never moves the other. Trend needs that arbitration because BOTH handles live on
// ONE feature over ONE datum, so a drag fans to both of its direct edits. (A glyph
// whose handles are separate marks — see `composite` — needs none of it: dispatch
// already routes a gesture to the touched node's own feature.)
// The drawn line's endpoints are DERIVED values (intercept + slope*x) resolved
// through the y scale's encode — the same class as baselineOf's valueScale(0),
// not a hand-rolled scale lookup of a field.

import { makeEdit } from '../edit/shared.js';
import { resolveStyle, normalizeMarkOptions } from './mark.js';

/**
 * @param {any} [options]
 * @returns {any}
 */
export function trend(options = {}) {
    const opts = normalizeMarkOptions(options);
    const {
        encoding = {},
        id,
        edits: userEdits,
        constraints,
        handleRadius = 6,
        interceptStage = null,
        slopeStage = null
    } = opts;

    // The two x positions the handles sit at, read from the x scale's domain (so
    // the mark needs no data to place them — a single-datum belief). Options
    // override either end. Shared by build() and the edits' apply().
    /** @param {import('../types').ScaleMap} scales */
    const anchorsOf = (scales) => {
        const dom = scales.x && /** @type {any} */ (scales.x).domainConfig;
        const x0 = Array.isArray(dom) ? Number(dom[0]) : 0;
        const x1 = Array.isArray(dom) ? Number(dom[dom.length - 1]) : 1;
        return {
            anchor: options.anchor != null ? options.anchor : x0,
            probe: options.probe != null ? options.probe : x1
        };
    };

    const interceptEdit = makeEdit({
        type: 'trendIntercept',
        gesture: 'drag',
        stage: interceptStage,
        when: (/** @type {import('../types').EditContext} */ ctx) =>
            !!ctx.node && ctx.node.channel === 'intercept',
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const yScale = ctx.scales.y;
            const d = ctx.datum;
            if (!yScale || !yScale.invertible || !d) return undefined;
            const { anchor } = anchorsOf(ctx.scales);
            // Translate: hold slope, place the anchor point at the pointer's y.
            const yv = yScale.invertValue(ctx.pointer.y);
            return { ...d, intercept: yv - (d.slope || 0) * anchor };
        }
    });

    const slopeEdit = makeEdit({
        type: 'trendSlope',
        gesture: 'drag',
        stage: slopeStage,
        when: (/** @type {import('../types').EditContext} */ ctx) =>
            !!ctx.node && ctx.node.channel === 'slope',
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const yScale = ctx.scales.y;
            const d = ctx.datum;
            if (!yScale || !yScale.invertible || !d) return undefined;
            const { anchor, probe } = anchorsOf(ctx.scales);
            if (probe === anchor) return undefined;
            // Rotate about the anchor point: hold its value, pass the line through
            // the pointer at x = probe. Recompute intercept so the anchor is fixed.
            const yAnchor = (d.intercept || 0) + (d.slope || 0) * anchor;
            const yv = yScale.invertValue(ctx.pointer.y);
            const slope = (yv - yAnchor) / (probe - anchor);
            return { ...d, slope, intercept: yAnchor - slope * anchor };
        }
    });

    return {
        id,
        encoding,
        constraints,
        edits: [interceptEdit, slopeEdit, ...(userEdits || [])],
        xKey: (encoding.x && encoding.x.field) || 'x',
        yKey: (encoding.y && encoding.y.field) || 'y',
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            const xScale = scales.x;
            const yScale = scales.y;
            if (!xScale || !yScale) return [];
            const dom = /** @type {any} */ (xScale).domainConfig;
            const x0 = Array.isArray(dom) ? Number(dom[0]) : 0;
            const x1 = Array.isArray(dom) ? Number(dom[dom.length - 1]) : 1;
            const { anchor, probe } = anchorsOf(scales);

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            currentData.forEach((/** @type {any} */ d, i) => {
                const a = Number(d.intercept) || 0;
                const b = Number(d.slope) || 0;
                const yOf = (/** @type {number} */ x) => a + b * x;
                const style = resolveStyle(scales, encoding, d, { stroke: '#333', fill: '#333' });

                // The fitted line spanning the x domain — derived values through the
                // y scale's encode (not a field lookup), non-interactive.
                nodes.push({
                    type: 'line',
                    x1: xScale.encode(x0), y1: yScale.encode(yOf(x0)),
                    x2: xScale.encode(x1), y2: yScale.encode(yOf(x1)),
                    stroke: style.stroke || '#333',
                    strokeWidth: style.strokeWidth || 2,
                    pointerEvents: 'none'
                });

                // The two draggable handles, tagged by channel for edit scoping.
                nodes.push({
                    type: 'circle',
                    cx: xScale.encode(anchor), cy: yScale.encode(yOf(anchor)),
                    r: handleRadius,
                    fill: style.fill || '#333',
                    data: d, index: i, channel: 'intercept'
                });
                nodes.push({
                    type: 'circle',
                    cx: xScale.encode(probe), cy: yScale.encode(yOf(probe)),
                    r: handleRadius,
                    fill: style.fill || '#333',
                    data: d, index: i, channel: 'slope'
                });
            });
            return nodes;
        }
    };
}
