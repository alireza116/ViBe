export const meta = {
  title: "Quantitative gauge",
  blurb: "Domain [0, 100] maps to [180°, 0°] (left → right). Drag the needle.",
  try: "<b>Drag</b> the needle left or right.",
};

export const code = "mount(Elicit({\n  width: 320, height: 200,\n  margins: { top: 24, right: 16, bottom: 16, left: 16 },\n  axes: false,\n  data: [{ n: 62 }],\n  schema: { n: { type: \"quantitative\", domain: [0, 100] } },\n  features: [\n    composite({\n      id: \"gauge\",\n      parts: [\n        axisRadial({\n          orient: \"top\", radius: 100, ticks: 5,\n          channels: { angle: { field: \"n\", scale: { range: [180, 0] } } },\n        }),\n        needle({\n          orient: \"top\", length: 90, fill: \"#1d4ed8\",\n          channels: {\n            angle: {\n              field: \"n\",\n              scale: { range: [180, 0] },\n              edit: rotate({ pivot: \"mark\", fold: false, pick: \"direct\" }),\n            },\n          },\n        }),\n        text({\n          fontSize: 22, dy: 28,\n          format: \".0f\",\n          channels: {\n            text: { field: \"n\" },\n            textAnchor: { value: \"middle\" },\n            lineAnchor: { value: \"middle\" },\n          },\n        }),\n      ],\n    }),\n  ],\n}));";
