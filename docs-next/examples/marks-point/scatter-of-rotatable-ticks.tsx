'use client';

import code from './scatter-of-rotatable-ticks.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: 'Scatter of rotatable ticks',
  blurb:
    'tickX with length centres a short vertical segment on (x, y); ' +
    'angle rotates it about that midpoint — a lean / direction marker.',
  try: '<b>Drag</b> a tick to spin it.',
};

export { code };

export default function ScatterOfRotatableTicks({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
