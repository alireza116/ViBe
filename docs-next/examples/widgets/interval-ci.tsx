'use client';

import code from './interval-ci.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Interval / CI",
  blurb: "Drag the mean to translate the whole interval; drag a cap to resize one end.",
  try: "<b>Drag</b> the centre — lo/hi follow. <b>Drag</b> a cap — mean stays put.",
};

export { code };

export default function IntervalCi({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
