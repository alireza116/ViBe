'use client';

import code from './override-just-the-answer-mark.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Override just the answer mark",
  blurb: "Same rings as the Likert twin; only the committed answer is recoloured.",
  try: "click an option — amber dot in slate rings.",
};

export { code };

export default function OverrideJustTheAnswerMark({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
