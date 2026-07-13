'use client';

import code from './sweep-to-draw-the-curve.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Sweep to draw the curve",
  blurb: "The value channel carries a sweep; guide: true shows the paint guide.",
  try: "<b>Sweep</b> left-to-right across the chart — or drag a single handle.",
};

export { code };

export default function SweepToDrawTheCurve({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
