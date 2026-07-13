export const meta = {
  title: "A mean line that chases the bars",
  blurb: "guides.rule({ y: ({ data }) => d3.mean(data, (d) => d.y) }) — the annotation reads the dataset.",
  try: "<b>Drag</b> a bar — the fixed target holds, the mean line and the band follow.",
};

export const code = "mount(Elicit({\n  width: 380, height: 260,\n  margins: { top: 14, right: 14, bottom: 26, left: 30 },\n  guides: [\n    // A literal: a fixed reference.\n    guides.rule({ y: 50, label: \"target 50\" }),\n    // A function of the context: recomputed from the live rows every render.\n    guides.region({\n      y: ({ data }) => [d3.min(data, (d) => d.y), d3.max(data, (d) => d.y)],\n      fill: \"#6366f1\", opacity: 0.10,\n    }),\n    guides.rule({\n      y: ({ data }) => d3.mean(data, (d) => d.y),\n      label: \"mean\",\n      stroke: \"#e4572e\",\n    }),\n  ],\n  schema: {\n    x: { type: \"categorical\",  domain: [\"A\", \"B\", \"C\", \"D\"] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  data: [\n    { x: \"A\", y: 30 }, { x: \"B\", y: 55 },\n    { x: \"C\", y: 45 }, { x: \"D\", y: 70 },\n  ],\n  constraints: [ clamp({ field: \"y\", min: 0, max: 100 }) ],\n  features: [\n    bar({\n      fill: \"#6366f1\",\n      channels: {\n        x: { field: \"x\" },\n        y: { field: \"y\", edit: drag() },\n      },\n    }),\n  ],\n}))";
