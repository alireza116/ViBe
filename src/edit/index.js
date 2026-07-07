// @ts-check
// edit/ — the `edit` primitive: how a gesture changes a channel's data. It is the
// inverse of encoding. Where `encode` maps data -> visual, an `edit` maps a
// gesture -> that channel's data, through the SAME scale.
//
// An edit is a descriptor the engine routes to:
//   { type, gesture, channels, when, pick, scope, threshold, into, constrain,
//     guide, apply }
//     gesture   'drag' | 'click' | 'dblclick' — the raw gesture that triggers it
//     channels  channel names it governs; null = inject the channel it's placed on
//     when      (ctx) => boolean — arbitration (e.g. only on Shift-drag)
//     pick      'direct' | 'nearest' | 'plane' | 'sweep' | 'draw' — how the gesture
//                 selects its target (see edit/drivers). direct = the mark hit;
//                 nearest = closest within threshold; plane = no target (create);
//                 sweep/draw = a multi-event driver lifecycle.
//     scope     null (universal) | 'line' (needs a series-grouping mark)
//     constrain constraint(s) applied on this edit's commit (sugar; the canonical
//                 home is the feature's `constraints`, which hold for every edit)
//     guide     true to self-draw this edit's guide (constraint bounds / snap ring)
//     apply     (ctx) => datum | dataset | undefined — performs the edit
//
// Universal edits (any mark) live in basic.js; line-scoped authoring edits live in
// line.js and are grouped under `edit.line.*` so the scope is visible in the name.
//
// Placed on a channel (co-located) for the simple case:
//   size: { field: "mag", edit: vibe.edit.resize() }
// Or at mark level for joint / arbitrary edits:
//   edits: [ vibe.edit.drag({ channels: ["x", "y"] }), vibe.edit.line.anchor() ]

export { drag, resize, cycle, create, remove, custom } from './basic.js';
export { when } from './when.js';
export { nextSeriesKey } from './shared.js';

import { anchor, newSeries, draw, sweep, removeSeries } from './line.js';

// Line-scoped edits, namespaced so the API shows they need a `line` mark.
export const line = { anchor, newSeries, draw, sweep, removeSeries };
