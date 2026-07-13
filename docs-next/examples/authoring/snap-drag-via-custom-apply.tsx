'use client';

import code from './snap-drag-via-custom-apply.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Snap-drag via custom apply",
  blurb: "Invert y, then round to the nearest 10.",
  try: "<b>Drag</b> the point — it lands on multiples of 10.",
};

export { code };

export default function SnapDragViaCustomApply({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
