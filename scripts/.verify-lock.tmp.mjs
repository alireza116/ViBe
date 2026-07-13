// Drives the real gestures on docs/editing/lock.html and asserts the lock holds.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 5179;
const BASE = `http://localhost:${PORT}`;
let passed = 0;
const failures = [];
const check = (name, cond, detail = '') => {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
};

async function waitForServer(url, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try { const r = await fetch(url); if (r.ok) return; } catch { }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`server never ready at ${url}`);
}

const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
const stopVite = () => { try { process.kill(-vite.pid); } catch { } };
const browser = await chromium.launch();

try {
    await waitForServer(`${BASE}/docs/editing/lock.html`);
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/docs/editing/lock.html`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#seed .chart svg');

    const data = (sec) => page.$eval(`#${sec} .chart > div`, (el) => el.getData());
    // Drag/click helpers in page coords.
    const drag = async (from, to, steps = 20) => {
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (let i = 1; i <= steps; i++) {
            await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
            await page.waitForTimeout(8);
        }
        await page.mouse.up();
        await page.waitForTimeout(60);
    };
    // Pixel geometry of a section's plot, so we can aim in data space.
    const frame = async (sec, spec) => {
        const box = await page.$eval(`#${sec} .chart svg`, (svg) => {
            const r = svg.getBoundingClientRect();
            return { left: r.left, top: r.top };
        });
        const { m, w, h, xd, yd } = spec;
        const iw = w - m.left - m.right, ih = h - m.top - m.bottom;
        return {
            at: (xv, yv) => ({
                x: box.left + m.left + (xv - xd[0]) / (xd[1] - xd[0]) * iw,
                y: box.top + m.top + (1 - (yv - yd[0]) / (yd[1] - yd[0])) * ih,
            })
        };
    };

    // ---- 1. Scatter: locked seed, free additions ---------------------------
    console.log('\nScatter (lock: "seed")');
    const sc = await frame('seed', {
        m: { top: 16, right: 16, bottom: 32, left: 40 }, w: 400, h: 300,
        xd: [0, 10], yd: [0, 10],
    });
    const before = await data('seed');
    check('seeds 5 observed rows', before.length === 5 && before.every((d) => d.source === 'observed'));

    // Drag a LOCKED point (row 0 at 1.2, 2.4) hard to the right.
    await drag(sc.at(1.2, 2.4), sc.at(8, 8));
    let now = await data('seed');
    check('locked point does not move', JSON.stringify(now[0]) === JSON.stringify(before[0]),
        JSON.stringify(now[0]));
    check('a drag over a locked point creates nothing', now.length === 5, `${now.length} rows`);

    // Click empty space -> a new point, tagged "yours" by the schema default.
    await page.mouse.click(sc.at(8, 8).x, sc.at(8, 8).y);
    await page.waitForTimeout(60);
    now = await data('seed');
    check('click adds a row', now.length === 6, `${now.length} rows`);
    check('added row is tagged "yours"', now[5] && now[5].source === 'yours', JSON.stringify(now[5]));

    // Drag YOUR point -> it moves.
    await drag(sc.at(now[5].x, now[5].y), sc.at(3, 8));
    const moved = (await data('seed'))[5];
    check('your point drags', Math.abs(moved.x - 3) < 0.5 && Math.abs(moved.y - 8) < 0.5, JSON.stringify(moved));

    // Alt-click yours -> removed. Locked rows still all there.
    await page.keyboard.down('Alt');
    await page.mouse.click(sc.at(moved.x, moved.y).x, sc.at(moved.x, moved.y).y);
    await page.keyboard.up('Alt');
    await page.waitForTimeout(60);
    now = await data('seed');
    check('alt-click removes yours', now.length === 5, `${now.length} rows`);
    check('the 5 locked rows survive intact',
        JSON.stringify(now) === JSON.stringify(before), JSON.stringify(now));

    // Alt-click a LOCKED point -> nothing (not removable, and create is noAlt).
    await page.keyboard.down('Alt');
    await page.mouse.click(sc.at(2.6, 3.1).x, sc.at(2.6, 3.1).y);
    await page.keyboard.up('Alt');
    await page.waitForTimeout(60);
    check('alt-click on a locked point removes nothing', (await data('seed')).length === 5);

    // ---- 2. Predicate lock: actuals vs forecast ---------------------------
    console.log('\nBars (lock: predicate)');
    const bd = await data('predicate');
    const bars = await page.$$eval('#predicate .chart svg rect', (rs) => rs
        .filter((r) => r.getAttribute('fill') && +r.getAttribute('height') > 1)
        .map((r) => { const b = r.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + 4 }; }));
    check('four bars drawn', bars.length === 4, `${bars.length}`);
    // Drag Q1 (actual, locked) down.
    await drag(bars[0], { x: bars[0].x, y: bars[0].y + 60 });
    let nb = await data('predicate');
    check('locked actual bar (Q1) does not move', nb[0].n === bd[0].n, `${nb[0].n} (was ${bd[0].n})`);
    // Drag Q3 (forecast) down.
    await drag(bars[2], { x: bars[2].x, y: bars[2].y + 60 });
    nb = await data('predicate');
    check('forecast bar (Q3) drags', nb[2].n !== bd[2].n, `${nb[2].n} (was ${bd[2].n})`);
    check('dragging a free bar left the actuals alone',
        nb[0].n === bd[0].n && nb[1].n === bd[1].n);

    // ---- 3. NYT you-draw-it -----------------------------------------------
    console.log('\nYou-draw-it (NYT)');
    const ny = await frame('you-draw-it', {
        m: { top: 20, right: 24, bottom: 32, left: 56 }, w: 560, h: 340,
        xd: [1968, 2016], yd: [0, 60000],
    });
    const rec = await data('you-draw-it');
    check('seeds the 1968-1990 record', rec.length === 23 && rec[22].year === 1990);

    // Draw: drag left-to-right across the free half at ~20000 deaths.
    await drag(ny.at(1991, 20000), ny.at(2016, 20000), 40);
    let nd = await data('you-draw-it');
    const drawn = nd.filter((d) => d.year > 1990);
    check('the drag drew the missing years', drawn.length >= 20, `${drawn.length} drawn`);
    check('drawn years are all past 1990', drawn.every((d) => d.year >= 1991 && d.year <= 2016));
    check('drawn values landed near the swept height',
        drawn.every((d) => Math.abs(d.deaths - 20000) < 3000),
        JSON.stringify(drawn.slice(0, 3)));
    check('the record is untouched by the draw',
        JSON.stringify(nd.slice(0, 23)) === JSON.stringify(rec));

    // Now drag BACK across the locked record at a wild height: it must not budge,
    // and the free rows it crosses must still take the paint.
    await drag(ny.at(2010, 55000), ny.at(1970, 55000), 40);
    nd = await data('you-draw-it');
    check('sweeping back over the record leaves it intact',
        JSON.stringify(nd.slice(0, 23)) === JSON.stringify(rec));
    const repainted = nd.filter((d) => d.year >= 1991 && d.year <= 2010);
    check('the free years the same stroke crossed were repainted',
        repainted.length > 0 && repainted.every((d) => Math.abs(d.deaths - 55000) < 3000),
        JSON.stringify(repainted.slice(0, 3)));

    // Reveal: the answer key is a guide, so it must not enter the data.
    const rows = (await data('you-draw-it')).length;
    await page.click('#you-draw-it button');
    await page.waitForTimeout(80);
    check('reveal adds no rows (the truth is a guide, not data)',
        (await data('you-draw-it')).length === rows);
    // And drawing is retired (the edit was staged to 0).
    await drag(ny.at(2000, 10000), ny.at(2010, 10000), 10);
    check('after the reveal the line is no longer drawable',
        JSON.stringify(await data('you-draw-it')) === JSON.stringify(nd));

    check('no page errors', errors.length === 0, errors.join(' | '));
} finally {
    await browser.close();
    stopVite();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { failures.forEach((f) => console.log(`  ✗ ${f}`)); process.exit(1); }
