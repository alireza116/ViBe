import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Elicit(spec)",
    summary: (
      <>
        The entry point (<code className="inline">vibe.Elicit</code>). Returns a DOM element you append. A chart is one <code className="inline">schema</code>, one <code className="inline">data</code>set, and a list of <code className="inline">features</code> (marks) — plus optional constraints, axes, and guides.
      </>
    ),
    signatures: [
      "Elicit({ schema, data?, features, width?, height?, … }) → ElicitElement",
    ],
    options: [
      {
        name: "schema",
        type: "Schema",
        default: "required",
        desc: (
          <>
            Field → measurement type / domain / default. Owns every field’s data type and <b>domain</b> — marks never declare one. See <a href="/schema">Data schema</a>.
          </>
        ),
      },
      {
        name: "data",
        type: "Datum[]",
        default: "[]",
        desc: (
          <>
            The one elicited dataset. Seed rows are a starting point; every mark is a <i>view</i> over these rows. May be empty when <code className="inline">create</code> will mint rows from the schema.
          </>
        ),
      },
      {
        name: "features",
        type: "Feature[]",
        default: "[]",
        desc: (
          <>
            The marks — <code className="inline">bar(...)</code>, <code className="inline">point(...)</code>, <code className="inline">composite(...)</code>, … drawn in array order (later marks on top). Auto-axes and edit guides keep their own layers behind / in front of marks.
          </>
        ),
      },
      {
        name: "constraints",
        type: "Constraint[]",
        default: "[]",
        desc: (
          <>
            Dataset invariants that gate or repair every edit. See <a href="/constraints">Constraints</a>.
          </>
        ),
      },
      {
        name: "onChange",
        type: "(data) => void",
        default: "—",
        desc: "Called with the committed dataset after each edit. Hover previews never fire it.",
      },
      {
        name: "scales",
        type: "Record<channel, ScaleSpec>",
        default: "derived",
        desc: (
          <>
            Chart-level scale overrides keyed by channel (<code className="inline">x</code>, <code className="inline">y</code>, <code className="inline">fill</code>, …). Domains stay on the schema. See <a href="/scales">Scales & channels</a>.
          </>
        ),
      },
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
        name: "responsive",
        type: "'fixed' | 'scale' | 'reflow' | true",
        default: "'fixed'",
        desc: (
          <>
            Sizing mode — see <a href="/sizing">Responsive sizing</a>.
          </>
        ),
      },
      {
        name: "lock",
        type: "LockSpec",
        default: "—",
        desc: (
          <>
            Read-only rows. See <a href="/editing/lock">Locked rows</a>.
          </>
        ),
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
        An <b>ElicitElement</b> (a positioned container) carrying the methods below. The engine deep-copies <code className="inline">data</code> and owns it; marks re-derive from the committed rows on every render.
      </>
    ),
  },
  {
    name: "The element Elicit returns",
    summary: "An ordinary DOM node — append it where you like — with the chart’s API hung off it. There is no separate handle object to keep in sync, and no global registry: everything a caller needs is on the element.",
    signatures: [
      "chart.getData() → Datum[]",
      "chart.getSchema() → Schema",
      "chart.setData(data) → void",
      "chart.on(\"change\" | \"stage\", cb) → () => void",
      "chart.undo() · chart.redo() · chart.canUndo() · chart.canRedo()",
      "chart.getStage() · chart.setStage(i) · chart.nextStage() · chart.getStageLabel()",
      "chart.control(name, index?) → EditControl",
      "chart.emit(event) → void",
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
        name: "control(name, index?)",
        type: "→ EditControl",
        default: "—",
        desc: (
          <>
            Drive a named edit from outside the chart (a slider, a picker). Same dispatch as the pointer — constraints, undo, and <code className="inline">change</code> all run. See <a href="/editing/external-controls">External controls</a>.
          </>
        ),
      },
      {
        name: "emit(event)",
        type: "void",
        default: "—",
        desc: (
          <>
            Low-level: inject a renderer-shaped gesture event (inner pixels). Prefer <code className="inline">control</code> unless you already hold pixels.
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
