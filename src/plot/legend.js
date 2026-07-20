// @ts-check
// legend.js — a legend for a NON-POSITIONAL channel (fill / stroke / size /
// symbol), built as a COMPOSABLE MARK the same way axes are (plot/axis.js). A
// legend is "an axis for a channel that has no plot position": it reads the
// GLOBAL scale for its channel (scales.fill, scales.size, …) and draws either a
// column/row of discrete swatches or a continuous colour ramp.
//
// Two things set it apart from a plain guide row:
//   1. It reserves space on a side. `anchor` ('right'|'left'|'top'|'bottom')
//      picks the side; the engine's reservation pass (core/legends.js) calls
//      `measure(scales)`, shrinks the plot to make room, and stamps this mark's
//      `_place` with where its band landed — so the legend never overlaps marks.
//   2. It can be interactive. Pass `edit: edit.legend()` (a category picker: click
//      a swatch to set the channel's field) or `edit: edit.legendValue()` (a
//      continuous value picker: drag the ramp handle). Interactive nodes are
//      ordinary MARK-layer nodes (not `background`), so the renderer binds
//      click/drag directly to them — even out in the reserved margin band, where
//      the interaction plane doesn't reach.
//
// The picker writes into the dataset through the normal edit pipeline. Its target
// row is `row` (default 0) — the natural fit is a one-row elicitation ("pick
// today's weather"), the same shape the slider/choice widgets use.

import * as d3 from 'd3';
import { themeOf } from '../core/theme.js';
import { tickData } from './axis.js';

/** Normalize the `edit` option to a flat list, injecting the legend channel. */
function flatEdits(/** @type {any} */ edit, /** @type {string} */ channel) {
    const list = edit == null ? [] : Array.isArray(edit) ? edit.flat(Infinity) : [edit];
    return list
        .filter((e) => e && typeof e.apply === 'function')
        .map((e) => (e.channels ? e : { ...e, channels: [channel] }));
}

/** Numeric view of a domain value (a Date sorts by its timestamp). */
const numOf = (/** @type {any} */ v) => (v instanceof Date ? v.getTime() : v);

/** A colour channel encodes to a paint; size to a radius; symbol to a glyph. */
const isColorChannel = (/** @type {string} */ ch) => ch === 'fill' || ch === 'stroke';

/**
 * Does this scale want a continuous RAMP (a gradient) rather than swatches?
 * A `sequential`/`diverging` colour scale, or any continuous (invertible) scale.
 * Read via the capability model, never a `scale.type` allowlist for control flow —
 * `type` is consulted only to tell a colour ramp from a numeric one.
 * @param {any} scale
 * @returns {boolean}
 */
function isRampScale(scale) {
    return scale.kind === 'continuous' || scale.type === 'sequential' || scale.type === 'diverging';
}

/**
 * Estimate a label column's pixel width from the longest label. Exact text
 * measurement would need a canvas; a char-count estimate is enough to reserve a
 * band, and `labelWidth` overrides it when a caller wants it exact.
 * @param {any[]} values
 * @param {(v: any) => string} format
 * @param {number} fontSize
 * @returns {number}
 */
function estimateLabelWidth(values, format, fontSize) {
    let max = 0;
    for (const v of values) max = Math.max(max, String(format(v)).length);
    return Math.ceil(max * fontSize * 0.6);
}

/**
 * The shared legend builder. `legendColor`/`legendSize`/`legendSymbol` pin
 * `channel`. Unlike a mark it encodes no datum row — it draws a SCALE — so it has
 * no channel map; its chrome (stroke/fill/fontSize) are plain options resolved
 * against the theme's legend tokens at build time.
 * @param {any} [options]
 * @returns {any}
 */
