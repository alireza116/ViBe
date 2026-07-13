'use client';

import code from './colour-by-a-field.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Colour by a field",
  blurb: "fill: { field: \"kind\" } tints each bar through the ordinal palette.",
};

export { code };

export default function ColourByAField({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
