'use client';

import code from './line-cone.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Line + Cone",
  blurb: "Move to aim, click to set. Move to open the cone, click to set that too.",
  try: "move the mouse, click, move again, click.",
};

export { code };

export default function LineCone({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
