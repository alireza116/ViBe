export const meta = {
  title: "Interval / CI",
  blurb: "Drag the mean to translate the whole interval; drag a cap to resize one end.",
  try: "<b>Drag</b> the centre — lo/hi follow. <b>Drag</b> a cap — mean stays put.",
};

export const code = "mount(Elicit(widgets.interval({\n  question: \"Your estimate and range\",\n  mean: 50, lo: 30, hi: 70,\n})));";
