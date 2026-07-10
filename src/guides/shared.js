// @ts-check
// shared.js — what every guide has in common.
//
// A guide is a graphical mark that isn't bound to the dataset the way a plot mark
// is: it draws an annotation, not a row. But it is still allowed to DEPEND on the
// data — a "mean" line has to read the rows to know where it goes. So every guide
// option may be either a literal or a function of the guide context:
//
//   guides.rule({ y: 25 })                                  // literal
//   guides.rule({ y: ({ data }) => d3.mean(data, d => d.y),  // derived
//                 label: ({ data }) => `mean of ${data.length}` })
//
// The context is the same one build() receives: { scales, data, constraints,
// features, featureNodes, ui, effects, width, height, stage } (see elicit.js's
// guideCtx). Guides never mutate it, and are always non-interactive.

/**
 * Resolve one guide option against the guide context: call it if it's a function,
 * otherwise hand it back untouched.
 * @template T
 * @param {T | ((ctx: any) => T)} value
 * @param {any} ctx
 * @returns {T}
 */
export function resolveGuideOption(value, ctx) {
    return typeof value === 'function'
        ? /** @type {(ctx: any) => T} */ (value)(ctx)
        : value;
}

/**
 * Resolve a whole options object at once — every value goes through
 * resolveGuideOption. Guide factories call this at the top of build().
 * @param {Record<string, any>} options
 * @param {any} ctx
 * @returns {Record<string, any>}
 */
export function resolveGuideOptions(options, ctx) {
    /** @type {Record<string, any>} */
    const out = {};
    for (const [key, value] of Object.entries(options)) out[key] = resolveGuideOption(value, ctx);
    return out;
}
