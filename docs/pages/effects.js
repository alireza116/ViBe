// Interaction effects — feedback in its own layer.
export default {
    path: 'effects.html',
    title: 'Interaction effects',
    lead:
        'Feedback for interaction state (grabbing, proximity-selecting) lives in its own layer, ' +
        'never on a mark’s paint channels — so it can’t clobber your fill/stroke. Customize it ' +
        'through <code class="inline">effects</code>: a <code class="inline">grab</code> filter ' +
        'while dragging, and a <code class="inline">select</code> overlay (ring + highlight) for ' +
        'the proximity target.',
    sections: [
        {
            id: 'default',
            title: 'The default select effect',
            intro:
                'A pick: "nearest" drag. The select effect draws the snap-zone ring and a highlight ' +
                'outline around the targeted dot — without touching the stroke you set.',
            examples: [
                {
                    title: 'Proximity select',
                    blurb: 'Move near a dot to select it; drag from empty space to grab the nearest.',
                    try: '<b>Move</b> near a dot to select it · <b>Drag</b> from empty space to grab the nearest.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    point({
      fill: "#ffffff", stroke: "#334155", strokeWidth: 2,
      data: [{ x: 25, y: 35 }, { x: 55, y: 68 }, { x: 78, y: 30 }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 10 },
      },
      edits: [ drag({ channels: ["x", "y"], pick: "nearest", threshold: 45, guide: true }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'custom',
            title: 'Customized effects',
            intro:
                'The same edit, restyled through effects: { grab, select: { color, ring, highlight } }. ' +
                'The mark’s own stroke stays intact throughout.',
            examples: [
                {
                    title: 'Restyled feedback',
                    blurb: 'Indigo ring, thicker outline, softer grab — paint channels untouched.',
                    try: '<b>Move</b> / <b>drag</b> — indigo ring, thicker outline, softer grab.',
                    code:
`mount(Elicit({
  width: 340, height: 240,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  effects: {
    grab: "brightness(1.08)",
    select: {
      color: "#4f46e5",
      ring: { dash: "1 3", width: 1.5, opacity: 0.5 },
      highlight: { width: 4, opacity: 1, pad: 8 },
    },
  },
  features: [
    point({
      fill: "#ffffff", stroke: "#334155", strokeWidth: 2,
      data: [{ x: 25, y: 35 }, { x: 55, y: 68 }, { x: 78, y: 30 }],
      encoding: {
        x: { field: "x", type: "linear", domain: [0, 100] },
        y: { field: "y", type: "linear", domain: [0, 100] },
        size: { value: 10 },
      },
      edits: [ drag({ channels: ["x", "y"], pick: "nearest", threshold: 45, guide: true }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
