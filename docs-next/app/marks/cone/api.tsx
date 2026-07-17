import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "cone(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. A single-datum glyph; all nodes are non-interactive (the whole plane is the gesture surface).
      </>
    ),
    signatures: [
      "cone({ channels, samples, seed, wedge, sigma, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            An <code className="inline">angle</code> channel (r → degrees) and a <code className="inline">spread</code> channel; put a <code className="inline">rotate</code> edit on each.
          </>
        ),
      },
      {
        name: "samples",
        type: "number",
        default: "40",
        desc: "Number of cone sample lines.",
      },
      {
        name: "seed",
        type: "number",
        default: "7",
        desc: "PRNG seed — the fan is stable across re-renders, so a hover does not make it shimmer.",
      },
      {
        name: "wedge",
        type: "boolean",
        default: "false",
        desc: "Fill a translucent wedge spanning the envelope.",
      },
      {
        name: "sigma",
        type: "number",
        default: "1.96",
        desc: (
          <>
            Samples are drawn from <code className="inline">Normal(r, spread / sigma)</code>, so ~95% land inside the envelope the reader pointed at.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "angle",
        type: "linear (deg range)",
        desc: (
          <>
            The correlation r, mapped to degrees by its scale — <code className="inline">scale: {'{'} range: [-45, 45] {'}'}</code>. The domain <code className="inline">[-1, 1]</code> comes from the schema.
          </>
        ),
      },
      {
        name: "spread",
        type: "linear (deg range)",
        desc: (
          <>
            The <b>half-width</b> of the plausible envelope in r units — the quantity the pointer names, so the line under the cursor is the edge of the fan. <code className="inline">scale: {'{'} range: [0, 45] {'}'}</code>.
          </>
        ),
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting a mean <code className="inline">line</code>, sample lines, and an optional wedge <code className="inline">path</code>.
      </>
    ),
  },
];
