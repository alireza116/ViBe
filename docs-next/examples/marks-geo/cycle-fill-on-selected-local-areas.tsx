'use client';

import code from './cycle-fill-on-selected-local-areas.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Cycle fill on selected local areas",
  blurb: "Kitsilano, Fairview, Mount Pleasant, Downtown — click to cycle category.",
  try: "<b>Click</b> a shaded neighborhood to cycle its colour.",
};

export { code };

export default function CycleFillOnSelectedLocalAreas({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
