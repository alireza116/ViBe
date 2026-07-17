import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Channel spec",
    summary: (
      <>
        Each entry in a mark’s <code className="inline">channels</code> is one channel: a field, a constant, or a raw field — plus an optional co-located <code className="inline">edit</code>. No <code className="inline">domain</code> here; a domain belongs to the data, not to a mark’s view of it.
      </>
    ),
    options: [
      {
        name: "field",
        type: "string",
        default: "—",
        desc: "The data field to read and map through the channel’s scale.",
      },
      {
        name: "value",
        type: "any",
        default: "—",
        desc: (
          <>
            A <b>visual-space</b> constant — it skips the scale. <code className="inline">fill: "red"</code> desugars to this.
          </>
        ),
      },
      {
        name: "datum",
        type: "any",
        default: "—",
        desc: (
          <>
            A <b>data-space</b> constant — it goes <i>through</i> the scale. <code className="inline">y: {'{'} datum: 25 {'}'}</code> lands where y = 25 is, not at pixel 25.
          </>
        ),
      },
      {
        name: "type",
        type: "MeasureType",
        default: "from schema",
        desc: (
          <>
            The field’s <b>data</b> type. An override for a field the schema doesn’t cover — normally you declare it once on the schema instead.
          </>
        ),
      },
      {
        name: "scale",
        type: "string | ScaleSpec | d3 scale | null",
        default: "derived",
        desc: (
          <>
            How to draw it. <code className="inline">null</code> passes the field through unscaled (a literal colour / pixel). See <b>Scale forms</b>.
          </>
        ),
      },
      {
        name: "edit",
        type: "Edit",
        default: "—",
        desc: "Co-locate an edit so a gesture writes this channel back through the same scale.",
      },
    ],
    returns: (
      <>
        The engine resolves <b>one global scale per channel</b>, unioning across marks and across <code className="inline">x/x1/x2</code> and <code className="inline">y/y1/y2</code> — including their <b>schema domains</b>, so an error bar’s <code className="inline">mean</code>, <code className="inline">lo</code> and <code className="inline">hi</code> share one y axis spanning all three. Scales reach <code className="inline">build</code> as <code className="inline">scales.x</code>, <code className="inline">scales.y</code>, ….
      </>
    ),
  },
  {
    name: "Scale forms",
    summary: "The three ways to name a scale, when the derived one isn’t what you want. A d3 scale is adopted as you built it; for a positional channel we hand it the plot’s pixel range (pixels are ours to know, palettes and radii are yours).",
    signatures: [
      "scale: \"log\"                                  // by name",
      "scale: { type: \"sqrt\", range: [4, 20] }       // by spec",
      "scale: d3.scaleBand().padding(0.3)            // a live d3 scale",
      "scale: null                                   // unscaled passthrough",
    ],
    options: [
      {
        name: "ScaleSpec.type",
        type: "ScaleType",
        default: "derived",
        desc: (
          <>
            <code className="inline">linear</code>, <code className="inline">log</code>, <code className="inline">symlog</code>, <code className="inline">pow</code>, <code className="inline">sqrt</code>, <code className="inline">time</code>, <code className="inline">band</code>, <code className="inline">point</code>, <code className="inline">ordinal</code>, <code className="inline">sequential</code>, <code className="inline">diverging</code>.
          </>
        ),
      },
      {
        name: "ScaleSpec.constant",
        type: "number",
        default: "1",
        desc: (
          <>
            For <code className="inline">symlog</code> — how wide the linear region around zero is. <code className="inline">symlog</code> is <code className="inline">log</code> for a domain that <b>crosses zero</b> or goes negative, where plain <code className="inline">log</code> has no answer. It stays continuous and invertible, so it drags.
          </>
        ),
      },
      {
        name: "ScaleSpec.pivot",
        type: "number",
        default: "0, or the domain midpoint",
        desc: (
          <>
            For <code className="inline">diverging</code> — the data value that takes the middle colour, with each side scaled independently so the pivot keeps its colour even on a lopsided domain like <code className="inline">[-2, 10]</code>. Defaults to 0 when the domain straddles it. Like <code className="inline">sequential</code>, it is a colour scale: not invertible, so it can’t carry an edit.
          </>
        ),
      },
      {
        name: "ScaleSpec.range",
        type: "any[]",
        default: "from geometry",
        desc: "The output extent — pixels, radii, colours. Positional ranges default to the plot size.",
      },
      {
        name: "ScaleSpec.padding",
        type: "number",
        default: "0.1 / 0.5",
        desc: "Band / point padding.",
      },
      {
        name: "ScaleSpec.nice / clamp",
        type: "boolean",
        default: "false",
        desc: "Continuous-scale refinements.",
      },
      {
        name: "ScaleSpec.base / exponent",
        type: "number",
        default: "10 / 1",
        desc: (
          <>
            For <code className="inline">log</code> and <code className="inline">pow</code>.
          </>
        ),
      },
      {
        name: "spec.scales",
        type: "Record<channel, ScaleSpec>",
        default: "—",
        desc: (
          <>
            The chart-level override, keyed by channel. Scales are global, so this is their honest home; it wins over a channel’s own <code className="inline">scale</code>.
          </>
        ),
      },
    ],
    returns: (
      <>
        A scale carries what it can <b>do</b> — <code className="inline">kind</code> (<code className="inline">band</code> | <code className="inline">point</code> | <code className="inline">continuous</code> | <code className="inline">discrete</code>) and <code className="inline">invertible</code> — sniffed from the scale object itself. Marks and edits branch on that, never on a type name, which is why an adopted d3 scale drags exactly like a built-in one.
      </>
    ),
  },
];
