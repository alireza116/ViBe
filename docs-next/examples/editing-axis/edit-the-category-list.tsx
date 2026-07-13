'use client';

import code from './edit-the-category-list.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

export const meta: ExampleMeta = {
  title: "Edit the category list",
  blurb: "Double-click ＋ to add · double-click a label to rename · click × to remove.",
  try: "<b>Double-click</b> ＋ to add a bar · <b>double-click</b> a label to rename · <b>click</b> × to remove.",
};

export { code };

export default function EditTheCategoryList({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
