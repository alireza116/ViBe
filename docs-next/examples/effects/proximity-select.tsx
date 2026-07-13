'use client';

import code from './proximity-select.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Proximity select",
  blurb: "Move near a dot to select it; drag from empty space to grab the nearest.",
  try: "<b>Move</b> near a dot to select it · <b>Drag</b> from empty space to grab the nearest.",
};

export { code };

export default function ProximitySelect({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
