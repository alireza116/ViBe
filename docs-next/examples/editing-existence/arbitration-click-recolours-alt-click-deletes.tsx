'use client';

import code from './arbitration-click-recolours-alt-click-deletes.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Arbitration — click recolours, Alt-click deletes",
  blurb: "cycle and remove share the click gesture; when (noAlt vs alt) decides which one claims it.",
  try: "<b>Click</b> a dot to recolour · <b><kbd>Alt</kbd>+click</b> to delete · <b>Drag</b> to move.",
};

export { code };

export default function ArbitrationClickRecoloursAltClickDeletes({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
