export const meta = {
  title: "Click to add an anchor",
  blurb: "edit.line.anchor({ into: \"nearest\" }) extends the connected path in click order — near or far, it stays one line (into: \"new\" starts a fresh one).",
  try: "<b>Drag</b> a point, or <b>click</b> empty space to add the next anchor.",
};

export const code = "mount(Elicit({\n  width: 420, height: 300,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { s: 0, x: 20, y: 30 }, { s: 0, x: 45, y: 70 },\n    { s: 0, x: 70, y: 40 }, { s: 0, x: 85, y: 80 },\n  ],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    connectedScatter({\n      stroke: \"#0d9488\", strokeWidth: 3, series: \"s\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [\n        drag({ channels: [\"x\", \"y\"], pick: \"nearest\", threshold: 40 }),\n        edit.line.anchor({ into: \"nearest\", channels: [\"x\", \"y\"], series: \"s\", threshold: 80 }),\n      ],\n    }),\n  ],\n}))";
