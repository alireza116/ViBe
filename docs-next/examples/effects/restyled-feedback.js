export const meta = {
  title: "Restyled feedback",
  blurb: "Indigo ring, thicker outline, softer grab — paint channels untouched.",
  try: "<b>Move</b> / <b>drag</b> — indigo ring, thicker outline, softer grab.",
};

export const code = "mount(Elicit({\n  width: 340, height: 240,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  effects: {\n    grab: \"brightness(1.08)\",\n    select: {\n      color: \"#4f46e5\",\n      ring: { dash: \"1 3\", width: 1.5, opacity: 0.5 },\n      highlight: { width: 4, opacity: 1, pad: 8 },\n    },\n  },\n  data: [{ x: 25, y: 35 }, { x: 55, y: 68 }, { x: 78, y: 30 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#ffffff\", stroke: \"#334155\", strokeWidth: 2,\n      size: 10,\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\" },\n      },\n      edits: [ drag({ channels: [\"x\", \"y\"], pick: \"nearest\", threshold: 45, guide: true }) ],\n    }),\n  ],\n}))";
