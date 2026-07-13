'use client';

import code from './freehand-draw-a-path-as-you-drag.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Freehand — draw a path as you drag",
  blurb: "On an order:\"sequence\" line, draw samples the pointer by distance and appends points in creation order. It stays one path: a later drag over the line reshapes it, a drag in empty space extends the same line (in draw order) rather than starting a new one. (Pass into:\"new\" to start fresh lines.)",
  try: "<b>Press and drag</b> to draw a path · <b>drag over it</b> to reshape · <b>drag elsewhere</b> to keep extending the same line.",
};

export { code };

export default function FreehandDrawAPathAsYouDrag({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
