export const meta = {
  title: "tickX — a distribution strip",
  blurb: "Values along x, each drawn as a vertical mark spanning y. inset shortens them.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 400, height: 200,\n  margins: { top: 16, right: 16, bottom: 28, left: 16 },\n  data: [\n    { v: 12 }, { v: 18 }, { v: 21 }, { v: 34 }, { v: 39 },\n    { v: 41 }, { v: 55 }, { v: 58 }, { v: 63 }, { v: 71 }, { v: 84 },\n  ],\n  schema: {\n    v: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    tickX({\n      stroke: \"#0d9488\", strokeWidth: 2, inset: 10,\n      channels: {\n        x: { field: \"v\" },\n      },\n    }),\n  ],\n}))";
