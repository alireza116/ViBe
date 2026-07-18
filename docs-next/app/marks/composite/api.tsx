import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "composite(options)",
    summary: (
      <>
        A glyph: a group of marks over the shared dataset. Import from <code className="inline">vibe.plot</code>. Returns an <b>array of features</b>, which <code className="inline">Elicit</code> flattens into its <code className="inline">features</code> list.
      </>
    ),
    signatures: [
      "composite({ parts, channels, constraints, discreteScale, id }) → Feature[]",
    ],
    options: [
      {
        name: "parts",
        type: "Mark[]",
        default: "[]",
        desc: (
          <>
            The sub-marks, in z-order (later parts paint on top — visual parts first, handles last). Each part is an ordinary mark with its <b>own</b> <code className="inline">channels</code> / style shorthands (arm geometry, per-part stroke, a tip’s <code className="inline">size</code>). A part with an <code className="inline">edit</code> is a handle; a part without one is inert and the engine makes it <code className="inline">pointerEvents:"none"</code> so it can’t swallow a sibling’s drag.
          </>
        ),
      },
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Shared channel map merged into every part. Use it for glyph-wide bindings (<code className="inline">x</code>/<code className="inline">y</code>/<code className="inline">angle</code>/<code className="inline">fill</code>). A part’s own channel for the same name <b>wins</b> (shallow replace). Inherited <code className="inline">edit</code>s land on the last part only.
          </>
        ),
      },
      {
        name: "fill, angle, …",
        type: "shorthand",
        default: "—",
        desc: (
          <>
            Constant shorthands desugared into <b>group</b> channels (shared by every part unless a part overrides). Parts keep their own shorthands too — e.g. group <code className="inline">angle</code>, per-part <code className="inline">stroke</code>.
          </>
        ),
      },
      {
        name: "constraints",
        type: "Constraint[]",
        default: "—",
        desc: (
          <>
            Group-level data invariants. Promoted into the <b>dataset’s</b> constraint set, so they gate and repair every edit — including one made through a different part. See <b>Constraints</b>.
          </>
        ),
      },
      {
        name: "discreteScale",
        type: "'band' | 'point'",
        default: "'band'",
        desc: "Stamped onto any part that doesn’t declare its own. A glyph usually sits in a band slot.",
      },
      {
        name: "id",
        type: "string",
        default: "'composite'",
        desc: (
          <>
            Prefix for the parts’ generated ids (<code className="inline">id/0</code>, <code className="inline">id/1</code>, …), so each part keeps a stable identity across renders.
          </>
        ),
      },
    ],
    returns: (
      <>
        An <b>array of features</b> — the parts, with ids assigned, group channels merged in, and the group’s constraints attached. Nothing about the glyph reaches the engine: it sees ordinary marks reading the one dataset.
      </>
    ),
  },
];
