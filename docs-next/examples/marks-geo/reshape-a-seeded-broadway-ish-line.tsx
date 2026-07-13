'use client';

import code from './reshape-a-seeded-broadway-ish-line.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Reshape a seeded Broadway-ish line",
  blurb: "Drag vertex handles on a pre-drawn path.",
  try: "<b>Drag</b> a vertex handle.",
};

export { code };

export default function ReshapeASeededBroadwayIshLine({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
