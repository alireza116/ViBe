export const meta = {
  title: "1D centered slider axis",
  blurb: "One point channel; the axis is pinned to the vertical center via transform, and y is dropped.",
  try: "<b>Drag</b> a dot along the axis.",
};

export const code = "mount(Elicit({\n  width: 360, height: 200,\n  margins: { top: 16, right: 20, bottom: 24, left: 20 },\n  axes: {\n    x: { transform: ({ height }) => ({ y: height / 2 }), ticks: 5, title: \"Belief (0-100)\" },\n    y: false,   // drop the default y axis\n  },\n  data: [{ v: 20 }, { v: 55 }, { v: 80 }],\n  schema: {\n    v: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      size: 8, fill: \"#0d9488\",\n      channels: {\n        x: { field: \"v\" },\n      },\n      edits: [ drag({ channels: [\"x\"] }) ],\n    }),\n  ],\n}))";
