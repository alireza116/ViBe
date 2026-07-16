import { ScaleLinear, ScaleBand, ScaleOrdinal } from 'd3';

export type Datum = Record<string, any>;

// How a channel DRAWS a field. Never written as `type` on a channel — that slot
// holds the data type. A scale type is named by `scale` (a string, or the `type`
// of a ScaleSpec). See scaleTypeFor in core/encoding.js for the routing.
export type ScaleType =
  | 'linear' | 'log' | 'pow' | 'sqrt' | 'time'
  | 'band' | 'point' | 'ordinal' | 'sequential';

// A field's MEASUREMENT type in the dataset schema (what the data means), as
// opposed to a ScaleType (how a channel draws it). scaleTypeFor translates one to
// the other per channel. `quantitative`/`temporal` are continuous;
// `categorical`/`ordinal` are discrete (ordinal's domain order is significant).
export type MeasureType = 'quantitative' | 'categorical' | 'ordinal' | 'temporal';

// A scale's own configuration — everything about HOW a field is drawn that isn't
// the data's business. The domain is deliberately absent: it belongs to the data,
// and is declared once on the schema (see FieldSchema.domain).
export interface ScaleSpec {
  type?: ScaleType;
  range?: any[];
  // A named colour scheme (colour channels only), resolved to a `range` when the
  // channel names none: a categorical palette ('tableau10', 'category10', 'set2',
  // …) for a discrete field, or a diverging/sequential ramp ('RdBu', 'blues',
  // 'viridis', …). An explicit `range` still wins. See schemeRange in core/encoding.js.
  scheme?: string;
  // Flip the resolved range (after `range` / `scheme`). Useful for diverging
  // ordinal colour when the domain order is the opposite of the scheme's native
  // direction — e.g. D→R wants blue→red, which is `scheme: "RdBu", reverse: true`.
  reverse?: boolean;
  padding?: number;    // band / point
  nice?: boolean;      // continuous
  clamp?: boolean;     // continuous
  base?: number;       // log
  exponent?: number;   // pow
}

// One field of the elicited-dataset schema. Declares the field's measurement
// type and (optionally) its domain — [min,max] for quantitative/temporal, the
// ordered value list for categorical/ordinal — and a `default` used to populate
// the field when a datum is created (absent -> null, i.e. present but unset).
export interface FieldSchema {
  type: MeasureType;
  domain?: any[];
  default?: any;
}

// Which rows of the dataset are READ-ONLY (see ElicitSpec.lock, core/lock.js).
// 'seed' (or true) fixes the rows the chart was seeded with — they are given, not
// elicited — and leaves every row an edit adds free. A predicate locks rows by
// what they are (`d => d.year <= 1990`).
export type LockSpec = 'seed' | boolean | ((datum: Datum, index: number) => boolean);

// The dataset-wide schema: what data is being elicited, keyed by field name. It
// is the source of truth for a field's scale (ranked above data inference), so a
// chart resolves its scales — and can mint new data — with zero starter data.
export type Schema = Record<string, FieldSchema>;

// What a scale can DO, sniffed from the scale object itself and stamped once at
// creation/adoption. Marks, edits and axes branch on `kind` — never on `type`,
// which is only a label (an adopted d3 scale has no type at all, and a `log`
// scale behaves exactly like a `linear` one everywhere it matters).
//   band       -> occupies an interval per category (bandwidth)
//   point      -> a tick per category (no width)
//   continuous -> has invert(): linear, log, pow, sqrt, time, symlog
//   discrete   -> maps a value to a discrete output (ordinal, sequential ramp)
export type ScaleKind = 'band' | 'point' | 'continuous' | 'discrete';

