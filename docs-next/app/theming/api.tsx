import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "theme (on Elicit)",
    summary: (
      <>
        The style layer, passed as <code className="inline">theme</code> on <code className="inline">Elicit</code> (or on any widget). A partial, deep-merged over the built-in <code className="inline">DEFAULT_THEME</code> — you name only the tokens you change. Precedence, most specific first: a per-datum channel/option <code className="inline">&gt;</code> <code className="inline">theme.marks[name]</code> <code className="inline">&gt;</code> the theme token <code className="inline">&gt;</code> the renderer default.
      </>
    ),
    signatures: [
      "theme: { ink, accent, muted, palette, ramp, diverging, font, axis, grid, guide, constraint, ghost, widget, marks }",
    ],
    options: [
      {
        name: "ink",
        type: "string",
        default: "steelblue",
        desc: <>The primary mark colour — every mark that has no explicit paint channel reads it (bar, point, line, area, rect, …).</>,
      },
      {
        name: "accent",
        type: "string",
        default: "#2563eb",
        desc: <>Interactive emphasis: draggable handles, a committed survey answer, an editable-axis handle.</>,
      },
      {
        name: "palette / ramp / diverging",
        type: "string[]",
        default: "Tableau10 · blues · RdBu",
        desc: <>Colour-scale defaults for a <code className="inline">fill</code>/<code className="inline">stroke</code> channel that names no explicit range or scheme.</>,
      },
      {
        name: "font",
        type: "{ family, size, labelSize, titleSize }",
        default: "family: null",
        desc: <>Typography. A non-null <code className="inline">family</code> is emitted on the root svg (and used by the canvas renderer) so every label inherits it; the default null inherits the host page's font.</>,
      },
      {
        name: "axis / grid / guide",
        type: "object",
        default: "neutral greys",
        desc: <>Chart chrome tokens — axis spine/labels/handle, grid lines, and the reference-rule / region / legend guides.</>,
      },
      {
        name: "ghost",
        type: "{ opacity, fill, stroke, strokeDasharray }",
        default: "opacity: 0.45",
        desc: <>How a <a className="underline" href="/editing/probe">probe</a> preview is dimmed: a ghost multiplies its opacity by this, and a non-null fill/stroke/dash overrides the committed paint.</>,
      },
      {
        name: "widget",
        type: "object",
        default: "survey tokens",
        desc: <>Survey-instrument affordance tokens (ring, track, cell, label, question, radius), read live by the widget guides.</>,
      },
      {
        name: "marks",
        type: "Record<mark, style>",
        default: "{}",
        desc: <>Sparse per-mark default overrides, keyed by mark name — e.g. <code className="inline">{'{ bar: { fill: "crimson" } }'}</code>.</>,
      },
    ],
  },
  {
    name: "themes",
    summary: (
      <>
        The built-in themes. <code className="inline">themes.default</code> is the library look; <code className="inline">themes.survey</code> is a clean, professional survey style. Each is a partial — pass it as <code className="inline">theme</code>, or layer your own on top with a deep-merge.
      </>
    ),
    signatures: ["themes.default", "themes.survey"],
  },
  {
    name: "setTheme(partial)",
    summary: (
      <>
        Set the application-wide default theme. Every chart created afterwards inherits it unless it passes its own <code className="inline">theme</code>, which layers on top. Pass <code className="inline">null</code> to reset.
      </>
    ),
    signatures: ["setTheme(themes.survey)", "setTheme({ ink: '#4f46e5' })", "setTheme(null)"],
  },
];
