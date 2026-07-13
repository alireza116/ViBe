'use client';

import code from './draw-then-reshape.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Draw, then reshape",
  blurb: "edit.line.draw({ samples: 8 }) on an empty line. First drag draws all eight points; a drag over the line reshapes it, a drag in empty space starts a new one.",
  try: "<b>Press and drag</b> to draw · <b>drag over the line</b> to reshape · <b>drag elsewhere</b> for a new line.",
};

export { code };

export default function DrawThenReshape({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
