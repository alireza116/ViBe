export const meta = {
  title: "Static cone",
  blurb: "Without edits it is just a display of a belief — r = 0.6, envelope ±0.25.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 300, height: 280,\n  margins: { top: 16, right: 16, bottom: 16, left: 16 },\n  axes: false,\n  data: [{ r: 0.6, spread: 0.25 }],\n  schema: {\n    r:      { type: \"quantitative\", domain: [-1, 1] },\n    spread: { type: \"quantitative\", domain: [0, 1] },\n  },\n  features: [\n    cone({\n      channels: {\n        angle: { field: \"r\", scale: { range: [-45, 45] } },\n        spread: { field: \"spread\", scale: { range: [0, 45] } },\n      },\n      samples: 80, wedge: true, stroke: \"#d33\",\n    }),\n  ],\n}));";
