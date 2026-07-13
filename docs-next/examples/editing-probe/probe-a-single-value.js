export const meta = {
  title: "Probe a single value",
  blurb: "drag({ pick: \"probe\" }) — no dragging involved, just move and click.",
  try: "move across the track, then click.",
};

export const code = "const chart = Elicit({\n  width: 380, height: 130,\n  margins: { top: 20, right: 24, bottom: 34, left: 24 },\n  axes: { x: {}, y: false },\n  data: [{ v: 20 }],\n  schema: {\n    v: { type: \"quantitative\", domain: [0, 100] },\n  },\n  features: [\n    point({\n      id: \"belief\",\n      size: 9, fill: \"#2563eb\",\n      channels: { x: { field: \"v\",\n                       edit: drag({ pick: \"probe\", advance: false }) },},\n      constraints: [ clamp({ min: 0, max: 100, field: \"v\" }) ],\n    }),\n  ],\n});\nmount(chart);\nconst out = document.createElement(\"div\");\nout.style.cssText = \"font:12px ui-monospace,monospace;color:#64748b\";\nconst show = () => { out.textContent = \"committed: \" + chart.getData()[0].v.toFixed(0); };\nchart.on(\"change\", show); show();\nmount(out);";
