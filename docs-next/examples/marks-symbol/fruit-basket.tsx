'use client';

import code from './fruit-basket.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Fruit basket",
  blurb: "Each category's cells render its emoji; edit.waffle.fill drags the count.",
  try: "<b>Drag</b> up a column to change its count.",
};

export { code };

export default function ExampleFruitBasket({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
