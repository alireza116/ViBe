export const meta = {
  title: "As a widget (pick ≤ 2)",
  blurb: "The hover shows whether a click will pick or un-pick.",
  try: "pick two, then click one again.",
};

export const code = "mount(Elicit(widgets.multipleChoice({\n  question: \"Which apply?\",\n  options: [\"Fast\",\"Cheap\",\"Reliable\",\"Simple\"],\n  max: 2,\n})));";
