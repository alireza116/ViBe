import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "waffle(options) · waffleY(options) · waffleX(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. <code className="inline">waffle</code> auto-detects orientation from which axis is a band; <code className="inline">waffleY</code> forces vertical, <code className="inline">waffleX</code> horizontal.
      </>
    ),
    signatures: [
      "waffleY({ channels, unit, multiple, shape, showEmpty, emptyFill, gap, edits, constraints, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            One band (category) axis and one linear (value) axis; put <code className="inline">edit: edit.waffle.fill()</code> on the value channel — it fills up to the exact cell under the pointer, for both drag and click.
          </>
        ),
      },
      {
        name: "unit",
        type: "number",
        default: "1",
        desc: (
          <>
            The quantity <b>one cell</b> represents. <code className="inline">value / unit</code> cells fill; raise it for large counts, lower it ({'>'}0) for fine fractions.
          </>
        ),
      },
      {
        name: "multiple",
        type: "number",
        default: "auto",
        desc: (
          <>
            Cells across the band. Defaults to whatever makes cells square given the band width and scale; each row then spans <code className="inline">multiple · unit</code>.
          </>
        ),
      },
      {
        name: "shape",
        type: "'rect' | 'circle'",
        default: "'rect'",
        desc: "Cell shape — square cells or dots.",
      },
      {
        name: "showEmpty",
        type: "boolean",
        default: "true",
        desc: (
          <>
            Draw the unfilled cells (the value track). Set <code className="inline">false</code> to hide them; they stay as invisible drag targets, so dragging up to raise the count still works.
          </>
        ),
      },
      {
        name: "emptyFill",
        type: "string",
        default: "'#eee'",
        desc: "Colour of the unfilled cells when shown (filled cells use the standard style surface).",
      },
      {
        name: "gap",
        type: "number",
        default: "1",
        desc: "Pixel gap between cells.",
      },
    ],
    channels: [
      {
        name: "x / y",
        type: "band + linear",
        desc: "The category (band) and value (linear) axes, as in bar.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one cell node (<code className="inline">rect</code> or <code className="inline">circle</code>) per cell; every cell carries the datum, so the whole block is one drag/click target.
      </>
    ),
  },
];
