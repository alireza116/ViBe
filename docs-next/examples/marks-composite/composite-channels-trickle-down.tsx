'use client';

import code from './composite-channels-trickle-down.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: 'Shared x/y/angle; per-part stroke on crossing ticks',
  blurb:
    'A + from tickY (horizontal) + tickX (vertical). Group channels bind ' +
    'position and angle once; each tick keeps its own stroke / length. ' +
    'The last part holds the inherited rotate() edit.',
  try: '<b>Drag</b> the darker (vertical) arm of a + to spin it.',
};

export { code };

export default function CompositeChannelsTrickleDown({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
