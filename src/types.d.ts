import { ScaleLinear, ScaleBand, ScaleOrdinal } from 'd3';

export type Datum = Record<string, any>;

export type ScaleType = 'linear' | 'time' | 'band' | 'point' | 'ordinal' | 'sequential';

// A field's MEASUREMENT type in the dataset schema (what the data means), as
// opposed to a ScaleType (how a channel draws it). measureToScaleType translates
// one to the other per channel. `quantitative`/`temporal` are continuous;
// `categorical`/`ordinal` are discrete (ordinal's domain order is significant).
export type MeasureType = 'quantitative' | 'categorical' | 'ordinal' | 'temporal';

// One field of the elicited-dataset schema. Declares the field's measurement
// type and (optionally) its domain — [min,max] for quantitative/temporal, the
// ordered value list for categorical/ordinal — and a `default` used to populate
// the field when a datum is created (absent -> null, i.e. present but unset).
export interface FieldSchema {
  type: MeasureType;
  domain?: any[];
  default?: any;
}

// The dataset-wide schema: what data is being elicited, keyed by field name. It
// is the source of truth for a field's scale (ranked above data inference), so a
// chart resolves its scales — and can mint new data — with zero starter data.
export type Schema = Record<string, FieldSchema>;

export interface CustomScaleProperties {
  type: ScaleType;
  domainConfig?: any[];
  invertible: boolean;
  encode: (value: any, fallback?: any) => any;
  invertValue: (pixel: number) => any;
  domain?: () => any[];
}

export type Scale = (
  | ScaleLinear<any, any>
  | ScaleBand<any>
  | ScaleOrdinal<any, any>
  | ((v: any) => any)
) & CustomScaleProperties;

export interface ScaleMap {
  [channelName: string]: Scale;
}

export interface EditContext {
  data: Datum[];
  datum?: Datum;
  index?: number | null;
  pointer: { x: number; y: number };
  node: any | null;
  event: any;
  channels: ResolvedChannel[];
  scales: ScaleMap;
  encoding: Record<string, any>;
  // Plot pixel dimensions, for a gesture measured against the whole plane (e.g.
  // rotate about the centre), the angular sibling of resize's mark-centre radius.
  width?: number;
  height?: number;
  // The dataset schema, so a `create` edit can mint a datum carrying every
  // declared field (its default or null), not only the positional ones.
  schema?: Schema;
  xKey: string;
  yKey: string;
  // The feature's series (grouping) field and current scene nodes, for
  // proximity-aware edits (anchor / newSeries) and when.near|far.
  seriesKey?: string | null;
  marks?: FeatureNode[];
  // The line's ordering knob, so a create-as-you-drag (draw) edit can pick its
  // mode: 'sequence' -> freehand append; otherwise -> you-draw-it column upsert.
  order?: string | null;
  // The feature's transient session (per-drag lock for a draw edit: drawSeries +
  // last pointer/domain), read and mutated across a single press-drag. Set by the
  // draw driver.
  drawState?: Session | null;
}

export interface ResolvedChannel {
  name: string;
  field: string;
  scale?: Scale | null;
}

// The pure-data context a constraint reducer receives (defineConstraint). By the
// time it runs, gestures are already inverted to data space, so it sees only data.
export interface ConstraintContext {
  data: Datum[];
  oldData: Datum[];
  activeIndex: number | null;
  active?: Datum;
  field: string;
  value?: any;
  domain?: number[];
}

export interface Constraint {
  (newData: Datum[], oldData: Datum[], context: any): Datum[] | boolean | undefined;
  constraintType?: string;
  options?: any;
  field?: string;
  // A constraint's own boundary DRAWER (distinct from an Edit's boolean `guide`):
  // returns the scene nodes visualizing where it limits interaction.
  guide?: (ctx: any) => any[];
}

export interface Edit {
  type: string;
  gesture: string;
  channels: string[] | null;
  when: ((ctx: EditContext) => boolean) | null;
  pick: 'direct' | 'nearest' | 'plane' | 'sweep' | 'draw' | 'brush' | 'probe';
  // null = universal (any mark); 'line' = needs a series-grouping mark. The engine
  // dev-warns when a 'line' edit is attached to a mark without series support.
  scope: 'line' | null;
  threshold: number;
  // anchor()/draw(): which line a new point joins.
  into?: 'nearest' | 'new';
  // Edit-scoped constraint SUGAR (runs only on this edit's commit). The canonical
  // home for invariants is the dataset's `constraints` (plural), which hold for
  // every edit; `constrain` (singular) is a guard you want on just this one.
  constrain: Constraint[];
  // true = this edit self-draws its guide (constraint bounds + snap ring). Not to
  // be confused with a Constraint's `guide`, which is a drawer function.
  guide: boolean | null;
  guideColor: string | null;
  // Multi-stage gate: active only when it equals the engine's current stage;
  // null = always active. A uniform filter applied to every edit, like `gesture`
  // matching — not a mode branch. Set via a factory option: drag({ stage: 1 }).
  stage: number | null;
  // probe-pick only: does a click that settles this edit advance the stage?
  // Default true; `advance: false` commits repeatedly within one stage.
  advance: boolean;
  apply: (ctx: EditContext) => any;
}

