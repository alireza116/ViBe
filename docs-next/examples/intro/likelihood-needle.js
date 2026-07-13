export const meta = {
  title: "Likelihood gauge",
  blurb: "A dial you can turn — drag the needle to pick how likely something feels.",
  try: "<b>Drag</b> the needle left or right.",
};

export const code = `mount(Elicit({
  width: 560, height: 240,
  responsive: "reflow",
  margins: { top: 48, right: 72, bottom: 28, left: 72 },
  axes: false,
  overflow: "visible",
  data: [{ chance: "LEANING D" }],
  schema: {
    chance: {
      type: "ordinal",
      domain: [
        "VERY LIKELY D", "LIKELY D", "LEANING D", "TOSSUP",
        "LEANING R", "LIKELY R", "VERY LIKELY R",
      ],
    },
  },
  features: [
    axisRadial({
      orient: "top", radius: 110, bands: true, bandWidth: 22,
      tickSize: 0, labelOffset: 18, fontSize: 8,
      channels: {
        angle: { field: "chance", scale: { range: [180, 0] } },
        fill: { field: "chance", scale: { scheme: "RdBu", reverse: true } },
      },
    }),
    needle({
      orient: "top", length: 95, fill: "#b91c1c",
      channels: {
        angle: {
          field: "chance",
          scale: { range: [180, 0] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
    }),
    text({
      fontSize: 14, dy: 32,
      channels: {
        text: { field: "chance" },
        textAnchor: { value: "middle" },
        lineAnchor: { value: "middle" },
      },
    }),
  ],
}))`;
