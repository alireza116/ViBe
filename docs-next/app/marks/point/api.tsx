import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "point(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. A circle or square per datum; every channel — positional or not — resolves through the global scales.
      </>
    ),
    signatures: [
      "point({ channels, shape, edits, constraints, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Channel map — see <b>Channels</b>.
          </>
        ),
      },
      {
        name: "shape",
        type: "'circle' | 'square'",
        default: "'circle'",
        desc: (
          <>
            Glyph shape. A square is a centred rect with side <code className="inline">2 × size</code>, so an <code className="inline">angle</code> channel can spin it.
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
        name: "fill, stroke, size, angle, …",
        type: "style",
        default: "fill: 'steelblue'",
        desc: "Shorthands / channels.",
      },
    ],
    channels: [
      {
        name: "x",
        type: "linear | band",
        desc: "Horizontal position; omitted parks the dot at the centre of x.",
      },
      {
        name: "y",
        type: "linear | band",
        desc: "Vertical position; omitted parks the dot at the centre of y.",
      },
      {
        name: "size",
        type: "linear",
        desc: (
          <>
            The circle radius / half square side (default 5). Pair with <code className="inline">edit: resize()</code> to drag the radius.
          </>
        ),
      },
      {
        name: "angle",
        type: "linear",
        desc: (
          <>
            Orientation in math degrees (0° = +x, CCW). Pair with <code className="inline">edit: rotate({'{'} pivot: 'mark', fold: false, pick: 'direct' {'}'})</code>. Circles are rotation-invariant; squares and symbols rotate.
          </>
        ),
      },
      {
        name: "fill / color",
        type: "const | field",
        desc: (
          <>
            Fill; a field tints through the ordinal palette (<code className="inline">color</code> is the legacy fallback).
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
        A <b>feature</b> emitting one <code className="inline">circle</code> or <code className="inline">rect</code> per datum.
      </>
    ),
  },
];
