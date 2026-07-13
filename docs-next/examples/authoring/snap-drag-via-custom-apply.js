export const meta = {
  title: "Snap-drag via custom apply",
  blurb: "Invert y, then round to the nearest 10.",
  try: "<b>Drag</b> the point — it lands on multiples of 10.",
};

export const code = "const snapDrag = edit.makeEdit({\n  type: \"snapDrag\",\n  gesture: \"drag\",\n  channels: [\"y\"],\n  apply: (ctx) => {\n    const ch = ctx.channels[0];\n    const v = edit.invertChannel(ch, ctx.pointer);\n    if (v === undefined || !ctx.datum) return undefined;\n    return { ...ctx.datum, [ch.field]: Math.round(v / 10) * 10 };\n  },\n});\nmount(Elicit({\n  width: 360, height: 240,\n  margins: { top: 16, right: 16, bottom: 28, left: 34 },\n  data: [ { cat: \"A\", n: 40 } ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"A\"] },\n    n: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      fill: \"#2563eb\", size: 10,\n      channels: { x: { field: \"cat\" }, y: { field: \"n\" } },\n      edits: [ snapDrag ],\n    }),\n  ],\n}));";
