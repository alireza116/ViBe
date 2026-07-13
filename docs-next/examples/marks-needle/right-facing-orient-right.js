export const meta = {
  title: "Right-facing (orient: \"right\")",
  blurb: "Same data; arc on the right — set scale.range to [-90, 90].",
  try: "",
};

export const code = "mount(Elicit({\n  width: 240, height: 280,\n  margins: { top: 16, right: 28, bottom: 16, left: 16 },\n  axes: false,\n  data: [{ n: 62 }],\n  schema: { n: { type: \"quantitative\", domain: [0, 100] } },\n  features: [\n    axisRadial({\n      orient: \"right\", radius: 100, ticks: 5,\n      channels: { angle: { field: \"n\", scale: { range: [-90, 90] } } },\n    }),\n    needle({\n      orient: \"right\", length: 90, fill: \"#1d4ed8\",\n      channels: {\n        angle: {\n          field: \"n\",\n          scale: { range: [-90, 90] },\n          edit: rotate({ pivot: \"mark\", fold: false, pick: \"direct\" }),\n        },\n      },\n    }),\n  ],\n}));";
