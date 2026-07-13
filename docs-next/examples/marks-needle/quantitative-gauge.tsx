'use client';

import code from './quantitative-gauge.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Quantitative gauge",
  blurb: "Domain [0, 100] maps to [180°, 0°] (left → right). Drag the needle.",
  try: "<b>Drag</b> the needle left or right.",
};

export { code };

export default function QuantitativeGauge({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
