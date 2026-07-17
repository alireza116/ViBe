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
      "returns": "An <b>HTMLElement</b> (a positioned container) carrying the methods below. A chart elicits exactly <b>one</b> dataset: <code class=\"inline\">data</code> lives on the spec, the engine deep-copies it and owns it, and a mark is a <i>view</i> over those rows rather than an owner of its own — which is what lets two marks read the same rows and an invariant hold across both. The engine resolves one global scale per channel and re-renders on every commit."
    },
    {
      "name": "The element Elicit returns",
      "summary": "An ordinary DOM node — append it where you like — with the chart’s API hung off it. There is no separate handle object to keep in sync, and no global registry: everything a caller needs is on the element, so a page of several charts just has several elements.",
      "signatures": [
        "chart.getData() → Datum[]",
        "chart.getSchema() → Schema",
        "chart.setData(data) → void",
        "chart.on(\"change\" | \"stage\", cb) → () => void",
        "chart.undo() · chart.redo() · chart.canUndo() · chart.canRedo()",
        "chart.getStage() · chart.setStage(i) · chart.nextStage()",
        "chart.destroy() → void"
      ],
      "options": [
        {
          "name": "getData()",
          "type": "→ Datum[]",
          "default": "—",
          "desc": "A deep <b>copy</b> of the committed dataset — the elicited answer. Copy, because handing out the live rows would let a caller mutate past every constraint the chart just enforced."
        },
        {
          "name": "getSchema()",
          "type": "→ Schema",
          "default": "—",
          "desc": "A deep copy of the engine-owned schema, including any domain an <a href=\"/editing/axis\">editable axis</a> reshaped. Your original <code class=\"inline\">spec.schema</code> is never mutated."
        },
        {
          "name": "setData(data)",
          "type": "void",
          "default": "—",
          "desc": "Replace the dataset and re-render. Bypasses constraints — it is a trusted seed or reset, not an edit — and clears the <a href=\"/editing/history\">undo history</a> for the same reason."
        },
        {
          "name": "on(type, cb)",
          "type": "→ unsubscribe",
          "default": "—",
          "desc": "<code class=\"inline\">change</code> fires on every committed edit with the new data; <code class=\"inline\">stage</code> fires when a <a href=\"/editing/stages\">stage</a> advances. Returns a function that removes the listener."
        },
        {
          "name": "undo() / redo()",
          "type": "→ boolean",
          "default": "—",
          "desc": "Step one <b>gesture</b>, and report whether they moved. See <a href=\"/editing/history\">History & keyboard</a>."
        },
        {
          "name": "destroy()",
          "type": "void",
          "default": "—",
          "desc": "Tear down listeners and observers. Call it when you unmount the element — a resize-observing chart outlives its node otherwise."
        }
      ],
      "returns": "<code class=\"inline\">change</code> is the seam to the rest of your app: a survey posts <code class=\"inline\">getData()</code> on submit, a live app writes it through on every commit."
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
