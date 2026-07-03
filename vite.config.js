import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Ensures hot module reloading works properly for vanilla js
    watch: {
      usePolling: true
    }
  }
});