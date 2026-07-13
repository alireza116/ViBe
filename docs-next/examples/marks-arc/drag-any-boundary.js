export const meta = {
  title: "Drag any boundary",
  blurb: "Each handle pair-shifts its two neighbors; the seam handle links the last and first slice.",
  try: "<b>Drag</b> a dot on any slice edge (including the seam at 9 o’clock).",
};

export const code = "mount(Elicit({\n  width: 300, height: 280,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [\n    { party: \"D\", share: 40 },\n    { party: \"R\", share: 35 },\n    { party: \"O\", share: 25 },\n  ],\n  schema: {\n    party: { type: \"categorical\" },\n    share: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    pie({\n      outerRadius: 100,\n      edit: edit.arc.edge(),\n      channels: {\n        angle: { field: \"share\" },\n        fill: { field: \"party\" },\n      },\n    }),\n  ],\n}));";
