'use client';

import code from './a-bar-mark.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A bar mark",
  blurb: "x is a band of categories, y a linear value, fill a constant. This is a complete, static Elicit spec.",
};

export { code };

export default function ABarMark({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
