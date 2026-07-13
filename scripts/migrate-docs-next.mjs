#!/usr/bin/env node
// One-shot (re-runnable) migrator: docs/pages/*.js → docs-next content + examples + routes.
import { mkdirSync, writeFileSync, readdirSync, copyFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs-next');
const pagesDir = join(root, 'docs', 'pages');

/** @param {string} htmlPath */
function routeFromPath(htmlPath) {
  if (htmlPath === 'index.html') return '';
  if (htmlPath === 'playground.html') return 'playground';
  return htmlPath.replace(/\.html$/, '').replace(/\/index$/, '');
}

/** @param {string} title */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'example';
}

function esc(str) {
  return JSON.stringify(str ?? '');
}

function writeExample(dir, id, ex) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${id}.js`);
  const body = `export const meta = {
  title: ${esc(ex.title)},
  blurb: ${esc(ex.blurb || '')},
  try: ${esc(ex.try || '')},
};

export const code = ${esc(ex.code)};
`;
  writeFileSync(file, body);
  return id;
}

function writeContent(route, page, sectionExampleIds) {
  const contentDir = join(out, 'content');
  mkdirSync(contentDir, { recursive: true });
  const key = route === '' ? 'overview' : route.replace(/\//g, '-');
  const sections = page.sections.map((sec, i) => ({
    id: sec.id,
    title: sec.title,
    intro: sec.intro || '',
    examples: sectionExampleIds[i],
  }));
  const file = join(contentDir, `${key}.ts`);
  writeFileSync(
    file,
    `import type { DocPage } from '../lib/types';

const page: DocPage = ${JSON.stringify(
      {
        route: route === '' ? '/' : `/${route}`,
        title: page.title,
        lead: page.lead || '',
        api: page.api || [],
        sections,
      },
      null,
      2
    )};

export default page;
`
  );
  return key;
}

function writeRoutePage(route, contentKey, exampleImports) {
  const appDir = route === '' ? join(out, 'app') : join(out, 'app', ...route.split('/'));
  mkdirSync(appDir, { recursive: true });
  const depth = route === '' ? 1 : route.split('/').length + 1;
  const rel = '../'.repeat(depth);
  // Named imports → plain { meta, code } objects so Server Components can
  // pass them to Client Components (module namespaces are not serializable).
  const importLines = exampleImports
    .map(
      (imp, i) =>
        `import { meta as ex${i}Meta, code as ex${i}Code } from '${rel}examples/${imp.folder}/${imp.id}';`
    )
    .join('\n');
  const registry = exampleImports
    .map((imp, i) => `  '${imp.folder}/${imp.id}': { meta: ex${i}Meta, code: ex${i}Code },`)
    .join('\n');

  writeFileSync(
    join(appDir, 'page.tsx'),
    `import { DocPageView } from '${rel}components/DocPageView';
import page from '${rel}content/${contentKey}';
${importLines}

const examples = {
${registry}
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
`
  );
}

const files = readdirSync(pagesDir).filter((f) => f.endsWith('.js'));
/** @type {Array<{ route: string, title: string }>} */
const generated = [];

for (const file of files) {
  const mod = await import(pathToFileURL(join(pagesDir, file)).href);
  const page = mod.default;
  const route = routeFromPath(page.path);
  const folder = route === '' ? 'overview' : route.replace(/\//g, '-');
  const exampleDir = join(out, 'examples', folder);
  const sectionExampleIds = [];
  /** @type {Array<{ folder: string, id: string }>} */
  const exampleImports = [];
  const used = new Set();

  for (const sec of page.sections) {
    const ids = [];
    for (const ex of sec.examples) {
      let id = slugify(ex.title);
      let n = 2;
      while (used.has(id)) {
        id = `${slugify(ex.title)}-${n++}`;
      }
      used.add(id);
      writeExample(exampleDir, id, ex);
      ids.push(`${folder}/${id}`);
      exampleImports.push({ folder, id });
    }
    sectionExampleIds.push(ids);
  }

  const contentKey = writeContent(route, page, sectionExampleIds);
  writeRoutePage(route, contentKey, exampleImports);
  generated.push({ route: route === '' ? '/' : `/${route}`, title: page.title });
  console.log('migrated', page.path, '→', route === '' ? '/' : `/${route}`, `(${exampleImports.length} examples)`);
}

writeFileSync(
  join(out, 'content/_generated.json'),
  JSON.stringify(generated, null, 2)
);
console.log(`\nDone: ${generated.length} pages`);
