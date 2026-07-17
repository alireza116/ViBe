import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "needle(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. One needle (+ hub) per datum.
      </>
    ),
    signatures: [
      "needle({ channels, length, handleSize, baseWidth, orient, arc, start, end, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Must include <code className="inline">angle</code>. Optional <code className="inline">x</code>/<code className="inline">y</code> place the pivot (default: plot centre).
          </>
        ),
      },
      {
        name: "length",
        type: "number",
        default: "40% of min(w,h)",
        desc: (
          <>
            Needle length in px. Or drive via the <code className="inline">size</code> channel.
          </>
        ),
      },
      {
        name: "handleSize",
        type: "number",
        default: "5",
        desc: "Pivot circle radius in px.",
      },
      {
        name: "baseWidth",
        type: "number",
        default: "10",
        desc: "Width of the needle base in px.",
      },
      {
        name: "orient",
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'top'",
        desc: (
          <>
            Semicircle facing that side. <code className="inline">top</code> = NYT / speedometer (range <code className="inline">[180, 0]</code>). Match with <code className="inline">scale.range</code>.
          </>
        ),
      },
      {
        name: "arc",
        type: "'semi' | 'full'",
        default: "'semi'",
        desc: (
          <>
            <code className="inline">full</code> → <code className="inline">[-180, 180]</code>. Otherwise same as <code className="inline">orient</code> (default top).
          </>
        ),
      },
      {
        name: "start / end",
        type: "number",
        default: "—",
        desc: (
          <>
            Explicit degree span (overrides <code className="inline">orient</code> / <code className="inline">arc</code>).
          </>
        ),
      },
    ],
    channels: [
      {
        name: "angle",
        type: "linear | point (deg)",
        desc: (
          <>
            The elicited value, mapped to degrees by its scale. Default range <code className="inline">[180, 0]</code>.
          </>
        ),
      },
      {
        name: "x / y",
        type: "linear | point",
        desc: "Optional pivot position — categorical or quantitative.",
      },
      {
        name: "fill / stroke",
        type: "style",
        desc: "Needle colour.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting a filled needle <code className="inline">path</code> and hub <code className="inline">circle</code> per datum.
      </>
    ),
  },
];
