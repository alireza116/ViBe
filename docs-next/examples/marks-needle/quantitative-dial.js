export const meta = {
  title: "Quantitative dial",
  blurb: "Rotate anywhere around the hub.",
  try: "<b>Drag</b> around the dial.",
};

export const code = "mount(Elicit({\n  width: 280, height: 280,\n  margins: { top: 20, right: 20, bottom: 20, left: 20 },\n  axes: false,\n  data: [{ n: 0.35 }],\n  schema: { n: { type: \"quantitative\", domain: [0, 1] } },\n  features: [\n    axisRadial({\n      arc: \"full\", radius: 95, ticks: 8,\n      channels: { angle: { field: \"n\", scale: { range: [-180, 180] } } },\n    }),\n    needle({\n      arc: \"full\", length: 80, fill: \"#0f172a\",\n      channels: {\n        angle: {\n          field: \"n\",\n          scale: { range: [-180, 180] },\n          edit: rotate({ pivot: \"mark\", fold: false, pick: \"direct\" }),\n        },\n      },\n    }),\n    text({\n      fontSize: 18, format: \".0%\",\n      channels: {\n        text: { field: \"n\" },\n        textAnchor: { value: \"middle\" },\n        lineAnchor: { value: \"middle\" },\n      },\n    }),\n  ],\n}));";
