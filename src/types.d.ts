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
  // The dataset schema, so a `create` edit can mint a datum carrying every
  // declared field (its default or null), not only the positional ones.
  schema?: Schema;
  xKey: string;
  yKey: string;
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
  guide?: (ctx: any) => any[];
}

export interface Edit {
  type: string;
  gesture: string;
  channels: string[] | null;
  when: ((ctx: EditContext) => boolean) | null;
  pick: 'direct' | 'nearest' | 'plane';
  threshold: number;
  constrain: Constraint[];
  guide: boolean | null;
  guideColor: string | null;
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
  size?: ChannelSpec;
  color?: ChannelSpec;
  [channel: string]: ChannelSpec | undefined;
}

// The shared option surface for every mark factory (bar, point, and new marks).
// `encoding` carries the channels; the style shorthands are sugar that desugar
// into constant channels via normalizeMarkOptions (explicit `encoding` wins).
export interface MarkOptions {
  data?: Datum[];
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
  constraints?: Constraint[];
  interactors?: any[];
  onChange?: (data: Datum[]) => void;
  [key: string]: any;
}

export interface FeatureNode {
  type: 'circle' | 'rect' | 'line' | 'text';
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
  interactors?: { type: string; featureId: string }[];
  [key: string]: any;
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
  // Global axis convenience: `false` = no axes; `{ x, y }` = per-channel config or
  // `false` to suppress that channel; omitted = default axes on both positional
  // channels. Desugars into composable axis/grid marks.
  axes?: false | { x?: AxisSpec | false; y?: AxisSpec | false };
  // The elicited-dataset schema (field -> measurement type/domain/default). Lets a
  // chart resolve scales and mint data with zero starter data; ranked above data
  // inference but below an explicit per-channel type/domain or top-level x/y.
  schema?: Schema;
  // Customizable interaction-effects layer (grab / proximity-select).
  effects?: EffectsSpec;
  guides?: any[];
  renderer?: any;
  x?: { type?: ScaleType; domain?: any[]; range?: any[] };
  y?: { type?: ScaleType; domain?: any[]; range?: any[] };
  [key: string]: any;
}
