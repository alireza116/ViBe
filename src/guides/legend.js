// @ts-check
// guides/legend.js — a non-interactive swatch row for a discrete (ordinal) channel.
// Pair with edit.legend({ channel, x, y, size, gap, columns }) using the SAME layout
// options so click hit-testing aligns with the drawn swatches.
//
// The layout itself lives in `legendLayout` below and is shared with edit.legend:
// the drawn swatch and the clickable box must agree to the pixel, and two copies of
// the same arithmetic is how they stop agreeing.

import { resolveGuideOption } from './shared.js';

/**
 * Where each legend swatch sits. The single source of truth for the swatch grid,
 * used both to DRAW the row (guides.legend) and to HIT-TEST it (edit.legend).
 *
 * `x`/`y` may be functions of the context (`x: ctx => ctx.width - 100`), like any
 * guide option — which is the other reason this is shared: the edit used to treat
 * them as plain numbers, so a derived position drew in one place and clicked in
 * another. Both contexts carry width/height/data/scales, so either can resolve them.
 * @param {{ x?: any, y?: any, size?: number, gap?: number, columns?: number,
 *   labelWidth?: number }} options
 * @param {number} count how many domain values
 * @param {any} ctx guide context or EditContext
 * @returns {{ size: number, slotAt: (i: number) => { x: number, y: number } }}
 */
export function legendLayout({ x = 8, y = 8, size = 14, gap = 6, columns, labelWidth = 48 }, count, ctx) {
    const ox = Number(resolveGuideOption(x, ctx));
    const oy = Number(resolveGuideOption(y, ctx));
    const cols = columns || count || 1;
    const pitch = size + gap + labelWidth;
    return {
        size,
        slotAt: (i) => ({
            x: ox + (i % cols) * pitch,
            y: oy + Math.floor(i / cols) * (size + gap),
        }),
    };
}

/**
 * @param {{ channel?: string, x?: number | ((ctx: any) => number),
 *   y?: number | ((ctx: any) => number), size?: number, gap?: number,
 *   columns?: number, labelWidth?: number }} [options]
 * @returns {{ isGuide: true, build: (ctx: any) => any[] }}
 */
export function legend(options = {}) {
    const { channel = 'fill', ...layout } = options;

    return {
        isGuide: true,
        /** @param {any} ctx */
        build: (ctx) => {
            const scale = ctx.scales && ctx.scales[channel];
            if (!scale || typeof scale.domain !== 'function') return [];
            const domain = scale.domain();
            if (!domain.length) return [];
            const { size, slotAt } = legendLayout(layout, domain.length, ctx);
            // Swatch stroke / label ink / size from the theme's legend tokens.
            const lt = (ctx.theme && ctx.theme.guide && ctx.theme.guide.legend) || {};
            const swatchStroke = lt.stroke || '#374151';
            const labelFill = lt.labelFill || '#374151';
            const labelSize = lt.fontSize || 11;
            /** @type {any[]} */
            const nodes = [];
            domain.forEach((/** @type {any} */ value, /** @type {number} */ i) => {
                const { x: sx, y: sy } = slotAt(i);
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
                        fill: encoded, stroke: swatchStroke, strokeWidth: 1,
                        pointerEvents: 'none', guide: true
                    });
                }
                nodes.push({
                    type: 'text',
                    x: sx + size + 4, y: sy + size * 0.75,
                    text: String(value),
                    fill: labelFill, fontSize: labelSize, textAnchor: 'start',
                    pointerEvents: 'none', guide: true
                });
            });
            return nodes;
        }
    };
}
