// @ts-check
// Chart elements — scale chrome, not data marks. They view a SCALE (`views:
// 'scale'`), take a singular `channel`, paint CHROME (not desugared channels),
// and their edits target the schema DOMAIN (`edit.axis.*`). See ChartElement
// in types.d.ts.
//
// Public as `elicit.elements.*`. The same factories stay aliased on `plot.*`
// during migration so existing specs keep working.

export { axis, axisX, axisY, grid, gridX, gridY, AXIS_OPTIONS, GRID_OPTIONS } from '../plot/axis.js';
export { legend, legendColor, legendSize, legendSymbol } from '../plot/legend.js';
export { axisRadial } from '../plot/axisRadial.js';
