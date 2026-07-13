'use client';

import code from './drag-a-value-ticks.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag a value (ticks)",
  blurb: "Same y edit as a bar; pick: \"nearest\" grabs the tick from anywhere in its column.",
  try: "<b>Drag</b> a tick up or down — from anywhere in its column.",
};

export { code };

export default function DragAValueTicks({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
