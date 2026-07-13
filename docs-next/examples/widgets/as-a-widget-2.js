export const meta = {
  title: "As a widget",
  blurb: "Track, end caps and value labels are guides.",
  try: "move across the track, then click.",
};

export const code = "mount(Elicit(widgets.slider({\n  question: \"How likely is it? (%)\",\n  domain: [0, 100], step: 5, value: 40,\n})));";
