// @ts-check
// shared.js — the small kit every edit factory builds on: the descriptor
// normalizer (makeEdit) plus the datum/series helpers create-style edits reuse.
// Kept separate so the universal edits (basic.js) and the line-scoped edits
// (line.js) share one implementation of these primitives.

import { visualForChannel, axisOf } from '../core/encoding.js';

/**
 * @param {any} v
 * @returns {any[]}
 */
export const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * Normalize an edit spec into the canonical Edit descriptor the engine routes to.
 * @param {any} spec
 * @returns {import('../types').Edit}
 */
export function makeEdit(spec) {
    return {
        type: spec.type,
        gesture: spec.gesture || 'drag',
        channels: spec.channels || null,
        when: spec.when || null,
        pick: spec.pick || 'direct',
        threshold: spec.threshold != null ? spec.threshold : 0,
        // 'line' marks a mark-scoped edit (anchor/newSeries/draw/sweep) so the
        // engine can dev-warn when it's attached to a mark without series support.
        scope: spec.scope || null,
        // Path-authoring target policy: 'nearest' extends the closest line, 'new'
        // starts a fresh series. Read by the plane/draw dispatch.
        into: spec.into || null,
        constrain: asList(spec.constrain),
        guide: spec.guide || null,
        guideColor: spec.guideColor || null,
        // Multi-stage gate: an edit with a numeric stage is active only when it
        // equals the engine's current stage; null (the default) is always active.
        // A uniform descriptor filter — not a mode branch (see elicit.js activeEdits).
        stage: spec.stage != null ? spec.stage : null,
        // probe-pick only: does a click that settles this edit advance the stage?
        // Defaults to true for a staged edit (the "line, then cone" flow); set false
        // to commit repeatedly within one stage (the dot plot's create).
        advance: spec.advance !== false,
        apply: spec.apply
    };
}

/**
 * A fresh series key not already present in the data — the identity of a new line.
 * Uses the smallest non-negative integer free among the existing keys, so colors
 * (an ordinal scale over the keys) stay stable as lines come and go.
 * @param {any[]} data
 * @param {string | null} seriesField
 * @returns {number}
 */
export function nextSeriesKey(data, seriesField) {
    if (!seriesField) return 0;
    const existing = new Set((data || []).map((d) => d[seriesField]));
    let n = 0;
    while (existing.has(n)) n++;
    return n;
}

/**
 * The starting values a minted datum gets from the dataset schema: every declared
 * field, set to its explicit `default` when given, else `null` (present but unset,
 * to be set later by an edit). Returns {} when no schema is declared.
 * @param {Record<string, import('../types').FieldSchema> | undefined} schema
 * @returns {Record<string, any>}
 */
export function schemaDefaults(schema) {
    /** @type {Record<string, any>} */
    const out = {};
    if (!schema) return out;
    for (const [field, spec] of Object.entries(schema)) {
        out[field] = spec && spec.default !== undefined ? spec.default : null;
    }
    return out;
}

/**
 * The scene node an edit is currently acting on, regardless of pick strategy:
 * `ctx.node` is set for a direct-pick gesture (the DOM element it landed on),
 * but a plane-pick gesture (nearest/sweep) resolves its target by datum index
 * with no node attached — so fall back to looking the current mark up in
 * `ctx.marks` by `ctx.index`, the same by-datum-index lookup guide.js's
 * `selectEffectNodes` already does for the proximity highlight.
 * @param {import('../types').EditContext} ctx
 * @returns {any | null}
 */
export function resolveMarkNode(ctx) {
    if (ctx.node) return ctx.node;
    if (ctx.index == null || !ctx.marks) return null;
    return ctx.marks.find((m) => m && m.index === ctx.index) || null;
}

/**
 * Centre of a scene node: circles carry cx/cy; rects carry x/y/width/height.
 * @param {any} node
 * @returns {{ cx: number, cy: number } | null}
 */
export function markCenter(node) {
    if (!node) return null;
    if (node.cx != null) return { cx: node.cx, cy: node.cy };
    if (node.x != null && node.width != null) {
        return { cx: node.x + node.width / 2, cy: node.y + node.height / 2 };
    }
    return null;
}

// Compare two domain positions numerically (a Date sorts by its timestamp), so a
// linear or time domain grid can be matched/ordered the same way.
/** @param {any} p @returns {number} */
export const numOf = (p) => (p instanceof Date ? p.getTime() : p);

/**
 * Invert the pointer through ONE channel's scale — the single-field half of
 * `drag()`'s move, factored out so `brushSpan`'s edge-zone tick can reuse the
 * exact same computation instead of a second copy.
 * @param {import('../types').ResolvedChannel} ch
 * @param {{ x: number, y: number }} pointer
 * @returns {any}
 */
export function invertChannel(ch, pointer) {
    if (!ch || !ch.scale || !ch.scale.invertible) return undefined;
    const visual = visualForChannel(ch.name, pointer);
    if (visual === undefined) return undefined;
    return ch.scale.invertValue(visual);
}

/**
 * Recenter a mark's CURRENT pixel span (read off its rendered node) on the
 * pointer, then invert both new endpoints back to data — the whole-span-move
 * computation `dragSpan` and `brushSpan`'s body zone both use. Stateless: no
 * dragstart/delta tracking, just "the gesture sets the absolute position",
 * the same model `drag()`/`invertChannel` already use for a single field.
 * @param {any} node the mark's current scene node (rect: x/y/width/height)
 * @param {import('../types').ResolvedChannel} chA
 * @param {import('../types').ResolvedChannel} chB
 * @param {{ x: number, y: number }} pointer
 * @returns {{ a: any, b: any } | undefined}
 */
export function recenterSpan(node, chA, chB, pointer) {
    if (!node || !chA || !chB || !chA.scale || !chB.scale) return undefined;
    if (!chA.scale.invertible || !chB.scale.invertible) return undefined;
    const axis = axisOf(chA.name);
    if (!axis || axis !== axisOf(chB.name)) return undefined; // must share an axis

    const visual = axis === 'x' ? pointer.x : pointer.y;
    const span = axis === 'x' ? node.width : node.height;
    if (visual === undefined || span == null) return undefined;

    const p1 = visual - span / 2;
    const p2 = visual + span / 2;
    return { a: chA.scale.invertValue(p1), b: chB.scale.invertValue(p2) };
}
