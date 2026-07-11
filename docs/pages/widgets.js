// Widgets — higher-level named elicitations, and the plain-API twin of each.
export default {
    path: 'widgets.html',
    title: 'Widgets',
    lead:
        'Opinionated <b>survey instruments</b> — option rings, cell grids, tracks — each a pure ' +
        'recipe over the core API. They add no interaction surface: the look lives entirely in the ' +
        '<a href="guides.html">guide</a> layer, and the behaviour is a normal mark + a normal edit ' +
        'on the <a href="editing/probe.html">probe</a> driver + a normal constraint. Every example ' +
        'below is shown twice — once as the widget, once as a <b>self-contained</b> plain-API twin ' +
        'that draws the same look with inline <code class="inline">guides.custom</code> helpers, so ' +
        'you can see every line to change. Each factory returns an <b>ElicitSpec</b>: render with ' +
        '<code class="inline">Elicit(widgets.likert({…}))</code>.',
    api: [
        {
            name: 'widgets.likert · multipleChoice · slider · matrix · lineCone · ranking · allocation · …',
            summary: 'Import from <code class="inline">vibe.widgets</code>. Each returns an ElicitSpec; pass it straight to <code class="inline">Elicit</code>. The chart elicits one dataset, so <code class="inline">getData()</code> reads the answer.',
            signatures: [
                'likert({ question, options, value, onChange }) → ElicitSpec',
                'multipleChoice({ question, options, max, value, onChange }) → ElicitSpec',
                'slider({ question, domain, step, value, format, onChange }) → ElicitSpec',
                'matrix({ question, questions, options, value, onChange }) → ElicitSpec',
                'lineCone({ question, x, y, r, spread, wedge, onChange }) → ElicitSpec',
                'ranking({ question, items, onChange }) → ElicitSpec',
                'allocation({ question, categories, targetSum, onChange }) → ElicitSpec',
                'probabilityTokens({ question, bins, maxTokens, onChange }) → ElicitSpec',
                'interval / ci({ question, mean, lo, hi, domain, onChange }) → ElicitSpec',
                'histogram({ question, bins, max, onChange }) → ElicitSpec',
                'region({ question, xDomain, yDomain, onChange }) → ElicitSpec',
                'thermometer({ question, domain, step, value, onChange }) → ElicitSpec',
                'labeledValue({ question, mode, value, domain, onChange }) → ElicitSpec',
            ],
            options: [
                { name: 'options', type: 'any[]', default: '[]', desc: 'Response choices (a band scale) for likert / choice / matrix.' },
                { name: 'max', type: 'number', default: '∞', desc: 'multipleChoice: cap on picks (<code class="inline">count</code>, reject).' },
                { name: 'domain / step', type: 'number', default: '—', desc: 'slider: value range and optional snap increment.' },
                { name: 'questions', type: 'any[]', default: '[]', desc: 'matrix: the rows (band y).' },
                { name: 'x / y', type: 'string', default: "'x' / 'y'", desc: 'lineCone: the two variable names, labelled high/low on the crosshair.' },
                { name: 'onChange', type: '(data) => void', default: '—', desc: 'Called with the committed answer(s). Hover previews never fire it.' },
            ],
            returns:
                'An <b>ElicitSpec</b>. The widget package also exports the same affordance helpers ' +
                '(<code class="inline">THEME</code>, <code class="inline">optionRings</code>, …) if you want to reuse them — ' +
                'the plain-API twins below define those helpers inline instead, so each block stands alone.',
        },
    ],
    sections: [
        {
            id: 'likert',
            title: 'Likert scale',
            intro: 'A point on a band of options + create (probe) + count({ max: 1, replace }). Hover to preview the answer, click to fill it.',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'Rings, track and labels come from the guide layer.',
                    try: 'hover across the scale, then click.',
                    code:
`mount(Elicit(widgets.likert({
  question: "This tool is easy to use",
  options: ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"],
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'Same mark, edit, and constraint — rings/prompt defined inline as guides.',
                    try: 'same look, same interaction — change any line to customize.',
                    code:
`const options = ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
const radius = 11;

const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const optionRings = () => guides.custom((ctx) => {
  const cats = ctx.scales.x.domainConfig || [];
  const cy = ctx.height / 2;
  const cxOf = (c) => ctx.scales.x.encode(c);
  const nodes = [];
  for (let i = 0; i < cats.length - 1; i++) {
    nodes.push({
      type: "line",
      x1: cxOf(cats[i]) + radius, y1: cy,
      x2: cxOf(cats[i + 1]) - radius, y2: cy,
      stroke: "#e2e8f0", strokeWidth: 3, background: true,
    });
  }
  for (const c of cats) {
    nodes.push({
      type: "circle", cx: cxOf(c), cy, r: radius,
      fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5,
    });
    nodes.push({
      type: "text", x: cxOf(c), y: cy + 30, text: String(c),
      textAnchor: "middle", fontSize: 12, fill: "#334155",
    });
  }
  return nodes;
});

mount(Elicit({
  width: 560, height: 130,
  margins: { top: 34, right: 60, bottom: 44, left: 60 },
  axes: false,
  data: [],
  schema: { choice: { type: "ordinal", domain: options } },
  scales: { x: { type: "band" } },
  constraints: [ count({ max: 1, strategy: "replace" }) ],
  guides: [ prompt("This tool is easy to use"), optionRings() ],
  features: [
    point({
      id: "likert",
      size: radius - 3,
      fill: "#2563eb",
      channels: { x: { field: "choice" } },
      edits: [ create({ pick: "probe", channels: ["x"], advance: false }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'choice',
            title: 'Multiple choice',
            intro: 'toggle() folds create and remove into one gesture: click an empty option to pick it, click your pick to take it back. count() caps the total.',
            examples: [
                {
                    title: 'As a widget (pick ≤ 2)',
                    blurb: 'The hover shows whether a click will pick or un-pick.',
                    try: 'pick two, then click one again.',
                    code:
`mount(Elicit(widgets.multipleChoice({
  question: "Which apply?",
  options: ["Fast","Cheap","Reliable","Simple"],
  max: 2,
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'toggle + unique + count; rings defined inline.',
                    try: 'same look — swap max, options, or fill to customize.',
                    code:
`const options = ["Fast","Cheap","Reliable","Simple"];
const radius = 11;

const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const optionRings = () => guides.custom((ctx) => {
  const cats = ctx.scales.x.domainConfig || [];
  const cy = ctx.height / 2;
  const cxOf = (c) => ctx.scales.x.encode(c);
  const nodes = [];
  for (let i = 0; i < cats.length - 1; i++) {
    nodes.push({
      type: "line",
      x1: cxOf(cats[i]) + radius, y1: cy,
      x2: cxOf(cats[i + 1]) - radius, y2: cy,
      stroke: "#e2e8f0", strokeWidth: 3, background: true,
    });
  }
  for (const c of cats) {
    nodes.push({
      type: "circle", cx: cxOf(c), cy, r: radius,
      fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5,
    });
    nodes.push({
      type: "text", x: cxOf(c), y: cy + 30, text: String(c),
      textAnchor: "middle", fontSize: 12, fill: "#334155",
    });
  }
  return nodes;
});

mount(Elicit({
  width: 560, height: 130,
  margins: { top: 34, right: 60, bottom: 44, left: 60 },
  axes: false,
  data: [],
  schema: { choice: { type: "categorical", domain: options } },
  scales: { x: { type: "band" } },
  constraints: [
    unique({ field: "choice", strategy: "reject" }),
    count({ max: 2, strategy: "reject" }),
  ],
  guides: [ prompt("Which apply?"), optionRings() ],
  features: [
    point({
      id: "choice",
      size: radius - 3,
      fill: "#2563eb",
      channels: { x: { field: "choice" } },
      edits: [ toggle({ pick: "probe", channels: ["x"], advance: false }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'slider',
            title: 'Slider',
            intro:
                'A single knob that tracks the pointer and settles on click — drag({ pick: "probe" }). ' +
                'snap() lands it on steps. The track can be a guide or a centred axisX — same instrument, ' +
                'two ways to draw the chrome.',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'Track, end caps and value labels are guides.',
                    try: 'move across the track, then click.',
                    code:
`mount(Elicit(widgets.slider({
  question: "How likely is it? (%)",
  domain: [0, 100], step: 5, value: 40,
})));`,
                },
                {
                    title: 'Plain API — track as a guide',
                    blurb: 'Hand-rolled sliderTrack via guides.custom (full control over caps and stroke).',
                    try: 'same look as the widget.',
                    code:
`const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const sliderTrack = () => guides.custom((ctx) => {
  const cy = ctx.height / 2;
  const dom = ctx.scales.x.domainConfig || [0, 1];
  const lo = dom[0], hi = dom[dom.length - 1];
  return [
    { type: "line", x1: 0, y1: cy, x2: ctx.width, y2: cy,
      stroke: "#e2e8f0", strokeWidth: 4, background: true },
    { type: "line", x1: 0, y1: cy - 7, x2: 0, y2: cy + 7,
      stroke: "#cbd5e1", strokeWidth: 2 },
    { type: "line", x1: ctx.width, y1: cy - 7, x2: ctx.width, y2: cy + 7,
      stroke: "#cbd5e1", strokeWidth: 2 },
    { type: "text", x: 0, y: cy + 26, text: String(lo),
      textAnchor: "start", fontSize: 12, fill: "#334155" },
    { type: "text", x: ctx.width, y: cy + 26, text: String(hi),
      textAnchor: "end", fontSize: 12, fill: "#334155" },
  ];
});

mount(Elicit({
  width: 560, height: 120,
  margins: { top: 34, right: 40, bottom: 40, left: 40 },
  axes: false,
  data: [{ value: 40 }],
  schema: { value: { type: "quantitative", domain: [0, 100] } },
  constraints: [
    clamp({ min: 0, max: 100, field: "value" }),
    snap({ field: "value", step: 5, origin: 0 }),
  ],
  guides: [ prompt("How likely is it? (%)"), sliderTrack() ],
  features: [
    point({
      id: "slider",
      size: 9,
      fill: "#2563eb",
      channels: {
        x: { field: "value",
             edit: drag({ pick: "probe", advance: false }) },
      },
    }),
  ],
}));`,
                },
                {
                    title: 'Plain API — track as a centred axis',
                    blurb:
                        'Same mark/edit/constraints. axisX with transform pins the spine to mid-height; ' +
                        'tickValues at the domain ends are the labels; tickSize draws the end caps. ' +
                        'Usually the simpler path when the chrome is an axis.',
                    try: 'same interaction — chrome comes from axes, not guides.',
                    code:
`const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

mount(Elicit({
  width: 560, height: 120,
  margins: { top: 34, right: 40, bottom: 40, left: 40 },
  // Centred 1-D axis: spine = track, end ticks = caps + labels.
  axes: {
    x: {
      transform: ({ height }) => ({ y: height / 2 }),
      tickValues: [0, 100],
      tickSize: 7,
      stroke: "#cbd5e1",
      fill: "#334155",
      fontSize: 12,
    },
    y: false,
  },
  data: [{ value: 40 }],
  schema: { value: { type: "quantitative", domain: [0, 100] } },
  constraints: [
    clamp({ min: 0, max: 100, field: "value" }),
    snap({ field: "value", step: 5, origin: 0 }),
  ],
  guides: [ prompt("How likely is it? (%)") ],
  features: [
    point({
      id: "slider",
      size: 9,
      fill: "#2563eb",
      channels: {
        x: { field: "value",
             edit: drag({ pick: "probe", advance: false }) },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'matrix',
            title: 'Question matrix',
            intro: 'Band y of questions × band x of options. toggle() on the (x, y) tuple names a cell; unique({ field: "question", replace }) keeps one answer per row.',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'The cell grid is a guide, so it never swallows the click.',
                    try: 'answer each row; click a row again elsewhere to change it.',
                    code:
`mount(Elicit(widgets.matrix({
  question: "Rate each aspect",
  questions: ["Speed","Cost","Support"],
  options: ["Poor","OK","Good","Great"],
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'Two band axes + toggle + unique; cellGrid defined inline.',
                    try: 'same look — change pad, fills, or the accent.',
                    code:
`const questions = ["Speed","Cost","Support"];
const options = ["Poor","OK","Good","Great"];
const margins = { top: 62, right: 30, bottom: 20, left: 130 };
const height = 100 + questions.length * 46;
const innerHeight = height - margins.top - margins.bottom;

const prompt = (text, y = -18) => guides.custom(() => [{
  type: "text", x: 0, y, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const cellGrid = (pad = 3) => guides.custom((ctx) => {
  const cols = ctx.scales.x.domainConfig || [];
  const rows = ctx.scales.y.domainConfig || [];
  const bw = ctx.scales.x.bandwidth();
  const bh = ctx.scales.y.bandwidth();
  const nodes = [];
  for (const r of rows) {
    for (const c of cols) {
      nodes.push({
        type: "rect",
        x: ctx.scales.x.encode(c) - bw / 2 + pad,
        y: ctx.scales.y.encode(r) - bh / 2 + pad,
        width: bw - 2 * pad,
        height: bh - 2 * pad,
        fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: 1,
      });
    }
  }
  for (const c of cols) {
    nodes.push({
      type: "text", x: ctx.scales.x.encode(c), y: -14, text: String(c),
      textAnchor: "middle", fontSize: 12, fill: "#334155",
    });
  }
  for (const r of rows) {
    nodes.push({
      type: "text", x: -10, y: ctx.scales.y.encode(r) + 4, text: String(r),
      textAnchor: "end", fontSize: 12, fill: "#334155",
    });
  }
  return nodes;
});

mount(Elicit({
  width: 620, height, margins,
  axes: false,
  data: [],
  schema: {
    option:   { type: "ordinal", domain: options },
    question: { type: "categorical", domain: questions },
  },
  scales: {
    x: { type: "band" },
    // Top-down questionnaire: pin y so the first row is at the top.
    y: { type: "band", range: [0, innerHeight] },
  },
  constraints: [ unique({ field: "question", strategy: "replace" }) ],
  guides: [ prompt("Rate each aspect", -38), cellGrid() ],
  features: [
    point({
      id: "matrix",
      size: 8,
      fill: "#2563eb",
      channels: {
        x: { field: "option" },
        y: { field: "question" },
      },
      edits: [ toggle({ pick: "probe", channels: ["x", "y"], advance: false }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'linecone',
            title: 'Line + Cone',
            intro:
                'The two-step correlation instrument: aim the line and click, open the cone and click. ' +
                'getData() → [{ r, spread }]. The crosshair frame can be a guide, or two centred axes ' +
                'with ticks only at the ends — same idea, axis usually simpler.',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'Crosshair frame and high/low variable labels are guides.',
                    try: 'move, click, move, click.',
                    code:
`const chart = Elicit(widgets.lineCone({
  question: "What is the relationship?",
  x: "Exercise amount", y: "Body weight",
}));
mount(chart);
const out = document.createElement("div");
out.style.cssText = "font:12px ui-monospace,monospace;color:#64748b";
const show = () => {
  const d = chart.getData()[0];
  out.textContent = "stage " + chart.getStage() +
    "  ·  r=" + d.r.toFixed(2) + "  spread=" + d.spread.toFixed(2);
};
chart.on("change", show); chart.on("stage", show); show();
mount(out);`,
                },
                {
                    title: 'Plain API — crosshair as a guide',
                    blurb: 'Full control: multi-line side labels, exact placement. More code.',
                    try: 'same look and two-step flow as the widget.',
                    code:
`const prompt = (text, y = -18) => guides.custom(() => [{
  type: "text", x: 0, y, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const crosshair = ({ x, y }) => guides.custom((ctx) => {
  const cx = ctx.width / 2, cy = ctx.height / 2;
  const t = (px, py, text, anchor) => ({
    type: "text", x: px, y: py, text, textAnchor: anchor,
    fontSize: 12, fill: "#334155",
  });
  const lineH = 14;
  const side = (px, extreme, anchor) => {
    const lines = [...String(x).split(/\\s+/), "(" + extreme + ")"];
    const top = cy - ((lines.length - 1) * lineH) / 2;
    return lines.map((word, i) => t(px, top + i * lineH + 4, word, anchor));
  };
  return [
    { type: "line", x1: 0, y1: cy, x2: ctx.width, y2: cy,
      stroke: "#cbd5e1", strokeWidth: 1, background: true },
    { type: "line", x1: cx, y1: 0, x2: cx, y2: ctx.height,
      stroke: "#cbd5e1", strokeWidth: 1, background: true },
    ...side(ctx.width + 10, "high", "start"),
    ...side(-10, "low", "end"),
    t(cx, -8, y + " (high)", "middle"),
    t(cx, ctx.height + 20, y + " (low)", "middle"),
  ];
});

const chart = Elicit({
  width: 460, height: 400,
  margins: { top: 56, right: 92, bottom: 52, left: 92 },
  axes: false,
  data: [{ r: 0, spread: 0 }],
  schema: {
    r:      { type: "quantitative", domain: [-1, 1], default: 0 },
    spread: { type: "quantitative", domain: [0, 1], default: 0 },
  },
  guides: [
    prompt("What is the relationship?", -32),
    crosshair({ x: "Exercise amount", y: "Body weight" }),
  ],
  features: [
    cone({
      id: "lineCone",
      channels: {
        angle: {
          field: "r",
          scale: { range: [-45, 45] },
          edit: rotate({ pick: "probe", stage: 0 }),
        },
        spread: {
          field: "spread",
          scale: { range: [0, 45] },
          edit: rotate({ pick: "probe", stage: 1, relativeTo: "angle" }),
        },
      },
    }),
  ],
});
mount(chart);`,
                },
                {
                    title: 'Plain API — crosshair as centred axes',
                    blurb:
                        'Declare frame scales x/y (not elicited). Centre each axis with transform; ' +
                        'tickValues at the ends + tickFormat are the high/low labels. Tick data from ' +
                        'the scale; drawing still goes through the renderer (no d3.axis).',
                    try: 'same two-step flow — labels are end ticks.',
                    code:
`const prompt = (text, y = -18) => guides.custom(() => [{
  type: "text", x: 0, y, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const chart = Elicit({
  width: 460, height: 400,
  margins: { top: 56, right: 100, bottom: 52, left: 100 },
  // Frame axes: spine through the centre, labels only at the ends.
  axes: {
    x: {
      transform: ({ height }) => ({ y: height / 2 }),
      tickValues: [-1, 1],
      tickFormat: (v) => v < 0 ? "Exercise amount (low)" : "Exercise amount (high)",
      tickSize: 0,
      stroke: "#cbd5e1",
      fill: "#334155",
      fontSize: 12,
    },
    y: {
      transform: ({ width }) => ({ x: width / 2 }),
      tickValues: [-1, 1],
      tickFormat: (v) => v < 0 ? "Body weight (low)" : "Body weight (high)",
      tickSize: 0,
      stroke: "#cbd5e1",
      fill: "#334155",
      fontSize: 12,
    },
  },
  // x/y are frame scales for the crosshair — not part of the belief.
  data: [{ r: 0, spread: 0, x: 0, y: 0 }],
  schema: {
    r:      { type: "quantitative", domain: [-1, 1], default: 0 },
    spread: { type: "quantitative", domain: [0, 1], default: 0 },
    x:      { type: "quantitative", domain: [-1, 1] },
    y:      { type: "quantitative", domain: [-1, 1] },
  },
  guides: [ prompt("What is the relationship?", -32) ],
  features: [
    // Registers the frame scales (schema domains). No edit → pointer-transparent.
    point({
      size: 0, opacity: 0,
      channels: { x: { field: "x" }, y: { field: "y" } },
    }),
    cone({
      id: "lineCone",
      channels: {
        angle: {
          field: "r",
          scale: { range: [-45, 45] },
          edit: rotate({ pick: "probe", stage: 0 }),
        },
        spread: {
          field: "spread",
          scale: { range: [0, 45] },
          edit: rotate({ pick: "probe", stage: 1, relativeTo: "angle" }),
        },
      },
    }),
  ],
});
mount(chart);`,
                },
                {
                    title: 'Plain API — axes for the frame, guides for labels',
                    blurb:
                        'Axes draw only the crossing spines (no ticks). Labels stay a small guide — ' +
                        'useful when you want wrapped / multi-line copy the axis tickFormat cannot do.',
                    try: 'same flow; spines from axes, labels from a guide.',
                    code:
`const prompt = (text, y = -18) => guides.custom(() => [{
  type: "text", x: 0, y, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const frameLabels = ({ x, y }) => guides.custom((ctx) => {
  const cx = ctx.width / 2, cy = ctx.height / 2;
  const t = (px, py, text, anchor) => ({
    type: "text", x: px, y: py, text, textAnchor: anchor,
    fontSize: 12, fill: "#334155",
  });
  return [
    t(-10, cy, x + " (low)", "end"),
    t(ctx.width + 10, cy, x + " (high)", "start"),
    t(cx, -8, y + " (high)", "middle"),
    t(cx, ctx.height + 20, y + " (low)", "middle"),
  ];
});

const chart = Elicit({
  width: 460, height: 400,
  margins: { top: 56, right: 100, bottom: 52, left: 100 },
  axes: {
    x: {
      transform: ({ height }) => ({ y: height / 2 }),
      tickValues: [],          // spine only — labels come from the guide
      stroke: "#cbd5e1",
    },
    y: {
      transform: ({ width }) => ({ x: width / 2 }),
      tickValues: [],
      stroke: "#cbd5e1",
    },
  },
  data: [{ r: 0, spread: 0, x: 0, y: 0 }],
  schema: {
    r:      { type: "quantitative", domain: [-1, 1], default: 0 },
    spread: { type: "quantitative", domain: [0, 1], default: 0 },
    x:      { type: "quantitative", domain: [-1, 1] },
    y:      { type: "quantitative", domain: [-1, 1] },
  },
  guides: [
    prompt("What is the relationship?", -32),
    frameLabels({ x: "Exercise amount", y: "Body weight" }),
  ],
  features: [
    point({
      size: 0, opacity: 0,
      channels: { x: { field: "x" }, y: { field: "y" } },
    }),
    cone({
      id: "lineCone",
      channels: {
        angle: {
          field: "r",
          scale: { range: [-45, 45] },
          edit: rotate({ pick: "probe", stage: 0 }),
        },
        spread: {
          field: "spread",
          scale: { range: [0, 45] },
          edit: rotate({ pick: "probe", stage: 1, relativeTo: "angle" }),
        },
      },
    }),
  ],
});
mount(chart);`,
                },
            ],
        },
        {
            id: 'styles',
            title: 'Customizing styles',
            intro:
                'The instrument look is just guides + mark paint. Change colours in the inline ' +
                'guide helpers, paint the answer mark differently, or replace the affordance ' +
                'entirely with your own <code class="inline">guides.custom</code>. Behaviour ' +
                '(edits / constraints) stays put.',
            examples: [
                {
                    title: 'Override just the answer mark',
                    blurb: 'Same rings as the Likert twin; only the committed answer is recoloured.',
                    try: 'click an option — amber dot in slate rings.',
                    code:
`const options = ["Low", "Medium", "High"];
const radius = 11;

const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#0f172a",
}]);

const optionRings = () => guides.custom((ctx) => {
  const cats = ctx.scales.x.domainConfig || [];
  const cy = ctx.height / 2;
  const cxOf = (c) => ctx.scales.x.encode(c);
  const nodes = [];
  for (let i = 0; i < cats.length - 1; i++) {
    nodes.push({
      type: "line",
      x1: cxOf(cats[i]) + radius, y1: cy,
      x2: cxOf(cats[i + 1]) - radius, y2: cy,
      stroke: "#e2e8f0", strokeWidth: 3, background: true,
    });
  }
  for (const c of cats) {
    nodes.push({
      type: "circle", cx: cxOf(c), cy, r: radius,
      fill: "none", stroke: "#cbd5e1", strokeWidth: 1.5,
    });
    nodes.push({
      type: "text", x: cxOf(c), y: cy + 30, text: String(c),
      textAnchor: "middle", fontSize: 12, fill: "#334155",
    });
  }
  return nodes;
});

mount(Elicit({
  width: 480, height: 130,
  margins: { top: 34, right: 48, bottom: 44, left: 48 },
  axes: false,
  data: [],
  schema: { choice: { type: "ordinal", domain: options } },
  scales: { x: { type: "band" } },
  constraints: [ count({ max: 1, strategy: "replace" }) ],
  guides: [ prompt("Confidence"), optionRings() ],
  features: [
    point({
      size: 10,
      fill: "#b45309",
      stroke: "#92400e",
      strokeWidth: 1.5,
      channels: { x: { field: "choice" } },
      edits: [ create({ pick: "probe", channels: ["x"], advance: false }) ],
    }),
  ],
}));`,
                },
                {
                    title: 'Swap the affordance guide',
                    blurb:
                        'Replace rings with your own ticks — same mark/edit/constraint, different clothing. ' +
                        'Guide nodes never capture the pointer.',
                    try: 'click a tick — interaction unchanged, look is yours.',
                    code:
`const options = ["A", "B", "C", "D"];
mount(Elicit({
  width: 480, height: 110,
  margins: { top: 28, right: 40, bottom: 36, left: 40 },
  axes: false,
  data: [],
  schema: { choice: { type: "ordinal", domain: options } },
  scales: { x: { type: "band" } },
  constraints: [ count({ max: 1, strategy: "replace" }) ],
  guides: [
    guides.custom((ctx) => {
      const cats = ctx.scales.x.domainConfig || [];
      const cy = ctx.height / 2;
      return cats.flatMap((c) => {
        const cx = ctx.scales.x.encode(c);
        return [
          { type: "line", x1: cx, y1: cy - 14, x2: cx, y2: cy + 14,
            stroke: "#94a3b8", strokeWidth: 2, background: true },
          { type: "text", x: cx, y: cy + 28, text: String(c),
            textAnchor: "middle", fontSize: 12, fill: "#475569" },
        ];
      });
    }),
  ],
  features: [
    point({
      size: 9, fill: "#4f46e5",
      channels: { x: { field: "choice" } },
      edits: [ create({ pick: "probe", channels: ["x"], advance: false }) ],
    }),
  ],
}));`,
                },
                {
                    title: 'Retheme in the guide helpers',
                    blurb:
                        'Colours live in the inline guides and the mark fill — change them there. ' +
                        'No shared palette required.',
                    try: 'hover and click — teal rings, teal answer.',
                    code:
`const options = ["No", "Maybe", "Yes"];
const radius = 11;

const prompt = (text) => guides.custom(() => [{
  type: "text", x: 0, y: -18, text,
  textAnchor: "start", fontSize: 13, fill: "#134e4a",
}]);

const optionRings = () => guides.custom((ctx) => {
  const cats = ctx.scales.x.domainConfig || [];
  const cy = ctx.height / 2;
  const cxOf = (c) => ctx.scales.x.encode(c);
  const nodes = [];
  for (let i = 0; i < cats.length - 1; i++) {
    nodes.push({
      type: "line",
      x1: cxOf(cats[i]) + radius, y1: cy,
      x2: cxOf(cats[i + 1]) - radius, y2: cy,
      stroke: "#ccfbf1", strokeWidth: 3, background: true,
    });
  }
  for (const c of cats) {
    nodes.push({
      type: "circle", cx: cxOf(c), cy, r: radius,
      fill: "none", stroke: "#99f6e4", strokeWidth: 1.5,
    });
    nodes.push({
      type: "text", x: cxOf(c), y: cy + 30, text: String(c),
      textAnchor: "middle", fontSize: 12, fill: "#115e59",
    });
  }
  return nodes;
});

mount(Elicit({
  width: 480, height: 130,
  margins: { top: 34, right: 48, bottom: 44, left: 48 },
  axes: false,
  data: [],
  schema: { choice: { type: "ordinal", domain: options } },
  scales: { x: { type: "band" } },
  constraints: [ count({ max: 1, strategy: "replace" }) ],
  guides: [ prompt("A rethemed Likert"), optionRings() ],
  features: [
    point({
      size: radius - 3,
      fill: "#0d9488",
      channels: { x: { field: "choice" } },
      edits: [ create({ pick: "probe", channels: ["x"], advance: false }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'more',
            title: 'More instruments',
            intro: 'Ranking, allocation, tokens, intervals, histograms, regions, thermometers, and labeled values — each a recipe over marks + edits + constraints.',
            examples: [
                {
                    title: 'Ranking',
                    blurb: 'Drag items to reorder (edit.rank under the hood).',
                    try: '<b>Drag</b> a dot up or down to swap ranks.',
                    code:
`mount(Elicit(widgets.ranking({
  question: "Rank these priorities",
  items: ["Cost", "Speed", "Quality", "Risk"],
})));`,
                },
                {
                    title: 'Allocation',
                    blurb: 'Bars that redistribute to keep a fixed sum.',
                    try: '<b>Drag</b> a bar — siblings rebalance to 100.',
                    code:
`mount(Elicit(widgets.allocation({
  question: "Allocate 100 points",
  categories: ["A", "B", "C", "D"],
  targetSum: 100,
})));`,
                },
                {
                    title: 'Region',
                    blurb: 'rect + brushRect for a 2-D belief box.',
                    try: '<b>Drag</b> edges, corners, or the body.',
                    code:
`mount(Elicit(widgets.region({
  question: "Where do you expect the outcome?",
})));`,
                },
                {
                    title: 'Interval / CI',
                    blurb: 'Drag the mean to translate the whole interval; drag a cap to resize one end.',
                    try: '<b>Drag</b> the centre — lo/hi follow. <b>Drag</b> a cap — mean stays put.',
                    code:
`mount(Elicit(widgets.interval({
  question: "Your estimate and range",
  mean: 50, lo: 30, hi: 70,
})));`,
                },
            ],
        },
    ],
};
