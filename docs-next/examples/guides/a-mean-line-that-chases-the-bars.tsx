'use client';

import code from './a-mean-line-that-chases-the-bars.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A mean line that chases the bars",
  blurb: "guides.rule({ y: ({ data }) => d3.mean(data, (d) => d.y) }) — the annotation reads the dataset.",
  try: "<b>Drag</b> a bar — the fixed target holds, the mean line and the band follow.",
};

export { code };

export default function AMeanLineThatChasesTheBars({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
