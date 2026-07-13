'use client';

import code from './field-driven-colour-ordinal-palette.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Field-driven colour (ordinal palette)",
  blurb: "channels: { fill: { field: \"kind\" } } — a category drives fill through the ordinal palette.",
};

export { code };

export default function FieldDrivenColourOrdinalPalette({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
