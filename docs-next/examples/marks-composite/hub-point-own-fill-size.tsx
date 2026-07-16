'use client';

import code from './hub-point-own-fill-size.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: 'Same group angle; hub point with its own fill/size',
  blurb:
    'Add a square hub as a third part. It inherits x/y/angle from the ' +
    'group but sets its own shape, fill, and size — part channels win ' +
    'for those names. rotate() still lives on the last part.',
  try: '<b>Drag</b> the hub (last part) to spin the whole glyph.',
};

export { code };

export default function HubPointOwnFillSize({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
