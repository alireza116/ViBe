export const meta = {
  title: "Party shares",
  blurb: "Three slices from a shared total.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 300, height: 280,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [\n    { party: \"D\", share: 48 },\n    { party: \"R\", share: 45 },\n    { party: \"O\", share: 7 },\n  ],\n  schema: {\n    party: { type: \"categorical\" },\n    share: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    pie({\n      outerRadius: 100,\n      channels: {\n        angle: { field: \"share\" },\n        fill: { field: \"party\" },\n      },\n    }),\n  ],\n}));";
