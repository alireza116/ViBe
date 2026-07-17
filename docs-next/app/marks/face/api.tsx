import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "face(options)",
    summary: (
      <>
        Import from <code className="inline">vibe.plot</code>. A single-datum glyph (like <code className="inline">trend</code>): the parts derive from the params, and the bound ones are their own drag targets — grab the feature itself, no floating handles. Its centre is placed by the x/y channels when present, else parked at the plot centre.
      </>
    ),
    signatures: [
      "face({ channels, size, handles, edits, constraints, id }) → Feature",
    ],
    options: [
      {
        name: "channels",
        type: "FaceChannels",
        default: "emotion preset",
        desc: (
          <>
            The channel map. The <b>seven face params are channels</b> — bind a field with <code className="inline">mouthCurve: {'{'} field: 'joy' {'}'}</code> (editable), or pin a constant with <code className="inline">{'{'} value: 0.8 {'}'}</code>. Bind none and you get the emotion preset (mouthCurve ← valence, eyeScale ← arousal); binding any one replaces it.
          </>
        ),
      },
      {
        name: "size",
        type: "number",
        default: "min(w,h)·0.35",
        desc: "Face radius in px. Set it when drawing many faces so they don't overlap.",
      },
      {
        name: "handles",
        type: "boolean",
        default: "true",
        desc: "Show the small eyelid/lip grab dots (squint & open). false keeps them grabbable but invisible.",
      },
      {
        name: "channels.x / .y",
        type: "ChannelSpec",
        default: "—",
        desc: "Optional: place the face centre in a plot (small-multiples, or an emotion-space scatter).",
      },
      {
        name: "fill, stroke",
        type: "style",
        default: "'#FFD666' / '#B7791F'",
        desc: "The face colour.",
      },
    ],
    channels: [
      {
        name: "mouthCurve",
        type: "linear",
        desc: (
          <>
            Mouth curvature — deep frown ↔ deep smile. Drag the mouth ↕. (Preset: ← <code className="inline">valence</code>.)
          </>
        ),
      },
      {
        name: "mouthOpen",
        type: "linear",
        desc: "Mouth openness — closed line ↔ wide cavity. Drag the lower-lip dot ↓.",
      },
      {
        name: "mouthAsym",
        type: "linear",
        desc: "Mouth asymmetry — centred ↔ smirk. Drag the mouth ↔.",
      },
      {
        name: "eyeScale",
        type: "linear",
        desc: (
          <>
            Eye aperture — pinpricks ↔ huge. Drag an eye ↕. (Preset: ← <code className="inline">arousal</code>.)
          </>
        ),
      },
      {
        name: "eyeSquint",
        type: "linear",
        desc: "Eye squint — round ↔ flat. Drag the eyelid dot ↓.",
      },
      {
        name: "browHeight",
        type: "linear",
        desc: "Brow height — slammed ↔ high arch. Drag a brow ↕.",
      },
      {
        name: "browTilt",
        type: "linear",
        desc: "Brow tilt — sad (outer-down) ↔ angry (inner-down). Drag a brow ↔.",
      },
      {
        name: "x, y",
        type: "linear | band",
        desc: "Face centre; omitted parks it at the plot centre.",
      },
    ],
    returns: (
      <>
        A <b>feature</b> emitting a face per datum (outline, eyes, brows, mouth, and eyelid/lip dots for the pull params).
      </>
    ),
  },
];
