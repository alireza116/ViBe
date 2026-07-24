// @ts-check
// slide driver — the drag lifecycle for a RELATIVE `slide` edit (edit.slide with
// mode:'relative'). Absolute slide is a stateless direct edit and needs no driver;
// relative slide must remember where the grab began, and only a driver can stash
// that in the per-feature session.
//
// At dragstart it locks onto the nearest datum-bearing mark and freezes the grab
// pixel (on the edit's axis) plus that datum's current field value; each drag tick
// it re-runs the edit against the locked datum, which reads the frozen anchor from
// the session and moves the value proportionally to the pointer's displacement.
// The math lives in the edit (apply's relative branch), exactly as axisDrag leaves
// the domain math to edit.axis.scale — the driver owns only target selection and
// the multi-event lifecycle.
//
// Being a lifecycle driver, it raises the plane above the marks (needsPlaneOnTop),
// so it cannot share a chart with direct-pick edits — use absolute slide inside a
// glyph, relative slide only on a standalone magnitude chart.

import { nearestMark, pickThreshold } from '../pick.js';

const GRAB_THRESHOLD = 40;

/** @type {import('./index.js').Driver} */
export const slideDriver = {
    name: 'slide',
    wants: (e) => e.pick === 'slide',
    onEvent({ feature, event, edits, marks, data, session, runEdit }) {
        const edit = edits[0];
        if (!edit) return false;
        const axis = /** @type {any} */ (edit).axis === 'y' ? 'y' : 'x';
        const threshold = pickThreshold(edit) || GRAB_THRESHOLD;
        let changed = false;

        if (event.type === 'dragstart') {
            // Lock onto the nearest mark and freeze the anchor (grab pixel + value)
            // for the whole gesture — or nothing, if the press missed every mark.
            const index = nearestMark(marks, event.x, event.y, threshold);
            if (index == null) return false;
            const name = (edit.channels && edit.channels[0]) || null;
            const field = name && feature.channels && feature.channels[name] && feature.channels[name].field;
            if (!field) return false;
            const startValue = data[index] && data[index][field];
            if (typeof startValue !== 'number') return false;
            session.set({ index, startPx: axis === 'x' ? event.x : event.y, startValue });
            changed = true;
        } else if (event.type === 'drag') {
            const lock = session.get();
            if (lock && lock.index != null && runEdit(edit, lock.index)) changed = true;
        } else if (event.type === 'dragend' || event.type === 'hoverout') {
            session.clear();
            changed = true;
        }
        return changed;
    }
};
