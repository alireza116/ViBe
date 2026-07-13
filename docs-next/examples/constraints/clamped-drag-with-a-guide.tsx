'use client';

import code from './clamped-drag-with-a-guide.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Clamped drag with a guide",
  blurb: "The y edit is clamped to 0–90; guide: true draws the bounds and the snap ring.",
  try: "<b>Drag</b> from anywhere in a column (clamped to 0–90).",
};

export { code };

export default function ClampedDragWithAGuide({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
