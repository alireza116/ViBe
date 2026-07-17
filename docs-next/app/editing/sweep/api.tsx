import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "edit.line.sweep(options)",
    summary: (
      <>
        Line-scoped (<code className="inline">scope: "line"</code>). Sugar over <code className="inline">drag({'{'} pick: "sweep", guide: true {'}'})</code>: a drag repaints the value of each point the pointer crosses, locked to one series.
      </>
    ),
    signatures: [
      "edit.line.sweep(options?) → Edit",
    ],
    options: [
      {
        name: "options",
        type: "object",
        default: "{}",
        desc: (
          <>
            Any shared Edit fields — <code className="inline">channels</code>, <code className="inline">when</code>, <code className="inline">threshold</code>, <code className="inline">constrain</code>. <code className="inline">pick</code>/<code className="inline">guide</code>/<code className="inline">scope</code> are preset.
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>Edit</b> the engine routes through the <code className="inline">sweep</code> driver (locks the nearest line at drag-start).
      </>
    ),
  },
  {
    name: "edit.line.draw(options)",
    summary: (
      <>
        The authoring counterpart: near an existing line it edits (sweeps) it; in empty space it draws a new one — you-draw-it for domain lines, freehand for <code className="inline">order:"sequence"</code>.
      </>
    ),
    signatures: [
      "edit.line.draw({ along, value, samples, minDist, threshold, into }) → Edit",
    ],
    options: [
      {
        name: "along / value",
        type: "'x' | 'y'",
        default: "'x' / 'y'",
        desc: "The positional axes — the independent axis to draw along, and the value axis.",
      },
      {
        name: "samples",
        type: "number | any[]",
        default: "ticks",
        desc: "Domain grid the you-draw-it upsert snaps to.",
      },
      {
        name: "minDist",
        type: "number",
        default: "8",
        desc: "Freehand pointer-sampling distance in pixels.",
      },
      {
        name: "threshold",
        type: "number",
        default: "40",
        desc: "Proximity radius for the edit-vs-draw decision.",
      },
      {
        name: "into",
        type: "'nearest' | 'new'",
        default: "'nearest'",
        desc: "Near edits / far draws, or always draw a fresh line.",
      },
    ],
    returns: (
      <>
        An <b>Edit</b> routed through the <code className="inline">draw</code> driver (owns the per-drag mode lock).
      </>
    ),
  },
];
