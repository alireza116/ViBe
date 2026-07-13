export const meta = {
  title: "Donut, four slices",
  blurb: "Four slices → four handles; drag the seam to trade the last and first slice.",
  try: "<b>Drag</b> any edge — the two adjacent slices rebalance.",
};

export const code = "mount(Elicit({\n  width: 300, height: 280,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [\n    { cat: \"A\", v: 20 },\n    { cat: \"B\", v: 20 },\n    { cat: \"C\", v: 20 },\n    { cat: \"D\", v: 40 },\n  ],\n  schema: {\n    cat: { type: \"categorical\" },\n    v: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    donut({\n      outerRadius: 100, innerRadius: 50,\n      edit: edit.arc.edge(),\n      handleSize: 6,\n      channels: {\n        angle: { field: \"v\" },\n        fill: { field: \"cat\", scale: { scheme: \"tableau10\" } },\n      },\n    }),\n  ],\n}));";
