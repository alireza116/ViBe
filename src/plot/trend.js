// @ts-check
// trend.js — an intercept-then-slope line glyph. A single datum { intercept,
// slope } is a belief about a linear relationship; the mark draws the line
// y = intercept + slope*x across the plot (clipped to the plot rectangle) plus
// two handles:
//   - an INTERCEPT handle at x = anchor (default 0 when that lies in the x
//     domain, else the domain min): dragging it translates the line vertically
//     (holds slope), setting the value there — the classic y-intercept when
//     anchor is 0.
//   - a SLOPE handle at x = probe (default the x-domain max): dragging it rotates
//     the line about the anchor point (holds the anchor's value), setting slope.
// Stage the two handles (interceptStage / slopeStage) to elicit intercept first,
// then slope — the "first pick the level, then pick the trend" flow.
//
//   Elicit({ schema: { x: { type: 'quantitative', domain: [-10, 10] },
//                      y: { type: 'quantitative', domain: [-10, 10] },
//                      intercept: {}, slope: {} },
//            data: [{ intercept: 0, slope: 1 }],
//            features: [ trend({ interceptStage: 0, slopeStage: 1 }) ] })
//
// Trend is the one mark whose positional channels name the plot's AXES rather than
// fields of its datum: the belief is about the relationship between x and y, while
// the datum stores the two parameters of the line. So `x`/`y` default to the fields
// of the same name, and the schema supplies their domains — the line's endpoints
// and the two handles are then derived from that coordinate space.
//
// By default (when the chart leaves `axes` unspecified), autoAxes detects a trend
// and crosses the axes at the origin — the natural frame for intercept + slope.
//
// The line is a non-interactive visual and each handle is a draggable circle
// tagged with a `channel` ('intercept' | 'slope'); the two edits are hoisted to
// the feature with a `when` that fires only on their own handle, so grabbing one
// never moves the other. Trend needs that arbitration because BOTH handles live on
// ONE feature over ONE datum, so a drag fans to both of its direct edits. (A glyph
// whose handles are separate marks — see `composite` — needs none of it: dispatch
// already routes a gesture to the touched node's own feature.)
// The drawn line is the infinite y = a + b·x clipped to the plot rectangle —
// derived values through the y scale's encode, not a hand-rolled field lookup.

import { makeEdit } from '../edit/shared.js';
import { resolveStyle, normalizeMarkOptions, markDefaults } from './mark.js';

/**
 * Clip an infinite line through (x1,y1)-(x2,y2) to the plot rectangle [0,w]×[0,h].
 * Returns the clipped segment, or null if it misses the plot entirely.
 * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
 * @param {number} w @param {number} h
 * @returns {{ x1: number, y1: number, x2: number, y2: number } | null}
 */
