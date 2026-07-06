// Constraints — data-layer invariants.
export default {
    path: 'constraints.html',
    title: 'Constraints',
    lead:
        'A constraint is a pure rule over the dataset, declared at feature level, so it holds no ' +
        'matter which edit fired — for both create and drag. ' +
        '<code class="inline">clamp</code> bounds a field, ' +
        '<code class="inline">maintainSum</code> fixes a total, ' +
        '<code class="inline">count</code> caps the size, and ' +
        '<code class="inline">unique</code> forbids duplicate keys.',
    sections: [
        {
            id: 'sum',
            title: 'maintainSum — a total held at 100',
            intro:
                'The sum rule is declared at feature level, so it holds for every edit. Bars give ' +
                'way to keep the total at 100; guide: true draws the live bound.',
            examples: [
                {
                    title: 'Bars that compensate',
                    blurb: 'maintainSum bounds the touched bar so the total stays 100; a rule guide marks the even split.',
                    try: '<b>Drag</b> any bar — the others compensate.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  guides: [ guides.rule({ y: 25, label: "even split (25)" }) ],
  features: [
    bar({
      fill: "#6366f1",
      data: ["A", "B", "C", "D"].map((c) => ({ x: c, y: 25 })),
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag({ guide: true }) },
      },
      constraints: [
        clamp({ field: "y", min: 0 }),
        maintainSum({ field: "y", targetSum: 100 }),
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'clamp',
            title: 'clamp — bound a field',
            intro:
                'clamp holds a field inside [min, max]. Pair it with a nearest pick and a self-drawn ' +
                'guide to make the bounds visible while dragging.',
            examples: [
                {
                    title: 'Clamped drag with a guide',
                    blurb: 'The y edit is clamped to 0–90; guide: true draws the bounds and the snap ring.',
                    try: '<b>Drag</b> from anywhere in a column (clamped to 0–90).',
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
      constraints: [ clamp({ field: "y", min: 0, max: 90 }) ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'unique',
            title: 'unique — one per key',
            intro:
                'unique forbids two data with the same key. A single field guards one axis; an ' +
                'array is a composite key — at most one mark per cell, for both create and move.',
            examples: [
                {
                    title: 'One bar per category',
                    blurb: 'create mints wherever you click, but unique({ field: "x" }) rejects a filled slot.',
                    try: '<b>Click</b> an empty column to fill it · a filled column rejects.',
                    code:
`mount(Elicit({
  width: 380, height: 260,
  margins: { top: 14, right: 14, bottom: 26, left: 30 },
  features: [
    bar({
      fill: "#0d9488",
      data: [{ x: "A", y: 40 }, { x: "C", y: 60 }],
      encoding: {
        x: { field: "x", type: "band", domain: ["A", "B", "C", "D"] },
        y: { field: "y", type: "linear", domain: [0, 100], edit: drag() },
      },
      edits: [ create({ defaults: { y: 20 } }) ],
      constraints: [ unique({ field: "x", max: 1 }) ],
    }),
  ],
}))`,
                },
                {
                    title: 'Composite key — a band × band grid',
                    blurb: 'unique({ field: ["x","y"] }) allows at most one mark per (x, y) cell.',
                    try: '<b>Drag</b> to another cell · <b>Click</b> an empty cell to add · <b><kbd>Alt</kbd>+click</b> to delete.',
                    code:
`mount(Elicit({
  width: 400, height: 320,
  features: [
    point({
      data: [
        { x: "A", y: "Low", group: "alpha" },
        { x: "B", y: "Mid", group: "beta" },
        { x: "C", y: "High", group: "gamma" },
      ],
      encoding: {
        x: { field: "x", domain: ["A", "B", "C"] },
        y: { field: "y", domain: ["Low", "Mid", "High"] },
        size: { value: 12 },
        color: { field: "group", type: "ordinal",
                 domain: ["alpha", "beta", "gamma"] },
      },
      edits: [
        drag({ channels: ["x", "y"] }),
        create({ defaults: { group: "alpha" } }),
        remove({ when: when.alt }),
      ],
      constraints: [ unique({ field: ["x", "y"], max: 1 }) ],
    }),
  ],
}))`,
                },
            ],
        },
    ],
};
