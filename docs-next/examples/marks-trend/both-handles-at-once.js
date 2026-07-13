export const meta = {
  title: "Both handles at once",
  blurb: "Omit the stages (default null) to leave both handles always active.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 300,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  schema: {\n    x: { type: \"quantitative\", domain: [-10, 10] },\n    y: { type: \"quantitative\", domain: [-10, 10] },\n    intercept: { type: \"quantitative\" },\n    slope:     { type: \"quantitative\" },\n  },\n  data: [{ intercept: 2, slope: 0.5 }],\n  features: [\n    trend(),\n  ],\n}));";
