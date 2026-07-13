export const meta = {
  title: "Grow a Likert scale",
  blurb: "mode: 'grow' keeps each band the same width and grows the chart by a step per point added — extend a 5-point scale to 7 without cramming.",
  try: "<b>Double-click</b> ＋ to add points — the chart widens instead of the bars shrinking · <b>click</b> × to shrink it back.",
};

export const code = "mount(Elicit({\n  width: 320, height: 240,\n  margins: { top: 16, right: 18, bottom: 46, left: 40 },\n  data: [\n    { step: \"1\", n: 3 }, { step: \"2\", n: 6 }, { step: \"3\", n: 9 },\n    { step: \"4\", n: 5 }, { step: \"5\", n: 2 },\n  ],\n  schema: {\n    step: { type: \"ordinal\", domain: [\"1\", \"2\", \"3\", \"4\", \"5\"] },\n    n:    { type: \"quantitative\", domain: [0, 12] },\n  },\n  axes: false,\n  features: [\n    axisY(),\n    axisX({ edit: edit.axis.categories({ mode: \"grow\" }) }),\n    bar({ fill: \"#0ea5e9\",\n      channels: { x: { field: \"step\" }, y: { field: \"n\" } } }),\n  ],\n}))";
