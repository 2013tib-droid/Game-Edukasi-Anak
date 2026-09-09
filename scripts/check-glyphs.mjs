/**
 * Validate every level of the `tracing` template (Tulis Angka, Tulis Huruf).
 *
 *     node scripts/check-glyphs.mjs
 *
 * Sejak template `tracing` jadi REL yang diikuti jari (2026-09-09), huruf atau
 * angka tanpa data goresan di `glyphStrokes.ts` tidak lagi "jatuh ke font" —
 * layarnya kosong, tak ada yang bisa ditelusuri anak. Dulu itu cuma bikin
 * bentuknya beda-beda per HP; sekarang gamenya buntu. Karena itu diperiksa
 * di CI, bukan dengan mencoba beberapa huruf secara acak.
 *
 * Tiga hal yang diperiksa untuk SEMUA varian (bukan cuma yang terambil satu
 * sesi — polanya sama dengan `check-item-ids.mjs`):
 *  1. Tiap glyph punya data goresan.
 *  2. Goresan TERPENDEK di HP TERKECIL yang didukung masih cukup panjang
 *     untuk ditelusuri jari anak.
 *  3. Tak ada goresan yang kosong / sepanjang nol (salah tulis di data akan
 *     menyangkutkan anak di goresan yang tak bisa diselesaikan).
 */
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Lebar panggung tulis di HP TERKECIL yang didukung (320×568), DIUKUR headless
 * di build produksi: 288 px untuk viewBox selebar 100 satuan. Ukur ulang kalau
 * `.trace-stage` atau padding `.game-area` berubah.
 */
const PX_PER_UNIT = 288 / 100;

/**
 * Panjang minimum satu goresan, dalam piksel di HP 320 px. Target sentuh anak
 * menurut standar UX di CLAUDE.md 64 px; goresan yang lebih pendek dari itu
 * praktis tak bisa "disusuri" — jari sudah menutupi seluruhnya sebelum sempat
 * bergerak. Yang terpendek sekarang: palang huruf "f" (69 px).
 *
 * Kalau ada glyph baru yang jatuh di bawah ini, PERBESAR goresannya di
 * `glyphStrokes.ts` — jangan turunkan angka ini.
 */
const MIN_STROKE = 64;

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

const files = [];
for (const group of ['tk', 'sd1']) {
  for (const file of readdirSync(`src/games/${group}`)) {
    if (file.endsWith('.ts') && file !== 'letters.ts') files.push(`src/games/${group}/${file}`);
  }
}

const mod = await load(
  files.map((f, i) => `import c${i} from '${spec(f)}';`).join('\n') +
    `\nexport const configs = [${files.map((_, i) => `c${i}`).join(',')}];`,
);
const { handwriting } = await load(`export * from '${spec('src/engine/templates/glyphStrokes.ts')}'`);

/** Length of one stroke, in canvas units. */
function lengthOf(stroke) {
  let total = 0;
  for (let i = 1; i < stroke.length; i += 1) {
    total += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
  }
  return total;
}

const problems = [];
let checked = 0;
let shortest = { px: Infinity };

for (const config of mod.configs) {
  const levels = config.levels.flatMap((slot) => (Array.isArray(slot) ? slot : [slot]));
  for (const level of levels) {
    if ((level.template ?? config.template) !== 'tracing') continue;
    checked += 1;
    const { glyph } = level.data;
    const where = `${config.id} ${level.id}: "${glyph}"`;

    // The template lays the glyph out on a 100-unit canvas, same as on screen.
    const hand = handwriting(glyph, 100);
    if (!hand) {
      problems.push(`${where}\n    tidak ada data goresan — tambahkan di glyphStrokes.ts`);
      continue;
    }
    if (hand.strokes.length === 0) {
      problems.push(`${where}\n    nol goresan`);
      continue;
    }
    for (const [i, stroke] of hand.strokes.entries()) {
      const px = lengthOf(stroke) * PX_PER_UNIT;
      if (px < shortest.px) shortest = { px, where: `${where} goresan ${i + 1}` };
      if (px < MIN_STROKE) {
        problems.push(
          `${where}\n    goresan ${i + 1} cuma ${px.toFixed(0)} px di HP 320 px ` +
            `(min ${MIN_STROKE}) — perbesar goresannya, jangan turunkan ambangnya`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} masalah di level "tulis":\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `${checked} level "tulis" diperiksa. Goresan terpendek di HP 320 px: ` +
    `${shortest.px.toFixed(0)} px — ${shortest.where}`,
);
