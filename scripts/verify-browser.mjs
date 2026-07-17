// verify-browser.mjs — real-browser checks for behaviour the typechecker can't see.
// Starts a throwaway Next dev server over docs-next, drives Chromium via Playwright,
// asserts, tears down.
//
//   node scripts/verify-browser.mjs        (or: npm run verify:browser)
//
// This is the repo's only regression gate: there is no unit-test suite, and the
// docs are the regression surface. It drives docs-next, which is the documentation
// — an example that mounts but no longer does what its prose claims is exactly the
// drift worth catching, so these assert BEHAVIOUR (drag this, and the data must say
// that), not that a page rendered.
//
// Two classes of bug live here and nowhere else:
//   - Pointer/keyboard state machines. A nudge anchored to the wrong pixel, a lock
//     that repairs the data but still grabs the pointer, an undo that steps once per
//     pointermove — all typecheck perfectly.
//   - Example rot. Every example is eval'd in the page, so a syntax error or a scope
//     collision fails loudly (an example's `const bar` shadows the bar MARK, because
//     each scope name is a `new Function` parameter).
//
// Exits non-zero on any failed assertion so it can gate a commit.

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 3111;
const BASE = `http://localhost:${PORT}`;

let passed = 0;
const failures = [];
function check(name, cond, detail = '') {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

// Next compiles each route on first request, so the first hit is slow.
async function waitForServer(url, timeoutMs = 120000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error(`server never became ready at ${url}`);
}

async function main() {
    const next = spawn('npx', ['next', 'dev', 'docs-next', '-p', String(PORT)], {
        stdio: 'ignore', detached: true
    });
    const stopNext = () => { try { process.kill(-next.pid); } catch { /* already gone */ } };

    const browser = await chromium.launch();
    try {
        await waitForServer(`${BASE}/overview`);
        const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

        // Open a route and wait for its charts. Next dev compiles on demand and the
        // examples mount after hydration, so a cold route can be slow — and a gate
        // that fails intermittently is worse than no gate, because it teaches you to
        // ignore it. Hence the generous budget and one retry: the only thing a
        // timeout here should ever mean is "the page is genuinely broken".
        const open = async (route, waitFor) => {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
                    if (waitFor) await page.waitForSelector(waitFor, { timeout: 60000, state: 'attached' });
                    await page.waitForTimeout(400);
                    return;
                } catch (e) {
                    if (attempt === 2) throw e;
                    await page.waitForTimeout(1500);
                }
            }
        };

        // A route's examples are eval'd client-side; `.live-error` is how ExampleLive
        // reports a throw. Visiting every documented route is the cheapest broad net
        // we have over the examples.
        const visit = async (route) => {
            await open(route);
            const errs = await page.locator('.live-error').allTextContents();
            check(`${route}: every example evaluates`, errs.length === 0, errs.join(' | '));
        };

        // ---- Every documented route mounts -------------------------------
        console.log('\nAll routes (docs-next)');
        const routes = [
            '/', '/overview', '/concepts', '/sizing', '/authoring',
            '/marks/bar', '/marks/rect', '/marks/area', '/marks/tick', '/marks/point',
            '/marks/symbol', '/marks/face', '/marks/text', '/marks/line', '/marks/composite',
            '/marks/dotstack', '/marks/waffle', '/marks/cone', '/marks/needle',
            '/marks/axis-radial', '/marks/arc', '/marks/geo', '/marks/trend', '/marks/axes',
            '/editing', '/editing/gestures', '/editing/sweep', '/editing/lock',
            '/editing/existence', '/editing/probe', '/editing/stages', '/editing/axis',
            '/editing/history', '/widgets', '/scales', '/schema', '/constraints',
            '/effects', '/guides',
        ];
        for (const r of routes) await visit(r);

        // ---- Responsive sizing --------------------------------------------
        console.log('\nResponsive sizing (/sizing)');
        await open('/sizing', '#scale svg');

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
        await page.waitForTimeout(400); // ResizeObserver + rAF + redraw
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

        // Layout: a responsive chart must scale to its own column and not eat the
        // page (the docs' own regression, but the chart is what does the eating).
        await page.setViewportSize({ width: 1280, height: 1000 });
        await page.waitForTimeout(300);
        for (const id of ['scale', 'reflow']) {
            const colW = await page.$eval(`#${id} .result`, (e) => Math.round(e.getBoundingClientRect().width));
            const svgW = await page.$eval(`#${id} svg`, (e) => Math.round(e.getBoundingClientRect().width));
            check(`${id}: chart scales to its column`, Math.abs(svgW - colW) <= 2, `svg ${svgW} vs col ${colW}`);
        }

        // ---- Waffle cell-fill consistency ---------------------------------
        console.log('\nWaffle fill consistency (/marks/waffle)');
        const sec = '#shapes-and-click'; // circle cells, unit = 5, edit.waffle.fill
        await open('/marks/waffle', `${sec} svg circle`);

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
            await page.waitForTimeout(100);
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
        console.log('\nLocked rows (/editing/lock)');
        await open('/editing/lock', '#seed .chart svg');

        const rowsOf = (id) => page.$eval(`#${id} .chart > div`, (el) => el.getData());
        // Aim in DATA space: scroll the plot in, then map a value pair to page px.
        const frameOf = async (id, { m, w, h, xd, yd }) => {
            await page.locator(`#${id} .chart svg`).scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
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
            await page.waitForTimeout(80);
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
        await page.waitForTimeout(100);
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

        // ---- Arc: the `value` magnitude channel + boundary drag --------------
        // The magnitude channel is `value` (not `angle` — that means rotation
        // everywhere else), and the mark takes `edits: [...]` like every other mark.
        // Both are load-bearing renames: if either failed to land, the pie draws
        // with no slices or the handles never appear, so assert the geometry.
        console.log('\nArc: value channel + edge drag (/marks/arc)');
        await open('/marks/arc', '#edit svg path');

        const arcSvg = page.locator('#edit svg').first();
        const sliceCount = await arcSvg.locator('path').count();
        check('arc: value channel drives slices', sliceCount >= 3, `${sliceCount} slice paths`);
        const handleCount = await arcSvg.locator('circle').count();
        check('arc: edits:[edit.arc.edge()] emits boundary handles', handleCount >= 2, `${handleCount} handles`);

        const sharesOf = (s) => page.$eval(`${s} .data-body`, (el) =>
            [...el.textContent.matchAll(/share:\s*(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[1])));
        const before = await sharesOf('#edit');
        const sumBefore = before.reduce((a, b) => a + b, 0);

        // Drag the first boundary handle AROUND the ring. Two things this has to get
        // right: scroll the chart into view first (the arc sits far down the page, and
        // raw viewport coordinates would land on nothing), and move along the ring
        // rather than straight — the edit reads the pointer's ANGLE about the pivot,
        // so a radial drag is a no-op by design.
        const handle = arcSvg.locator('circle').first();
        await handle.scrollIntoViewIfNeeded();
        const box = await handle.boundingBox();
        const svgBox = await arcSvg.boundingBox();
        const pivot = { x: svgBox.x + svgBox.width / 2, y: svgBox.y + svgBox.height / 2 };
        const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const spin = (deg) => {
            const a = (deg * Math.PI) / 180;
            const dx = start.x - pivot.x, dy = start.y - pivot.y;
            return {
                x: pivot.x + dx * Math.cos(a) - dy * Math.sin(a),
                y: pivot.y + dx * Math.sin(a) + dy * Math.cos(a)
            };
        };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        for (let i = 1; i <= 12; i++) {
            const p = spin((18 * i) / 12);
            await page.mouse.move(p.x, p.y);
        }
        await page.mouse.up();
        await page.waitForTimeout(150);
        const after = await sharesOf('#edit');
        const sumAfter = after.reduce((a, b) => a + b, 0);
        check('arc: dragging a boundary changes the shares',
            JSON.stringify(before) !== JSON.stringify(after), `${before} -> ${after}`);
        check('arc: the pair-shift holds the total fixed',
            Math.abs(sumAfter - sumBefore) < 0.01, `${sumBefore} -> ${sumAfter}`);

        // ---- Keyboard editing + undo/redo ---------------------------------
        // Both are gesture-shaped and only prove out under real input: the nudge has
        // to step from where the datum's VALUE is (a bar's node centre is halfway up
        // the bar, so anchoring there teleports it), and undo has to treat a whole
        // drag as one entry however many commits it made along the way.
        console.log('\nKeyboard editing + undo (/marks/bar)');
        await open('/marks/bar', '#editing svg rect.mark');

        // The section holds several examples; drive the first chart.
        const barEl = '#editing .chart > div';
        const barRows = () => page.$eval(barEl, (e) => e.getData());
        const barY = async (i) => (await barRows())[i].y;
        const history = () => page.$eval(barEl, (e) => ({ undo: e.canUndo(), redo: e.canRedo() }));

        const bar0 = page.locator('#editing svg rect.mark').first();
        await bar0.scrollIntoViewIfNeeded();
        check('keyboard: an editable mark is focusable',
            (await bar0.getAttribute('tabindex')) === '0');
        check('keyboard: history starts empty', (await history()).undo === false);

        const y0 = await barY(0);
        await bar0.focus();
        for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        const y1 = await barY(0);
        // Domain [0,100], so a 1% step is one unit per press — and it goes UP.
        check('keyboard: ArrowUp steps the value up from its current value',
            Math.abs(y1 - (y0 + 3)) < 0.01, `${y0} -> ${y1}`);

        await page.keyboard.down('Shift');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.up('Shift');
        await page.waitForTimeout(100);
        check('keyboard: Shift takes a coarse step',
            Math.abs((await barY(0)) - (y1 - 10)) < 0.01, `${y1} -> ${await barY(0)}`);

        // Each press is its own undo entry; the others are untouched.
        await page.$eval(barEl, (e) => e.undo());
        check('undo: steps back one keypress', Math.abs((await barY(0)) - y1) < 0.01);
        for (let i = 0; i < 3; i++) await page.$eval(barEl, (e) => e.undo());
        check('undo: unwinds to the seeded value', Math.abs((await barY(0)) - y0) < 0.01,
            `${await barY(0)} vs ${y0}`);
        check('undo: bottoms out', (await history()).undo === false);
        check('redo: available after undo', (await history()).redo === true);
        await page.$eval(barEl, (e) => e.redo());
        check('redo: replays the keypress', Math.abs((await barY(0)) - (y0 + 1)) < 0.01);

        // A DRAG is one entry, however many commits it made.
        const dragBox = await bar0.boundingBox();
        const beforeDrag = await barRows();
        await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + 6);
        await page.mouse.down();
        for (let k = 1; k <= 12; k++) await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + 6 + k * 5);
        await page.mouse.up();
        await page.waitForTimeout(150);
        const afterDrag = await barRows();
        check('drag: moved the value', afterDrag[0].y !== beforeDrag[0].y,
            `${beforeDrag[0].y} -> ${afterDrag[0].y}`);
        await page.$eval(barEl, (e) => e.undo());
        const undone = await barRows();
        check('undo: a whole drag is ONE entry (not one per pointermove)',
            Math.abs(undone[0].y - beforeDrag[0].y) < 0.01,
            `${afterDrag[0].y} -> ${undone[0].y}, expected ${beforeDrag[0].y}`);

        // ---- Undo/redo, driven the way a caller would ----------------------
        // The docs page wires real buttons off canUndo()/canRedo(); that wiring is
        // the part an app copies, so drive the buttons rather than the methods.
        console.log('\nUndo / redo buttons (/editing/history)');
        await open('/editing/history', '#undo .chart svg');

        const undoBtn = page.getByRole('button', { name: /Undo/ }).first();
        const redoBtn = page.getByRole('button', { name: /Redo/ }).first();
        await undoBtn.scrollIntoViewIfNeeded();
        check('undo button: starts disabled (nothing to undo)', await undoBtn.isDisabled());

        const histBar = page.locator('#undo svg rect.mark').first();
        const hBox = await histBar.boundingBox();
        const hBefore = await page.$eval('#undo .chart > div', (e) => e.getData());
        await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + 5);
        await page.mouse.down();
        for (const dy of [20, 40, 60, 80]) await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + 5 + dy);
        await page.mouse.up();
        await page.waitForTimeout(200);
        const hAfter = await page.$eval('#undo .chart > div', (e) => e.getData());
        check('undo button: enabled once there is a gesture to undo', await undoBtn.isEnabled());
        check('undo button: the drag changed the data', hAfter[0].n !== hBefore[0].n,
            `${hBefore[0].n} -> ${hAfter[0].n}`);

        await undoBtn.click();
        await page.waitForTimeout(200);
        const hUndone = await page.$eval('#undo .chart > div', (e) => e.getData());
        check('undo button: one click restores the whole gesture',
            Math.abs(hUndone[0].n - hBefore[0].n) < 0.01, `${hUndone[0].n} vs ${hBefore[0].n}`);
        check('undo button: Redo lights up', await redoBtn.isEnabled());
        await redoBtn.click();
        await page.waitForTimeout(200);
        const hRedone = await page.$eval('#undo .chart > div', (e) => e.getData());
        check('redo button: replays the gesture',
            Math.abs(hRedone[0].n - hAfter[0].n) < 0.01, `${hRedone[0].n} vs ${hAfter[0].n}`);

        // Keyboard on a point: x AND y take arrows, because both carry a drag.
        const kbDot = page.locator('#keyboard svg circle').first();
        await kbDot.scrollIntoViewIfNeeded();
        await kbDot.focus();
        const kbFocused = await page.evaluate(() => document.activeElement?.tagName);
        check('keyboard: a point mark takes focus', kbFocused === 'circle', `activeElement=${kbFocused}`);
        const kbRows = () => page.$eval('#keyboard .chart > div', (e) => e.getData());
        const kb0 = (await kbRows())[0].value;
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(150);
        const kb1 = (await kbRows())[0].value;
        check('keyboard: ArrowUp steps y by 1% of the domain',
            Math.abs(kb1 - (kb0 + 1)) < 0.01, `${kb0} -> ${kb1}`);
        const kbx0 = (await kbRows())[0].effort;
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(150);
        const kbx1 = (await kbRows())[0].effort;
        check('keyboard: ArrowRight steps x too (both axes carry a drag)',
            Math.abs(kbx1 - (kbx0 + 1)) < 0.01, `${kbx0} -> ${kbx1}`);

        // ---- Uncertainty band: area span mode + the ordering invariant ------
        // The whole stack composing: a y1/y2 pair fills between the fields, both
        // edges are grabbable, and a dataset invariant holds the edge you grabbed
        // while pushing the other — which only a real drag can show.
        console.log('\nUncertainty band (/marks/area)');
        await open('/marks/area', '#band svg path.mark-line');

        const bandEl = '#band .chart > div';
        const bandRows = () => page.$eval(bandEl, (e) => e.getData());
        const bandHandles = await page.locator('#band svg circle').count();
        check('band: both edges get handles', bandHandles === 8, `${bandHandles} handles for 4 rows x lo/hi`);

        const bandBefore = await bandRows();
        check('band: seeded lo <= hi', bandBefore.every((d) => d.lo <= d.hi));

        // Drag one row's LOW edge up past its high edge.
        const lowEdge = page.locator('#band svg circle').first();
        await lowEdge.scrollIntoViewIfNeeded();
        const lb = await lowEdge.boundingBox();
        await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2);
        await page.mouse.down();
        await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2 - 150, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const bandAfter = await bandRows();
        check('band: the dragged edge moved', bandAfter[0].lo !== bandBefore[0].lo,
            `${bandBefore[0].lo} -> ${bandAfter[0].lo}`);
        check('band: ordering held (lo <= hi) by carrying the other edge',
            bandAfter[0].lo <= bandAfter[0].hi,
            `lo ${bandAfter[0].lo}, hi ${bandAfter[0].hi}`);
        check('band: ordering left the other rows alone',
            bandAfter[1].lo === bandBefore[1].lo && bandAfter[1].hi === bandBefore[1].hi);

        // ---- Shape constraints --------------------------------------------
        // All three repair by pushing the rows/fields the gesture would have
        // violated, holding the one you actually grabbed. That choice is invisible
        // to types and obvious under a pointer.
        console.log('\nShape constraints (/constraints)');
        await open('/constraints', '#ordering .chart svg');

        // ordering: drag the low cap of an interval up past the mean and the high cap.
        const ordEl = '#ordering .chart > div';
        const ordBefore = await page.$eval(ordEl, (e) => e.getData());
        // The caps are the two grabbable ticks; the axis ticks are lines too, and
        // sit lower — they're pointer-events:none, so grabbing one is a silent no-op.
        const caps = await page.locator('#ordering svg line[stroke="#64748b"]').all();
        await page.locator('#ordering .chart svg').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        let lowCap = null, maxY = -1;
        for (const c of caps) {
            const b = await c.boundingBox();
            if (b && b.y > maxY) { maxY = b.y; lowCap = b; }
        }
        await page.mouse.move(lowCap.x + lowCap.width / 2, lowCap.y + lowCap.height / 2);
        await page.mouse.down();
        await page.mouse.move(lowCap.x + lowCap.width / 2, lowCap.y - 120, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const ordAfter = await page.$eval(ordEl, (e) => e.getData());
        check('ordering: the grabbed cap moved', ordAfter[0].lo !== ordBefore[0].lo,
            `lo ${ordBefore[0].lo} -> ${ordAfter[0].lo}`);
        check('ordering: lo <= mean <= hi still holds',
            ordAfter[0].lo <= ordAfter[0].mean && ordAfter[0].mean <= ordAfter[0].hi,
            JSON.stringify(ordAfter[0]));
        check('ordering: it repaired by CARRYING the others, not blocking the drag',
            ordAfter[0].mean > ordBefore[0].mean, `mean ${ordBefore[0].mean} -> ${ordAfter[0].mean}`);

        // monotonic: drag a mid point of a CDF up; later points rise to meet it.
        const monoEl = '#monotonic .chart > div';
        const monoBefore = await page.$eval(monoEl, (e) => e.getData());
        const monoDots = await page.locator('#monotonic svg circle').all();
        await monoDots[0].scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const mBox = await monoDots[2].boundingBox();
        await page.mouse.move(mBox.x + mBox.width / 2, mBox.y + mBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(mBox.x + mBox.width / 2, mBox.y - 90, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const monoAfter = await page.$eval(monoEl, (e) => e.getData());
        check('monotonic: the dragged point rose', monoAfter[2].p > monoBefore[2].p,
            `${monoBefore[2].p} -> ${monoAfter[2].p}`);
        check('monotonic: it carried the neighbours it would have crossed',
            monoAfter[3].p > monoBefore[3].p, `p[3] ${monoBefore[3].p} -> ${monoAfter[3].p}`);
        check('monotonic: the curve never dips',
            monoAfter.every((d, i) => i === 0 || d.p >= monoAfter[i - 1].p - 1e-9),
            monoAfter.map((d) => d.p).join(', '));

        // spacing: shove a threshold into its neighbours; they keep min apart.
        const spEl = '#spacing .chart > div';
        const spTicks = await page.locator('#spacing svg line[stroke="#2563eb"]').all();
        await spTicks[0].scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const sBox = await spTicks[0].boundingBox();
        await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(sBox.x + sBox.width / 2 + 160, sBox.y + sBox.height / 2, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const spAfter = await page.$eval(spEl, (e) => e.getData());
        const sorted = spAfter.map((d) => d.at).sort((a, b) => a - b);
        const gaps = sorted.slice(1).map((v, i) => v - sorted[i]);
        check('spacing: no two thresholds are closer than min',
            gaps.every((g) => g >= 8 - 1e-9), `gaps ${gaps.map((g) => g.toFixed(2)).join(', ')}`);

        // ---- symlog & diverging -------------------------------------------
        // symlog is continuous and invertible, so it must drag like any other
        // positional scale; diverging is a colour scale that turns at its pivot.
        console.log('\nsymlog & diverging (/scales)');
        await open('/scales', '#zero-crossing .chart svg');

        const zcEl = '#zero-crossing .chart > div';
        const zcDot = page.locator('#zero-crossing svg circle').first();
        await zcDot.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const zcBefore = await page.$eval(zcEl, (e) => e.getData());
        const zcFill0 = await zcDot.getAttribute('fill');
        const zBox = await zcDot.boundingBox();
        await page.mouse.move(zBox.x + zBox.width / 2, zBox.y + zBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(zBox.x + zBox.width / 2 - 150, zBox.y + zBox.height / 2, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(150);
        const zcAfter = await page.$eval(zcEl, (e) => e.getData());
        const zcFill1 = await zcDot.getAttribute('fill');
        check('symlog: an invertible scale drags', zcAfter[0].delta !== zcBefore[0].delta,
            `${zcBefore[0].delta} -> ${zcAfter[0].delta}`);
        check('diverging: the ramp re-colours as the value crosses the pivot',
            zcFill1 !== zcFill0, `${zcFill0} -> ${zcFill1}`);

        check('no page/console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    } finally {
        await browser.close();
        stopNext();
    }

    console.log(`\n${failures.length ? '✗ FAIL' : '✓ PASS'} — ${passed} passed, ${failures.length} failed`);
    if (failures.length) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
