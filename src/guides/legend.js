// @ts-check
// guides/legend.js — a non-interactive swatch row for a discrete (ordinal) channel.
// Pair with edit.legend({ channel, x, y, size, gap, columns }) using the SAME layout
// options so click hit-testing aligns with the drawn swatches.

import { resolveGuideOption } from './shared.js';

/**
 * @param {{ channel?: string, x?: number | ((ctx: any) => number),
 *   y?: number | ((ctx: any) => number), size?: number, gap?: number,
 *   columns?: number, labelWidth?: number }} [options]
 * @returns {{ isGuide: true, build: (ctx: any) => any[] }}
 */
export function legend(options = {}) {
    const {
        channel = 'fill',
        x = 8,
        y = 8,
        size = 14,
        gap = 6,
        columns,
        labelWidth = 48
    } = options;

    return {
        isGuide: true,
        /** @param {any} ctx */
        build: (ctx) => {
            const scale = ctx.scales && ctx.scales[channel];
            if (!scale || typeof scale.domain !== 'function') return [];
            const domain = scale.domain();
            if (!domain.length) return [];
            const ox = /** @type {number} */ (resolveGuideOption(x, ctx));
            const oy = /** @type {number} */ (resolveGuideOption(y, ctx));
            const cols = columns || domain.length;
            const pitch = size + gap + labelWidth;
            /** @type {any[]} */
            const nodes = [];
            domain.forEach((/** @type {any} */ value, /** @type {number} */ i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const sx = ox + col * pitch;
                const sy = oy + row * (size + gap);
                const encoded = typeof scale.encode === 'function'
                    ? scale.encode(value)
                    : (typeof scale === 'function' ? scale(value) : value);
                // A `symbol` channel encodes to a GLYPH, not a colour — draw the
                // swatch as the glyph itself (a glyph picker) rather than a colour chip.
                if (channel === 'symbol') {
                    nodes.push({
                        type: 'text',
                        x: sx + size / 2, y: sy + size / 2,
                        text: String(encoded),
                        fontSize: size, textAnchor: 'middle', dominantBaseline: 'central',
                        pointerEvents: 'none', guide: true
                    });
                } else {
                    nodes.push({
                        type: 'rect',
                        x: sx, y: sy, width: size, height: size,
                        fill: encoded, stroke: '#374151', strokeWidth: 1,
                        pointerEvents: 'none', guide: true
                    });
                }
                nodes.push({
                    type: 'text',
                    x: sx + size + 4, y: sy + size * 0.75,
                    text: String(value),
                    fill: '#374151', fontSize: 11, textAnchor: 'start',
                    pointerEvents: 'none', guide: true
                });
            });
            return nodes;
        }
    };
}
