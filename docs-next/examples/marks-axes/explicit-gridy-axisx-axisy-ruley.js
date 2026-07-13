export const meta = {
  title: "Explicit gridY + axisX/axisY + ruleY",
  blurb: "A gridline layer under the dots, a dashed rule at y = 50, and two titled axes — all as features.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 280,\n  margins: { top: 16, right: 16, bottom: 30, left: 36 },\n  axes: false,   // no auto axes; we place our own\n  data: [{ x: 15, y: 30 }, { x: 40, y: 62 }, { x: 65, y: 44 }, { x: 88, y: 74 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    gridY({ ticks: 5 }),\n    ruleY({ y: 50, stroke: \"#e4572e\", strokeDasharray: \"4 3\" }),\n    point({\n      fill: \"#4f46e5\",\n      size: 8,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n    }),\n    axisX({ title: \"x\", ticks: 5 }),\n    axisY({ title: \"y\", ticks: 5 }),\n  ],\n}))";
