'use client';

import code from './bars-that-compensate.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Bars that compensate",
  blurb: "maintainSum bounds the touched bar so the total stays 100; a rule guide marks the even split.",
  try: "<b>Drag</b> any bar — the others compensate.",
};

export { code };

export default function BarsThatCompensate({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
