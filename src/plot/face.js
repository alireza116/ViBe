// @ts-check
// face.js — an expressive, PARAMETRIC emotion face (a Chernoff-style glyph). A
// datum's emotion FIELDS are encoded into facial geometry, and you edit them by
// DIRECTLY MANIPULATING the features: grab the mouth and pull it into a smile,
// drag an eye wider, tilt a brow. "An edit is the inverse of encoding" made a face.
//
//   Elicit({
//     schema: { valence: { type: 'quantitative', domain: [-1, 1] },
//               arousal: { type: 'quantitative', domain: [-1, 1] } },
//     data: [{ valence: 0, arousal: 0 }],
//     features: [ face() ],            // preset: mouth = valence, eyes = arousal
//   })
//
// ── Parameters are CHANNELS ──────────────────────────────────────────────────
// A face has seven independent PARAMETERS, and each is a non-positional channel
// declared exactly like `fill`/`size`/`x` — there is no bespoke `features` map.
// Bind a field with `{ field }` (the param becomes EDITABLE, drag it to write the
// field back); pin a fixed expression with a constant `{ value }` (rendered but not
// elicited). An unbound param renders at neutral (0.5), so a partial face is still
// a whole face.
//
//   face()                                   // emotion preset (see below)
//   face({ channels: {                       // a full Chernoff glyph
//     mouthCurve: { field: 'joy' },
//     browTilt:   { field: 'anger' },
//     eyeScale:   { field: 'shock' },
//   } })
//
// Zero-config `face()` applies the emotion preset (mouthCurve ← valence, eyeScale
// ← arousal). Binding ANY param channel REPLACES the preset outright, so an unbound
// preset default never references a field the schema lacks.
//
//   PARAM        FEATURE / MEANING                         low  ↔  high
//   mouthCurve   mouth curvature   deep frown ∩ ↔ deep smile U
//   mouthOpen    mouth openness    closed line ↔ wide cavity
//   mouthAsym    mouth asymmetry   centred ↔ pulled to one side (smirk)
//   eyeScale     eye aperture      pinpricks ↔ huge
//   eyeSquint    eye squint        round ↔ flat/squished
//   browHeight   brow height       slammed down ↔ high arch
//   browTilt     brow tilt         outer-down (sad) ↔ inner-down (angry)
//
// ── Direct manipulation (the trend model) ────────────────────────────────────
// A face is a single-datum glyph, like `trend`: its parts share ONE feature over
// ONE datum. Every part's pixels DERIVE from the params, and the editable parts
// are their OWN drag targets — no floating handles. A feature that carries two
// params is a 2-D drag (mouth: ↕ curve, ↔ asym; brow: ↕ height, ↔ tilt); the two
// eyelid/lip params (eye squint, mouth open) get a small handle on the eyelid/lip.
// A generic edit reads the grabbed node's `dm` descriptor and inverts the pointer
// through each param's own [0,1] scale, so this stays on the ONE inversion path.
//
// The centre is placed through the global x/y scales when those channels carry
// fields (small-multiples / an emotion-space scatter), else parked at the plot
// centre. The outline is a PATH (not a circle) so the mouth path, drawn after it,
// is not hidden beneath it — the renderer paints all circles above all paths.

import { makeEdit, resolveMarkNode } from '../edit/shared.js';
import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

/** @param {number} x @returns {number} */
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

// The seven facial parameters, each a non-positional channel. If the author binds
// none of them, the emotion preset (mouthCurve ← valence, eyeScale ← arousal) fills
// in; binding any one replaces the preset.
/** @type {string[]} */
const FACE_PARAMS = ['mouthCurve', 'mouthOpen', 'mouthAsym', 'eyeScale', 'eyeSquint', 'browHeight', 'browTilt'];

