import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/waffle",
  "title": "Waffle",
  "lead": "Like a <b>bar</b>, a waffle shows a quantity for a category — but subdivides the block into a grid of <b>cells</b> where <b>one cell is a fixed quantity</b> (<code class=\"inline\">unit</code>), so a reader can literally count amounts and a gesture can pick a proportion cell-by-cell. <code class=\"inline\">value / unit</code> cells fill; cells sit <code class=\"inline\">multiple</code> across the band, so each row spans <code class=\"inline\">multiple · unit</code> and its band is read from the value scale — rows land on axis ticks and the filled height matches the value. Pair with <code class=\"inline\">snap</code> (step = <code class=\"inline\">unit</code>) to land drags on whole cells.",
  "api": [
    {
      "name": "waffle(options) · waffleY(options) · waffleX(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">waffle</code> auto-detects orientation from which axis is a band; <code class=\"inline\">waffleY</code> forces vertical, <code class=\"inline\">waffleX</code> horizontal.",
      "signatures": [
        "waffleY({ channels, unit, multiple, shape, showEmpty, emptyFill, gap, edits, constraints, id }) → Feature"
      ],
      "options": [
        {
          "name": "channels",
          "type": "object",
          "default": "{}",
          "desc": "One band (category) axis and one linear (value) axis; put <code class=\"inline\">edit: edit.waffle.fill()</code> on the value channel — it fills up to the exact cell under the pointer, for both drag and click."
        },
        {
          "name": "unit",
          "type": "number",
          "default": "1",
          "desc": "The quantity <b>one cell</b> represents. <code class=\"inline\">value / unit</code> cells fill; raise it for large counts, lower it (&gt;0) for fine fractions."
        },
        {
          "name": "multiple",
          "type": "number",
          "default": "auto",
          "desc": "Cells across the band. Defaults to whatever makes cells square given the band width and scale; each row then spans <code class=\"inline\">multiple · unit</code>."
        },
        {
          "name": "shape",
          "type": "'rect' | 'circle'",
          "default": "'rect'",
          "desc": "Cell shape — square cells or dots."
        },
        {
          "name": "showEmpty",
          "type": "boolean",
          "default": "true",
          "desc": "Draw the unfilled cells (the value track). Set <code class=\"inline\">false</code> to hide them; they stay as invisible drag targets, so dragging up to raise the count still works."
        },
        {
          "name": "emptyFill",
          "type": "string",
          "default": "'#eee'",
          "desc": "Colour of the unfilled cells when shown (filled cells use the standard style surface)."
        },
        {
          "name": "gap",
          "type": "number",
          "default": "1",
          "desc": "Pixel gap between cells."
        }
      ],
      "channels": [
        {
          "name": "x / y",
          "type": "band + linear",
          "desc": "The category (band) and value (linear) axes, as in bar."
        }
      ],
      "returns": "A <b>feature</b> emitting one cell node (<code class=\"inline\">rect</code> or <code class=\"inline\">circle</code>) per cell; every cell carries the datum, so the whole block is one drag/click target."
    }
  ],
  "sections": [
    {
      "id": "counts",
      "title": "Counting quantities",
      "intro": "A waffle over four categories — each cell is a fixed count (here 10), so amounts read exactly: count the cells and multiply by the unit. Rows land on the y-axis ticks.",
      "examples": [
        "marks-waffle/fruit-counts"
      ]
    },
    {
      "id": "proportion",
      "title": "Picking a proportion",
      "intro": "One category on a 0–1 axis; each cell is 1/50, so 50 cells fill the block. edit.waffle.fill() fills up to the exact cell under the pointer — click or drag — so the value is always a whole number of cells.",
      "examples": [
        "marks-waffle/proportion-picker"
      ]
    },
    {
      "id": "shapes-and-click",
      "title": "Dots, click-to-set & hidden track",
      "intro": "Cells can be circles (shape: \"circle\") — uniform squares that touch, packed to fill the band width and height. A click-gesture edit sets the count to the clicked cell in one tap, and showEmpty: false hides the track while keeping it grabbable.",
      "examples": [
        "marks-waffle/click-a-dot-to-set-the-count"
      ]
    },
    {
      "id": "small-counts",
      "title": "Small counts (unit = 1)",
      "intro": "With unit: 1 each cell is exactly one item, so small counts read directly — one cell means one. The grid is only as wide as it needs to be (never wider than the band) and is centred, so a category of 1 shows a single cell.",
      "examples": [
        "marks-waffle/tallies-of-1-6"
      ]
    }
  ]
};

export default page;
