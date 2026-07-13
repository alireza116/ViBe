'use client';

import code from './grow-the-chart-instead.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Grow the chart instead",
  blurb: "mode: 'grow' holds the data's scale constant and resizes the chart.",
  try: "<b>Drag</b> the x-axis max handle — the chart itself grows/shrinks.",
};

export { code };

export default function GrowTheChartInstead({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
