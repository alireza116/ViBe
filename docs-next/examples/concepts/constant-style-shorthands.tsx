'use client';

import code from './constant-style-shorthands.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Constant style shorthands",
  blurb: "stroke, strokeWidth, opacity as top-level shorthands on a point — a constant channel needs no scale.",
};

export { code };

export default function ConstantStyleShorthands({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
