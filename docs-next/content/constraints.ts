import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/constraints",
  "title": "Constraints",
  "lead": "A constraint is a pure rule over <b>the dataset</b>. It holds no matter which edit fired it, or which <i>mark</i> that edit was declared on — so an invariant written once gates a drag on a bar and a click on a dot alike. It can both <b>reject</b> a proposal and <b>repair</b> it (return the corrected rows), and because every mark reads those rows, a repair shows up everywhere on the next render. Declare it on the <code class=\"inline\">Elicit</code> spec (<code class=\"inline\">constraints: [...]</code>); declaring it on a mark is sugar — the engine promotes it to the dataset either way. <code class=\"inline\">clamp</code> bounds a field, <code class=\"inline\">maintainSum</code> fixes a total, <code class=\"inline\">count</code> caps the size, and <code class=\"inline\">unique</code> forbids duplicate keys.",
  "api": [
    {
      "name": "Built-in constraints",
      "summary": "Import from <code class=\"inline\">vibe.constraints</code> and pass on the <code class=\"inline\">Elicit</code> spec’s <code class=\"inline\">constraints: [...]</code> (a mark accepts them too, as sugar, and the engine promotes them). All are pure data invariants — they run on every commit and never see pixels.",
      "signatures": [
        "clamp({ min, max, field }) → Constraint",
        "maintainSum({ targetSum, field, mode }) → Constraint",
        "normalize({ field, targetSum }) → Constraint",
        "count({ max, strategy }) → Constraint",
        "unique({ field, max, strategy }) → Constraint",
        "snap({ field, step, origin }) → Constraint"
      ],
      "options": [
        {
          "name": "clamp.min / max",
          "type": "number",
          "default": "field domain",
          "desc": "Bounds the active datum’s field to [min, max]; an omitted bound falls back to the field’s declared domain."
        },
        {
          "name": "clamp.field",
          "type": "string",
          "default": "'y'",
          "desc": "The data field to bound."
        },
        {
          "name": "maintainSum.targetSum",
          "type": "number",
          "default": "—",
          "desc": "Target total for the field."
        },
        {
          "name": "maintainSum.mode",
          "type": "'cap' | 'normalize' | 'redistribute'",
          "default": "'cap'",
          "desc": "<code class=\"inline\">cap</code> bounds the touched datum (≤ sum); <code class=\"inline\">normalize</code> scales all values to exact sum; <code class=\"inline\">redistribute</code> holds the edited value and proportionally adjusts siblings."
        },
        {
          "name": "normalize",
          "type": "sugar",
          "default": "—",
          "desc": "Shortcut for <code class=\"inline\">maintainSum({ mode: \"normalize\", targetSum: 1 })</code>."
        },
        {
          "name": "count.max",
          "type": "number",
          "default": "∞",
          "desc": "Maximum number of data rows."
        },
        {
          "name": "count.strategy",
          "type": "'replace' | 'reject'",
          "default": "'replace'",
          "desc": "Over the limit: drop the oldest (keep newest max) or refuse the interaction."
        },
        {
          "name": "unique.field",
          "type": "string | string[]",
          "default": "'x'",
          "desc": "Category key(s); an array makes a composite (per-cell) key."
        },
        {
          "name": "unique.max / strategy",
          "type": "number / string",
          "default": "1 / 'reject'",
          "desc": "How many may share a key, and whether to reject or replace the resident."
        },
        {
          "name": "snap.step / origin",
          "type": "number",
          "default": "—",
          "desc": "Quantize the field to a grid (slider steps, waffle cells)."
        }
      ],
      "returns": "Each returns a <b>Constraint</b> — a reducer the engine runs on the proposed dataset after every edit."
    },
    {
      "name": "constraints.define(reducer, meta?)",
      "summary": "Author your own (aliased <code class=\"inline\">constraints.custom</code>). The reducer gets a pure-data context and returns the shape that’s natural.",
      "signature": "constraints.define(({ data, oldData, activeIndex, active, field, value, domain }) => result, meta?) → Constraint",
      "options": [
        {
          "name": "return number",
          "type": "—",
          "default": "—",
          "desc": "The constrained value for the active datum’s <code class=\"inline\">field</code>."
        },
        {
          "name": "return object",
          "type": "—",
          "default": "—",
          "desc": "Fields merged into the active datum."
        },
        {
          "name": "return array",
          "type": "—",
          "default": "—",
          "desc": "A full replacement dataset (cross-datum rules: sum, unique, count)."
        },
        {
          "name": "return false",
          "type": "—",
          "default": "—",
          "desc": "Reject the whole interaction."
        },
        {
          "name": "return true / undefined",
          "type": "—",
          "default": "—",
          "desc": "Accept unchanged."
        },
        {
          "name": "meta.field",
          "type": "string",
          "default": "'y'",
          "desc": "The field the invariant governs (for value rules + guides)."
        },
        {
          "name": "meta.guide",
          "type": "function",
          "default": "—",
          "desc": "Optional drawer so an edit with <code class=\"inline\">guide:true</code> can show this constraint’s bounds."
        }
      ],
      "returns": "A <b>Constraint</b>. The <code class=\"inline\">ctx.active</code> is the datum the gesture touched; <code class=\"inline\">domain</code> is that field’s declared data range."
    }
  ],
  "sections": [
    {
      "id": "sum",
      "title": "maintainSum — a total held at 100",
      "intro": "The sum rule is a dataset invariant, so it holds for every edit from every mark. Bars give way to keep the total at 100; guide: true draws the live bound.",
      "examples": [
        "constraints/bars-that-compensate"
      ]
    },
    {
      "id": "clamp",
      "title": "clamp — bound a field",
      "intro": "clamp holds a field inside [min, max]. Pair it with a nearest pick and a self-drawn guide to make the bounds visible while dragging.",
      "examples": [
        "constraints/clamped-drag-with-a-guide"
      ]
    },
    {
      "id": "unique",
      "title": "unique — one per key",
      "intro": "unique forbids two data with the same key. A single field guards one axis; an array is a composite key — at most one mark per cell, for both create and move.",
      "examples": [
        "constraints/one-bar-per-category",
        "constraints/composite-key-a-band-band-grid"
      ]
    }
  ]
};

export default page;
