// @ts-check
// widgets/ — higher-level named elicitations, each a pure recipe over the core
// API (marks + edits + constraints + guides). Every factory returns an ElicitSpec,
// so it composes and serializes like any other spec: render with
// Elicit(widgets.likert({ … })).
//
// They are opinionated survey instruments — rings instead of axes, a cell grid
// instead of ticks — but they add no interaction surface. The look lives entirely
// in the guide layer (theme.js); the behaviour is marks + edits + constraints.
// Every widget therefore has a plain-API twin that expands to the same guides.

export { likert } from './likert.js';
export { multipleChoice } from './choice.js';
export { slider } from './slider.js';
export { matrix } from './matrix.js';
export { lineCone } from './lineCone.js';
export { ranking } from './ranking.js';
export { allocation } from './allocation.js';
export { probabilityTokens } from './probabilityTokens.js';
export { interval, ci } from './interval.js';
export { histogram } from './histogram.js';
export { region } from './region.js';
export { thermometer } from './thermometer.js';
export { labeledValue } from './labeledValue.js';

// The instrument palette + the guide-built affordances (option rings, cell grid,
// slider track, crosshair frame), exported so a custom instrument can reuse them.
export { THEME, optionRings, cellGrid, sliderTrack, prompt, crosshair } from './theme.js';
