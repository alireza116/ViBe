import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/editing/history",
  "title": "History & keyboard",
  "lead": "An elicitation is someone’s belief being <i>drafted</i>, so “take that back” is a primitive rather than a nicety — a person who cannot undo a slip stops exploring and starts being careful, which is the opposite of what you asked them for. <code class=\"inline\">undo()</code> / <code class=\"inline\">redo()</code> step the chart’s dataset a <b>gesture</b> at a time. The same reasoning covers the keyboard: a value someone can only set by dragging is a value some people cannot set at all, so every mark that takes a drag also takes <b>arrow keys</b>, through the same edit and the same constraints. Neither is a mode, an option, or a plugin — both are simply on.",
  "api": [
    {
      "name": "chart.undo() · chart.redo()",
      "summary": "On the element <code class=\"inline\">Elicit</code> returns. Snapshots, not inverse operations: an edit’s <code class=\"inline\">apply()</code> is already a pure data → data function, so the state <i>before</i> it is the undo, and no edit ever has to describe how to reverse itself.",
      "signatures": [
        "chart.undo() → boolean",
        "chart.redo() → boolean",
        "chart.canUndo() → boolean",
        "chart.canRedo() → boolean"
      ],
      "options": [
        {
          "name": "the unit is a gesture",
          "type": "—",
          "default": "—",
          "desc": "A drag commits on every pointermove, so a per-commit history would replay the drag backwards one pixel at a time. A transaction opens when a gesture starts and closes when it ends; the first commit inside it records the pre-gesture state, once. A click, a keyboard nudge, and a typed commit are each their own step."
        },
        {
          "name": "undo() / redo()",
          "type": "→ boolean",
          "default": "—",
          "desc": "Whether it actually moved — <code class=\"inline\">false</code> at the end of the stack. Both fire the ordinary <code class=\"inline\">change</code> notification: downstream, an undo is just the data changing."
        },
        {
          "name": "canUndo() / canRedo()",
          "type": "→ boolean",
          "default": "—",
          "desc": "For a button’s disabled state. Re-check them on <code class=\"inline\">change</code>, which fires for edits, undo and redo alike."
        },
        {
          "name": "what a snapshot holds",
          "type": "data + schema + size",
          "default": "—",
          "desc": "Not just the rows. <code class=\"inline\">edit.axis.*</code> writes the schema’s <b>domain</b> and can grow the chart, so undoing a category-add has to put the domain, the rows <i>and</i> the size back."
        },
        {
          "name": "a new edit drops the redo branch",
          "type": "—",
          "default": "—",
          "desc": "The usual linear-history rule: undo twice, then edit, and the future you undid past is gone."
        },
        {
          "name": "setData() clears it",
          "type": "—",
          "default": "—",
          "desc": "A reseed is a new starting point, not an edit — there is nothing sensible to undo back to, and undoing past it would resurrect rows the caller replaced, under a <a href=\"/editing/lock\">lock</a> that no longer covers them."
        },
        {
          "name": "depth",
          "type": "100 gestures",
          "default": "—",
          "desc": "The oldest step falls off the end."
        }
      ],
      "returns": "History is <b>per chart</b> and lives on the element, so a page of several charts gives each its own — which is what you want when they elicit different questions."
    },
    {
      "name": "Keyboard editing",
      "summary": "There is no option for this. Any node carrying a direct edit is focusable (<code class=\"inline\">tabindex=0</code>, <code class=\"inline\">role=\"button\"</code>), and an arrow key on it dispatches a <b>nudge</b> that goes through the edit’s own <code class=\"inline\">apply()</code> — so the keyboard cannot drift from the pointer, because it isn’t a second path.",
      "options": [
        {
          "name": "Arrow keys",
          "type": "—",
          "default": "—",
          "desc": "Move the focused mark along whichever axis carries an edit. On a <b>continuous</b> scale a press is 1% of the domain; on a <b>band</b> or <b>point</b> scale it steps one category, so a ranking moves by rank rather than by pixels."
        },
        {
          "name": "Shift + arrow",
          "type": "—",
          "default": "—",
          "desc": "A coarse step — 10% of the domain. (No effect on a categorical axis, where one category is already the smallest move.)"
        },
        {
          "name": "Constraints & locks apply",
          "type": "—",
          "default": "—",
          "desc": "Same edit, same dataset invariants: a nudge is clamped, snapped and repaired exactly as the drag is, and a <a href=\"/editing/lock\">locked</a> row is not focusable at all."
        },
        {
          "name": "One nudge, one undo step",
          "type": "—",
          "default": "—",
          "desc": "A press has no dragstart/dragend to bracket, so it commits as its own transaction — arrow-arrow-arrow then undo three times."
        }
      ],
      "returns": "The nudge is a <b>driver</b>, not a branch in the engine — which is why it works for every mark and every drag-style edit, including ones you write yourself with <code class=\"inline\">makeEdit</code>."
    }
  ],
  "sections": [
    {
      "id": "undo",
      "title": "Undo / redo",
      "intro": "Drag a bar and undo it. The whole drag is one step, because the history’s unit is the gesture — which is the unit the person thinks in, too.",
      "examples": [
        "editing-history/undo-a-drag"
      ]
    },
    {
      "id": "keyboard",
      "title": "Arrow keys",
      "intro": "Nothing below asks for keyboard support — the point takes a drag on x and y, so it takes arrow keys on x and y. That is the whole feature: a fallback for anyone who can’t drag precisely (or at all), and a precision tool for anyone who can.",
      "examples": [
        "editing-history/keyboard-nudge"
      ]
    }
  ]
};

export default page;
