import type { ApiOption } from '../types';

export type ConstraintManifestEntry = {
  name: string;
  label: string;
  docHref: string;
  options: ApiOption[];
};

// `constraints.*` doesn't get one `api.tsx` entry per function (the doc page
// tables every built-in in one flattened row set) — this small, stable manifest
// (9 constraints, `src/constraints/index.js`) hand-grounds their scalar options
// in the same `{ name, type, default, desc }` shape `OptionField` already reads,
// so it plugs into the same generic renderer as marks/edits/scales.
export const CONSTRAINTS: ConstraintManifestEntry[] = [
  {
    name: 'clamp', label: 'clamp', docHref: '/constraints',
    options: [
      { name: 'min', type: 'number', default: '—', desc: 'Lower bound (falls back to the field’s schema domain).' },
      { name: 'max', type: 'number', default: '—', desc: 'Upper bound (falls back to the field’s schema domain).' },
      { name: 'field', type: 'string', default: "'y'", desc: 'The data field to bound.' },
    ],
  },
  {
    name: 'maintainSum', label: 'maintainSum', docHref: '/constraints',
    options: [
      { name: 'targetSum', type: 'number', default: '—', desc: 'Target total for the field.' },
      { name: 'field', type: 'string', default: "'y'", desc: 'The data field to sum.' },
      { name: 'mode', type: "'cap' | 'normalize' | 'redistribute'", default: "'cap'", desc: 'How the touched datum and its siblings compensate.' },
    ],
  },
  {
    name: 'count', label: 'count', docHref: '/constraints',
    options: [
      { name: 'max', type: 'number', default: '∞', desc: 'Maximum number of data rows.' },
      { name: 'strategy', type: "'replace' | 'reject'", default: "'replace'", desc: 'Over the limit: drop the oldest, or refuse the interaction.' },
    ],
  },
  {
    name: 'unique', label: 'unique', docHref: '/constraints',
    options: [
      { name: 'field', type: 'string', default: "'x'", desc: 'Category key.' },
      { name: 'max', type: 'number', default: '1', desc: 'How many rows may share a key.' },
      { name: 'strategy', type: "'reject' | 'replace'", default: "'reject'", desc: 'Reject the new row, or replace the resident.' },
    ],
  },
  {
    name: 'snap', label: 'snap', docHref: '/constraints',
    options: [
      { name: 'step', type: 'number', default: '1', desc: 'Grid size to quantize the field to.' },
      { name: 'origin', type: 'number', default: '0', desc: 'Grid origin.' },
      { name: 'field', type: 'string', default: "'y'", desc: 'The data field to quantize.' },
    ],
  },
  {
    name: 'ordering', label: 'ordering', docHref: '/constraints',
    options: [
      { name: 'lower', type: 'string', default: '—', desc: 'The lesser of two fields on one row (two-field sugar for `fields`).' },
      { name: 'upper', type: 'string', default: '—', desc: 'The greater of two fields on one row.' },
      { name: 'mode', type: "'push' | 'block'", default: "'push'", desc: '`push` repairs by moving neighbours; `block` rejects instead.' },
    ],
  },
  {
    name: 'monotonic', label: 'monotonic', docHref: '/constraints',
    options: [
      { name: 'field', type: 'string', default: "'y'", desc: 'The value that may never reverse.' },
      { name: 'along', type: 'string', default: "'x'", desc: 'The axis rows are sorted by.' },
      { name: 'dir', type: "'up' | 'down'", default: "'up'", desc: 'Non-decreasing or non-increasing.' },
      { name: 'series', type: 'string', default: '—', desc: 'Group rows by this field first, so each series is judged on its own.' },
    ],
  },
  {
    name: 'spacing', label: 'spacing', docHref: '/constraints',
    options: [
      { name: 'field', type: 'string', default: "'x'", desc: 'Adjacent values of this field stay apart.' },
      { name: 'min', type: 'number', default: '1', desc: 'Minimum gap, in data units.' },
      { name: 'series', type: 'string', default: '—', desc: 'Group rows by this field first.' },
    ],
  },
];

export function constraintByName(name: string): ConstraintManifestEntry {
  const found = CONSTRAINTS.find((c) => c.name === name);
  if (!found) throw new Error(`Unknown constraint: ${name}`);
  return found;
}
