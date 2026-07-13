'use client';

import code from './banded-likelihood-arc.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Banded likelihood arc",
  blurb: "Seven categories across a top-facing semicircle, colored by reversed RdBu (blue→red).",
};

export { code };

export default function BandedLikelihoodArc({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
