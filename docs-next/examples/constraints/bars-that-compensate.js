export const meta = {
  title: "Bars that compensate",
  blurb: "maintainSum bounds the touched bar so the total stays 100; a rule guide marks the even split.",
  try: "<b>Drag</b> any bar — the others compensate.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  guides: [ guides.rule({ y: 25, label: \"even split (25)\" }) ],\n  data: [\"A\", \"B\", \"C\", \"D\"].map((c) => ({ x: c, y: 25 })),\n  // Invariants on the DATA — they gate every edit, from every mark.\n  constraints: [\n    clamp({ field: \"y\", min: 0 }),\n    maintainSum({ field: \"y\", targetSum: 100 }),\n  ],\n  schema: {\n    x: { type: \"categorical\", domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    bar({\n      fill: \"#6366f1\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\", edit: drag({ guide: true }) },\n      },\n    }),\n  ],\n}))";
