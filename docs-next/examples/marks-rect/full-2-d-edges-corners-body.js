export const meta = {
  title: "Full 2-D: edges, corners, body",
  blurb: "Default brushRect(): every direction live.",
  try: "<b>Drag</b> an edge to resize a side, a corner to resize two extents, or the body to move.",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [ { x1: 2, x2: 6, y1: 2, y2: 6 } ],\n  schema: {\n    x1: { type: \"quantitative\", domain: [0, 10] },\n    x2: { type: \"quantitative\", domain: [0, 10] },\n    y1: { type: \"quantitative\", domain: [0, 10] },\n    y2: { type: \"quantitative\", domain: [0, 10] },\n  },\n  features: [\n    rect({\n      fill: \"#2563eb\", fillOpacity: 0.5, stroke: \"#2563eb\",\n      channels: {\n        x1: { field: \"x1\" }, x2: { field: \"x2\" },\n        y1: { field: \"y1\" }, y2: { field: \"y2\" },\n      },\n      edits: [ brushRect({ edgeInset: 12 }) ],\n    }),\n  ],\n}))";
