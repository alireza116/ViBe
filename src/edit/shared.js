// @ts-check
// shared.js — the small kit every edit factory builds on: the descriptor
// normalizer (makeEdit) plus the datum/series helpers create-style edits reuse.
// Kept separate so the universal edits (basic.js) and the line-scoped edits
// (line.js) share one implementation of these primitives.

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
