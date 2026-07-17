import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "trend(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. A single-datum glyph; the fitted line is non-interactive and each handle is a draggable circle scoped to its own field.
      </>
    ),
    signatures: [
      "trend({ anchor, probe, interceptStage, slopeStage, handleSize, id }) → Feature",
    ],
    options: [
      {
        name: "anchor",
        type: "number",
        default: "0 (if in x domain), else min",
        desc: "x position of the intercept handle and the slope-rotation pivot. 0 is the classic y-intercept.",
      },
      {
        name: "probe",
        type: "number",
        default: "x-domain max",
        desc: "x position of the slope handle.",
      },
      {
        name: "interceptStage",
        type: "number",
        default: "null",
        desc: "Stage in which the intercept handle is active (null = always).",
      },
      {
        name: "slopeStage",
        type: "number",
        default: "null",
        desc: "Stage in which the slope handle is active (null = always).",
      },
      {
        name: "handleSize",
        type: "number",
        default: "6",
        desc: "Handle circle radius.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting the fitted <code className="inline">line</code> (edge-to-edge through the plot) plus two handle <code className="inline">circle</code>s. Sets <code className="inline">isTrend</code> so unspecified chart axes cross at the origin.
      </>
    ),
  },
];
