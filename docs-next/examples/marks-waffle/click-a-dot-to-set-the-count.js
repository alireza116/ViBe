export const meta = {
  title: "Click a dot to set the count",
  blurb: "circle cells, one = 5; uniform dots pack tightly (gap: 0). Click any dot to fill up to and including it, or drag.",
  try: "click a dot, or drag up/down.",
};

export const code = "mount(Elicit({\n  width: 240, height: 300,\n  margins: { top: 16, right: 12, bottom: 24, left: 34 },\n  data: [{ cat: \"count\", value: 45 }],\n  onChange: (d) => console.log(\"count:\", d[0].value),\n  schema: {\n    cat:   { type: \"categorical\", domain: [\"count\"] },\n    value: { type: \"quantitative\", domain: [0, 100] },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    waffleY({\n      fill: \"#16a34a\",\n      shape: \"circle\",\n      unit: 5,\n      gap: 0,\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"value\", edit: waffleFill() },   // drag to fill\n      },\n      edits: [ waffleFill({ channels: [\"y\"], gesture: \"click\" }) ], // click to set\n    }),\n  ],\n}));";
