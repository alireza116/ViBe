export const meta = {
  title: "One editable bar chart",
  blurb: "The chart on the left and the numbers on the right are the same thing — drag a bar and watch the data update.",
  try: "<b>Drag</b> a bar — the panel on the right is what your app would read.",
};

export const code = `mount(Elicit({
  width: 560, height: 280,
  responsive: "reflow",
  margins: { top: 24, right: 20, bottom: 44, left: 48 },
  // 1. Starting numbers
  data: [
    { cat: "A", n: 30 },
    { cat: "B", n: 55 },
    { cat: "C", n: 22 },
    { cat: "D", n: 44 },
  ],
  // 2. What each column means (and its range)
  schema: {
    cat: { type: "categorical", domain: ["A", "B", "C", "D"] },
    n:   { type: "quantitative", domain: [0, 60] },
  },
  // 3. Draw bars; dragging a bar changes its number
  features: [
    bar({
      fill: "#4f46e5",
      channels: {
        x: { field: "cat" },
        y: { field: "n", edit: drag() },
      },
    }),
  ],
}))`;
