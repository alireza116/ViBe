// Waffle mark — waffle / waffleY / waffleX.
export default {
    path: 'marks/waffle.html',
    title: 'Waffle',
    lead:
        'Like a <b>bar</b>, a waffle shows a quantity for a category — but subdivides the block ' +
        'into a grid of unit <b>cells</b> so a reader can count exact amounts and a gesture can ' +
        'pick a proportion cell-by-cell. It mirrors bar geometry (band = category, linear = ' +
        'value) then quantizes the value length into cells. Pair with <code class="inline">snap' +
        '</code> to land drags on whole cells.',
    api: [
        {
            name: 'waffle(options) · waffleY(options) · waffleX(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. <code class="inline">waffle' +
                '</code> auto-detects orientation from which axis is a band; ' +
                '<code class="inline">waffleY</code> forces vertical, ' +
                '<code class="inline">waffleX</code> horizontal.',
            signatures: [
                'waffleY({ channels, cols, gap, emptyFill, edits, constraints, id }) → Feature',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'One band (category) axis and one linear (value) axis; put <code class="inline">edit: drag()</code> on the value channel.' },
                { name: 'cols', type: 'number', default: '10', desc: 'Cells across the band; rows follow from the value domain (near-square cells).' },
                { name: 'gap', type: 'number', default: '1', desc: 'Pixel gap between cells.' },
                { name: 'emptyFill', type: 'string', default: "'#eee'", desc: 'Fill for unfilled cells (filled cells use the standard style surface).' },
            ],
            channels: [
                { name: 'x / y', type: 'band + linear', desc: 'The category (band) and value (linear) axes, as in bar.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">rect</code> per cell; every cell carries the datum, so the whole block is one drag target.',
        },
    ],
    sections: [
        {
            id: 'counts',
            title: 'Counting quantities',
            intro: 'A waffle over four categories — each cell is a fixed count, so amounts are easy to read exactly.',
            examples: [
                {
                    title: 'Fruit counts',
                    blurb: 'Static waffle; y domain 0–320, 6 cells across each block.',
                    code:
`const cats = ["apples","bananas","oranges","pears"];
mount(Elicit({
  width: 460, height: 300,
  margins: { top: 16, right: 12, bottom: 28, left: 34 },
  data: [
    { cat: "apples", value: 212 }, { cat: "bananas", value: 207 },
    { cat: "oranges", value: 315 }, { cat: "pears", value: 11 },
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
      cols: 6,
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'proportion',
            title: 'Picking a proportion',
            intro: 'One category on a 0–1 axis; drag to fill, snap() lands on whole cells (here 1/50).',
            examples: [
                {
                    title: 'Proportion picker',
                    blurb: 'drag the value; snap quantizes to cells.',
                    try: 'drag up/down inside the block.',
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
      channels: {
        x: { field: "cat" },
        y: { field: "value", edit: drag() },
      },
      cols: 5,
      constraints: [ snap({ field: "value", step: 1/50 }), clamp({ min: 0, max: 1, field: "value" }) ],
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
