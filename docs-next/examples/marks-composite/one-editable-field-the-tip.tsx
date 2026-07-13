'use client';

import code from './one-editable-field-the-tip.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "One editable field (the tip)",
  blurb: "The stem is a span ruleX (baseline → value); the tip point edits value.",
  try: "<b>Drag</b> a lollipop tip up or down.",
};

export { code };

export default function OneEditableFieldTheTip({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
