// Point mark.
export default {
    path: 'marks/point.html',
    title: 'Point',
    lead:
        '<code class="inline">point</code> is the channel-driven scatter mark: every channel — x, y, ' +
        'size, fill, stroke, angle — resolves through the global scales. Default shape is a ' +
        'circle; <code class="inline">shape: \'square\'</code> emits a centred rect (side ' +
        '<code class="inline">2 × size</code>) that can rotate about its centre.',
    api: [
        {
            name: 'point(options)',
            summary:
                'Import from <code class="inline">vibe.plot</code>. A circle or square per datum; every channel — ' +
                'positional or not — resolves through the global scales.',
            signature: "point({ channels, shape, edits, constraints, id }) → Feature",
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'Channel map — see <b>Channels</b>.' },
                { name: "shape", type: "'circle' | 'square'", default: "'circle'", desc: 'Glyph shape. A square is a centred rect with side <code class="inline">2 × size</code>, so an <code class="inline">angle</code> channel can spin it.' },
                { name: 'edits', type: 'Edit[]', default: '—', desc: 'Mark-level edits; per-channel edits live in the channels map.' },
                { name: 'constraints', type: 'Constraint[]', default: '—', desc: 'Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark.' },
                { name: 'fill, stroke, size, angle, …', type: 'style', default: "fill: 'steelblue'", desc: 'Shorthands / channels.' },
            ],
            channels: [
                { name: 'x', type: 'linear | band', desc: 'Horizontal position; omitted parks the dot at the centre of x.' },
                { name: 'y', type: 'linear | band', desc: 'Vertical position; omitted parks the dot at the centre of y.' },
                { name: 'size', type: 'linear', desc: 'The circle radius / half square side (default 5). Pair with <code class="inline">edit: resize()</code> to drag the radius.' },
                { name: 'angle', type: 'linear', desc: 'Orientation in math degrees (0° = +x, CCW). Pair with <code class="inline">edit: rotate({ pivot: \'mark\', fold: false, pick: \'direct\' })</code>. Circles are rotation-invariant; squares and symbols rotate.' },
                { name: 'fill / color', type: 'const | field', desc: 'Fill; a field tints through the ordinal palette (<code class="inline">color</code> is the legacy fallback).' },
                { name: 'stroke, strokeWidth, opacity', type: 'const | field', desc: 'Standard style surface.' },
            ],
            returns: 'A <b>feature</b> emitting one <code class="inline">circle</code> or <code class="inline">rect</code> per datum.',
        },
    ],
    sections: [
        {
            id: 'channels',
            title: 'Channels: size, fill, colour',
            intro:
                'A numeric field can drive the radius (size) and a continuous colour ramp at ' +
                'once; a categorical field drives the ordinal palette. Constants and fields mix ' +
                'freely on the same mark.',
            examples: [
                {
                    title: 'Sequential fill + size from a number',
                    blurb: 'A numeric field drives both the continuous colour ramp and the radius.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 34 },
  data: [
    { h: 150, weight: 48 }, { h: 160, weight: 57 }, { h: 170, weight: 66 },
    { h: 180, weight: 78 }, { h: 190, weight: 92 }, { h: 165, weight: 61 },
  ],
  schema: {
    h:      { type: "quantitative", domain: [140, 200] },
    weight: { type: "quantitative", domain: [40, 100] },
  },
  features: [
    point({
      stroke: "#334155", strokeWidth: 1,
      channels: {
        x: { field: "h" },
        y: { field: "weight" },
        fill: { field: "weight" },   // number -> sequential ramp
        size: { field: "weight" },   // number -> radius
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Constant style shorthands',
                    blurb: 'Outlined, semi-transparent dots via top-level stroke / strokeWidth / opacity.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 12, y: 40 }, { x: 30, y: 22 }, { x: 48, y: 55 },
    { x: 66, y: 33 }, { x: 80, y: 68 }, { x: 22, y: 60 },
  ],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 80] },
  },
  features: [
    point({
      fill: "#fde68a", stroke: "#b45309", strokeWidth: 2, opacity: 0.85,
      size: 9,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'editing',
            title: 'Moving points in 2D',
            intro: 'When both x and y carry a drag, a gesture inverts the pointer through both positional scales.',
            examples: [
                {
                    title: '2D move (scatter)',
                    blurb: 'Both x and y carry edit: drag(), so a dot moves anywhere.',
                    try: '<b>Drag</b> a dot anywhere.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [{ x: 20, y: 30 }, { x: 50, y: 62 }, { x: 78, y: 40 }],
  schema: {
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      fill: "#2563eb", stroke: "#1f2733", strokeWidth: 1, opacity: 0.85,
      size: 9,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
      },
      edits: [ drag({ channels: ["x", "y"] }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'angle',
            title: 'Rotating squares and ticks',
            intro:
                'An <code class="inline">angle</code> channel orients a mark about its centre. ' +
                'Degrees are math convention (0° = +x, counterclockwise); ' +
                '<code class="inline">rotate()</code> inverts the pointer through the same scale. ' +
                'Squares use <code class="inline">point({ shape: \'square\' })</code>; short ' +
                '<code class="inline">tickX</code> / <code class="inline">tickY</code> segments ' +
                '(with <code class="inline">length</code>) rotate the same way — useful for ' +
                'directional markers on a scatter.',
            examples: [
                {
                    title: 'Scatter of rotatable squares',
                    blurb: "shape: 'square' plus angle with rotate({ pivot: 'mark', fold: false, pick: 'direct' }).",
                    try: '<b>Drag</b> a square to spin it.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 20, y: 30, theta: -20 },
    { x: 50, y: 62, theta: 35 },
    { x: 78, y: 40, theta: 70 },
    { x: 35, y: 75, theta: -55 },
  ],
  schema: {
    x:     { type: "quantitative", domain: [0, 100] },
    y:     { type: "quantitative", domain: [0, 100] },
    theta: { type: "quantitative", domain: [-180, 180] },
  },
  features: [
    point({
      shape: "square",
      fill: "#2563eb", stroke: "#1e3a8a", strokeWidth: 1, size: 10,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        angle: {
          field: "theta",
          scale: { range: [-180, 180] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
    }),
  ],
}))`,
                },
                {
                    title: 'Scatter of rotatable ticks',
                    blurb:
                        'tickX with length centres a short vertical segment on (x, y); ' +
                        'angle rotates it about that midpoint — a lean / direction marker.',
                    try: '<b>Drag</b> a tick to spin it.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  data: [
    { x: 20, y: 30, theta: -20 },
    { x: 50, y: 62, theta: 35 },
    { x: 78, y: 40, theta: 70 },
    { x: 35, y: 75, theta: -55 },
  ],
  schema: {
    x:     { type: "quantitative", domain: [0, 100] },
    y:     { type: "quantitative", domain: [0, 100] },
    theta: { type: "quantitative", domain: [-180, 180] },
  },
  features: [
    tickX({
      length: 36,
      stroke: "#1d4ed8",
      strokeWidth: 4,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        angle: {
          field: "theta",
          scale: { range: [-180, 180] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
