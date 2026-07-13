export const meta = {
  title: "Cycle fill on selected local areas",
  blurb: "Kitsilano, Fairview, Mount Pleasant, Downtown — click to cycle category.",
  try: "<b>Click</b> a shaded neighborhood to cycle its colour.",
};

export const code = "const editable = vancouver.features\n  .filter(f => [\"Kitsilano\", \"Fairview\", \"Mount Pleasant\", \"Downtown\"].includes(f.properties.name))\n  .map(f => ({\n    name: f.properties.name,\n    geometry: f.geometry,\n    fill: \"A\",\n  }));\n\nmount(Elicit({\n  width: 520, height: 360,\n  margins: { top: 8, right: 8, bottom: 8, left: 8 },\n  projection: { type: \"mercator\", domain: vancouver, inset: 6 },\n  data: editable,\n  schema: {\n    name: { type: \"categorical\" },\n    fill: { type: \"categorical\", domain: [\"A\", \"B\", \"C\"] },\n    geometry: { type: \"categorical\" },\n  },\n  features: [\n    geoBasemap({ geojson: vancouver, fill: \"#f1f5f9\", stroke: \"#94a3b8\", strokeWidth: 0.7 }),\n    geoPolygon({\n      stroke: \"#0f172a\", strokeWidth: 1.2, fillOpacity: 0.75,\n      channels: {\n        geometry: { field: \"geometry\", scale: null },\n        fill: {\n          field: \"fill\",\n          scale: { scheme: \"tableau10\" },\n          edit: cycle(),\n        },\n      },\n    }),\n  ],\n}));";
