export const meta = {
  title: "Answer a survey scale",
  blurb: "A familiar agree/disagree question — hover, then click your answer.",
  try: "Hover across the scale, then <b>click</b> your answer.",
};

export const code = `mount(Elicit({
  ...widgets.likert({
    question: "This tool is easy to use",
    options: [
      "Strongly disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly agree",
    ],
  }),
  responsive: "reflow",
}));`;
