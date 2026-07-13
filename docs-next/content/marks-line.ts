import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/line",
  "title": "Line",
  "lead": "A connected path over an ordered set of points, with a draggable handle on each. It is deliberately general — a you-draw-it curve, a multi-series line chart, and a connected scatter are the same mark along four orthogonal knobs: <b>grouping</b> (<code class=\"inline\">series</code>), <b>ordering</b> (<code class=\"inline\">order</code>), <b>editing</b> (the edit on the handles), and <b>creation</b> (<code class=\"inline\">anchor</code> / <code class=\"inline\">newSeries</code> / <code class=\"inline\">draw</code>). <code class=\"inline\">lineY</code>/<code class=\"inline\">lineX</code> fix the value axis; <code class=\"inline\">connectedScatter</code>/<code class=\"inline\">path</code> default to order: \"sequence\".",
  "api": [
    {
      "name": "line · lineY · lineX · connectedScatter · path",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. One non-interactive connector path per series, drawn under one draggable <code class=\"inline\">circle</code> handle per datum. <code class=\"inline\">lineY</code>/<code class=\"inline\">lineX</code> pin the value axis; <code class=\"inline\">connectedScatter</code> and <code class=\"inline\">path</code> default to <code class=\"inline\">order:\"sequence\"</code>.",
      "signatures": [
        "line({ channels, series, order, curve, handles, handleSize, samples, edits }) → Feature",
        "lineY(options) → Feature   // value on y (time series)",
        "connectedScatter(options) → Feature   // order: \"sequence\""
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "Channel map — see <b>Channels</b>."
        },
        {
          "name": "series",
          "type": "string",
          "default": "auto",
          "desc": "Field grouping points into lines (alias <code class=\"inline\">z</code>). Defaults to the stroke/color field so a coloured chart auto-groups."
        },
        {
          "name": "order",
          "type": "'domain' | 'sequence' | field",
          "default": "'domain'",
          "desc": "How each series is connected: sorted by the domain axis, as-drawn, or by a named field."
        },
        {
          "name": "curve",
          "type": "string",
          "default": "'linear'",
          "desc": "Interpolation between handles (e.g. <code class=\"inline\">\"catmullRom\"</code>, <code class=\"inline\">\"step\"</code>)."
        },
        {
          "name": "handles",
          "type": "boolean",
          "default": "true",
          "desc": "Show the per-datum handles. When false they stay (for hit-testing) but render invisible."
        },
        {
          "name": "handleSize",
          "type": "number",
          "default": "4",
          "desc": "Pixel radius of each handle."
        },
        {
          "name": "samples",
          "type": "number | any[]",
          "default": "ticks",
          "desc": "Domain grid used by line authoring (<code class=\"inline\">newSeries</code>/<code class=\"inline\">draw</code>)."
        },
        {
          "name": "edits, constraints, id",
          "type": "—",
          "default": "—",
          "desc": "As on every mark. Line authoring edits live under <code class=\"inline\">edit.line.*</code>."
        }
      ],
      "channels": [
        {
          "name": "x",
          "type": "linear | band | time",
          "desc": "Domain or value axis (per variant / inference)."
        },
        {
          "name": "y",
          "type": "linear | band | time",
          "desc": "The other axis; the value axis carries the handle edit."
        },
        {
          "name": "stroke / color",
          "type": "const | field",
          "desc": "Line colour; a field here also becomes the default <code class=\"inline\">series</code> grouping."
        },
        {
          "name": "strokeWidth, opacity",
          "type": "const | field",
          "desc": "Standard style surface for the connector + handles."
        }
      ],
      "returns": "A <b>feature</b> with <code class=\"inline\">supportsSeries: true</code>. Emits one <code class=\"inline\">path</code> per series (<code class=\"inline\">pointerEvents:\"none\"</code>) plus one indexed <code class=\"inline\">circle</code> handle per datum, each tagged with its <code class=\"inline\">series</code>."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "A line & its curve",
      "intro": "lineY draws a value on y over a domain on x (the usual time series). curve sets the interpolation between handles.",
      "examples": [
        "marks-line/curve-catmullrom"
      ]
    },
    {
      "id": "you-draw-it",
      "title": "You-draw-it (sweep)",
      "intro": "Put edit: drag({ pick: \"sweep\" }) on the value channel and you get the NYT you-draw-it interaction: press and sweep horizontally to paint each point’s y as the pointer crosses its column. The x positions stay fixed.",
      "examples": [
        "marks-line/sweep-to-draw-the-curve"
      ]
    },
    {
      "id": "handles",
      "title": "Hiding the handles",
      "intro": "The per-point handles are optional. handles: false renders them invisible but keeps them for hit-testing, so the line stays fully editable — you just don’t see the dots. handleSize sizes them when shown.",
      "examples": [
        "marks-line/a-clean-line-still-sweepable"
      ]
    },
    {
      "id": "series",
      "title": "Multiple lines (series)",
      "intro": "A stroke field groups points into separate lines (Observable Plot’s z), so one mark holds many series and each auto-colours from the ordinal palette. A sweep locks onto the nearest line at drag-start and paints only that one.",
      "examples": [
        "marks-line/two-series-swept-independently"
      ]
    },
    {
      "id": "connected-scatter",
      "title": "Connected scatter (order: sequence)",
      "intro": "With order: \"sequence\" the points connect in creation order, not by domain — a connected scatter / free 2D path. Both axes carry a drag, so each point moves in 2D and the links follow. edit.line.anchor() adds a point to the path — near the line or far, it extends the same single line in click order (so the path stays one sequence).",
      "examples": [
        "marks-line/a-2d-path-you-can-reshape"
      ]
    },
    {
      "id": "samples",
      "title": "Draw from scratch (samples)",
      "intro": "newSeries seeds a whole line at once — one anchor per sampled domain position (the scale’s ticks by default, or a count / explicit list / time interval), flat at the click value. Double-click empty space to drop a fresh line, then sweep it.",
      "examples": [
        "marks-line/double-click-to-seed-then-sweep"
      ]
    },
    {
      "id": "draw",
      "title": "Draw it in one drag (draw)",
      "intro": "draw authors lines by dragging, and it is edit-aware. On a domain-ordered line a drag in empty space is you-draw-it from scratch — the pointer crossing each samples column lays that point down at the pointer value, so one stroke draws the curve. Start a later drag near the drawn line (within threshold) and it reshapes that line with a sweep instead of making a new one; start far away and it draws another. Pass into: \"new\" to always draw a fresh line.",
      "examples": [
        "marks-line/draw-then-reshape"
      ]
    }
  ]
};

export default page;
