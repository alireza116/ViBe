// @ts-check
// Renderer-agnostic paint vocabulary shared by every renderer. A renderer's job
// is to turn typed FeatureNodes into pixels; WHAT a node can say (its curve, its
// style channels) is the same regardless of whether the pixels come from SVG
// attributes or canvas 2D calls. Keeping that vocabulary here is what lets a
// second renderer stay a faithful sibling of the first: adding a style channel is
// one row in STYLE_FIELDS and both renderers pick it up.
import * as d3 from 'd3';

// Curve name -> d3 curve factory for line-mark paths. Mirrors Observable Plot's
// `curve` option; unknown names fall back to a straight polyline.
/** @type {Record<string, any>} */
export const CURVES = {
    linear: d3.curveLinear,
    catmullRom: d3.curveCatmullRom,
    natural: d3.curveNatural,
    step: d3.curveStep,
    stepAfter: d3.curveStepAfter,
    stepBefore: d3.curveStepBefore,
    basis: d3.curveBasis,
    cardinal: d3.curveCardinal,
    monotoneX: d3.curveMonotoneX,
    monotoneY: d3.curveMonotoneY
};

/**
 * @param {string} [name]
 * @returns {any}
 */
export function resolveCurve(name) {
    return (name && CURVES[name]) || d3.curveLinear;
}

// The standard paint surface: the style channels every mark may set, with the SVG
// attribute name and base default for the DOM renderer. A canvas renderer reads
// `field` and maps it to a 2D-context property instead. ADDING A STYLE CHANNEL IS
// ONE ROW HERE — both renderers stay in step.
/** @type {{ field: string, svgAttr: string, base: any }[]} */
export const STYLE_FIELDS = [
    { field: 'fill', svgAttr: 'fill', base: null },
    { field: 'stroke', svgAttr: 'stroke', base: null },
    { field: 'strokeWidth', svgAttr: 'stroke-width', base: null },
    { field: 'strokeDasharray', svgAttr: 'stroke-dasharray', base: null },
    { field: 'opacity', svgAttr: 'opacity', base: null },
    { field: 'fillOpacity', svgAttr: 'fill-opacity', base: null },
    { field: 'strokeOpacity', svgAttr: 'stroke-opacity', base: null }
];
