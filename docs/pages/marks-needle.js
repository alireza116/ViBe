// Needle — gauge / dial pointer with optional radial axis + center text.
export default {
    path: 'marks/needle.html',
    title: 'Needle',
    lead:
        'A pivoted <b>needle</b> (NYT-style gauge or software dial). It encodes a value on ' +
        'the <code class="inline">angle</code> channel — degrees via the channel’s scale — and ' +
        'draws a tapered pointer + hub. The default semicircle is <b>horizontal</b> ' +
        '(left → right through the top, like a speedometer). Use <code class="inline">orient</code> ' +
        '(<code class="inline">top</code>·<code class="inline">right</code>·<code class="inline">bottom</code>·' +
        '<code class="inline">left</code>), <code class="inline">arc: "full"</code>, or explicit ' +
        '<code class="inline">start</code>/<code class="inline">end</code> — and keep ' +
        '<code class="inline">scale.range</code> in sync. Optional <code class="inline">x</code>/<code class="inline">y</code> ' +
        'place the pivot on categorical or linear axes (many small needles in one chart).',
    api: [
        {
            name: 'needle(options)',
            summary: 'Import from <code class="inline">vibe.plot</code>. One needle (+ hub) per datum.',
            signatures: [
                'needle({ channels, length, hubSize, baseWidth, orient, arc, start, end, id }) → Feature',
            ],
            options: [
                { name: 'channels', type: 'object', default: '{}', desc: 'Must include <code class="inline">angle</code>. Optional <code class="inline">x</code>/<code class="inline">y</code> place the pivot (default: plot centre).' },
                { name: 'length', type: 'number', default: '40% of min(w,h)', desc: 'Needle length in px. Or drive via the <code class="inline">size</code> channel.' },
                { name: 'hubSize', type: 'number', default: '5', desc: 'Pivot circle radius in px.' },
                { name: 'baseWidth', type: 'number', default: '10', desc: 'Width of the needle base in px.' },
                { name: 'orient', type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", desc: 'Semicircle facing that side. <code class="inline">top</code> = NYT / speedometer (range <code class="inline">[180, 0]</code>). Match with <code class="inline">scale.range</code>.' },
                { name: 'arc', type: "'semi' | 'full'", default: "'semi'", desc: '<code class="inline">full</code> → <code class="inline">[-180, 180]</code>. Otherwise same as <code class="inline">orient</code> (default top).' },
                { name: 'start / end', type: 'number', default: '—', desc: 'Explicit degree span (overrides <code class="inline">orient</code> / <code class="inline">arc</code>).' },
            ],
            channels: [
                { name: 'angle', type: 'linear | point (deg)', desc: 'The elicited value, mapped to degrees by its scale. Default range <code class="inline">[180, 0]</code>.' },
                { name: 'x / y', type: 'linear | point', desc: 'Optional pivot position — categorical or quantitative.' },
                { name: 'fill / stroke', type: 'style', desc: 'Needle colour.' },
            ],
            returns: 'A <b>feature</b> emitting a filled needle <code class="inline">path</code> and hub <code class="inline">circle</code> per datum.',
        },
    ],
    sections: [
        {
            id: 'gauge',
            title: 'Semicircle gauge + center text',
            intro:
                'A composite of <code class="inline">axisRadial</code> (ticks), <code class="inline">needle</code>, ' +
                'and <code class="inline">text</code>. Default orient is top: 0 on the left, max on the right.',
            examples: [
                {
                    title: 'Quantitative gauge',
                    blurb: 'Domain [0, 100] maps to [180°, 0°] (left → right). Drag the needle.',
                    try: '<b>Drag</b> the needle left or right.',
                    code:
`mount(Elicit({
  width: 320, height: 200,
  margins: { top: 24, right: 16, bottom: 16, left: 16 },
  axes: false,
  data: [{ n: 62 }],
  schema: { n: { type: "quantitative", domain: [0, 100] } },
  features: [
    composite({
      id: "gauge",
      parts: [
        axisRadial({
          orient: "top", radius: 100, ticks: 5,
          channels: { angle: { field: "n", scale: { range: [180, 0] } } },
        }),
        needle({
          orient: "top", length: 90, fill: "#1d4ed8",
          channels: {
            angle: {
              field: "n",
              scale: { range: [180, 0] },
              edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
            },
          },
        }),
        text({
          fontSize: 22, dy: 28,
          format: ".0f",
          channels: {
            text: { field: "n" },
            textAnchor: { value: "middle" },
            lineAnchor: { value: "middle" },
          },
        }),
      ],
    }),
  ],
}));`,
                },
                {
                    title: 'Right-facing (orient: "right")',
                    blurb: 'Same data; arc on the right — set scale.range to [-90, 90].',
                    code:
`mount(Elicit({
  width: 240, height: 280,
  margins: { top: 16, right: 28, bottom: 16, left: 16 },
  axes: false,
  data: [{ n: 62 }],
  schema: { n: { type: "quantitative", domain: [0, 100] } },
  features: [
    axisRadial({
      orient: "right", radius: 100, ticks: 5,
      channels: { angle: { field: "n", scale: { range: [-90, 90] } } },
    }),
    needle({
      orient: "right", length: 90, fill: "#1d4ed8",
      channels: {
        angle: {
          field: "n",
          scale: { range: [-90, 90] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'grid',
            title: 'Many needles on x × y',
            intro:
                'Each row is a pivot: <code class="inline">x</code> categorical, <code class="inline">y</code> ' +
                'quantitative, <code class="inline">angle</code> a third numeric belief. Drag any needle — ' +
                'direct-pick writes that row only.',
            examples: [
                {
                    title: 'Small needles in a scatter of pivots',
                    blurb: 'Group on x, layer on y, belief on angle. Cartesian axes frame the pivots.',
                    try: '<b>Drag</b> any small needle to change that cell’s belief.',
                    code:
`mount(Elicit({
  width: 420, height: 280,
  margins: { top: 16, right: 16, bottom: 36, left: 40 },
  data: [
    { g: "A", layer: 1, belief: 35 },
    { g: "B", layer: 1, belief: 62 },
    { g: "C", layer: 1, belief: 48 },
    { g: "A", layer: 2, belief: 70 },
    { g: "B", layer: 2, belief: 44 },
    { g: "C", layer: 2, belief: 81 },
  ],
  schema: {
    g:      { type: "categorical", domain: ["A", "B", "C"] },
    layer:  { type: "quantitative", domain: [0.5, 2.5] },
    belief: { type: "quantitative", domain: [0, 100] },
  },
  axes: {
    x: { title: "group" },
    y: { title: "layer", ticks: 2 },
  },
  features: [
    // A mini radial axis rings each pivot, so every needle shows the 0→100 span
    // it encodes. Same x/y channels as the needle → one ring per row.
    axisRadial({
      radius: 22, ticks: 0, tickSize: 0, labelOffset: 6, fontSize: 7,
      start: 180, end: 0, stroke: "#cbd5e1",
      channels: {
        x: { field: "g" },
        y: { field: "layer" },
        angle: { field: "belief", scale: { range: [180, 0] } },
      },
    }),
    needle({
      length: 24, hubSize: 3, baseWidth: 6,
      channels: {
        x: { field: "g" },
        y: { field: "layer" },
        angle: {
          field: "belief",
          scale: { range: [180, 0] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
        fill: { field: "g" },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'dial',
            title: 'Full-circle dial',
            intro: 'A knob: full 360° with <code class="inline">fold: false</code>.',
            examples: [
                {
                    title: 'Quantitative dial',
                    blurb: 'Rotate anywhere around the hub.',
                    try: '<b>Drag</b> around the dial.',
                    code:
`mount(Elicit({
  width: 280, height: 280,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  axes: false,
  data: [{ n: 0.35 }],
  schema: { n: { type: "quantitative", domain: [0, 1] } },
  features: [
    axisRadial({
      arc: "full", radius: 95, ticks: 8,
      channels: { angle: { field: "n", scale: { range: [-180, 180] } } },
    }),
    needle({
      arc: "full", length: 80, fill: "#0f172a",
      channels: {
        angle: {
          field: "n",
          scale: { range: [-180, 180] },
          edit: rotate({ pivot: "mark", fold: false, pick: "direct" }),
        },
      },
    }),
    text({
      fontSize: 18, format: ".0%",
      channels: {
        text: { field: "n" },
        textAnchor: { value: "middle" },
        lineAnchor: { value: "middle" },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'categorical',
            title: 'Categorical needle',
            intro:
                'A discrete <code class="inline">angle</code> field uses a point scale — drag snaps to the ' +
                'nearest category. Colored bands come from <code class="inline">axisRadial({ bands: true })</code>.',
            examples: [
                {
                    title: 'Likelihood gauge',
                    blurb: 'Seven ordered categories across a top-facing arc.',
                    try: '<b>Drag</b> the needle across categories.',
                    code:
`mount(Elicit({
  width: 360, height: 220,
  margins: { top: 40, right: 70, bottom: 20, left: 70 },
  axes: false,
  // Let the long band labels ("VERY LIKELY D" …) spill into the margin instead of
  // being clipped by the plot edge.
  overflow: "visible",
  data: [{ chance: "LEANING D" }],
  schema: {
    chance: {
      type: "ordinal",
      domain: ["VERY LIKELY D", "LIKELY D", "LEANING D", "TOSSUP",
               "LEANING R", "LIKELY R", "VERY LIKELY R"],
    },
  },
  features: [
    axisRadial({
      orient: "top", radius: 110, bands: true, bandWidth: 22,
      tickSize: 0, labelOffset: 18, fontSize: 8,
      channels: {
        angle: { field: "chance", scale: { range: [180, 0] } },
        // ColorBrewer RdBu is red→blue; reverse so D (left) is blue and R (right)
        // is red — a proper 7-class diverging categorical palette.
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
}));`,
                },
            ],
        },
    ],
};
