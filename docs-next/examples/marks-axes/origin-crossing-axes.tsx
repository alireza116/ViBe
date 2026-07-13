'use client';

import code from './origin-crossing-axes.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Origin-crossing axes",
  blurb: "transform moves each axis to the zero line on the other scale.",
};

export { code };

export default function OriginCrossingAxes({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
