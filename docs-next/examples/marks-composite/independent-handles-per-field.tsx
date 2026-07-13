'use client';

import code from './independent-handles-per-field.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Independent handles per field",
  blurb: "Each handle is its own mark. The whisker spans lo..hi and follows the caps.",
  try: "<b>Drag</b> the centre dot to move the mean, or a cap to move an end.",
};

export { code };

export default function IndependentHandlesPerField({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
