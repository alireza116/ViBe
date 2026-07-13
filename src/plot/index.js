// @ts-check
export { rule, ruleX, ruleY } from './rule.js';
export { bar, barY, barX } from './bar.js';
export { rect, rectX, rectY } from './rect.js';
export { tick, tickX, tickY } from './tick.js';
export { line, lineY, lineX, connectedScatter, path } from './line.js';
export { area, areaY, areaX } from './area.js';
export { point } from './point.js';
export { text, textX, textY } from './text.js';
export { dotStack, dotStackX, dotStackY } from './dotStack.js';
export { waffle, waffleX, waffleY } from './waffle.js';
export { cone } from './cone.js';
export { needle } from './needle.js';
export { axisRadial } from './axisRadial.js';
export { arc, pie, donut } from './arc.js';
export { composite } from './composite.js';
export { axis, axisX, axisY, grid, gridX, gridY } from './axis.js';
// Shared mark foundation — for authoring new marks (channel resolution + the
// standard style surface). See mark.js.
export { encodeChannel, resolveStyle, normalizeMarkOptions, STANDARD_STYLE_CHANNELS } from './mark.js';
export {
    polarToXY, arcPath, arcSpine, arcSpan, angularBand, needleTriangle, degToRad,
    ORIENT_SPAN,
} from './polar.js';

export { trend } from './trend.js';
export { geoBasemap, geoTile, geoPoint, geoPolygon, geoLine, geoText, geoRect } from './geo.js';
export { tileCover, tileUrl, isWebMercator } from '../core/tiles.js';
export { projectPoint, invertPoint, projectBounds, createProjection } from '../core/projection.js';
