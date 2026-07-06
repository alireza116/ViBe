// Drag · Resize · Cycle · Custom — the gesture primitives.
export default {
    path: 'editing/gestures.html',
    title: 'Drag · Resize · Cycle · Custom',
    lead:
        'Different channels take different gestures. <code class="inline">drag</code> moves a ' +
        'position, <code class="inline">resize</code> inverts a radius into a magnitude, ' +
        '<code class="inline">cycle</code> clicks through a category, and ' +
        '<code class="inline">custom</code> is the escape hatch for anything else. Several ' +
        'edits can share one mark, separated by <code class="inline">when</code>.',
    sections: [
        {
            id: 'resize',
            title: 'Resize a magnitude',
            intro:
                'size: { edit: resize() } — the drag radius from the dot centre inverts to the ' +
                'value, mirroring how size encodes it. The stroke survives the resize.',
            examples: [
                {
                    title: 'Drag outward to grow',
                    blurb: 'resize() maps the gesture radius back to the size field.',
                    try: '<b>Drag</b> a dot outward or inward to grow/shrink it.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      fill: "#ede9fe", stroke: "#7c3aed", strokeWidth: 2,
      data: [
        { x: 25, y: 50, mag: 3 }, { x: 55, y: 50, mag: 7 }, { x: 82, y: 50, mag: 11 },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { field: "mag", domain: [0, 14], edit: resize() },
      },
      constraints: [ clamp({ field: "mag", min: 1, max: 14 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'multi',
            title: 'One mark, three gestures',
            intro:
                'Move, resize, and recolour on a single mark — separated by when. Plain drag ' +
                'moves, Shift-drag resizes, click cycles the category.',
            examples: [
                {
                    title: 'Move · Shift-resize · click-cycle',
                    blurb: 'when.noShift / when.shift split the drag; cycle() advances the fill category.',
                    try: '<b>Drag</b> to move · <b><kbd>Shift</kbd>+drag</b> to resize · <b>Click</b> to recolour.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      data: [
        { x: 24, y: 70, mag: 5, team: "A" },
        { x: 55, y: 34, mag: 9, team: "B" },
        { x: 80, y: 60, mag: 12, team: "C" },
      ],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { field: "mag", domain: [0, 14] },
        fill: { field: "team", domain: ["A", "B", "C"], edit: cycle() },
      },
      edits: [
        drag({ channels: ["x", "y"], when: when.noShift }),  // plain drag = move
        resize({ channel: "size", when: when.shift }),        // shift-drag = resize
      ],
      constraints: [ clamp({ field: "mag", min: 1, max: 14 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'custom',
            title: 'Custom — the escape hatch',
            intro:
                'custom((datum, event, ctx) => …) gets the whole datum + event and returns a new ' +
                'datum. Reach for it when no primitive fits.',
            examples: [
                {
                    title: 'A drag that stamps a flag',
                    blurb: 'Sets y from the inverted pointer and marks the datum touched.',
                    try: '<b>Drag</b> a dot (watch the console for `touched: true`).',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      onChange: (d) => console.log("custom", d),
      fill: "#2563eb",
      data: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 8 },
      },
      edits: [
        custom((datum, event, ctx) => ({
          ...datum,
          y: ctx.scales.y.invertValue(ctx.pointer.y),
          touched: true,
        })),
      ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
