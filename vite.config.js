import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { globSync } from 'node:fs';

// Docs / playground site. Library bundle is vite.lib.config.js → dist/.
const htmlPages = globSync(['index.html', 'docs/**/*.html'], { cwd: import.meta.dirname });
const input = Object.fromEntries(
  htmlPages.map((file) => [
    file.replace(/\.html$/, '').replace(/\//g, '__'),
    resolve(import.meta.dirname, file),
  ])
);

export default defineConfig({
  build: {
    outDir: 'site',
    emptyOutDir: true,
    rollupOptions: { input },
  },
  server: {
    // Ensures hot module reloading works properly for vanilla js
    watch: {
      usePolling: true,
    },
  },
});
