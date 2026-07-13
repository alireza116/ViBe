'use client';

import code from './donut-four-slices.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Donut, four slices",
  blurb: "Four slices → four handles; drag the seam to trade the last and first slice.",
  try: "<b>Drag</b> any edge — the two adjacent slices rebalance.",
};

export { code };

export default function DonutFourSlices({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
