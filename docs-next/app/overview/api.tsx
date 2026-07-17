import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Elicit(spec)",
    summary: (
      <>
        The entry point (<code className="inline">vibe.Elicit</code>). Returns a DOM element you append. The spec is a chart: a list of <code className="inline">features</code> (marks) plus size, margins and global axes/guides.
      </>
    ),
    signatures: [
      "Elicit({ width, height, margins, features, axes, guides, effects, renderer }) → HTMLElement",
    ],
    options: [
      {
        name: "width / height",
        type: "number",
        default: "600 / 400",
        desc: "Outer pixel size of the chart element.",
      },
      {
        name: "margins",
        type: "{top,right,bottom,left}",
        default: "{20,20,30,40}",
        desc: "Inset around the inner plot (leaves room for axes).",
      },
      {
        name: "features",
        type: "Feature[]",
        default: "[]",
        desc: (
          <>
            The marks — <code className="inline">bar(...)</code>, <code className="inline">point(...)</code>, <code className="inline">composite(...)</code>, … drawn in order.
          </>
        ),
      },
      {
        name: "x / y",
        type: "ScaleSpec",
        default: "from marks",
        desc: "Optional top-level positional scale specs (a shared domain across marks).",
      },
      {
        name: "axes",
        type: "object | false",
        default: "auto",
        desc: (
          <>
            Global axis convenience — desugars into axis/grid marks; <code className="inline">false</code> drops them.
          </>
        ),
      },
      {
        name: "guides",
        type: "Guide[]",
        default: "[]",
        desc: "Non-interactive annotations rebuilt every render.",
      },
      {
        name: "effects",
        type: "object",
        default: "defaults",
        desc: "Interaction-feedback layer (grab / select), kept off mark paint channels.",
      },
      {
        name: "renderer",
        type: "Renderer",
        default: "D3Renderer",
        desc: "The scene-graph renderer; swappable for Canvas/WebGL.",
      },
    ],
    returns: (
      <>
        An <b>HTMLElement</b> (a positioned container) carrying the methods below. A chart elicits exactly <b>one</b> dataset: <code className="inline">data</code> lives on the spec, the engine deep-copies it and owns it, and a mark is a <i>view</i> over those rows rather than an owner of its own — which is what lets two marks read the same rows and an invariant hold across both. The engine resolves one global scale per channel and re-renders on every commit.
      </>
    ),
  },
  {
    name: "The element Elicit returns",
    summary: "An ordinary DOM node — append it where you like — with the chart’s API hung off it. There is no separate handle object to keep in sync, and no global registry: everything a caller needs is on the element, so a page of several charts just has several elements.",
    signatures: [
      "chart.getData() → Datum[]",
      "chart.getSchema() → Schema",
      "chart.setData(data) → void",
      "chart.on(\"change\" | \"stage\", cb) → () => void",
      "chart.undo() · chart.redo() · chart.canUndo() · chart.canRedo()",
      "chart.getStage() · chart.setStage(i) · chart.nextStage()",
      "chart.destroy() → void",
    ],
    options: [
      {
        name: "getData()",
        type: "→ Datum[]",
        default: "—",
        desc: (
          <>
            A deep <b>copy</b> of the committed dataset — the elicited answer. Copy, because handing out the live rows would let a caller mutate past every constraint the chart just enforced.
          </>
        ),
      },
      {
        name: "getSchema()",
        type: "→ Schema",
        default: "—",
        desc: (
          <>
            A deep copy of the engine-owned schema, including any domain an <a href="/editing/axis">editable axis</a> reshaped. Your original <code className="inline">spec.schema</code> is never mutated.
          </>
        ),
      },
      {
        name: "setData(data)",
        type: "void",
        default: "—",
        desc: (
          <>
            Replace the dataset and re-render. Bypasses constraints — it is a trusted seed or reset, not an edit — and clears the <a href="/editing/history">undo history</a> for the same reason.
          </>
        ),
      },
      {
        name: "on(type, cb)",
        type: "→ unsubscribe",
        default: "—",
        desc: (
          <>
            <code className="inline">change</code> fires on every committed edit with the new data; <code className="inline">stage</code> fires when a <a href="/editing/stages">stage</a> advances. Returns a function that removes the listener.
          </>
        ),
      },
      {
        name: "undo() / redo()",
        type: "→ boolean",
        default: "—",
        desc: (
          <>
            Step one <b>gesture</b>, and report whether they moved. See <a href="/editing/history">History & keyboard</a>.
          </>
        ),
      },
      {
        name: "destroy()",
        type: "void",
        default: "—",
        desc: "Tear down listeners and observers. Call it when you unmount the element — a resize-observing chart outlives its node otherwise.",
      },
    ],
    returns: (
      <>
        <code className="inline">change</code> is the seam to the rest of your app: a survey posts <code className="inline">getData()</code> on submit, a live app writes it through on every commit.
      </>
    ),
  },
];
