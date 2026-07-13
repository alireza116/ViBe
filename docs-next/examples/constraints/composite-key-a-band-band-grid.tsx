'use client';

import code from './composite-key-a-band-band-grid.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Composite key — a band × band grid",
  blurb: "unique({ field: [\"x\",\"y\"] }) allows at most one mark per (x, y) cell.",
  try: "<b>Drag</b> to another cell · <b>Click</b> an empty cell to add · <b><kbd>Alt</kbd>+click</b> to delete.",
};

export { code };

export default function CompositeKeyABandBandGrid({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
