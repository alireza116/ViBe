import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/sweep",
  "title": "Sweep (you-draw-it)",
  "lead": "<code class=\"inline\">edit.line.sweep()</code> is a drag that repaints each point’s value as the pointer crosses its column — the NYT “you draw it” interaction. It is sugar over <code class=\"inline\">drag({ pick: \"sweep\", guide: true })</code>, and it is series-scoped: it locks onto the nearest line at drag-start and paints only that one.",
  "api": [
    {
      "name": "edit.line.sweep(options)",
      "summary": "Line-scoped (<code class=\"inline\">scope: \"line\"</code>). Sugar over <code class=\"inline\">drag({ pick: \"sweep\", guide: true })</code>: a drag repaints the value of each point the pointer crosses, locked to one series.",
      "signature": "edit.line.sweep(options?) → Edit",
      "options": [
        {
          "name": "options",
          "type": "object",
          "default": "{}",
          "desc": "Any shared Edit fields — <code class=\"inline\">channels</code>, <code class=\"inline\">when</code>, <code class=\"inline\">threshold</code>, <code class=\"inline\">constrain</code>. <code class=\"inline\">pick</code>/<code class=\"inline\">guide</code>/<code class=\"inline\">scope</code> are preset."
        }
      ],
      "returns": "An <b>Edit</b> the engine routes through the <code class=\"inline\">sweep</code> driver (locks the nearest line at drag-start)."
    },
    {
      "name": "edit.line.draw(options)",
      "summary": "The authoring counterpart: near an existing line it edits (sweeps) it; in empty space it draws a new one — you-draw-it for domain lines, freehand for <code class=\"inline\">order:\"sequence\"</code>.",
      "signature": "edit.line.draw({ along, value, samples, minDist, threshold, into }) → Edit",
      "options": [
        {
          "name": "along / value",
          "type": "'x' | 'y'",
          "default": "'x' / 'y'",
          "desc": "The positional axes — the independent axis to draw along, and the value axis."
        },
        {
          "name": "samples",
          "type": "number | any[]",
          "default": "ticks",
          "desc": "Domain grid the you-draw-it upsert snaps to."
        },
        {
          "name": "minDist",
          "type": "number",
          "default": "8",
          "desc": "Freehand pointer-sampling distance in pixels."
        },
        {
          "name": "threshold",
          "type": "number",
          "default": "40",
          "desc": "Proximity radius for the edit-vs-draw decision."
        },
        {
          "name": "into",
          "type": "'nearest' | 'new'",
          "default": "'nearest'",
          "desc": "Near edits / far draws, or always draw a fresh line."
        }
      ],
      "returns": "An <b>Edit</b> routed through the <code class=\"inline\">draw</code> driver (owns the per-drag mode lock)."
    }
  ],
  "sections": [
    {
      "id": "sweep",
      "title": "Sweep a single line",
      "intro": "Press and drag horizontally; every point the pointer passes takes the pointer’s value.",
      "examples": [
        "editing-sweep/draw-a-curve"
      ]
    },
    {
      "id": "series",
      "title": "Series-scoped sweep",
      "intro": "With multiple lines, a sweep locks onto the nearest line at drag-start and paints only it — the others hold. Grouping comes from the stroke field.",
      "examples": [
        "editing-sweep/two-lines-swept-independently"
      ]
    }
  ]
};

export default page;
