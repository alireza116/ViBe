'use client';

import code from './two-lines-swept-independently.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Two lines, swept independently",
  blurb: "The sweep touches only the line it started nearest to.",
  try: "<b>Sweep</b> over one line to reshape it; the other stays put.",
};

export { code };

export default function TwoLinesSweptIndependently({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
