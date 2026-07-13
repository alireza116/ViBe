export const meta = {
  title: "Donut with center text",
  blurb: "Static proportions; text is a sibling mark.",
  try: "",
};

export const code = "mount(Elicit({\n  width: 300, height: 280,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [\n    { party: \"D\", share: 48, label: \"48%\" },\n    { party: \"R\", share: 45, label: \"\" },\n    { party: \"O\", share: 7, label: \"\" },\n  ],\n  schema: {\n    party: { type: \"categorical\" },\n    share: { type: \"quantitative\", domain: [0, 100] },\n    label: { type: \"categorical\" },\n  },\n  features: [\n    donut({\n      outerRadius: 100, innerRadius: 55,\n      channels: {\n        angle: { field: \"share\" },\n        fill: { field: \"party\" },\n      },\n    }),\n    text({\n      fontSize: 22,\n      channels: {\n        text: { value: \"100%\" },\n        textAnchor: { value: \"middle\" },\n        lineAnchor: { value: \"middle\" },\n      },\n    }),\n  ],\n}));";
