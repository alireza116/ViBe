'use client';

import code from './draggable-numeric-readout.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draggable numeric readout",
  blurb: "The label IS the value: text and y read the same field, and drag() on y rewrites it — so the number updates as you drag. format keeps the display tidy.",
  try: "<b>Drag</b> the number up or down.",
};

export { code };

export default function DraggableNumericReadout({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
