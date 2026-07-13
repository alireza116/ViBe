'use client';

import code from './remove-a-whole-line.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Remove a whole line",
  blurb: "remove deletes one anchor; edit.line.removeSeries() deletes the whole line — click any point on a line to remove it. The delete counterpart to anchor / newSeries / draw.",
  try: "<b>Alt-click</b> a point to delete just that anchor · <b>click</b> a point to remove its entire line.",
};

export { code };

export default function RemoveAWholeLine({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