// A single channel binding on a mark (Observable Plot's model, declarative).
// One of: `{ field }` (scaled through the channel's global scale), `{ value }`
// (a constant, e.g. `fill: 'red'` desugars to this), or `{ field, scale: null }`
// (a raw field, read unscaled — the datum already holds a literal colour/pixel).
// No accessor functions, so specs stay serializable/introspectable.
export interface ChannelSpec {
  field?: string;
  value?: any;
  scale?: ScaleType | null;
  type?: ScaleType;
  domain?: any[];
  range?: any[];
}

// The standard style channels every mark understands. A field drives them
// through a scale (colour palette for fill/stroke, opacity ramp for the opacity
// family); a `{ value }` (or top-level shorthand) sets a constant.
export interface StyleChannels {
  fill?: ChannelSpec;
  stroke?: ChannelSpec;
  strokeWidth?: ChannelSpec;
  opacity?: ChannelSpec;
  fillOpacity?: ChannelSpec;
  strokeOpacity?: ChannelSpec;
}

export interface Encoding extends StyleChannels {
  x?: ChannelSpec;
  y?: ChannelSpec;
  // Explicit span endpoints (bar's x1/x2 or y1/y2): alternative to x/y for a
  // value that doesn't start at the baseline. Share x/y's resolved scale (see
  // core/encoding.js's axisOf / core/resolve.js's axis-bucketed aliasing).
  x1?: ChannelSpec;
  x2?: ChannelSpec;
  y1?: ChannelSpec;
  y2?: ChannelSpec;
  size?: ChannelSpec;
  color?: ChannelSpec;
  [channel: string]: ChannelSpec | undefined;
}

// The shared option surface for every mark factory (bar, point, and new marks).
// `encoding` carries the channels; the style shorthands are sugar that desugar
// into constant channels via normalizeMarkOptions (explicit `encoding` wins).
//
// A mark NEVER owns data: `Elicit` owns the one dataset, and a mark is a view
// over it that encodes some columns and may edit them. There is no `data` or
// `onChange` here — both live on ElicitSpec.
export interface MarkOptions {
  encoding?: Encoding;
  // Style shorthands (constants) — e.g. `fill: 'steelblue'`, `strokeWidth: 2`.
  fill?: any;
  stroke?: any;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  id?: string;
  edits?: any[];
  // Sugar. Constraints are DATASET invariants; declaring them on a mark is a
  // convenience, and the engine promotes them into the chart-wide set (so they
  // gate every edit, from every mark, over the same rows). ElicitSpec.constraints
  // is the canonical home.
  constraints?: Constraint[];
  [key: string]: any;
}

// Options for a COMPOSITE mark (a glyph): a named GROUP of ordinary marks over
// the shared dataset. Each part encodes some columns; a part carrying an `edit`
// on a channel is a handle. `composite` returns the parts as an array of features
// (Elicit flattens it) — it is a desugaring, not a new kind of feature.
export interface CompositeOptions {
  // The sub-marks, in z-order: visual parts first, handles last.
  parts?: any[];
  id?: string;
  // Stamped onto any part that doesn't declare its own (a glyph usually sits in a
  // band slot). See plot/composite.js.
  categoricalScale?: 'band' | 'point';
  // Group-level data invariants; promoted to the dataset like any mark's.
  constraints?: Constraint[];
}

export interface FeatureNode {
  type: 'circle' | 'rect' | 'line' | 'path' | 'text';
  // Connecting-path geometry (line mark): the ordered pixel points and the curve
  // interpolation name (see the renderer's resolveCurve).
  points?: [number, number][];
  curve?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  opacity?: number;
  pointerEvents?: string;
  guide?: boolean;
  // Marks the node for the background render layer (axes/gridlines), drawn behind
  // interactive marks by the renderer.
  background?: boolean;
  text?: string;
  fontSize?: number;
  textAnchor?: string;
  data?: Datum;
  index?: number;
  featureId?: string;
  // Set by the engine when the node's feature has a direct-pick edit, so the
  // renderer shows an interactive cursor on it.
  editable?: boolean;
  // Runtime tags set by marks for the pick/driver layer: `series` groups a line's
  // nodes; `sweepAxis`/`bandAxis` name the axis proximity measures along; `cursor`
  // overrides the interactive cursor (e.g. a tick's ew-resize); `channel` tags one
  // of a mark's several handles, so that handle's edit `when` claims only this node.
  // Needed only when one FEATURE emits multiple handles over one datum — see
  // plot/trend.js (intercept vs slope). Marks split across features don't need it:
  // direct-pick dispatch already routes a gesture to the touched node's feature.
  series?: any;
  sweepAxis?: 'x' | 'y';
  bandAxis?: 'x' | 'y';
  channel?: string;
  cursor?: string;
  [key: string]: any;
}

