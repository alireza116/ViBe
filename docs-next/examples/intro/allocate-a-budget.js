export const meta = {
  title: "Allocate a budget",
  blurb: "Drag the bars to split 100% across categories. Raising one lowers the others.",
  try: "<b>Drag</b> any bar. The shares always add up to 100.",
};

export const code = `mount(Elicit({
  width: 560, height: 280,
  responsive: "reflow",
  margins: { top: 24, right: 20, bottom: 44, left: 48 },
  guides: [ guides.rule({ y: 25, label: "even split" }) ],
  data: [
    { category: "Product", share: 25 },
    { category: "Marketing", share: 25 },
    { category: "Ops", share: 25 },
    { category: "R&D", share: 25 },
  ],
  constraints: [
    clamp({ field: "share", min: 0 }),
    maintainSum({ field: "share", targetSum: 100 }),
  ],
  schema: {
    category: { type: "categorical", domain: ["Product", "Marketing", "Ops", "R&D"] },
    share: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    bar({
      fill: "#6366f1",
      channels: {
        x: { field: "category" },
        y: { field: "share", edit: drag({ guide: true }) },
      },
    }),
  ],
}))`;
