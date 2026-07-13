'use client';

import code from './region-boxes.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Region boxes",
  blurb: "x1/x2 and y1/y2 place each rect; fill by a field.",
};

export { code };

export default function RegionBoxes({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
