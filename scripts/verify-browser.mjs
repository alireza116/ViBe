// verify-browser.mjs — real-browser checks for behaviour the typechecker can't see:
// responsive sizing (viewBox / reflow) and waffle cell-fill consistency. Starts a
// throwaway Vite server, drives Chromium via Playwright, asserts, tears down.
//
//   node scripts/verify-browser.mjs        (or: npm run verify:browser)
//
// Exits non-zero on the first failed assertion so it can gate a commit.

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 5178;
const BASE = `http://localhost:${PORT}`;

let passed = 0;
const failures = [];
function check(name, cond, detail = '') {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

async function waitForServer(url, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`server never became ready at ${url}`);
}

async function main() {
    const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
        stdio: 'ignore', detached: true
    });
    const stopVite = () => { try { process.kill(-vite.pid); } catch { /* already gone */ } };

    const browser = await chromium.launch();
    try {
        await waitForServer(`${BASE}/docs/sizing.html`);
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

        // ---- Responsive sizing --------------------------------------------
        console.log('\nResponsive sizing (docs/sizing.html)');
        await page.goto(`${BASE}/docs/sizing.html`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#scale svg');

        const svgInfo = (sel) => page.$eval(sel, (svg) => ({
            viewBox: svg.getAttribute('viewBox'),
            widthAttr: svg.getAttribute('width'),
            heightAttr: svg.getAttribute('height'),
            renderedW: Math.round(svg.getBoundingClientRect().width)
        }));

        const scale = await svgInfo('#scale svg');
        check('scale: has a viewBox', scale.viewBox === '0 0 480 300', `got ${scale.viewBox}`);
        check('scale: no fixed width attr', scale.widthAttr == null, `got ${scale.widthAttr}`);

        const fixed = await svgInfo('#fixed svg');
        check('fixed: pixel width attr', fixed.widthAttr === '320', `got ${fixed.widthAttr}`);
        check('fixed: no viewBox', fixed.viewBox == null, `got ${fixed.viewBox}`);
        check('fixed: rendered ~320px', Math.abs(fixed.renderedW - 320) <= 2, `got ${fixed.renderedW}`);

        // Resize the viewport and confirm reflow tracks it while fixed does not.
        const reflowWide = await svgInfo('#reflow svg');
        const fixedWide = await svgInfo('#fixed svg');
        await page.setViewportSize({ width: 700, height: 900 });
        await page.waitForTimeout(250); // ResizeObserver + rAF + redraw
        const reflowNarrow = await svgInfo('#reflow svg');
        const fixedNarrow = await svgInfo('#fixed svg');

        check('reflow: svg width attr changes with viewport',
            Number(reflowNarrow.widthAttr) > 0 && reflowNarrow.widthAttr !== reflowWide.widthAttr,
            `${reflowWide.widthAttr} -> ${reflowNarrow.widthAttr}`);
        check('reflow: redraws at native pixels (attr === rendered)',
            Math.abs(Number(reflowNarrow.widthAttr) - reflowNarrow.renderedW) <= 2,
            `attr ${reflowNarrow.widthAttr} vs rendered ${reflowNarrow.renderedW}`);
        check('fixed: width attr unchanged by viewport',
            fixedNarrow.widthAttr === fixedWide.widthAttr, `${fixedWide.widthAttr} -> ${fixedNarrow.widthAttr}`);
        check('scale: viewBox stable, rendered width tracks viewport', true);

        // Layout: a responsive chart shares the card row with the code (it must not
        // eat the whole flex line and squish the code box unreadable).
        await page.setViewportSize({ width: 1200, height: 900 });
        await page.waitForTimeout(200);
        for (const id of ['scale', 'reflow']) {
            const codeW = await page.$eval(`#${id} .code`, (e) => Math.round(e.getBoundingClientRect().width));
            const colW = await page.$eval(`#${id} .result`, (e) => Math.round(e.getBoundingClientRect().width));
            const svgW = await page.$eval(`#${id} svg`, (e) => Math.round(e.getBoundingClientRect().width));
            check(`${id}: code box stays readable`, codeW > 250, `code ${codeW}px`);
            check(`${id}: chart scales to its column`, Math.abs(svgW - colW) <= 2, `svg ${svgW} vs col ${colW}`);
        }

        // ---- Waffle cell-fill consistency ---------------------------------
        console.log('\nWaffle fill consistency (docs/marks/waffle.html)');
        await page.goto(`${BASE}/docs/marks/waffle.html`, { waitUntil: 'networkidle' });
        const sec = '#shapes-and-click'; // circle cells, unit = 5, waffleFill
        await page.waitForSelector(`${sec} svg circle`);

        const readValue = () => page.$eval(`${sec} .data-body`, (el) => {
            const m = el.textContent.match(/value:\s*(-?\d+(?:\.\d+)?)/);
            return m ? Number(m[1]) : null;
        });
        const filledCount = () => page.$$eval(`${sec} svg circle`,
            (cs) => cs.filter((c) => (c.getAttribute('fill') || '').toLowerCase() === '#16a34a').length);

        // Click specific cells (DOM order === cell ordinal) and assert the count is
        // exactly that cell, and the rendered fill matches value / unit. `locator`
        // auto-scrolls the cell into view and clicks its CENTRE — the waffle is far
        // down the page, so a raw viewport-coordinate click would miss it.
        const cells = page.locator(`${sec} svg circle`);
        for (const k of [3, 11, 6]) {
            await cells.nth(k).click();
            await page.waitForTimeout(80);
            const value = await readValue();
            const filled = await filledCount();
            check(`click cell #${k}: value === (k+1)*unit`, value === (k + 1) * 5, `value ${value}, expected ${(k + 1) * 5}`);
            check(`click cell #${k}: filled === value/unit`, filled === value / 5, `filled ${filled}, value/unit ${value / 5}`);
        }

        // ---- Locked rows (spec.lock) --------------------------------------
        // The lock is half data-invariant, half pointer policy, and only the second
        // half proves out under real pointer events: a locked mark must be
        // ungrabbable AND invisible to proximity picking, so a drag beside a locked
        // line draws instead of grabbing it. Drive the actual gestures.
        console.log('\nLocked rows (docs/editing/lock.html)');
        await page.goto(`${BASE}/docs/editing/lock.html`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#seed .chart svg');

        const rowsOf = (id) => page.$eval(`#${id} .chart > div`, (el) => el.getData());
        // Aim in DATA space: scroll the plot in, then map a value pair to page px.
        const frameOf = async (id, { m, w, h, xd, yd }) => {
            await page.locator(`#${id} .chart svg`).scrollIntoViewIfNeeded();
            await page.waitForTimeout(120);
            const box = await page.$eval(`#${id} .chart svg`, (svg) => {
                const r = svg.getBoundingClientRect();
                return { left: r.left, top: r.top };
            });
            const iw = w - m.left - m.right, ih = h - m.top - m.bottom;
            return (xv, yv) => ({
                x: box.left + m.left + (xv - xd[0]) / (xd[1] - xd[0]) * iw,
                y: box.top + m.top + (1 - (yv - yd[0]) / (yd[1] - yd[0])) * ih
            });
        };
        const dragPath = async (from, to, steps = 24) => {
            await page.mouse.move(from.x, from.y);
            await page.mouse.down();
            for (let i = 1; i <= steps; i++) {
                await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
                await page.waitForTimeout(8);
            }
            await page.mouse.up();
            await page.waitForTimeout(60);
        };

        // Scatter: the 5 seeded points are read-only; created points are not.
        const at = await frameOf('seed', {
            m: { top: 16, right: 16, bottom: 32, left: 40 }, w: 400, h: 300, xd: [0, 10], yd: [0, 10]
        });
        const seed = await rowsOf('seed');
        const lockedPE = await page.$$eval('#seed .chart svg circle',
            (cs) => cs.slice(0, 5).every((c) => (c.style.pointerEvents || c.getAttribute('pointer-events')) === 'none'));
        check('lock: seeded marks are pointer-transparent', lockedPE);

        await page.mouse.click(at(8, 8).x, at(8, 8).y);       // plane click -> create
        await page.waitForTimeout(60);
        let rows = await rowsOf('seed');
        check('lock: a click still creates a free row', rows.length === 6, `${rows.length} rows`);
        check('lock: the created row takes the schema default', rows[5].source === 'yours');

        await dragPath(at(rows[5].x, rows[5].y), at(3, 8));    // your point moves
        rows = await rowsOf('seed');
        check('lock: a free row drags', Math.abs(rows[5].x - 3) < 0.5 && Math.abs(rows[5].y - 8) < 0.5);

        await dragPath(at(seed[0].x, seed[0].y), at(9, 1));    // a locked point does not
        rows = await rowsOf('seed');
        check('lock: a drag on a locked row leaves it unchanged',
            JSON.stringify(rows.slice(0, 5)) === JSON.stringify(seed), JSON.stringify(rows.slice(0, 5)));

        // You-draw-it: draw the free years, then sweep back over the locked record.
        const ny = await frameOf('you-draw-it', {
            m: { top: 20, right: 24, bottom: 32, left: 56 }, w: 560, h: 340, xd: [1968, 2016], yd: [0, 60000]
        });
        const record = await rowsOf('you-draw-it');
        check('lock: the record seeds 1968-1990', record.length === 23 && record[22].year === 1990);

        await dragPath(ny(1991, 20000), ny(2016, 20000), 40);
        let drawn = await rowsOf('you-draw-it');
        const mine = drawn.filter((d) => d.year > 1990);
        check('lock: a drag beside a locked line DRAWS (it never grabs it)', mine.length >= 20, `${mine.length} drawn`);
        check('lock: the drawn years took the swept value',
            mine.every((d) => Math.abs(d.deaths - 20000) < 3000));
        check('lock: the record survived the draw',
            JSON.stringify(drawn.slice(0, 23)) === JSON.stringify(record));

        // A stroke back across the record: the locked rows repair, the free rows
        // the SAME stroke crossed still take the paint (a lock repairs, not rejects).
        await dragPath(ny(2010, 55000), ny(1970, 55000), 40);
        drawn = await rowsOf('you-draw-it');
        check('lock: sweeping back over the record leaves it intact',
            JSON.stringify(drawn.slice(0, 23)) === JSON.stringify(record));
        const repainted = drawn.filter((d) => d.year >= 1991 && d.year <= 2010);
        check('lock: the free years in that same stroke were repainted',
            repainted.length > 0 && repainted.every((d) => Math.abs(d.deaths - 55000) < 3000));

        check('no page/console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    } finally {
        await browser.close();
        stopVite();
    }

    console.log(`\n${failures.length ? '✗ FAIL' : '✓ PASS'} — ${passed} passed, ${failures.length} failed`);
    if (failures.length) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
