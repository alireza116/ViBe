import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Where things live on the spec",
    summary: (
      <>
        One chart, one place for each concern. Marks are views — they never own <code className="inline">data</code> or domains.
      </>
    ),
    options: [
      {
        name: "schema",
        type: "on Elicit",
        default: "required",
        desc: (
          <>
            Field type + domain + default. See <a href="/schema">Data schema</a>.
          </>
        ),
      },
      {
        name: "data",
        type: "on Elicit",
        default: "[]",
        desc: "The one elicited dataset. Every mark reads these rows.",
      },
      {
        name: "marks",
        type: "on Elicit",
        default: "[]",
        desc: "Marks (views) that encode — and optionally edit — columns of that dataset.",
      },
      {
        name: "constraints",
        type: "on Elicit",
        default: "[]",
        desc: (
          <>
            Dataset invariants. A mark’s <code className="inline">constraints</code> is sugar — the engine promotes it. See <a href="/constraints">Constraints</a>.
          </>
        ),
      },
      {
        name: "channels",
        type: "on a mark",
        default: "—",
        desc: "Bindings: field / value / datum, optional scale override, optional co-located edit.",
      },
      {
        name: "edits",
        type: "on a mark",
        default: "—",
        desc: (
          <>
            Mark-level edits for joint / multi-channel gestures (<code className="inline">edits: [move({'{'} channels: ["x","y"] {'}'})]</code>).
          </>
        ),
      },
    ],
  },
  {
    name: "The channel forms",
    summary: (
      <>
        The five shapes a channel can take on any mark’s <code className="inline">channels</code>, plus the co-located <code className="inline">edit</code> that makes it writable. Full scale options live on the <a href="/scales">Scales & channels</a> page.
      </>
    ),
    options: [
      {
        name: "{ field }",
        type: "scaled",
        default: "—",
        desc: (
          <>
            A data field mapped through the channel’s scale — <code className="inline">y: {'{'} field: "n" {'}'}</code>.
          </>
        ),
      },
      {
        name: "{ value }",
        type: "visual constant",
        default: "—",
        desc: (
          <>
            A fixed visual, which <b>skips the scale</b> — <code className="inline">fill: {'{'} value: "red" {'}'}</code>. The top-level shorthand <code className="inline">fill: "red"</code> desugars to it.
          </>
        ),
      },
      {
        name: "{ datum }",
        type: "data constant",
        default: "—",
        desc: (
          <>
            A constant in the field’s own units, mapped <b>through</b> the scale — <code className="inline">y: {'{'} datum: 25 {'}'}</code> lands where y = 25 is. (<code className="inline">{'{'} value: 25 {'}'}</code> would be pixel 25.)
          </>
        ),
      },
      {
        name: "{ field, scale: null }",
        type: "raw",
        default: "—",
        desc: "A field passed through unscaled (the datum already holds a literal colour / pixel).",
      },
      {
        name: "{ fn }",
        type: "derived · read-only",
        default: "—",
        desc: (
          <>
            Computed per datum in <b>visual space</b> (used as-is, never scaled) — <code className="inline">fill: {'{'} fn: d ={'>'} d.x {'>'} 50 ? "red" : "blue" {'}'}</code>. The shorthand <code className="inline">fill: d ={'>'} …</code> desugars to it. Read-only: put the <code className="inline">edit</code> on the source field and the fn re-derives on commit.
          </>
        ),
      },
      {
        name: "{ …, edit }",
        type: "writable",
        default: "—",
        desc: (
          <>
            Attach an edit so a gesture inverts back to <code className="inline">field</code> through the same scale.
          </>
        ),
      },
    ],
    returns: (
      <>
        Encoding maps <b>data → visual</b>; an edit maps <b>gesture → data</b> through the same scale — the whole model.
      </>
    ),
  },
];
