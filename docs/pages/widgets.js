// Widgets — higher-level named elicitations, and the plain-API twin of each.
export default {
    path: 'widgets.html',
    title: 'Widgets',
    lead:
        'Opinionated <b>survey instruments</b> — option rings, cell grids, tracks — each a pure ' +
        'recipe over the core API. They add no interaction surface: the look lives entirely in the ' +
        '<a href="guides.html">guide</a> layer, and the behaviour is a normal mark + a normal edit ' +
        'on the <a href="editing/probe.html">probe</a> driver + a normal constraint. Every example ' +
        'below is shown twice — once as the widget, once assembled from the plain API — to make ' +
        'the point that only the guides differ. Each factory returns an <b>ElicitSpec</b>: render ' +
        'with <code class="inline">Elicit(widgets.likert({…}))</code>.',
    api: [
        {
            name: 'widgets.likert · multipleChoice · slider · matrix · lineCone',
            summary: 'Import from <code class="inline">vibe.widgets</code>. Each returns an ElicitSpec; pass it straight to <code class="inline">Elicit</code>. The chart elicits one dataset, so <code class="inline">getData()</code> reads the answer.',
            signatures: [
                'likert({ question, options, value, onChange }) → ElicitSpec',
                'multipleChoice({ question, options, max, value, onChange }) → ElicitSpec',
                'slider({ question, domain, step, value, format, onChange }) → ElicitSpec',
                'matrix({ question, questions, options, value, onChange }) → ElicitSpec',
                'lineCone({ question, x, y, r, spread, wedge, onChange }) → ElicitSpec',
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
                'An <b>ElicitSpec</b>. The affordance layer is exported too — ' +
                '<code class="inline">widgets.THEME</code>, <code class="inline">optionRings</code>, ' +
                '<code class="inline">cellGrid</code>, <code class="inline">sliderTrack</code>, ' +
                '<code class="inline">crosshair</code>, <code class="inline">prompt</code> — so you can build your own instrument.',
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
  onChange: (d) => console.log("answer:", d[0] && d[0].choice),
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'Identical mark, edit and constraint — default axes instead of rings.',
                    try: 'same interaction, chart clothing.',
                    code:
`const options = ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
mount(Elicit({
  width: 560, height: 130,
  margins: { top: 20, right: 60, bottom: 34, left: 60 },
  axes: { x: {}, y: false },
  data: [],
  schema: {
    choice: { type: "categorical", domain: options },
  },
  scales: { x: { type: "band" } },
  features: [
    point({
      id: "likert",
      channels: { x: { field: "choice" } },
      edits: [ create({ pick: "probe", channels: ["x"], advance: false }) ],
      constraints: [ count({ max: 1, strategy: "replace" }) ],
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
  onChange: (d) => console.log("picks:", d.map(x => x.choice)),
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'toggle + unique + count, on a normal band axis.',
                    code:
`const options = ["Fast","Cheap","Reliable","Simple"];
mount(Elicit({
  width: 560, height: 130,
  margins: { top: 20, right: 60, bottom: 34, left: 60 },
  axes: { x: {}, y: false },
  data: [],
  schema: {
    choice: { type: "categorical", domain: options },
  },
  scales: { x: { type: "band" } },
  features: [
    point({
      id: "choice",
      channels: { x: { field: "choice" } },
      edits: [ toggle({ pick: "probe", channels: ["x"], advance: false }) ],
      constraints: [
        unique({ field: "choice", strategy: "reject" }),
        count({ max: 2, strategy: "reject" }),
      ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'slider',
            title: 'Slider',
            intro: 'A single knob that tracks the pointer and settles on click — drag({ pick: "probe" }). snap() lands it on steps.',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'Track, end caps and value labels are guides.',
                    try: 'move across the track, then click.',
                    code:
`mount(Elicit(widgets.slider({
  question: "How likely is it? (%)",
  domain: [0, 100], step: 5, value: 40,
  onChange: (d) => console.log("value:", d[0].value),
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'A point on a linear axis, with clamp + snap.',
                    code:
`mount(Elicit({
  width: 560, height: 130,
  margins: { top: 20, right: 40, bottom: 34, left: 40 },
  axes: { x: {}, y: false },
  data: [{ value: 40 }],
  schema: {
    value: { type: "quantitative", domain: [0, 100] },
  },
  features: [
    point({
      id: "slider",
      channels: { x: { field: "value",
                       edit: drag({ pick: "probe", advance: false }) } },
      constraints: [ clamp({ min: 0, max: 100, field: "value" }), snap({ field: "value", step: 5 }) ],
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
  onChange: (d) => console.log("rows answered:", d.length),
})));`,
                },
                {
                    title: 'The same thing, plain API',
                    blurb: 'Two band axes, one point mark, one toggle, one unique.',
                    code:
`const questions = ["Speed","Cost","Support"];
const options = ["Poor","OK","Good","Great"];
mount(Elicit({
  width: 560, height: 220,
  margins: { top: 24, right: 30, bottom: 30, left: 80 },
  axes: { x: {}, y: {} },
  data: [],
  schema: {
    option:   { type: "categorical", domain: options },
    question: { type: "categorical", domain: questions },
  },
  scales: { x: { type: "band" }, y: { type: "band" } },
  features: [
    point({
      id: "matrix",
      channels: {
        x: { field: "option" },
        y: { field: "question" },
      },
      edits: [ toggle({ pick: "probe", channels: ["x", "y"], advance: false }) ],
      constraints: [ unique({ field: "question", strategy: "replace" }) ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'linecone',
            title: 'Line + Cone',
            intro: 'The two-step correlation instrument: aim the line and click, open the cone and click. getData() → [{ r, spread }].',
            examples: [
                {
                    title: 'As a widget',
                    blurb: 'Crosshair frame and high/low variable labels are guides.',
                    try: 'move, click, move, click.',
                    code:
`const chart = Elicit(widgets.lineCone({
  question: "What is the relationship?",
  x: "Exercise amount", y: "Body weight",
  onChange: (d) => console.log(d[0]),
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
            ],
        },
    ],
};
