export const meta = {
  title: "Probability tokens over bins",
  blurb: "A discrete point scale of bins 0–1; 25-token budget.",
  try: "click the plane to add, click a dot to remove.",
};

export const code = "const bins = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];\nmount(Elicit({\n  width: 560, height: 260,\n  margins: { top: 20, right: 16, bottom: 28, left: 16 },\n  axes: { x: {}, y: false },\n  data: [\n    { bin: 0.3 }, { bin: 0.3 }, { bin: 0.3 },\n    { bin: 0.4 }, { bin: 0.4 }, { bin: 0.5 },\n  ],\n  onChange: (d) => console.log(\"tokens:\", d.length),\n  schema: {\n    bin: { type: \"categorical\", domain: bins },\n  },\n  scales: { x: { type: \"point\" } },\n  features: [\n    dotStack({\n      channels: { x: { field: \"bin\" } },\n      edits: [ create({ trigger: \"click\", channels: [\"x\"] }), remove() ],\n      constraints: [ count({ max: 25 }) ],\n      label: true,\n    }),\n  ],\n}));";