export interface CustomScaleProperties {
  // A label, for axis tick formatting and debugging. NOT control flow.
  type?: ScaleType;
  kind: ScaleKind;
  // The domain holds Dates, so encode() coerces values before positioning.
  temporal: boolean;
  domainConfig?: any[];
  invertible: boolean;
  encode: (value: any, fallback?: any) => any;
  invertValue: (pixel: number) => any;
  domain?: () => any[];
  // The schema fields unioned onto this axis, in first-seen order (stamped by
  // resolveScales). Metadata for an editable axis: a domain edit writes each of
  // these fields' schema domains. Not a domain/range on the channel.
  fields?: string[];
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

/** Chart geographic projection (see core/projection.js createProjection). */
export interface ProjectionContext {
  apply(p: [number, number]): [number, number] | null;
  invert(p: [number, number]): [number, number] | null;
  path(object?: any): string | null;
  invertible: boolean;
  raw: any;
}

export interface ProjectionSpec {
  type?: string | ((...args: any[]) => any);
  domain?: any;
  rotate?: [number, number] | [number, number, number];
  parallels?: [number, number];
  precision?: number;
  clipAngle?: number;
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  [key: string]: any;
}

export interface EditContext {
  data: Datum[];
  datum?: Datum;
  index?: number | null;
  pointer: { x: number; y: number };
  node: any | null;
  event: any;
  // A gesture-supplied payload value, for edits whose input isn't a pixel: the
  // text mark's content-edit `commit` carries the typed string here. Undefined
  // for pointer-only gestures.
  value?: any;
  // The edit's own target channels, resolved to { name, field, scale }.
  channels: ResolvedChannel[];
  scales: ScaleMap;
  // The whole mark's channel map (name -> ChannelSpec), for edits that need to
  // look up a sibling channel's field. Distinct from `channels` above.
  markChannels: Record<string, any>;
  // Plot pixel dimensions, for a gesture measured against the whole plane (e.g.
  // rotate about the plot centre by default; rotate({ pivot: 'mark' }) uses the
  // mark centre instead — the angular sibling of resize's mark-centre radius).
  width?: number;
  height?: number;
  // The chart's margins, so a grow-mode axis edit can turn an inner axis length
  // back into the chart's outer width/height. Rarely needed by other edits.
  margins?: { top: number; right: number; bottom: number; left: number };
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
  // Chart geographic projection when `ElicitSpec.projection` is set. Geo edits
  // invert the pointer through the same object geo marks use for apply/path.
  projection?: ProjectionContext | null;
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
  pick: 'direct' | 'nearest' | 'plane' | 'sweep' | 'draw' | 'brush' | 'brushRect' | 'probe' | (string & {});
  // null = universal (any mark); 'line' = needs a series-grouping mark; 'axis' /
  // 'arc' = belongs on that mark kind (the scope shows in the name, e.g.
  // edit.line.*, edit.axis.*, edit.arc.*). The engine dev-warns when a 'line' edit
  // is attached to a mark without series support.
  scope: 'line' | 'axis' | 'arc' | 'geo' | null;
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
  // What this edit WRITES. Absent (the default) -> the dataset: apply returns a
  // datum (spliced at `index`) or a whole array. 'domain' -> the schema: apply
  // returns { domains: { [field]: any[] }, data?, resize? } and the engine writes
  // each field's schema domain (and optionally replaces the dataset / resizes the
  // chart). A capability flag, read like the array-vs-datum classification — not
  // an interaction-mode branch. Used by the editable-axis edits (edit.axis.*).
  target?: 'domain';
  apply: (ctx: EditContext) => any;
}

// The result an edit with `target: 'domain'` returns from apply(): the schema
// domains to write, plus (for a coupled schema+data edit like category-remove) a
// replacement dataset, and (for grow-the-chart numeric drag) a chart resize hint.
export interface DomainEditResult {
  domains: Record<string, any[]>;
  data?: Datum[];
  resize?: { width?: number; height?: number };
}

// A single channel binding on a mark (Observable Plot's model, declarative).
// One of:
//   { field }              a data field, through the channel's global scale
//   { value }              a VISUAL-space constant — skips the scale entirely
//                          (`fill: 'red'` desugars to this)
//   { datum }              a DATA-space constant — goes THROUGH the scale, so
//                          `y: { datum: 25 }` lands at the pixel where y=25 is
//   { field, scale: null } a raw field, read unscaled (the datum already holds a
//                          literal colour / pixel)
// No accessor functions, so specs stay serializable/introspectable.
export interface ChannelSpec {
  field?: string;
  value?: any;
  datum?: any;
  // The field's DATA type. Overrides the schema's declaration for this channel;
  // useful for a field the schema doesn't cover. Below an explicit `scale`.
  type?: MeasureType;
  // The scale, by name (`'log'`), by spec (`{ type: 'sqrt', range: [4, 20] }`),
  // as a live d3 scale (adopted as-is; see adoptScale in core/scales.js), or
  // `null` to read the field unscaled.
  scale?: ScaleType | ScaleSpec | Function | null;
  // Makes the channel writable: a gesture inverts back to `field` through this
  // same scale. Collected by edit/route.js's collectEdits.
  edit?: Edit;
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

export interface Channels extends StyleChannels {
  x?: ChannelSpec;
  y?: ChannelSpec;
  // Explicit span endpoints (bar's x1/x2 or y1/y2): alternative to x/y for a
  // value that doesn't start at the baseline. Share x/y's resolved scale (see
  // core/encoding.js's axisOf / core/resolve.js's axis-bucketed aliasing).
  x1?: ChannelSpec;
  x2?: ChannelSpec;
  y1?: ChannelSpec;
  y2?: ChannelSpec;
  // Circle radius in px. Constant form is the `size` shorthand, not resolveStyle.
  size?: ChannelSpec;
  // Categorical glyph channel: a category -> an emoji / unicode shape through an
  // ordinal scale, exactly like `fill` maps a category -> a colour. A shape mark
  // (point / dotStack / waffle) renders the glyph as text in place of its
  // circle/rect. Supply the glyphs with `scale: { range: ['😢','😐','😊'] }` or a
  // named `scale: { scheme: 'faces' }`; edit it with cycle()/legend() (the field
  // holds the category — the glyph is its encoding). Non-positional, non-invertible.
  symbol?: ChannelSpec;
  // Text mark channels: the label string, its size/anchors/offsets (read RAW,
  // not scaled — constant forms are shorthands), and rotation in degrees
  // (scaled when a scale is declared, so rotate() is an exact inverse; else raw).
  // `format` is a mark-level option (string | fn), not a channel — see MarkOptions.
  // Also the primary channel of needle / axisRadial / cone (degrees via scale.range;
  // default range [180, 0] = left→right through the top). For arc/pie, the field is
  // the slice magnitude (layout stacks and normalizes; the scale is not used for placement).
  text?: ChannelSpec;
  fontSize?: ChannelSpec;
  textAnchor?: ChannelSpec;   // horizontal: 'start' | 'middle' | 'end'
  lineAnchor?: ChannelSpec;   // vertical: 'top' | 'middle' | 'bottom'
  dx?: ChannelSpec;           // horizontal pixel offset
  dy?: ChannelSpec;           // vertical pixel offset
  angle?: ChannelSpec;
  [channel: string]: ChannelSpec | undefined;
}

// The shared option surface for every mark factory (bar, point, and new marks).
// `channels` carries the bindings; the shorthands are sugar that desugar into
// constant channels via normalizeMarkOptions (an explicit `channels` entry wins).
//
// A mark NEVER owns data: `Elicit` owns the one dataset, and a mark is a view
// over it that encodes some columns and may edit them. There is no `data` or
// `onChange` here — both live on ElicitSpec. Nor does it own a domain: that is
// the data's, declared once on the schema.
export interface MarkOptions {
  channels?: Channels;
  // Constant shorthands — e.g. `fill: 'steelblue'`, `strokeWidth: 2`, `size: 9`.
  fill?: any;
  stroke?: any;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  size?: number;
  // Text-mark shorthands (desugar into raw channels via normalizeMarkOptions).
  text?: any;
  fontSize?: number;
  textAnchor?: 'start' | 'middle' | 'end' | string;
  lineAnchor?: 'top' | 'middle' | 'bottom' | string;
  dx?: number;
  dy?: number;
  // Text-mark display formatter: a d3-format string or `(value) => string`.
  // Display-only — the underlying field stays the raw value. See `vibe.format`.
  format?: string | ((v: any) => string);
  id?: string;
  edits?: any[];
  // Sugar. Constraints are DATASET invariants; declaring them on a mark is a
  // convenience, and the engine promotes them into the chart-wide set (so they
  // gate every edit, from every mark, over the same rows). ElicitSpec.constraints
  // is the canonical home.
  constraints?: Constraint[];
  [key: string]: any;
}

// A face's parameter names. Each is a non-positional CHANNEL (declared like
// `fill`/`size`): bind a field with `{ field }` to make it editable, or pin a
// constant with `{ value }`. Unbound params render at neutral (0.5).
export type FaceParam =
  | 'mouthCurve' | 'mouthOpen' | 'mouthAsym'
  | 'eyeScale' | 'eyeSquint'
  | 'browHeight' | 'browTilt';

// A face's channel map: the ordinary positional/style channels plus the seven face
// params, each a linear [0,1] channel resolved and inverted the same way.
export type FaceChannels = Channels & Partial<Record<FaceParam, ChannelSpec>>;

// Options for a FACE mark (an emotion glyph): a single-datum, PARAMETRIC face whose
// features encode data FIELDS and are DIRECTLY MANIPULATED to write them back (grab
// the mouth, an eye, a brow). The seven params are CHANNELS — bind them in
// `channels` (param -> `{ field }`), exactly like every other mark; there is no
// bespoke `features` map. A feature carrying two params is a 2-D drag (mouth: ↕
// curve, ↔ asym; brow: ↕ height, ↔ tilt), and the two "pull" params (eye squint,
// mouth open) get a small eyelid/lip dot. Bind NO param for the emotion preset
// (mouthCurve ← valence, eyeScale ← arousal); binding any one replaces it. The
// centre is placed by the x/y channels when present, else the plot centre.
// See plot/face.js.
export interface FaceOptions extends MarkOptions {
  // The channel map, including the seven face params as `{ field }` / `{ value }`.
  channels?: FaceChannels;
  // Face radius in px. Default min(width, height) * 0.35.
  size?: number;
  // Eyelid/lip grab-dot radius in px. Default 5.
  handleSize?: number;
  // Show the eyelid/lip dots (squint & open), or keep them grabbable but invisible.
  handles?: boolean;
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
  discreteScale?: 'band' | 'point';
  // Group-level data invariants; promoted to the dataset like any mark's.
  constraints?: Constraint[];
}

export interface FeatureNode {
  type: 'circle' | 'rect' | 'line' | 'path' | 'text' | 'image';
  // Connecting-path geometry (line mark): the ordered pixel points and the curve
  // interpolation name (see the renderer's resolveCurve).
  points?: [number, number][];
  curve?: string;
  // Authored SVG path `d` (arcs, needles, pie slices). When set, the renderer
  // uses it instead of building a line from `points`.
  d?: string;
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
  // Raster tile (geoTile): the image source, and the {z}/{x}/{y} identity the
  // renderer keys its data join on so an on-screen tile survives a re-render
  // without re-fetching.
  href?: string;
  key?: string;
  text?: string;
  fontSize?: number;
  textAnchor?: string;
  // Text mark: vertical anchor ('top'|'middle'|'bottom') and the SVG
  // dominant-baseline the mark derived from it; rotation in degrees (rendered
  // as a rotate() transform about x,y); `editText` opts the node into the
  // renderer's inline content editor on dblclick.
  lineAnchor?: string;
  dominantBaseline?: string;
  angle?: number;
  editText?: boolean;
  data?: Datum;
  index?: number;
  featureId?: string;
  // Set by the engine when the node's feature has a direct-pick edit, so the
  // renderer shows an interactive cursor on it.
  editable?: boolean;
  // Set by the engine when the node's row is READ-ONLY (ElicitSpec.lock): the node
  // is never `editable`, is pointer-transparent, and proximity picking skips it. A
  // line's connector path is locked when every row of its series is.
  locked?: boolean;
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
  // geo draw: index of the row whose coordinates list is being authored this stroke.
  drawIndex?: number | null;
  lastDomain?: any;
  lastX?: number | null;
  lastY?: number | null;
  // brush driver: the dragstart-locked grab zone (+ which field an edge zone
  // targets), forced to 'canonicalize' for the one-time dragend cleanup tick.
  zone?: 'edgeA' | 'edgeB' | 'body' | 'canonicalize' | 'corner' | 'edgeX' | 'edgeY' | 'edge' | null;
  field?: string | null;
  // brushRect driver: the field(s) an edge/corner grab locked (1 for an edge,
  // 2 for a corner). The 2-D sibling of `field`.
  fields?: string[] | null;
  // geoBrush driver: which geographic edge(s) the grab locked, plus the anchor it
  // latched at dragstart — the pointer's lon/lat and the box as it stood then, so
  // a body move translates by the geographic delta instead of recentering.
  edges?: string[] | null;
  grab?: { lon: number; lat: number } | null;
  box0?: { west: number; south: number; east: number; north: number } | null;
  // axisDrag driver: the dragstart-locked handle for an editable numeric axis —
  // which end is grabbed, the axis it runs along, the opposite (anchored) end's
  // pixel + value, the grabbed end's starting pixel + value, and (grow mode) the
  // pixels-per-data-unit held constant while the chart resizes.
  grabEnd?: 'min' | 'max';
  axis?: 'x' | 'y';
  anchorPixel?: number;
  anchorValue?: any;
  grabPixel?: number;
  grabValue?: any;
  pxPerUnit?: number;
  cursor?: string;
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
  stroke?: string;   // spine + ticks
  fill?: string;     // tick labels + title (they are text nodes)
  fontSize?: number;
  grid?: boolean;               // also emit a paired gridline mark
  // Make the axis INTERACTIVE (opt-in; axes are inert by default). A domain edit
  // (edit.axis.scale() for a numeric/temporal axis, edit.axis.categories() for a
  // discrete one) reshapes the field's schema domain — grids, guides and marks
  // reflow from it. Accepts one edit or a list.
  edit?: Edit | Edit[];
  // The schema field whose domain this axis edits, when the axis's channel carries
  // more than one field and the edit shouldn't touch them all. Defaults to every
  // field on the axis (scale.fields).
  field?: string;
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
  // The elicited-dataset schema (field -> measurement type/domain/default), and
  // the contract of the chart. REQUIRED: it owns every field's data type and
  // DOMAIN, so a mark never declares one. A field encoded but left out of the
  // schema is inferred from `data` with a dev-warning; a field with neither a
  // schema entry nor data throws (there is nothing to build a scale from).
  schema: Schema;
  // Read-only rows. `'seed'` (or `true`) fixes the rows in `data` — they are given,
  // not elicited — while every row an edit ADDS stays free; a predicate locks rows
  // by what they are. A locked row can't be changed or deleted by any gesture (a
  // dataset invariant, run last, so it outranks every other repair), its marks are
  // not grabbable, and proximity picking (nearest / sweep / draw) skips them. Note
  // `setData` re-seeds the chart, so it also re-takes a `'seed'` lock.
  lock?: LockSpec;
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
  // Sizing mode. 'fixed' (default) draws at the pixel width/height. 'scale' wraps
  // the SVG in a viewBox so the browser scales it to fill the parent (one draw,
  // aspect ratio preserved). 'reflow' (or `true`) measures the parent and redraws
  // at native pixels on resize — crisp text, width tracks the container, height
  // stays the given value. Reflow charts expose `destroy()` to detach the observer.
  responsive?: 'fixed' | 'scale' | 'reflow' | boolean;
  // SVG overflow. 'hidden' (default) clips marks to the viewport; 'visible' lets
  // content in the margin band show — needed for radial/gauge axis labels that
  // sit just outside the plot area.
  overflow?: 'hidden' | 'visible';
  renderer?: any;
  // Chart-level scale overrides, keyed by channel ('x', 'y', 'fill', 'size', …).
  // Scales are GLOBAL per channel, so this is their honest home; a channel's own
  // `scale` is the shorthand for the single-mark case. This wins over it. No
  // `domain` here either — that is the schema's.
  scales?: Record<string, ScaleSpec>;
  // Geographic projection for geo* marks (Plot model). Replaces x/y placement for
  // map elicitation: `"mercator"`, `{ type, domain, rotate, … }`, or a live
  // d3.geo* instance. When set, auto axes default off; use geoBasemap / geoPoint /
  // geoLine / geoPolygon / geoRect with edit.geo.*.
  projection?: string | ProjectionSpec | ProjectionContext | ((...args: any[]) => any) | any;
  // Initial stage index for multi-stage elicitation. Edits carrying a `stage`
  // are active only when it equals the current stage (see Edit.stage).
  stage?: number;
  // Optional labels for stages (index -> name). Surfaced via getStageLabel() and
  // the second argument of on('stage', (index, label) => …).
  stageLabels?: (string | null)[];
  [key: string]: any;
}

// The DOM element Elicit returns: the chart container plus a small observation
// API over the belief-data store. `getData`/`setData` read/replace the committed
// dataset; `on` subscribes to commits and stage changes. These add no interaction
// path — edits + constraints remain the only way a gesture mutates data.
export interface ElicitElement extends HTMLDivElement {
  // A deep copy of the committed dataset.
  getData(): Datum[];
  // A deep copy of the engine-owned schema, including any DOMAIN an editable axis
  // (edit.axis.*) reshaped. The caller's original spec.schema is never mutated.
  getSchema(): Schema;
  // Replace the dataset and re-render. Bypasses constraints (trusted seed/reset).
  setData(data: Datum[]): void;
  // Subscribe to committed changes ('change': (data)) or stage advances
  // ('stage': (stageIndex, stageLabel?)). Returns an unsubscribe function.
  on(type: 'change' | 'stage', cb: (...args: any[]) => void): () => void;
  // Multi-stage controls (see ElicitSpec.stage). getStage reads the current index.
  getStage(): number;
  // Optional label for the current stage (from ElicitSpec.stageLabels), or null.
  getStageLabel(): string | null;
  setStage(stage: number): void;
  nextStage(): void;
  // Detach the ResizeObserver used by `responsive: 'reflow'`. No-op otherwise;
  // call it when unmounting a reflow chart. Present on every element.
  destroy(): void;
}
