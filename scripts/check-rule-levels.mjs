/**
 * Validate every level of the `rule-sort` template (Pabrik Mainan, Robot
 * Pemilah) — game percabangan "KALAU".
 *
 *     node scripts/check-rule-levels.mjs
 *
 * Builder (`src/games/ruleLevels.ts`) sudah memeriksa yang murah (jawaban
 * contoh menyortir semua mainan, contoh di kotak cocok dengan jawabannya,
 * kode "perbaiki" memang salah). Yang BERAT ada di sini, karena builder ikut
 * jalan di HP anak: skrip ini mencoba SEMUA susunan tanda yang bisa dibuat
 * dari baki, lalu menuntut dua hal untuk tiap soal bercontoh:
 *
 *  1. ISI KOTAK CUKUP: setiap susunan yang menyortir contoh-contoh di kotak
 *     dengan benar juga menyortir SEMUA mainan antrean dengan benar. Kalau
 *     tidak, ada tebakan yang masuk akal dari bukti di layar tapi tetap
 *     disalahkan mesin — anak dihukum karena soalnya ambigu.
 *  2. TAK ADA TEBAKAN DI LUAR BUKTI: setiap susunan yang lolos antrean juga
 *     cocok dengan contoh-contohnya.
 *
 * Plus untuk semua soal: susunan yang lolos ≤ seperempat dari semua susunan
 * (menekan tanda asal-asalan tak boleh sering menang), dan baki tak lebih dari
 * tujuh tanda (sebaris di HP 320).
 *
 * Kalau sebuah soal gagal: TAMBAH/GANTI CONTOH di kotaknya — jangan
 * melonggarkan pemeriksaan ini.
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

const files = ['src/games/tk/pabrik-mainan.ts', 'src/games/sd1/robot-pemilah.ts'];
const mod = await load(
  files.map((f, i) => `import c${i} from ${JSON.stringify(spec(f))};`).join('\n') +
    `\nexport const configs = [${files.map((_, i) => `c${i}`).join(',')}];` +
    `\nexport { routeToy, expectedBoxes } from ${JSON.stringify(spec('src/engine/core/ruleSort.ts'))};`,
);

/** Semua susunan: tiap tempat tanda boleh diisi tanda baki mana pun. */
function* programs(boxes, tray) {
  const slots = boxes.flatMap((b, i) => Array.from({ length: b.slots }, () => i));
  const idx = slots.map(() => 0);
  while (true) {
    const prog = boxes.map(() => []);
    slots.forEach((box, k) => prog[box].push(tray[idx[k]]));
    yield prog;
    let k = 0;
    while (k < idx.length && ++idx[k] === tray.length) idx[k++] = 0;
    if (k === idx.length) return;
  }
}

const sorts = (prog, toys, want) => toys.every((t, i) => mod.routeToy(prog, t).box === want[i]);

let problems = 0;
let levels = 0;
let worst = { rate: 0, where: '' };
for (const config of mod.configs) {
  for (const slot of config.levels) {
    const variants = Array.isArray(slot) ? slot : [slot];
    variants.forEach((lv, v) => {
      levels++;
      const where = `${config.id} ${lv.id} varian ${v + 1}`;
      const d = lv.data;
      const exToys = d.boxes.flatMap((b) => b.examples ?? []);
      const exWant = d.boxes.flatMap((b, i) => (b.examples ?? []).map(() => i));
      const qWant = mod.expectedBoxes(d.solution, d.queue);
      if (d.tray.length > 7) {
        problems++;
        console.error(`✗ ${where}: baki ${d.tray.length} tanda`);
      }
      let total = 0;
      let pass = 0;
      let ambiguous = null;
      let outside = null;
      for (const prog of programs(d.boxes, d.tray)) {
        total++;
        const okQueue = sorts(prog, d.queue, qWant);
        if (okQueue) pass++;
        if (!d.bubbles && exToys.length) {
          const okEx = sorts(prog, exToys, exWant);
          if (okEx && !okQueue && !ambiguous) ambiguous = prog;
          if (okQueue && !okEx && !outside) outside = prog;
        }
      }
      const rate = pass / total;
      if (rate > worst.rate) worst = { rate, where };
      const show = (p) => p.map((c) => c.join('+')).join(' | ');
      if (ambiguous) {
        problems++;
        console.error(`✗ ${where}: isi kotak tak cukup — "${show(ambiguous)}" cocok dengan contoh tapi gagal di antrean`);
      }
      if (outside) {
        problems++;
        console.error(`✗ ${where}: "${show(outside)}" lolos antrean padahal tak cocok dengan contoh`);
      }
      if (rate > 0.25) {
        problems++;
        console.error(`✗ ${where}: ${pass}/${total} susunan lolos — terlalu mudah ditebak asal`);
      }
    });
  }
}

console.log(`${levels} soal percabangan diperiksa; peluang tebak-asal terbesar ${(worst.rate * 100).toFixed(1)}% (${worst.where}).`);
if (problems) {
  console.error(`${problems} masalah.`);
  process.exit(1);
}
console.log('Semua soal adil: isi kotak cukup untuk menebak aturannya.');
