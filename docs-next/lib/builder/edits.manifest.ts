import type { ApiEntry, ApiOption } from '../types';
import { isFormOption } from './controlKind';

import { api as gesturesApi } from '../../app/editing/gestures/api';
import { api as existenceApi } from '../../app/editing/existence/api';
import { api as sweepApi } from '../../app/editing/sweep/api';

export type EditManifestEntry = {
  /** How this edit is reachable in scope: bare (`move`) or namespaced
   * (`edit.line.draw`) — matches `createVibeScope()`'s exposure exactly. */
  callPath: string;
  label: string;
  docHref: string;
  /** null = universal (any mark); 'line' = only offered when the mark family
   * has `supportsSeries` (matches the real `scope: 'line'` descriptor rule). */
  scope: 'line' | null;
  options: ApiOption[];
};

function entryByPrefix(api: ApiEntry[], prefix: string): ApiEntry | undefined {
  return api.find((e) => (e.name || '').startsWith(prefix));
}

function optionsOf(entry: ApiEntry | undefined): ApiOption[] {
  return (entry?.options || []).filter(isFormOption);
}

const universalDefs: Array<{ callPath: string; prefix: string; docHref: string }> = [
  { callPath: 'move', prefix: 'move(', docHref: '/editing/gestures' },
  { callPath: 'resize', prefix: 'resize(', docHref: '/editing/gestures' },
  { callPath: 'slide', prefix: 'slide(', docHref: '/editing/gestures' },
  { callPath: 'rotate', prefix: 'rotate(', docHref: '/editing/gestures' },
  { callPath: 'cycle', prefix: 'cycle(', docHref: '/editing/gestures' },
  { callPath: 'create', prefix: 'create(', docHref: '/editing/existence' },
  { callPath: 'remove', prefix: 'remove(', docHref: '/editing/existence' },
];

const lineDefs: Array<{ callPath: string; prefix: string; api: ApiEntry[]; docHref: string }> = [
  { callPath: 'edit.line.anchor', prefix: 'edit.line.anchor(', api: existenceApi, docHref: '/editing/existence' },
  { callPath: 'edit.line.newSeries', prefix: 'edit.line.newSeries(', api: existenceApi, docHref: '/editing/existence' },
  { callPath: 'edit.line.removeSeries', prefix: 'edit.line.removeSeries(', api: existenceApi, docHref: '/editing/existence' },
  { callPath: 'edit.line.sweep', prefix: 'edit.line.sweep(', api: sweepApi, docHref: '/editing/sweep' },
  { callPath: 'edit.line.draw', prefix: 'edit.line.draw(', api: sweepApi, docHref: '/editing/sweep' },
];

export const UNIVERSAL_EDITS: EditManifestEntry[] = universalDefs.map((d) => ({
  callPath: d.callPath,
  label: d.callPath,
  docHref: d.docHref,
  scope: null,
  options: optionsOf(entryByPrefix(gesturesApi, d.prefix) || entryByPrefix(existenceApi, d.prefix)),
}));

export const LINE_EDITS: EditManifestEntry[] = lineDefs.map((d) => ({
  callPath: d.callPath,
  label: d.callPath,
  docHref: d.docHref,
  scope: 'line',
  options: optionsOf(entryByPrefix(d.api, d.prefix)),
}));

export const ALL_EDITS: EditManifestEntry[] = [...UNIVERSAL_EDITS, ...LINE_EDITS];

export function editByCallPath(callPath: string): EditManifestEntry {
  const found = ALL_EDITS.find((e) => e.callPath === callPath);
  if (!found) throw new Error(`Unknown edit: ${callPath}`);
  return found;
}

export function editsFor(supportsSeries: boolean): EditManifestEntry[] {
  return supportsSeries ? ALL_EDITS : UNIVERSAL_EDITS;
}
