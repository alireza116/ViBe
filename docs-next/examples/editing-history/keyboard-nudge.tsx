'use client';

import code from './keyboard-nudge.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Arrow keys move a point",
  blurb: "No option to set: a mark that takes a drag takes the keyboard too.",
  try: "<b>Tab</b> until a dot is focused, then use the <b>arrow keys</b> — 1% of the domain a press, <b>Shift+arrow</b> for 10%. Hold an arrow at the edge: the clamp stops it exactly where a drag would.",
};

export { code };

export default function KeyboardNudge({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
