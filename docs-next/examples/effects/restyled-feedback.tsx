'use client';

import code from './restyled-feedback.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Restyled feedback",
  blurb: "Indigo ring, thicker outline, softer grab — paint channels untouched.",
  try: "<b>Move</b> / <b>drag</b> — indigo ring, thicker outline, softer grab.",
};

export { code };

export default function RestyledFeedback({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