/** An SVG path for a circle / ellipse centred at (cx, cy). */
const ellipsePath = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry) =>
    `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/**
 * Apply a direct-manipulation drag: invert the pointer on each axis the grabbed
 * node binds (`node.dm.x` / `node.dm.y`), through that param's own [0,1] scale.
 * @param {import('../types').EditContext} ctx
 * @returns {any}
 */
function applyFace(ctx) {
    const node = resolveMarkNode(ctx);
    const d = ctx.datum;
    if (!node || !node.dm || !d) return undefined;
    const out = { ...d };
    let changed = false;
    for (const axis of /** @type {const} */ (['x', 'y'])) {
        const spec = node.dm[axis];
        if (!spec || spec.pxAt1 === spec.pxAt0) continue;
        const px = axis === 'x' ? ctx.pointer.x : ctx.pointer.y;
        const t = clamp01((px - spec.pxAt0) / (spec.pxAt1 - spec.pxAt0));
        const scale = ctx.scales[spec.channel];
        out[spec.field] = scale && scale.invertible
            ? scale.invertValue(t)
            : spec.loVal + t * (spec.hiVal - spec.loVal);
        changed = true;
    }
    return changed ? out : undefined;
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function face(options = {}) {
    const opts = normalizeMarkOptions(options);
    const {
        id,
        edits: userEdits,
        constraints,
        handleSize = 5,
        handles = true,
    } = opts;

    // The params are ordinary channels (declared in `channels`, or via the x/y
    // shorthands opts already merged). If the author bound none of the seven, apply
    // the emotion preset; binding any one replaces it, so an unbound preset default
    // never points at a field the schema lacks.
    /** @type {Record<string, any>} */
    const channels = { ...opts.channels };
    if (!FACE_PARAMS.some((p) => channels[p])) {
        channels.mouthCurve = { field: 'valence' };
        channels.eyeScale = { field: 'arousal' };
    }

    const faceEdit = makeEdit({
        type: 'face',
        gesture: 'drag',
        when: (/** @type {import('../types').EditContext} */ ctx) => !!ctx.node && !!ctx.node.dm,
        apply: applyFace,
    });

    return {
        id,
        channels,
        constraints,
        edits: [faceEdit, ...(userEdits || [])],
        xKey: channels.x && channels.x.field,
        yKey: channels.y && channels.y.field,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            // A face's radius comes from the `size` channel like every other shape
            // mark's does — so `size: 40` (a constant) and `size: { field: 'n' }`
            // (a scaled radius per face) both work. Resolved per datum, since a
            // field-driven size differs row to row.
            const defaultR = Math.min(width, height) * 0.35;
            const ink = '#1f2937';

            // A dm-axis descriptor for `param`, or undefined when it isn't bound
            // (so an unbound param is neutral and non-editable). loVal/hiVal fall
            // back the linear invert when a scale is somehow missing.
            /** @param {string} param @param {number} pxAt0 @param {number} pxAt1 */
            const axisSpec = (param, pxAt0, pxAt1) => {
                // Editable only when bound to a FIELD — a constant `{ value }` param
                // is rendered but not elicited (nothing to write back).
                if (!channels[param] || channels[param].field === undefined) return undefined;
                const scale = scales[param];
                const dom = scale && scale.domainConfig;
                return {
                    channel: param, field: channels[param].field, pxAt0, pxAt1,
                    loVal: Array.isArray(dom) ? dom[0] : 0,
                    hiVal: Array.isArray(dom) ? dom[dom.length - 1] : 1,
                };
            };

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            currentData.forEach((/** @type {any} */ d, /** @type {number} */ i) => {
                const cx = encodeChannel(scales, channels, 'x', d, width / 2);
                const cy = encodeChannel(scales, channels, 'y', d, height / 2);
                const R = encodeChannel(scales, channels, 'size', d, defaultR);
                // Every feature is drawn relative to R, so the ink scales with the
                // face rather than turning spidery on a big one / blotting a small one.
                const stroke = Math.max(2, R * 0.055);
                const style = resolveStyle(scales, channels, d, { fill: '#FFD666', stroke: '#B7791F' });

                // Each param in [0,1] through its scale; unbound -> 0.5 (neutral).
                /** @param {string} p */
                const P = (p) => clamp01(encodeChannel(scales, channels, p, d, 0.5));
                const pC = P('mouthCurve'), pO = P('mouthOpen'), pAs = P('mouthAsym');
                const pS = P('eyeScale'), pSq = P('eyeSquint');
                const pH = P('browHeight'), pT = P('browTilt');

                // Attach `dm` to a node, and make it a grab target — unless no axis
                // is bound, in which case it is an inert visual (pointer-transparent),
                // like trend's line.
                /** @param {any} node @param {any} [dmX] @param {any} [dmY] */
                const editable = (node, dmX, dmY) => {
                    if (dmX || dmY) { node.dm = { x: dmX, y: dmY }; node.cursor = 'grab'; }
                    else node.pointerEvents = 'none';
                    node.data = d; node.index = i;
                    return node;
                };

                // ── Outline (a PATH so the mouth, drawn after, isn't hidden under a
                //    filled circle). Always inert. ──────────────────────────────
                nodes.push({
                    type: 'path', d: ellipsePath(cx, cy, R, R),
                    fill: style.fill || '#FFD666',
                    stroke: style.stroke || '#B7791F',
                    strokeWidth: Math.max(1.5, R * 0.03),
                    pointerEvents: 'none',
                });

                // ── Mouth (path). ↕ = curve (up = smile), ↔ = asymmetry. Open >0.1
                //    draws a filled cavity, else a stroked curve. ────────────────
                const mouthBaseY = cy + 0.34 * R;
                const lift = (pC - 0.5) * 2 * 0.24 * R;   // + = corners up (smile)
                const asymOff = (pAs - 0.5) * 2 * 0.14 * R;
                const xL = cx - 0.36 * R, xR = cx + 0.36 * R;
                const yL = mouthBaseY - lift + asymOff;
                const yR = mouthBaseY - lift - asymOff;
                const ctrlY = mouthBaseY + lift;
                const upperD = `M ${xL} ${yL} Q ${cx} ${ctrlY} ${xR} ${yR}`;
                // Visible mouth (inert): a stroked curve, or a filled cavity when open.
                if (channels.mouthOpen && pO > 0.1) {
                    const gap = pO * 0.34 * R;
                    nodes.push({
                        type: 'path',
                        d: `M ${xL} ${yL} Q ${cx} ${ctrlY - gap * 0.25} ${xR} ${yR} Q ${cx} ${ctrlY + gap} ${xL} ${yL} Z`,
                        fill: '#8a3d3d', stroke: ink, strokeWidth: stroke * 0.8, pointerEvents: 'none',
                    });
                } else {
                    nodes.push({ type: 'path', d: upperD, fill: 'none', stroke: ink, strokeWidth: stroke, pointerEvents: 'none' });
                }
                // A fat, invisible hit-path along the mouth carries the drag — a thin
                // stroked mouth is otherwise a tiny target (only its stroke hit-tests).
                const mouthDmX = axisSpec('mouthAsym', cx - 0.4 * R, cx + 0.4 * R);
                const mouthDmY = axisSpec('mouthCurve', mouthBaseY + 0.30 * R, mouthBaseY - 0.30 * R);
                if (mouthDmX || mouthDmY) {
                    const hit = editable(
                        { type: 'path', d: upperD, fill: 'none', stroke: 'transparent', strokeWidth: Math.max(18, R * 0.34) },
                        mouthDmX, mouthDmY);
                    hit.pointerEvents = 'stroke';
                    nodes.push(hit);
                }

                // ── Eyes (ellipse paths). ↕ = aperture; squint flattens ry. A tiny
                //    eyelid handle drives squint (drag down = squint). ───────────
                const eyeDX = 0.40 * R;
                const eyeY = cy - 0.16 * R;
                const rx = 0.055 * R + 0.13 * R * pS;
                const ry = rx * (1 - 0.82 * pSq);
                for (const sign of [-1, 1]) {
                    const ex = cx + sign * eyeDX;
                    nodes.push(editable(
                        { type: 'path', d: ellipsePath(ex, eyeY, rx, ry), fill: ink, stroke: 'none' },
                        undefined,
                        axisSpec('eyeScale', eyeY + 0.30 * R, eyeY - 0.45 * R)));
                }

                // ── Brows (lines). ↕ = height, ↔ = tilt (drag right = inner-down /
                //    angry). Both brows carry the same 2-D descriptor. ───────────
                const browBaseY = cy - 0.40 * R;
                const browY = browBaseY - (pH - 0.5) * 0.34 * R;
                const tiltOff = (pT - 0.5) * 0.42 * R;
                const browDmY = axisSpec('browHeight', browBaseY + 0.17 * R, browBaseY - 0.17 * R);
                const browDmX = axisSpec('browTilt', cx - 0.30 * R, cx + 0.30 * R);
                for (const sign of [-1, 1]) {
                    const inner = cx + sign * 0.14 * R, outer = cx + sign * 0.5 * R;
                    nodes.push(editable(
                        { type: 'line', x1: inner, y1: browY + tiltOff, x2: outer, y2: browY - tiltOff, stroke: ink, strokeWidth: stroke },
                        browDmX, browDmY));
                }

                // ── Eyelid / lip handles for the two "pull" params. Small dots at
                //    the eyelid and lower lip; grabbable even when handles:false. ─
                /** @param {number} hx @param {number} hy @param {any} dmY */
                const pushHandle = (hx, hy, dmY) => {
                    if (!dmY) return;
                    nodes.push(editable({
                        type: 'circle', cx: hx, cy: hy, r: handleSize,
                        fill: handles ? 'rgba(15,23,42,0.5)' : 'transparent',
                        stroke: handles ? '#fff' : 'none', strokeWidth: handles ? 1.25 : 0,
                    }, undefined, dmY));
                };
                // Squint: eyelid of the right eye, drag DOWN to squint.
                pushHandle(cx + eyeDX, eyeY - ry, axisSpec('eyeSquint', eyeY - 0.16 * R, eyeY + 0.30 * R));
                // Open: lower lip, drag DOWN to open.
                pushHandle(cx, mouthBaseY + (channels.mouthOpen && pO > 0.1 ? pO * 0.34 * R : 0) + 0.02 * R,
                    axisSpec('mouthOpen', mouthBaseY + 0.02 * R, mouthBaseY + 0.42 * R));
            });

            return nodes;
        },
    };
}
