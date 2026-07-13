export const meta = {
  title: "Draw a path across Vancouver",
  blurb: "",
  try: "<b>Drag</b> across the map to sketch a route.",
};

export const code = "mount(Elicit({\n  width: 520, height: 360,\n  margins: { top: 8, right: 8, bottom: 8, left: 8 },\n  projection: { type: \"mercator\", domain: vancouver, inset: 6 },\n  data: [],\n  schema: {\n    coordinates: { type: \"categorical\" },\n  },\n  features: [\n    geoBasemap({ geojson: vancouver, fill: \"#e8eef5\", stroke: \"#64748b\", strokeWidth: 0.8 }),\n    geoLine({\n      stroke: \"#b91c1c\", strokeWidth: 2.5, showVertices: true, handleSize: 4,\n      channels: {\n        coordinates: { field: \"coordinates\", scale: null },\n      },\n      edits: [edit.geo.draw()],\n    }),\n  ],\n}));";
