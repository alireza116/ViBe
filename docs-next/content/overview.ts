import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/overview",
  "title": "Overview",
  "lead": "A chart is a declarative <code class=\"inline\">Elicit(spec)</code>: a list of <b>marks</b>, each with <b>channels</b> that map data fields to visuals. Every example on these pages shows the <b>exact code that drew the chart beside it</b> — the snippet is run verbatim. This page is the 30-second API tour; the sidebar goes deep on each mark and feature.",
  "api": [
    {
      "name": "Elicit(spec)",
      "summary": "The entry point (<code class=\"inline\">vibe.Elicit</code>). Returns a DOM element you append. The spec is a chart: a list of <code class=\"inline\">features</code> (marks) plus size, margins and global axes/guides.",
      "signature": "Elicit({ width, height, margins, features, axes, guides, effects, renderer }) → HTMLElement",
      "options": [
        {
          "name": "width / height",
          "type": "number",
          "default": "600 / 400",
          "desc": "Outer pixel size of the chart element."
        },
        {
          "name": "margins",
          "type": "{top,right,bottom,left}",
          "default": "{20,20,30,40}",
          "desc": "Inset around the inner plot (leaves room for axes)."
        },
        {
          "name": "features",
          "type": "Feature[]",
          "default": "[]",
          "desc": "The marks — <code class=\"inline\">bar(...)</code>, <code class=\"inline\">point(...)</code>, <code class=\"inline\">composite(...)</code>, … drawn in order."
        },
        {
          "name": "x / y",
          "type": "ScaleSpec",
          "default": "from marks",
          "desc": "Optional top-level positional scale specs (a shared domain across marks)."
        },
        {
          "name": "axes",
          "type": "object | false",
          "default": "auto",
          "desc": "Global axis convenience — desugars into axis/grid marks; <code class=\"inline\">false</code> drops them."
        },
        {
          "name": "guides",
          "type": "Guide[]",
          "default": "[]",
          "desc": "Non-interactive annotations rebuilt every render."
        },
        {
          "name": "effects",
          "type": "object",
          "default": "defaults",
          "desc": "Interaction-feedback layer (grab / select), kept off mark paint channels."
        },
        {
          "name": "renderer",
          "type": "Renderer",
          "default": "D3Renderer",
          "desc": "The scene-graph renderer; swappable for Canvas/WebGL."
        }
      ],
      "returns": "An <b>HTMLElement</b> (a positioned container). The engine deep-copies each feature’s <code class=\"inline\">data</code>, resolves one global scale per channel, and re-renders on every edit commit."
    }
  ],
  "sections": [
    {
      "id": "anatomy",
      "title": "A minimal chart",
      "intro": "An Elicit spec is a renderer plus a list of features (marks). A mark binds channels (x, y, fill, size, …) to data fields through scales. That is the whole model: encode (data → visual) one way, edit (gesture → data) the other.",
      "examples": [
        "overview/a-bar-mark"
      ]
    },
    {
      "id": "encode-edit",
      "title": "Encoding, and its inverse",
      "intro": "Attach an edit to a channel and a gesture writes that channel back to the data through the same scale. The bar below is identical to the one above, except y now carries edit: drag() — so encoding (data → bar height) gains its inverse (drag → data).",
      "examples": [
        "overview/the-same-bar-now-editable"
      ]
    }
  ]
};

export default page;
