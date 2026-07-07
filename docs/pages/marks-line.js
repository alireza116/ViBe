// Line family — line / lineY / lineX / connectedScatter / path.
export default {
    path: 'marks/line.html',
    title: 'Line',
    lead:
        'A connected path over an ordered set of points, with a draggable handle on each. ' +
        'It is deliberately general — a you-draw-it curve, a multi-series line chart, and a ' +
        'connected scatter are the same mark along four orthogonal knobs: <b>grouping</b> ' +
        '(<code class="inline">series</code>), <b>ordering</b> (<code class="inline">order</code>), ' +
        '<b>editing</b> (the edit on the handles), and <b>creation</b> ' +
        '(<code class="inline">anchor</code> / <code class="inline">newSeries</code> / ' +
        '<code class="inline">draw</code>). ' +
        '<code class="inline">lineY</code>/<code class="inline">lineX</code> fix the value axis; ' +
        '<code class="inline">connectedScatter</code>/<code class="inline">path</code> default ' +
        'to order: "sequence".',
    sections: [
        {
            id: 'basics',
            title: 'A line & its curve',
            intro:
                'lineY draws a value on y over a domain on x (the usual time series). curve sets ' +
                'the interpolation between handles.',
            examples: [
                {
                    title: 'curve: "catmullRom"',
                    blurb: 'A smooth line through the points. Try "linear" or "step" for other shapes.',
                    code:
`mount(Elicit({
  width: 400, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom",
      data: [
        { x: 0, y: 40 }, { x: 1, y: 62 }, { x: 2, y: 48 },
        { x: 3, y: 78 }, { x: 4, y: 60 }, { x: 5, y: 84 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 5] },
        y: { field: "y", type: "linear", domain: [0, 100] },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'you-draw-it',
            title: 'You-draw-it (sweep)',
            intro:
                'Put edit: drag({ pick: "sweep" }) on the value channel and you get the NYT ' +
                'you-draw-it interaction: press and sweep horizontally to paint each point’s y ' +
                'as the pointer crosses its column. The x positions stay fixed.',
            examples: [
                {
                    title: 'Sweep to draw the curve',
                    blurb: 'The value channel carries a sweep; guide: true shows the paint guide.',
                    try: '<b>Sweep</b> left-to-right across the chart — or drag a single handle.',
                    code:
`mount(Elicit({
  width: 420, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      stroke: "#4f46e5", strokeWidth: 3, curve: "catmullRom",
      data: [
        { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },
        { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 7] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'handles',
            title: 'Hiding the handles',
            intro:
                'The per-point handles are optional. handles: false renders them invisible but ' +
                'keeps them for hit-testing, so the line stays fully editable — you just don’t ' +
                'see the dots. handleRadius sizes them when shown.',
            examples: [
                {
                    title: 'A clean line, still sweepable',
                    blurb: 'handles: false hides the dots; the sweep edit still works.',
                    try: '<b>Sweep</b> across — no handles, but the line still responds.',
                    code:
`mount(Elicit({
  width: 400, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      stroke: "#7c3aed", strokeWidth: 3, curve: "catmullRom",
      handles: false,   // hide the anchor dots (still editable)
      data: [
        { x: 0, y: 50 }, { x: 1, y: 50 }, { x: 2, y: 50 }, { x: 3, y: 50 },
        { x: 4, y: 50 }, { x: 5, y: 50 }, { x: 6, y: 50 }, { x: 7, y: 50 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 7] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'series',
            title: 'Multiple lines (series)',
            intro:
                'A stroke field groups points into separate lines (Observable Plot’s z), so one ' +
                'mark holds many series and each auto-colours from the ordinal palette. A sweep ' +
                'locks onto the nearest line at drag-start and paints only that one.',
            examples: [
                {
                    title: 'Two series, swept independently',
                    blurb: 'stroke: { field: "g" } both groups and colours the lines.',
                    try: '<b>Sweep</b> over one line to reshape it; the other stays put.',
                    code:
`mount(Elicit({
  width: 420, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    lineY({
      strokeWidth: 3, curve: "catmullRom",
      data: [
        { g: "plan",   x: 0, y: 30 }, { g: "plan",   x: 1, y: 45 }, { g: "plan",   x: 2, y: 40 }, { g: "plan",   x: 3, y: 60 },
        { g: "actual", x: 0, y: 70 }, { g: "actual", x: 1, y: 62 }, { g: "actual", x: 2, y: 75 }, { g: "actual", x: 3, y: 68 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 3] },
        y: { field: "y", type: "linear", domain: [0, 100],
             edit: drag({ pick: "sweep", guide: true }) },
        stroke: { field: "g", type: "ordinal" }, // groups AND colours the lines
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'connected-scatter',
            title: 'Connected scatter (order: sequence)',
            intro:
                'With order: "sequence" the points connect in creation order, not by domain — a ' +
                'connected scatter / free 2D path. Both axes carry a drag, so each point moves in ' +
                '2D and the links follow. edit.line.anchor() adds a point to the path — near the line or ' +
                'far, it extends the same single line in click order (so the path stays one ' +
                'sequence).',
            examples: [
                {
                    title: 'A 2D path you can reshape',
                    blurb: 'connectedScatter defaults to order: "sequence"; a 2D drag moves points, anchor extends the one path in click order.',
                    try: '<b>Drag</b> a point anywhere, or <b>click</b> empty space to add the next anchor.',
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
        edit.line.anchor({ into: "nearest", channels: ["x", "y"], series: "s", threshold: 80 }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'samples',
            title: 'Draw from scratch (samples)',
            intro:
                'newSeries seeds a whole line at once — one anchor per sampled domain position ' +
                '(the scale’s ticks by default, or a count / explicit list / time interval), flat ' +
                'at the click value. Double-click empty space to drop a fresh line, then sweep it.',
            examples: [
                {
                    title: 'Double-click to seed, then sweep',
                    blurb: 'edit.line.newSeries({ samples: 6 }) drops six evenly-spaced anchors at the click’s value.',
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
      edits: [ edit.line.newSeries({ domain: "x", value: "y", series: "s", samples: 6 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'draw',
            title: 'Draw it in one drag (draw)',
            intro:
                'draw authors lines by dragging, and it is edit-aware. On a domain-ordered line ' +
                'a drag in empty space is you-draw-it from scratch — the pointer crossing each ' +
                'samples column lays that point down at the pointer value, so one stroke draws ' +
                'the curve. Start a later drag near the drawn line (within threshold) and it ' +
                'reshapes that line with a sweep instead of making a new one; start far away and ' +
                'it draws another. Pass into: "new" to always draw a fresh line.',
            examples: [
                {
                    title: 'Draw, then reshape',
                    blurb: 'edit.line.draw({ samples: 8 }) on an empty line. First drag draws all eight points; a drag over the line reshapes it, a drag in empty space starts a new one.',
                    try: '<b>Press and drag</b> to draw · <b>drag over the line</b> to reshape · <b>drag elsewhere</b> for a new line.',
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
        y: { field: "y", type: "linear", domain: [0, 100] },
      },
      edits: [ edit.line.draw({ domain: "x", value: "y", series: "s", samples: 8 }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
