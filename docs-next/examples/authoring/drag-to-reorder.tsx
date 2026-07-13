'use client';

import code from './drag-to-reorder.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag to reorder",
  blurb: "Point scale over ranks; drag swaps with the nearest slot.",
  try: "<b>Drag</b> a point to another rank.",
};

export { code };

export default function DragToReorder({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
