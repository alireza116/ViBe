'use client';

import code from './editable-bin-heights.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Editable bin heights",
  blurb: "Drag on y to reshape the belief distribution; clamp keeps counts ≥ 0.",
  try: "<b>Drag</b> a bin’s top edge to change its count.",
};

export { code };

export default function EditableBinHeights({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
