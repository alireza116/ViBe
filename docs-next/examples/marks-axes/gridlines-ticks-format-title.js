export const meta = {
  title: "Gridlines, ticks, format & title",
  blurb: "y gets a grid and percent formatting; x a tick count and a title.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 380, height: 300,\n  margins: { top: 16, right: 16, bottom: 30, left: 44 },\n  axes: {\n    x: { ticks: 4, title: \"Funnel step\" },\n    y: { grid: true, tickFormat: \".0%\", title: \"Conversion\" },\n  },\n  data: [\n    { step: \"Visit\", rate: 1.0 }, { step: \"Signup\", rate: 0.62 },\n    { step: \"Active\", rate: 0.41 }, { step: \"Paid\", rate: 0.18 },\n  ],\n  schema: {\n    step: { type: \"categorical\", domain: [\"Visit\", \"Signup\", \"Active\", \"Paid\"] },\n    rate: { type: \"quantitative\", domain: [0, 1] },\n  },\n  features: [\n    bar({\n      channels: {\n        x: { field: \"step\" },\n        y: { field: \"rate\" },\n      },\n    }),\n  ],\n}))";
