import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Library bundle only — docs site stays on vite.config.js → site/.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.js'),
      name: 'vibe',
      formats: ['es'],
      fileName: 'vibe',
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: { d3: 'd3' },
      },
    },
  },
});
