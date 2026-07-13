export const meta = {
  title: "Vancouver local areas",
  blurb: "Pass any FeatureCollection: geoBasemap({ geojson }). Fit with projection.domain. In your app: const map = await fetch(\"…/my-map.geojson\").then(r => r.json()).",
  try: "",
};

export const code = "// docs inject `vancouver`; your app loads GeoJSON then passes it in:\n// const vancouver = await fetch(\"data/vancouver-neighborhoods.json\").then(r => r.json());\n\nmount(Elicit({\n  width: 520, height: 360,\n  margins: { top: 8, right: 8, bottom: 8, left: 8 },\n  projection: { type: \"mercator\", domain: vancouver, inset: 6 },\n  data: [],\n  schema: {},\n  features: [\n    geoBasemap({\n      geojson: vancouver,\n      fill: \"#e8eef5\",\n      stroke: \"#64748b\",\n      strokeWidth: 0.8,\n    }),\n  ],\n}));";
