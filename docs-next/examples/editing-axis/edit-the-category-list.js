export const meta = {
  title: "Edit the category list",
  blurb: "Double-click ＋ to add · double-click a label to rename · click × to remove.",
  try: "<b>Double-click</b> ＋ to add a bar · <b>double-click</b> a label to rename · <b>click</b> × to remove.",
};

export const code = "mount(Elicit({\n  width: 420, height: 280,\n  margins: { top: 16, right: 18, bottom: 48, left: 44 },\n  data: [\n    { cat: \"Apples\", v: 6 },\n    { cat: \"Pears\", v: 9 },\n    { cat: \"Plums\", v: 4 },\n  ],\n  schema: {\n    cat: { type: \"categorical\", domain: [\"Apples\", \"Pears\", \"Plums\"] },\n    v:   { type: \"quantitative\", domain: [0, 12] },\n  },\n  axes: false,\n  features: [\n    axisY(),\n    axisX({ edit: edit.axis.categories() }),\n    bar({ fill: \"#2563eb\",\n      channels: { x: { field: \"cat\" }, y: { field: \"v\" } } }),\n  ],\n}))";
