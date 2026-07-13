export const meta = {
  title: "Per-slot cap with unique",
  blurb: "unique({ field, max }) limits the height of any one column.",
  try: "",
};

export const code = "const cats = [\"A\",\"B\",\"C\",\"D\"];\nmount(Elicit({\n  width: 420, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 16 },\n  axes: { x: {}, y: false },\n  data: [{ bin: \"A\" }, { bin: \"B\" }, { bin: \"B\" }],\n  schema: {\n    bin: { type: \"categorical\", domain: cats },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    dotStack({\n      channels: { x: { field: \"bin\" } },\n      edits: [ create({ trigger: \"click\", channels: [\"x\"] }), remove() ],\n      constraints: [ unique({ field: \"bin\", max: 5, strategy: \"reject\" }) ],\n      label: true,\n    }),\n  ],\n}));";
