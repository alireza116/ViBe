import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "edit({ name }) · container.control(name, index?)",
    summary: (
      <>
        Give any edit a <code className="inline">name</code>, then drive it from outside the chart with{' '}
        <code className="inline">el.control(name)</code>. The control synthesizes the same events a pointer
        does and feeds them to the one dispatch — so constraints, undo, guides, and{' '}
        <code className="inline">on("change")</code> all run. A new input <em>source</em>, not a second
        interaction system.
      </>
    ),
    signatures: [
      "drag({ name: \"move\", channels: [\"x\", \"y\"] })   // name an edit",
      "const h = el.control(\"move\", 0);   // handle bound to the edit + datum 0",
      "h.set(value)          // one-shot write (value edit) …",
      "h.set({ x, y })       // … or a data value per channel (positional edit)",
      "h.begin(); h.set(v); h.end();   // live drag → ONE undo entry",
      "h.fire()              // TRIGGER edit (cycle/remove/toggle) — fires its click gesture",
      "h.emit(event)         // raw event passthrough, scoped to this feature/node",
      "h.accepts()           // { field, type, kind, domain, values, range } from the scale",
    ],
  },
  {
    name: "set(options?)",
    summary: (
      <>
        The universal value edit: write a value into a channel's field — quantitative, colour,
        categorical, temporal. The <code className="inline">commit</code>-gesture counterpart to the
        positional edits, and what an external picker/slider drives via{' '}
        <code className="inline">control(name).set(value)</code>. (<code className="inline">editText</code>{' '}
        is its text specialization.)
      </>
    ),
    signatures: [
      "fill: { field: \"group\", edit: set({ name: \"category\" }) }",
      "el.control(\"category\", i).set(\"B\")",
    ],
  },
  {
    name: "container.emit(event)",
    summary: (
      <>
        Low-level: inject a renderer-shaped gesture event directly. <code className="inline">x</code>/
        <code className="inline">y</code> are inner (margin-subtracted) pixels. Prefer{' '}
        <code className="inline">control</code>, which computes pixels from a data value for you.
      </>
    ),
    signatures: [
      "el.emit({ type: \"commit\", node, value })",
      "el.emit({ type: \"dragstart\", node });  el.emit({ type: \"drag\", node, x, y });  el.emit({ type: \"dragend\", node })",
    ],
  },
];
