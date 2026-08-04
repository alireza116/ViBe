// @ts-check
// trend.js — the TREND-scoped edits (scope 'trend'). A parametric line has no
// per-datum handle the way a bar does: the belief is `{ intercept, slope }` and the
// gesture names one of those PARAMETERS, so every edit here inverts the pointer
// through the x/y scales and then solves for the parameter it owns.
//
// Namespaced under `edit.trend.*` (mirroring `edit.line.*` / `edit.arc.*`) so the
// scope shows in the name. They need a `trend` or `trendBand` mark — the engine
// dev-warns via SCOPE_CAPABILITY when they land anywhere else.
//
//   intercept       translate: hold the slope, put the line's value at `anchor`
//                   under the pointer.
//   slope           rotate about the anchor POINT: hold its value, pass the line
//                   through the pointer.
//   interceptSpread the band's half-width at the anchor — the vertical gap between
//                   the pointer and the line there.
//   slopeSpread     the band's half-width in slope units — how far the line through
//                   the pointer tilts away from the committed one. This is the
//                   "open the cone" gesture, stated in slope space rather than
//                   degrees (it is the slope-space sibling of rotate({ relativeTo })).
//
// ── Where the gesture measures from ─────────────────────────────────────────
// The two rotational edits need a second x besides the anchor. When a HANDLE was
// grabbed (`ctx.node` is set) that x is the handle's own `probe` — the handle
// slides vertically and the line pivots. When there is no node — a plane or probe
// pick, where the pointer roams free — it is the pointer's OWN x, so the line
// simply passes through the cursor. That is what makes the classic two-step
// elicitation work ("move to aim, click to set"): under `pick: 'probe'` there is no
// node to read a channel tag off, so an edit that insisted on one could never fire.
//
// ── What gets written ───────────────────────────────────────────────────────
// Field names come from the mark's channel map, never from literals: an edit ends
// in `datum[field] = value`, and the field is whatever `channels.slope.field` says.
// A parameter with no field (a PINNED one, `intercept: { datum: 0 }`) is simply not
// written — which is how a correlation belief keeps its intercept at the origin
// without a constraint having to put it back.

import { makeEdit, claimEdge } from './shared.js';
import { anchorsOf, valueAt } from '../plot/trendGeometry.js';

/**
 * The column a parameter channel names, or null when the channel is pinned to a
 * constant / absent (nothing to write).
 * @param {import('../types').EditContext} ctx
 * @param {string} name
 * @returns {string | null}
 */
function fieldOf(ctx, name) {
    const spec = ctx.markChannels && ctx.markChannels[name];
    return spec && spec.field != null ? spec.field : null;
}

/** @param {import('../types').EditContext} ctx @param {string} name @param {number} fallback */
function paramOf(ctx, name, fallback) {
    const spec = ctx.markChannels && ctx.markChannels[name];
    if (!spec) return fallback;
    if (spec.field != null) {
        const v = ctx.datum ? Number(ctx.datum[spec.field]) : NaN;
        return Number.isFinite(v) ? v : fallback;
    }
    const constant = Number(spec.datum !== undefined ? spec.datum : spec.value);
    return Number.isFinite(constant) ? constant : fallback;
}

/**
 * The shared frame every trend edit solves in: the two scales, the anchor point's
 * current value, and the (x, y) the pointer names in data units. Returns null when
 * the gesture can't be inverted — a non-invertible axis, or a probe x that lands on
 * the anchor itself (where a rotation is undefined).
 * @param {import('../types').EditContext} ctx
 * @param {{ anchor?: number, probe?: number }} opts
 * @returns {{ a: number, b: number, anchor: number, probeX: number, yv: number, yAnchor: number } | null}
 */
function frameOf(ctx, opts) {
    const xScale = ctx.scales.x;
    const yScale = ctx.scales.y;
    if (!yScale || !yScale.invertible) return null;

    // A grabbed handle carries the anchor/probe of the MARK that drew it, so the
    // pivot is always the point the handle is actually sitting on. The edit's own
    // options are the override (and the only source when there is no node — a plane
    // or probe pick). Before this, an author who moved a trend's `anchor` had to
    // repeat it on both edits or the line would pivot somewhere the handle wasn't.
    const fromNode = ctx.node
        ? { anchor: ctx.node.anchor, probe: ctx.node.probe }
        : {};
    const { anchor, probe } = anchorsOf(ctx.scales, {
        anchor: opts.anchor != null ? opts.anchor : fromNode.anchor,
        probe: opts.probe != null ? opts.probe : fromNode.probe,
    });
    const a = paramOf(ctx, 'intercept', 0);
    const b = paramOf(ctx, 'slope', 0);

    // A grabbed handle pivots about its own probe x; a free pointer (plane/probe
    // pick) uses its own, so the line follows the cursor.
    let probeX = probe;
    if (!ctx.node) {
        if (!xScale || !xScale.invertible) return null;
        probeX = Number(xScale.invertValue(ctx.pointer.x));
    }
    if (!Number.isFinite(probeX) || probeX === anchor) return null;

    return { a, b, anchor, probeX, yv: Number(yScale.invertValue(ctx.pointer.y)), yAnchor: valueAt({ a, b }, anchor) };
}

