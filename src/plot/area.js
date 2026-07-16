// @ts-check
import { isBand, baselineOf } from '../core/scales.js';
import { encodeChannel, resolveStyle, normalizeMarkOptions, seriesFieldOf } from './mark.js';

// area: a filled path under a series (the distributional sibling of line). Same
// grouping / ordering knobs as line; emits one filled `path` per series plus
// optional handle circles so sweep/drag/create reuse the line edit machinery.
//
//   area   — auto-detect value axis
//   areaY  — value on y (fill down to the y baseline)
//   areaX  — value on x (fill across to the x baseline)

const SINGLE = '__single__';

/**
 * @param {any} options
 * @param {'x' | 'y' | null} forcedValueAxis
 * @returns {any}
 */
function buildArea(options, forcedValueAxis) {
    const opts = normalizeMarkOptions(options);
    const {
        channels = {},
        id,
        edits,
        constraints,
        curve = 'linear',
        handles = true,
        handleSize = 4,
        order = 'domain',
        samples
    } = opts;

    const xKey = (channels.x && channels.x.field) || 'x';
    const yKey = (channels.y && channels.y.field) || 'y';
    const seriesField = seriesFieldOf(opts, channels);

    return {
        id,
        channels,
        edits,
        constraints,
        discreteScale: 'point',
        xKey,
        yKey,
        seriesKey: seriesField,
        order,
        samples,
        supportsSeries: true,
        /**
         * @param {any[]} currentData
         * @param {import('../types').ScaleMap} scales
         * @param {number} width
         * @param {number} height
         * @returns {import('../types').FeatureNode[]}
         */
        build: (currentData, scales, width, height) => {
            const { x: xScale, y: yScale } = scales;
            let valueAxis = forcedValueAxis;
            if (!valueAxis) {
                if (isBand(xScale) && !isBand(yScale)) valueAxis = 'y';
                else if (isBand(yScale) && !isBand(xScale)) valueAxis = 'x';
                else valueAxis = 'y';
            }

            /** @type {Map<any, { d: any, i: number }[]>} */
            const groups = new Map();
            currentData.forEach((d, i) => {
                const key = seriesField != null ? d[seriesField] : SINGLE;
                let bucket = groups.get(key);
                if (!bucket) { bucket = []; groups.set(key, bucket); }
                bucket.push({ d, i });
            });

            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];
            const yBase = baselineOf(yScale);
            const xBase = baselineOf(xScale);

            for (const [series, rows] of groups) {
                const groupRows = rows || [];
                const sorted = [...groupRows];
                if (order === 'domain') {
                    const domainKey = valueAxis === 'y' ? xKey : yKey;
                    sorted.sort((a, b) => {
                        const av = a.d[domainKey], bv = b.d[domainKey];
                        if (av instanceof Date && bv instanceof Date) return /** @type {any} */ (av) - /** @type {any} */ (bv);
                        return av < bv ? -1 : av > bv ? 1 : 0;
                    });
                } else if (order !== 'sequence' && typeof order === 'string') {
                    sorted.sort((a, b) => (a.d[order] < b.d[order] ? -1 : a.d[order] > b.d[order] ? 1 : 0));
                }

                const style = resolveStyle(scales, channels, sorted[0] ? sorted[0].d : {}, {
                    fill: 'steelblue', stroke: 'steelblue', fillOpacity: 0.35
                });

                /** @type {[number, number][]} */
                const top = sorted.map(({ d }) => [
                    encodeChannel(scales, channels, 'x', d, width / 2),
                    encodeChannel(scales, channels, 'y', d, height / 2)
                ]);

                // Close the area down to the baseline along the value axis.
                /** @type {[number, number][]} */
                let points;
                if (valueAxis === 'y') {
                    const basePts = [...top].reverse().map(([x]) => /** @type {[number, number]} */ ([x, yBase]));
                    points = [...top, ...basePts];
                } else {
                    const basePts = [...top].reverse().map(([, y]) => /** @type {[number, number]} */ ([xBase, y]));
                    points = [...top, ...basePts];
                }

                if (points.length >= 2) {
                    nodes.push({
                        type: 'path',
                        points,
                        curve,
                        ...style,
                        strokeWidth: style.strokeWidth != null ? style.strokeWidth : 1,
                        series: series === SINGLE ? undefined : series,
                        pointerEvents: 'none'
                    });
                }

                sorted.forEach(({ d, i }) => {
                    const hx = encodeChannel(scales, channels, 'x', d, width / 2);
                    const hy = encodeChannel(scales, channels, 'y', d, height / 2);
                    const hStyle = resolveStyle(scales, channels, d, { fill: style.fill || 'steelblue' });
                    nodes.push({
                        type: 'circle',
                        cx: hx,
                        cy: hy,
                        r: handleSize,
                        ...hStyle,
                        data: d,
                        index: i,
                        series: series === SINGLE ? undefined : series,
                        ...(handles ? {} : { opacity: 0, pointerEvents: 'none' })
                    });
                });
            }

            return nodes;
        }
    };
}

/** @param {any} [options] @returns {any} */
export function area(options = {}) {
    return buildArea(options, null);
}

/** @param {any} [options] @returns {any} */
export function areaY(options = {}) {
    return buildArea(options, 'y');
}

/** @param {any} [options] @returns {any} */
export function areaX(options = {}) {
    return buildArea(options, 'x');
}
