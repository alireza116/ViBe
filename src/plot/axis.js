// @ts-check
// axis.js — axes and gridlines as COMPOSABLE MARKS (the Observable Plot model).
//
// An axis is not a renderer feature baked into the engine; it's an ordinary
// feature (like ruleY) whose build() emits line + text scene nodes. It reads the
// GLOBAL positional scale by channel name (scales.x / scales.y) and draws a spine,
// ticks, labels and an optional title. Because it flows through the normal scene
// pipeline it (a) redraws every update as the scale's domain grows, and (b) can
// later carry `edits` to become interactive — an editable axis.
//
// Two ways to use them:
//   1. EXPLICITLY compose them:  features: [ axisX({ ticks: 5 }), gridY(), point(...) ]
//   2. IMPLICITLY via the global `axes` convenience on Elicit(), which desugars
//      into these same marks (see core/elicit.js).
//
// Positioning: `anchor` ('bottom'|'top'|'left'|'right') sets the base side; a
// width/height/scales-aware `transform(ctx) -> {x?,y?}` overrides the base
// translate component(s) — e.g. cross at the origin, or a centred 1D slider axis.

import * as d3 from 'd3';
import { positionOnScale } from '../core/scales.js';

/**
 * The base translate (axis-group origin, in inner-plot pixels) for an anchor.
 *   x/bottom -> (0, height)   x/top -> (0, 0)
 *   y/left   -> (0, 0)        y/right -> (width, 0)
 * @param {string} anchor
 * @param {number} width
 * @param {number} height
 * @returns {{ x: number, y: number }}
 */
function baseTranslate(anchor, width, height) {
    switch (anchor) {
        case 'top': return { x: 0, y: 0 };
        case 'bottom': return { x: 0, y: height };
        case 'left': return { x: 0, y: 0 };
        case 'right': return { x: width, y: 0 };
        default: return { x: 0, y: 0 };
    }
}

/**
 * Tick values + a formatter for a scale.
 *   linear -> scale.ticks(count) (+ scale.tickFormat), unless `tickValues` given
 *   band/point/ordinal -> the domain (every category), formatter = identity
 * @param {any} scale
 * @param {{ ticks?: number, tickValues?: any[], tickFormat?: any }} opts
 * @returns {{ values: any[], format: (v: any) => string }}
 */
export function tickData(scale, opts = {}) {
    const { ticks = 5, tickValues, tickFormat } = opts;
    const categorical = scale.type === 'band' || scale.type === 'point' || scale.type === 'ordinal';

    let values;
    if (tickValues) {
        values = tickValues;
    } else if (categorical) {
        values = scale.domain();
    } else if (typeof scale.ticks === 'function') {
        values = scale.ticks(ticks);
    } else {
        values = scale.domain();
    }

    /** @type {(v: any) => string} */
    let format;
    if (typeof tickFormat === 'function') {
        format = tickFormat;
    } else if (typeof tickFormat === 'string') {
        format = d3.format(tickFormat);
    } else if (!categorical && typeof scale.tickFormat === 'function') {
        format = scale.tickFormat(ticks);
    } else {
        format = (/** @type {any} */ v) => `${v}`;
    }

    return { values, format };
}

/**
 * The shared axis builder. `axisX`/`axisY` are thin wrappers that pin `channel`.
 * @param {any} [options]
 * @returns {any}
 */
