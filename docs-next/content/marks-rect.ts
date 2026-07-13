import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/rect",
  "title": "Rect",
  "lead": "The generalized <b>bar</b>: each axis independently resolves its extent as a <b>span</b> (x1/x2, y1/y2), a categorical <b>band</b>, or a baseline→value length — so a rectangle can span BOTH axes at once (Observable Plot’s rect: heatmap cells, 2-D regions, binned histograms, annotation boxes). <code class=\"inline\">rect</code> spans both axes; <code class=\"inline\">rectX</code> / <code class=\"inline\">rectY</code> force one axis to a baseline→value length. Prefer <code class=\"inline\">bar</code> when one axis is a category band and the other a value (classic elicitation bars); use <code class=\"inline\">rect</code> when both axes are spans/bands, and pair it with <code class=\"inline\">brushRect()</code> for edge/corner/body editing.",
  "api": [
    {
      "name": "rect(options) · rectX(options) · rectY(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">rect</code> spans both axes; <code class=\"inline\">rectX</code> forces value on x (y a span/band), <code class=\"inline\">rectY</code> forces value on y. All three share these options.",
      "signatures": [
        "rect({ channels, edits, constraints, id }) → Feature",
        "rectX(options) → Feature   // value on x",
        "rectY(options) → Feature   // value on y"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Channel map — spans (x1/x2, y1/y2), bands, or single x/y values per axis. See <b>Channels</b>."
        },
        {
          "name": "edits",
          "type": "Edit[]",
          "default": "—",
          "desc": "Mark-level edits; per-channel edits live in <code class=\"inline\">channels[ch].edit</code>. Use <code class=\"inline\">brushRect</code> for 2-D edge/corner/body editing."
        },
        {
          "name": "constraints",
          "type": "Constraint[]",
          "default": "—",
          "desc": "Data invariants, promoted to the dataset."
        },
        {
          "name": "fill, stroke, …",
          "type": "style",
          "default": "fill: 'steelblue'",
          "desc": "Style shorthands / channels (the shared style surface)."
        }
      ],
      "channels": [
        {
          "name": "x1 / x2",
          "type": "linear",
          "desc": "Horizontal span endpoints. Share x’s resolved scale."
        },
        {
          "name": "y1 / y2",
          "type": "linear",
          "desc": "Vertical span endpoints. Share y’s resolved scale."
        },
        {
          "name": "x / y",
          "type": "band | linear",
          "desc": "A single value (baseline→value) or a band, when that axis isn’t a span."
        },
        {
          "name": "fill, stroke, strokeWidth, opacity",
          "type": "const | field",
          "desc": "Standard style surface; a field tints through the ordinal palette."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">rect</code> per datum."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "A 2-D rectangle (both axes are spans)",
      "intro": "Give both axes explicit endpoints and each datum draws a rectangle spanning x1→x2 and y1→y2.",
      "examples": [
        "marks-rect/region-boxes"
      ]
    },
    {
      "id": "histogram",
      "title": "Binned histogram (rectY)",
      "intro": "A histogram is a vertical rect whose <b>x</b> is a quantitative bin span (x1/x2) and whose <b>y</b> is a count from the baseline — that is exactly <code class=\"inline\">rectY</code>. Data must already be binned (one row per bin); there is no binning transform. Prefer <code class=\"inline\">barY</code> when bins are categorical labels instead of numeric edges.",
      "examples": [
        "marks-rect/pre-binned-counts",
        "marks-rect/editable-bin-heights"
      ]
    },
    {
      "id": "editing",
      "title": "Composable 2-D editing (brushRect)",
      "intro": "brushRect() edits all four extents. It is OPT-IN and composable: grab an EDGE to resize one side, a CORNER to resize two extents, the BODY to move the whole rect. <code class=\"inline\">resize</code> ('both' | 'x' | 'y' | 'none') picks which axes resize; <code class=\"inline\">move</code> (bool) toggles body-drag — so you can ship resize-one-axis, move-only, or resize-only.",
      "examples": [
        "marks-rect/full-2-d-edges-corners-body",
        "marks-rect/resize-x-only",
        "marks-rect/move-only"
      ]
    }
  ]
};

export default page;