export function legend(options = {}) {
    const {
        channel = 'fill',
        anchor = 'right',
        // Vertical (a stacked column) on the sides, horizontal (a row) top/bottom;
        // overridable.
        orient: orientOpt,
        swatchSize = 14,
        gap = 6,
        labelWidth: labelWidthOpt,
        rampLength = 140,
        rampThickness = 12,
        ticks = 4,
        tickFormat,
        title,
        // Which dataset row the picker writes into. Left undefined, it tracks the
        // chart's SELECTION (edit.select / el.select) — click a bar to select it,
        // then the legend edits that row; with nothing selected it falls back to the
        // sole row of a one-row belief, else targets nothing (inert until you pick).
        // A number pins a fixed row; a function `(data, { selection }) => index`
        // computes one.
        row,
        // Chrome — theme legend tokens unless overridden (resolved at build time).
        stroke: strokeOpt,
        fill: fillOpt,
        fontSize: fontSizeOpt,
        handleColor: handleColorOpt,
        // Opt-in interactivity: edit.legend() (discrete category pick) or
        // edit.legendValue() (continuous value pick), or a list.
        edit,
        field,
        id,
    } = options;

    const orient = orientOpt || (anchor === 'left' || anchor === 'right' ? 'vertical' : 'horizontal');
    const vertical = orient === 'vertical';
    const edits = flatEdits(edit, channel);
    const editable = edits.length > 0;

    // Filled by core/legends.js's reservation pass each render: `offset` is the
    // gap from the plot edge to this legend's near edge (past any axis in the
    // author margin), `size` its extent across the side. A mutable object the
    // build closure reads, so the engine can place the legend without widening
    // build()'s signature.
    const place = { offset: 0, size: 0 };

    /**
     * The domain values a discrete legend lists, or the [lo,hi] a ramp spans, plus
     * a formatter — the one place the scale is read, shared by measure() and build().
     * @param {any} scale
     * @param {any} thm
     * @returns {{ ramp: boolean, values: any[], format: (v: any) => string, labelW: number, fontSize: number }}
     */
    const readScale = (scale, thm) => {
        const fontSize = fontSizeOpt ?? (thm.guide.legend.fontSize || 11);
        const ramp = isRampScale(scale);
        let values, format;
        if (ramp) {
            // A colour ramp scale sniffs as `discrete` (no invert), so tickData would
            // return only its domain endpoints. Build nice ticks off a linear proxy
            // over [lo, hi] instead — the ramp is a continuous axis in disguise.
            const dom = scale.domain();
            const lin = d3.scaleLinear().domain([Math.min(...dom.map(numOf)), Math.max(...dom.map(numOf))]);
            values = lin.ticks(ticks);
            format = typeof tickFormat === 'string' ? d3.format(tickFormat)
                : typeof tickFormat === 'function' ? tickFormat
                    : lin.tickFormat(ticks);
        } else {
            values = scale.domain();
            format = tickFormat ? tickData(scale, { tickFormat }).format : (/** @type {any} */ v) => `${v}`;
        }
        const labelW = labelWidthOpt != null ? labelWidthOpt : estimateLabelWidth(values, format, fontSize);
        return { ramp, values, format, labelW, fontSize };
    };

    return {
        id,
        isLegend: true,
        channel,
        anchor,
        orient,
        layer: 'background',
        edits,
        field,
        _place: place,

        /**
         * Bounding box of the legend content, so the reservation pass knows how much
         * to shrink the plot. `across` (width for a vertical legend, height for a
         * horizontal one) is what it reserves on the side.
         * @param {import('../types').ScaleMap} scales
         * @returns {{ width: number, height: number } | null}
         */
        measure(scales) {
            const scale = scales[channel];
            if (!scale || typeof scale.domain !== 'function') return null;
            const thm = themeOf(scales);
            const { ramp, values, labelW, fontSize } = readScale(scale, thm);
            const titlePad = title ? fontSize + 4 : 0;

            if (ramp) {
                if (vertical) return { width: rampThickness + 6 + labelW, height: rampLength + titlePad };
                return { width: rampLength, height: rampThickness + 6 + fontSize + titlePad };
            }
            const n = values.length || 1;
            if (vertical) {
                return { width: swatchSize + 4 + labelW, height: n * (swatchSize + gap) + titlePad };
            }
            const itemW = swatchSize + 4 + labelW + gap;
            return { width: n * itemW, height: swatchSize + gap + titlePad };
        },

        /**
         * @param {any[]} data
         * @param {import('../types').ScaleMap} scales
         * @param {number} width inner plot width
         * @param {number} height inner plot height
         * @returns {import('../types').FeatureNode[]}
         */
        build(data, scales, width, height) {
            const scale = scales[channel];
            if (!scale || typeof scale.domain !== 'function') return [];
            const domain = scale.domain();
            if (!domain.length) return [];

            const thm = themeOf(scales);
            const swatchStroke = strokeOpt ?? (thm.guide.legend.stroke || '#374151');
            const labelFill = fillOpt ?? (thm.guide.legend.labelFill || '#374151');
            const handleColor = handleColorOpt ?? (thm.axis.handle || '#2563eb');
            const { ramp, values, format, labelW, fontSize } = readScale(scale, thm);
            const across = place.size || (this.measure(scales) || { width: 0, height: 0 })[vertical ? 'width' : 'height'];

            // Top-left of the content box, in inner-plot g-coordinates. The legend
            // sits in the reserved band just outside the plot on `anchor`'s side.
            let cx0 = 0, cy0 = 0;
            if (anchor === 'right') cx0 = width + place.offset;
            else if (anchor === 'left') cx0 = -(place.offset + across);
            else if (anchor === 'bottom') cy0 = height + place.offset;
            else if (anchor === 'top') cy0 = -(place.offset + across);

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            let contentTop = cy0;
            if (title) {
                nodes.push({
                    type: 'text', x: cx0, y: cy0 + fontSize, text: String(title),
                    textAnchor: 'start', fill: labelFill, fontSize: fontSize + 1,
                    background: true, pointerEvents: 'none',
                });
                contentTop = cy0 + fontSize + 4;
            }

            // The row the picker writes into (interactive nodes carry it as `index`).
            // Default: the selected row (engine-stamped scales.selection), else the
            // sole row of a one-row belief, else none.
            const selected = /** @type {any} */ (scales).selection;
            const r = row != null
                ? (typeof row === 'function' ? row(data, { selection: selected }) : row)
                : (selected != null ? selected : (data.length === 1 ? 0 : null));
            const targetRow = data.length && r != null ? Math.max(0, Math.min(r, data.length - 1)) : null;

            if (ramp) {
                buildRamp(nodes, {
                    scale, values, format, cx0, cy0: contentTop, vertical, anchor,
                    rampLength, rampThickness, fontSize, swatchStroke, labelFill,
                    handleColor, editable, data, targetRow, field, channel,
                });
            } else {
                buildSwatches(nodes, {
                    scale, domain, format, cx0, cy0: contentTop, vertical, anchor,
                    swatchSize, gap, labelW, fontSize, swatchStroke, labelFill,
                    editable, targetRow, channel,
                });
            }
            return nodes;
        },
    };
}

