export const meta = {
  title: "Tallies of 1–6",
  blurb: "one cell = one item; counts of 1, 3, 6, 2 — count the cells directly.",
  try: "",
};

export const code = "const cats = [\"A\",\"B\",\"C\",\"D\"];\nmount(Elicit({\n  width: 460, height: 260,\n  margins: { top: 16, right: 12, bottom: 28, left: 28 },\n  data: [\n    { cat: \"A\", value: 1 }, { cat: \"B\", value: 3 },\n    { cat: \"C\", value: 6 }, { cat: \"D\", value: 2 },\n  ],\n  schema: {\n    cat:   { type: \"categorical\", domain: cats },\n    value: { type: \"quantitative\", domain: [0, 6] },\n  },\n  scales: { x: { type: \"band\" } },\n  features: [\n    waffleY({\n      fill: \"#d97706\",\n      shape: \"circle\",\n      unit: 1,\n      gap: 0,\n      channels: { x: { field: \"cat\" }, y: { field: \"value\" } },\n    }),\n  ],\n}));";
