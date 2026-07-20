import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "legend · legendColor · legendSize · legendSymbol",
    summary: (
      <>
        A legend for a non-positional channel (<code className="inline">fill</code>, <code className="inline">stroke</code>, <code className="inline">size</code>, <code className="inline">symbol</code>). It reads the channel’s global scale and draws either discrete swatches or a continuous colour ramp. Like an axis, it is a composable mark — but it <b>reserves space</b> on its side, shrinking the plot so it never overlaps the marks. Import from <code className="inline">vibe.plot</code>.
      </>
    ),
    signatures: [
      "legendColor({ anchor, title, edit, … }) → Feature",
      "legendSize(opts) → Feature   ·   legendSymbol(opts) → Feature",
    ],
    options: [
      {
        name: "channel",
        type: "'fill' | 'stroke' | 'size' | 'symbol'",
        default: "'fill'",
        desc: "Which channel’s scale to draw (pinned by legendColor/legendSize/legendSymbol).",
      },
      {
        name: "anchor",
        type: "'right'|'left'|'top'|'bottom'",
        default: "'right'",
        desc: "Which side to sit on. Left/right stack vertically; top/bottom lay out in a row.",
      },
      {
        name: "orient",
        type: "'vertical' | 'horizontal'",
        default: "from anchor",
        desc: "Override the swatch/ramp direction independently of the side.",
      },
      {
        name: "edit",
        type: "Edit | Edit[]",
        default: "—",
        desc: "Opt-in interactivity: edit.legend() (click a swatch to set a category) or edit.legendValue() (drag the ramp handle to set a value).",
      },
      {
        name: "row",
        type: "number | (data, { selection }) => number",
        default: "selection ?? (single row ? 0 : none)",
        desc: "Which dataset row the picker writes into. Left unset it tracks the chart's selection (edit.select / el.select), falling back to the sole row of a one-row belief. A number pins a fixed row; a function computes one.",
      },
      {
        name: "title",
        type: "string",
        default: "—",
        desc: "A caption above the legend.",
      },
      {
        name: "swatchSize / gap / labelWidth",
        type: "number",
        default: "14 / 6 / auto",
        desc: "Discrete swatch geometry. labelWidth defaults to a per-label estimate.",
      },
      {
        name: "rampLength / rampThickness / ticks",
        type: "number",
        default: "140 / 12 / 4",
        desc: "Continuous ramp geometry and its approximate tick count.",
      },
      {
        name: "stroke / fill / fontSize / handleColor",
        type: "string / number",
        default: "theme",
        desc: "Chrome, defaulting to the theme’s legend/axis tokens (resolved at build time).",
      },
    ],
  },
  {
    name: "edit.legend · edit.legendValue",
    summary: (
      <>
        The legend pickers, written back through the normal edit pipeline. <code className="inline">edit.legend()</code> is a category picker (a direct-pick click on a swatch, whose value it sets). <code className="inline">edit.legendValue()</code> is a continuous value picker (a direct-pick drag on the ramp handle). Pass one to a legend’s <code className="inline">edit</code> option — the legend injects its channel.
      </>
    ),
    signatures: [
      "legend() → Edit        (category picker; writes node.category)",
      "legendValue() → Edit   (value picker; maps the drag to [lo,hi])",
    ],
    options: [
      {
        name: "into",
        type: "string",
        default: "—",
        desc: "Optional field override; by default the picker writes the channel’s field (scale.fields[0]).",
      },
    ],
  },
];
