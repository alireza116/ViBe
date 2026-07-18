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
import { resolveChannels, collectEdits } from './route.js';
import { driverFor } from './drivers/index.js';
import { DEFAULT_EFFECTS } from '../core/effects.js';
import { isBand, isDiscrete, rangeExtent } from '../core/scales.js';
import { axisOf } from '../core/encoding.js';

const DEFAULT_CONSTRAINT_COLOR = '#e4572e';

/**
 * Collect the auto-guides for every feature: an edit declared `guide: true`
 * self-draws (constraint bounds + nearest snap ring) via buildEditGuide, without
 * the caller repeating the feature id in a top-level guides list. Deduped per
 * (feature, edit).
 * @param {any[]} features
 * @returns {any[]} guide objects ({ isGuide, build })
 */
export function autoEditGuides(features) {
    /** @type {any[]} */
    const out = [];
    /** @type {Set<string>} */
    const seen = new Set();
    for (const feature of features) {
        collectEdits(feature).forEach((edit, i) => {
            if (!edit.guide) return;
            const key = `${feature.id}:edit-${edit.type}-${i}`;
            if (seen.has(key)) return;
            seen.add(key);
            out.push({
                isGuide: true,
                /** @param {any} ctx */
                build: (ctx) => buildEditGuide(feature, edit, ctx)
            });
        });
    }
    return out;
}

