export const meta = {
  title: "Percent ticks at chosen values",
  blurb: "Explicit tickValues, a percent tickFormat, and a custom label colour.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 300, height: 190,\n  margins: { top: 30, right: 24, bottom: 16, left: 24 },\n  axes: false,\n  overflow: \"visible\",\n  data: [{ p: 0.5 }],\n  schema: { p: { type: \"quantitative\", domain: [0, 1] } },\n  features: [\n    axisRadial({\n      orient: \"top\", radius: 95,\n      tickValues: [0, 0.25, 0.5, 0.75, 1],\n      tickFormat: \".0%\",\n      labelFill: \"#2563eb\", fontSize: 11,\n      stroke: \"#93c5fd\", tickSize: 8,\n      channels: { angle: { field: \"p\", scale: { range: [180, 0] } } },\n    }),\n  ],\n}));";
