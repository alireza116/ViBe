// Locked rows (read-only seed data).
export default {
    path: 'editing/lock.html',
    title: 'Locked rows (read-only data)',
    lead:
        'Some of a chart’s rows are <b>given</b> rather than elicited: the record so far, the ' +
        'points you already measured, last quarter’s actuals. <code class="inline">lock</code> on the ' +
        'spec marks those rows read-only — no gesture can change or delete them — while every row an ' +
        'edit <i>adds</i> stays free. It is the “here is what we know; you supply the rest” policy ' +
        'behind a you-draw-it chart.',
    api: [
        {
            name: 'ElicitSpec.lock',
            summary:
                'Which rows of the chart’s one dataset are read-only. A lock is a property of the ' +
                '<b>data</b> — not of a mark or an edit — so it lives on the spec beside ' +
                '<code class="inline">data</code> and <code class="inline">schema</code>, and holds for every ' +
                'edit from every mark.',
            signature: 'lock: "seed" | true | ((datum, index) => boolean)',
            options: [
                { name: '"seed" / true', type: 'string | boolean', default: '—', desc: 'The rows the chart was <b>seeded</b> with (its <code class="inline">data</code>) are fixed; anything an edit creates is free. <code class="inline">setData</code> re-seeds the chart, so it also re-takes the lock.' },
                { name: '(datum, index) => boolean', type: 'function', default: '—', desc: 'Lock rows by what they <b>are</b> — <code class="inline">d => d.kind === "actual"</code>, <code class="inline">d => d.year &lt;= 1990</code>. Re-evaluated every render, so a row can be locked by a field an edit writes.' },
            ],
            returns:
                'Two things follow, and both are automatic. <b>Data:</b> a dataset invariant runs on every ' +
                'commit, <i>last</i>, so a lock outranks every other repair — a proposal that touched a locked ' +
                'row keeps its changes to the free rows and snaps the locked ones back (deleting one is ' +
                'rejected outright). <b>Pointer:</b> a locked row’s marks are not grabbable, show no editable ' +
                'cursor, and are skipped by proximity picking — so <code class="inline">nearest</code> / ' +
                '<code class="inline">sweep</code> / <code class="inline">draw</code> never even target one.',
        },
    ],
    sections: [
        {
            id: 'seed',
            title: 'Locked seed, free additions',
            intro:
                'lock: "seed" fixes exactly the rows you passed as `data`. Everything a `create` mints ' +
                'afterwards is ordinary, editable data — so a scatter plot can show what was observed and ' +
                'collect what you believe, in one dataset.',
            examples: [
                {
                    title: 'Scatter: observed points + yours',
                    blurb: 'The five grey points are the seed — try to drag one and nothing happens. Click to add your own, and those you can move and delete.',
                    try: '<b>Click</b> empty space to add a point · <b>drag</b> one of yours · <b>Alt-click</b> one of yours to remove it. The grey points never move.',
                    code:
`mount(Elicit({
  width: 400, height: 300,
  margins: { top: 16, right: 16, bottom: 32, left: 40 },
  schema: {
    x: { type: "quantitative", domain: [0, 10] },
    y: { type: "quantitative", domain: [0, 10] },
    // A schema \`default\` populates a field on a row an edit MINTS — so every
    // point you add is tagged "yours" without create() saying a word about it.
    source: { type: "categorical", domain: ["observed", "yours"],
              default: "yours" },
  },
  data: [
    { x: 1.2, y: 2.4, source: "observed" },
    { x: 2.6, y: 3.1, source: "observed" },
    { x: 3.4, y: 4.6, source: "observed" },
    { x: 4.1, y: 4.2, source: "observed" },
    { x: 5.3, y: 6.0, source: "observed" },
  ],
  // The observed rows are given, not elicited.
  lock: "seed",
  axes: { x: { grid: true }, y: { grid: true } },
  features: [
    point({
      size: 7,
      channels: {
        x: { field: "x" },
        y: { field: "y" },
        fill: { field: "source",
                scale: { range: ["#94a3b8", "#4f46e5"] } },
      },
      edits: [
        create({ when: when.noAlt }),     // click empty space -> add
        drag({ channels: ["x", "y"] }),   // drag one of yours in 2D
        remove({ when: when.alt }),       // alt-click -> gone
      ],
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'predicate',
            title: 'Locking rows by what they are',
            intro:
                'A lock does not have to mean “seeded”. Give it a predicate and it reads the row: the ' +
                'quarters that already happened are actuals, the rest are your forecast — one dataset, ' +
                'one bar mark, two very different kinds of row.',
            examples: [
                {
                    title: 'Actuals + forecast',
                    blurb: 'lock: (d) => d.kind === "actual". The two grey bars are reported; only the forecast bars take a drag.',
                    try: '<b>Drag</b> Q3 / Q4 (blue). Q1 and Q2 are reported — they don’t budge.',
                    code:
`mount(Elicit({
  width: 400, height: 260,
  margins: { top: 16, right: 16, bottom: 30, left: 44 },
  schema: {
    q:    { type: "categorical",  domain: ["Q1", "Q2", "Q3", "Q4"] },
    n:    { type: "quantitative", domain: [0, 100] },
    kind: { type: "categorical",  domain: ["actual", "forecast"] },
  },
  data: [
    { q: "Q1", n: 42, kind: "actual" },
    { q: "Q2", n: 55, kind: "actual" },
    { q: "Q3", n: 50, kind: "forecast" },
    { q: "Q4", n: 50, kind: "forecast" },
  ],
  // The lock is a property of the row, so it reads straight off the data.
  lock: (d) => d.kind === "actual",
  features: [
    barY({
      channels: {
        x: { field: "q" },
        y: { field: "n", edit: drag({ guide: true }) },
        fill: { field: "kind",
                scale: { range: ["#94a3b8", "#4f46e5"] } },
      },
    }),
  ],
}))`,
                },
            ],
        },
        {
            id: 'you-draw-it',
            title: 'You draw it',
            intro:
                'The New York Times’ “You Draw It” (2017): the record runs to 1990 and you draw the rest. ' +
                'Both halves are the same dataset, the same line mark, the same y field — the lock is the ' +
                'whole difference between them. Because the seeded line is locked, proximity picking cannot ' +
                'see it: a drag beside it does not grab a frozen line, it starts drawing.',
            examples: [
                {
                    title: 'Draw the line for the missing years',
                    blurb: 'edit.line.draw({ samples: years }) paints one point per year as the pointer crosses its column. Drag back over the record and it will not budge — the lock repairs those rows and keeps the rest of the stroke.',
                    try: '<b>Drag</b> left-to-right across the empty half to draw 1991–2016, then <b>drag again</b> to refine it. Then press <b>Show me how I did</b>.',
                    code:
`// U.S. motor-vehicle deaths per year (NHTSA/FARS, rounded).
// 1968-1990 is the record; the rest is what you believe happened.
const record = [
  [1968, 52725], [1969, 53543], [1970, 52627], [1971, 52542],
  [1972, 54589], [1973, 54052], [1974, 45196], [1975, 44525],
  [1976, 45523], [1977, 47878], [1978, 50331], [1979, 51093],
  [1980, 51091], [1981, 49301], [1982, 43945], [1983, 42589],
  [1984, 44257], [1985, 43825], [1986, 46087], [1987, 46390],
  [1988, 47087], [1989, 45582], [1990, 44599],
].map(([year, deaths]) => ({ year, deaths }));

const truth = [
  [1991, 41508], [1992, 39250], [1993, 40150], [1994, 40716],
  [1995, 41817], [1996, 42065], [1997, 42013], [1998, 41501],
  [1999, 41717], [2000, 41945], [2001, 42196], [2002, 43005],
  [2003, 42884], [2004, 42836], [2005, 43510], [2006, 42708],
  [2007, 41259], [2008, 37423], [2009, 33883], [2010, 32999],
  [2011, 32479], [2012, 33782], [2013, 32893], [2014, 32744],
  [2015, 35485], [2016, 37806],
].map(([year, deaths]) => ({ year, deaths }));

const chart = mount(Elicit({
  width: 560, height: 340,
  margins: { top: 20, right: 24, bottom: 32, left: 56 },
  schema: {
    year:   { type: "quantitative", domain: [1968, 2016] },
    deaths: { type: "quantitative", domain: [0, 60000] },
  },
  data: record,
  lock: "seed",   // the record is fact: undraggable, unsweepable, unpickable
  axes: {
    x: { tickFormat: "d",  grid: true },
    y: { tickFormat: "~s", grid: true },
  },
  // Stage 0 = you draw. Stage 1 = the answer is on screen, drawing is over.
  stageLabels: ["draw", "revealed"],
  guides: [
    // The years you were given (the NYT's grey box).
    guides.region({ x: [1968, 1990], fill: "#94a3b8", opacity: 0.12 }),
    // The endpoint readouts.
    guides.custom(({ data, scales }) => [1968, 1990]
      .map((y) => data.find((d) => d.year === y))
      .filter(Boolean)
      .map((d) => ({
        type: "text", text: d3.format(",")(d.deaths),
        x: scales.x.encode(d.year), y: scales.y.encode(d.deaths) - 12,
        fontSize: 12, textAnchor: "middle", fill: "#0f172a",
      }))),
    // The answer key. Not data — it is not elicited, so it is a guide, and it
    // stays out of getData(). It appears when the chart advances to stage 1.
    guides.custom(({ scales, stage }) => stage < 1 ? [] : [{
      type: "path", fill: "none", stroke: "#e8833a", strokeWidth: 2.5,
      points: truth.map((d) => [scales.x.encode(d.year),
                                scales.y.encode(d.deaths)]),
    }]),
  ],
  features: [
    lineY({
      stroke: "#7f9dc9", strokeWidth: 3, curve: "catmullRom", handleSize: 3,
      channels: {
        x: { field: "year" },
        y: { field: "deaths" },
      },
      // One drag per year column. \`stage: 0\` retires the edit once you've asked
      // to see the answer.
      edits: [ edit.line.draw({ samples: d3.range(1991, 2017), stage: 0 }) ],
    }),
  ],
}));

const btn = mount(document.createElement("button"));
btn.textContent = "Show me how I did.";
btn.onclick = () => chart.nextStage();`,
                },
            ],
        },
    ],
};
