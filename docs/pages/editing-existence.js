// Create · Remove · Anchors — existence edits.
export default {
    path: 'editing/existence.html',
    title: 'Create · Remove · Anchors',
    lead:
        'Creating and deleting data are edits like any other. ' +
        '<code class="inline">create</code> is a plane gesture that inverts the pointer through ' +
        'the positional channels to mint a datum; <code class="inline">remove</code> deletes the ' +
        'target. For connected paths, <code class="inline">edit.line.anchor</code> adds one point to the ' +
        'nearest line, <code class="inline">edit.line.newSeries</code> seeds a whole line, ' +
        '<code class="inline">edit.line.draw</code> lays a line down as you drag, and ' +
        '<code class="inline">edit.line.removeSeries</code> deletes a whole line. Multiple ' +
        'edits on one gesture are arbitrated by <code class="inline">when</code>. ' +
        '<b>Declare a whole-dataset edit on exactly one mark.</b> A plane gesture carries no ' +
        'node, so it fans out to <i>every</i> mark’s plane-pick edits — put ' +
        '<code class="inline">create</code> on two marks and one click appends two rows. ' +
        '(Direct-pick edits like <code class="inline">drag</code> are immune: they route to the ' +
        'mark you actually touched.) The engine warns in dev builds if you do this.',
    api: [
        {
            name: 'create(options)',
            summary: 'A plane gesture that mints a datum — the clicked pixel is inverted through each positional channel, plus <code class="inline">defaults</code> for the rest.',
            signature: 'create({ channels, defaults, trigger }) → Edit',
            options: [
                { name: 'channels', type: 'string[]', default: "['x','y']", desc: 'Positional channels to place from the pointer (missing ones are dropped).' },
                { name: 'defaults', type: 'object', default: '{}', desc: 'Seed values for the non-positional fields (group, mag, …).' },
                { name: 'trigger', type: "'click' | 'dblclick'", default: "'click'", desc: 'The plane gesture that creates.' },
            ],
            returns: 'An <b>Edit</b> (<code class="inline">pick: "plane"</code>) whose <code class="inline">apply</code> returns <code class="inline">[...data, datum]</code>.',
        },
        {
            name: 'remove(options)',
            summary: 'Deletes the targeted datum. Pair with <code class="inline">when</code> when another click edit shares the mark.',
            signature: 'remove({ pick, threshold, when, trigger }) → Edit',
            options: [
                { name: 'pick', type: "'direct' | 'nearest'", default: "'direct'", desc: 'The mark clicked, or the closest within <code class="inline">threshold</code> (deletable from empty space).' },
                { name: 'when', type: '(ctx) => boolean', default: '—', desc: 'e.g. <code class="inline">when.alt</code> so Alt-click deletes while plain click recolours.' },
                { name: 'trigger / gesture', type: 'string', default: "'click'", desc: 'The gesture that removes.' },
            ],
            returns: 'An <b>Edit</b> whose <code class="inline">apply</code> returns the dataset without the target index.',
        },
        {
            name: 'edit.line.anchor(options)',
            summary: 'Line-scoped. Adds one point to a connected path — the proximity-aware inverse of <code class="inline">remove</code>.',
            signature: 'edit.line.anchor({ into, threshold, channels, trigger }) → Edit',
            options: [
                { name: 'into', type: "'nearest' | 'new'", default: "'nearest'", desc: 'Attach to the closest line within <code class="inline">threshold</code> (empty space starts a fresh series), or always start new.' },
                { name: 'threshold', type: 'number', default: '40', desc: 'Proximity radius for the nearest-line resolution.' },
                { name: 'trigger', type: 'string', default: "'click'", desc: 'The gesture that adds a point.' },
            ],
            returns: 'An <b>Edit</b> appending one datum (its series set to the resolved line).',
        },
        {
            name: 'edit.line.newSeries(options)',
            summary: 'Seeds a whole flat line at once — one anchor per sampled domain position, at the clicked value.',
            signature: 'edit.line.newSeries({ domain, value, samples, trigger }) → Edit',
            options: [
                { name: 'domain / value', type: "'x' | 'y'", default: "'x' / 'y'", desc: 'The positional axes.' },
                { name: 'samples', type: 'number | any[]', default: 'ticks', desc: 'Domain positions to seed (see resolveSamples).' },
                { name: 'trigger', type: 'string', default: "'dblclick'", desc: 'The gesture that seeds a line.' },
            ],
            returns: 'An <b>Edit</b> appending a full flat series you then shape with <code class="inline">sweep</code>/<code class="inline">draw</code>.',
        },
        {
            name: 'edit.line.removeSeries(options)',
            summary: 'Deletes a whole line — reads the target’s series key and filters out every datum sharing it.',
            signature: 'edit.line.removeSeries({ trigger, when }) → Edit',
            options: [
                { name: 'trigger', type: 'string', default: "'click'", desc: 'The gesture; pair with <code class="inline">when</code> to distinguish from removing one point.' },
            ],
            returns: 'An <b>Edit</b> removing every datum in the targeted series (falls back to one datum if the line has no series field).',
        },
    ],
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
  data: [{ x: 30, y: 30, group: "a" }],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#0d9488",
      size: 8,
      channels: {
        x: { field: "x", edit: drag() },
        y: { field: "y", edit: drag() },
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
  data: [{ x: 30, y: 40 }, { x: 65, y: 65 }],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#0d9488",
      size: 8,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
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
  data: [
    { x: 25, y: 40, group: "alpha" },
    { x: 55, y: 65, group: "beta" },
    { x: 80, y: 30, group: "gamma" },
  ],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x:     { type: "quantitative", domain: [0, 100] },
    y:     { type: "quantitative", domain: [0, 100] },
    group: { type: "ordinal", domain: ["alpha", "beta", "gamma"] },
  },
  features: [
    point({
      size: 10,
      channels: {
        x: { field: "x", edit: drag() },
        y: { field: "y", edit: drag() },
        fill: { field: "group", edit: cycle({ when: when.noAlt }) },
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
                'On a line, edit.line.anchor() adds a point to the nearest series (or starts a new one from ' +
                'empty space), and edit.line.newSeries() seeds a whole line from sampled positions. Order is ' +
                'tracked so the path stays reproducible.',
            examples: [
                {
                    title: 'Click to add an anchor',
                    blurb: 'edit.line.anchor({ into: "nearest" }) extends the connected path in click order — near or far, it stays one line (into: "new" starts a fresh one).',
                    try: '<b>Drag</b> a point, or <b>click</b> empty space to add the next anchor.',
                    code:
`mount(Elicit({
  width: 420, height: 300,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { s: 0, x: 20, y: 30 }, { s: 0, x: 45, y: 70 },
    { s: 0, x: 70, y: 40 }, { s: 0, x: 85, y: 80 },
  ],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    connectedScatter({
      stroke: "#0d9488", strokeWidth: 3, series: "s",
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [
        drag({ channels: ["x", "y"], pick: "nearest", threshold: 40 }),
        edit.line.anchor({ into: "nearest", channels: ["x", "y"], series: "s", threshold: 80 }),
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
  data: [],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 10] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom", series: "s",
      channels: {
        x: { field: "x" },
        y: { field: "y",
             edit: drag({ pick: "sweep", guide: true }) },
      },
      edits: [ edit.line.newSeries({ domain: "x", value: "y", series: "s", samples: 6 }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Freehand — draw a path as you drag',
                    blurb: 'On an order:"sequence" line, draw samples the pointer by distance and appends points in creation order. It stays one path: a later drag over the line reshapes it, a drag in empty space extends the same line (in draw order) rather than starting a new one. (Pass into:"new" to start fresh lines.)',
                    try: '<b>Press and drag</b> to draw a path · <b>drag over it</b> to reshape · <b>drag elsewhere</b> to keep extending the same line.',
                    code:
`mount(Elicit({
  width: 420, height: 300,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    connectedScatter({
      stroke: "#0d9488", strokeWidth: 3, series: "s",
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [ edit.line.draw({ series: "s", minDist: 10 }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Remove a whole line',
                    blurb: 'remove deletes one anchor; edit.line.removeSeries() deletes the whole line — click any point on a line to remove it. The delete counterpart to anchor / newSeries / draw.',
                    try: '<b>Alt-click</b> a point to delete just that anchor · <b>click</b> a point to remove its entire line.',
                    code:
`mount(Elicit({
  width: 420, height: 300,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { s: 0, x: 20, y: 30 }, { s: 0, x: 45, y: 70 }, { s: 0, x: 75, y: 40 },
    { s: 1, x: 30, y: 80 }, { s: 1, x: 60, y: 20 }, { s: 1, x: 85, y: 60 },
  ],
  schema: {
    s: { type: "categorical" },  // the series key; declared so create() mints it
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    connectedScatter({
      stroke: "#0d9488", strokeWidth: 3, series: "s",
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [
        remove({ when: when.alt }),                        // Alt-click: one anchor
        edit.line.removeSeries({ series: "s", when: when.noAlt }), // click: whole line
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
