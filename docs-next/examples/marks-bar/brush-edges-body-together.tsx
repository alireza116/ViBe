'use client';

import code from './brush-edges-body-together.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Brush: edges + body together",
  blurb: "brushSpan() combines both: grab near an edge to resize just that end, grab the body to move the whole span. Drag an edge past the other and release — the fields re-sort (start stays ≤ end) with no visual jump.",
  try: "<b>Drag</b> an edge to resize it, the body to move the whole bar, or drag one edge past the other to see it flip.",
};

export { code };

export default function BrushEdgesBodyTogether({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
