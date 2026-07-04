import { ScaleLinear, ScaleBand, ScaleOrdinal } from 'd3';

export type Datum = Record<string, any>;

export type ScaleType = 'linear' | 'band' | 'point' | 'ordinal' | 'sequential';

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
  text?: string;
  fontSize?: number;
  textAnchor?: string;
  data?: Datum;
  index?: number;
  featureId?: string;
  interactors?: { type: string; featureId: string }[];
  [key: string]: any;
}

export interface ElicitSpec {
  width?: number;
  height?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  features?: any[];
  guides?: any[];
  renderer?: any;
  x?: { type?: ScaleType; domain?: any[]; range?: any[] };
  y?: { type?: ScaleType; domain?: any[]; range?: any[] };
  [key: string]: any;
}
