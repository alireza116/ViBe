import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/lock",
  "title": "Locked rows (read-only data)",
  "lead": "Some of a chart’s rows are <b>given</b> rather than elicited: the record so far, the points you already measured, last quarter’s actuals. <code class=\"inline\">lock</code> on the spec marks those rows read-only — no gesture can change or delete them — while every row an edit <i>adds</i> stays free. It is the “here is what we know; you supply the rest” policy behind a you-draw-it chart.",
  "api": [
    {
      "name": "ElicitSpec.lock",
      "summary": "Which rows of the chart’s one dataset are read-only. A lock is a property of the <b>data</b> — not of a mark or an edit — so it lives on the spec beside <code class=\"inline\">data</code> and <code class=\"inline\">schema</code>, and holds for every edit from every mark.",
      "signature": "lock: \"seed\" | true | ((datum, index) => boolean)",
      "options": [
        {
          "name": "\"seed\" / true",
          "type": "string | boolean",
          "default": "—",
          "desc": "The rows the chart was <b>seeded</b> with (its <code class=\"inline\">data</code>) are fixed; anything an edit creates is free. <code class=\"inline\">setData</code> re-seeds the chart, so it also re-takes the lock."
        },
        {
          "name": "(datum, index) => boolean",
          "type": "function",
          "default": "—",
          "desc": "Lock rows by what they <b>are</b> — <code class=\"inline\">d => d.kind === \"actual\"</code>, <code class=\"inline\">d => d.year &lt;= 1990</code>. Re-evaluated every render, so a row can be locked by a field an edit writes."
        }
      ],
      "returns": "Two things follow, and both are automatic. <b>Data:</b> a dataset invariant runs on every commit, <i>last</i>, so a lock outranks every other repair — a proposal that touched a locked row keeps its changes to the free rows and snaps the locked ones back (deleting one is rejected outright). <b>Pointer:</b> a locked row’s marks are not grabbable, show no editable cursor, and are skipped by proximity picking — so <code class=\"inline\">nearest</code> / <code class=\"inline\">sweep</code> / <code class=\"inline\">draw</code> never even target one."
    }
  ],
  "sections": [
    {
      "id": "seed",
      "title": "Locked seed, free additions",
      "intro": "lock: \"seed\" fixes exactly the rows you passed as `data`. Everything a `create` mints afterwards is ordinary, editable data — so a scatter plot can show what was observed and collect what you believe, in one dataset.",
      "examples": [
        "editing-lock/scatter-observed-points-yours"
      ]
    },
    {
      "id": "predicate",
      "title": "Locking rows by what they are",
      "intro": "A lock does not have to mean “seeded”. Give it a predicate and it reads the row: the quarters that already happened are actuals, the rest are your forecast — one dataset, one bar mark, two very different kinds of row.",
      "examples": [
        "editing-lock/actuals-forecast"
      ]
    },
    {
      "id": "you-draw-it",
      "title": "You draw it",
      "intro": "The New York Times’ “You Draw It” (2017): the record runs to 1990 and you draw the rest. Both halves are the same dataset, the same line mark, the same y field — the lock is the whole difference between them. Because the seeded line is locked, proximity picking cannot see it: a drag beside it does not grab a frozen line, it starts drawing.",
      "examples": [
        "editing-lock/draw-the-line-for-the-missing-years"
      ]
    }
  ]
};

export default page;
