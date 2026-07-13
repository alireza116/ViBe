export const meta = {
  title: "Belief pins on Vancouver",
  blurb: "Seeded near Downtown & Kitsilano; click elsewhere to add more.",
  try: "<b>Click</b> to place a pin; <b>drag</b> an existing one.",
};

export const code = "mount(Elicit({\n  width: 520, height: 360,\n  margins: { top: 8, right: 8, bottom: 8, left: 8 },\n  projection: { type: \"mercator\", domain: vancouver, inset: 6 },\n  data: [\n    { lon: -123.1207, lat: 49.2827, label: \"Downtown\" },\n    { lon: -123.1560, lat: 49.2680, label: \"Kits\" },\n  ],\n  schema: {\n    lon: { type: \"quantitative\", domain: [-123.27, -123.02] },\n    lat: { type: \"quantitative\", domain: [49.20, 49.32] },\n    label: { type: \"categorical\" },\n  },\n  features: [\n    geoBasemap({ geojson: vancouver, fill: \"#e8eef5\", stroke: \"#64748b\", strokeWidth: 0.8 }),\n    geoPoint({\n      size: 8, fill: \"#1d4ed8\", stroke: \"#fff\", strokeWidth: 1.5,\n      channels: {\n        lon: { field: \"lon\" },\n        lat: { field: \"lat\" },\n      },\n      edits: [edit.geo.drag(), edit.geo.create()],\n    }),\n  ],\n}));";
