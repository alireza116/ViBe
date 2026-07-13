'use client';

import code from './rescale-in-place.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Rescale in place",
  blurb: "Dragging the end-handle rewrites x's schema domain; the grid follows.",
  try: "<b>Drag</b> the blue handle at either end of the x-axis.",
};

export { code };

export default function RescaleInPlace({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
