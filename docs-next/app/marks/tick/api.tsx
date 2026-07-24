import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "tick(options) · tickY(options) · tickX(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. <code className="inline">tick</code> infers the value axis from which axis is a band; <code className="inline">tickY</code> marks a value on y (spans the x band), <code className="inline">tickX</code> on x.
      </>
    ),
    signatures: [
      "tick({ channels, inset, length, edits, constraints, id }) → Feature",
      "tickY(options) → Feature   // value on y",
      "tickX(options) → Feature   // value on x",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            One band axis (span) + one linear axis (the marked value). See <b>Channels</b>.
          </>
        ),
      },
      {
        name: "inset",
        type: "number",
        default: "0",
        desc: "Pixels to shrink each end of the span.",
      },
      {
        name: "length",
        type: "number",
        default: "—",
        desc: (
          <>
            Explicit centered span length in pixels. On a band axis it centres in the band; when the span axis also has a channel (e.g. scatter <code className="inline">x</code>+<code className="inline">y</code>), it centres on that channel’s encoded position so a short tick sits on the datum.
          </>
        ),
      },
      {
        name: "edits",
        type: "Edit[]",
        default: "—",
        desc: "Mark-level edits; per-channel edits live in the channels map.",
      },
      {
        name: "constraints",
        type: "Constraint[]",
        default: "—",
        desc: "Data invariants. Sugar — promoted to the dataset, so they hold for every edit from every mark.",
      },
      {
        name: "stroke, strokeWidth, …",
        type: "style",
        default: "stroke:'steelblue'",
        desc: "Style shorthands / channels.",
      },
    ],
    channels: [
      {
        name: "x",
        type: "band | linear",
        desc: "Category (band) or value (linear), per orientation.",
      },
      {
        name: "y",
        type: "band | linear",
        desc: (
          <>
            The other axis; the value axis carries <code className="inline">edit: move()</code> to drag the tick.
          </>
        ),
      },
      {
        name: "stroke, strokeWidth, opacity",
        type: "const | field",
        desc: "Standard style surface.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one <code className="inline">line</code> per datum (a bar with zero thickness).
      </>
    ),
  },
];
