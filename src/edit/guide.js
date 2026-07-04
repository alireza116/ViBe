// @ts-check
// guide.js — an edit self-draws its guide when declared `guide: true`. This
// retires the old `target: <featureId>` indirection: instead of a standalone
// guide reaching back into a feature to introspect its constraints, the edit —
// which already owns its channel(s) and constraints — draws them directly.
//
// Two things get drawn:
//   1. Constraint boundaries, on the edit's OWN channel scale (axis-aware), so a
//      clamp/maintainSum on a y-edit draws horizontal, on an x-edit vertical.
//   2. For `pick: 'nearest'` edits, the proximity snap ring + selected-mark
//      highlight, read from the transient `ui` selection the dispatch writes.
//
// Rebuilt every render (via the engine), so bounds track live data.
import { resolveChannels } from './route.js';

const DEFAULT_CONSTRAINT_COLOR = '#e4572e';
const DEFAULT_RING_COLOR = '#ff9800';

/**
 * @param {any} feature
 * @param {import('../types').Edit} edit
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
export function buildEditGuide(feature, edit, ctx) {
    const { scales, state, ui, width, height, featureNodes } = ctx;
    const encoding = feature.encoding || {};
    const resolved = resolveChannels(edit.channels, encoding, scales);
    const primary = resolved[0];
    const data = state[feature.id] || [];
    const color = edit.guideColor || DEFAULT_CONSTRAINT_COLOR;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    // Constraint boundaries on the edit's own value channel. Constraints now live
    // at the feature level (data invariants); we draw the ones whose field matches
    // this edit's primary channel, plus any edit-scoped guard sugar.
    if (primary && primary.scale) {
        const invariants = [...(feature.constraints || []), ...edit.constrain];
        for (const constraint of invariants) {
            if (constraint.field && primary.field && constraint.field !== primary.field) continue;
            nodes.push(...constraintGuide(constraint, {
                feature, data, scales, width, height, primary, color
            }));
        }
    }

    // Proximity ring + highlight for nearest-pick edits.
    if (edit.pick === 'nearest') {
        nodes.push(...proximityGuide(feature, ctx, DEFAULT_RING_COLOR));
    }

    return nodes;
}

/**
 * Dispatch a constraint to its boundary drawer. A constraint may carry its own
 * drawer via defineConstraint's meta.guide (takes precedence).
 * @param {import('../types').Constraint} constraint
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function constraintGuide(constraint, gctx) {
    if (typeof constraint.guide === 'function') {
        return constraint.guide(gctx) || [];
    }
    switch (constraint.constraintType) {
        case 'clamp': return clampGuide(constraint.options, gctx);
        case 'maintainSum': return maintainSumGuide(constraint.options, gctx);
        default: return [];
    }
}

/**
 * A value-axis boundary line spanning the perpendicular extent. On a y-edit the
 * line is horizontal (full width); on an x-edit it is vertical (full height).
 * @param {number | undefined} value
 * @param {string} label
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function boundaryLine(value, label, gctx) {
    const { primary, width, height, color } = gctx;
    if (value === undefined) return [];
    const at = primary.scale(value);
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];
    if (primary.name === 'x') {
        nodes.push({
            type: 'line', x1: at, x2: at, y1: 0, y2: height,
            stroke: color, strokeDasharray: '4 4', strokeWidth: 1,
            opacity: 0.9, pointerEvents: 'none', guide: true
        });
        nodes.push({
            type: 'text', x: at + 4, y: 12, text: label,
            fill: color, fontSize: 10, textAnchor: 'start',
            opacity: 0.95, pointerEvents: 'none', guide: true
        });
    } else {
        nodes.push({
            type: 'line', x1: 0, x2: width, y1: at, y2: at,
            stroke: color, strokeDasharray: '4 4', strokeWidth: 1,
            opacity: 0.9, pointerEvents: 'none', guide: true
        });
        nodes.push({
            type: 'text', x: width - 4, y: at - 4, text: label,
            fill: color, fontSize: 10, textAnchor: 'end',
            opacity: 0.95, pointerEvents: 'none', guide: true
        });
    }
    return nodes;
}

/**
 * clamp -> min/max boundary lines + a shaded allowed band, on the value axis.
 * @param {{ min?: number, max?: number }} bounds
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function clampGuide({ min, max }, gctx) {
    const { primary, width, height, color } = gctx;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    if (min !== undefined && max !== undefined) {
        const a = primary.scale(min);
        const b = primary.scale(max);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        nodes.push(primary.name === 'x'
            ? { type: 'rect', x: lo, y: 0, width: hi - lo, height,
                fill: color, opacity: 0.07, pointerEvents: 'none', guide: true }
            : { type: 'rect', x: 0, y: lo, width, height: hi - lo,
                fill: color, opacity: 0.07, pointerEvents: 'none', guide: true });
    }

    nodes.push(...boundaryLine(min, `min ${min}`, gctx));
    nodes.push(...boundaryLine(max, `max ${max}`, gctx));
    return nodes;
}

/**
 * maintainSum -> a cap tick over each mark at the highest value it can reach given
 * the current total of the others. The category axis is the non-value positional
 * channel; the tick sits at that mark's slot, on the value axis.
 * @param {{ targetSum: number }} options
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function maintainSumGuide({ targetSum }, gctx) {
    const { feature, data, scales, primary, color } = gctx;
    const valueName = primary.name;                       // 'x' or 'y'
    const catName = valueName === 'y' ? 'x' : 'y';        // the other positional axis
    const valueKey = valueName === 'y' ? (feature.yKey || 'y') : (feature.xKey || 'x');
    const catKey = catName === 'y' ? (feature.yKey || 'y') : (feature.xKey || 'x');
    const valueScale = primary.scale;
    const catScale = scales[catName];
    if (!catScale) return [];

    const [dMin, dMax] = [Math.min(...valueScale.domain()), Math.max(...valueScale.domain())];
    const band = catScale.bandwidth ? catScale.bandwidth() : 20;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    data.forEach((/** @type {any} */ d) => {
        const sumOthers = data.reduce(
            (/** @type {number} */ s, /** @type {any} */ o) => (o[catKey] === d[catKey] ? s : s + o[valueKey]), 0
        );
        const cap = targetSum - sumOthers;
        if (cap < dMin || cap > dMax) return; // off-chart

        const catPos = catScale(d[catKey]);
        const at = valueScale(cap);
        nodes.push(valueName === 'y'
            ? { type: 'line', x1: catPos - 2, x2: catPos + band + 2, y1: at, y2: at,
                stroke: color, strokeDasharray: '3 3', strokeWidth: 1.5,
                opacity: 0.9, pointerEvents: 'none', guide: true }
            : { type: 'line', x1: at, x2: at, y1: catPos - 2, y2: catPos + band + 2,
                stroke: color, strokeDasharray: '3 3', strokeWidth: 1.5,
                opacity: 0.9, pointerEvents: 'none', guide: true });
    });
    return nodes;
}

