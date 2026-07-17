import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/scales",
  "title": "Scales & channels",
  "lead": "Two different words, kept apart. A <b>data type</b> says what a field <i>is</i> — <code class=\"inline\">quantitative</code>, <code class=\"inline\">categorical</code>, <code class=\"inline\">ordinal</code>, <code class=\"inline\">temporal</code> — and is declared once, on the <a href=\"schema.html\">schema</a>. A <b>scale type</b> says how a channel <i>draws</i> it — <code class=\"inline\">linear</code>, <code class=\"inline\">log</code>, <code class=\"inline\">band</code>, <code class=\"inline\">ordinal</code>, … — and is normally <b>derived</b>: a categorical field on a bar’s x is a band (a bar needs the interval), on a dot’s x it is a point (a dot wants the tick). So you rarely name a scale at all. When you do, <code class=\"inline\">scale</code> takes a name, a spec, or a live d3 scale. Every positional scale is invertible — that is what makes editing possible.",
  "api": [
    {
      "name": "Channel spec",
      "summary": "Each entry in a mark’s <code class=\"inline\">channels</code> is one channel: a field, a constant, or a raw field — plus an optional co-located <code class=\"inline\">edit</code>. No <code class=\"inline\">domain</code> here; a domain belongs to the data, not to a mark’s view of it.",
      "options": [
        {
          "name": "field",
          "type": "string",
          "default": "—",
          "desc": "The data field to read and map through the channel’s scale."
        },
        {
          "name": "value",
          "type": "any",
          "default": "—",
          "desc": "A <b>visual-space</b> constant — it skips the scale. <code class=\"inline\">fill: \"red\"</code> desugars to this."
        },
        {
          "name": "datum",
          "type": "any",
          "default": "—",
          "desc": "A <b>data-space</b> constant — it goes <i>through</i> the scale. <code class=\"inline\">y: { datum: 25 }</code> lands where y = 25 is, not at pixel 25."
        },
        {
          "name": "type",
          "type": "MeasureType",
          "default": "from schema",
          "desc": "The field’s <b>data</b> type. An override for a field the schema doesn’t cover — normally you declare it once on the schema instead."
        },
        {
          "name": "scale",
          "type": "string | ScaleSpec | d3 scale | null",
          "default": "derived",
          "desc": "How to draw it. <code class=\"inline\">null</code> passes the field through unscaled (a literal colour / pixel). See <b>Scale forms</b>."
        },
        {
          "name": "edit",
          "type": "Edit",
          "default": "—",
          "desc": "Co-locate an edit so a gesture writes this channel back through the same scale."
        }
      ],
      "returns": "The engine resolves <b>one global scale per channel</b>, unioning across marks and across <code class=\"inline\">x/x1/x2</code> and <code class=\"inline\">y/y1/y2</code> — including their <b>schema domains</b>, so an error bar’s <code class=\"inline\">mean</code>, <code class=\"inline\">lo</code> and <code class=\"inline\">hi</code> share one y axis spanning all three. Scales reach <code class=\"inline\">build</code> as <code class=\"inline\">scales.x</code>, <code class=\"inline\">scales.y</code>, …."
    },
    {
      "name": "Scale forms",
      "summary": "The three ways to name a scale, when the derived one isn’t what you want. A d3 scale is adopted as you built it; for a positional channel we hand it the plot’s pixel range (pixels are ours to know, palettes and radii are yours).",
      "signatures": [
        "scale: \"log\"                                  // by name",
        "scale: { type: \"sqrt\", range: [4, 20] }       // by spec",
        "scale: d3.scaleBand().padding(0.3)            // a live d3 scale",
        "scale: null                                   // unscaled passthrough"
      ],
      "options": [
        {
          "name": "ScaleSpec.type",
          "type": "ScaleType",
          "default": "derived",
          "desc": "<code class=\"inline\">linear</code>, <code class=\"inline\">log</code>, <code class=\"inline\">symlog</code>, <code class=\"inline\">pow</code>, <code class=\"inline\">sqrt</code>, <code class=\"inline\">time</code>, <code class=\"inline\">band</code>, <code class=\"inline\">point</code>, <code class=\"inline\">ordinal</code>, <code class=\"inline\">sequential</code>, <code class=\"inline\">diverging</code>."
        },
        {
          "name": "ScaleSpec.constant",
          "type": "number",
          "default": "1",
          "desc": "For <code class=\"inline\">symlog</code> — how wide the linear region around zero is. <code class=\"inline\">symlog</code> is <code class=\"inline\">log</code> for a domain that <b>crosses zero</b> or goes negative, where plain <code class=\"inline\">log</code> has no answer. It stays continuous and invertible, so it drags."
        },
        {
          "name": "ScaleSpec.pivot",
          "type": "number",
          "default": "0, or the domain midpoint",
          "desc": "For <code class=\"inline\">diverging</code> — the data value that takes the middle colour, with each side scaled independently so the pivot keeps its colour even on a lopsided domain like <code class=\"inline\">[-2, 10]</code>. Defaults to 0 when the domain straddles it. Like <code class=\"inline\">sequential</code>, it is a colour scale: not invertible, so it can’t carry an edit."
        },
        {
          "name": "ScaleSpec.range",
          "type": "any[]",
          "default": "from geometry",
          "desc": "The output extent — pixels, radii, colours. Positional ranges default to the plot size."
        },
        {
          "name": "ScaleSpec.padding",
          "type": "number",
          "default": "0.1 / 0.5",
          "desc": "Band / point padding."
        },
        {
          "name": "ScaleSpec.nice / clamp",
          "type": "boolean",
          "default": "false",
          "desc": "Continuous-scale refinements."
        },
        {
          "name": "ScaleSpec.base / exponent",
          "type": "number",
          "default": "10 / 1",
          "desc": "For <code class=\"inline\">log</code> and <code class=\"inline\">pow</code>."
        },
        {
          "name": "spec.scales",
          "type": "Record<channel, ScaleSpec>",
          "default": "—",
          "desc": "The chart-level override, keyed by channel. Scales are global, so this is their honest home; it wins over a channel’s own <code class=\"inline\">scale</code>."
        }
      ],
      "returns": "A scale carries what it can <b>do</b> — <code class=\"inline\">kind</code> (<code class=\"inline\">band</code> | <code class=\"inline\">point</code> | <code class=\"inline\">continuous</code> | <code class=\"inline\">discrete</code>) and <code class=\"inline\">invertible</code> — sniffed from the scale object itself. Marks and edits branch on that, never on a type name, which is why an adopted d3 scale drags exactly like a built-in one."
    }
  ],
  "sections": [
    {
      "id": "derived",
      "title": "The scale is derived from the data type",
      "intro": "Nothing below names a scale. The schema says <code class=\"inline\">cat</code> is categorical and <code class=\"inline\">n</code> is quantitative; the bar says it needs an interval for discrete data. Band and linear fall out. Swap <code class=\"inline\">bar</code> for <code class=\"inline\">point</code> and x becomes a point scale, with no other change.",
      "examples": [
        "scales/no-scale-named-anywhere"
      ]
    },
    {
      "id": "continuous",
      "title": "Continuous → colour & size",
      "intro": "The same numeric field through a colour channel becomes a ramp, and through the size channel a radius. A size channel’s output <code class=\"inline\">range</code> (radii, in px) is a property of the scale, so it rides on <code class=\"inline\">scale</code>.",
      "examples": [
        "scales/sequential-ramp-size"
      ]
    },
    {
      "id": "zero-crossing",
      "title": "Crossing zero — symlog & diverging",
      "intro": "Elicited quantities are often <i>differences</i>: a revision, an error, a surprise. Those span orders of magnitude and go both ways, which breaks the usual two tools — <code class=\"inline\">log</code> has nothing to say about 0 or −60, and a <code class=\"inline\">sequential</code> ramp has no reference point. <code class=\"inline\">symlog</code> is linear near zero and logarithmic beyond it; <code class=\"inline\">diverging</code> colours by distance from a pivot, each side scaled on its own.",
      "examples": [
        "scales/symlog-and-a-diverging-ramp"
      ]
    },
    {
      "id": "override",
      "title": "Naming a scale: by name, by spec, by d3",
      "intro": "A log x, a sqrt size range, and a d3 band with custom padding — three forms, one option. The d3 scale is adopted as built; because it is positional and named no range, it is given the plot’s pixel range. Its padding survives, and so does its invertibility: the drag works.",
      "examples": [
        "scales/log-sqrt-an-adopted-d3-scale"
      ]
    },
    {
      "id": "categorical",
      "title": "Categorical → ordinal palette",
      "intro": "A categorical field on a colour channel resolves through the ordinal palette — one hue per category.",
      "examples": [
        "scales/ordinal-palette"
      ]
    },
    {
      "id": "categorical-position",
      "title": "Categorical position → point scale",
      "intro": "When a positional channel is categorical, a dot resolves it to a point scale — the mark sits on the category’s tick. Two categorical axes make a discrete grid. Note <code class=\"inline\">ordinal</code> vs <code class=\"inline\">categorical</code> on <code class=\"inline\">y</code>: an ordinal domain’s <i>order</i> is meaningful.",
      "examples": [
        "scales/a-discrete-grid"
      ]
    }
  ]
};

export default page;
