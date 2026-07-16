'use client';

import code from './world-cup-goals.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "World Cup goals",
  blurb: "A constant symbol: '⚽' — one glyph for every point, no scale. The elicited value is goals; drag a ball up or down to set it.",
  try: "<b>Drag</b> a ⚽ up or down to change that stage's goals.",
};

export { code };

export default function ExampleWorldCupGoals({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
