'use client';

import code from './drag-any-boundary.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag any boundary",
  blurb: "Each handle pair-shifts its two neighbors; the seam handle links the last and first slice.",
  try: "<b>Drag</b> a dot on any slice edge (including the seam at 9 o’clock).",
};

export { code };

export default function DragAnyBoundary({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
