export const meta = {
  title: "Click to add a point",
  blurb: "create({ defaults }) mints a datum at the pointer; count({ max }) caps the dataset.",
  try: "<b>Click</b> empty space to add a point · <b>drag</b> to move it.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: 30, y: 30, group: \"a\" }],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#0d9488\",\n      size: 8,\n      channels: {\n        x: { field: \"x\", edit: drag() },\n        y: { field: \"y\", edit: drag() },\n      },\n      edits: [ create({ defaults: { group: \"a\" } }) ],\n      constraints: [ count({ max: 8 }) ],   // dataset invariant: at most 8\n    }),\n  ],\n}))";
