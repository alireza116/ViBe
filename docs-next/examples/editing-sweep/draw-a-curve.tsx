'use client';

import code from './draw-a-curve.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draw a curve",
  blurb: "edit: drag({ pick: \"sweep\" }) on the value channel; the x positions stay fixed.",
  try: "<b>Sweep</b> left-to-right across the chart.",
};

export { code };

export default function DrawACurve({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
