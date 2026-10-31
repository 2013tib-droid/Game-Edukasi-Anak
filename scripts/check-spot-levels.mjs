/**
 * Periksa SEMUA varian game "Cari Perbedaan" (template `spot-diff`:
 * Cari Beda TK, Teliti Gambar SD 1-2).
 *
 *     node scripts/check-spot-levels.mjs
 *
 * Menuntut, untuk tiap varian:
 *  1. `spotProblems` kosong (builder juga memeriksanya — ini jaring kedua).
 *  2. Daerah sentuh TERKECIL ≥ 60 px di HP 320×568 (gambar ±279 px lebar).
 *     Yang menciut diam-diam saat dicoba sekali di layar besar adalah yang
 *     gagal disentuh anak berjari gemuk di HP murah.
 *  3. Benda yang DIBESARKAN tetap di dalam gambar.
 *  4. Jumlah perbedaan sesuai kelompok (TK 3, SD 5).
 *
 * Kalau gagal: ubah POSISI layout / jenis perbedaannya — jangan turunkan
 * ambangnya.
 */
import { build } from 'esbuild';
import path from 'node:path';

const spec = (f) => path.resolve(f).replaceAll('\\', '/');
async function load(contents) {
  const out = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    alias: { '@': path.resolve('src') },
    define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
}

const files = ['src/games/tk/cari-beda.ts', 'src/games/sd1/teliti-gambar.ts'];
const mod = await load(
  files.map((f, i) => `import c${i} from ${JSON.stringify(spec(f))};`).join('\n') +
    `\nexport const configs = [${files.map((_, i) => `c${i}`).join(',')}];` +
    `\nexport * from ${JSON.stringify(spec('src/engine/core/spotDiff.ts'))};`,
);

// Lebar gambar di HP 320×568: min(320 − 32, (568 − 196) / 2 × 1,5) — lihat spot-diff.css.
const PANEL_PX = Math.min(320 - 32, ((568 - 196) / 2) * 1.5);
const PX = PANEL_PX / mod.SPOT_W;
const MIN_PX = 60;
const WANT = { tk: 3, sd: 5 };

let problems = 0;
let checked = 0;
let smallest = Infinity;
const kinds = {};
for (const config of mod.configs) {
  for (const slot of config.levels) {
    for (const [v, lv] of (Array.isArray(slot) ? slot : [slot]).entries()) {
      checked++;
      const d = lv.data;
      const where = `${config.id} ${lv.id}#${v} (${d.place})`;
      const bad = [...mod.spotProblems(d)];
      if (d.changes.length !== WANT[d.layout]) bad.push(`${d.changes.length} perbedaan, mestinya ${WANT[d.layout]}`);
      for (const t of mod.spotTargets(d)) {
        const px = t.r * 2 * PX;
        smallest = Math.min(smallest, px);
        if (px < MIN_PX) bad.push(`daerah sentuh ${px.toFixed(0)} px`);
      }
      const layout = mod.SPOT_LAYOUTS[d.layout];
      for (const c of d.changes) {
        kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
        if (c.kind !== 'besar') continue;
        const p = layout[c.at];
        const h = (p.size * mod.SPOT_GROW) / 2;
        if (p.y - h < -1 || p.y + h > mod.SPOT_H + 1 || p.x - h < -1 || p.x + h > mod.SPOT_W + 1) bad.push('benda besar keluar gambar');
      }
      if (/\d/.test(lv.narration)) bad.push('digit di narasi');
      if (bad.length) {
        problems++;
        console.log(`✗ ${where}: ${bad.join('; ')}`);
      }
    }
  }
}
console.log(`${checked} varian diperiksa · daerah sentuh terkecil ${smallest.toFixed(0)} px · ${JSON.stringify(kinds)}`);
if (problems) {
  console.log(`${problems} varian bermasalah`);
  process.exit(1);
}
console.log('Semua soal cari perbedaan sah.');
