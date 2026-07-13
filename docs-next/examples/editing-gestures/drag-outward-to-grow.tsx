'use client';

import code from './drag-outward-to-grow.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Drag outward to grow",
  blurb: "resize() maps the gesture radius back to the size field.",
  try: "<b>Drag</b> a dot outward or inward to grow/shrink it.",
};

export { code };

export default function DragOutwardToGrow({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
