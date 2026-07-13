import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const vibeEntry = path.join(repoRoot, 'src/index.js');
const rawLoader = path.join(__dirname, 'loaders/raw-string-loader.cjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing the library from ../src
  outputFileTracingRoot: repoRoot,
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

export default nextConfig;
