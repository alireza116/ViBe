import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/point",
  "title": "Point",
  "lead": "<code class=\"inline\">point</code> is the channel-driven circle: every channel — x, y, size, fill/color, stroke — resolves through the global scales, so one mark is a full scatter.",
  "api": [
    {
      "name": "point(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. A circle per datum; every channel — positional or not — resolves through the global scales.",
      "signature": "point({ channels, edits, constraints, id }) → Feature",
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Channel map — see <b>Channels</b>."
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
          "name": "fill, stroke, …",
          "type": "style",
          "default": "fill: 'steelblue'",
          "desc": "Style shorthands / channels."
        }
      ],
      "channels": [
        {
          "name": "x",
          "type": "linear | band",
          "desc": "Horizontal position; omitted parks the dot at the centre of x."
        },
        {
          "name": "y",
          "type": "linear | band",
          "desc": "Vertical position; omitted parks the dot at the centre of y."
        },
        {
          "name": "size",
          "type": "linear",
          "desc": "The dot radius (default 5). Pair with <code class=\"inline\">edit: resize()</code> to drag the radius."
        },
        {
          "name": "fill / color",
          "type": "const | field",
          "desc": "Fill; a field tints through the ordinal palette (<code class=\"inline\">color</code> is the legacy fallback)."
        },
        {
          "name": "stroke, strokeWidth, opacity",
          "type": "const | field",
          "desc": "Standard style surface."
        }
      ],
      "returns": "A <b>feature</b> emitting one <code class=\"inline\">circle</code> per datum."
    }
  ],
  "sections": [
    {
      "id": "channels",
      "title": "Channels: size, fill, colour",
      "intro": "A numeric field can drive the radius (size) and a continuous colour ramp at once; a categorical field drives the ordinal palette. Constants and fields mix freely on the same mark.",
      "examples": [
        "marks-point/sequential-fill-size-from-a-number",
        "marks-point/constant-style-shorthands"
      ]
    },
    {
      "id": "editing",
      "title": "Moving points in 2D",
      "intro": "When both x and y carry a drag, a gesture inverts the pointer through both positional scales.",
      "examples": [
        "marks-point/2d-move-scatter"
      ]
    }
  ]
};

export default page;
