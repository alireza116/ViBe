'use client';

import code from './two-series-swept-independently.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Two series, swept independently",
  blurb: "stroke: { field: \"g\" } both groups and colours the lines.",
  try: "<b>Sweep</b> over one line to reshape it; the other stays put.",
};

export { code };

export default function TwoSeriesSweptIndependently({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
