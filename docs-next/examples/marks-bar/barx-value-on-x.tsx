'use client';

import code from './barx-value-on-x.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "barX — value on x",
  blurb: "y is the category band, x the linear value drawn rightward from the baseline.",
};

export { code };

export default function BarxValueOnX({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
