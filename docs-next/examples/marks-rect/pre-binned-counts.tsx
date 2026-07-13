'use client';

import code from './pre-binned-counts.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Pre-binned counts",
  blurb: "x1/x2 place each bin on a shared quantitative x; y is the count.",
};

export { code };

export default function PreBinnedCounts({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
