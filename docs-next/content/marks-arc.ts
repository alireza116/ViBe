import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/arc",
  "title": "Arc · Pie · Donut",
  "lead": "Data-driven <b>pie</b> and <b>donut</b> slices. Each row’s magnitude (the <code class=\"inline\">angle</code> field) is stacked and normalized to a circle (or partial arc). Shares path math with <code class=\"inline\">axisRadial</code>. Wire <code class=\"inline\">edit: edit.arc.edge()</code> to <b>drag a slice boundary</b> and redistribute the two adjacent shares (the total stays fixed).",
  "api": [
    {
      "name": "arc(options) · pie(options) · donut(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">pie</code> / <code class=\"inline\">donut</code> are thin wrappers.",
      "signatures": [
        "arc({ channels, outerRadius, innerRadius, padAngle, arc, start, end }) → Feature",
        "pie(options) → Feature",
        "donut(options) → Feature"
      ],
      "options": [
        {
          "name": "outerRadius",
          "type": "number",
          "default": "40% of min(w,h)",
          "desc": "Outer radius in px."
        },
        {
          "name": "innerRadius",
          "type": "number",
          "default": "0",
          "desc": "Inner radius; &gt;0 makes a donut. <code class=\"inline\">donut()</code> defaults this."
        },
        {
          "name": "padAngle",
          "type": "number",
          "default": "0",
          "desc": "Gap between slices in degrees."
        },
        {
          "name": "arc / start / end",
          "type": "…",
          "default": "'full'",
          "desc": "Angular span of the whole pie."
        },
        {
          "name": "edit",
          "type": "Edit | Edit[]",
          "default": "—",
          "desc": "Boundary editing — usually <code class=\"inline\">edit.arc.edge()</code>. Draws a grab handle on every boundary (a full circle also gets a seam handle)."
        },
        {
          "name": "handles / handleSize",
          "type": "boolean / number",
          "default": "true / 5",
          "desc": "<code class=\"inline\">handles: false</code> keeps the edge grabbable but hides the dot."
        }
      ],
      "channels": [
        {
          "name": "angle",
          "type": "magnitude field",
          "desc": "Slice size in data units; layout normalizes by the sum of rows."
        },
        {
          "name": "fill",
          "type": "ordinal | const",
          "desc": "Slice colour."
        },
        {
          "name": "x / y",
          "type": "linear",
          "desc": "Optional centre."
        }
      ],
      "returns": "A <b>feature</b> emitting one filled <code class=\"inline\">path</code> per row."
    }
  ],
  "sections": [
    {
      "id": "pie",
      "title": "Pie",
      "intro": "Full circle, zero inner radius.",
      "examples": [
        "marks-arc/party-shares"
      ]
    },
    {
      "id": "donut",
      "title": "Donut",
      "intro": "Same layout with an inner hole — room for a center label.",
      "examples": [
        "marks-arc/donut-with-center-text"
      ]
    },
    {
      "id": "edit",
      "title": "Editable slice boundaries",
      "intro": "Wire <code class=\"inline\">edit.arc.edge()</code> and <b>every</b> boundary gets a draggable handle — including the seam where the last slice meets the first on a full circle, so <i>n</i> slices give <i>n</i> handles. Dragging a boundary moves value between exactly the two slices it separates: one grows by what the other loses, so the total is preserved.",
      "examples": [
        "marks-arc/drag-any-boundary",
        "marks-arc/donut-four-slices"
      ]
    }
  ]
};

export default page;
