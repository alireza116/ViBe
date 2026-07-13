export const meta = {
  title: "Editable area",
  blurb: "areaY with drag on y handles.",
  try: "<b>Drag</b> a handle to reshape the area.",
};

export const code = "mount(Elicit({\n  width: 400, height: 260,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [\n    { t: 1, n: 20 }, { t: 2, n: 45 }, { t: 3, n: 35 },\n    { t: 4, n: 60 }, { t: 5, n: 50 },\n  ],\n  schema: {\n    t: { type: \"quantitative\", domain: [1, 5] },\n    n: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    areaY({\n      fill: \"#2563eb\", stroke: \"#2563eb\",\n      channels: {\n        x: { field: \"t\" },\n        y: { field: \"n\", edit: drag() },\n      },\n    }),\n  ],\n}));";