export function axis(options = {}) {
    const {
        channel = 'x',
        anchor = channel === 'x' ? 'bottom' : 'left',
        transform,
        ticks = 5,
        tickValues,
        tickFormat,
        tickSize = 6,
        title,
        stroke = '#6b7280',
        color = '#374151',
        fontSize = 10,
        grid = false,
        id
    } = options;

    const isX = channel === 'x';

    return {
        id,
        isAxis: true,
        channel,
        layer: 'background',
        // A paired grid, when `grid: true` — the engine reads this to auto-add a
        // matching grid mark alongside the axis (see elicit.js). Harmless otherwise.
        grid,
        /**
         * @param {any[]} _data
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (_data, scales, width, height) => {
            const scale = scales[channel];
            if (!scale) return []; // 1D plot / hidden channel — no-op

            const base = baseTranslate(anchor, width, height);
            const t = transform
                ? { ...base, ...(transform({ width, height, scales, anchor, base }) || {}) }
                : base;

            const { values, format } = tickData(scale, { ticks, tickValues, tickFormat });
            // Tick/label direction: axes on bottom/right push ticks in the positive
            // direction (down / right), top/left in the negative.
            const dir = (anchor === 'bottom' || anchor === 'right') ? 1 : -1;

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            // Domain spine — spans the scale's pixel range along the axis.
            if (isX) {
                nodes.push({
                    type: 'line', x1: t.x, x2: t.x + width, y1: t.y, y2: t.y,
                    stroke, strokeWidth: 1, background: true, pointerEvents: 'none'
                });
            } else {
                nodes.push({
                    type: 'line', x1: t.x, x2: t.x, y1: t.y, y2: t.y + height,
                    stroke, strokeWidth: 1, background: true, pointerEvents: 'none'
                });
            }

            // Ticks + labels.
            for (const v of values) {
                const p = positionOnScale(scale, v);
                if (p == null || Number.isNaN(p)) continue;
                if (isX) {
                    const px = t.x + p;
                    nodes.push({
                        type: 'line', x1: px, x2: px, y1: t.y, y2: t.y + dir * tickSize,
                        stroke, strokeWidth: 1, background: true, pointerEvents: 'none'
                    });
                    nodes.push({
                        type: 'text', x: px, y: t.y + dir * (tickSize + fontSize),
                        text: format(v), textAnchor: 'middle', fill: color, fontSize,
                        background: true, pointerEvents: 'none'
                    });
                } else {
                    const py = t.y + p;
                    nodes.push({
                        type: 'line', x1: t.x, x2: t.x + dir * tickSize, y1: py, y2: py,
                        stroke, strokeWidth: 1, background: true, pointerEvents: 'none'
                    });
                    nodes.push({
                        type: 'text', x: t.x + dir * (tickSize + 3), y: py + fontSize / 3,
                        text: format(v), textAnchor: dir < 0 ? 'end' : 'start', fill: color,
                        fontSize, background: true, pointerEvents: 'none'
                    });
                }
            }

            // Optional axis title, centred along the axis, pushed past the labels.
            if (title) {
                if (isX) {
                    nodes.push({
                        type: 'text', x: t.x + width / 2, y: t.y + dir * (tickSize + fontSize * 2.4),
                        text: title, textAnchor: 'middle', fill: color, fontSize: fontSize + 1,
                        background: true, pointerEvents: 'none'
                    });
                } else {
                    nodes.push({
                        type: 'text', x: t.x + dir * (tickSize + fontSize * 2.4), y: t.y + height / 2,
                        text: title, textAnchor: 'middle', fill: color, fontSize: fontSize + 1,
                        background: true, pointerEvents: 'none'
                    });
                }
            }

            return nodes;
        }
    };
}

/**
 * The shared grid builder — full-span lines across the plot, one per tick.
 * @param {any} [options]
 * @returns {any}
 */
export function grid(options = {}) {
    const {
        channel = 'x',
        ticks = 5,
        tickValues,
        stroke = '#e5e7eb',
        strokeWidth = 1,
        id
    } = options;

    const isX = channel === 'x';

    return {
        id,
        isGrid: true,
        channel,
        layer: 'background',
        /**
         * @param {any[]} _data
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (_data, scales, width, height) => {
            const scale = scales[channel];
            if (!scale) return [];
            const { values } = tickData(scale, { ticks, tickValues });

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            for (const v of values) {
                const p = positionOnScale(scale, v);
                if (p == null || Number.isNaN(p)) continue;
                if (isX) {
                    nodes.push({
                        type: 'line', x1: p, x2: p, y1: 0, y2: height,
                        stroke, strokeWidth, background: true, pointerEvents: 'none'
                    });
                } else {
                    nodes.push({
                        type: 'line', x1: 0, x2: width, y1: p, y2: p,
                        stroke, strokeWidth, background: true, pointerEvents: 'none'
                    });
                }
            }
            return nodes;
        }
    };
}

/** @param {any} [options] @returns {any} */
export const axisX = (options = {}) => axis({ ...options, channel: 'x' });
/** @param {any} [options] @returns {any} */
export const axisY = (options = {}) => axis({ ...options, channel: 'y' });
/** @param {any} [options] @returns {any} */
export const gridX = (options = {}) => grid({ ...options, channel: 'x' });
/** @param {any} [options] @returns {any} */
export const gridY = (options = {}) => grid({ ...options, channel: 'y' });
