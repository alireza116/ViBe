'use client';

import code from './allocation.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Allocation",
  blurb: "Bars that redistribute to keep a fixed sum.",
  try: "<b>Drag</b> a bar — siblings rebalance to 100.",
};

export { code };

export default function Allocation({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
