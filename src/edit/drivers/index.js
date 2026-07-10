// @ts-check
// drivers/ — self-describing interaction modes for plane-pick edits. Each driver
// owns one multi-event lifecycle (hover/dragstart/drag/dragend). The engine
// (dispatchPlaneEdits) simply asks each driver `wants(edit)` and hands it the
// matching edits + a per-feature session; it never hard-codes a mode. Adding a
// new interaction mode = adding a driver file here, not editing the engine.
//
// A driver is:
//   { name, wants(edit) -> bool, onEvent(ctx) -> boolean changed }
// where ctx = { feature, event, edits, marks, data, scales, session, preview,
//               stage, runEdit, previewEdit }:
//   edits       the feature's edits this driver wants (already filtered)
//   session     per-feature transient state: { get(), set(patch), clear() }
//   preview     the feature's uncommitted proposal: { get(), clear() }
//   stage       the chart's stage cursor: { get(), set(n), next() }
//   runEdit     (edit, index) => boolean — apply + invariants + COMMIT
//   previewEdit (edit, index) => boolean — the same, parked as an uncommitted preview

import { planeDriver } from './plane.js';
import { nearestDriver } from './nearest.js';
import { sweepDriver } from './sweep.js';
import { drawDriver } from './draw.js';
import { brushDriver } from './brush.js';
import { probeDriver } from './probe.js';

/**
 * @typedef {Object} DriverSession
 * @property {() => any} get
 * @property {(patch: any) => void} set
 * @property {() => void} clear
 *
 * @typedef {Object} DriverPreview
 * @property {() => any[] | null} get
 * @property {() => boolean} clear
 *
 * @typedef {Object} DriverStage
 * @property {() => number} get
 * @property {(n: number) => void} set
 * @property {() => void} next
 *
 * @typedef {Object} DriverContext
 * @property {any} feature
 * @property {any} event
 * @property {import('../../types').Edit[]} edits
 * @property {any[]} marks
 * @property {any[]} data
 * @property {import('../../types').ScaleMap} scales
 * @property {DriverSession} session
 * @property {DriverPreview} preview
 * @property {DriverStage} stage
 * @property {(edit: import('../../types').Edit, index: number | null) => boolean} runEdit
 * @property {(edit: import('../../types').Edit, index: number | null) => boolean} previewEdit
 *
 * @typedef {Object} Driver
 * @property {string} name
 * @property {(edit: import('../../types').Edit) => boolean} wants
 * @property {(ctx: DriverContext) => boolean} onEvent
 */

/** @type {Driver[]} */
export const drivers = [planeDriver, nearestDriver, sweepDriver, drawDriver, brushDriver, probeDriver];

/**
 * Does any of these edits need the plane raised above the marks (a driver whose
 * lifecycle resolves its target from an arbitrary pointer position)? The engine
 * reads this to decide plane-on-top mode.
 * @param {import('../../types').Edit[]} edits
 * @returns {boolean}
 */
export function needsPlaneOnTop(edits) {
    return edits.some((e) => e.pick === 'nearest' || e.pick === 'sweep' || e.pick === 'draw'
        || e.pick === 'brush' || e.pick === 'probe');
}
