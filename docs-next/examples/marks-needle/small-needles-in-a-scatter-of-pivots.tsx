'use client';

import code from './small-needles-in-a-scatter-of-pivots.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Small needles in a scatter of pivots",
  blurb: "Group on x, layer on y, belief on angle. Cartesian axes frame the pivots.",
  try: "<b>Drag</b> any small needle to change that cell’s belief.",
};

export { code };

export default function SmallNeedlesInAScatterOfPivots({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
