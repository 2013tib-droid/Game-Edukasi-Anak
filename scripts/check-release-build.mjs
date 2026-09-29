/**
 * Pemeriksa build RILIS — jalankan sebelum menyalin `dist/` ke situs yang
 * dipakai pembeli (branch Pages `app/`, Firebase Hosting):
 *
 *   node scripts/check-release-build.mjs [dist]
 *
 * Gagal (exit 1) kalau isi build menandakan build PENGUJI:
 *   - `pp_test_mode_v1`: kunci localStorage mode penguji. Di build rilis
 *     cabangnya dibuang mati oleh minifier (terbukti nol kemunculan sejak
 *     2026-09-22), jadi kalau ada, saklarnya hidup dan semua game bisa dibuka
 *     tanpa bayar.
 *   - `/uji-` di index.html: base build penguji (lihat `guardTesterBuild` di
 *     vite.config.ts).
 * Ini lapis kedua; lapis pertama membuat build penguji gagal tanpa base `/uji-`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
// HANYA `pp_test_mode_v1`: `pp_lock_mode_v1` masih muncul di build rilis yang sah
// (kodenya menyebut kunci itu walau override-nya diabaikan), jadi bukan penanda.
const MARKERS = ['pp_test_mode_v1'];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(js|html)$/.test(name)) yield p;
  }
}

const problems = [];
let files = 0;
try {
  for (const f of walk(dist)) {
    files++;
    const text = readFileSync(f, 'utf8');
    for (const m of MARKERS) if (text.includes(m)) problems.push(`${f}: memuat "${m}" (saklar penguji hidup)`);
    if (f.endsWith('index.html') && /\/uji-/.test(text)) problems.push(`${f}: base "/uji-…/" (build penguji)`);
  }
} catch (e) {
  console.error(`Tidak bisa membaca "${dist}": ${e.message}`);
  process.exit(2);
}
if (files === 0) {
  console.error(`Tidak ada berkas .js/.html di "${dist}" — sudah di-build?`);
  process.exit(2);
}
if (problems.length) {
  console.error('BUKAN build rilis — JANGAN diunggah ke situs pembeli:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`Build rilis bersih: ${files} berkas diperiksa, tak ada tanda build penguji.`);
