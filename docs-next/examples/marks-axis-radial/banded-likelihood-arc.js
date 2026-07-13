export const meta = {
  title: "Banded likelihood arc",
  blurb: "Seven categories across a top-facing semicircle, colored by reversed RdBu (blue→red).",
  try: "",
};

export const code = "mount(Elicit({\n  width: 360, height: 210,\n  margins: { top: 36, right: 64, bottom: 16, left: 64 },\n  axes: false,\n  overflow: \"visible\",   // long labels spill into the margin\n  data: [{ chance: \"TOSSUP\" }],\n  schema: {\n    chance: {\n      type: \"ordinal\",\n      domain: [\"VERY LIKELY D\", \"LIKELY D\", \"LEANING D\", \"TOSSUP\",\n               \"LEANING R\", \"LIKELY R\", \"VERY LIKELY R\"],\n    },\n  },\n  features: [\n    axisRadial({\n      orient: \"top\", radius: 110, bands: true, bandWidth: 28,\n      labelOffset: 16, fontSize: 8,\n      channels: {\n        angle: { field: \"chance\", scale: { range: [180, 0] } },\n        // RdBu is red→blue natively; reverse for the D→R (blue→red) reading.\n        fill: { field: \"chance\", scale: { scheme: \"RdBu\", reverse: true } },\n      },\n    }),\n  ],\n}));";
