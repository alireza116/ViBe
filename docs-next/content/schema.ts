import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/schema",
  "title": "Data schema",
  "lead": "A <code class=\"inline\">schema</code> declares the output dataset: each field’s measurement type (quantitative / categorical / ordinal / temporal), range, and creation default. It is the source of truth for a field’s scale, so a chart resolves scales, draws axes, and mints data with <b>zero starter data</b>.",
  "api": [
    {
      "name": "schema — Record<field, FieldSchema>",
      "summary": "Declared on a feature (or on <code class=\"inline\">Elicit</code>). Each field maps to a spec that fixes its measurement type, range and creation default — the source of truth a scale and a minted datum both read.",
      "signature": "schema: { [field]: { type, domain?, default? } }",
      "options": [
        {
          "name": "type",
          "type": "'quantitative'|'categorical'|'ordinal'|'temporal'",
          "default": "—",
          "desc": "The field’s measurement type — picks the scale family (quantitative→linear, categorical→band/ordinal, temporal→time)."
        },
        {
          "name": "domain",
          "type": "any[]",
          "default": "—",
          "desc": "The field’s data range or category list; feeds the resolved scale and the axis."
        },
        {
          "name": "default",
          "type": "any",
          "default": "null",
          "desc": "The value a newly-created datum gets for this field (<code class=\"inline\">null</code> = present but unset, editable later)."
        }
      ],
      "returns": "With a schema, a feature resolves scales and draws axes from <b>no starter data</b>; <code class=\"inline\">create</code> seeds every declared field before the pointer places the positional ones."
    }
  ],
  "sections": [
    {
      "id": "empty",
      "title": "An empty chart that knows its axes",
      "intro": "No data — the axes come straight from the schema. Every created point carries all declared fields (from the pointer or the field’s default), so it is immediately editable.",
      "examples": [
        "schema/elicit-from-nothing"
      ]
    },
    {
      "id": "temporal",
      "title": "A temporal axis — same story",
      "intro": "type: \"temporal\" on a field. Dates place, drag, and invert like any continuous axis.",
      "examples": [
        "schema/beliefs-over-time"
      ]
    }
  ]
};

export default page;
