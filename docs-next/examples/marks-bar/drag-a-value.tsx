'use client';

import code from './drag-a-value.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag a value",
  blurb: "y carries edit: drag(). Dragging writes y back through the same scale.",
  try: "<b>Drag</b> a bar up or down.",
};

export { code };

export default function DragAValue({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
