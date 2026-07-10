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
import * as d3 from 'd3';
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
    widgets: vibe.widgets,
    // A channel's `scale` takes a live d3 scale, and a guide option takes a
    // function of the data — both want d3 in scope (see scales.html, guides.html).
    d3,
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

// Code wraps rather than scrolling sideways, so a wrapped line needs a hanging
// indent or its continuation lands in column 0 and reads as a new statement. That
// needs one block per source line (text-indent applies to a block's first line
// only). Safe to split on '\n': no token the highlighter emits spans a newline.
const highlightBlock = (code) =>
    highlight(code).split('\n').map((l) => '<span class="ln">' + l + '</span>').join('');

// The path prefix that takes a page back to the docs root, derived from the page's
// own docs-relative path (e.g. 'marks/bar.html' -> '../'). No URL parsing needed.
const prefixFor = (path) => '../'.repeat(path.split('/').length - 1);

const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    for (const k of kids) n.append(k);
    return n;
};

// ---- live data readout ------------------------------------------------------
// Every example elicits a dataset, so every example shows the dataset it elicited.
// The panel subscribes to `change`, which fires only on COMMITTED data — a probe's
// hover preview never reaches it, and that absence is exactly the lesson.
function fmtValue(v) {
    if (v == null) return `<span class="key">${v}</span>`;
    // Dragged values are long floats; the readout is a display, so round it.
    if (typeof v === 'number') return `<span class="num">${Number.isInteger(v) ? v : v.toFixed(2)}</span>`;
    if (v instanceof Date) return `<span class="str">${v.toISOString().slice(0, 10)}</span>`;
    if (typeof v === 'string') return `<span class="str">"${esc(v)}"</span>`;
    return `<span class="num">${esc(JSON.stringify(v))}</span>`;
}

const fmtRow = (d, i, pad) =>
    `<span class="idx">${String(i).padStart(pad, ' ')}</span>  { ` +
    Object.entries(d).map(([k, v]) => `<span class="key">${esc(k)}:</span> ${fmtValue(v)}`).join(', ') +
    ' }';

/** @param {any} chartEl an ElicitElement (has getData + on) */
function dataPanel(chartEl) {
    const body = el('pre', { className: 'data-body' });
    const count = el('span', { className: 'data-count' });
    const panel = el('div', { className: 'data' },
        el('div', { className: 'data-head' }, el('span', { textContent: 'getData()' }), count),
        body);
    const render = () => {
        const rows = chartEl.getData();
        count.textContent = rows.length === 1 ? '1 row' : `${rows.length} rows`;
        const pad = String(Math.max(rows.length - 1, 0)).length;
        body.innerHTML = rows.length
            ? rows.map((d, i) => fmtRow(d, i, pad)).join('\n')
            : '<span class="empty">no rows</span>';
    };
    chartEl.on('change', render);
    render();
    return panel;
}

// ---- API reference block (signature + option/channel tables + returns) ------
// A page's optional `api` is an array of ENTRIES, one per factory documented on
// the page (bar/barY/barX share one; the gestures page lists drag/resize/…). Each
// entry renders a signature, an Options table, an optional Channels table, and a
// Returns/Emits note — any field may be omitted. Descriptions accept inline HTML
// (so `<code class="inline">…</code>` works), matching the lead/intro convention.
const cell = (html) => { const td = el('td'); td.innerHTML = html == null ? '' : String(html); return td; };
function apiTable(cols, rows) {
    const table = el('table', { className: 'api-table' });
    const thead = el('thead');
    const htr = el('tr');
    for (const c of cols) htr.append(el('th', { textContent: c }));
    thead.append(htr);
    const tbody = el('tbody');
    for (const r of rows) {
        const tr = el('tr');
        for (const key of ['name', 'type', 'default', 'desc']) {
            if (!cols.__keys.includes(key)) continue;
            if (key === 'name') { const td = el('td'); td.append(el('code', { className: 'api-name', textContent: r.name })); tr.append(td); }
            else if (key === 'type') { const td = el('td'); if (r.type != null) td.append(el('code', { className: 'api-type', textContent: r.type })); tr.append(td); }
            else if (key === 'default') { const td = el('td'); if (r.default != null) td.append(el('code', { className: 'api-def', textContent: r.default })); tr.append(td); }
            else tr.append(cell(r.desc));
        }
        tbody.append(tr);
    }
    table.append(thead, tbody);
    return el('div', { className: 'api-table-wrap' }, table);
}

