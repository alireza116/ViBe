'use client';

import code from './nearest-pick-from-empty-space.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Nearest pick from empty space",
  blurb: "A 2D nearest drag: move near a dot to select it, drag from empty space to grab the closest.",
  try: "<b>Drag</b> from anywhere near a dot to grab it.",
};

export { code };

export default function NearestPickFromEmptySpace({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
