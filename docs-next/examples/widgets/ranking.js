export const meta = {
  title: "Ranking",
  blurb: "Drag items to reorder (edit.rank under the hood).",
  try: "<b>Drag</b> a dot up or down to swap ranks.",
};

export const code = "mount(Elicit(widgets.ranking({\n  question: \"Rank these priorities\",\n  items: [\"Cost\", \"Speed\", \"Quality\", \"Risk\"],\n})));";