function renderApi(entries) {
    const section = el('section', { id: 'api', className: 'api' });
    section.append(el('h2', { className: 'section', textContent: 'API reference' }));
    for (const entry of entries) {
        const block = el('div', { className: 'api-entry' });
        if (entry.name) block.append(el('h3', { className: 'api-heading', textContent: entry.name }));
        if (entry.summary) block.append(el('p', { className: 'api-summary', innerHTML: entry.summary }));
        const sigs = entry.signatures || (entry.signature ? [entry.signature] : []);
        if (sigs.length) {
            const codeEl = el('code');
            codeEl.innerHTML = sigs.map(highlightBlock).join('');
            block.append(el('pre', { className: 'code sig' }, codeEl));
        }
        if (entry.options && entry.options.length) {
            block.append(el('div', { className: 'api-label', textContent: 'Options' }));
            const cols = ['Option', 'Type', 'Default', 'Description']; cols.__keys = ['name', 'type', 'default', 'desc'];
            block.append(apiTable(cols, entry.options));
        }
        if (entry.channels && entry.channels.length) {
            block.append(el('div', { className: 'api-label', textContent: 'Channels' }));
            const cols = ['Channel', 'Type', 'Description']; cols.__keys = ['name', 'type', 'desc'];
            block.append(apiTable(cols, entry.channels));
        }
        if (entry.returns) {
            block.append(el('div', { className: 'api-label', textContent: 'Returns / emits' }));
            block.append(el('p', { className: 'api-returns', innerHTML: entry.returns }));
        }
        section.append(block);
    }
    return section;
}

/**
 * Render one docs page.
 * @param {{ path: string, title: string, lead?: string,
 *   api?: Array<{ name?: string, summary?: string, signature?: string,
 *     signatures?: string[],
 *     options?: Array<{ name: string, type?: string, default?: string, desc?: string }>,
 *     channels?: Array<{ name: string, type?: string, desc?: string }>,
 *     returns?: string }>,
 *   sections: Array<{
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
            if (active && (page.api || page.sections.length > 1)) {
                const anchors = el('div', { className: 'anchors' });
                if (page.api) anchors.append(el('a', { href: '#api', textContent: 'API reference' }));
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

    if (page.api && page.api.length) main.append(renderApi(page.api));

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
            codeEl.innerHTML = highlightBlock(ex.code);
            const card = el('div', { className: 'card' },
                el('h3', { textContent: ex.title }),
                el('p', { textContent: ex.blurb || '' }),
                el('div', { className: 'body' },
                    el('pre', { className: 'code' }, codeEl),
                    result));
            grid.append(card);

            // run the SAME string that is displayed; `mount` drops the chart in.
            // An example may mount several nodes (a chart, then a button); the first
            // one carrying the Elicit data API is the one whose data we show.
            let elicited = null;
            const mount = (node) => {
                chart.appendChild(node);
                if (!elicited && node && typeof node.getData === 'function' && typeof node.on === 'function') {
                    elicited = node;
                }
                return node;
            };
            try {
                new Function(...depNames, 'mount', ex.code)(...depVals, mount);
            } catch (err) {
                console.error('Example failed:', ex.title, err);
                chart.append(el('pre', {
                    style: 'color:#b91c1c;font-size:0.75rem;white-space:pre-wrap',
                    textContent: '⚠ ' + err.message,
                }));
            }
            if (elicited) {
                // Pin the column to the chart's own pixel width (Elicit sets it inline)
                // so a long data row scrolls inside the readout instead of widening
                // the card. Capped by `.result { max-width: 100% }` when stacked.
                if (elicited.style.width) result.style.width = elicited.style.width;
                result.append(dataPanel(elicited));
            }
        }
        main.append(section);
    }

    document.body.append(el('div', { className: 'layout' }, nav, main));
}
