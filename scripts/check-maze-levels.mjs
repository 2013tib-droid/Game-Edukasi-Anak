/**
 * Validate every level of the `maze` template (Taman Labirin).
 *
 *     node scripts/check-maze-levels.mjs
 *
 * Labirin dibuat mesin dari benih (`src/games/mazeLevels.ts`), jadi yang
 * diperiksa di sini PERSIS labirin yang dimainkan anak. Dituntut:
 *  1. Tiap petak terjangkau dari petak mulai (labirin tak berpulau).
 *  2. Tujuan & semua barang terjangkau; `par` = rute terpendek sungguhan.
 *  3. Mulai, tujuan & barang di petak berbeda.
 *  4. Lorong cukup lebar di HP terkecil (320×568): petak ≥ 40 px.
 *  5. Labirin kenalan (l1) tak berjalan buntu lebih dari dua; labirin besar
 *     (≥ 30 petak) punya paling sedikit lima jalan buntu — yang susah harus
 *     benar-benar susah.
 *  6. Level berbarang: tujuan di ujung lorong buntu (tak bisa dilewati).
 *
 * Kalau gagal: ubah spec slotnya — jangan longgarkan pemeriksaan ini.
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
  const b64 = Buffer.from(out.outputFiles[0].text).toString('base64');
  return import(`data:text/javascript;base64,${b64}`);
}

const files = ['src/games/tk/taman-labirin.ts'];
const mod = await load(
  files.map((f, i) => `import c${i} from ${JSON.stringify(spec(f))};`).join('\n') +
    `\nexport const configs = [${files.map((_, i) => `c${i}`).join(',')}];` +
    `\nexport { distances, deadEnds, bestTour, openNeighbors } from ${JSON.stringify(spec('src/engine/core/maze.ts'))};`,
);

// HP 320×568: lebar papan ≈ 320 − 2×16 (gutter) − 2×9 (bingkai) − 18;
// tinggi ≈ 568 − 92 (baris atas) − 52 (kalimat) − 52 (alat) − 28.
const BOARD_W = 320 - 32 - 18 - 18;
const BOARD_H = 568 - 92 - 52 - 52 - 28 - 18;
const MIN_CELL = 40;

let problems = 0;
let checked = 0;
let smallest = Infinity;
const fail = (where, msg) => {
  problems += 1;
  console.error(`✗ ${where}: ${msg}`);
};

for (const config of mod.configs) {
  config.levels.forEach((slot) => {
    const variants = Array.isArray(slot) ? slot : [slot];
    variants.forEach((lv, v) => {
      const where = `${config.id} ${lv.id} varian ${v + 1}`;
      const d = lv.data;
      const m = { cols: d.cols, rows: d.rows, open: d.open };
      checked += 1;
      const dist = mod.distances(m, d.start);
      if (dist.some((x) => x < 0)) fail(where, 'ada petak yang tak terjangkau');
      const pickups = d.pickups ?? [];
      const spots = [d.start, d.goal, ...pickups];
      if (new Set(spots).size !== spots.length) fail(where, 'mulai/tujuan/barang bertumpuk');
      if (pickups.length && !d.pickupItem) fail(where, 'barang tanpa gambar');
      const tour = mod.bestTour(m, d.start, d.goal, pickups);
      if (!tour.length) fail(where, 'tujuan/barang mustahil dicapai');
      else if (tour.length - 1 !== d.par) fail(where, `par ${d.par} ≠ rute terpendek ${tour.length - 1}`);
      const cell = Math.min(BOARD_W / d.cols, BOARD_H / d.rows);
      smallest = Math.min(smallest, cell);
      if (cell < MIN_CELL) fail(where, `petak cuma ${cell.toFixed(1)} px di HP 320×568`);
      const dead = mod.deadEnds(m).filter((i) => i !== d.start && i !== d.goal && !pickups.includes(i)).length;
      if (lv.id === 'l1' && dead > 2) fail(where, `labirin kenalan punya ${dead} jalan buntu`);
      if (d.cols * d.rows >= 30 && dead < 5) fail(where, `labirin besar cuma ${dead} jalan buntu`);
      if (pickups.length && mod.openNeighbors(m, d.goal).length !== 1) fail(where, 'tujuan bukan ujung lorong buntu — kandang bisa dilewati');
      if (/\d/.test(lv.narration)) fail(where, 'narasi berangka');
    });
  });
}

console.log(`${checked} varian labirin diperiksa · petak terkecil ${smallest.toFixed(1)} px di HP 320×568`);
if (problems) {
  console.error(`${problems} masalah.`);
  process.exit(1);
}
