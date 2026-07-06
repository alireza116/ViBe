// Create · Remove · Anchors — existence edits.
export default {
    path: 'editing/existence.html',
    title: 'Create · Remove · Anchors',
    lead:
        'Creating and deleting data are edits like any other. ' +
        '<code class="inline">create</code> is a plane gesture that inverts the pointer through ' +
        'the positional channels to mint a datum; <code class="inline">remove</code> deletes the ' +
        'target. For connected paths, <code class="inline">anchor</code> adds one point to the ' +
        'nearest line and <code class="inline">newSeries</code> seeds a whole line. Multiple ' +
        'edits on one gesture are arbitrated by <code class="inline">when</code>.',
    sections: [
        {
            id: 'create',
            title: 'Create — click to add',
            intro:
                'create is its own edit: a plane click inverts the pointer through the positional ' +
                'channels and appends a datum. Constraints still apply — count(max) caps the total.',
            examples: [
                {
                    title: 'Click to add a point',
                    blurb: 'create({ defaults }) mints a datum at the pointer; count({ max }) caps the dataset.',
                    try: '<b>Click</b> empty space to add a point · <b>drag</b> to move it.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      fill: "#0d9488",
      data: [{ x: 30, y: 30, group: "a" }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100], edit: drag() },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag() },
        size: { value: 8 },
      },
      edits: [ create({ defaults: { group: "a" } }) ],
      constraints: [ count({ max: 8 }) ],   // dataset invariant: at most 8
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'existence',
            title: 'Create, remove & move together',
            intro:
                'Mark-level create (dblclick) + remove (Alt-click) + a move drag, all on one mark. ' +
                'When two edits share a gesture, when decides which claims the event.',
            examples: [
                {
                    title: 'Existence + move on one mark',
                    blurb: 'dblclick adds, Alt-click removes, drag moves.',
                    try: '<b>Double-click</b> to add · <b><kbd>Alt</kbd>+click</b> a dot to delete · <b>Drag</b> to move.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      fill: "#0d9488",
      data: [{ x: 30, y: 40 }, { x: 65, y: 65 }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 8 },
      },
      edits: [
        drag({ channels: ["x", "y"] }),
        create({ trigger: "dblclick" }),
        remove({ when: when.alt }),
      ],
    }),
  ],
}))`,
                },
                {
                    title: 'Arbitration — click recolours, Alt-click deletes',
                    blurb: 'cycle and remove share the click gesture; when (noAlt vs alt) decides which one claims it.',
                    try: '<b>Click</b> a dot to recolour · <b><kbd>Alt</kbd>+click</b> to delete · <b>Drag</b> to move.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      data: [
        { x: 25, y: 40, group: "alpha" },
        { x: 55, y: 65, group: "beta" },
        { x: 80, y: 30, group: "gamma" },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100], edit: drag() },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag() },
        size: { value: 10 },
        color: { field: "group", type: "ordinal",
                 domain: ["alpha", "beta", "gamma"], edit: cycle({ when: when.noAlt }) },
      },
      edits: [ remove({ when: when.alt }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'anchors',
            title: 'Anchors — building a connected path',
            intro:
                'On a line, anchor() adds a point to the nearest series (or starts a new one from ' +
                'empty space), and newSeries() seeds a whole line from sampled positions. Order is ' +
                'tracked so the path stays reproducible.',
            examples: [
                {
                    title: 'Click to add an anchor',
                    blurb: 'anchor({ into: "nearest" }) attaches to the nearby line; far clicks start a new one.',
                    try: '<b>Drag</b> a point, or <b>click</b> empty space to add an anchor.',
                    code:
`mount(Elicit({
  width: 420, height: 300,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  schema: { s: {}, x: {}, y: {} },
  features: [
    connectedScatter({
      stroke: "#0d9488", strokeWidth: 3, series: "s",
      data: [
        { s: 0, x: 20, y: 30 }, { s: 0, x: 45, y: 70 },
        { s: 0, x: 70, y: 40 }, { s: 0, x: 85, y: 80 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
      },
      edits: [
        drag({ channels: ["x", "y"], pick: "nearest", threshold: 40 }),
        anchor({ into: "nearest", channels: ["x", "y"], series: "s", threshold: 80 }),
      ],
    }),
  ],
}))`,
                },
                {
                    title: 'Seed a whole line (newSeries)',
                    blurb: 'Double-click drops six evenly-spaced anchors at the click value; then sweep to shape.',
                    try: '<b>Double-click</b> to drop a line, then <b>sweep</b> to shape it.',
                    code:
`mount(Elicit({
  width: 420, height: 300,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  schema: { s: {}, x: {}, y: {} },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom", series: "s",
      data: [],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 10] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
      },
      edits: [ newSeries({ domain: "x", value: "y", series: "s", samples: 6 }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
