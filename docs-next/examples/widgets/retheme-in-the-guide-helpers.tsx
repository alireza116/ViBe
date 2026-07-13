'use client';

import code from './retheme-in-the-guide-helpers.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Retheme in the guide helpers",
  blurb: "Colours live in the inline guides and the mark fill — change them there. No shared palette required.",
  try: "hover and click — teal rings, teal answer.",
};

export { code };

export default function RethemeInTheGuideHelpers({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
