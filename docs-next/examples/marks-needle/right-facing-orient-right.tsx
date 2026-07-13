'use client';

import code from './right-facing-orient-right.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Right-facing (orient: \"right\")",
  blurb: "Same data; arc on the right — set scale.range to [-90, 90].",
};

export { code };

export default function RightFacingOrientRight({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
