import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/area",
  "title": "Area",
  "lead": "A filled path under a series — the distributional sibling of <code class=\"inline\">line</code>. Same grouping / ordering knobs; optional handles so sweep and drag reuse the line edit machinery. <code class=\"inline\">areaY</code> fills to the y baseline; <code class=\"inline\">areaX</code> to the x baseline. Declare an endpoint <b>pair</b> instead (<code class=\"inline\">y1</code> + <code class=\"inline\">y2</code>) and it fills <b>between</b> them rather than down to the baseline — an <b>uncertainty band</b>, editable by both edges.",
  "api": [
    {
      "name": "area(options) · areaY(options) · areaX(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>.",
      "signatures": [
        "area({ channels, series, order, curve, handles, edits, … }) → Feature",
        "areaY(options) → Feature",
        "areaX(options) → Feature"
      ],
      "channels": [
        {
          "name": "x / y",
          "type": "linear | point",
          "desc": "Domain and value axes (same as line)."
        },
        {
          "name": "y1 / y2 · x1 / x2",
          "type": "linear",
          "desc": "An endpoint <b>pair</b> on the value axis: fill between the two fields instead of down to the baseline (a confidence band, a fan chart). They share the value axis’s scale, so they resolve exactly like <code class=\"inline\">y</code>, and declaring a pair picks the value axis on its own. Handles appear on <b>both</b> edges. Same span/baseline split <code class=\"inline\">bar</code> and <code class=\"inline\">rect</code> make, spelled the same way."
        },
        {
          "name": "fill / stroke",
          "type": "const | field",
          "desc": "Area fill (default fillOpacity 0.35) and outline."
        }
      ],
      "returns": "A feature emitting one filled path per series plus optional handle circles."
    }
  ],
  "sections": [
    {
      "id": "basics",
      "title": "Filled series",
      "intro": "Drag handles to reshape the belief curve.",
      "examples": [
        "marks-area/editable-area"
      ]
    },
    {
      "id": "band",
      "title": "Uncertainty band",
      "intro": "Give the value axis an endpoint <b>pair</b> and the area fills between them — the shape of a confidence interval or a fan chart. Both edges get handles, so the interval is elicited by dragging its ends. Pair it with <a href=\"/constraints#ordering\">ordering</a> so the band cannot be turned inside-out: drag the low edge above the high one and the high edge is carried along, because the edge you grabbed is the one you meant.",
      "examples": [
        "marks-area/an-editable-confidence-band"
      ]
    }
  ]
};

export default page;
