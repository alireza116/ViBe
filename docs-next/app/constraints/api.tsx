import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Built-in constraints",
    summary: (
      <>
        Import from <code className="inline">vibe.constraints</code> and pass on the <code className="inline">Elicit</code> spec’s <code className="inline">constraints: [...]</code> (a mark accepts them too, as sugar, and the engine promotes them). All are pure data invariants — they run on every commit and never see pixels.
      </>
    ),
    signatures: [
      "clamp({ min, max, field }) → Constraint",
      "maintainSum({ targetSum, field, mode }) → Constraint",
      "normalize({ field, targetSum }) → Constraint",
      "count({ max, strategy }) → Constraint",
      "unique({ field, max, strategy }) → Constraint",
      "snap({ field, step, origin }) → Constraint",
      "ordering({ fields, lower, upper, mode }) → Constraint",
      "monotonic({ field, along, dir, series }) → Constraint",
      "spacing({ field, min, series }) → Constraint",
    ],
    options: [
      {
        name: "clamp.min / max",
        type: "number",
        default: "field domain",
        desc: "Bounds the active datum’s field to [min, max]; an omitted bound falls back to the field’s declared domain.",
      },
      {
        name: "clamp.field",
        type: "string",
        default: "'y'",
        desc: "The data field to bound.",
      },
      {
        name: "maintainSum.targetSum",
        type: "number",
        default: "—",
        desc: "Target total for the field.",
      },
      {
        name: "maintainSum.mode",
        type: "'cap' | 'normalize' | 'redistribute'",
        default: "'cap'",
        desc: (
          <>
            <code className="inline">cap</code> bounds the touched datum (≤ sum); <code className="inline">normalize</code> scales all values to exact sum; <code className="inline">redistribute</code> holds the edited value and proportionally adjusts siblings.
          </>
        ),
      },
      {
        name: "normalize",
        type: "sugar",
        default: "—",
        desc: (
          <>
            Shortcut for <code className="inline">maintainSum({'{'} mode: "normalize", targetSum: 1 {'}'})</code>.
          </>
        ),
      },
      {
        name: "count.max",
        type: "number",
        default: "∞",
        desc: "Maximum number of data rows.",
      },
      {
        name: "count.strategy",
        type: "'replace' | 'reject'",
        default: "'replace'",
        desc: "Over the limit: drop the oldest (keep newest max) or refuse the interaction.",
      },
      {
        name: "unique.field",
        type: "string | string[]",
        default: "'x'",
        desc: "Category key(s); an array makes a composite (per-cell) key.",
      },
      {
        name: "unique.max / strategy",
        type: "number / string",
        default: "1 / 'reject'",
        desc: "How many may share a key, and whether to reject or replace the resident.",
      },
      {
        name: "snap.step / origin",
        type: "number",
        default: "—",
        desc: "Quantize the field to a grid (slider steps, waffle cells).",
      },
      {
        name: "ordering.fields",
        type: "string[]",
        default: "—",
        desc: (
          <>
            Fields of one row that must stay in this order — <code className="inline">["lo", "mean", "hi"]</code> means lo ≤ mean ≤ hi. <code className="inline">lower</code>/<code className="inline">upper</code> are sugar for the two-field case.
          </>
        ),
      },
      {
        name: "ordering.mode",
        type: "'push' | 'block'",
        default: "'push'",
        desc: (
          <>
            <code className="inline">push</code> repairs — the field you dragged wins and its neighbours give way, so the interval <i>moves</i>. <code className="inline">block</code> rejects instead, for an elicitation where the bounds are given and only the estimate inside them moves.
          </>
        ),
      },
      {
        name: "monotonic.field / along",
        type: "string",
        default: "'y' / 'x'",
        desc: (
          <>
            The value that may never reverse, and the axis it runs along. Where <code className="inline">ordering</code> keeps <b>fields</b> of one row in order, this keeps <b>rows</b> in order along an axis. Rows are sorted by <code className="inline">along</code>, not by array position, so an appended anchor lands in the right place.
          </>
        ),
      },
      {
        name: "monotonic.dir",
        type: "'up' | 'down'",
        default: "'up'",
        desc: (
          <>
            <code className="inline">up</code> = non-decreasing (a CDF, a budget burning up); <code className="inline">down</code> = non-increasing (a survival curve).
          </>
        ),
      },
      {
        name: "spacing.field / min",
        type: "string / number",
        default: "'x' / 1",
        desc: (
          <>
            Adjacent values of <code className="inline">field</code> stay at least <code className="inline">min</code> apart, in <b>data</b> units — never pixels. Implies an order too (pushing apart preserves the sort), so a field with <code className="inline">spacing</code> needs no <code className="inline">ordering</code>.
          </>
        ),
      },
      {
        name: "monotonic.series / spacing.series",
        type: "string | null",
        default: "null",
        desc: "Group rows by this field first, so each line of a multi-series chart is judged on its own.",
      },
    ],
    returns: (
      <>
        Each returns a <b>Constraint</b> — a reducer the engine runs on the proposed dataset after every edit.
      </>
    ),
  },
  {
    name: "constraints.define(reducer, meta?)",
    summary: (
      <>
        Author your own (aliased <code className="inline">constraints.custom</code>). The reducer gets a pure-data context and returns the shape that’s natural.
      </>
    ),
    signatures: [
      "constraints.define(({ data, oldData, activeIndex, active, field, value, domain }) => result, meta?) → Constraint",
    ],
    options: [
      {
        name: "return number",
        type: "—",
        default: "—",
        desc: (
          <>
            The constrained value for the active datum’s <code className="inline">field</code>.
          </>
        ),
      },
      {
        name: "return object",
        type: "—",
        default: "—",
        desc: "Fields merged into the active datum.",
      },
      {
        name: "return array",
        type: "—",
        default: "—",
        desc: "A full replacement dataset (cross-datum rules: sum, unique, count).",
      },
      {
        name: "return false",
        type: "—",
        default: "—",
        desc: "Reject the whole interaction.",
      },
      {
        name: "return true / undefined",
        type: "—",
        default: "—",
        desc: "Accept unchanged.",
      },
      {
        name: "meta.field",
        type: "string",
        default: "'y'",
        desc: "The field the invariant governs (for value rules + guides).",
      },
      {
        name: "meta.guide",
        type: "function",
        default: "—",
        desc: (
          <>
            Optional drawer so an edit with <code className="inline">guide:true</code> can show this constraint’s bounds.
          </>
        ),
      },
    ],
    returns: (
      <>
        A <b>Constraint</b>. The <code className="inline">ctx.active</code> is the datum the gesture touched; <code className="inline">domain</code> is that field’s declared data range.
      </>
    ),
  },
];
