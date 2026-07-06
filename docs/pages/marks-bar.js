// Bar mark — bar / barY / barX.
export default {
    path: 'marks/bar.html',
    title: 'Bar',
    lead:
        'A rectangular mark: one axis is a categorical <b>band</b> (the position), the other ' +
        'a linear <b>value</b> drawn as length from a baseline. <code class="inline">bar</code> ' +
        'auto-detects orientation from which axis is a band; <code class="inline">barY</code> ' +
        'forces vertical, <code class="inline">barX</code> horizontal.',
    sections: [
        {
            id: 'basics',
            title: 'Band × value',
            intro: 'The band axis slots the bars; the linear axis sets their length from a baseline.',
            examples: [
                {
                    title: 'A vertical bar chart',
                    blurb: 'x band of categories, y linear value.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 16, right: 16, bottom: 28, left: 34 },
  features: [
    bar({
      fill: "#4f46e5",
      data: [
        { cat: "A", n: 30 }, { cat: "B", n: 55 },
        { cat: "C", n: 22 }, { cat: "D", n: 44 },
      ],
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n",   type: "linear", domain: [0, 60] },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Colour by a field',
                    blurb: 'fill: { field: "kind" } tints each bar through the ordinal palette.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    bar({
      data: [
        { cat: "A", n: 34, kind: "low" },  { cat: "B", n: 58, kind: "high" },
        { cat: "C", n: 22, kind: "low" },  { cat: "D", n: 47, kind: "high" },
      ],
      encoding: {
        x: { field: "cat", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "n", type: "linear", domain: [0, 60] },
        fill: { field: "kind" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'orientation',
            title: 'Horizontal bars (barX)',
            intro:
                'Put the band on y and the value on x and the bars run horizontally. barX forces ' +
                'this orientation; bar would infer it from the band axis.',
            examples: [
                {
                    title: 'barX — value on x',
                    blurb: 'y is the category band, x the linear value drawn rightward from the baseline.',
                    code:
`mount(Elicit({
  width: 380, height: 240,
  margins: { top: 14, right: 16, bottom: 26, left: 60 },
  features: [
    barX({
      fill: "#0d9488",
      data: [
        { region: "North", sales: 42 }, { region: "South", sales: 68 },
        { region: "East", sales: 30 },  { region: "West", sales: 54 },
      ],
      encoding: {
        y: { field: "region", type: "band",
             domain: ["North", "South", "East", "West"] },
        x: { field: "sales", type: "linear", domain: [0, 80] },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Editing bars',
            intro:
                'Put edit: drag() on the value channel and a bar drags to rewrite its value. ' +
                'Thin bars are easier to grab with pick: "nearest" — grab from anywhere in the column.',
            examples: [
                {
                    title: 'Drag a value',
                    blurb: 'y carries edit: drag(). Dragging writes y back through the same scale.',
                    try: '<b>Drag</b> a bar up or down.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    bar({
      fill: "#4f46e5",
      data: [
        { x: "A", y: 20 }, { x: "B", y: 45 },
        { x: "C", y: 30 }, { x: "D", y: 60 },
      ],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag() },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Nearest pick + self-drawn guide',
                    blurb: 'pick: "nearest" grabs a bar from anywhere in its column; guide: true draws the snap ring.',
                    try: '<b>Drag</b> from anywhere in a column to grab that bar.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    bar({
      fill: "#2563eb",
      data: [
        { x: "A", y: 20 }, { x: "B", y: 45 },
        { x: "C", y: 30 }, { x: "D", y: 60 },
      ],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "nearest", threshold: 40, guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
