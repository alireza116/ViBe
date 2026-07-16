// @ts-check
// edit/ — the `edit` primitive: how a gesture changes a channel's data. It is the
// inverse of encoding. Where `encode` maps data -> visual, an `edit` maps a
// gesture -> that channel's data, through the SAME scale.
//
// An edit is a descriptor the engine routes to:
//   { type, gesture, channels, when, pick, scope, threshold, into, constrain,
//     guide, stage, advance, apply }
//     gesture   'drag' | 'click' | 'dblclick' | 'commit' — the raw gesture
//     channels  channel names it governs; null = inject the channel it's placed on
//     when      (ctx) => boolean — arbitration (e.g. only on Shift-drag)
//     pick      'direct' | 'nearest' | 'plane' | 'sweep' | 'draw' | 'brush' |
//               'brushRect' | 'probe' | string — how the gesture selects its target
//               (see edit/drivers). Custom picks register via registerDriver.
//     scope     null (universal) | the mark family it needs: 'line' | 'arc' |
//               'waffle' | 'geo' | 'axis'. Each names a mark capability the engine
//               checks, so a misplaced edit warns instead of silently no-op'ing.
//     constrain constraint(s) applied on this edit's commit (sugar)
//     guide     true to self-draw this edit's guide (constraint bounds / snap ring)
//     stage     active only in this stage of a multi-step elicitation; null = always
//     advance   probe only: a click settling a staged edit advances the stage
//     apply     (ctx) => datum | dataset | undefined — performs the edit
//
// Universal edits (any mark) live in basic.js; line-scoped authoring edits live in
// line.js and are grouped under `edit.line.*` so the scope is visible in the name.
//
// Placed on a channel (co-located) for the simple case:
//   size: { field: "mag", edit: vibe.edit.resize() }
// Or at mark level for joint / arbitrary edits:
//   edits: [ vibe.edit.drag({ channels: ["x", "y"] }), vibe.edit.line.anchor() ]

export { drag, dragSpan, brushSpan, brushRect, resize, rotate, cycle, create, toggle, remove, editText, legend, custom, rank } from './basic.js';

export { when } from './when.js';
// Authoring kit — public so custom edits / marks can reuse the same primitives.
export { makeEdit, nextSeriesKey, invertChannel, recenterSpan, markCenter, schemaDefaults } from './shared.js';
export { nearestMark, nearestSeries, nearestMarkOnAxis, distanceToMark } from './pick.js';
export { registerDriver } from './drivers/index.js';

import { anchor, newSeries, draw, sweep, removeSeries } from './line.js';

// Line-scoped edits, namespaced so the API shows they need a `line` mark.
export const line = { anchor, newSeries, draw, sweep, removeSeries };

import { scale as axisScale, categories as axisCategories } from './axis.js';

// Axis-scoped edits, namespaced so the API shows they belong on an axis mark and
// reshape the field's DOMAIN (not the dataset). `scale` = numeric/temporal drag;
// `categories` = discrete add/rename/remove (returns an array of edits).
export const axis = { scale: axisScale, categories: axisCategories };

import { edge as arcEdge } from './arc.js';

// Arc-scoped edit, namespaced so the API shows it belongs on an arc/pie/donut mark:
// drag a slice boundary to redistribute the two adjacent rows (total preserved).
export const arc = { edge: arcEdge };

import { fill as waffleFill } from './waffle.js';

// Waffle-scoped edit: fill up to the exact cell under the pointer. Reads the grid
// geometry only a waffle stamps, so the scope is in the name like line/arc/geo.
export const waffle = { fill: waffleFill };

import {
    drag as geoDrag,
    create as geoCreate,
    draw as geoDraw,
    dragVertex as geoDragVertex,
    removeVertex as geoRemoveVertex,
    brush as geoBrush,
    createRect as geoCreateRect,
} from './geo.js';

// Geo-scoped edits for the geo* mark family (chart `projection` apply/invert).
export const geo = {
    drag: geoDrag,
    create: geoCreate,
    draw: geoDraw,
    dragVertex: geoDragVertex,
    removeVertex: geoRemoveVertex,
    brush: geoBrush,
    createRect: geoCreateRect,
};
