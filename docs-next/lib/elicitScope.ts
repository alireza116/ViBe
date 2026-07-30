'use client';

/**
 * Live-example scope: what an example on the docs site can name without importing.
 * Universal edits are bare (`move()`); scoped namespaces stay under `edit.*`.
 */
import * as elicit from '@elicit';
import * as d3 from 'd3';
import vancouver from '../data/vancouver.js';

// The scoped namespaces are held back so they don't shadow the same-named MARKS
// spread from elicit.plot (axis / arc / waffle / line).
const {
  line: _editLine,
  axis: _editAxis,
  arc: _editArc,
  geo: _editGeo,
  waffle: _editWaffle,
  // The legend pickers stay under `edit.*` so the same-named `legend` MARK (from
  // elicit.plot) — and its `legendColor`/`legendSize`/`legendSymbol` siblings — win
  // the bare name, the way axis/arc/waffle marks win over their edit namespaces.
  legend: _editLegend,
  legendValue: _editLegendValue,
  nextSeriesKey: _nsk,
  when: _editWhen,
  ...universalEdits
} = elicit.edit;

export function createElicitScope() {
  return {
    ...elicit.plot,
    ...elicit.constraints,
    ...universalEdits,
    Elicit: elicit.Elicit,
    when: elicit.when,
    edit: elicit.edit,
    guides: elicit.guides,
    widgets: elicit.widgets,
    format: elicit.format,
    D3Renderer: elicit.D3Renderer,
    CanvasRenderer: elicit.CanvasRenderer,
    // Theme layer: `themes` (built-ins), `setTheme` (app-wide), `resolveTheme`.
    themes: elicit.themes,
    setTheme: elicit.setTheme,
    resolveTheme: elicit.resolveTheme,
    d3,
    vancouver,
  };
}

export type ElicitScope = ReturnType<typeof createElicitScope>;
