export const meta = {
  title: "Exact pixels",
  blurb: "the default: a 320×240 chart that ignores the parent width.",
  try: "",
};

export const code = "const cats = [\"A\",\"B\",\"C\",\"D\",\"E\"];\nmount(Elicit({\n  width: 320, height: 240,\n  margins: { top: 16, right: 12, bottom: 28, left: 34 },\n  data: cats.map((c, i) => ({ cat: c, value: [30, 80, 45, 60, 20][i] })),\n  schema: {\n    cat:   { type: \"categorical\", domain: cats },\n    value: { type: \"quantitative\", domain: [0, 100] },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    barY({ fill: \"#64748b\", channels: {\n      x: { field: \"cat\" },\n      y: { field: \"value\", edit: drag() },\n    } }),\n  ],\n}));";
