'use client';

import code from './move-only.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Move only",
  blurb: "brushRect({ resize: \"none\" }) — no edges grab; the whole rect translates.",
  try: "<b>Drag</b> anywhere in the rect to move it (edges do nothing).",
};

export { code };

export default function MoveOnly({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
