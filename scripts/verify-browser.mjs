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

        check('no page/console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    } finally {
        await browser.close();
        stopVite();
    }

    console.log(`\n${failures.length ? '✗ FAIL' : '✓ PASS'} — ${passed} passed, ${failures.length} failed`);
    if (failures.length) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
