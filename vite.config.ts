import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  // Overridable for static hosting under a subpath (GitHub Pages testing);
  // production Firebase Hosting uses the default '/'.
  base: process.env.DEPLOY_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Keep chunks small for low-end Android devices; games are lazy-loaded per route.
    target: 'es2020',
  },
});
