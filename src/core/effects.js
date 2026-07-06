// @ts-check
// effects.js — the interaction-EFFECTS layer: transient visual feedback for
// interaction STATE (grabbing, proximity-selecting), kept deliberately separate
// from a mark's STYLE channels (fill/stroke/opacity/…). Two invariants:
//
//   1. Robustness — an effect must NEVER write a mark's paint attributes, so it
//      can't clobber data-driven style (the drag bug: the old grab highlight set
//      `stroke`, wiping a mark's own stroke). Effects use only:
//        · element effects  — CSS `filter`/`transform` on the mark element itself
//                             (not a style channel, so _applyStyle never touches it)
//        · overlay effects  — extra `guide` scene nodes drawn around/over the mark
//   2. Customizable — every effect's appearance is data here, merged over the
//      caller's `effects` spec, so a chart can restyle or disable each one.
//
// Named effects:
//   grab   — element effect applied to a mark while it is being dragged.
//   select — overlay effect for proximity/nearest selection: a snap-zone ring at
//            the pointer + a highlight outline around the currently selected mark.

/** @type {any} */
export const DEFAULT_EFFECTS = {
    // Element effect: a CSS filter string applied to the dragged mark. `false`
    // (or filter:null) disables it.
    grab: { filter: 'brightness(0.82)' },
    // Overlay effect: the proximity ring + selected-mark outline.
    select: {
        color: '#ff9800',
        ring: { dash: '2 4', width: 1, opacity: 0.45 },       // snap zone at pointer
        highlight: { width: 2.5, opacity: 0.95, pad: 5 }       // outline around the mark
    }
};

/**
 * Merge a user `effects` spec over the defaults. Accepts conveniences:
 *   grab: false | 'brightness(1.1)' | { filter }
 *   select: false | { color?, ring?: {...}, highlight?: {...} }
 * Partial sub-objects are merged, so `{ select: { color: '#4f46e5' } }` keeps the
 * default ring/highlight geometry.
 * @param {any} [user]
 * @returns {any}
 */
export function resolveEffects(user = {}) {
    const d = DEFAULT_EFFECTS;

    let grab;
    if (user.grab === false) grab = { filter: null };            // disabled
    else if (typeof user.grab === 'string') grab = { filter: user.grab };
    else grab = { ...d.grab, ...(user.grab || {}) };

    const us = user.select || {};
    const select = {
        enabled: user.select !== false,
        color: us.color != null ? us.color : d.select.color,
        ring: { ...d.select.ring, ...(us.ring || {}) },
        highlight: { ...d.select.highlight, ...(us.highlight || {}) }
    };

    return { grab, select };
}