/**
 * A single swatch shape for a value: a colour chip, a sized dot, a glyph, or an
 * opacity chip — whichever the channel encodes to.
 * @param {{ channel: string, x: number, y: number, size: number, encoded: any, stroke: string, interactive: boolean }} o
 * @returns {any}
 */
function swatchNode({ channel, x, y, size, encoded, stroke, interactive }) {
    const base = interactive ? {} : { background: true, pointerEvents: 'none' };
    if (channel === 'symbol') {
        return {
            type: 'text', x: x + size / 2, y: y + size / 2, text: String(encoded),
            fontSize: size, textAnchor: 'middle', dominantBaseline: 'central', ...base,
        };
    }
    if (channel === 'size') {
        const r = Math.max(1, Math.min(size / 2, Number(encoded) || size / 2));
        return { type: 'circle', cx: x + size / 2, cy: y + size / 2, r, fill: '#64748b', stroke, strokeWidth: 1, ...base };
    }
    if (channel === 'opacity') {
        return { type: 'rect', x, y, width: size, height: size, fill: '#334155', fillOpacity: Number(encoded), stroke, strokeWidth: 1, ...base };
    }
    return { type: 'rect', x, y, width: size, height: size, fill: encoded, stroke, strokeWidth: 1, ...base };
}

/**
 * Discrete swatches: one chip + label per domain value. Interactive chips carry
 * `category` (the value they set) and `index` (the target row) so a direct-pick
 * click edit (edit.legend) writes that value.
 * @param {any[]} nodes
 * @param {any} o
 */
function buildSwatches(nodes, o) {
    const { domain, cx0, cy0, vertical, swatchSize, gap, fontSize, swatchStroke, labelFill, editable, targetRow, scale, channel } = o;
    const interactive = editable && targetRow != null;
    domain.forEach((/** @type {any} */ value, /** @type {number} */ i) => {
        const encoded = typeof scale.encode === 'function' ? scale.encode(value) : (typeof scale === 'function' ? scale(value) : value);
        // Vertical: stack down. Horizontal: flow right, one item = chip + label.
        const itemPitch = swatchSize + 4 + o.labelW + gap;
        const sx = vertical ? cx0 : cx0 + i * itemPitch;
        const sy = vertical ? cy0 + i * (swatchSize + gap) : cy0;

        const chip = swatchNode({ channel, x: sx, y: sy, size: swatchSize, encoded, stroke: swatchStroke, interactive });
        if (interactive) { chip.category = value; chip.index = targetRow; chip.cursor = 'pointer'; }
        nodes.push(chip);

        nodes.push({
            type: 'text', x: sx + swatchSize + 4, y: sy + swatchSize * 0.75,
            text: String(o.format(value)), fill: labelFill, fontSize,
            textAnchor: 'start', background: true, pointerEvents: 'none',
        });
    });
}

