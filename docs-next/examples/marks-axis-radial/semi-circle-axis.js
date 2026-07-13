export const meta = {
  title: "Semi-circle axis",
  blurb: "No needle — just the chrome. 0 on the left, 100 on the right.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 300, height: 180,\n  margins: { top: 28, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [{ n: 50 }],\n  schema: { n: { type: \"quantitative\", domain: [0, 100] } },\n  features: [\n    axisRadial({\n      orient: \"top\", radius: 90, ticks: 6, title: \"score\",\n      channels: { angle: { field: \"n\", scale: { range: [180, 0] } } },\n    }),\n  ],\n}));";
