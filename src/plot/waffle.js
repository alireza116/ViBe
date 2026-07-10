// @ts-check
// waffle.js — a waffle mark: like bar, it shows a quantity for a category, but
// subdivides the block into a grid of unit CELLS so a reader can count exact
// amounts and a gesture can pick a proportion cell-by-cell. It mirrors bar's
// structure exactly (band = category axis + thickness, linear = value axis +
// length from a baseline; orientation autodetected or forced by waffleX/waffleY),
// then quantizes the value length into a grid.
//
//   waffleY([{ cat: 'apples', value: 212 }, ...], { x: 'cat', y: 'value' })
//
// The value's fill LEVEL is resolved through encodeChannel exactly like a bar's
// length — the single field->pixel path — and the grid simply quantizes around
// it: the block from the baseline to the value-domain max is cut into cols x rows
// cells, and the first `round(fraction * total)` cells (row-major from the
// baseline) are filled. Every cell (filled and empty) carries `data`/`index`, so
// the whole block is one direct-pick target: a plain `drag()` on the value
// channel fills to the pointer, and a `snap` constraint lands it on whole cells.

import { isBand, bandwidthOf, baselineOf } from '../core/scales.js';
import { encodeChannel, resolveStyle, normalizeMarkOptions } from './mark.js';

/** @param {any} scale @returns {[number, number]} */
function domainExtent(scale) {
    const d = scale && scale.domainConfig;
    if (Array.isArray(d) && d.length >= 2) {
        const lo = Math.min(d[0], d[d.length - 1]);
        const hi = Math.max(d[0], d[d.length - 1]);
        return [lo, hi];
    }
    return [0, 1];
}

/**
 * @param {any} options
 * @param {string | null} forcedOrientation
 * @returns {any}
 */
function buildWaffle(options, forcedOrientation) {
    const opts = normalizeMarkOptions(options);
    const {
        encoding = {},
        id,
        edits,
        constraints,
        orientation: orientationOption,
        cols = 10,
        gap = 1,
        emptyFill = '#eee'
    } = opts;

    const xKey = (encoding.x && encoding.x.field) || options.x || 'x';
    const yKey = (encoding.y && encoding.y.field) || options.y || 'y';

    return {
        id,
        encoding,
        edits,
        constraints,
        categoricalScale: 'band',
        xKey,
        yKey,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales) => {
            const { x: xScale, y: yScale } = scales;

            let orientation = forcedOrientation || orientationOption;
            if (!orientation) {
                if (isBand(xScale)) orientation = 'vertical';
                else if (isBand(yScale)) orientation = 'horizontal';
                else orientation = 'vertical';
            }

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            currentData.forEach((/** @type {any} */ d, i) => {
                const style = resolveStyle(scales, encoding, d, { fill: 'steelblue' });
                const vertical = orientation !== 'horizontal';

                // Band (category) geometry vs value (length) geometry — the same
                // split bar makes. `bandStart`/`thickness` place the block across
                // its category; `baseline`/`level` set the filled length.
                const bandScale = vertical ? xScale : yScale;
                const valueChannel = vertical ? 'y' : 'x';
                const valueScale = vertical ? yScale : xScale;
                const bandKey = vertical ? xKey : yKey;

                const bandStart = bandScale ? bandScale(d[bandKey]) : 0;
                const thickness = bandwidthOf(bandScale, 20);
                const baseline = baselineOf(valueScale);
                const level = encodeChannel(scales, encoding, valueChannel, d, baseline);

                // Grid: cols across the band, rows spanning the value DOMAIN (so the
                // grid is stable as the value changes — only how many cells are
                // filled changes). Cell edge = band thickness / cols (square-ish).
                const cell = thickness / cols;
                const [, dhi] = domainExtent(valueScale);
                const domainTop = valueScale ? valueScale(dhi) : baseline;
                const blockLen = Math.abs(baseline - domainTop) || 1;
                const rows = Math.max(1, Math.round(blockLen / cell));
                const total = rows * cols;

                // Fill fraction from the value's PIXEL (encodeChannel — the single
                // field->pixel path), quantized into cells. The grid visualizes the
                // same length a bar would draw; it never reads the raw field.
                const fillLen = Math.abs(baseline - level);
                const filled = Math.max(0, Math.min(total, Math.round((fillLen / blockLen) * total)));

                for (let idx = 0; idx < total; idx++) {
                    const rowFromBase = Math.floor(idx / cols); // 0 at the baseline
                    const col = idx % cols;
                    const isFilled = idx < filled;
                    const cellStyle = isFilled
                        ? style
                        : { ...style, fill: emptyFill };
                    if (vertical) {
                        nodes.push({
                            type: 'rect',
                            x: bandStart + col * cell + gap / 2,
                            y: baseline - (rowFromBase + 1) * cell + gap / 2,
                            width: cell - gap,
                            height: cell - gap,
                            ...cellStyle,
                            data: d,
                            index: i
                        });
                    } else {
                        nodes.push({
                            type: 'rect',
                            x: baseline + rowFromBase * cell + gap / 2,
                            y: bandStart + col * cell + gap / 2,
                            width: cell - gap,
                            height: cell - gap,
                            ...cellStyle,
                            data: d,
                            index: i
                        });
                    }
                }
            });

            return nodes;
        }
    };
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function waffle(options = {}) {
    return buildWaffle(options, null);
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function waffleY(options = {}) {
    return buildWaffle(options, 'vertical');
}

/**
 * @param {any} [options]
 * @returns {any}
 */
export function waffleX(options = {}) {
    return buildWaffle(options, 'horizontal');
}