/**
 * Write a partial onto the touched datum, or onto every row when the gesture
 * carries none (a plane pick has no index). Keys whose field is null — a pinned
 * parameter — are dropped rather than written to `undefined`.
 * @param {import('../types').EditContext} ctx
 * @param {Record<string, number>} byChannel channel name -> value
 * @returns {any}
 */
function writeParams(ctx, byChannel) {
    /** @type {Record<string, number>} */
    const patch = {};
    let any = false;
    for (const [name, value] of Object.entries(byChannel)) {
        const field = fieldOf(ctx, name);
        if (field == null || !Number.isFinite(value)) continue;
        patch[field] = value;
        any = true;
    }
    if (!any) return undefined;
    if (ctx.datum) return { ...ctx.datum, ...patch };
    if (!ctx.data.length) return undefined;
    return ctx.data.map((d) => ({ ...d, ...patch }));
}

/**
 * Build one trend edit: the scope, the handle tag it claims, and its solve.
 * @param {string} type
 * @param {string} claims the `channel` tag on the handle this edit owns
 * @param {(frame: NonNullable<ReturnType<typeof frameOf>>, ctx: import('../types').EditContext) => Record<string, number> | undefined} solve
 * @param {any} options
 * @returns {import('../types').Edit}
 */
function trendEdit(type, claims, solve, options) {
    const { anchor, probe, ...rest } = options || {};
    return claimEdge(makeEdit({
        type,
        gesture: 'drag',
        pick: 'direct',
        scope: 'trend',
        channels: [claims],
        ...rest,
        apply: (/** @type {import('../types').EditContext} */ ctx) => {
            const frame = frameOf(ctx, { anchor, probe });
            if (!frame) return undefined;
            const out = solve(frame, ctx);
            return out ? writeParams(ctx, out) : undefined;
        }
    }), claims);
}

/**
 * edit.trend.intercept — translate the line. Holds the slope and puts the line's
 * value at `anchor` under the pointer, so with the default anchor of 0 this is the
 * classic "drag the y-intercept".
 * @param {import('../types').TrendEditOptions} [options]
 * @returns {import('../types').Edit}
 */
export function intercept(options = {}) {
    return trendEdit('trendIntercept', 'intercept',
        (f) => ({ intercept: f.yv - f.b * f.anchor }), options);
}

/**
 * edit.trend.slope — rotate the line about the anchor POINT. The anchor's value is
 * held and the line is passed through the pointer, so the intercept is recomputed
 * to keep the pivot fixed. (When the intercept is pinned the recomputed value is
 * the pinned one, and `writeParams` drops it.)
 * @param {import('../types').TrendEditOptions} [options]
 * @returns {import('../types').Edit}
 */
export function slope(options = {}) {
    return trendEdit('trendSlope', 'slope', (f) => {
        const b = (f.yv - f.yAnchor) / (f.probeX - f.anchor);
        return { slope: b, intercept: f.yAnchor - b * f.anchor };
    }, options);
}

/**
 * edit.trend.interceptSpread — open the band vertically. The half-width is the gap
 * between the pointer and the line AT THE ANCHOR, so the band edge sits under the
 * cursor when the pointer is over the pivot.
 * @param {import('../types').TrendEditOptions} [options]
 * @returns {import('../types').Edit}
 */
export function interceptSpread(options = {}) {
    return trendEdit('trendInterceptSpread', 'interceptSpread',
        (f) => ({ interceptSpread: Math.abs(f.yv - f.yAnchor) }), options);
}

/**
 * edit.trend.slopeSpread — open the band angularly ("open the cone"). The
 * half-width, in slope units, is how far the line through the pointer tilts away
 * from the committed one — so the edge of the fan is exactly the line the reader
 * pointed at.
 * @param {import('../types').TrendEditOptions} [options]
 * @returns {import('../types').Edit}
 */
export function slopeSpread(options = {}) {
    return trendEdit('trendSlopeSpread', 'slopeSpread', (f) => {
        const through = (f.yv - f.yAnchor) / (f.probeX - f.anchor);
        return { slopeSpread: Math.abs(through - f.b) };
    }, options);
}
