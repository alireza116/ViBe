export const meta = {
  title: "Move only",
  blurb: "brushRect({ resize: \"none\" }) — no edges grab; the whole rect translates.",
  try: "<b>Drag</b> anywhere in the rect to move it (edges do nothing).",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [ { x1: 3, x2: 7, y1: 3, y2: 7 } ],\n  schema: {\n    x1: { type: \"quantitative\", domain: [0, 10] },\n    x2: { type: \"quantitative\", domain: [0, 10] },\n    y1: { type: \"quantitative\", domain: [0, 10] },\n    y2: { type: \"quantitative\", domain: [0, 10] },\n  },\n  features: [\n    rect({\n      fill: \"#7b2d8b\", fillOpacity: 0.5, stroke: \"#7b2d8b\",\n      channels: {\n        x1: { field: \"x1\" }, x2: { field: \"x2\" },\n        y1: { field: \"y1\" }, y2: { field: \"y2\" },\n      },\n      edits: [ brushRect({ resize: \"none\" }) ],\n    }),\n  ],\n}))";