// Per-feature transient interaction state a driver keeps in ui.session[featureId]
// (proximity selection, sweep/draw locks). Read by guides to draw the snap ring +
// highlight and by a draw edit via ctx.drawState. All fields optional/driver-set.
export interface Session {
  px?: number;
  py?: number;
  threshold?: number;
  hoverIndex?: number | null;
  activeIndex?: number | null;
  series?: any;
  // draw driver: the locked mode + series and the pointer/domain trail.
  mode?: 'edit' | 'draw';
  drawSeries?: any;
  lastDomain?: any;
  lastX?: number | null;
  lastY?: number | null;
  // brush driver: the dragstart-locked grab zone (+ which field an edge zone
  // targets), forced to 'canonicalize' for the one-time dragend cleanup tick.
  zone?: 'edgeA' | 'edgeB' | 'body' | 'canonicalize' | null;
  field?: string | null;
}

// Config for a single positional axis (the `axes` convenience, or an explicit
// axisX/axisY mark). Axes and gridlines are composable marks (see plot/axis.js).
export interface AxisSpec {
  channel?: 'x' | 'y';
  // Base side; default x->'bottom', y->'left'. Drives tick side + label placement.
  anchor?: 'bottom' | 'top' | 'left' | 'right';
  // Width/height/scales-aware override of the base translate — e.g. cross at the
  // origin: `({ scales }) => ({ y: scales.y(0) })`.
  transform?: (ctx: {
    width: number;
    height: number;
    scales: ScaleMap;
    anchor: string;
    base: { x: number; y: number };
  }) => { x?: number; y?: number };
  ticks?: number;               // tick count hint (linear); ignored for band/point
  tickValues?: any[];           // explicit tick values (overrides `ticks`)
  tickFormat?: string | ((v: any) => string); // d3-format string or a formatter
  tickSize?: number;
  title?: string;
  stroke?: string;
  color?: string;
  fontSize?: number;
  grid?: boolean;               // also emit a paired gridline mark
}

// Interaction-effects layer: transient visual feedback for interaction STATE,
// kept separate from mark style channels and customizable per chart. See
// core/effects.js. `grab` is an element effect (CSS filter) on a dragged mark;
// `select` is the proximity/nearest overlay (ring at the pointer + mark outline).
export interface EffectsSpec {
  // false disables; a string is shorthand for { filter }.
  grab?: false | string | { filter?: string | null };
  // false disables the overlay; partial objects merge over the defaults.
  select?: false | {
    color?: string;
    ring?: { dash?: string; width?: number; opacity?: number };
    highlight?: { width?: number; opacity?: number; pad?: number };
  };
}

export interface ElicitSpec {
  width?: number;
  height?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  features?: any[];
  // THE dataset. A chart elicits exactly one — even a slider elicits a one-row
  // dataset. Seed rows are a starting point; every mark is a view over these rows,
  // encoding some columns and (where it carries an edit) writing them back. Marks
  // never own data. May be omitted: with a `schema`, scales resolve and `create`
  // mints rows from nothing.
  data?: Datum[];
  // The elicited-dataset schema (field -> measurement type/domain/default). Lets a
  // chart resolve scales and mint data with zero starter data; ranked above data
  // inference but below an explicit per-channel type/domain or top-level x/y.
  schema?: Schema;
  // The dataset's invariants. They gate and REPAIR every edit, whichever mark fired
  // it: a rejected proposal is dropped; a returned array replaces it, and the marks
  // re-derive from the repaired rows on the next render. A mark's own `constraints`
  // are promoted into this set (see MarkOptions.constraints).
  constraints?: Constraint[];
  // Called with the committed dataset after each edit. Hover previews never fire it.
  onChange?: (data: Datum[]) => void;
  // Global axis convenience: `false` = no axes; `{ x, y }` = per-channel config or
  // `false` to suppress that channel; omitted = default axes on both positional
  // channels. Desugars into composable axis/grid marks.
  axes?: false | { x?: AxisSpec | false; y?: AxisSpec | false };
  // Customizable interaction-effects layer (grab / proximity-select).
  effects?: EffectsSpec;
  guides?: any[];
  renderer?: any;
  x?: { type?: ScaleType; domain?: any[]; range?: any[] };
  y?: { type?: ScaleType; domain?: any[]; range?: any[] };
  // Initial stage index for multi-stage elicitation. Edits carrying a `stage`
  // are active only when it equals the current stage (see Edit.stage).
  stage?: number;
  [key: string]: any;
}

// The DOM element Elicit returns: the chart container plus a small observation
// API over the belief-data store. `getData`/`setData` read/replace the committed
// dataset; `on` subscribes to commits and stage changes. These add no interaction
// path — edits + constraints remain the only way a gesture mutates data.
export interface ElicitElement extends HTMLDivElement {
  // A deep copy of the committed dataset.
  getData(): Datum[];
  // Replace the dataset and re-render. Bypasses constraints (trusted seed/reset).
  setData(data: Datum[]): void;
  // Subscribe to committed changes ('change': (data)) or stage advances
  // ('stage': (stageIndex)). Returns an unsubscribe function.
  on(type: 'change' | 'stage', cb: (...args: any[]) => void): () => void;
  // Multi-stage controls (see ElicitSpec.stage). getStage reads the current index.
  getStage(): number;
  setStage(stage: number): void;
  nextStage(): void;
}
