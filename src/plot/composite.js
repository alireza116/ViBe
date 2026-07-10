// @ts-check
// composite.js — a COMPOSITE mark (a glyph): a named GROUP of ordinary marks over
// the chart's one dataset. Each part encodes some columns of the same rows; a part
// whose channel carries an `edit` is a handle. Editing a handle mutates its field;
// on the next render every other part rebuilds from the changed rows, so the glyph
// stays internally consistent with no per-part wiring.
//
//   composite({
//     id: 'errorbar',
//     constraints: [centerWithinEnds],
//     parts: [
//       ruleX({ channels: { x: {field:'g'}, y1: {field:'lo'}, y2: {field:'hi'} } }),
//       point({ channels: { x: {field:'g'}, y:  {field:'mean', edit: drag()} } }),
//       tick({  channels: { x: {field:'g'}, y:  {field:'lo',   edit: drag()} } }),
//       tick({  channels: { x: {field:'g'}, y:  {field:'hi',   edit: drag()} } }),
//     ],
//   })
//
// It is a DESUGARING, not a new kind of feature: it returns the parts as an array
// of plain features and `Elicit` flattens them into `features`, exactly as the
// `axes` convenience desugars into axis/grid marks. The engine learns nothing.
//
// Three properties fall out of the parts being real, separate features — this is
// why the mark is thin, and why it no longer auto-generates handles or arbitrates
// between them:
//
//   1. NO HANDLE ARBITRATION. Direct-pick dispatch routes a gesture to the feature
//      owning the touched node (elicit.js: `features.find(f => f.id ===
//      event.node.featureId)`), so a drag on the `hi` cap cannot reach the `lo`
//      cap's edit. A glyph whose handles share ONE feature does need arbitration —
//      see plot/trend.js, whose two handles sit on one datum.
//   2. NO CHANNEL GYMNASTICS. Each handle is its own mark, so each edits a plain
//      `y` (or `x`) channel. The x1/x2/y1/y2 span channels are left to the marks
//      that genuinely span, like the whisker's ruleX.
//   3. SHARED STATE FOR FREE. Every mark reads the chart's one dataset, so a
//      coupled edit (drag the mean, shift lo/hi with it) and a dataset constraint
//      (keep the mean between the caps) both work across parts with no plumbing.
//      The constraint gates and repairs whichever part's handle you grabbed.
//
// Parts that carry no edit are pure visuals; the engine gives them
// `pointerEvents:'none'` (a mark with no direct-pick edit can't consume a gesture,
// so it must not block one), which is what keeps the whisker — drawn above the
// handles, since the renderer paints lines after circles — from eating their drags.

/**
 * @param {import('../types').CompositeOptions} [options]
 * @returns {any[]} the parts, as features for Elicit's flattened `features` list
 */
export function composite(options = {}) {
    const {
        id,
        parts = [],
        constraints,
        // Glyphs usually sit in category slots; a band gives each part a centred
        // slot. Stamped onto parts that don't state their own preference. (Scale
        // resolution lets 'band' win a disagreement between marks anyway.)
        discreteScale = 'band'
    } = options;

    return parts.map((part, i) => ({
        ...part,
        // Deterministic, stable ids so a part keeps its identity across renders
        // (the engine keys scene nodes and driver sessions by feature id).
        id: part.id || `${id || 'composite'}/${i}`,
        discreteScale: part.discreteScale || discreteScale,
        // Group-level invariants ride on the first part. Placement is immaterial —
        // the engine promotes every feature's `constraints` into one dataset-wide
        // set — but attaching them once keeps the set clean before it dedupes.
        constraints: i === 0
            ? [...(constraints || []), ...(part.constraints || [])]
            : part.constraints
    }));
}