/**
 * The snap ring at the pointer + a highlight around the selected mark, read from
 * the transient nearest-selection state the dispatch writes into ui.proximity.
 * @param {any} feature
 * @param {any} ctx
 * @param {string} color
 * @returns {import('../types').FeatureNode[]}
 */
function proximityGuide(feature, ctx, color) {
    const info = ctx.ui && ctx.ui.proximity && ctx.ui.proximity[feature.id];
    if (!info) return [];
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    if (info.px != null && info.py != null && info.threshold != null) {
        nodes.push({
            type: 'circle', cx: info.px, cy: info.py, r: info.threshold,
            fill: 'none', stroke: color, strokeDasharray: '2 4',
            strokeWidth: 1, opacity: 0.45, guide: true
        });
    }

    const index = info.activeIndex != null ? info.activeIndex : info.hoverIndex;
    if (index != null) {
        const marks = (ctx.featureNodes && ctx.featureNodes[feature.id]) || [];
        const mark = marks[index];
        if (mark && mark.type === 'circle') {
            nodes.push({
                type: 'circle', cx: mark.cx, cy: mark.cy, r: (mark.r || 5) + 5,
                fill: 'none', stroke: color, strokeWidth: 2.5, opacity: 0.95, guide: true
            });
        } else if (mark && mark.type === 'rect') {
            nodes.push({
                type: 'rect', x: mark.x - 2, y: mark.y - 2,
                width: mark.width + 4, height: mark.height + 4,
                fill: 'none', stroke: color, strokeWidth: 2.5, opacity: 0.95, guide: true
            });
        }
    }
    return nodes;
}

