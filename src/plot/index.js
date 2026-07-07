// @ts-check
export { rule, ruleX, ruleY } from './rule.js';
export { bar, barY, barX } from './bar.js';
export { tick, tickX, tickY } from './tick.js';
export { line, lineY, lineX, connectedScatter, path } from './line.js';
export { point } from './point.js';
export { axis, axisX, axisY, grid, gridX, gridY } from './axis.js';
// Shared mark foundation — for authoring new marks (channel resolution + the
// standard style surface). See mark.js.
export { encodeChannel, resolveStyle, normalizeMarkOptions, STANDARD_STYLE_CHANNELS } from './mark.js';

// export { trend } from './trend.js'; // To be implemented
