'use client';

import code from './semi-circle-axis.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Semi-circle axis",
  blurb: "No needle — just the chrome. 0 on the left, 100 on the right.",
};

export { code };

export default function SemiCircleAxis({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
