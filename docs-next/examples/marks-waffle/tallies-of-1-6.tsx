'use client';

import code from './tallies-of-1-6.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Tallies of 1–6",
  blurb: "one cell = one item; counts of 1, 3, 6, 2 — count the cells directly.",
};

export { code };

export default function TalliesOf16({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
