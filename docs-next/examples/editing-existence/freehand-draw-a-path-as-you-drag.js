export const meta = {
  title: "Freehand — draw a path as you drag",
  blurb: "On an order:\"sequence\" line, draw samples the pointer by distance and appends points in creation order. It stays one path: a later drag over the line reshapes it, a drag in empty space extends the same line (in draw order) rather than starting a new one. (Pass into:\"new\" to start fresh lines.)",
  try: "<b>Press and drag</b> to draw a path · <b>drag over it</b> to reshape · <b>drag elsewhere</b> to keep extending the same line.",
};

export const code = "mount(Elicit({\n  width: 420, height: 300,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [],\n  schema: {\n    s: { type: \"categorical\" },  // the series key; declared so create() mints it\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    connectedScatter({\n      stroke: \"#0d9488\", strokeWidth: 3, series: \"s\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ edit.line.draw({ series: \"s\", minDist: 10 }) ],\n    }),\n  ],\n}))";
