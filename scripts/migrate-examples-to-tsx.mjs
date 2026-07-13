#!/usr/bin/env node
/**
 * One-shot migrator: docs-next/examples (nested .js modules) become
 *   slug.example.js  (readable chart body; IDE source of truth)
 *   slug.tsx         (meta + ?raw import + default ExampleLive wrapper)
 *
 * Also rewrites app page.tsx registries to pass Component when present.
 *
 * Re-runnable: skips folders that already have sibling .example.js files for a slug,
 * but rewrites .tsx / pages if you delete the old .js first.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examplesRoot = join(root, 'docs-next', 'examples');
const appRoot = join(root, 'docs-next', 'app');

/** @param {string} slug */
function toPascalCase(slug) {
  const name = slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
  if (!name) return 'Example';
  // Identifiers cannot start with a digit (e.g. "1d-centered…" → "1dCentered…")
  return /^\d/.test(name) ? `Example${name}` : name;
}

/** @param {string} dir */
function walkJsFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkJsFiles(p, out);
    else if (name.endsWith('.js') && !name.endsWith('.example.js')) out.push(p);
  }
  return out;
}

/** @param {unknown} meta */
function formatMeta(meta) {
  const m = /** @type {{ title?: string, blurb?: string, try?: string }} */ (meta || {});
  const lines = [`  title: ${JSON.stringify(m.title ?? '')},`];
  if (m.blurb != null && m.blurb !== '') {
    lines.push(`  blurb: ${JSON.stringify(m.blurb)},`);
  }
  if (m.try != null && m.try !== '') {
    lines.push(`  try: ${JSON.stringify(m.try)},`);
  }
  return `export const meta: ExampleMeta = {\n${lines.join('\n')}\n};`;
}

/**
 * @param {string} filePath
 * @param {{ title?: string, blurb?: string, try?: string }} meta
 * @param {string} slug
 */
function writeTsx(filePath, meta, slug) {
  const componentName = toPascalCase(slug) || 'Example';
  const body = `'use client';

import code from './${slug}.example.txt';
import { ExampleLive } from '../../components/ExampleLive';
import type { CodeMode, ExampleMeta } from '../../lib/types';

${formatMeta(meta)}

export { code };

export default function ${componentName}({
  codeMode,
  tall,
}: {
  codeMode?: CodeMode;
  tall?: boolean;
}) {
  return <ExampleLive code={code} meta={meta} codeMode={codeMode} tall={tall} />;
}
`;
  writeFileSync(filePath, body);
}

/**
 * Rewrite a page.tsx so each example import becomes
 *   import ExN, { meta as …, code as … } from '…'
 * and the registry includes Component: ExN.
 * @param {string} pagePath
 */
function rewritePage(pagePath) {
  let src = readFileSync(pagePath, 'utf8');
  if (!src.includes('/examples/')) return false;
  // Playground (and similar) only need { meta, code }; extensionless import resolves to .tsx
  if (!/\bconst\s+examples\s*=/.test(src)) return false;
  // Already migrated
  if (/import\s+\w+\s*,\s*\{\s*meta/.test(src) && src.includes('Component:')) {
    return false;
  }

  let n = 0;
  /** @type {Array<{ binding: string, meta: string, code: string }>} */
  const comps = [];

  src = src.replace(
    /import\s+\{\s*meta\s+as\s+(\w+)\s*,\s*code\s+as\s+(\w+)\s*\}\s+from\s+('[^']+'|"[^"]+");/g,
    (_full, metaBind, codeBind, from) => {
      const binding = `Ex${n++}`;
      comps.push({ binding, meta: metaBind, code: codeBind });
      return `import ${binding}, { meta as ${metaBind}, code as ${codeBind} } from ${from};`;
    }
  );

  // Multiline named imports (intro page style)
  src = src.replace(
    /import\s+\{\s*meta\s+as\s+(\w+)\s*,\s*code\s+as\s+(\w+)\s*,?\s*\}\s+from\s+('[^']+'|"[^"]+");/gs,
    (full, metaBind, codeBind, from) => {
      if (full.includes(`import Ex`) || /^import\s+\w+\s*,/.test(full)) return full;
      // Skip if already rewritten by the single-line pass (binding already tracked)
      if (comps.some((c) => c.meta === metaBind)) return full;
      const binding = `Ex${n++}`;
      comps.push({ binding, meta: metaBind, code: codeBind });
      return `import ${binding}, {\n  meta as ${metaBind},\n  code as ${codeBind},\n} from ${from};`;
    }
  );

  if (!comps.length) return false;

  for (const { binding, meta, code } of comps) {
    // Match registry entries that only have meta/code for this pair
    const re = new RegExp(
      `(\\{)\\s*meta:\\s*${meta}\\s*,\\s*code:\\s*${code}\\s*(\\})`,
      'g'
    );
    src = src.replace(re, `$1 meta: ${meta}, code: ${code}, Component: ${binding} $2`);
  }

  writeFileSync(pagePath, src);
  return true;
}

/** @param {string} dir */
function walkPages(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkPages(p, out);
    else if (name === 'page.tsx') out.push(p);
  }
  return out;
}

const files = walkJsFiles(examplesRoot);
let migrated = 0;
let skipped = 0;

for (const file of files) {
  const dir = dirname(file);
  const slug = file.slice(dir.length + 1).replace(/\.js$/, '');
  const examplePath = join(dir, `${slug}.example.txt`);
  const tsxPath = join(dir, `${slug}.tsx`);

  if (existsSync(examplePath) && existsSync(tsxPath) && !existsSync(file)) {
    skipped++;
    continue;
  }

  const mod = await import(pathToFileURL(file).href);
  const meta = mod.meta;
  const code = mod.code;
  if (typeof code !== 'string') {
    console.warn('skip (no code string):', relative(root, file));
    skipped++;
    continue;
  }
  if (!meta || typeof meta.title !== 'string') {
    console.warn('skip (no meta.title):', relative(root, file));
    skipped++;
    continue;
  }

  const body = code.replace(/\s+$/, '') + '\n';
  writeFileSync(examplePath, body);
  writeTsx(tsxPath, meta, slug);
  unlinkSync(file);
  migrated++;
  console.log('migrated', relative(root, file));
}

let pagesUpdated = 0;
for (const page of walkPages(appRoot)) {
  if (rewritePage(page)) {
    pagesUpdated++;
    console.log('updated page', relative(root, page));
  }
}

console.log(
  `\nDone: ${migrated} examples migrated, ${skipped} skipped, ${pagesUpdated} pages updated`
);
