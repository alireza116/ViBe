'use client';

import code from './a-labelled-scatter.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A labelled scatter",
  blurb: "point for the dots, text for the labels above them — dy + lineAnchor park the string above the point.",
};

export { code };

export default function ALabelledScatter({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
