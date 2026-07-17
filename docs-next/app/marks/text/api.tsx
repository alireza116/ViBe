import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "text(options) · textX(options) · textY(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. <code className="inline">text</code> positions from x AND y; <code className="inline">textX</code> / <code className="inline">textY</code> are 1-D labels along one axis (the other parks at centre).
      </>
    ),
    signatures: [
      "text({ channels, dx, dy, lineAnchor, format, edits, constraints, id }) → Feature",
      "textX(options) → Feature   // value on x",
      "textY(options) → Feature   // value on y",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Channel map. See <b>Channels</b>.
          </>
        ),
      },
      {
        name: "text, fontSize, textAnchor, lineAnchor, dx, dy",
        type: "shorthand",
        default: "—",
        desc: (
          <>
            Constant shorthands, e.g. <code className="inline">text({'{'} dy: -8, lineAnchor: "bottom" {'}'})</code>.
          </>
        ),
      },
      {
        name: "format",
        type: "string | fn",
        default: "String",
        desc: (
          <>
            Display formatter: a d3-format string (e.g. <code className="inline">".1f"</code>) or <code className="inline">(v) ={'>'} string</code>. Display-only — the field stays raw. Helpers live on <code className="inline">format</code> (<code className="inline">format.number</code>, <code className="inline">format.percent</code>, …).
          </>
        ),
      },
      {
        name: "edits",
        type: "Edit[]",
        default: "—",
        desc: (
          <>
            Mark-level edits; per-channel edits live in <code className="inline">channels[ch].edit</code>.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "x / y",
        type: "linear | band",
        desc: "Position. A missing axis parks the label at that dimension’s centre.",
      },
      {
        name: "text",
        type: "field | const",
        desc: (
          <>
            The value to draw (raw — no scale; passed through <code className="inline">format</code>).
          </>
        ),
      },
      {
        name: "fontSize",
        type: "field | const",
        desc: "Size in px, raw.",
      },
      {
        name: "textAnchor",
        type: "field | const",
        desc: (
          <>
            Horizontal anchor: <code className="inline">start</code>·<code className="inline">middle</code>·<code className="inline">end</code>.
          </>
        ),
      },
      {
        name: "lineAnchor",
        type: "field | const",
        desc: (
          <>
            Vertical anchor: <code className="inline">top</code>·<code className="inline">middle</code>·<code className="inline">bottom</code> (maps to SVG <code className="inline">dominant-baseline</code>).
          </>
        ),
      },
      {
        name: "dx / dy",
        type: "field | const",
        desc: "Pixel offsets from the encoded (x, y). Visual-only — drag still inverts the pointer through the scale.",
      },
      {
        name: "angle",
        type: "field | const",
        desc: (
          <>
            Rotation in degrees (scaled when a scale is declared, so <code className="inline">rotate()</code> is an exact inverse).
          </>
        ),
      },
      {
        name: "fill, opacity",
        type: "const | field",
        desc: "Standard style surface.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting one <code className="inline">text</code> per datum.
      </>
    ),
  },
];
