import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createMDX from '@next/mdx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const vibeEntry = path.join(repoRoot, 'src/index.js');
const rawLoader = path.join(__dirname, 'loaders/raw-string-loader.cjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing the library from ../src
  outputFileTracingRoot: repoRoot,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      // Relative alias — absolute paths break Turbopack ("server relative imports").
      '@vibe': '../src/index.js',
    },
    rules: {
      '*.example.txt': {
        loaders: [rawLoader],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vibe': vibeEntry,
    };
    // Plain text chart bodies — never parsed as JS (avoids dev HMR / import.meta in eval strings).
    config.module.rules.unshift({
      test: /\.example\.txt$/,
      type: 'asset/source',
    });
    return config;
  },
  transpilePackages: [],
};

// No remark/rehype plugins, deliberately. Turbopack needs plugins as serializable
// strings (the config crosses into Rust), so a local plugin cannot be passed. It is
// also load-bearing for the regression gate: scripts/verify-browser.mjs roots its
// assertions at section ids with DESCENDANT selectors (`#band .chart > div`), so an
// id must sit on an ancestor that CONTAINS the charts. rehype-slug would move ids
// onto the <h2>, silently breaking ~20 checks. Section ids come from <Section>.
const withMDX = createMDX({});

const config = withMDX(nextConfig);

// Re-assert the raw chart-body rules AFTER withMDX, so its merge can never drop them.
// These are load-bearing: every live example is a plain-text `mount(Elicit({…}))`
// body that must never be parsed as a JS module (which would inject dev HMR /
// import.meta into the eval string).
config.turbopack.rules['*.example.txt'] = { loaders: [rawLoader], as: '*.js' };

export default config;
