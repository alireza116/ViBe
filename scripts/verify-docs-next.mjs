// verify-docs-next.mjs — real-browser checks against the LIVING docs (docs-next).
//
//   node scripts/verify-docs-next.mjs      (or: npm run verify:docs-next)
//
// Companion to verify-browser.mjs, which drives the older `docs/` tree. This one
// exists because docs-next is where the feature set is documented, and several
// features are documented ONLY there — undo/redo, keyboard nudging, and the
// monotonic / spacing / symlog / diverging additions have no `docs/` page, so the
// other gate cannot see them at all.
//
// It asserts BEHAVIOUR, not just that a page renders: a doc example that mounts
// but no longer does what its prose claims is exactly the drift these checks are
// here to catch. Every example is also eval'd, so a syntax error or a scope
// collision (an example declaring `const bar` shadows the bar MARK) fails loudly.
//
// Exits non-zero on any failed assertion so it can gate a commit.

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 3111;
const BASE = `http://localhost:${PORT}`;

async function waitForServer(url, timeoutMs = 90000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error(`server never became ready at ${url}`);
}

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, e) => { fail++; console.log(`  ✗ ${n}${e ? '\n      ' + e : ''}`); };

async function main() {
    const next = spawn('npx', ['next', 'dev', 'docs-next', '-p', String(PORT)], {
        stdio: 'ignore', detached: true
    });
    const stopNext = () => { try { process.kill(-next.pid); } catch { /* already gone */ } };

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    try {
        await waitForServer(`${BASE}/overview`);
    // Any uncaught error in an example surfaces here too.
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    async function load(route) {
      pageErrors.length = 0;
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const errs = await page.locator('.live-error').allTextContents();
      if (errs.length) bad(`${route}: ${errs.length} example(s) failed to evaluate`, errs.join(' | '));
      else ok(`${route}: all examples evaluate`);
      const svgs = await page.locator('svg').count();
      if (svgs > 0) ok(`${route}: ${svgs} chart(s) rendered`);
      else bad(`${route}: no svg rendered`, 'expected at least one chart');
      if (pageErrors.length) bad(`${route}: uncaught page errors`, pageErrors.join(' | '));
    }

    // ---- every new/changed route renders ----
    console.log('\n== routes ==');
    for (const r of ['/editing/history', '/constraints', '/scales', '/marks/area', '/overview']) {
      await load(r);
    }

    // ---- the nav actually links the new page ----
    console.log('\n== nav ==');
    await page.goto(BASE + '/overview', { waitUntil: 'networkidle' });
    const navLink = await page.locator('a[href="/editing/history"]').count();
    navLink > 0 ? ok('sidebar links /editing/history') : bad('sidebar link missing', 'no a[href="/editing/history"]');

    // ---- undo/redo example really undoes ----
    console.log('\n== undo/redo behaviour ==');
    await page.goto(BASE + '/editing/history', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    {
      const undo = page.getByRole('button', { name: /Undo/ }).first();
      const redo = page.getByRole('button', { name: /Redo/ }).first();
      await undo.scrollIntoViewIfNeeded();

      (await undo.isDisabled()) ? ok('Undo starts disabled (nothing to undo)') : bad('Undo should start disabled', '');

      const svg = page.locator('svg').first();
      const bar = svg.locator('rect').nth(1);
      const box = await bar.boundingBox();
      const before = await bar.getAttribute('height');

      // One continuous drag, several pointermoves — the undo unit is the GESTURE.
      await page.mouse.move(box.x + box.width / 2, box.y + 5);
      await page.mouse.down();
      for (const dy of [20, 40, 60, 80]) {
        await page.mouse.move(box.x + box.width / 2, box.y + 5 + dy);
        await page.waitForTimeout(30);
      }
      await page.mouse.up();
      await page.waitForTimeout(300);

      const after = await bar.getAttribute('height');
      after !== before ? ok(`drag changed the bar (${before} → ${after})`) : bad('drag did nothing', `height stayed ${before}`);

      (await undo.isEnabled()) ? ok('Undo enabled after the drag') : bad('Undo still disabled after drag', '');

      // ONE click must restore the whole drag, not one pointermove of it.
      await undo.click();
      await page.waitForTimeout(300);
      const undone = await bar.getAttribute('height');
      undone === before
        ? ok(`one Undo restored the whole gesture (→ ${undone})`)
        : bad('undo did not restore in one step', `expected ${before}, got ${undone}`);

      (await redo.isEnabled()) ? ok('Redo enabled after undo') : bad('Redo disabled after undo', '');
      await redo.click();
      await page.waitForTimeout(300);
      const redone = await bar.getAttribute('height');
      redone === after
        ? ok(`Redo restored the edit (→ ${redone})`)
        : bad('redo did not restore', `expected ${after}, got ${redone}`);
    }

    // ---- keyboard example really nudges ----
    console.log('\n== keyboard behaviour ==');
    {
      const svg = page.locator('svg').nth(1);
      const dot = svg.locator('circle').first();
      await dot.scrollIntoViewIfNeeded();
      const cy0 = await dot.getAttribute('cy');
      await dot.focus();
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      focused === 'circle' ? ok('a mark takes focus (tabindex)') : bad('mark not focusable', `activeElement=${focused}`);

      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(200);
      const cy1 = await dot.getAttribute('cy');
      Number(cy1) < Number(cy0)
        ? ok(`ArrowUp moved the dot up (cy ${cy0} → ${cy1})`)
        : bad('ArrowUp did not move up', `cy ${cy0} → ${cy1}`);

      // Shift = coarse (10%) must outrun a plain press (1%).
      const cyA = Number(await dot.getAttribute('cy'));
      await page.keyboard.press('Shift+ArrowUp');
      await page.waitForTimeout(200);
      const cyB = Number(await dot.getAttribute('cy'));
      const coarse = cyA - cyB, fine = Number(cy0) - Number(cy1);
      coarse > fine
        ? ok(`Shift+Arrow is coarser (${coarse.toFixed(1)}px vs ${fine.toFixed(1)}px)`)
        : bad('Shift+Arrow not coarser', `shift=${coarse}, plain=${fine}`);
    }

    // ---- ordering constraint really pushes ----
    console.log('\n== ordering constraint ==');
    await page.goto(BASE + '/constraints', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    {
      // The interval example is the only chart with exactly one circle (the mean dot).
      const svgs = await page.locator('svg').all();
      let svg = null;
      for (const s of svgs) if ((await s.locator('circle').count()) === 1) { svg = s; break; }
      if (!svg) throw new Error('could not find the interval chart');
      const dot = svg.locator('circle').first();
      // Scroll BEFORE measuring: bounding boxes are viewport coordinates, and this
      // chart is ~5000px down the page.
      await dot.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const meanBefore = Number(await dot.getAttribute('cy'));

      // Grab the LOW cap: the lowest of the two grabbable tick lines. Filter to the
      // cap colour — the axis ticks are lines too, and they sit lower still (they're
      // pointer-events:none, so grabbing one is a silent no-op).
      const lines = await svg.locator('line[stroke="#64748b"]').all();
      let lowest = null, maxY = -1;
      for (const l of lines) {
        const b = await l.boundingBox();
        if (b && b.y > maxY) { maxY = b.y; lowest = b; }
      }
      if (!lowest) throw new Error('no cap handles found');
      await page.mouse.move(lowest.x + lowest.width / 2, lowest.y + lowest.height / 2);
      await page.mouse.down();
      await page.mouse.move(lowest.x + lowest.width / 2, lowest.y - 120, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(300);

      const meanAfter = Number(await dot.getAttribute('cy'));
      meanAfter < meanBefore
        ? ok(`low cap pushed the mean up (cy ${meanBefore} → ${meanAfter}) — repaired, not blocked`)
        : bad('ordering did not push the mean', `mean cy ${meanBefore} → ${meanAfter}`);
    }

    // ---- monotonic really pushes the rows a dip would have crossed ----
    console.log('\n== monotonic constraint ==');
    {
      // The CDF example: 8 handles, one series.
      const svgs = await page.locator('svg').all();
      let svg = null;
      for (const s of svgs) if ((await s.locator('circle').count()) === 8) { svg = s; break; }
      if (!svg) bad('could not find the CDF chart', '');
      else {
        const dots = await svg.locator('circle').all();
        await dots[0].scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const cyOf = async (i) => Number(await dots[i].getAttribute('cy'));
        // Point 4 sits between the dragged point and the top of the curve, so the
        // drag WILL cross it. (Points 6-7 already start above the drag target and
        // correctly stay put — monotonic pushes only what a dip would cross.)
        const rightBefore = await cyOf(4);
        const box = await dots[2].boundingBox();

        // Drag an early point up hard: later points must rise to meet it.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y - 90, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        const rightAfter = await cyOf(4);
        rightAfter < rightBefore
          ? ok(`a point dragged up carried its right-hand neighbours (cy ${rightBefore} → ${rightAfter})`)
          : bad('monotonic did not push later rows', `cy ${rightBefore} → ${rightAfter}`);

        // And the curve is genuinely non-decreasing afterwards.
        const cys = [];
        for (let i = 0; i < 8; i++) cys.push(await cyOf(i));
        const rising = cys.every((v, i) => i === 0 || v <= cys[i - 1] + 0.01);
        rising ? ok('the whole curve is non-decreasing after the drag') : bad('curve dips after drag', cys.join(', '));
      }
    }

    // ---- spacing really keeps neighbours apart ----
    console.log('\n== spacing constraint ==');
    {
      const svgs = await page.locator('svg').all();
      // The thresholds chart: 4 grabbable ticks, no circles.
      let svg = null;
      for (const s of svgs) {
        if ((await s.locator('circle').count()) === 0 && (await s.locator('line[stroke="#2563eb"]').count()) === 4) { svg = s; break; }
      }
      if (!svg) bad('could not find the thresholds chart', '');
      else {
        const ticks = await svg.locator('line[stroke="#2563eb"]').all();
        await ticks[0].scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const xs = async () => {
          const out = [];
          for (const t of ticks) out.push(Number(await t.getAttribute('x1')));
          return out.sort((a, b) => a - b);
        };
        const before = await xs();
        const box = await ticks[0].boundingBox();

        // Shove the lowest threshold right, into its neighbours.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        const after = await xs();
        const moved = after.some((v, i) => Math.abs(v - before[i]) > 1);
        moved ? ok('the shove moved thresholds') : bad('drag did nothing', before.join(', '));

        // min: 8 on a [0,100] domain — no two may collapse together.
        const gaps = after.slice(1).map((v, i) => v - after[i]);
        const minGap = Math.min(...gaps);
        minGap > 2
          ? ok(`neighbours kept their distance (smallest gap ${minGap.toFixed(1)}px)`)
          : bad('thresholds collapsed', `gaps ${gaps.map((g) => g.toFixed(1)).join(', ')}`);
      }
    }

    // ---- symlog drags, and diverging colours ----
    console.log('\n== symlog / diverging ==');
    await page.goto(BASE + '/scales', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    {
      const svgs = await page.locator('svg').all();
      let svg = null;
      for (const s of svgs) if ((await s.locator('circle').count()) === 4) { svg = s; break; }
      if (!svg) bad('could not find the symlog chart', '');
      else {
        const dot = svg.locator('circle').first();
        await dot.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const cx0 = Number(await dot.getAttribute('cx'));
        const fill0 = await dot.getAttribute('fill');
        const box = await dot.boundingBox();

        // A symlog scale is invertible — so it must drag like any continuous scale.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 - 150, box.y + box.height / 2, { steps: 8 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        const cx1 = Number(await dot.getAttribute('cx'));
        const fill1 = await dot.getAttribute('fill');
        cx1 < cx0 ? ok(`symlog drags (cx ${cx0.toFixed(1)} → ${cx1.toFixed(1)})`) : bad('symlog did not drag', `cx ${cx0} → ${cx1}`);
        fill1 !== fill0
          ? ok(`diverging ramp re-coloured across the pivot (${fill0} → ${fill1})`)
          : bad('diverging colour did not change', `stayed ${fill0}`);
      }
    }
    } finally {
        await browser.close();
        stopNext();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    if (fail) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
