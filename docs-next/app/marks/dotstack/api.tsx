import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "dotStack(options) · dotStackY(options) · dotStackX(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. The category axis is a band/point scale over the discrete slots. <code className="inline">dotStackY</code> stacks upward (category on x); <code className="inline">dotStackX</code> rightward (category on y); <code className="inline">dotStack</code> auto-detects.
      </>
    ),
    signatures: [
      "dotStack({ channels, size, gap, ghost, label, edits, constraints, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            A band/point category axis whose <code className="inline">domain</code> is the slot list.
          </>
        ),
      },
      {
        name: "size",
        type: "number",
        default: "7",
        desc: "Token radius (fixed geometry — the stack offset is 2·size + gap per token).",
      },
      {
        name: "gap",
        type: "number",
        default: "2",
        desc: "Vertical gap between stacked tokens.",
      },
      {
        name: "ghost",
        type: "boolean",
        default: "true",
        desc: "Draw a faint open ring at each slot's next position (a droppable affordance).",
      },
      {
        name: "label",
        type: "boolean",
        default: "false",
        desc: "Draw the per-slot count above each column.",
      },
    ],
    channels: [
      {
        name: "x / y",
        type: "band | point",
        desc: "The category (slot) axis; the other axis is a pure count of stacked tokens.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one <code className="inline">circle</code> per token, plus optional ghost rings and count labels.
      </>
    ),
  },
];
