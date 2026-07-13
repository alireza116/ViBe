'use client';

import code from './answer-a-scale.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Answer a survey scale",
  blurb: "A familiar agree/disagree question — hover, then click your answer.",
  try: "Hover across the scale, then <b>click</b> your answer.",
};

export { code };

export default function AnswerAScale({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
