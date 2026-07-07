// @ts-check
// drivers/ — self-describing interaction modes for plane-pick edits. Each driver
// owns one multi-event lifecycle (hover/dragstart/drag/dragend). The engine
// (dispatchPlaneEdits) simply asks each driver `wants(edit)` and hands it the
// matching edits + a per-feature session; it never hard-codes a mode. Adding a
// new interaction mode = adding a driver file here, not editing the engine.
//
// A driver is:
//   { name, wants(edit) -> bool, onEvent(ctx) -> boolean changed }
// where ctx = { feature, event, edits, marks, data, session, runEdit }:
//   edits    the feature's edits this driver wants (already filtered)
//   session  per-feature transient state: { get(), set(patch), clear() }
//   runEdit  (edit, index) => boolean — run one edit against the target + commit

import { planeDriver } from './plane.js';
import { nearestDriver } from './nearest.js';
import { sweepDriver } from './sweep.js';
import { drawDriver } from './draw.js';

/**
 * @typedef {Object} DriverSession
 * @property {() => any} get
 * @property {(patch: any) => void} set
 * @property {() => void} clear
 *
 * @typedef {Object} DriverContext
 * @property {any} feature
 * @property {any} event
 * @property {import('../../types').Edit[]} edits
 * @property {any[]} marks
 * @property {any[]} data
 * @property {DriverSession} session
 * @property {(edit: import('../../types').Edit, index: number | null) => boolean} runEdit
 *
 * @typedef {Object} Driver
 * @property {string} name
 * @property {(edit: import('../../types').Edit) => boolean} wants
 * @property {(ctx: DriverContext) => boolean} onEvent
 */

/** @type {Driver[]} */
export const drivers = [planeDriver, nearestDriver, sweepDriver, drawDriver];

/**
 * Does any of these edits need the plane raised above the marks (a driver whose
 * lifecycle resolves its target from an arbitrary pointer position)? The engine
 * reads this to decide plane-on-top mode.
 * @param {import('../../types').Edit[]} edits
 * @returns {boolean}
 */
export function needsPlaneOnTop(edits) {
    return edits.some((e) => e.pick === 'nearest' || e.pick === 'sweep' || e.pick === 'draw');
}
