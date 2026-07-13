'use client';

import code from './move-shift-resize-click-cycle.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Move · Shift-resize · click-cycle",
  blurb: "when.noShift / when.shift split the drag; cycle() advances the fill category.",
  try: "<b>Drag</b> to move · <b><kbd>Shift</kbd>+drag</b> to resize · <b>Click</b> to recolour.",
};

export { code };

export default function MoveShiftResizeClickCycle({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
