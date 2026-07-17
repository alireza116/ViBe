'use client';

import code from './undo-a-drag.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Undo a whole drag",
  blurb: "chart.undo() / chart.redo(), with canUndo() / canRedo() driving the buttons.",
  try: "<b>Drag</b> a bar all the way across, then <b>Undo</b> — it goes back in one step, not one pixel at a time. Drag again and the redo branch is dropped.",
};

export { code };

export default function UndoADrag({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
