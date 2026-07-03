// @ts-check
// gate.js — gesture arbitration as a SEPARATE, swappable layer over interactions.
//
// An interactor describes *what* an edit does (move, resize, recolor). A gate
// decides *whether* it should act on a given gesture. Keeping the two apart
// means the same move/resize interactors work under any arbitration strategy —
// modifier key today, a start-region hit-test or a mode toggle tomorrow — you
// just wrap them with a different predicate. The interaction never learns how it
// was selected.
//
//   // plain drag moves, Shift-drag resizes — same interactors, different gates
//   gate(dragXY(), modifierFree('shiftKey'))
//   gate(resize({ channel: 'size' }), modifierHeld('shiftKey'))
//
// The core skips an interactor whose `when(context)` returns false (see
// applyInteraction in core/elicit.js).

/**
 * Wrap an interactor so it only acts on gestures where `when(context)` is truthy.
 * Returns a new interactor object; the original is untouched.
 * @param {any} interactor
 * @param {function} when
 * @returns {any}
 */
export function gate(interactor, when) {
    return { ...interactor, when };
}

/**
 * Predicate: a keyboard modifier is held during the gesture.
 * key is a DOM event flag: 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey'.
 * @param {string} [key]
 * @returns {(ctx: any) => boolean}
 */
export const modifierHeld = (key = 'shiftKey') => (ctx) => !!(ctx.event && ctx.event[key]);

/**
 * Predicate: that modifier is NOT held (the default/plain gesture).
 * @param {string} [key]
 * @returns {(ctx: any) => boolean}
 */
export const modifierFree = (key = 'shiftKey') => (ctx) => !(ctx.event && ctx.event[key]);
