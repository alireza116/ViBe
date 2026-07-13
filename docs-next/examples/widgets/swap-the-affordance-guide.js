export const meta = {
  title: "Swap the affordance guide",
  blurb: "Replace rings with your own ticks — same mark/edit/constraint, different clothing. Guide nodes never capture the pointer.",
  try: "click a tick — interaction unchanged, look is yours.",
};

export const code = "const options = [\"A\", \"B\", \"C\", \"D\"];\nmount(Elicit({\n  width: 480, height: 110,\n  margins: { top: 28, right: 40, bottom: 36, left: 40 },\n  axes: false,\n  data: [],\n  schema: { choice: { type: \"ordinal\", domain: options } },\n  scales: { x: { type: \"band\" } },\n  constraints: [ count({ max: 1, strategy: \"replace\" }) ],\n  guides: [\n    guides.custom((ctx) => {\n      const cats = ctx.scales.x.domainConfig || [];\n      const cy = ctx.height / 2;\n      return cats.flatMap((c) => {\n        const cx = ctx.scales.x.encode(c);\n        return [\n          { type: \"line\", x1: cx, y1: cy - 14, x2: cx, y2: cy + 14,\n            stroke: \"#94a3b8\", strokeWidth: 2, background: true },\n          { type: \"text\", x: cx, y: cy + 28, text: String(c),\n            textAnchor: \"middle\", fontSize: 12, fill: \"#475569\" },\n        ];\n      });\n    }),\n  ],\n  features: [\n    point({\n      size: 9, fill: \"#4f46e5\",\n      channels: { x: { field: \"choice\" } },\n      edits: [ create({ pick: \"probe\", channels: [\"x\"], advance: false }) ],\n    }),\n  ],\n}));";
