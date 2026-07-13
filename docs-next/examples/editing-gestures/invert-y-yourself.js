export const meta = {
  title: "Invert y yourself",
  blurb: "gesture defaults to drag. ctx.pointer is plot pixels; scales.y.invertValue maps them back to data. touched: true is just another field on the returned datum — it shows up in getData() because you put it there.",
  try: "<b>Drag</b> a dot — y follows the pointer; the data panel gains <code class=\"inline\">touched: true</code>.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [{ x: 30, y: 30 }, { x: 70, y: 70 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#2563eb\",\n      size: 8,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [\n        // default gesture: \"drag\" — pass { gesture: \"click\" } to change it\n        custom((datum, event, ctx) => ({\n          ...datum,\n          y: ctx.scales.y.invertValue(ctx.pointer.y),\n          touched: true, // becomes data; omit if you only want to rewrite y\n        })),\n      ],\n    }),\n  ],\n}))";
