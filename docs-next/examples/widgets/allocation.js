export const meta = {
  title: "Allocation",
  blurb: "Bars that redistribute to keep a fixed sum.",
  try: "<b>Drag</b> a bar — siblings rebalance to 100.",
};

export const code = "mount(Elicit(widgets.allocation({\n  question: \"Allocate 100 points\",\n  categories: [\"A\", \"B\", \"C\", \"D\"],\n  targetSum: 100,\n})));";
