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
//
// The value axis also accepts an explicit SPAN instead of a single value: two
// endpoint channels (y1/y2 for areaY, x1/x2 for areaX) fill BETWEEN them rather
// than down to the baseline. That is the uncertainty band — a confidence interval
// or a fan chart around a forecast — and it's the same span/baseline split `bar`
// and `rect` already make, spelled the same way, rather than a separate mark that
// would fork this one's series/curve/order/handle machinery.
//
//   areaY({ channels: { x: { field: 'year' },
//                       y1: { field: 'lo' }, y2: { field: 'hi' } } })
//
// y1/y2 share y's resolved scale (see core/resolve.js's axis aliasing), so they go
// through encodeChannel exactly like the single-value form, and the schema's domain
// union means the band and a sibling mean line land on one axis. Handles sit on
// BOTH edges, so `drag` on y1/y2 or `brushSpan` edits the interval directly. Pair
// with ordering({ fields: ['lo','hi'] }) to stop the band turning inside-out.

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
    // Span mode is decided once per mark (not per datum), exactly as bar/rect do it.
    const hasXSpan = !!(channels.x1 && channels.x2);
    const hasYSpan = !!(channels.y1 && channels.y2);

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
                // Declaring a span picks the value axis on its own — a y1/y2 pair
                // says "the band runs vertically" as plainly as a band scale does.
                if (hasYSpan && !hasXSpan) valueAxis = 'y';
                else if (hasXSpan && !hasYSpan) valueAxis = 'x';
                else if (isBand(xScale) && !isBand(yScale)) valueAxis = 'y';
                else if (isBand(yScale) && !isBand(xScale)) valueAxis = 'x';
                else valueAxis = 'y';
            }
            const spanMode = valueAxis === 'y' ? hasYSpan : hasXSpan;

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

                // Span mode: the far edge is a second field, not the baseline. Both
                // edges resolve through encodeChannel like any other channel, so the
                // only difference from the baseline form is WHERE the path closes.
                /** @type {[number, number][]} */
                let top;
                /** @type {[number, number][]} */
                let bottom;
                if (valueAxis === 'y') {
                    const domainAt = (/** @type {any} */ d) => encodeChannel(scales, channels, 'x', d, width / 2);
                    top = sorted.map(({ d }) => [domainAt(d), spanMode
                        ? encodeChannel(scales, channels, 'y2', d, yBase)
                        : encodeChannel(scales, channels, 'y', d, height / 2)]);
                    bottom = [...sorted].reverse().map(({ d }) => [domainAt(d), spanMode
                        ? encodeChannel(scales, channels, 'y1', d, yBase)
                        : yBase]);
                } else {
                    const domainAt = (/** @type {any} */ d) => encodeChannel(scales, channels, 'y', d, height / 2);
                    top = sorted.map(({ d }) => [spanMode
                        ? encodeChannel(scales, channels, 'x2', d, xBase)
                        : encodeChannel(scales, channels, 'x', d, width / 2), domainAt(d)]);
                    bottom = [...sorted].reverse().map(({ d }) => [spanMode
                        ? encodeChannel(scales, channels, 'x1', d, xBase)
                        : xBase, domainAt(d)]);
                }
                const points = [...top, ...bottom];

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

                // Handles. In span mode BOTH edges get one — an interval is edited by
                // its ends, and a band whose lower edge had no handle would be a
                // half-editable mark. Each carries the `channel` it belongs to, so a
                // `when: ctx => ctx.node.channel === 'y1'` edit can tell them apart
                // (the trend/face arbitration pattern) while a plain drag on y1/y2
                // needs nothing extra.
                const handleChannels = spanMode
                    ? (valueAxis === 'y' ? ['y1', 'y2'] : ['x1', 'x2'])
                    : [valueAxis];
                sorted.forEach(({ d, i }) => {
                    const hStyle = resolveStyle(scales, channels, d, { fill: style.fill || 'steelblue' });
                    for (const ch of handleChannels) {
                        const onY = ch[0] === 'y';
                        const along = onY
                            ? encodeChannel(scales, channels, 'x', d, width / 2)
                            : encodeChannel(scales, channels, 'y', d, height / 2);
                        const at = encodeChannel(scales, channels, ch, d, onY ? height / 2 : width / 2);
                        nodes.push({
                            type: 'circle',
                            cx: onY ? along : at,
                            cy: onY ? at : along,
                            r: handleSize,
                            ...hStyle,
                            data: d,
                            index: i,
                            channel: ch,
                            series: series === SINGLE ? undefined : series,
                            ...(handles ? {} : { opacity: 0, pointerEvents: 'none' })
                        });
                    }
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
