// @ts-check
// axis.js — the EDITABLE-AXIS edits (scope 'axis'). Unlike every other edit these
// write the SCHEMA's DOMAIN, not the dataset: they carry `target: 'domain'`, and
// their apply returns { domains, data?, resize? } for the engine's domain-commit
// path (see core/elicit.js). The domain is the data's own property, so reshaping it
// IS the edit — grids, guides and marks then reflow from it on the next render.
//
// Two edits, because a numeric axis and a categorical one want incompatible
// interaction models (a driven drag vs. direct clicks + inline typing) and one axis
// is only ever one kind:
//   edit.axis.scale()       numeric/temporal — drag an end-handle to rescale the range
//   edit.axis.categories()  categorical/ordinal — add / rename / remove categories
//
// Both are namespaced under `edit.axis.*` so the scope shows in the name, mirroring
// `edit.line.*`. The axis mark wires them (plot/axis.js): it forwards the edit and,
// per the scale's kind, emits the handle / label / add / remove affordance nodes.

import { makeEdit, numOf } from './shared.js';
import { axisOf } from '../core/encoding.js';

/**
 * The schema fields whose domain a domain edit writes: an explicit `field` (when the
 * axis pins one) else every field unioned onto the axis (scale.fields, stamped by
 * resolveScales). A single-field axis -> one field; an error bar's y -> mean/lo/hi.
 * @param {any} scale @param {string | undefined} field @returns {string[]}
 */
function targetFields(scale, field) {
    if (field) return [field];
    return (scale && scale.fields) || [];
}

/**
 * Grow-mode resize for a category count change: keep each band the same pixel size
 * and let the chart grow/shrink by whole steps instead. For a band/point scale the
 * padding terms are constant, so adding one category adds exactly one `step()` of
 * axis length (removing one takes one away) — the inner length is just
 * `current ± delta·step`, and the outer size adds the two margins back. Returns
 * undefined when the scale has no step (not discrete) or the axis would collapse.
 * @param {import('../types').EditContext} ctx @param {number} delta signed count change
 * @returns {{ width?: number, height?: number } | undefined}
 */
function stepResize(ctx, delta) {
    const ch = ctx.channels[0];
    const scale = /** @type {any} */ (ch && ch.scale);
    const step = scale && typeof scale.step === 'function' ? scale.step() : null;
    if (!step) return undefined;
    const m = ctx.margins || { top: 20, right: 20, bottom: 30, left: 40 };
    if (axisOf(ch.name) === 'y') {
        const inner = (ctx.height || 0) + delta * step;
        return inner > step ? { height: inner + m.top + m.bottom } : undefined;
    }
    const inner = (ctx.width || 0) + delta * step;
    return inner > step ? { width: inner + m.left + m.right } : undefined;
}

/** Set the same domain on every target field. @param {string[]} fields @param {any[]} domain */
function domainsFor(fields, domain) {
    /** @type {Record<string, any[]>} */
    const domains = {};
    for (const f of fields) domains[f] = domain;
    return domains;
}

/**
 * edit.axis.scale — drag an end-handle of a numeric/temporal axis to grow or shrink
 * its range. The axisDrag driver locks the grabbed handle at dragstart (which end,
 * the anchored extreme's pixel+value, this extreme's pixel+value, the slope) into
 * ctx.session; this apply turns that snapshot + the live pointer into the new
 * [min,max]:
 *
 *   rescale (default) — the pixel range is fixed; the anchored extreme keeps its
 *     value, and the grabbed extreme moves so its handle follows the pointer. The
 *     chart stays the same size (marks compress/expand into it).
 *   grow — the pixels-per-unit is held constant and the chart RESIZES instead, so
 *     the data keeps its scale (a `resize` hint rides along in the result).
 *
 * @param {{ field?: string, mode?: 'rescale' | 'grow' }} [options]
 * @returns {import('../types').Edit}
 */
export function scale(options = {}) {
    const { field, mode = 'rescale' } = options;
    const MIN_PX = 6; // guard: never divide by a near-zero anchor→pointer distance
    return makeEdit({
        type: 'axisScale',
        gesture: 'drag',
        pick: 'axisDrag',
        scope: 'axis',
        target: 'domain',
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const lock = ctx.session;
            const ch = ctx.channels[0];
            if (!lock || !lock.grabEnd || !ch || !ch.scale) return undefined;
            const fields = targetFields(ch.scale, field);
            if (!fields.length) return undefined;

            const aP = /** @type {number} */ (lock.anchorPixel);
            const aV = numOf(lock.anchorValue);
            const gV = numOf(lock.grabValue);
            const temporal = lock.anchorValue instanceof Date || lock.grabValue instanceof Date;
            const p = lock.axis === 'x' ? ctx.pointer.x : ctx.pointer.y;

            // Signed pixel distances from the anchored extreme.
            let Lp = p - aP;
            const Lg = /** @type {number} */ (lock.grabPixel) - aP;
            if (Math.abs(Lp) < MIN_PX) Lp = Lp < 0 ? -MIN_PX : MIN_PX;

            let newExtreme;
            if (mode === 'grow') {
                // Hold the slope (pixels per data unit) constant; the grabbed extreme
                // tracks the pointer, and the chart grows to fit it (below).
                const k = /** @type {number} */ (lock.pxPerUnit) || (Lg / (gV - aV || 1));
                newExtreme = aV + Lp / (k || 1);
            } else {
                // Fixed pixel range: keep the anchored extreme's value, move the
                // grabbed value under the pointer -> the range end becomes newExtreme.
                newExtreme = aV + (gV - aV) * (Lg / Lp);
            }

            const loNum = Math.min(aV, newExtreme);
            const hiNum = Math.max(aV, newExtreme);
            if (!Number.isFinite(loNum) || !Number.isFinite(hiNum) || hiNum <= loNum) return undefined;
            const domain = temporal ? [new Date(loNum), new Date(hiNum)] : [loNum, hiNum];

            /** @type {import('../types').DomainEditResult} */
            const result = { domains: domainsFor(fields, domain) };

            if (mode === 'grow') {
                // Keep the data's pixels-per-unit: the inner axis length must span the
                // whole new domain at the locked slope. Report the OUTER size (inner +
                // the two margins on that axis) for the engine to resize the chart to.
                const k = Math.abs(/** @type {number} */ (lock.pxPerUnit) || 1);
                const inner = (hiNum - loNum) * k;
                const m = ctx.margins || { top: 20, right: 20, bottom: 30, left: 40 };
                result.resize = lock.axis === 'x'
                    ? { width: inner + m.left + m.right }
                    : { height: inner + m.top + m.bottom };
            }
            return result;
        }
    });
}

