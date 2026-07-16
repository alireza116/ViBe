'use client';

/**
 * Live-example scope — mirrors docs/_harness.js.
 * Universal edits are bare (`drag()`); scoped namespaces stay under `edit.*`.
 */
import * as vibe from '@vibe';
import * as d3 from 'd3';
import vancouver from '../data/vancouver.js';

// The scoped namespaces are held back so they don't shadow the same-named MARKS
// spread from vibe.plot (axis / arc / waffle / line).
const {
  line: _editLine,
  axis: _editAxis,
  arc: _editArc,
  geo: _editGeo,
  waffle: _editWaffle,
  nextSeriesKey: _nsk,
  when: _editWhen,
  ...universalEdits
} = vibe.edit;

export function createVibeScope() {
  return {
    ...vibe.plot,
    ...vibe.constraints,
    ...universalEdits,
    Elicit: vibe.Elicit,
    when: vibe.when,
    edit: vibe.edit,
    guides: vibe.guides,
    widgets: vibe.widgets,
    format: vibe.format,
    d3,
    vancouver,
  };
}

export type VibeScope = ReturnType<typeof createVibeScope>;
