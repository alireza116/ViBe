import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "axisRadial(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>.
      </>
    ),
    signatures: [
      "axisRadial({ channel, radius, bands, ticks, orient, arc, start, end, … }) → Feature",
    ],
    options: [
      {
        name: "channel",
        type: "string",
        default: "'angle'",
        desc: "Which scale to read.",
      },
      {
        name: "radius",
        type: "number",
        default: "42% of min(w,h)",
        desc: "Arc radius in px.",
      },
      {
        name: "bands",
        type: "boolean",
        default: "false",
        desc: "Fill annular sectors for discrete domains (categorical gauge chrome).",
      },
      {
        name: "bandWidth",
        type: "number",
        default: "18",
        desc: (
          <>
            Radial thickness of colored bands when <code className="inline">innerRadius</code> is 0.
          </>
        ),
      },
      {
        name: "innerRadius",
        type: "number",
        default: "0",
        desc: "Inner radius of band rings (donut-style chrome).",
      },
      {
        name: "ticks / tickValues / tickFormat",
        type: "…",
        default: "5",
        desc: (
          <>
            Same tick helpers as Cartesian axes. <code className="inline">ticks: 0</code> draws labels only; <code className="inline">tickFormat</code> takes a d3-format string or a function.
          </>
        ),
      },
      {
        name: "tickSize / labelOffset",
        type: "number",
        default: "6 / 14",
        desc: "Tick length (px, inward) and label distance beyond the rim.",
      },
      {
        name: "fontSize / labelFill",
        type: "…",
        default: "10 / '#374151'",
        desc: "Tick-label size and colour.",
      },
      {
        name: "stroke / strokeWidth",
        type: "…",
        default: "'#6b7280' / 1.25",
        desc: "Spine + tick colour / width.",
      },
      {
        name: "orient",
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'top'",
        desc: (
          <>
            Semicircle facing that side. Keep <code className="inline">scale.range</code> in sync (<code className="inline">top</code> → <code className="inline">[180, 0]</code>).
          </>
        ),
      },
      {
        name: "arc / start / end",
        type: "…",
        default: "'semi'",
        desc: (
          <>
            <code className="inline">full</code> or an explicit degree span; the scale’s numeric <code className="inline">range</code> wins when set.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "angle",
        type: "linear | point",
        desc: "Usually shares the needle’s angle field + range.",
      },
      {
        name: "fill",
        type: "ordinal",
        desc: (
          <>
            Colors categorical bands when <code className="inline">bands: true</code>. Set a palette with <code className="inline">scale: {'{'} scheme: "…" {'}'}</code> (add <code className="inline">reverse: true</code> to flip) or <code className="inline">scale: {'{'} range: [...] {'}'}</code>.
          </>
        ),
      },
      {
        name: "x / y",
        type: "linear | point",
        desc: "Optional centre (default: plot centre). When bound to fields, one ring is drawn per row (small-multiple needles).",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting background <code className="inline">path</code>/<code className="inline">line</code>/<code className="inline">text</code> nodes.
      </>
    ),
  },
];