/**
 * edit.axis.categories — reshape a categorical/ordinal axis's domain (its ordered
 * category list) by direct gestures on the axis's affordance nodes, reusing the
 * renderer's inline-typing lifecycle. Three edits, arbitrated by `when` on the node
 * the gesture landed on:
 *   add    (commit on the "+" node) — append the typed name to the domain
 *   rename (commit on a label node) — relabel the category AND rewrite matching rows
 *   remove (click on a "×" node)    — drop the category AND delete matching rows
 * Add/rename come in as a `commit` gesture (double-click a node -> inline input ->
 * Enter), carrying the typed string in ctx.value. All three are direct-pick so the
 * plane isn't raised over the labels.
 *
 * `mode` mirrors edit.axis.scale(): 'rescale' (default) keeps the chart size, so the
 * bands re-divide it (thinner as you add); 'grow' keeps each band the same pixel
 * size and grows/shrinks the CHART by a step per category added/removed — the right
 * feel for extending a Likert scale from 5 points to 7.
 * @param {{ field?: string, mode?: 'rescale' | 'grow' }} [options]
 * @returns {import('../types').Edit[]}
 */
export function categories(options = {}) {
    const { field, mode = 'rescale' } = options;
    const grow = mode === 'grow';

    /** @param {import('../types').EditContext} ctx @returns {string | undefined} */
    const fieldOf = (ctx) => {
        const ch = ctx.channels[0];
        return field || (ch && ch.scale && ch.scale.fields && ch.scale.fields[0]) || undefined;
    };
    /** @param {import('../types').EditContext} ctx @returns {any[]} */
    const domainOf = (ctx) => {
        const ch = ctx.channels[0];
        return (ch && ch.scale && typeof ch.scale.domain === 'function') ? [...ch.scale.domain()] : [];
    };

    const add = makeEdit({
        type: 'axisAddCategory',
        gesture: 'commit',
        pick: 'direct',
        scope: 'axis',
        target: 'domain',
        when: (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.node && ctx.node.addCategory),
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const f = fieldOf(ctx);
            const name = ctx.value != null ? String(ctx.value).trim() : '';
            if (!f || !name) return undefined;
            const domain = domainOf(ctx);
            if (domain.includes(name)) return undefined; // no duplicate categories
            /** @type {import('../types').DomainEditResult} */
            const result = { domains: { [f]: [...domain, name] } };
            if (grow) { const r = stepResize(ctx, +1); if (r) result.resize = r; }
            return result;
        }
    });

    const rename = makeEdit({
        type: 'axisRenameCategory',
        gesture: 'commit',
        pick: 'direct',
        scope: 'axis',
        target: 'domain',
        when: (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.node && ctx.node.category != null),
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const f = fieldOf(ctx);
            const from = ctx.node && ctx.node.category;
            const to = ctx.value != null ? String(ctx.value).trim() : '';
            if (!f || from == null || !to || to === from) return undefined;
            const domain = domainOf(ctx);
            if (domain.includes(to)) return undefined; // would collide with a sibling
            return {
                domains: { [f]: domain.map((c) => (c === from ? to : c)) },
                // Relabel every row on the renamed category so data + schema stay in step.
                data: ctx.data.map((/** @type {any} */ d) => (d[f] === from ? { ...d, [f]: to } : d))
            };
        }
    });

    const remove = makeEdit({
        type: 'axisRemoveCategory',
        gesture: 'click',
        pick: 'direct',
        scope: 'axis',
        target: 'domain',
        when: (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.node && ctx.node.removeCategory != null),
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const f = fieldOf(ctx);
            const cat = ctx.node && ctx.node.removeCategory;
            if (!f || cat == null) return undefined;
            const domain = domainOf(ctx);
            if (!domain.includes(cat)) return undefined;
            /** @type {import('../types').DomainEditResult} */
            const result = {
                domains: { [f]: domain.filter((/** @type {any} */ c) => c !== cat) },
                // Removing a category also deletes its rows (the user's choice), so no
                // datum is left orphaned at an undefined band position.
                data: ctx.data.filter((/** @type {any} */ d) => d[f] !== cat)
            };
            if (grow) { const r = stepResize(ctx, -1); if (r) result.resize = r; }
            return result;
        }
    });

    return [add, rename, remove];
}
