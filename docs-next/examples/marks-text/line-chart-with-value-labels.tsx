'use client';

import code from './line-chart-with-value-labels.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Line chart with value labels",
  blurb: "lineY draws the series; text sits on the same (x, y) with dy above each point.",
};

export { code };

export default function LineChartWithValueLabels({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
