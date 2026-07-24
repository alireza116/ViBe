import type { ApiOption } from '../types';
import type { ScaleKind } from './types';

export type ScaleManifestEntry = {
  type: ScaleKind;
  label: string;
  /** continuous | discrete-band | discrete-point | color — governs which
   * channels a scale kind makes sense on, loosely (not enforced). */
  group: 'continuous' | 'band' | 'point' | 'color';
  options: ApiOption[];
};

const NICE_CLAMP_REVERSE: ApiOption[] = [
  { name: 'nice', type: 'boolean', default: 'false', desc: 'Round the domain to nice tick values.' },
  { name: 'clamp', type: 'boolean', default: 'false', desc: 'Clamp out-of-domain values to the range.' },
  { name: 'reverse', type: 'boolean', default: 'false', desc: 'Flip the resolved range.' },
];

// `ScaleSpec` (`src/types.d.ts`) — domain deliberately excluded, it lives on the
// schema. This hand-written manifest covers every `ScaleType`; it's ~10 stable
// entries so it doesn't need `api.tsx` indirection the way marks/edits do.
export const SCALES: ScaleManifestEntry[] = [
  { type: 'linear', label: 'Linear', group: 'continuous', options: [...NICE_CLAMP_REVERSE] },
  {
    type: 'log', label: 'Log', group: 'continuous',
    options: [{ name: 'base', type: 'number', default: '10', desc: 'Logarithm base.' }, ...NICE_CLAMP_REVERSE],
  },
  {
    type: 'symlog', label: 'Symlog', group: 'continuous',
    options: [{ name: 'constant', type: 'number', default: '1', desc: 'Width of the linear region around zero.' }, ...NICE_CLAMP_REVERSE],
  },
  {
    type: 'pow', label: 'Power', group: 'continuous',
    options: [{ name: 'exponent', type: 'number', default: '1', desc: 'Power exponent.' }, ...NICE_CLAMP_REVERSE],
  },
  { type: 'sqrt', label: 'Square root', group: 'continuous', options: [...NICE_CLAMP_REVERSE] },
  { type: 'time', label: 'Time', group: 'continuous', options: [...NICE_CLAMP_REVERSE] },
  {
    type: 'band', label: 'Band', group: 'band',
    options: [{ name: 'padding', type: 'number', default: '0.1', desc: 'Gap between bands, as a fraction of the step.' }],
  },
  {
    type: 'point', label: 'Point', group: 'point',
    options: [{ name: 'padding', type: 'number', default: '0.5', desc: 'Outer padding, as a fraction of the step.' }],
  },
  {
    type: 'ordinal', label: 'Ordinal (colour)', group: 'color',
    options: [
      { name: 'scheme', type: 'string', default: "'tableau10'", desc: "Named categorical scheme ('tableau10', 'category10', 'set2', …)." },
      { name: 'reverse', type: 'boolean', default: 'false', desc: 'Flip the resolved range.' },
    ],
  },
  {
    type: 'sequential', label: 'Sequential (colour)', group: 'color',
    options: [
      { name: 'scheme', type: 'string', default: "'blues'", desc: "Named sequential ramp ('blues', 'viridis', …)." },
      { name: 'reverse', type: 'boolean', default: 'false', desc: 'Flip the resolved range.' },
    ],
  },
  {
    type: 'diverging', label: 'Diverging (colour)', group: 'color',
    options: [
      { name: 'scheme', type: 'string', default: "'RdBu'", desc: "Named diverging ramp ('RdBu', …)." },
      { name: 'pivot', type: 'number', default: '0', desc: 'The data value the ramp’s midpoint sits on.' },
      { name: 'reverse', type: 'boolean', default: 'false', desc: 'Flip the resolved range.' },
    ],
  },
];

export function scaleByType(type: ScaleKind): ScaleManifestEntry {
  const found = SCALES.find((s) => s.type === type);
  if (!found) throw new Error(`Unknown scale type: ${type}`);
  return found;
}
