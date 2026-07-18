import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Mark SDK — vibe.plot",
    summary: (
      <>
        Shared foundation every mark factory uses. Import as <code className="inline">plot.encodeChannel</code> (or the bare name in these docs). A mark never owns <code className="inline">data</code> or a domain — <code className="inline">Elicit</code> owns both.
      </>
    ),
    signatures: [
      "normalizeMarkOptions(options) → options",
      "encodeChannel(scales, channels, name, datum, fallback) → any",
      "encodeAngle(scales, channels, datum, fallback?) → number",
      "resolveStyle(scales, channels, datum, defaults?) → style",
    ],
    options: [
      {
        name: "build(data, scales, width, height)",
        type: "required",
        default: "—",
        desc: (
          <>
            Emit <code className="inline">FeatureNode[]</code> (<code className="inline">circle</code> / <code className="inline">rect</code> / <code className="inline">line</code> / <code className="inline">path</code> / <code className="inline">text</code>). Resolve every position and style through <code className="inline">encodeChannel</code> / <code className="inline">resolveStyle</code> — never call <code className="inline">scale(d[key])</code> by hand.
          </>
        ),
      },
      {
        name: "normalizeMarkOptions",
        type: "fn",
        default: "—",
        desc: (
          <>
            Call at the top of the factory. Desugars top-level shorthands (<code className="inline">fill</code>, <code className="inline">size</code>, …) into <code className="inline">channels.*.value</code>.
          </>
        ),
      },
      {
        name: "discreteScale",
        type: "'band' | 'point'",
        default: "—",
        desc: "What the mark needs for discrete data (bar → band interval; point/line → tick). Leave unset for span-only marks (rule).",
      },
      {
        name: "channels / edits / constraints / id",
        type: "passthrough",
        default: "—",
        desc: "Accept them on the factory and pass them through. Dropping edits or constraints silently disables interaction or invariants.",
      },
      {
        name: "xKey / yKey",
        type: "string",
        default: "from channels",
        desc: "Field names the edit/constraint layer reads back — usually the channel’s field.",
      },
      {
        name: "pointerEvents",
        type: "per-node",
        default: "engine",
        desc: (
          <>
            Don’t silence the whole mark — leave unset so the engine can. Set per-node on glyph <i>chrome</i> (a path over handles) so chrome doesn’t swallow drags.
          </>
        ),
      },
    ],
    returns: (
      <>
        A feature object the engine consumes. Line-family marks also set <code className="inline">seriesKey</code>, <code className="inline">order</code>, and <code className="inline">supportsSeries: true</code>.
      </>
    ),
  },
  {
    name: "Edit SDK — vibe.edit",
    summary: (
      <>
        Build descriptors and reuse the same invert/pick helpers the stock edits use. Prefer the ladder: stock edit → <code className="inline">custom</code> → <code className="inline">makeEdit</code> → <code className="inline">registerDriver</code>.
      </>
    ),
    signatures: [
      "makeEdit(spec) → Edit",
      "custom(fn, options) → Edit",
      "invertChannel(ch, pointer, center?) → value",
      "recenterSpan(node, chA, chB, pointer) → { a, b }",
      "markCenter(node) → { x, y }",
      "schemaDefaults(schema) → Datum",
      "nearestMark(marks, x, y, threshold) → index | null",
      "registerDriver({ name, wants, onEvent, selects? })",
    ],
    options: [
      {
        name: "makeEdit(spec)",
        type: "→ Edit",
        default: "—",
        desc: (
          <>
            Normalize a partial spec into a full descriptor. Defaults: <code className="inline">gesture: "drag"</code>, <code className="inline">pick: "direct"</code>, <code className="inline">channels: null</code> (inject the channel it’s placed on).
          </>
        ),
      },
      {
        name: "apply(ctx)",
        type: "fn",
        default: "—",
        desc: (
          <>
            Pure given <code className="inline">ctx</code>. Return a <b>datum</b> (splice at index), a <b>full array</b> (whole-dataset rewrite), or <code className="inline">undefined</code> (no-op). Never mutate <code className="inline">ctx.data</code>.
          </>
        ),
      },
      {
        name: "EditContext",
        type: "ctx",
        default: "—",
        desc: (
          <>
            <code className="inline">data</code>, <code className="inline">datum</code>, <code className="inline">index</code>, <code className="inline">pointer</code>, <code className="inline">node</code>, <code className="inline">event</code>, resolved <code className="inline">channels</code>, <code className="inline">markChannels</code>, <code className="inline">scales</code>, <code className="inline">schema</code>, <code className="inline">marks</code>, …
          </>
        ),
      },
      {
        name: "cardinality",
        type: "'append' | 'delete'",
        default: "—",
        desc: "Tell constraints which row is active when the dataset’s shape changes (create/remove).",
      },
      {
        name: "name",
        type: "string",
        default: "null",
        desc: (
          <>
            Stable handle for <code className="inline">el.control(name)</code>. See <a href="/editing/external-controls">External controls</a>.
          </>
        ),
      },
      {
        name: "scope",
        type: "'line' | 'axis' | 'arc' | …",
        default: "null",
        desc: (
          <>
            Mark family the edit needs. Put the family in the API name (<code className="inline">edit.line.*</code>); the engine warns on a mismatch.
          </>
        ),
      },
      {
        name: "invertChannel",
        type: "fn",
        default: "—",
        desc: "Pointer → data for one resolved channel — the same path stock drag uses. Prefer this over hand-rolled scale.invert.",
      },
    ],
    returns: (
      <>
        Descriptors the engine routes. Multi-event lifecycles belong in a <b>driver</b>, not an <code className="inline">if (pick === …)</code> branch in the engine.
      </>
    ),
  },
  {
    name: "Drivers — edit.registerDriver",
    summary: (
      <>
        A driver owns a multi-event plane lifecycle (<code className="inline">hover</code> / <code className="inline">drag</code> / <code className="inline">click</code>, …). Built-ins cover <code className="inline">nearest</code>, <code className="inline">sweep</code>, <code className="inline">draw</code>, <code className="inline">brush</code>, <code className="inline">probe</code>, <code className="inline">plane</code>, …. Register a new one when stock <code className="inline">pick</code> values aren’t enough.
      </>
    ),
    signatures: [
      "registerDriver({ name, wants(edit), onEvent(ctx), selects? })",
    ],
    options: [
      {
        name: "wants(edit)",
        type: "→ boolean",
        default: "—",
        desc: (
          <>
            Claim edits — usually <code className="inline">edit.pick === name</code>.
          </>
        ),
      },
      {
        name: "onEvent(ctx)",
        type: "→ boolean",
        default: "—",
        desc: (
          <>
            Return whether anything changed (commit or redraw). <code className="inline">ctx</code> has <code className="inline">event</code>, <code className="inline">edits</code>, <code className="inline">marks</code>, <code className="inline">session</code>, <code className="inline">preview</code>, <code className="inline">runEdit</code>, <code className="inline">previewEdit</code>.
          </>
        ),
      },
      {
        name: "runEdit / previewEdit",
        type: "(edit, index) → boolean",
        default: "—",
        desc: "Commit through constraints + undo, or park an uncommitted hover preview.",
      },
      {
        name: "selects",
        type: "boolean",
        default: "false",
        desc: (
          <>
            If true, the driver writes a selection into <code className="inline">session</code> so <code className="inline">guide: true</code> can draw the snap ring / highlight.
          </>
        ),
      },
    ],
    returns: (
      <>
        Replaces a built-in of the same <code className="inline">name</code>, or adds a new pick. No engine fork required.
      </>
    ),
  },
];
