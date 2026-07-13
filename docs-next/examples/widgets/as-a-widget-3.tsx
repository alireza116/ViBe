'use client';

import code from './as-a-widget-3.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "As a widget",
  blurb: "The cell grid is a guide, so it never swallows the click.",
  try: "answer each row; click a row again elsewhere to change it.",
};

export { code };

export default function AsAWidget3({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
