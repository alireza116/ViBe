'use client';

import code from './the-same-thing-plain-api-2.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "The same thing, plain API",
  blurb: "toggle + unique + count; rings defined inline.",
  try: "same look — swap max, options, or fill to customize.",
};

export { code };

export default function TheSameThingPlainApi2({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
