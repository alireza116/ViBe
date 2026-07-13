'use client';

import code from './line-then-cone.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Line, then cone",
  blurb: "Move to aim the line, click. Move to open the cone, click. Both are then frozen.",
  try: "move the mouse, click, move again, click.",
};

export { code };

export default function LineThenCone({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
