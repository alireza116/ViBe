'use client';

import code from './valence-arousal.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Valence × arousal",
  blurb: "The two-field emotion preset. The mouth and eyes are the drag targets themselves.",
  try: "<b>Drag the mouth</b> up/down (valence) or <b>drag an eye</b> up/down (arousal).",
};

export { code };

export default function ExampleValenceArousal({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