/**
 * @param {any} feature
 * @param {import('../types').Edit} edit
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
export function buildEditGuide(feature, edit, ctx) {
    const { scales, data, constraints, ui, width, height, featureNodes } = ctx;
    const markChannels = feature.channels || {};
    const resolved = resolveChannels(edit.channels, markChannels, scales);
    const primary = resolved[0];
    // The guide colour: the edit's own `guideColor` wins; otherwise the theme's
    // constraint colour (falls back to the historical default if no theme in ctx).
    const themeColor = ctx.theme && ctx.theme.constraint && ctx.theme.constraint.color;
    const color = edit.guideColor || themeColor || DEFAULT_CONSTRAINT_COLOR;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    // Constraint boundaries on the edit's own value channel. Constraints are DATASET
    // invariants, so an edit draws every one whose field matches its primary channel
    // — including constraints declared on a sibling mark, since they gate this edit
    // too. Plus any edit-scoped guard sugar.
    if (primary && primary.scale) {
        const invariants = [...(constraints || []), ...edit.constrain];
        for (const constraint of invariants) {
            if (constraint.field && primary.field && constraint.field !== primary.field) continue;
            nodes.push(...constraintGuide(constraint, {
                feature, data, scales, width, height, primary, color
            }));
        }
        // 2-D clamp box when this edit governs both axes and each has a clamp.
        if (resolved.length >= 2) {
            nodes.push(...clampBoxGuide(invariants, resolved, {
                feature, data, scales, width, height, primary, color
            }));
        }
    }

    // Snap ring + mark highlight (the `select` effect) for any edit whose driver
    // resolves a target from an arbitrary pointer position and records it. Asked of
    // the driver registry (`selects`) rather than matched against a list of pick
    // names here — that list had drifted, covering `brush` but not its 2-D siblings
    // brushRect/geoBrush, which keep the same hover state and so drew nothing.
    const driver = driverFor(edit);
    if (driver && driver.selects) {
        nodes.push(...proximityGuide(feature, ctx));
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
        case 'snap': return snapGuide(constraint.options, gctx);
        // No guide, by design, for the rest:
        //   count / unique  cardinality rules (how many rows / per category), not
        //                   value bounds — there's no line on a value axis to draw.
        //   ordering / monotonic / spacing
        //                   their bound is the NEIGHBOUR's current value, which is
        //                   already on screen: the other handle, or the next point.
        //                   Drawing a line on top of a mark you can see says nothing.
        // A custom constraint can still supply its own drawer via meta.guide above.
        default: return [];
    }
}

// A snap grid denser than this is unreadable as ticks — and at that point it isn't
// telling you anything a continuous axis doesn't already say.
const MAX_SNAP_TICKS = 200;

/**
 * snap -> a tick per stop along the value axis, drawn at the plot edge. Unlike a
 * clamp (two bounds) a snap has no boundary to draw; what's worth showing is WHERE
 * the value can land, so the handle appearing to lag the pointer reads as a grid
 * rather than as lost input.
 *
 * Only for a continuous value axis: a band/point scale already draws its own slots,
 * and its categories aren't `step` apart in pixels anyway.
 * @param {{ step?: number, origin?: number }} options
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function snapGuide({ step = 1, origin = 0 }, gctx) {
    const { primary, width, height, color } = gctx;
    const scale = primary.scale;
    if (!scale || !(step > 0) || isDiscrete(scale)) return [];

    const domain = scale.domain().map(Number);
    const lo = Math.min(...domain);
    const hi = Math.max(...domain);
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [];
    if ((hi - lo) / step > MAX_SNAP_TICKS) return [];

    const onX = axisOf(primary.name) === 'x';
    const [rLo, rHi] = rangeExtent(scale);
    const len = 6;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    // Walk by index, not by accumulating `v += step` — repeated float addition
    // drifts off the stops the constraint itself computes (origin + n * step).
    const firstN = Math.ceil((lo - origin) / step);
    const lastN = Math.floor((hi - origin) / step);
    for (let n = firstN; n <= lastN; n++) {
        const at = scale(origin + n * step);
        if (!Number.isFinite(at) || at < rLo - 0.5 || at > rHi + 0.5) continue;
        nodes.push(onX
            ? { type: 'line', x1: at, x2: at, y1: height, y2: height - len,
                stroke: color, strokeWidth: 1, opacity: 0.5,
                pointerEvents: 'none', guide: true }
            : { type: 'line', x1: 0, x2: len, y1: at, y2: at,
                stroke: color, strokeWidth: 1, opacity: 0.5,
                pointerEvents: 'none', guide: true });
    }
    return nodes;
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
    if (axisOf(primary.name) === 'x') {
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
    const onX = axisOf(primary.name) === 'x';

    if (min !== undefined && max !== undefined) {
        const a = primary.scale(min);
        const b = primary.scale(max);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        nodes.push(onX
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
 * 2-D clamp box when an edit governs both x and y and each has a clamp invariant.
 * @param {import('../types').Constraint[]} invariants
 * @param {import('../types').ResolvedChannel[]} resolved
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function clampBoxGuide(invariants, resolved, gctx) {
    const xCh = resolved.find((ch) => axisOf(ch.name) === 'x');
    const yCh = resolved.find((ch) => axisOf(ch.name) === 'y');
    if (!xCh || !yCh || !xCh.scale || !yCh.scale) return [];
    const xClamp = invariants.find((c) => c.constraintType === 'clamp' && c.field === xCh.field);
    const yClamp = invariants.find((c) => c.constraintType === 'clamp' && c.field === yCh.field);
    if (!xClamp || !yClamp) return [];
    const xo = xClamp.options || {}, yo = yClamp.options || {};
    if (xo.min == null || xo.max == null || yo.min == null || yo.max == null) return [];
    const x0 = xCh.scale(xo.min), x1 = xCh.scale(xo.max);
    const y0 = yCh.scale(yo.min), y1 = yCh.scale(yo.max);
    const { color } = gctx;
    return [{
        type: 'rect',
        x: Math.min(x0, x1),
        y: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0),
        fill: color,
        opacity: 0.08,
        stroke: color,
        strokeWidth: 1,
        strokeDasharray: '4 4',
        pointerEvents: 'none',
        guide: true
    }];
}

/**
 * maintainSum -> a cap tick over each mark at the highest value it can reach given
 * the current total of the others. The category axis is the non-value positional
 * channel; the tick sits at that mark's slot, on the value axis.
 *
 * The per-mark cap tick only makes sense when the category axis is a BAND (bars /
 * ticks — discrete slots to sit a cap over). On two continuous axes (a line /
 * scatter) there is no slot geometry, so the guide draws nothing (the maintainSum
 * data invariant still holds; only its visualization is band-specific).
 * @param {{ targetSum: number }} options
 * @param {any} gctx
 * @returns {import('../types').FeatureNode[]}
 */
