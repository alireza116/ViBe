'use client';

import code from './curve-catmullrom.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "curve: \"catmullRom\"",
  blurb: "A smooth line through the points. Try \"linear\" or \"step\" for other shapes.",
};

export { code };

export default function CurveCatmullrom({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
