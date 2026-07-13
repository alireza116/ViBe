export const meta = {
  title: "Drag a value (ticks)",
  blurb: "Same y edit as a bar; pick: \"nearest\" grabs the tick from anywhere in its column.",
  try: "<b>Drag</b> a tick up or down — from anywhere in its column.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  data: [\n    { x: \"A\", y: 20 }, { x: \"B\", y: 45 },\n    { x: \"C\", y: 30 }, { x: \"D\", y: 60 },\n  ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    tickY({\n      stroke: \"#4f46e5\", strokeWidth: 3,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\",\n             edit: drag({ pick: \"nearest\" }) },\n      },\n    }),\n  ],\n}))";
