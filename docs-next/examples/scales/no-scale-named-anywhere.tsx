'use client';

import code from './no-scale-named-anywhere.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "No scale named anywhere",
  blurb: "Data type (schema) + what the mark needs = the scale. Drag a bar to see it invert.",
  try: "<b>Drag</b> a bar.",
};

export { code };

export default function NoScaleNamedAnywhere({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
