import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "rect(options) · rectX(options) · rectY(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. <code className="inline">rect</code> spans both axes; <code className="inline">rectX</code> forces value on x (y a span/band), <code className="inline">rectY</code> forces value on y. All three share these options.
      </>
    ),
    signatures: [
      "rect({ channels, edits, constraints, id }) → Feature",
      "rectX(options) → Feature   // value on x",
      "rectY(options) → Feature   // value on y",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Channel map — spans (x1/x2, y1/y2), bands, or single x/y values per axis. See <b>Channels</b>.
          </>
        ),
      },
      {
        name: "edits",
        type: "Edit[]",
        default: "—",
        desc: (
          <>
            Mark-level edits; per-channel edits live in <code className="inline">channels[ch].edit</code>. Use <code className="inline">brushRect</code> for 2-D edge/corner/body editing.
          </>
        ),
      },
      {
        name: "constraints",
        type: "Constraint[]",
        default: "—",
        desc: "Data invariants, promoted to the dataset.",
      },
      {
        name: "fill, stroke, …",
        type: "style",
        default: "fill: 'steelblue'",
        desc: "Style shorthands / channels (the shared style surface).",
      },
    ],
    channels: [
      {
        name: "x1 / x2",
        type: "linear",
        desc: "Horizontal span endpoints. Share x’s resolved scale.",
      },
      {
        name: "y1 / y2",
        type: "linear",
        desc: "Vertical span endpoints. Share y’s resolved scale.",
      },
      {
        name: "x / y",
        type: "band | linear",
        desc: "A single value (baseline→value) or a band, when that axis isn’t a span.",
      },
      {
        name: "fill, stroke, strokeWidth, opacity",
        type: "const | field",
        desc: "Standard style surface; a field tints through the ordinal palette.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one <code className="inline">rect</code> per datum.
      </>
    ),
  },
];
