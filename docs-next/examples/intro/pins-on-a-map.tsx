'use client';

import code from './pins-on-a-map.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Best place to live",
  blurb: "Click the map to drop pins for places you’d live; drag a pin to fine-tune.",
  try: "<b>Click</b> to place a pin · <b>drag</b> an existing one.",
};

export { code };

export default function PinsOnAMap({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