/**
 * A continuous colour ramp: a stack of thin slices sampling the scale, tick
 * labels, and (when interactive) a draggable handle at the target row's current
 * value. The handle carries the ramp band geometry so edit.legendValue can map a
 * drag position back to a value — the by-hand inversion a non-invertible colour
 * scale forces.
 * @param {any[]} nodes
 * @param {any} o
 */
function buildRamp(nodes, o) {
    const { scale, values, format, cx0, cy0, vertical, rampLength, rampThickness,
        fontSize, swatchStroke, labelFill, handleColor, editable, data, targetRow, channel } = o;
    const dom = scale.domain();
    const lo = Math.min(...dom.map(numOf));
    const hi = Math.max(...dom.map(numOf));
    const span = hi - lo || 1;
    const SLICES = 40;
    // A vertical ramp runs low→high bottom→top; a horizontal one low→high left→right.
    const along = vertical ? 'y' : 'x';
    const rampStart = vertical ? cy0 + rampLength : cx0; // pixel of `lo`
    const rampEnd = vertical ? cy0 : cx0 + rampLength;   // pixel of `hi`

    const isColor = isColorChannel(channel);
    for (let j = 0; j < SLICES; j++) {
        const t0 = j / SLICES, t1 = (j + 1) / SLICES;
        const vMid = lo + ((t0 + t1) / 2) * span;
        const paint = typeof scale.encode === 'function' ? scale.encode(vMid) : scale(vMid);
        if (vertical) {
            const yTop = cy0 + (1 - t1) * rampLength;
            nodes.push({
                type: 'rect', x: cx0, y: yTop, width: rampThickness, height: rampLength / SLICES + 0.5,
                fill: isColor ? paint : '#94a3b8', stroke: 'none', background: true, pointerEvents: 'none',
            });
        } else {
            const xLeft = cx0 + t0 * rampLength;
            nodes.push({
                type: 'rect', x: xLeft, y: cy0, width: rampLength / SLICES + 0.5, height: rampThickness,
                fill: isColor ? paint : '#94a3b8', stroke: 'none', background: true, pointerEvents: 'none',
            });
        }
    }
    // Border around the ramp.
    nodes.push({
        type: 'rect', x: cx0, y: cy0, width: vertical ? rampThickness : rampLength,
        height: vertical ? rampLength : rampThickness, fill: 'none', stroke: swatchStroke,
        strokeWidth: 1, background: true, pointerEvents: 'none',
    });

    // Tick labels alongside the ramp.
    for (const v of values) {
        const t = (numOf(v) - lo) / span;
        if (t < -0.001 || t > 1.001) continue;
        if (vertical) {
            const y = cy0 + (1 - t) * rampLength;
            nodes.push({
                type: 'text', x: cx0 + rampThickness + 4, y: y + fontSize * 0.35,
                text: String(format(v)), fill: labelFill, fontSize, textAnchor: 'start',
                background: true, pointerEvents: 'none',
            });
        } else {
            const x = cx0 + t * rampLength;
            nodes.push({
                type: 'text', x, y: cy0 + rampThickness + fontSize + 2,
                text: String(format(v)), fill: labelFill, fontSize, textAnchor: 'middle',
                background: true, pointerEvents: 'none',
            });
        }
    }

    // Draggable handle at the target row's current value (edit.legendValue).
    if (editable && targetRow != null) {
        const scaleField = (scale.fields && scale.fields[0]) || null;
        const current = scaleField != null ? data[targetRow] && data[targetRow][scaleField] : null;
        const t = current == null ? 0.5 : Math.max(0, Math.min(1, (numOf(current) - lo) / span));
        const hx = vertical ? cx0 + rampThickness / 2 : cx0 + t * rampLength;
        const hy = vertical ? cy0 + (1 - t) * rampLength : cy0 + rampThickness / 2;
        nodes.push({
            type: 'circle', cx: hx, cy: hy, r: 6, fill: handleColor, stroke: '#fff', strokeWidth: 1.5,
            index: targetRow, along, rampStart, rampEnd, loValue: lo, hiValue: hi,
            cursor: vertical ? 'ns-resize' : 'ew-resize',
        });
    }
}

/** @param {any} [options] @returns {any} */
export const legendColor = (options = {}) => legend({ ...options, channel: options.channel || 'fill' });
/** @param {any} [options] @returns {any} */
export const legendSize = (options = {}) => legend({ ...options, channel: 'size' });
/** @param {any} [options] @returns {any} */
export const legendSymbol = (options = {}) => legend({ ...options, channel: 'symbol' });
