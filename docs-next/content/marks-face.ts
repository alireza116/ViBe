import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/face",
  "title": "Face (emotion)",
  "lead": "<code class=\"inline\">face</code> encodes emotion — a datum's fields — into a face, and lets you <b>directly manipulate the features</b> to write them back: grab the mouth and pull it into a smile, drag an eye wider, tilt a brow. A face has seven parameters; each is only editable when you <b>bind it to a field</b>, so you turn on exactly the expressions you want to elicit.",
  "api": [
    {
      "name": "face(options)",
      "summary": "Import from <code class=\"inline\">vibe.plot</code>. A single-datum glyph (like <code class=\"inline\">trend</code>): the parts derive from the params, and the bound ones are their own drag targets — grab the feature itself, no floating handles. Its centre is placed by the x/y channels when present, else parked at the plot centre.",
      "signature": "face({ features, valence, arousal, size, handles, channels, edits, constraints, id }) → Feature",
      "options": [
        {
          "name": "features",
          "type": "object",
          "default": "emotion preset",
          "desc": "Map of <b>param → field</b> — the params to bind (and make editable). Omit for the emotion preset (mouthCurve ← valence, eyeScale ← arousal)."
        },
        {
          "name": "valence / arousal",
          "type": "string",
          "default": "'valence' / 'arousal'",
          "desc": "Rename the two preset fields without writing a full <code class=\"inline\">features</code> map."
        },
        {
          "name": "size",
          "type": "number",
          "default": "min(w,h)·0.35",
          "desc": "Face radius in px. Set it when drawing many faces so they don't overlap."
        },
        {
          "name": "handles",
          "type": "boolean",
          "default": "true",
          "desc": "Show the small eyelid/lip grab dots (squint & open). false keeps them grabbable but invisible."
        },
        {
          "name": "channels.x / .y",
          "type": "ChannelSpec",
          "default": "—",
          "desc": "Optional: place the face centre in a plot (small-multiples, or an emotion-space scatter)."
        },
        {
          "name": "fill, stroke",
          "type": "style",
          "default": "'#FFD666' / '#B7791F'",
          "desc": "The face colour."
        }
      ],
      "channels": [
        {
          "name": "mouthCurve",
          "type": "linear",
          "desc": "Mouth curvature — deep frown ↔ deep smile. Drag the mouth ↕. (Preset: ← <code class=\"inline\">valence</code>.)"
        },
        {
          "name": "mouthOpen",
          "type": "linear",
          "desc": "Mouth openness — closed line ↔ wide cavity. Drag the lower-lip dot ↓."
        },
        {
          "name": "mouthAsym",
          "type": "linear",
          "desc": "Mouth asymmetry — centred ↔ smirk. Drag the mouth ↔."
        },
        {
          "name": "eyeScale",
          "type": "linear",
          "desc": "Eye aperture — pinpricks ↔ huge. Drag an eye ↕. (Preset: ← <code class=\"inline\">arousal</code>.)"
        },
        {
          "name": "eyeSquint",
          "type": "linear",
          "desc": "Eye squint — round ↔ flat. Drag the eyelid dot ↓."
        },
        {
          "name": "browHeight",
          "type": "linear",
          "desc": "Brow height — slammed ↔ high arch. Drag a brow ↕."
        },
        {
          "name": "browTilt",
          "type": "linear",
          "desc": "Brow tilt — sad (outer-down) ↔ angry (inner-down). Drag a brow ↔."
        },
        {
          "name": "x, y",
          "type": "linear | band",
          "desc": "Face centre; omitted parks it at the plot centre."
        }
      ],
      "returns": "A <b>feature</b> emitting a face per datum (outline, eyes, brows, mouth, and eyelid/lip dots for the pull params)."
    }
  ],
  "sections": [
    {
      "id": "emotion",
      "title": "One face — drag to feel",
      "intro": "The emotion preset binds <code class=\"inline\">mouthCurve</code> to <code class=\"inline\">valence</code> and <code class=\"inline\">eyeScale</code> to <code class=\"inline\">arousal</code>. Grab the mouth and pull it up to smile, or drag an eye to widen it — each gesture inverts through the field's scale, and the whole face re-derives.",
      "examples": [
        "marks-face/valence-arousal"
      ]
    },
    {
      "id": "expressive",
      "title": "Turn on more expressions",
      "intro": "Bind any subset of the seven params with a <code class=\"inline\">features</code> map — each binding both drives the geometry and makes that feature draggable. Unbound params stay neutral. Here every param is live: mouth (↕ curve, ↔ smirk), eyes (↕ aperture), the eyelid dot (↓ squint), the lip dot (↓ open), and the brows (↕ height, ↔ tilt).",
      "examples": [
        "marks-face/full-chernoff-face"
      ]
    },
    {
      "id": "multiples",
      "title": "Many faces in a plot",
      "intro": "Give the face an <code class=\"inline\">x</code> (or <code class=\"inline\">y</code>) channel and it is placed like a <code class=\"inline\">point</code> — one editable face per row. Set <code class=\"inline\">x: { field: 'valence' }, y: { field: 'arousal' }</code> instead and the faces become an emotion-space scatter that moves as you edit them.",
      "examples": [
        "marks-face/a-mood-per-person"
      ]
    }
  ]
};

export default page;
