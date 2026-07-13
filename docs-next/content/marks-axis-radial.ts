import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/axis-radial",
  "title": "Radial axis",
  "lead": "A composable <b>radial axis</b>: arc spine, ticks, labels, and optional colored categorical bands. Sibling of <code class=\"inline\">axisX</code>/<code class=\"inline\">axisY</code>; reads the global <code class=\"inline\">angle</code> scale. Default orient is <code class=\"inline\">top</code> (left → right through the top). Inert by default — pair with <code class=\"inline\">needle</code> for interaction.",
  "api": [
    {
      "name": "axisRadial(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>.",
      "signatures": [
        "axisRadial({ channel, radius, bands, ticks, orient, arc, start, end, … }) → Feature"
      ],
      "options": [
        {
          "name": "channel",
          "type": "string",
          "default": "'angle'",
          "desc": "Which scale to read."
        },
        {
          "name": "radius",
          "type": "number",
          "default": "42% of min(w,h)",
          "desc": "Arc radius in px."
        },
        {
          "name": "bands",
          "type": "boolean",
          "default": "false",
          "desc": "Fill annular sectors for discrete domains (categorical gauge chrome)."
        },
        {
          "name": "bandWidth",
          "type": "number",
          "default": "18",
          "desc": "Radial thickness of colored bands when <code class=\"inline\">innerRadius</code> is 0."
        },
        {
          "name": "innerRadius",
          "type": "number",
          "default": "0",
          "desc": "Inner radius of band rings (donut-style chrome)."
        },
        {
          "name": "ticks / tickValues / tickFormat",
          "type": "…",
          "default": "5",
          "desc": "Same tick helpers as Cartesian axes. <code class=\"inline\">ticks: 0</code> draws labels only; <code class=\"inline\">tickFormat</code> takes a d3-format string or a function."
        },
        {
          "name": "tickSize / labelOffset",
          "type": "number",
          "default": "6 / 14",
          "desc": "Tick length (px, inward) and label distance beyond the rim."
        },
        {
          "name": "fontSize / labelFill",
          "type": "…",
          "default": "10 / '#374151'",
          "desc": "Tick-label size and colour."
        },
        {
          "name": "stroke / strokeWidth",
          "type": "…",
          "default": "'#6b7280' / 1.25",
          "desc": "Spine + tick colour / width."
        },
        {
          "name": "orient",
          "type": "'top' | 'right' | 'bottom' | 'left'",
          "default": "'top'",
          "desc": "Semicircle facing that side. Keep <code class=\"inline\">scale.range</code> in sync (<code class=\"inline\">top</code> → <code class=\"inline\">[180, 0]</code>)."
        },
        {
          "name": "arc / start / end",
          "type": "…",
          "default": "'semi'",
          "desc": "<code class=\"inline\">full</code> or an explicit degree span; the scale’s numeric <code class=\"inline\">range</code> wins when set."
        }
      ],
      "channels": [
        {
          "name": "angle",
          "type": "linear | point",
          "desc": "Usually shares the needle’s angle field + range."
        },
        {
          "name": "fill",
          "type": "ordinal",
          "desc": "Colors categorical bands when <code class=\"inline\">bands: true</code>. Set a palette with <code class=\"inline\">scale: { scheme: \"…\" }</code> (add <code class=\"inline\">reverse: true</code> to flip) or <code class=\"inline\">scale: { range: [...] }</code>."
        },
        {
          "name": "x / y",
          "type": "linear | point",
          "desc": "Optional centre (default: plot centre). When bound to fields, one ring is drawn per row (small-multiple needles)."
        }
      ],
      "returns": "A <b>feature</b> emitting background <code class=\"inline\">path</code>/<code class=\"inline\">line</code>/<code class=\"inline\">text</code> nodes."
    }
  ],
  "sections": [
    {
      "id": "continuous",
      "title": "Continuous radial ticks",
      "intro": "Spine + tick marks along a quantitative angle scale (top-facing by default).",
      "examples": [
        "marks-axis-radial/semi-circle-axis"
      ]
    },
    {
      "id": "bands",
      "title": "Colored categorical bands",
      "intro": "Discrete domains get annular sectors, colored by an ordinal fill.",
      "examples": [
        "marks-axis-radial/banded-likelihood-arc"
      ]
    },
    {
      "id": "ticks",
      "title": "Tick + label customization",
      "intro": "Ticks reuse the same helpers as Cartesian axes: <code class=\"inline\">ticks</code> (count), <code class=\"inline\">tickValues</code> (explicit), and <code class=\"inline\">tickFormat</code> (d3-format string or function). Style labels with <code class=\"inline\">fontSize</code>/<code class=\"inline\">labelFill</code> and the spine with <code class=\"inline\">stroke</code>.",
      "examples": [
        "marks-axis-radial/percent-ticks-at-chosen-values"
      ]
    }
  ]
};

export default page;
