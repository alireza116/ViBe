'use client';

import code from './a-tentative-token.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "A tentative token",
  blurb: "create({ pick: \"probe\" }) shows the dot before it is real. Alt-click removes one.",
  try: "hover a bin, click to drop; alt-click to take back.",
};

export { code };

export default function ATentativeToken({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
