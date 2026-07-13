'use client';

import code from './fills-the-parent-width.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Fills the parent width",
  blurb: "the same spec at responsive: \"scale\"; the SVG scales to this card via a viewBox.",
};

export { code };

export default function FillsTheParentWidth({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
