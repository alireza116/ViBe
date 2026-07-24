import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: 'bar(options) · barY(options) · barX(options)',
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>.{' '}
        <code className="inline">bar</code> infers orientation from which axis is a
        band; <code className="inline">barY</code> forces vertical,{' '}
        <code className="inline">barX</code> horizontal. All three share these
        options.
      </>
    ),
    signatures: [
      'bar({ channels, orientation, edits, constraints, id }) → Feature',
      'barY(options) → Feature   // orientation: "vertical"',
      'barX(options) → Feature   // orientation: "horizontal"',
    ],
    options: [
      {
        name: 'channels',
        type: 'object',
        default: '{}',
        desc: (
          <>
            Channel map — one band axis (category) and one linear axis (value or a
            span). See <b>Channels</b>.
          </>
        ),
      },
      {
        name: 'orientation',
        type: "'vertical' | 'horizontal'",
        default: 'auto',
        desc: <>Override the inferred direction (bar only; barY/barX pin it).</>,
      },
      {
        name: 'stack',
        type: 'true | string',
        default: '—',
        desc: (
          <>
            Stack bars that share a category. <code className="inline">true</code>{' '}
            uses the fill/series field; a string names the series field. Declare a
            schema domain covering the stacked total.
          </>
        ),
      },
      {
        name: 'edits',
        type: 'Edit[]',
        default: '—',
        desc: (
          <>
            Mark-level edits; per-channel edits live in{' '}
            <code className="inline">channels[ch].edit</code>.
          </>
        ),
      },
      {
        name: 'constraints',
        type: 'Constraint[]',
        default: '—',
        desc: (
          <>
            Data invariants. Sugar — promoted to the dataset, so they hold for every
            edit from every mark (e.g. <code className="inline">maintainSum</code>).
          </>
        ),
      },
      {
        name: 'fill, stroke, …',
        type: 'style',
        default: "fill: 'steelblue'",
        desc: <>Style shorthands / channels (see the style surface on any mark).</>,
      },
    ],
    channels: [
      {
        name: 'x',
        type: 'band | linear',
        desc: <>Category (band) or value (linear), depending on orientation.</>,
      },
      {
        name: 'y',
        type: 'band | linear',
        desc: (
          <>
            The other axis. The value axis carries{' '}
            <code className="inline">edit: move()</code> to make bars draggable.
          </>
        ),
      },
      {
        name: 'y1 / y2',
        type: 'linear',
        desc: (
          <>
            Explicit vertical span (barY) — draw between two values instead of from
            the baseline.
          </>
        ),
      },
      {
        name: 'x1 / x2',
        type: 'linear',
        desc: <>Explicit horizontal span (barX) — a Gantt-style range per category.</>,
      },
      {
        name: 'fill, stroke, strokeWidth, opacity',
        type: 'const | field',
        desc: <>Standard style surface; a field tints through the ordinal palette.</>,
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one <code className="inline">rect</code> per datum,
        styled through the standard surface.
      </>
    ),
  },
];
