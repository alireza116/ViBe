export const meta = {
  title: "Clamped drag with a guide",
  blurb: "The y edit is clamped to 0–90; guide: true draws the bounds and the snap ring.",
  try: "<b>Drag</b> from anywhere in a column (clamped to 0–90).",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: \"A\", y: 20 }, { x: \"B\", y: 45 },\n    { x: \"C\", y: 30 }, { x: \"D\", y: 60 },\n  ],\n  constraints: [ clamp({ field: \"y\", min: 0, max: 90 }) ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    bar({\n      fill: \"#2563eb\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"nearest\", threshold: 40, guide: true }) },\n      },\n    }),\n  ],\n}))";
