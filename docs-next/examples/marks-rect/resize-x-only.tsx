'use client';

import code from './resize-x-only.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Resize x only",
  blurb: "brushRect({ resize: \"x\" }) — only the vertical edges resize; body still moves.",
  try: "<b>Drag</b> a left/right edge to resize width; the body to move.",
};

export { code };

export default function ResizeXOnly({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
