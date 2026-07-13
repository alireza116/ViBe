'use client';

import code from './drag-a-value-bars.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag a value (bars)",
  blurb: "y carries edit: drag(). The gesture → data path mirrors the data → height encoding.",
  try: "<b>Drag</b> a bar up or down.",
};

export { code };

export default function DragAValueBars({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
