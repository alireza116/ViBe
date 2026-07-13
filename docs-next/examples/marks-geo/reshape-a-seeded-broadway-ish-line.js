export const meta = {
  title: "Reshape a seeded Broadway-ish line",
  blurb: "Drag vertex handles on a pre-drawn path.",
  try: "<b>Drag</b> a vertex handle.",
};

export const code = "mount(Elicit({\n  width: 520, height: 360,\n  margins: { top: 8, right: 8, bottom: 8, left: 8 },\n  projection: { type: \"mercator\", domain: vancouver, inset: 6 },\n  data: [{\n    coordinates: [\n      [-123.185, 49.264],\n      [-123.155, 49.263],\n      [-123.120, 49.263],\n      [-123.080, 49.262],\n      [-123.050, 49.261],\n    ],\n  }],\n  schema: {\n    coordinates: { type: \"categorical\" },\n  },\n  features: [\n    geoBasemap({ geojson: vancouver, fill: \"#e8eef5\", stroke: \"#64748b\", strokeWidth: 0.8 }),\n    geoLine({\n      stroke: \"#b91c1c\", strokeWidth: 2.5, handleSize: 6,\n      channels: {\n        coordinates: { field: \"coordinates\", scale: null },\n      },\n      edits: [edit.geo.dragVertex()],\n    }),\n  ],\n}));";
