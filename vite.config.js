import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Low/mid-end Android WebView/Chrome; keep output lean
    target: 'es2019',
    chunkSizeWarningLimit: 600,
  },
});
