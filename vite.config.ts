import { defineConfig, loadEnv } from 'vite';
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

/**
 * PENJAGA BUILD PENGUJI. Build dengan `VITE_ALLOW_TEST_TOGGLE=1` membuka SEMUA
 * game tanpa login (saklar penguji hidup, kelompok draft tampil). Kalau build
 * seperti itu sampai ke situs yang dipakai pembeli, yang dijual jadi gratis.
 *
 * Karena itu build penguji WAJIB diberi `DEPLOY_BASE` berakhiran `/uji-…/`
 * (mis. `/Game-Edukasi-Anak/uji-sd2/`). Tanpa itu build GAGAL. Efek sampingnya
 * justru yang dicari: semua aset build penguji menunjuk ke `/uji-…/`, jadi
 * kalau salah disalin ke `app/` atau ke root Firebase, aplikasinya rusak
 * (404), bukan terbuka gratis. Variabelnya juga dibaca dari file `.env`, bukan
 * cuma dari shell, supaya tak bisa "bocor" lewat berkas.
 */
function guardTesterBuild(env: Record<string, string | undefined>, base: string) {
  if (env.VITE_ALLOW_TEST_TOGGLE !== '1') return;
  if (/\/uji[^/]*\/$/.test(base)) return;
  throw new Error(
    'Build penguji (VITE_ALLOW_TEST_TOGGLE=1) wajib memakai DEPLOY_BASE berakhiran ' +
      '"/uji-…/", mis. DEPLOY_BASE=/Game-Edukasi-Anak/uji-sd2/. Base sekarang: "' +
      base +
      '". Ini penjaga supaya build yang membuka semua game tidak ikut terunggah ke produksi.',
  );
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Overridable for static hosting under a subpath (GitHub Pages testing);
  // production Firebase Hosting uses the default '/'.
  const base = process.env.DEPLOY_BASE ?? '/';
  if (command === 'build') {
    guardTesterBuild({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }, base);
  }
  return {
    base,
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
  };
});
