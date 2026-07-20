// @ts-check
// when.js — arbitration predicates for an edit's `when`, kept separate from the
// edits so the same edit works under any strategy. `when` decides WHETHER an edit
// claims a gesture (e.g. plain-click recolours, Alt-click deletes); it never
// changes what the edit does.

import { nearestSeries, DEFAULT_PICK_THRESHOLD } from './pick.js';

/**
 * The proximity radius `when.near`/`when.far` arbitrate with: the active edit's
 * own `threshold` when it set one, else the shared pick default.
 * @param {import('../types').EditContext} ctx
 * @returns {number}
 */
const thresholdOf = (ctx) =>
    ctx.edit && ctx.edit.threshold > 0 ? ctx.edit.threshold : DEFAULT_PICK_THRESHOLD;

export const when = {
    /** @param {import('../types').EditContext} ctx */
    shift: (ctx) => !!(ctx.event && ctx.event.shiftKey),
    /** @param {import('../types').EditContext} ctx */
    noShift: (ctx) => !(ctx.event && ctx.event.shiftKey),
    /** @param {import('../types').EditContext} ctx */
    alt: (ctx) => !!(ctx.event && ctx.event.altKey),
    /** @param {import('../types').EditContext} ctx */
    noAlt: (ctx) => !(ctx.event && ctx.event.altKey),
    /** @param {string} key */
    modifier: (key) => (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.event && ctx.event[key]),
    /** @param {string} key */
    noModifier: (key) => (/** @type {import('../types').EditContext} */ ctx) => !(ctx.event && ctx.event[key]),
    // Proximity arbitration for path authoring: is the pointer near an existing
    // line, or out in empty space? Pair anchor({ when: when.near }) with
    // newSeries({ when: when.far }) to add-to-nearest vs start-a-new-line.
    // The radius is the EDIT'S own `threshold` when it carries one (read off
    // ctx.edit), so arbitration and pick agree on what "near" means; the shared
    // default otherwise.
    /** @param {import('../types').EditContext} ctx */
    near: (ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, thresholdOf(ctx)) != null,
    /** @param {import('../types').EditContext} ctx */
    far: (ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, thresholdOf(ctx)) == null,
    /** @param {number} t @returns {(ctx: import('../types').EditContext) => boolean} */
    nearWithin: (t) => (/** @type {import('../types').EditContext} */ ctx) => nearestSeries(ctx.marks || [], ctx.pointer.x, ctx.pointer.y, t) != null
};
