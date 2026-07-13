'use client';

import code from './both-handles-at-once.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Both handles at once",
  blurb: "Omit the stages (default null) to leave both handles always active.",
};

export { code };

export default function BothHandlesAtOnce({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
