// @ts-check
// guides.constraints: a context-dependent visual guide that shows where the
// constraints on a feature's interactors currently limit interaction.
//
// It introspects each constraint's metadata and draws the corresponding
// boundary into the scene graph. Because it is rebuilt on every render, the
// guides track the live data (e.g. a maintainSum cap moves as other bars change).
//
//   vibe.guides.constraints({ target: "my-bars", color: "#e4572e" })

const DEFAULT_COLOR = '#e4572e';

/**
 * @param {{ target: string, color?: string }} [options]
 * @returns {any}
 */
export function constraints(options = { target: '' }) {
    const { target, color = DEFAULT_COLOR } = options;

    return {
        isGuide: true,
        /**
         * @param {any} ctx
         * @returns {import('../types').FeatureNode[]}
         */
        build: (ctx) => {
            const { features, state, scales, width } = ctx;
            const feature = features.find((/** @type {any} */ f) => f.id === target);
            if (!feature) return [];

            const data = state[feature.id] || [];
            /** @type {import('../types').FeatureNode[]} */
            const nodes = [];

            (feature.interactors || []).forEach((/** @type {any} */ interactor) => {
                (interactor.constraints || []).forEach((/** @type {import('../types').Constraint} */ constraint) => {
                    nodes.push(
                        ...buildGuideForConstraint(constraint, { feature, data, scales, width, color })
                    );
                });
            });

            return nodes;
        }
    };
}

/**
 * @param {import('../types').Constraint} constraint
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
function buildGuideForConstraint(constraint, ctx) {
    // A custom constraint may supply its own guide drawer (via defineConstraint's
    // meta.guide); it takes precedence and receives the same drawing context.
    if (typeof constraint.guide === 'function') {
        return constraint.guide(ctx) || [];
    }
    switch (constraint.constraintType) {
        case 'clamp':
            return clampGuide(constraint.options, ctx);
        case 'maintainSum':
            return maintainSumGuide(constraint.options, ctx);
        default:
            return []; // unknown constraint: nothing to draw
    }
}

/**
 * clamp -> horizontal min/max boundary lines (+ labels) and a shaded allowed band.
 * @param {{ min?: number, max?: number }} options
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
function clampGuide({ min, max }, { scales, width, color }) {
    const yScale = scales.y;
    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    /**
     * @param {number | undefined} value
     * @param {string} label
     */
    const boundaryLine = (value, label) => {
        if (value === undefined || !yScale) return;
        const y = yScale(value);
        nodes.push({
            type: 'line',
            x1: 0, x2: width, y1: y, y2: y,
            stroke: color, strokeDasharray: '4 4', strokeWidth: 1,
            opacity: 0.9, pointerEvents: 'none', guide: true
        });
        nodes.push({
            type: 'text',
            x: width - 4, y: y - 4, text: label,
            fill: color, fontSize: 10, textAnchor: 'end',
            opacity: 0.95, pointerEvents: 'none', guide: true
        });
    };

    // Shaded band between min and max (drawn behind the marks).
    if (min !== undefined && max !== undefined && yScale) {
        const yTop = yScale(max);
        const yBot = yScale(min);
        nodes.push({
            type: 'rect',
            x: 0, y: Math.min(yTop, yBot),
            width, height: Math.abs(yBot - yTop),
            fill: color, opacity: 0.07,
            pointerEvents: 'none', guide: true
        });
    }

    boundaryLine(min, `min ${min}`);
    boundaryLine(max, `max ${max}`);

    return nodes;
}

/**
 * maintainSum -> a cap tick over each bar at the highest value it can reach given
 * the current total of the other bars. Recomputed live, so ticks move on drag.
 * @param {{ targetSum: number }} options
 * @param {any} ctx
 * @returns {import('../types').FeatureNode[]}
 */
function maintainSumGuide({ targetSum }, { feature, data, scales, color }) {
    const xKey = feature.xKey || 'x';
    const yKey = feature.yKey || 'y';
    const xScale = scales.x;
    const yScale = scales.y;
    if (!yScale) return [];
    const [domainMin, domainMax] = [Math.min(...yScale.domain()), Math.max(...yScale.domain())];
    const bandwidth = xScale && xScale.bandwidth ? xScale.bandwidth() : 20;

    /** @type {import('../types').FeatureNode[]} */
    const nodes = [];

    data.forEach((/** @type {any} */ d) => {
        const sumOthers = data.reduce(
            (/** @type {number} */ sum, /** @type {any} */ o) => (o[xKey] === d[xKey] ? sum : sum + o[yKey]),
            0
        );
        const cap = targetSum - sumOthers;
        if (cap < domainMin || cap > domainMax) return; // off-chart: skip

        const xPos = xScale ? xScale(d[xKey]) : 0;
        const y = yScale(cap);
        nodes.push({
            type: 'line',
            x1: xPos - 2, x2: xPos + bandwidth + 2, y1: y, y2: y,
            stroke: color, strokeDasharray: '3 3', strokeWidth: 1.5,
            opacity: 0.9, pointerEvents: 'none', guide: true
        });
    });

    return nodes;
}
