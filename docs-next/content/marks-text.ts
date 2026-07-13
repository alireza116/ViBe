import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/text",
  "title": "Text",
  "lead": "A per-datum <b>label</b> (Observable Plot’s text). It places a string at a positional (x, y); <code class=\"inline\">text</code>/<code class=\"inline\">fontSize</code>/<code class=\"inline\">textAnchor</code>/<code class=\"inline\">lineAnchor</code>/<code class=\"inline\">dx</code>/<code class=\"inline\">dy</code> are read RAW (a field or a constant), <code class=\"inline\">angle</code> is degrees, and <code class=\"inline\">format</code> is a d3-format string or function (display-only). A text mark is editable like any other: drag to reposition, drag a value to update a numeric readout, <code class=\"inline\">cycle()</code> a label, <code class=\"inline\">rotate()</code> it, or <code class=\"inline\">editText()</code> to retype its content.",
  "api": [
    {
      "name": "text(options) · textX(options) · textY(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">text</code> positions from x AND y; <code class=\"inline\">textX</code> / <code class=\"inline\">textY</code> are 1-D labels along one axis (the other parks at centre).",
      "signatures": [
        "text({ channels, dx, dy, lineAnchor, format, edits, constraints, id }) → Feature",
        "textX(options) → Feature   // value on x",
        "textY(options) → Feature   // value on y"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Channel map. See <b>Channels</b>."
        },
        {
          "name": "text, fontSize, textAnchor, lineAnchor, dx, dy",
          "type": "shorthand",
          "default": "—",
          "desc": "Constant shorthands, e.g. <code class=\"inline\">text({ dy: -8, lineAnchor: \"bottom\" })</code>."
        },
        {
          "name": "format",
          "type": "string | fn",
          "default": "String",
          "desc": "Display formatter: a d3-format string (e.g. <code class=\"inline\">\".1f\"</code>) or <code class=\"inline\">(v) => string</code>. Display-only — the field stays raw. Helpers live on <code class=\"inline\">format</code> (<code class=\"inline\">format.number</code>, <code class=\"inline\">format.percent</code>, …)."
        },
        {
          "name": "edits",
          "type": "Edit[]",
          "default": "—",
          "desc": "Mark-level edits; per-channel edits live in <code class=\"inline\">channels[ch].edit</code>."
        }
      ],
      "channels": [
        {
          "name": "x / y",
          "type": "linear | band",
          "desc": "Position. A missing axis parks the label at that dimension’s centre."
        },
        {
          "name": "text",
          "type": "field | const",
          "desc": "The value to draw (raw — no scale; passed through <code class=\"inline\">format</code>)."
        },
        {
          "name": "fontSize",
          "type": "field | const",
          "desc": "Size in px, raw."
        },
        {
          "name": "textAnchor",
          "type": "field | const",
          "desc": "Horizontal anchor: <code class=\"inline\">start</code>·<code class=\"inline\">middle</code>·<code class=\"inline\">end</code>."
        },
        {
          "name": "lineAnchor",
          "type": "field | const",
          "desc": "Vertical anchor: <code class=\"inline\">top</code>·<code class=\"inline\">middle</code>·<code class=\"inline\">bottom</code> (maps to SVG <code class=\"inline\">dominant-baseline</code>)."
        },
        {
          "name": "dx / dy",
          "type": "field | const",
          "desc": "Pixel offsets from the encoded (x, y). Visual-only — drag still inverts the pointer through the scale."
        },
        {
          "name": "angle",
          "type": "field | const",
          "desc": "Rotation in degrees (scaled when a scale is declared, so <code class=\"inline\">rotate()</code> is an exact inverse)."
        },
        {
          "name": "fill, opacity",
          "type": "const | field",
          "desc": "Standard style surface."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">text</code> per datum."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "Labels from data",
      "intro": "x/y position the label; text is its string. Offset and anchor keep it clear of the mark it labels.",
      "examples": [
        "marks-text/a-labelled-scatter",
        "marks-text/formatted-numeric-labels",
        "marks-text/line-chart-with-value-labels"
      ]
    },
    {
      "id": "editing",
      "title": "Editing labels",
      "intro": "A direct-pick edit makes a label interactive. Reuse the universal edits — nothing text-specific — or <code class=\"inline\">editText()</code> to retype the content.",
      "examples": [
        "marks-text/drag-to-reposition",
        "marks-text/draggable-numeric-readout",
        "marks-text/type-to-edit-content",
        "marks-text/drag-and-retype-together"
      ]
    }
  ]
};

export default page;
