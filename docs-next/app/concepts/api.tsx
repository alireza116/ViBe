import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "The channel forms",
    summary: (
      <>
        The four shapes a channel can take on any mark’s <code className="inline">channels</code>, plus the co-located <code className="inline">edit</code> that makes it writable. Full scale options live on the <b>Scales & channels</b> page.
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
