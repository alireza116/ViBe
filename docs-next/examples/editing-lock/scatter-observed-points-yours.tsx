'use client';

import code from './scatter-observed-points-yours.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Scatter: observed points + yours",
  blurb: "The five grey points are the seed — try to drag one and nothing happens. Click to add your own, and those you can move and delete.",
  try: "<b>Click</b> empty space to add a point · <b>drag</b> one of yours · <b>Alt-click</b> one of yours to remove it. The grey points never move.",
};

export { code };

export default function ScatterObservedPointsYours({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
