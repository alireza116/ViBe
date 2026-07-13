'use client';

import code from './2d-move-scatter.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "2D move (scatter)",
  blurb: "Both x and y carry edit: drag(), so a dot moves anywhere.",
  try: "<b>Drag</b> a dot anywhere.",
};

export { code };

export default function Example2dMoveScatter({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
