export const meta = {
  title: "Nearest pick + self-drawn guide",
  blurb: "pick: \"nearest\" grabs a bar from anywhere in its column; guide: true draws the snap ring.",
  try: "<b>Drag</b> from anywhere in a column to grab that bar.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: \"A\", y: 20 }, { x: \"B\", y: 45 },\n    { x: \"C\", y: 30 }, { x: \"D\", y: 60 },\n  ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    bar({\n      fill: \"#2563eb\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"nearest\", threshold: 40, guide: true }) },\n      },\n    }),\n  ],\n}))";
