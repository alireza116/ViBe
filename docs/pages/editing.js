// Editing overview — the inverse of encoding.
export default {
    path: 'editing/index.html',
    title: 'Editing — the inverse of encoding',
    lead:
        'Attach an edit to a channel and a gesture writes that channel back to the data through ' +
        'the same scale. An edit is a small descriptor — <code class="inline">gesture</code> ' +
        '(drag / click / dblclick), <code class="inline">pick</code> (direct / nearest / plane), ' +
        '<code class="inline">when</code> (arbitration), <code class="inline">constrain</code>, ' +
        'and <code class="inline">guide</code>. Place it on a channel ' +
        '(<code class="inline">encoding.y.edit</code>) or at mark level ' +
        '(<code class="inline">edits: [...]</code>).',
    sections: [
        {
            id: 'drag',
            title: 'Drag a value',
            intro:
                'The canonical edit: drag() inverts the pointer on each positional channel it ' +
                'governs. On a bar’s y, a drag rewrites the value.',
            examples: [
                {
                    title: 'Drag a value (bars)',
                    blurb: 'y carries edit: drag(). The gesture → data path mirrors the data → height encoding.',
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
            ],
        },
        {
            id: 'pick',
            title: 'Pick — how an edit finds its target',
            intro:
                'pick: "direct" uses the mark under the pointer; pick: "nearest" grabs the closest ' +
                'mark within a pixel threshold, so small marks are reachable from nearby empty ' +
                'space. guide: true self-draws the snap ring.',
            examples: [
                {
                    title: 'Nearest pick from empty space',
                    blurb: 'A 2D nearest drag: move near a dot to select it, drag from empty space to grab the closest.',
                    try: '<b>Drag</b> from anywhere near a dot to grab it.',
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
    ],
};
