export const meta = {
  title: "Best place to live",
  blurb: "Click the map to drop pins for places you’d live; drag a pin to fine-tune.",
  try: "<b>Click</b> to place a pin · <b>drag</b> an existing one.",
};

export const code = `mount(Elicit({
  width: 560, height: 320,
  responsive: "reflow",
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [],
  schema: {
    lon: { type: "quantitative", domain: [-123.27, -123.02] },
    lat: { type: "quantitative", domain: [49.20, 49.32] },
  },
  features: [
    geoBasemap({
      geojson: vancouver,
      fill: "#e8eef5", stroke: "#64748b", strokeWidth: 0.8,
    }),
    geoPoint({
      size: 8, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
      edits: [edit.geo.drag(), edit.geo.create()],
    }),
  ],
}))`;
