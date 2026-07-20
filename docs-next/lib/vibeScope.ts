'use client';

/**
 * Live-example scope: what an example on the docs site can name without importing.
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
  // The legend pickers stay under `edit.*` so the same-named `legend` MARK (from
  // vibe.plot) — and its `legendColor`/`legendSize`/`legendSymbol` siblings — win
  // the bare name, the way axis/arc/waffle marks win over their edit namespaces.
  legend: _editLegend,
  legendValue: _editLegendValue,
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
    D3Renderer: vibe.D3Renderer,
    CanvasRenderer: vibe.CanvasRenderer,
    // Theme layer: `themes` (built-ins), `setTheme` (app-wide), `resolveTheme`.
    themes: vibe.themes,
    setTheme: vibe.setTheme,
    resolveTheme: vibe.resolveTheme,
    d3,
    vancouver,
  };
}

export type VibeScope = ReturnType<typeof createVibeScope>;
