import type { BuilderAction, BuilderState, InstanceId, MarkFamilyId } from './types';
import { markByFamily } from './marks.manifest';

let seq = 0;
export function newId(): InstanceId {
  seq += 1;
  return `n${seq}`;
}

export function defaultStarter(): BuilderState {
  return {
    schema: [
      { id: newId(), name: 'category', type: 'categorical', domain: 'A, B, C, D', default: '' },
      { id: newId(), name: 'value', type: 'quantitative', domain: '0, 100', default: '' },
    ],
    dataJson: JSON.stringify(
      [
        { category: 'A', value: 20 },
        { category: 'B', value: 45 },
        { category: 'C', value: 30 },
        { category: 'D', value: 60 },
      ],
      null,
      2
    ),
    mark: {
      family: 'bar',
      orientation: 'auto',
      channels: { x: { field: 'category' }, y: { field: 'value' } },
      options: {},
      style: { fill: 'steelblue' },
    },
    edits: [{ id: newId(), name: 'move', options: {} }],
    constraints: [],
    scales: {},
    theme: { preset: 'default', overrides: {}, advancedJson: '' },
  };
}

/** Seed the new mark's channels, carrying over any binding for a channel the
 * old mark shared (x/y are common to every buildable mark) so switching marks
 * keeps the chart populated instead of blanking it. */
function channelsForFamily(
  family: MarkFamilyId,
  previous: BuilderState['mark']['channels']
): BuilderState['mark']['channels'] {
  const entry = markByFamily(family);
  const channels: BuilderState['mark']['channels'] = {};
  for (const ch of entry.channels) channels[ch] = previous[ch] ?? { field: '' };
  return channels;
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_MARK_FAMILY': {
      const entry = markByFamily(action.family);
      return {
        ...state,
        mark: {
          family: action.family,
          orientation: 'auto',
          channels: channelsForFamily(action.family, state.mark.channels),
          options: {},
          style: state.mark.style,
        },
        // Line-scoped edits only make sense on a series-supporting mark.
        edits: entry.supportsSeries ? state.edits : state.edits.filter((e) => !e.name.startsWith('edit.line.')),
      };
    }
    case 'SET_ORIENTATION':
      return { ...state, mark: { ...state.mark, orientation: action.orientation } };
    case 'SET_CHANNEL':
      return {
        ...state,
        mark: { ...state.mark, channels: { ...state.mark.channels, [action.channel]: action.binding } },
      };
    case 'SET_MARK_OPTION':
      return {
        ...state,
        mark: { ...state.mark, options: { ...state.mark.options, [action.name]: action.value } },
      };
    case 'SET_STYLE':
      return {
        ...state,
        mark: { ...state.mark, style: { ...state.mark.style, [action.name]: action.value } },
      };
    case 'ADD_EDIT':
      return { ...state, edits: [...state.edits, { id: newId(), name: action.name, options: {} }] };
    case 'REMOVE_EDIT':
      return { ...state, edits: state.edits.filter((e) => e.id !== action.id) };
    case 'SET_EDIT_OPTION':
      return {
        ...state,
        edits: state.edits.map((e) =>
          e.id === action.id ? { ...e, options: { ...e.options, [action.name]: action.value } } : e
        ),
      };
    case 'ADD_CONSTRAINT':
      return {
        ...state,
        constraints: [...state.constraints, { id: newId(), name: action.name, options: {} }],
      };
    case 'REMOVE_CONSTRAINT':
      return { ...state, constraints: state.constraints.filter((c) => c.id !== action.id) };
    case 'SET_CONSTRAINT_OPTION':
      return {
        ...state,
        constraints: state.constraints.map((c) =>
          c.id === action.id ? { ...c, options: { ...c.options, [action.name]: action.value } } : c
        ),
      };
    case 'SET_SCALE_TYPE':
      return {
        ...state,
        scales: { ...state.scales, [action.channel]: { type: action.scaleType, options: {} } },
      };
    case 'SET_SCALE_OPTION': {
      const current = state.scales[action.channel];
      if (!current) return state;
      return {
        ...state,
        scales: {
          ...state.scales,
          [action.channel]: { ...current, options: { ...current.options, [action.name]: action.value } },
        },
      };
    }
    case 'CLEAR_SCALE': {
      const { [action.channel]: _removed, ...rest } = state.scales;
      return { ...state, scales: rest };
    }
    case 'SET_THEME_PRESET':
      return { ...state, theme: { ...state.theme, preset: action.preset } };
    case 'SET_THEME_OVERRIDE':
      return {
        ...state,
        theme: { ...state.theme, overrides: { ...state.theme.overrides, [action.name]: action.value } },
      };
    case 'SET_THEME_ADVANCED':
      return { ...state, theme: { ...state.theme, advancedJson: action.json } };
    case 'ADD_SCHEMA_FIELD':
      return {
        ...state,
        schema: [...state.schema, { id: newId(), name: '', type: 'quantitative', domain: '', default: '' }],
      };
    case 'REMOVE_SCHEMA_FIELD':
      return { ...state, schema: state.schema.filter((f) => f.id !== action.id) };
    case 'SET_SCHEMA_FIELD':
      return {
        ...state,
        schema: state.schema.map((f) => (f.id === action.id ? { ...f, ...action.patch } : f)),
      };
    case 'SET_DATA_JSON':
      return { ...state, dataJson: action.json };
    case 'LOAD_STARTER':
      return action.state;
    case 'RESET':
      return defaultStarter();
    default:
      return state;
  }
}
