// Waffle mark — waffle / waffleY / waffleX.
export default {
    path: 'marks/waffle.html',
    title: 'Waffle',
    lead:
        'Like a <b>bar</b>, a waffle shows a quantity for a category — but subdivides the block ' +
        'into a grid of <b>cells</b> where <b>one cell is a fixed quantity</b> ' +
        '(<code class="inline">unit</code>), so a reader can literally count amounts and a gesture ' +
        'can pick a proportion cell-by-cell. <code class="inline">value / unit</code> cells fill; ' +
        'cells sit <code class="inline">multiple</code> across the band, so each row spans ' +
        '<code class="inline">multiple · unit</code> and its band is read from the value scale — ' +
        'rows land on axis ticks and the filled height matches the value. Pair with ' +
        '<code class="inline">snap</code> (step = <code class="inline">unit</code>) to land drags ' +
        'on whole cells.',
    api: [
        {
            name: 'waffle(options) · waffleY(options) · waffleX(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">waffle' +
                '</code> auto-detects orientation from which axis is a band; ' +
                '<code class="inline">waffleY</code> forces vertical, ' +
                '<code class="inline">waffleX</code> horizontal.',
            signatures: [
                'waffleY({ channels, unit, multiple, shape, showEmpty, emptyFill, gap, edits, constraints, id }) → Feature',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'One band (category) axis and one linear (value) axis; put <code class="inline">edit: waffleFill()</code> on the value channel — it fills up to the exact cell under the pointer, for both drag and click.' },
                { name: 'unit', type: 'number', default: '1', desc: 'The quantity <b>one cell</b> represents. <code class="inline">value / unit</code> cells fill; raise it for large counts, lower it (&gt;0) for fine fractions.' },
                { name: 'multiple', type: 'number', default: 'auto', desc: 'Cells across the band. Defaults to whatever makes cells square given the band width and scale; each row then spans <code class="inline">multiple · unit</code>.' },
                { name: 'shape', type: "'rect' | 'circle'", default: "'rect'", desc: 'Cell shape — square cells or dots.' },
                { name: 'showEmpty', type: 'boolean', default: 'true', desc: 'Draw the unfilled cells (the value track). Set <code class="inline">false</code> to hide them; they stay as invisible drag targets, so dragging up to raise the count still works.' },
                { name: 'emptyFill', type: 'string', default: "'#eee'", desc: 'Colour of the unfilled cells when shown (filled cells use the standard style surface).' },
                { name: 'gap', type: 'number', default: '1', desc: 'Pixel gap between cells.' },
            ],
            channels: [
                { name: 'x / y', type: 'band + linear', desc: 'The category (band) and value (linear) axes, as in bar.' },
            ],
            returns: 'A <b>feature</b> emitting one cell node (<code class="inline">rect</code> or <code class="inline">circle</code>) per cell; every cell carries the datum, so the whole block is one drag/click target.',
        },
    ],
    sections: [
        {
            id: 'counts',
            title: 'Counting quantities',
            intro: 'A waffle over four categories — each cell is a fixed count (here 10), so amounts read exactly: count the cells and multiply by the unit. Rows land on the y-axis ticks.',
            examples: [
                {
                    title: 'Fruit counts',
                    blurb: 'Static waffle; y domain 0–320, one cell = 10 fruit (32 cells tall), multiple auto-picked square.',
                    code:
`const cats = ["apples","bananas","oranges","pears"];
mount(Elicit({
  width: 460, height: 300,
  margins: { top: 16, right: 12, bottom: 28, left: 34 },
  data: [
    { cat: "apples", value: 210 }, { cat: "bananas", value: 200 },
    { cat: "oranges", value: 310 }, { cat: "pears", value: 40 },
  ],
  schema: {
    cat:   { type: "categorical", domain: cats },
    value: { type: "quantitative", domain: [0, 320] },
  },
  scales: { x: { type: "band" } },
  features: [
    waffleY({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },
        y: { field: "value" },
      },
      unit: 10,
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'proportion',
            title: 'Picking a proportion',
            intro: 'One category on a 0–1 axis; each cell is 1/50, so 50 cells fill the block. waffleFill() fills up to the exact cell under the pointer — click or drag — so the value is always a whole number of cells.',
            examples: [
                {
                    title: 'Proportion picker',
                    blurb: 'click or drag; unit = 1/50 makes 50 countable cells, waffleFill lands exactly on the cell you point at.',
                    try: 'click a cell, or drag up/down.',
                    code:
`mount(Elicit({
  width: 220, height: 300,
  margins: { top: 16, right: 12, bottom: 24, left: 34 },
  data: [{ cat: "belief", value: 0.4 }],
  onChange: (d) => console.log("proportion:", d[0].value.toFixed(2)),
  schema: {
    cat:   { type: "categorical", domain: ["belief"] },
    value: { type: "quantitative", domain: [0, 1] },
  },
  scales: { x: { type: "band" } },
  features: [
    waffleY({
      fill: "#0ea5e9",
      unit: 1/50,
      channels: {
        x: { field: "cat" },
        y: { field: "value", edit: waffleFill() },
      },
      // click sets the count to the clicked cell too
      edits: [ waffleFill({ channels: ["y"], gesture: "click" }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'shapes-and-click',
            title: 'Dots, click-to-set & hidden track',
            intro:
                'Cells can be circles (shape: "circle") — uniform squares that touch, packed to fill ' +
                'the band width and height. A click-gesture edit sets the count to the clicked cell in ' +
                'one tap, and showEmpty: false hides the track while keeping it grabbable.',
            examples: [
                {
                    title: 'Click a dot to set the count',
                    blurb: 'circle cells, one = 5; uniform dots pack tightly (gap: 0). Click any dot to fill up to and including it, or drag.',
                    try: 'click a dot, or drag up/down.',
                    code:
`mount(Elicit({
  width: 240, height: 300,
  margins: { top: 16, right: 12, bottom: 24, left: 34 },
  data: [{ cat: "count", value: 45 }],
  onChange: (d) => console.log("count:", d[0].value),
  schema: {
    cat:   { type: "categorical", domain: ["count"] },
    value: { type: "quantitative", domain: [0, 100] },
  },
  scales: { x: { type: "band" } },
  features: [
    waffleY({
      fill: "#16a34a",
      shape: "circle",
      unit: 5,
      gap: 0,
      channels: {
        x: { field: "cat" },
        y: { field: "value", edit: waffleFill() },   // drag to fill
      },
      edits: [ waffleFill({ channels: ["y"], gesture: "click" }) ], // click to set
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'small-counts',
            title: 'Small counts (unit = 1)',
            intro:
                'With unit: 1 each cell is exactly one item, so small counts read directly — one cell ' +
                'means one. The grid is only as wide as it needs to be (never wider than the band) and ' +
                'is centred, so a category of 1 shows a single cell.',
            examples: [
                {
                    title: 'Tallies of 1–6',
                    blurb: 'one cell = one item; counts of 1, 3, 6, 2 — count the cells directly.',
                    code:
`const cats = ["A","B","C","D"];
mount(Elicit({
  width: 460, height: 260,
  margins: { top: 16, right: 12, bottom: 28, left: 28 },
  data: [
    { cat: "A", value: 1 }, { cat: "B", value: 3 },
    { cat: "C", value: 6 }, { cat: "D", value: 2 },
  ],
  schema: {
    cat:   { type: "categorical", domain: cats },
    value: { type: "quantitative", domain: [0, 6] },
  },
  scales: { x: { type: "band" } },
  features: [
    waffleY({
      fill: "#d97706",
      shape: "circle",
      unit: 1,
      gap: 0,
      channels: { x: { field: "cat" }, y: { field: "value" } },
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
