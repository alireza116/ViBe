import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/symbol",
  "title": "Symbol & Emoji",
  "lead": "The <code class=\"inline\">symbol</code> channel maps a category to a <b>glyph</b> — an emoji or a unicode shape — exactly the way <code class=\"inline\">fill</code> maps a category to a colour. It is not a mark: any shape mark (<code class=\"inline\">point</code>, <code class=\"inline\">dotStack</code>, <code class=\"inline\">waffle</code>) renders the glyph in place of its circle/rect. The elicited value is still the <i>category</i>; the glyph is its encoding, edited with <code class=\"inline\">cycle()</code> / <code class=\"inline\">legend()</code>.",
  "api": [
    {
      "name": "channels.symbol",
      "summary": "A category → glyph map through an ordinal scale. Add it to any shape mark. Give it glyphs with <code class=\"inline\">scale: { range: [...] }</code> or a named <code class=\"inline\">scale: { scheme: 'faces' }</code>. Non-positional and non-invertible — a drag can't set a glyph, so it's edited via cycle/legend/create.",
      "signature": "symbol: { field, scale: { range | scheme }, edit? }",
      "channels": [
        {
          "name": "symbol",
          "type": "ordinal",
          "desc": "Field → glyph. Range is a glyph array (<code class=\"inline\">scale: { range: [\"😢\",\"😐\",\"😊\"] }</code>) or a scheme."
        }
      ],
      "options": [
        {
          "name": "scale.range",
          "type": "string[]",
          "default": "unicode shapes",
          "desc": "The glyph palette. Defaults to ●■▲◆★… when omitted."
        },
        {
          "name": "scale.scheme",
          "type": "string",
          "default": "—",
          "desc": "Named glyph set: 'faces', 'faces5', 'hearts', 'weather', 'arrows', 'shapes'."
        },
        {
          "name": "size",
          "type": "number",
          "default": "mark default",
          "desc": "The mark's radius still sets the glyph's px extent, so a glyph point and a circle point match."
        }
      ],
      "returns": "Nothing on its own — it changes how a host mark draws each datum."
    }
  ],
  "sections": [
    {
      "id": "point",
      "title": "Emoji points — click to cycle",
      "intro": "A mood scatter: the y position and the glyph both encode <code class=\"inline\">mood</code>. A <code class=\"inline\">cycle()</code> on the symbol channel advances the category on click — the face changes and the point hops to its new row, because an edit is the inverse of encoding.",
      "examples": [
        "marks-symbol/mood-over-the-week"
      ]
    },
    {
      "id": "tokens",
      "title": "Emoji tokens — drop and remove",
      "intro": "A constant <code class=\"inline\">symbol</code> shorthand makes every token the same glyph. Because the glyph is just how the token draws, <code class=\"inline\">create</code> / <code class=\"inline\">remove</code> work unchanged — a ⭐ star-rating counter.",
      "examples": [
        "marks-symbol/star-tokens"
      ]
    },
    {
      "id": "waffle",
      "title": "Emoji waffle — count in glyphs",
      "intro": "A <code class=\"inline\">symbol</code> channel turns every waffle cell into that category's glyph, so a quantity is literally countable in 🍎. Drag to fill; the empty cells stay faint but grabbable.",
      "examples": [
        "marks-symbol/fruit-basket"
      ]
    },
    {
      "id": "legend",
      "title": "A glyph legend / picker",
      "intro": "Pair <code class=\"inline\">guides.legend({ channel: 'symbol' })</code> with <code class=\"inline\">legend()</code> for a glyph swatch row you click to set the category — the same as a colour legend, drawn with the glyphs themselves.",
      "examples": [
        "marks-symbol/pick-a-weather"
      ]
    }
  ]
};

export default page;
