'use client';

import code from './fruit-counts.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Fruit counts",
  blurb: "Static waffle; y domain 0–320, one cell = 10 fruit (32 cells tall), multiple auto-picked square.",
};

export { code };

export default function FruitCounts({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
