'use client';

import code from './the-same-thing-plain-api.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "The same thing, plain API",
  blurb: "Same mark, edit, and constraint — rings/prompt defined inline as guides.",
  try: "same look, same interaction — change any line to customize.",
};

export { code };

export default function TheSameThingPlainApi({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
