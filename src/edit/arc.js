// @ts-check
// arc.js — the ARC-scoped edit (scope 'arc'). A pie/donut has no per-datum handle
// to drag the way a bar does; instead its BOUNDARIES are draggable. The arc mark
// emits one handle per movable interior boundary between two adjacent slices
// (loIndex, hiIndex), each stamped with the ring geometry. The full-circle seam is
// the fixed layout anchor and is therefore not independently draggable. This edit
// turns a drag of a handle into a pair-shift: value moves between exactly those two
// slices, holding their pair sum (and therefore the grand total) constant.
//
// Namespaced under `edit.arc.*` (mirroring `edit.axis.*` / `edit.line.*`) so the
// scope shows in the name. Whole-dataset apply (returns the full array, never
// mutates ctx.data), direct-pick (routes to the touched handle's feature only).
//
// When the arc mark is GRIDDED (x/y bound to a field → one donut per slot), each
// boundary handle carries its slot's `members` (the global indices of that donut's
// slices). The pair-shift then reads total/span from those members alone, so a drag
// redistributes within one donut and leaves every other slot untouched — the
// per-slot sum a pie holds by construction. A lone donut stamps every row, so the
// single-pie path is exactly the members === all-rows case.

import { makeEdit } from './shared.js';
import { pointerDegrees } from '../core/encoding.js';

/**
 * edit.arc.edge — drag a slice boundary to move value between the two slices it
 * separates. Only those two slices change: one grows by exactly what the other
 * loses, so the pair sum (and the pie total) is preserved. The boundary tracks the
 * pointer along the pair's own angular span, whose OUTER edges stay fixed during
 * the drag.
 * @param {{}} [options]
 * @returns {import('../types').Edit}
 */
export function edge(options = {}) {
    return makeEdit({
        type: 'edge',
        gesture: 'drag',
        pick: 'direct',
        scope: 'arc',
        // Only a boundary handle triggers this (slice paths are inert for it).
        when: (/** @type {import('../types').EditContext} */ ctx) => !!(ctx.node && ctx.node.edge),
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const node = /** @type {any} */ (ctx.node);
            if (!node || !node.edge) return undefined;
            // The arc's magnitude channel (`value`) — the field the pie normalizes
            // into sweeps, and therefore the one a boundary drag redistributes.
            const valueCh = ctx.markChannels && ctx.markChannels.value;
            const field = valueCh && valueCh.field;
            const data = ctx.data;
            if (!field || !data || !data.length) return undefined;

            const lo = node.loIndex;
            const hi = node.hiIndex;
            if (lo == null || hi == null) return undefined;

            // The slices of THIS donut, as GLOBAL dataset indices in slice order. A
            // gridded donut mark stamps its slot's members here, so the layout math
            // (total, usable span, the lo slice's leading edge) is scoped to ONE
            // donut and a boundary drag redistributes within it alone — never across
            // slots. A lone donut stamps every row; an older handle with no stamp
            // falls back to the whole dataset (the pre-grid behaviour).
            const members = Array.isArray(node.members) && node.members.length
                ? node.members
                : data.map((/** @type {any} */ _d, /** @type {number} */ i) => i);
            const loLocal = members.indexOf(lo);
            const hiLocal = members.indexOf(hi);
            if (loLocal < 0 || hiLocal < 0) return undefined;

            const cx = node.pivotX;
            const cy = node.pivotY;
            const spanStart = node.spanStart;
            const spanEnd = node.spanEnd;
            const pad = node.pad || 0;

            // Magnitudes in data units (pie layout normalizes by their sum), over this
            // donut's members only.
            const mags = members.map((/** @type {number} */ gi) => {
                const v = Number(data[gi][field]);
                return Number.isFinite(v) && v > 0 ? v : 0;
            });
            const total = mags.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
            if (total <= 0) return undefined;
            const n = members.length;
            const span = spanEnd - spanStart;
            const usable = span - pad * n;
            if (usable === 0) return undefined;

            const pairSum = mags[loLocal] + mags[hiLocal];
            if (pairSum <= 0) return undefined;
            const pairSweep = usable * pairSum / total; // signed degrees the pair spans
            const sweepMag = Math.abs(pairSweep);
            if (sweepMag < 1e-9) return undefined;

            // Leading edge (start angle) of the lo slice — the fixed anchor the pointer
            // fraction is measured from. Stable through the drag because a pair edit
            // holds cumBefore(lo) and pairSum constant, so it re-derives identically
            // each tick. Positions are LOCAL to the donut (its own slice order).
            const cumBeforeLo = mags.slice(0, loLocal).reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0);
            const a0Lo = spanStart + pad / 2 + loLocal * pad + usable * (cumBeforeLo / total);

            // Fraction of the pair the lo slice should occupy, from the pointer angle.
            // Measure the angular distance from a0Lo in the layout's sweep direction,
            // modulo a full turn, then clamp to [0,1] — resolving "outside the pair"
            // to whichever end is nearer.
            const dir = Math.sign(usable) || 1;
            const theta = pointerDegrees(ctx.pointer, { cx, cy });
            const raw = (((theta - a0Lo) * dir) % 360 + 360) % 360; // [0, 360)
            let frac;
            if (raw <= sweepMag) frac = raw / sweepMag;
            else frac = (raw - sweepMag) < (360 - raw) ? 1 : 0;

            const newLo = frac * pairSum;
            const newHi = pairSum - newLo;
            return data.map((/** @type {any} */ d, /** @type {number} */ i) => {
                if (i === lo) return { ...d, [field]: newLo };
                if (i === hi) return { ...d, [field]: newHi };
                return d;
            });
        }
    });
}
