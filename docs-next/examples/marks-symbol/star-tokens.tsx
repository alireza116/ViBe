'use client';

import code from './star-tokens.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Star tokens",
  blurb: "dotStack of ⭐ tokens; click a slot to add, click a star to remove.",
  try: "<b>Click</b> a column to add a ⭐, <b>click</b> a ⭐ to remove it.",
};

export { code };

export default function ExampleStarTokens({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
