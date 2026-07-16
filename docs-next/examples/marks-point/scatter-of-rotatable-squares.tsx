'use client';

import code from './scatter-of-rotatable-squares.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: 'Scatter of rotatable squares',
  blurb: "shape: 'square' plus angle with rotate({ pivot: 'mark', fold: false, pick: 'direct' }).",
  try: '<b>Drag</b> a square to spin it.',
};

export { code };

export default function ScatterOfRotatableSquares({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
