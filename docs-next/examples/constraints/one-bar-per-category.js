export const meta = {
  title: "One bar per category",
  blurb: "create mints wherever you click, but unique({ field: \"x\" }) rejects a filled slot.",
  try: "<b>Click</b> an empty column to fill it · a filled column rejects.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: \"A\", y: 40 }, { x: \"C\", y: 60 }],\n  constraints: [ unique({ field: \"x\", max: 1 }) ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    bar({\n      fill: \"#0d9488\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\", edit: drag() },\n      },\n      edits: [ create({ defaults: { y: 20 } }) ],\n    }),\n  ],\n}))";
