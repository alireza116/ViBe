export const meta = {
  title: "Rescale in place",
  blurb: "Dragging the end-handle rewrites x's schema domain; the grid follows.",
  try: "<b>Drag</b> the blue handle at either end of the x-axis.",
};

export const code = "mount(Elicit({\n  width: 420, height: 280,\n  margins: { top: 16, right: 18, bottom: 40, left: 44 },\n  data: [{ x: 20, y: 30 }, { x: 55, y: 65 }, { x: 90, y: 20 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  axes: false,\n  features: [\n    gridX(), axisY(),\n    axisX({ title: \"x\", grid: true, edit: edit.axis.scale() }),\n    point({ fill: \"#7c3aed\", size: 7,\n      channels: { x: { field: \"x\" }, y: { field: \"y\" } } }),\n  ],\n}))";
