import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/bar",
  "title": "Bar",
  "lead": "A rectangular mark: one axis is a categorical <b>band</b> (the position), the other a linear <b>value</b> drawn as length from a baseline (or an explicit start/end span via x1/x2 or y1/y2). <code class=\"inline\">bar</code> auto-detects orientation from which axis is a band; <code class=\"inline\">barY</code> forces vertical, <code class=\"inline\">barX</code> horizontal. For rectangles that span <b>both</b> axes (heatmap cells, 2-D regions), use <code class=\"inline\">rect</code> + <code class=\"inline\">brushRect()</code> instead.",
  "api": [
    {
      "name": "bar(options) · barY(options) · barX(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">bar</code> infers orientation from which axis is a band; <code class=\"inline\">barY</code> forces vertical, <code class=\"inline\">barX</code> horizontal. All three share these options.",
      "signatures": [
        "bar({ channels, orientation, edits, constraints, id }) → Feature",
        "barY(options) → Feature   // orientation: \"vertical\"",
        "barX(options) → Feature   // orientation: \"horizontal\""
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Channel map — one band axis (category) and one linear axis (value or a span). See <b>Channels</b>."
        },
        {
          "name": "orientation",
          "type": "'vertical' | 'horizontal'",
          "default": "auto",
          "desc": "Override the inferred direction (bar only; barY/barX pin it)."
        },
        {
          "name": "stack",
          "type": "true | string",
          "default": "—",
          "desc": "Stack bars that share a category. <code class=\"inline\">true</code> uses the fill/series field; a string names the series field. Declare a schema domain covering the stacked total."
        },
        {
          "name": "edits",
          "type": "Edit[]",
          "default": "—",
          "desc": "Mark-level edits; per-channel edits live in <code class=\"inline\">channels[ch].edit</code>."
        },
        {
          "name": "constraints",
          "type": "Constraint[]",
          "default": "—",
          "desc": "Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark (e.g. <code class=\"inline\">maintainSum</code>)."
        },
        {
          "name": "fill, stroke, …",
          "type": "style",
          "default": "fill: 'steelblue'",
          "desc": "Style shorthands / channels (see the style surface on any mark)."
        }
      ],
      "channels": [
        {
          "name": "x",
          "type": "band | linear",
          "desc": "Category (band) or value (linear), depending on orientation."
        },
        {
          "name": "y",
          "type": "band | linear",
          "desc": "The other axis. The value axis carries <code class=\"inline\">edit: drag()</code> to make bars draggable."
        },
        {
          "name": "y1 / y2",
          "type": "linear",
          "desc": "Explicit vertical span (barY) — draw between two values instead of from the baseline."
        },
        {
          "name": "x1 / x2",
          "type": "linear",
          "desc": "Explicit horizontal span (barX) — a Gantt-style range per category."
        },
        {
          "name": "fill, stroke, strokeWidth, opacity",
          "type": "const | field",
          "desc": "Standard style surface; a field tints through the ordinal palette."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">rect</code> per datum, styled through the standard surface."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "Band × value",
      "intro": "The band axis slots the bars; the linear axis sets their length from a baseline.",
      "examples": [
        "marks-bar/a-vertical-bar-chart",
        "marks-bar/colour-by-a-field"
      ]
    },
    {
      "id": "orientation",
      "title": "Horizontal bars (barX)",
      "intro": "Put the band on y and the value on x and the bars run horizontally. barX forces this orientation; bar would infer it from the band axis.",
      "examples": [
        "marks-bar/barx-value-on-x"
      ]
    },
    {
      "id": "span",
      "title": "Explicit spans (x1/x2, y1/y2)",
      "intro": "Instead of one value drawn from the baseline, give the value axis two explicit endpoints — x1/x2 for barX, y1/y2 for barY — for a span that doesn’t start at zero (a Gantt-style range per category). x1/x2 share the same resolved scale as x (likewise y1/y2 with y), so only one needs an explicit type/domain.",
      "examples": [
        "marks-bar/years-active-per-person",
        "marks-bar/brush-edges-body-together"
      ]
    },
    {
      "id": "editing",
      "title": "Editing bars",
      "intro": "Put edit: drag() on the value channel and a bar drags to rewrite its value. Thin bars are easier to grab with pick: \"nearest\" — grab from anywhere in the column.",
      "examples": [
        "marks-bar/drag-a-value",
        "marks-bar/nearest-pick-self-drawn-guide"
      ]
    }
  ]
};

export default page;
