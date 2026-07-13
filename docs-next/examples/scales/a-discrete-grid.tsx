'use client';

import code from './a-discrete-grid.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A discrete grid",
  blurb: "Both positions are categories, so each dot lands on an (x, y) cell.",
};

export { code };

export default function ADiscreteGrid({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
