'use client';

import code from './the-same-thing-plain-api-3.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "The same thing, plain API",
  blurb: "Two band axes + toggle + unique; cellGrid defined inline.",
  try: "same look — change pad, fills, or the accent.",
};

export { code };

export default function TheSameThingPlainApi3({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
