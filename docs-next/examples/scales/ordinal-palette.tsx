'use client';

import code from './ordinal-palette.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Ordinal palette",
  blurb: "fill: { field: \"kind\" } assigns palette colours across the category domain.",
};

export { code };

export default function OrdinalPalette({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
