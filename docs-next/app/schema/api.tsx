import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "schema — Record<field, FieldSchema>",
    summary: (
      <>
        Declared on a feature (or on <code className="inline">Elicit</code>). Each field maps to a spec that fixes its measurement type, range and creation default — the source of truth a scale and a minted datum both read.
      </>
    ),
    signatures: [
      "schema: { [field]: { type, domain?, default? } }",
    ],
    options: [
      {
        name: "type",
        type: "'quantitative'|'categorical'|'ordinal'|'temporal'",
        default: "—",
        desc: "The field’s measurement type — picks the scale family (quantitative→linear, categorical→band/ordinal, temporal→time).",
      },
      {
        name: "domain",
        type: "any[]",
        default: "—",
        desc: "The field’s data range or category list; feeds the resolved scale and the axis.",
      },
      {
        name: "default",
        type: "any",
        default: "null",
        desc: (
          <>
            The value a newly-created datum gets for this field (<code className="inline">null</code> = present but unset, editable later).
          </>
        ),
      },
    ],
    returns: (
      <>
        With a schema, a feature resolves scales and draws axes from <b>no starter data</b>; <code className="inline">create</code> seeds every declared field before the pointer places the positional ones.
      </>
    ),
  },
];
