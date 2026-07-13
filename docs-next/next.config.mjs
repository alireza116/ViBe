import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing the library from ../src
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      '@vibe': path.join(repoRoot, 'src/index.js'),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vibe': path.join(repoRoot, 'src/index.js'),
    };
    return config;
  },
  transpilePackages: [],
};

export default nextConfig;
