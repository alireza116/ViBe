export const meta = {
  title: "barX — value on x",
  blurb: "y is the category band, x the linear value drawn rightward from the baseline.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 240,\n  margins: { top: 14, right: 16, bottom: 26, left: 60 },\n  data: [\n    { region: \"North\", sales: 42 }, { region: \"South\", sales: 68 },\n    { region: \"East\", sales: 30 },  { region: \"West\", sales: 54 },\n  ],\n  schema: {\n    region: { type: \"categorical\", domain: [\"North\", \"South\", \"East\", \"West\"] },\n    sales:  { type: \"quantitative\", domain: [0, 80] },\n  },\n  features: [\n    barX({\n      fill: \"#0d9488\",\n      channels: {\n        y: { field: \"region\" },\n        x: { field: \"sales\" },\n      },\n    }),\n  ],\n}))";
