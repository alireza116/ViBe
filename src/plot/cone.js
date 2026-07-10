// @ts-check
// cone.js — a line + cone correlation glyph. A single datum { r, spread } is a
// belief about a relationship: `r` is the most-likely correlation (a line through
// the plot centre, rotating from -45deg to +45deg as r goes -1 -> +1) and
// `spread` is the uncertainty (a fan of sample lines around the mean line).
//
// Paired with the `probe` driver it is the classic two-step elicitation: the line
// FOLLOWS the pointer, a click sets it; then the cone opens with the pointer, and
// a click sets that too.
//
//   // Elicit({ data: [{ r: 0, spread: 0 }], features: [ cone({ … }) ] })
//   cone({
//     channels: {
//       angle:  { field: 'r',      type: 'linear', domain: [-1, 1], range: [-45, 45],
//                 edit: rotate({ pick: 'probe', stage: 0 }) },
//       spread: { field: 'spread', type: 'linear', domain: [0, 1],  range: [0, 45],
//                 edit: rotate({ pick: 'probe', stage: 1, relativeTo: 'angle' }) },
//     },
//   })
//
// The mean line's slope is the `angle` channel resolved through encodeChannel —
// the one field->pixel path — and every sample line's slope is likewise its
// sampled r ENCODED through the same angle scale.
//
// `spread` is the HALF-WIDTH of the plausible envelope in r units, not a raw SD:
// that is the quantity the pointer names, so the line under the cursor is the
// edge of the fan. Samples are drawn from Normal(r, spread / sigma) with sigma
// = 1.96, so ~95% of them fall inside the envelope the reader pointed at. The
// spread channel's scale (r units -> degrees) exists so `rotate({ relativeTo })`
// can invert the "open the cone" gesture back into that half-width.
//
// All nodes are non-interactive: the whole plane is the gesture surface (rotate
// is a plane/probe-pick edit), exactly how a line's connector sits under its handles.

import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

/** Deterministic PRNG so the sampled fan is STABLE across re-renders. */
function mulberry32(/** @type {number} */ seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A standard-normal draw (Box-Muller) from a uniform generator. */
function gauss(/** @type {() => number} */ rnd) {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (/** @type {number} */ v, /** @type {number} */ lo, /** @type {number} */ hi) =>
    Math.max(lo, Math.min(hi, v));

/**
 * @param {any} [options]
 * @returns {any}
 */
export function cone(options = {}) {
    const opts = normalizeMarkOptions(options);
    const {
        channels = {},
        id,
        edits,
        constraints,
        samples = 40,
        seed = 7,
        wedge = false,
        // `spread` is the HALF-WIDTH of the plausible envelope (in r units), not a
        // raw SD — that is what the gesture points at, so the line the pointer sits
        // on is the edge of the fan. Samples are drawn with sd = spread / sigma, so
        // ~95% of them land inside it (the 1.96 of a normal envelope).
        sigma = 1.96
    } = opts;

    const angleField = channels.angle && channels.angle.field;
    const spreadField = channels.spread && channels.spread.field;

    return {
        id,
        channels,
        edits,
        constraints,
        xKey: angleField,
        yKey: spreadField,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            const cx = width / 2;
            const cy = height / 2;
            // A line through the centre at `deg` (math angle, y-up), spanning the
            // full plot width. Slope max is |tan 45deg| = 1, so it never goes
            // vertical — endpoints at x=0 and x=width are always finite.
            const lineAt = (/** @type {number} */ deg) => {
                const m = -Math.tan((deg * Math.PI) / 180); // screen slope (y down)
                return { x1: 0, y1: cy + m * (0 - cx), x2: width, y2: cy + m * (width - cx) };
            };

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            currentData.forEach((/** @type {any} */ d) => {
                const meanDeg = encodeChannel(scales, channels, 'angle', d, 0);
                const rMean = angleField != null ? Number(d[angleField]) : 0;
                const halfWidth = spreadField != null ? Math.abs(Number(d[spreadField])) || 0 : 0;
                const angleScale = scales.angle;
                const style = resolveStyle(scales, channels, d, { stroke: '#d33' });

                // Optional filled wedge spanning the envelope — its edges are exactly
                // where the pointer sat when the spread was set.
                if (wedge && halfWidth > 0 && angleScale) {
                    const loDeg = angleScale.encode(clamp(rMean - halfWidth, -1, 1));
                    const hiDeg = angleScale.encode(clamp(rMean + halfWidth, -1, 1));
                    const a = lineAt(loDeg);
                    const b = lineAt(hiDeg);
                    nodes.push({
                        type: 'path',
                        points: [[a.x1, a.y1], [a.x2, a.y2], [b.x2, b.y2], [b.x1, b.y1]],
                        curve: 'linear',
                        fill: style.stroke || '#d33',
                        fillOpacity: 0.08,
                        stroke: 'none',
                        pointerEvents: 'none',
                        background: true
                    });
                }

                // The cone: sample lines whose slopes are Normal(r, halfWidth / sigma)
                // drawn in r-space, each ENCODED through the angle scale (the one path).
                if (halfWidth > 0 && angleScale) {
                    const sd = halfWidth / sigma;
                    const rnd = mulberry32(seed);
                    for (let k = 0; k < samples; k++) {
                        const rk = clamp(rMean + sd * gauss(rnd), -1, 1);
                        const seg = lineAt(angleScale.encode(rk));
                        nodes.push({
                            type: 'line',
                            ...seg,
                            stroke: '#999',
                            strokeWidth: 1,
                            strokeOpacity: 0.15,
                            pointerEvents: 'none',
                            background: true
                        });
                    }
                }

                // The mean line, drawn on top.
                const mean = lineAt(meanDeg);
                nodes.push({
                    type: 'line',
                    ...mean,
                    stroke: style.stroke || '#d33',
                    strokeWidth: style.strokeWidth || 2.5,
                    ...(style.opacity != null ? { opacity: style.opacity } : {}),
                    pointerEvents: 'none'
                });
            });

            return nodes;
        }
    };
}
