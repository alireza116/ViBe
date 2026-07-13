export const meta = {
  title: "As a widget",
  blurb: "The cell grid is a guide, so it never swallows the click.",
  try: "answer each row; click a row again elsewhere to change it.",
};

export const code = "mount(Elicit(widgets.matrix({\n  question: \"Rate each aspect\",\n  questions: [\"Speed\",\"Cost\",\"Support\"],\n  options: [\"Poor\",\"OK\",\"Good\",\"Great\"],\n})));";
