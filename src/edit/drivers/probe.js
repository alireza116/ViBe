// @ts-check
// probe.js — the hover-preview / click-commit lifecycle. No drag: the pointer
// PROBES a value (the mark follows the cursor as an uncommitted preview) and a
// click SETTLES it (commits the datum and advances the stage). It is the
// interaction behind the classic multi-step elicitations — "move the line, click
// to set it; now move to open the cone, click to set that too" — and behind the
// dot plot's tentative dot that only becomes real on click.
//
//   angle:  { field: 'r',      edit: rotate({ pick: 'probe', stage: 0 }) }
//   spread: { field: 'spread', edit: rotate({ pick: 'probe', stage: 1, relativeTo: 'angle' }) }
//
// It runs the SAME edit twice through two engine entry points that share one
// `computeEdit` (apply + invariants): `previewEdit` on hover (parked in the
// transient preview store, never seen by onChange/getData) and `runEdit` on click
// (committed). So the preview is guaranteed to be exactly what the click writes —
// there is no second, drifting "preview" code path.
//
// Stage advance: an edit that carries a `stage` settles that stage on click, so
// the driver calls `stage.next()` and the engine's stage gate deactivates it —
// the field is frozen and the next stage's edit takes over. An unstaged probe
// edit (the dot plot's `create`) just commits, over and over. `advance: false`
// opts a staged edit out.

import { nearestMark, pickThreshold } from '../pick.js';

/**
 * The datum a probe gesture targets. Whole-dataset edits (rotate, create) ignore
 * it; a per-datum edit (drag) needs one, so resolve the nearest mark — and treat
 * a single-datum feature (a cone, a trend line) as always being the target, since
 * its glyph is drawn from that one belief and carries no pickable node.
 * @param {any} ctx
 * @param {import('../../types').Edit} edit
 * @returns {number | null}
 */
function targetIndex(ctx, edit) {
    const { marks, data, event } = ctx;
    if (event.x != null && event.y != null) {
        const hit = nearestMark(marks, event.x, event.y, pickThreshold(edit));
        if (hit != null) return hit;
    }
    return data.length === 1 ? 0 : null;
}

/** @type {import('./index.js').Driver} */
export const probeDriver = {
    name: 'probe',
    wants: (edit) => edit.pick === 'probe',
    onEvent: (ctx) => {
        const { event, edits, preview, stage, runEdit, previewEdit } = ctx;
        if (!edits.length) return false;

        // Hover: propose, don't commit. The preview supersedes the feature's data
        // for the next render only.
        if (event.type === 'hover') {
            let changed = false;
            for (const edit of edits) {
                if (previewEdit(edit, targetIndex(ctx, edit))) changed = true;
            }
            return changed;
        }

        // Leaving the plane drops the proposal — the mark snaps back to the last
        // committed belief.
        if (event.type === 'hoverout') return preview.clear();

        // Click: settle. Commit the same proposal, then advance past any stage the
        // committed edits belong to (the gate then deactivates them).
        if (event.type === 'click') {
            let changed = false;
            let advance = false;
            for (const edit of edits) {
                if (!runEdit(edit, targetIndex(ctx, edit))) continue;
                changed = true;
                if (edit.stage != null && edit.advance !== false) advance = true;
            }
            if (advance) stage.next();
            return changed;
        }

        return false;
    }
};
