import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/tick",
  "title": "Tick",
  "lead": "A tick is bar’s zero-thickness sibling: a thin line marking a value on the linear axis and spanning the other axis. Over a category band it reads as a value marker (like a bar without the fill); over a full continuous extent it reads as a rug / strip. <code class=\"inline\">inset</code> shrinks each end, <code class=\"inline\">length</code> fixes a centered length.",
  "api": [
    {
      "name": "tick(options) · tickY(options) · tickX(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">tick</code> infers the value axis from which axis is a band; <code class=\"inline\">tickY</code> marks a value on y (spans the x band), <code class=\"inline\">tickX</code> on x.",
      "signatures": [
        "tick({ channels, inset, length, edits, constraints, id }) → Feature",
        "tickY(options) → Feature   // value on y",
        "tickX(options) → Feature   // value on x"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "One band axis (span) + one linear axis (the marked value). See <b>Channels</b>."
        },
        {
          "name": "inset",
          "type": "number",
          "default": "0",
          "desc": "Pixels to shrink each end of the span."
        },
        {
          "name": "length",
          "type": "number",
          "default": "—",
          "desc": "Explicit centered span length in pixels. On a band axis it centres in the band; when the span axis also has a channel (e.g. scatter <code class=\"inline\">x</code>+<code class=\"inline\">y</code>), it centres on that channel’s encoded position so a short tick sits on the datum."
        },
        {
          "name": "edits",
          "type": "Edit[]",
          "default": "—",
          "desc": "Mark-level edits; per-channel edits live in the channels map."
        },
        {
          "name": "constraints",
          "type": "Constraint[]",
          "default": "—",
          "desc": "Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark."
        },
        {
          "name": "stroke, strokeWidth, …",
          "type": "style",
          "default": "stroke:'steelblue'",
          "desc": "Style shorthands / channels."
        }
      ],
      "channels": [
        {
          "name": "x",
          "type": "band | linear",
          "desc": "Category (band) or value (linear), per orientation."
        },
        {
          "name": "y",
          "type": "band | linear",
          "desc": "The other axis; the value axis carries <code class=\"inline\">edit: drag()</code> to drag the tick."
        },
        {
          "name": "stroke, strokeWidth, opacity",
          "type": "const | field",
          "desc": "Standard style surface."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">line</code> per datum (a bar with zero thickness)."
    }
  ],
  "sections": [
    {
      "id": "value-marker",
      "title": "A value marker across bands",
      "intro": "tickY marks a y value spanning each category’s band — the same channel/edit model as a bar, so it drags identically.",
      "examples": [
        "marks-tick/ticks-over-a-band-axis",
        "marks-tick/drag-a-value-ticks"
      ]
    },
    {
      "id": "rug",
      "title": "A rug / strip plot",
      "intro": "With no band on the other axis, a tick spans the full extent — a strip of marks at each datum’s position. inset trims the ends so the strip floats off the frame.",
      "examples": [
        "marks-tick/tickx-a-distribution-strip"
      ]
    }
  ]
};

export default page;
