import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "channels.symbol",
    summary: (
      <>
        A category → glyph map through an ordinal scale. Add it to any shape mark. Give it glyphs with <code className="inline">scale: {'{'} range: [...] {'}'}</code> or a named <code className="inline">scale: {'{'} scheme: 'faces' {'}'}</code>. Non-positional and non-invertible — a drag can't set a glyph, so it's edited via cycle/legend/create.
      </>
    ),
    signatures: [
      "symbol: { field, scale: { range | scheme }, edit? }",
    ],
    options: [
      {
        name: "scale.range",
        type: "string[]",
        default: "unicode shapes",
        desc: "The glyph palette. Defaults to ●■▲◆★… when omitted.",
      },
      {
        name: "scale.scheme",
        type: "string",
        default: "—",
        desc: "Named glyph set: 'faces', 'faces5', 'hearts', 'weather', 'arrows', 'shapes'.",
      },
      {
        name: "size",
        type: "number",
        default: "mark default",
        desc: "The mark's radius still sets the glyph's px extent, so a glyph point and a circle point match.",
      },
    ],
    channels: [
      {
        name: "symbol",
        type: "ordinal",
        desc: (
          <>
            Field → glyph. Range is a glyph array (<code className="inline">scale: {'{'} range: ["😢","😐","😊"] {'}'}</code>) or a scheme.
          </>
        ),
      },
    ],
    returns: "Nothing on its own — it changes how a host mark draws each datum.",
  },
];
