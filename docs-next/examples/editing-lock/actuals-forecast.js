export const meta = {
  title: "Actuals + forecast",
  blurb: "lock: (d) => d.kind === \"actual\". The two grey bars are reported; only the forecast bars take a drag.",
  try: "<b>Drag</b> Q3 / Q4 (blue). Q1 and Q2 are reported — they don’t budge.",
};

export const code = "mount(Elicit({\n  width: 400, height: 260,\n  margins: { top: 16, right: 16, bottom: 30, left: 44 },\n  schema: {\n    q:    { type: \"categorical\",  domain: [\"Q1\", \"Q2\", \"Q3\", \"Q4\"] },\n    n:    { type: \"quantitative\", domain: [0, 100] },\n    kind: { type: \"categorical\",  domain: [\"actual\", \"forecast\"] },\n  },\n  data: [\n    { q: \"Q1\", n: 42, kind: \"actual\" },\n    { q: \"Q2\", n: 55, kind: \"actual\" },\n    { q: \"Q3\", n: 50, kind: \"forecast\" },\n    { q: \"Q4\", n: 50, kind: \"forecast\" },\n  ],\n  // The lock is a property of the row, so it reads straight off the data.\n  lock: (d) => d.kind === \"actual\",\n  features: [\n    barY({\n      channels: {\n        x: { field: \"q\" },\n        y: { field: \"n\", edit: drag({ guide: true }) },\n        fill: { field: \"kind\",\n                scale: { range: [\"#94a3b8\", \"#4f46e5\"] } },\n      },\n    }),\n  ],\n}))";
