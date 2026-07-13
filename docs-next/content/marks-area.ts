import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/area",
  "title": "Area",
  "lead": "A filled path under a series — the distributional sibling of <code class=\"inline\">line</code>. Same grouping / ordering knobs; optional handles so sweep and drag reuse the line edit machinery. <code class=\"inline\">areaY</code> fills to the y baseline; <code class=\"inline\">areaX</code> to the x baseline.",
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
    }
  ]
};

export default page;
