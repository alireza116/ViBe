// @ts-check
// dev.js — the ONE place the library decides whether to talk, and the ONE dedup
// store. Every developer-facing diagnostic goes through `warn(key, message)`.
//
// WHY THIS EXISTS. These guards used to be gated on
//
//     const DEV = !!(import.meta.env && import.meta.env.DEV);
//
// duplicated in three modules. Only Vite injects `import.meta.env`, so on
// webpack/Turbopack (Next.js), Parcel, esbuild, plain `<script type=module>` and
// Node the constant folded to a literal `false` — and because it was a literal,
// Rollup then tree-shook every guarded block out of the library build. The result
// was that a dozen carefully written messages were invisible to every consumer,
// including this repo's own Next docs site and `dist/elicit.js`. A diagnostic that
// only fires in the one bundler the author happens to use is not a diagnostic.
//
// So: WARNINGS ARE ON BY DEFAULT, and `enabled` is runtime state rather than a
// foldable constant, which is also what keeps the call sites in the built bundle.
// The cost of leaving them on is a Set lookup per key — every warning is deduped
// once per key, and scales re-resolve on every render, so this must stay cheap.
// A viz library's users are analysts and researchers, not latency-critical apps;
// the right default is to tell them their spec is wrong.
//
// An embedder who genuinely wants silence calls `setWarnings(false)` (exported
// from the package root). Bundlers statically replace `process.env.NODE_ENV`, so
// a production build of a consuming app goes quiet on its own.

/**
 * Warnings default on. The only thing that turns them off automatically is an
 * explicit production NODE_ENV, which every major bundler inlines. Anything else
 * — including "no idea what environment this is" — gets diagnostics.
 * @returns {boolean}
 */
function detect() {
    try {
        // The text `process.env.NODE_ENV` must appear LITERALLY: bundlers string-
        // replace this exact expression at build time. Reading it off globalThis
        // would satisfy tsc but defeat the substitution, leaving `process`
        // undefined in a browser bundle and warnings on in production.
        // @ts-ignore `process` is Node/bundler-only; guarded by typeof, and we do not want @types/node in the lib's type space.
        const env = typeof process !== 'undefined' && process.env && process.env.NODE_ENV;
        if (env) return env !== 'production';
    } catch {
        // A hardened or sandboxed realm can throw on global access — warn anyway.
    }
    return true;
}

let enabled = detect();

/** Keys already warned about. Shared across every guard so one key means one line. */
const seen = new Set();

/**
 * Turn developer warnings on or off. Exported from the package root so an
 * embedder can silence the library without a bundler flag. Clears the dedup
 * store, so re-enabling reports a still-broken spec again.
 * @param {boolean} on
 * @returns {void}
 */
export function setWarnings(on) {
    enabled = !!on;
    seen.clear();
}

/**
 * True when diagnostics are live. Prefer `warn()`; use this only to skip work
 * that is expensive to compute purely for a message.
 * @returns {boolean}
 */
export function warningsEnabled() {
    return enabled;
}

/**
 * Warn once per `key`. The `[elicit]` prefix is added here — call sites pass the
 * message only.
 * @param {string} key dedup key; include the mark/feature so two bad marks both report
 * @param {string} message
 * @returns {void}
 */
export function warn(key, message) {
    if (!enabled || seen.has(key)) return;
    seen.add(key);
    console.warn(`[elicit] ${message}`);
}

/**
 * Reset the dedup store without changing whether warnings are enabled. For tests
 * and for the browser verifier, which drives many charts in one page.
 * @returns {void}
 */
export function resetWarnings() {
    seen.clear();
}
