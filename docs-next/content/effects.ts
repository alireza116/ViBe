import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/effects",
  "title": "Interaction effects",
  "lead": "Feedback for interaction state (grabbing, proximity-selecting) lives in its own layer, never on a mark’s paint channels — so it can’t clobber your fill/stroke. Customize it through <code class=\"inline\">effects</code>: a <code class=\"inline\">grab</code> filter while dragging, and a <code class=\"inline\">select</code> overlay (ring + highlight) for the proximity target.",
  "api": [
    {
      "name": "effects (on Elicit)",
      "summary": "The interaction-feedback layer, passed as <code class=\"inline\">effects</code> on <code class=\"inline\">Elicit</code>. Partial sub-objects merge over the defaults, so you override just the part you care about.",
      "signature": "effects: { grab, select }",
      "options": [
        {
          "name": "grab",
          "type": "false | string | { filter }",
          "default": "brightness(0.82)",
          "desc": "Element effect applied to a mark while it is dragged. A string is shorthand for <code class=\"inline\">{ filter }</code>; <code class=\"inline\">false</code> disables it."
        },
        {
          "name": "select",
          "type": "false | object",
          "default": "enabled",
          "desc": "Overlay for proximity/nearest selection; <code class=\"inline\">false</code> turns it off."
        },
        {
          "name": "select.color",
          "type": "string",
          "default": "accent",
          "desc": "Colour of the ring + highlight."
        },
        {
          "name": "select.ring",
          "type": "object",
          "default": "—",
          "desc": "The snap-zone ring at the pointer (radius / stroke config)."
        },
        {
          "name": "select.highlight",
          "type": "object",
          "default": "—",
          "desc": "The outline drawn around the currently-selected mark."
        }
      ],
      "returns": "Feedback draws in its own layer — never on a mark’s <code class=\"inline\">fill</code>/<code class=\"inline\">stroke</code> — so it can’t clobber data-driven style."
    }
  ],
  "sections": [
    {
      "id": "default",
      "title": "The default select effect",
      "intro": "A pick: \"nearest\" drag. The select effect draws the snap-zone ring and a highlight outline around the targeted dot — without touching the stroke you set.",
      "examples": [
        "effects/proximity-select"
      ]
    },
    {
      "id": "custom",
      "title": "Customized effects",
      "intro": "The same edit, restyled through effects: { grab, select: { color, ring, highlight } }. The mark’s own stroke stays intact throughout.",
      "examples": [
        "effects/restyled-feedback"
      ]
    }
  ]
};

export default page;
