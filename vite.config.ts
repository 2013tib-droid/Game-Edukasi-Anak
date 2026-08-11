import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Absolute URL of the deployed site, used for the social-share tags in
 * `index.html`. Crawlers (WhatsApp, Facebook, TikTok bio links) refuse
 * relative `og:image` paths, and Vite's `base` rewrite only produces a path —
 * so the host has to be baked in at build time.
 *
 * Default = the GitHub Pages test deploy. Override when publishing elsewhere:
 *   SITE_URL=https://petualanganpintar.web.app/ npm run build
 */
const siteUrl = (process.env.SITE_URL ?? 'https://2013tib-droid.github.io/Game-Edukasi-Anak/app/')
  .replace(/\/*$/, '/');

/** Fills `%SITE_URL%` in index.html — Vite only substitutes env vars there. */
function siteUrlPlugin() {
  return {
    name: 'site-url',
    transformIndexHtml(html: string) {
      return html.replaceAll('%SITE_URL%', siteUrl);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Overridable for static hosting under a subpath (GitHub Pages testing);
  // production Firebase Hosting uses the default '/'.
  base: process.env.DEPLOY_BASE ?? '/',
  plugins: [react(), siteUrlPlugin()],
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
