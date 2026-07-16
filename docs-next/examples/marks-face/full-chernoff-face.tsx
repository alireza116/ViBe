'use client';

import code from './full-chernoff-face.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Full Chernoff face",
  blurb: "All seven parameters bound to fields; grab any feature to sculpt the expression.",
  try: "<b>Drag</b> the mouth, eyes, brows, or the eyelid / lip dots.",
};

export { code };

export default function ExampleFullChernoffFace({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
