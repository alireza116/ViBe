// _harness.js — the shared docs engine. Three jobs, and it should NOT grow as
// content is added:
//   1. a dependency surface built by SPREADING the vibe namespaces, so every
//      mark / edit / constraint / guide is auto-available in every example — a
//      newly added one needs zero changes here.
//   2. highlight(): the tiny single-pass code tokenizer.
//   3. renderPage(page): builds the shared layout (grouped sidebar from _nav.js +
//      cards) and runs each example's exact `code` string, so the code shown is
//      the code that draws the chart beside it.
//
// The ONLY import of the library lives here, so moving the docs folder touches one
// path. Styling lives in styles.css (linked below), never inline — keeps this lean.

import * as vibe from '../src/index.js';
import { SITE } from './_nav.js';

// ---- dependency surface (namespace spread → self-maintaining) ---------------
// Universal edits (drag, create, remove, resize, cycle, custom) are spread bare so
// examples read `edit: drag()`. The line-scoped edits stay under `edit.line.*` so
// their scope shows in the example; `line` (the edit namespace) and the internal
// `nextSeriesKey` are excluded from the spread so they don't shadow the line MARK.
const { line: _editLine, nextSeriesKey: _nsk, when: _editWhen, ...universalEdits } = vibe.edit;
const depObj = {
    ...vibe.plot,
    ...universalEdits,
    ...vibe.constraints,
    Elicit: vibe.Elicit,
    when: vibe.when,
    edit: vibe.edit,
    guides: vibe.guides,
};
const depNames = Object.keys(depObj);
const depVals = Object.values(depObj);

// ---- tiny self-contained JS highlighter (single-pass tokenizer) -------------
const KW = 'const|let|var|function|return|new|for|of|in|if|else|true|false|null|undefined|import|from|export|await|async|typeof';
const esc = (c) => c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function highlight(code) {
    const re = new RegExp(
        '(\\/\\/[^\\n]*)' +                                              // 1 comment
        '|(`(?:[^`\\\\]|\\\\.)*`|\'(?:[^\'\\\\]|\\\\.)*\'|"(?:[^"\\\\]|\\\\.)*")' + // 2 string
        '|(\\b\\d+(?:\\.\\d+)?\\b)' +                                    // 3 number
        '|(\\b(?:' + KW + ')\\b)' +                                      // 4 keyword
        '|([A-Za-z_$][\\w$]*)(?=\\s*\\()',                               // 5 call name
        'g'
    );
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
        out += esc(code.slice(last, m.index));
        const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : m[4] ? 'k' : 'f';
        out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
        last = re.lastIndex;
    }
    return out + esc(code.slice(last));
}

// The path prefix that takes a page back to the docs root, derived from the page's
// own docs-relative path (e.g. 'marks/bar.html' -> '../'). No URL parsing needed.
const prefixFor = (path) => '../'.repeat(path.split('/').length - 1);

const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    for (const k of kids) n.append(k);
    return n;
};

/**
 * Render one docs page.
 * @param {{ path: string, title: string, lead?: string, sections: Array<{
 *   id: string, title: string, intro?: string, examples: Array<{
 *     title: string, blurb?: string, try?: string, code: string }> }> }} page
 */
export function renderPage(page) {
    const prefix = prefixFor(page.path);
    document.title = 'VibeJS · ' + page.title;

    // shared stylesheet (linked once, resolved to this page's depth)
    document.head.append(el('link', { rel: 'stylesheet', href: prefix + 'styles.css' }));

    // ---- sidebar -----------------------------------------------------------
    const nav = el('nav');
    nav.append(
        el('div', { className: 'brand' },
            el('a', { href: prefix + 'index.html', textContent: 'VibeJS' })),
        el('div', { className: 'tag', textContent: 'declarative visual belief elicitation' }),
    );
    for (const grp of SITE) {
        const g = el('div', { className: 'group' },
            el('div', { className: 'group-title', textContent: grp.group }));
        for (const p of grp.pages) {
            const active = p.path === page.path;
            const a = el('a', { href: prefix + p.path, textContent: p.title });
            if (active) a.className = 'active';
            g.append(a);
            // in-page section anchors, listed under the active page
            if (active && page.sections.length > 1) {
                const anchors = el('div', { className: 'anchors' });
                for (const s of page.sections) {
                    anchors.append(el('a', { href: '#' + s.id, textContent: s.title }));
                }
                g.append(anchors);
            }
        }
        nav.append(g);
    }
    nav.append(el('div', { className: 'links' },
        el('a', { href: prefix + '../index.html', textContent: '→ Home' })));

    // ---- main --------------------------------------------------------------
    const main = el('main');
    main.append(el('h1', { textContent: page.title }));
    if (page.lead) main.append(el('p', { className: 'lead', innerHTML: page.lead }));

    for (const sec of page.sections) {
        const section = el('section', { id: sec.id });
        section.append(el('h2', { className: 'section', textContent: sec.title }));
        if (sec.intro) section.append(el('p', { className: 'intro', textContent: sec.intro }));
        const grid = el('div', { className: 'grid' });
        section.append(grid);

        for (const ex of sec.examples) {
            const chart = el('div', { className: 'chart' });
            const result = el('div', { className: 'result' }, chart);
            if (ex.try) result.append(el('span', { className: 'try', innerHTML: 'Try: ' + ex.try }));

            const codeEl = el('code');
            codeEl.innerHTML = highlight(ex.code);
            const card = el('div', { className: 'card' },
                el('h3', { textContent: ex.title }),
                el('p', { textContent: ex.blurb || '' }),
                el('div', { className: 'body' },
                    el('pre', { className: 'code' }, codeEl),
                    result));
            grid.append(card);

            // run the SAME string that is displayed; `mount` drops the chart in.
            const mount = (node) => { chart.appendChild(node); return node; };
            try {
                new Function(...depNames, 'mount', ex.code)(...depVals, mount);
            } catch (err) {
                console.error('Example failed:', ex.title, err);
                chart.append(el('pre', {
                    style: 'color:#b91c1c;font-size:0.75rem;white-space:pre-wrap',
                    textContent: '⚠ ' + err.message,
                }));
            }
        }
        main.append(section);
    }

    document.body.append(el('div', { className: 'layout' }, nav, main));
}
