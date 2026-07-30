import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "arc(options) · pie(options) · donut(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. <code className="inline">pie</code> / <code className="inline">donut</code> are thin wrappers.
      </>
    ),
    signatures: [
      "arc({ channels, outerRadius, innerRadius, padAngle, arc, start, end }) → Feature",
      "pie(options) → Feature",
      "donut(options) → Feature",
    ],
    options: [
      {
        name: "outerRadius",
        type: "number",
        default: "fits the slot",
        desc: "Outer radius in px, for every donut. Omit to fit the slot (a band cell, or a shrunk scatter default); or bind a size field for a per-donut radius.",
      },
      {
        name: "innerRadius",
        type: "number",
        default: "0",
        desc: (
          <>
            Inner radius; {'>'}0 makes a donut. A value in <code className="inline">(0,1]</code> is a <b>ratio</b> of the outer radius (so a fitted / size-driven donut stays proportional); {'>'}1 is absolute px. <code className="inline">donut()</code> defaults this.
          </>
        ),
      },
      {
        name: "padAngle",
        type: "number",
        default: "0",
        desc: "Gap between slices in degrees.",
      },
      {
        name: "arc / start / end",
        type: "…",
        default: "'full'",
        desc: "Angular span of the whole pie.",
      },
      {
        name: "edits",
        type: "Edit | Edit[]",
        default: "—",
        desc: (
          <>
            Boundary editing — usually <code className="inline">edit.arc.edge()</code>. Draws a grab handle on every boundary (a full circle also gets a seam handle).
          </>
        ),
      },
      {
        name: "handles / handleSize",
        type: "boolean / number",
        default: "true / 5",
        desc: (
          <>
            <code className="inline">handles: false</code> keeps the edge grabbable but hides the dot.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "value",
        type: "magnitude field",
        desc: "Slice size in data units; layout normalizes by the sum of rows.",
      },
      {
        name: "fill",
        type: "ordinal | const",
        desc: "Slice colour.",
      },
      {
        name: "x / y",
        type: "field | const",
        desc: "Donut centre. Bind a field to place one donut per distinct value (a band category, or a scatter coordinate) — a grid of donuts, grouped by the encoding. Unbound → the plot centre (one donut).",
      },
      {
        name: "size",
        type: "field | const",
        desc: "Optional per-donut outer radius (e.g. turnout), through the size scale. Overridden by an explicit outerRadius.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one filled <code className="inline">path</code> per row.
      </>
    ),
  },
];