function clipLineToPlot(x1, y1, x2, y2, w, h) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Degenerate: a point. Keep it only if it sits inside the plot.
    if (dx === 0 && dy === 0) {
        if (x1 < 0 || x1 > w || y1 < 0 || y1 > h) return null;
        return { x1, y1, x2, y2 };
    }

    // Liang–Barsky against [0,w] × [0,h], treating the segment as a ray pair so
    // an infinite line through the two sample points reaches every plot edge.
    let t0 = -Infinity;
    let t1 = Infinity;
    /** @param {number} p @param {number} q */
    const clip = (p, q) => {
        if (p === 0) return q >= 0;
        const r = q / p;
        if (p < 0) {
            if (r > t1) return false;
            if (r > t0) t0 = r;
        } else {
            if (r < t0) return false;
            if (r < t1) t1 = r;
        }
        return true;
    };

    if (!clip(-dx, x1 - 0)) return null;
    if (!clip(dx, w - x1)) return null;
    if (!clip(-dy, y1 - 0)) return null;
    if (!clip(dy, h - y1)) return null;
    if (t0 > t1) return null;

    // Finite segment through the samples may lie entirely inside; for the
    // infinite line we still want the full clipped extent, so use [t0, t1]
    // unrestricted by the sample segment.
    return {
        x1: x1 + t0 * dx,
        y1: y1 + t0 * dy,
        x2: x1 + t1 * dx,
        y2: y1 + t1 * dy
    };
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function trend(options = {}) {
    const opts = normalizeMarkOptions(options);
    const {
        id,
        edits: userEdits,
        constraints,
        handleSize = 6,
        interceptStage = null,
        slopeStage = null
    } = opts;

    // The axes are the belief's coordinate space, not columns of its datum, so they
    // default to the fields `x` and `y`. Declaring those in the schema is what gives
    // the plot its domains — and therefore the anchor/probe positions.
    const channels = { x: { field: 'x' }, y: { field: 'y' }, ...opts.channels };

    // The two x positions the handles sit at, read from the x scale's domain (so
    // the mark needs no data to place them — a single-datum belief). Options
    // override either end. Shared by build() and the edits' apply().
    // Default anchor is 0 (the y-intercept) when 0 lies in the x domain; otherwise
    // the domain min — so a classic intercept/slope frame just works.
    /** @param {import('../types').ScaleMap} scales */
    const anchorsOf = (scales) => {
        const dom = scales.x && /** @type {any} */ (scales.x).domainConfig;
        const x0 = Array.isArray(dom) ? Number(dom[0]) : 0;
        const x1 = Array.isArray(dom) ? Number(dom[dom.length - 1]) : 1;
        const lo = Math.min(x0, x1);
        const hi = Math.max(x0, x1);
        const defaultAnchor = (lo <= 0 && 0 <= hi) ? 0 : x0;
        return {
            anchor: options.anchor != null ? options.anchor : defaultAnchor,
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
        channels,
        constraints,
        edits: [interceptEdit, slopeEdit, ...(userEdits || [])],
        // Signals autoAxes to cross at the origin when the chart leaves `axes` unset.
        isTrend: true,
        xKey: (channels.x && channels.x.field) || 'x',
        yKey: (channels.y && channels.y.field) || 'y',
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
            const trendDefaults = markDefaults(scales, 'trend', { stroke: '#333', fill: '#333' });
            currentData.forEach((/** @type {any} */ d, i) => {
                const a = Number(d.intercept) || 0;
                const b = Number(d.slope) || 0;
                const yOf = (/** @type {number} */ x) => a + b * x;
                const style = resolveStyle(scales, channels, d, trendDefaults);

                // Sample the line at the x-domain ends, then clip the infinite line
                // through those points to the plot rectangle — so it runs edge-to-
                // edge through the origin rather than stopping at the y-axis.
                const raw = {
                    x1: xScale.encode(x0), y1: yScale.encode(yOf(x0)),
                    x2: xScale.encode(x1), y2: yScale.encode(yOf(x1))
                };
                const clipped = clipLineToPlot(raw.x1, raw.y1, raw.x2, raw.y2, width, height);
                if (clipped) {
                    nodes.push({
                        type: 'line',
                        ...clipped,
                        stroke: style.stroke || trendDefaults.stroke,
                        strokeWidth: style.strokeWidth || 2,
                        pointerEvents: 'none'
                    });
                }

                // The two draggable handles, tagged by channel for edit scoping.
                nodes.push({
                    type: 'circle',
                    cx: xScale.encode(anchor), cy: yScale.encode(yOf(anchor)),
                    r: handleSize,
                    fill: style.fill || trendDefaults.fill,
                    data: d, index: i, channel: 'intercept'
                });
                nodes.push({
                    type: 'circle',
                    cx: xScale.encode(probe), cy: yScale.encode(yOf(probe)),
                    r: handleSize,
                    fill: style.fill || trendDefaults.fill,
                    data: d, index: i, channel: 'slope'
                });
            });
            return nodes;
        }
    };
}
