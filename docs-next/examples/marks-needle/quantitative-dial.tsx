'use client';

import code from './quantitative-dial.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Quantitative dial",
  blurb: "Rotate anywhere around the hub.",
  try: "<b>Drag</b> around the dial.",
};

export { code };

export default function QuantitativeDial({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
