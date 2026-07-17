import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "line · lineY · lineX · connectedScatter · path",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. One non-interactive connector path per series, drawn under one draggable <code className="inline">circle</code> handle per datum. <code className="inline">lineY</code>/<code className="inline">lineX</code> pin the value axis; <code className="inline">connectedScatter</code> and <code className="inline">path</code> default to <code className="inline">order:"sequence"</code>.
      </>
    ),
    signatures: [
      "line({ channels, series, order, curve, handles, handleSize, samples, edits }) → Feature",
      "lineY(options) → Feature   // value on y (time series)",
      "connectedScatter(options) → Feature   // order: \"sequence\"",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Channel map — see <b>Channels</b>.
          </>
        ),
      },
      {
        name: "series",
        type: "string",
        default: "auto",
        desc: (
          <>
            Field grouping points into lines (alias <code className="inline">z</code>). Defaults to the stroke/color field so a coloured chart auto-groups.
          </>
        ),
      },
      {
        name: "order",
        type: "'domain' | 'sequence' | field",
        default: "'domain'",
        desc: "How each series is connected: sorted by the domain axis, as-drawn, or by a named field.",
      },
      {
        name: "curve",
        type: "string",
        default: "'linear'",
        desc: (
          <>
            Interpolation between handles (e.g. <code className="inline">"catmullRom"</code>, <code className="inline">"step"</code>).
          </>
        ),
      },
      {
        name: "handles",
        type: "boolean",
        default: "true",
        desc: "Show the per-datum handles. When false they stay (for hit-testing) but render invisible.",
      },
      {
        name: "handleSize",
        type: "number",
        default: "4",
        desc: "Pixel radius of each handle.",
      },
      {
        name: "samples",
        type: "number | any[]",
        default: "ticks",
        desc: (
          <>
            Domain grid used by line authoring (<code className="inline">newSeries</code>/<code className="inline">draw</code>).
          </>
        ),
      },
      {
        name: "edits, constraints, id",
        type: "—",
        default: "—",
        desc: (
          <>
            As on every mark. Line authoring edits live under <code className="inline">edit.line.*</code>.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "x",
        type: "linear | band | time",
        desc: "Domain or value axis (per variant / inference).",
      },
      {
        name: "y",
        type: "linear | band | time",
        desc: "The other axis; the value axis carries the handle edit.",
      },
      {
        name: "stroke / color",
        type: "const | field",
        desc: (
          <>
            Line colour; a field here also becomes the default <code className="inline">series</code> grouping.
          </>
        ),
      },
      {
        name: "strokeWidth, opacity",
        type: "const | field",
        desc: "Standard style surface for the connector + handles.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> with <code className="inline">supportsSeries: true</code>. Emits one <code className="inline">path</code> per series (<code className="inline">pointerEvents:"none"</code>) plus one indexed <code className="inline">circle</code> handle per datum, each tagged with its <code className="inline">series</code>.
      </>
    ),
  },
];
