'use client';

import code from './ranking.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Ranking",
  blurb: "Drag items to reorder (edit.rank under the hood).",
  try: "<b>Drag</b> a dot up or down to swap ranks.",
};

export { code };

export default function Ranking({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
