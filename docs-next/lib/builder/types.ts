import type { ApiOption } from '../types';

/** Mirrors `src/types.d.ts`'s `MeasureType` / `ScaleType` unions (not imported —
 * that file isn't a module docs-next's tsconfig pulls in). */
export type MeasureType = 'quantitative' | 'categorical' | 'ordinal' | 'temporal';
export type ScaleKind =
  | 'linear' | 'log' | 'symlog' | 'pow' | 'sqrt' | 'time'
  | 'band' | 'point' | 'ordinal' | 'sequential' | 'diverging';

export type OptionValue = string | number | boolean | undefined;

/** A positional channel (x/y/x1/x2/y1/y2) is always bound to a schema field —
 * it goes through the scale, the same `datum` half of the `value`-vs-`datum`
 * split `CLAUDE.md` documents. Style channels (fill/stroke/size/…) stay
 * constants on `MarkState.style` — the `value` half, and the overwhelmingly
 * common case (`fill: 'steelblue'`); a field-bound colour scale is still
 * reachable by hand-editing the generated code. */
export type ChannelBinding = { field: string };

export type MarkFamilyId =
  | 'bar' | 'rect' | 'area' | 'tick' | 'point' | 'line' | 'text' | 'dotStack' | 'waffle'
  | 'arc' | 'needle' | 'axisRadial' | 'cone' | 'trend' | 'legend'
  | 'axis' | 'grid' | 'rule' | 'composite' | 'face' | 'symbol' | 'geo';

export type MarkState = {
  family: MarkFamilyId;
  orientation: 'auto' | 'x' | 'y';
  channels: Record<string, ChannelBinding>;
  options: Record<string, OptionValue>;
  style: Record<string, OptionValue>;
};

export type InstanceId = string;

export type EditInstance = {
  id: InstanceId;
  name: string; // e.g. 'move', 'line.draw'
  options: Record<string, OptionValue>;
};

export type ConstraintInstance = {
  id: InstanceId;
  name: string;
  options: Record<string, OptionValue>;
};

export type ScaleState = {
  type: ScaleKind;
  options: Record<string, OptionValue>;
};

export type SchemaFieldState = {
  id: InstanceId;
  name: string;
  type: MeasureType;
  domain: string; // comma-separated, parsed at serialize time
  default: string;
};

export type ThemeState = {
  preset: 'default' | 'survey' | 'dark';
  overrides: Record<string, OptionValue>;
  advancedJson: string;
};

export type BuilderState = {
  schema: SchemaFieldState[];
  dataJson: string;
  mark: MarkState;
  edits: EditInstance[];
  constraints: ConstraintInstance[];
  scales: Record<string, ScaleState>;
  theme: ThemeState;
};

export type BuilderAction =
  | { type: 'SET_MARK_FAMILY'; family: MarkFamilyId }
  | { type: 'SET_ORIENTATION'; orientation: MarkState['orientation'] }
  | { type: 'SET_CHANNEL'; channel: string; binding: ChannelBinding }
  | { type: 'SET_MARK_OPTION'; name: string; value: OptionValue }
  | { type: 'SET_STYLE'; name: string; value: OptionValue }
  | { type: 'ADD_EDIT'; name: string }
  | { type: 'REMOVE_EDIT'; id: InstanceId }
  | { type: 'SET_EDIT_OPTION'; id: InstanceId; name: string; value: OptionValue }
  | { type: 'ADD_CONSTRAINT'; name: string }
  | { type: 'REMOVE_CONSTRAINT'; id: InstanceId }
  | { type: 'SET_CONSTRAINT_OPTION'; id: InstanceId; name: string; value: OptionValue }
  | { type: 'SET_SCALE_TYPE'; channel: string; scaleType: ScaleKind }
  | { type: 'SET_SCALE_OPTION'; channel: string; name: string; value: OptionValue }
  | { type: 'CLEAR_SCALE'; channel: string }
  | { type: 'SET_THEME_PRESET'; preset: ThemeState['preset'] }
  | { type: 'SET_THEME_OVERRIDE'; name: string; value: OptionValue }
  | { type: 'SET_THEME_ADVANCED'; json: string }
  | { type: 'ADD_SCHEMA_FIELD' }
  | { type: 'REMOVE_SCHEMA_FIELD'; id: InstanceId }
  | { type: 'SET_SCHEMA_FIELD'; id: InstanceId; patch: Partial<SchemaFieldState> }
  | { type: 'SET_DATA_JSON'; json: string }
  | { type: 'LOAD_STARTER'; state: BuilderState }
  | { type: 'RESET' };

export type { ApiOption };
