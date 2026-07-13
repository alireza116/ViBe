export const meta = {
  title: "Grow the chart instead",
  blurb: "mode: 'grow' holds the data's scale constant and resizes the chart.",
  try: "<b>Drag</b> the x-axis max handle — the chart itself grows/shrinks.",
};

export const code = "mount(Elicit({\n  width: 360, height: 260,\n  margins: { top: 16, right: 18, bottom: 40, left: 44 },\n  data: [{ x: 20, y: 30 }, { x: 90, y: 55 }],\n  schema: {\n    x: { type: \"quantitative\", domain: [0, 100] },\n    y: { type: \"quantitative\", domain: [0, 100] },\n  },\n  axes: false,\n  features: [\n    axisY(),\n    axisX({ title: \"x\", edit: edit.axis.scale({ mode: \"grow\" }) }),\n    point({ fill: \"#059669\", size: 7,\n      channels: { x: { field: \"x\" }, y: { field: \"y\" } } }),\n  ],\n}))";
