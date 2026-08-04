// @ts-check
// face.js — the FACE-scoped edits (scope 'face').
//
// A face glyph's handles are not per-row marks the way a bar's are: seven facial
// parameters (mouthCurve, mouthOpen, mouthAsym, eyeScale, eyeSquint, browHeight,
// browTilt) all live on ONE feature over ONE datum, and each handle is a sub-element
// with its own drag TRACK. The mark computes those tracks (they are derived from the
// face's radius, not from a scale) and stamps each on its handle as `node.dm`; this
// edit maps the pointer along the grabbed handle's track back to the field's value.
//
//   edit.face.expression()  drag any bound facial parameter's handle
//   edit.face.move()        drag the head itself to reposition the whole glyph
//
// ── Why these are exported at all ───────────────────────────────────────────
// They used to be built inline inside `plot/face.js` and attached to every face
// unconditionally, which broke the rule the rest of the library follows: a mark is
// inert until an edit says which column a gesture writes. Worse, being unexported
// they could not be replaced, restaged, gated with `when`, or given a constraint —
// `face({ edits: [] })` was still fully draggable. Naming them puts a face on the
// same footing as every other mark:
//
//   face({
//     channels: {
//       x:          { field: 'valence', edit: edit.face.move() },
//       y:          { field: 'arousal', edit: edit.face.move() },
//       mouthCurve: { field: 'joy',     edit: edit.face.expression() },
//     },
//   })
//
// ── What gets written ───────────────────────────────────────────────────────
// The field comes from the handle's own track (`node.dm[axis].field`), which the
// mark resolved from the channel map — so an edit still ends in a write to a column
// the spec named. A parameter channel with no field draws but emits no handle, so
// there is nothing to grab and nothing to write.

import { makeEdit, resolveMarkNode, linearInvert } from './shared.js';
import { move as moveEdit } from './basic.js';

/**
 * Apply a direct-manipulation drag: for each axis the grabbed node binds
 * (`node.dm.x` / `node.dm.y`), map the pointer's position along that axis's track to
 * the field's value. This is the same linear track→value mapping the universal
 * `slide` edit uses (`linearInvert`) — a face handle IS an absolute-mode slide, one
 * per bound param, so the two interactions never diverge.
 * @param {import('../types').EditContext} ctx
 * @returns {any}
 */
function applyExpression(ctx) {
    const node = resolveMarkNode(ctx);
    const d = ctx.datum;
    if (!node || !node.dm || !d) return undefined;
    // A handle can bind BOTH axes (a brow's tilt on x, its height on y). When the
    // edit was declared for specific channels, write only those — otherwise
    // declaring an edit on `browTilt` would silently also write `browHeight`, and
    // the channel it was attached to would not be the channel it edits.
    const claims = ctx.edit && ctx.edit.channels;
    const out = { ...d };
    let changed = false;
    for (const axis of /** @type {const} */ (['x', 'y'])) {
        const spec = node.dm[axis];
        if (!spec) continue;
        if (claims && claims.length && !claims.includes(spec.channel)) continue;
        const px = axis === 'x' ? ctx.pointer.x : ctx.pointer.y;
        const v = linearInvert(px, spec.pxAt0, spec.pxAt1, spec.loVal, spec.hiVal);
        if (v === undefined) continue;
        out[spec.field] = v;
        changed = true;
    }
    return changed ? out : undefined;
}

/**
 * The parameter channels a grabbed handle's drag tracks write.
 * @param {any} node
 * @returns {string[]}
 */
function paramsOf(node) {
    const dm = node && node.dm;
    if (!dm) return [];
    return ['x', 'y']
        .map((axis) => dm[axis] && dm[axis].channel)
        .filter(Boolean);
}

/**
 * edit.face.expression — drag a facial-parameter handle (an eyelid, a lip corner, a
 * brow, the size grip) along its track.
 *
 * One factory covers all seven params rather than one each, because which parameter
 * a drag writes is decided by WHICH HANDLE was grabbed — the handle carries its own
 * channel and field. Both placements work and mean different things:
 *
 *   face({ edits: [edit.face.expression()] })          every bound handle is draggable
 *   channels: { mouthCurve: { field: 'joy',
 *                             edit: edit.face.expression() } }   only that handle
 *
 * The second form works because a channel-attached edit gets `channels: ['mouthCurve']`
 * injected by the router, and the guard below refuses a handle that writes some other
 * parameter — the same "claim your own handle" arbitration trend and area use, which a
 * glyph needs whenever several handles share one feature over one datum.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function expression(options = {}) {
    return makeEdit({
        type: 'faceExpression',
        gesture: 'drag',
        pick: 'direct',
        scope: 'face',
        ...options,
        when: (/** @type {import('../types').EditContext} */ ctx) => {
            // Only a node carrying a drag track — i.e. a facial handle. The head
            // outline has no `dm`, so a drag there falls through to edit.face.move().
            if (!ctx.node || !ctx.node.dm) return false;
            // Declared for specific channels? Then claim only those handles.
            const claims = ctx.edit && ctx.edit.channels;
            if (claims && claims.length) {
                const params = paramsOf(ctx.node);
                if (!params.some((p) => claims.includes(p))) return false;
            }
            return options.when ? options.when(ctx) : true;
        },
        apply: applyExpression,
    });
}

/**
 * edit.face.move — reposition the whole glyph by dragging the head.
 *
 * Rides the universal `move`, gated to the outline node so it never fires on an
 * eye/brow/lip handle (those carry `dm` and belong to `expression()`). Meaningful
 * only when x AND y are bound to fields — a face placed on one axis (a face per
 * category) has nowhere to move to, and a face at a constant position has no column
 * to write; in both cases the mark draws no grabbable outline.
 * @param {any} [options]
 * @returns {import('../types').Edit}
 */
export function move(options = {}) {
    const { channels = ['x', 'y'], ...rest } = options;
    return moveEdit({
        channels,
        scope: 'face',
        ...rest,
        when: (/** @type {import('../types').EditContext} */ ctx) => {
            if (!(ctx.node && ctx.node.role === 'outline')) return false;
            return options.when ? options.when(ctx) : true;
        },
    });
}
