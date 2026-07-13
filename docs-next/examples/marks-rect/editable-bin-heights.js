export const meta = {
  title: "Editable bin heights",
  blurb: "Drag on y to reshape the belief distribution; clamp keeps counts ≥ 0.",
  try: "<b>Drag</b> a bin’s top edge to change its count.",
};

export const code = "mount(Elicit({\n  width: 400, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { x1: 0, x2: 2, n: 4 },\n    { x1: 2, x2: 4, n: 12 },\n    { x1: 4, x2: 6, n: 18 },\n    { x1: 6, x2: 8, n: 9 },\n    { x1: 8, x2: 10, n: 3 },\n  ],\n  schema: {\n    x1: { type: \"quantitative\", domain: [0, 10] },\n    x2: { type: \"quantitative\", domain: [0, 10] },\n    n:  { type: \"quantitative\", domain: [0, 24] },\n  },\n  constraints: [clamp({ min: 0, max: 24, field: \"n\" })],\n  features: [\n    rectY({\n      fill: \"#0d9488\", fillOpacity: 0.75, stroke: \"#0f766e\",\n      channels: {\n        x1: { field: \"x1\" },\n        x2: { field: \"x2\" },\n        y:  { field: \"n\", edit: drag({ guide: true }) },\n      },\n    }),\n  ],\n}))";
