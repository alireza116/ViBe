'use client';

import code from './plain-api-crosshair-as-a-guide.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Plain API — crosshair as a guide",
  blurb: "Full control: multi-line side labels, exact placement. More code.",
  try: "same look and two-step flow as the widget.",
};

export { code };

export default function PlainApiCrosshairAsAGuide({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
