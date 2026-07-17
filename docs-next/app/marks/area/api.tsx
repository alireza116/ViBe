import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "area(options) · areaY(options) · areaX(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>.
      </>
    ),
    signatures: [
      "area({ channels, series, order, curve, handles, edits, … }) → Feature",
      "areaY(options) → Feature",
      "areaX(options) → Feature",
    ],
    channels: [
      {
        name: "x / y",
        type: "linear | point",
        desc: "Domain and value axes (same as line).",
      },
      {
        name: "y1 / y2 · x1 / x2",
        type: "linear",
        desc: (
          <>
            An endpoint <b>pair</b> on the value axis: fill between the two fields instead of down to the baseline (a confidence band, a fan chart). They share the value axis’s scale, so they resolve exactly like <code className="inline">y</code>, and declaring a pair picks the value axis on its own. Handles appear on <b>both</b> edges. Same span/baseline split <code className="inline">bar</code> and <code className="inline">rect</code> make, spelled the same way.
          </>
        ),
      },
      {
        name: "fill / stroke",
        type: "const | field",
        desc: "Area fill (default fillOpacity 0.35) and outline.",
      },
    ],
    returns: "A feature emitting one filled path per series plus optional handle circles.",
  },
];