function maintainSumGuide({ targetSum }, gctx) {
    const { feature, data, scales, primary, color } = gctx;
    const valueName = primary.name;
    const valueAxis = axisOf(valueName) || (valueName === 'x' ? 'x' : 'y');
    const catName = valueAxis === 'y' ? 'x' : 'y';
    const valueKey = valueAxis === 'y' ? (feature.yKey || 'y') : (feature.xKey || 'x');
    const catKey = catName === 'y' ? (feature.yKey || 'y') : (feature.xKey || 'x');
    const valueScale = primary.scale;
    const catScale = scales[catName];
    // Band category axis only — otherwise there is no slot to draw a cap over.
    if (!catScale || !isBand(catScale)) return [];

    const [dMin, dMax] = [Math.min(...valueScale.domain()), Math.max(...valueScale.domain())];
    const band = catScale.bandwidth();
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
        nodes.push(valueAxis === 'y'
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
 * The `select` interaction effect: a snap ring at the pointer + a highlight
 * outline around the selected mark, read from the transient nearest-selection
 * state the drivers write into ui.session. Appearance comes from the customizable
 * effects layer (ctx.effects.select).
 * @param {any} feature
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
function proximityGuide(feature, ctx) {
    const info = ctx.ui && ctx.ui.session && ctx.ui.session[feature.id];
    if (!info) return [];
    return selectEffectNodes(info, (ctx.featureNodes && ctx.featureNodes[feature.id]) || [],
        (ctx.effects && ctx.effects.select) || DEFAULT_EFFECTS.select);
}

/**
 * Build the `select` effect's scene nodes (ring + mark outline) from a proximity
 * selection and the resolved `select` effect config. Shared by the edit-owned
 * guide and the legacy standalone proximity guide so both look identical and
 * honour the same customization.
 * @param {any} info the ui.session[featureId] selection
 * @param {any[]} marks the feature's current scene nodes
 * @param {any} select the resolved effects.select config
 * @returns {import('../types').FeatureNode[]}
 */
export function selectEffectNodes(info, marks, select) {
    if (!info || (select && select.enabled === false)) return [];
    const { color, ring, highlight } = select;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    // Snap zone at the pointer.
    if (info.px != null && info.py != null && info.threshold != null) {
        nodes.push({
            type: 'circle', cx: info.px, cy: info.py, r: info.threshold,
            fill: 'none', stroke: color, strokeDasharray: ring.dash,
            strokeWidth: ring.width, opacity: ring.opacity, guide: true
        });
    }

    // Outline around the selected mark (active drag selection wins over hover).
    // `index` is a DATUM index; find the node carrying it rather than indexing by
    // position, since a feature may emit extra nodes (e.g. a line's path) that
    // offset the handles from their datum index.
    const index = info.activeIndex != null ? info.activeIndex : info.hoverIndex;
    if (index != null) {
        const mark = marks.find(m => m && m.index === index) || marks[index];
        const pad = highlight.pad;
        if (mark && mark.type === 'circle') {
            nodes.push({
                type: 'circle', cx: mark.cx, cy: mark.cy, r: (mark.r || 5) + pad,
                fill: 'none', stroke: color, strokeWidth: highlight.width,
                opacity: highlight.opacity, guide: true
            });
        } else if (mark && mark.type === 'rect') {
            nodes.push({
                type: 'rect', x: mark.x - pad, y: mark.y - pad,
                width: mark.width + pad * 2, height: mark.height + pad * 2,
                fill: 'none', stroke: color, strokeWidth: highlight.width,
                opacity: highlight.opacity, guide: true
            });
        } else if (mark && mark.type === 'line') {
            // A tick is a line: outline its span (a thin padded box around the
            // segment), so the selected tick reads the same as a highlighted bar.
            const lx = Math.min(mark.x1, mark.x2);
            const ly = Math.min(mark.y1, mark.y2);
            nodes.push({
                type: 'rect', x: lx - pad, y: ly - pad,
                width: Math.abs(mark.x2 - mark.x1) + pad * 2,
                height: Math.abs(mark.y2 - mark.y1) + pad * 2,
                fill: 'none', stroke: color, strokeWidth: highlight.width,
                opacity: highlight.opacity, guide: true
            });
        }
    }
    return nodes;
}

