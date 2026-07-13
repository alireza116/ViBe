export const meta = {
  title: "Proportion picker",
  blurb: "click or drag; unit = 1/50 makes 50 countable cells, waffleFill lands exactly on the cell you point at.",
  try: "click a cell, or drag up/down.",
};

export const code = "mount(Elicit({\n  width: 220, height: 300,\n  margins: { top: 16, right: 12, bottom: 24, left: 34 },\n  data: [{ cat: \"belief\", value: 0.4 }],\n  onChange: (d) => console.log(\"proportion:\", d[0].value.toFixed(2)),\n  schema: {\n    cat:   { type: \"categorical\", domain: [\"belief\"] },\n    value: { type: \"quantitative\", domain: [0, 1] },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    waffleY({\n      fill: \"#0ea5e9\",\n      unit: 1/50,\n      channels: {\n        x: { field: \"cat\" },\n        y: { field: \"value\", edit: waffleFill() },\n      },\n      // click sets the count to the clicked cell too\n      edits: [ waffleFill({ channels: [\"y\"], gesture: \"click\" }) ],\n    }),\n  ],\n}));";
