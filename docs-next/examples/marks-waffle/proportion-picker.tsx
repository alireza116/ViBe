'use client';

import code from './proportion-picker.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Proportion picker",
  blurb: "click or drag; unit = 1/50 makes 50 countable cells, waffleFill lands exactly on the cell you point at.",
  try: "click a cell, or drag up/down.",
};

export { code };

export default function ProportionPicker({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
