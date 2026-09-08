/**
 * Validate every level of the `tap-picture` template (game "Anggota Tubuh").
 *
 *     node scripts/check-body-parts.mjs
 *
 * Yang dijaga di sini TIDAK terlihat saat bermain sekali: soal yang bagiannya
 * berdempetan tetap bisa dimainkan — daerah sentuhnya cuma menciut diam-diam,
 * dan yang gagal menyentuhnya adalah anak berjari gemuk di HP murah, bukan
 * orang dewasa yang mengetesnya di layar besar.
 *
 * Tiga hal yang diperiksa untuk SEMUA varian (bukan cuma yang terambil satu
 * sesi — polanya sama dengan `check-item-ids.mjs`):
 *  1. `answer` benar-benar ada di `parts`, dan tak ada bagian kembar.
 *  2. Daerah sentuh terkecil di HP TERKECIL yang didukung masih selebar jari.
 *  3. Kalimat soalnya tidak lebih panjang dari yang muat tiga baris — baris
 *     keempat memakan tinggi gambar, dan gambar yang mengecil mengecilkan
 *     semua daerah sentuhnya sekaligus.
 */
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Kotak gambar di HP TERKECIL yang didukung (320×568), DIUKUR headless di
 * build produksi: lebar 288 px, dan tinggi 452 px dikurangi tinggi kalimat
 * soal — 84 px untuk kalimat tiga baris, kasus terburuk yang diizinkan aturan
 * (3) di bawah. Ukur ulang kalau tata letaknya berubah.
 */
const BOX = { w: 288, h: 452 - 84 };

/**
 * Target sentuh anak menurut standar UX di CLAUDE.md adalah 64 px; ambangnya
 * 60 px karena kalimat tiga baris di layar 320 px memang menyisakan sedikit
 * di bawahnya, dan itu keadaan TERBURUK — HP 360 px yang paling umum ada di
 * 75–79 px. Turun di bawah ini artinya ada bagian yang terlalu berdempetan;
 * ganti pengecohnya, jangan turunkan angkanya.
 */
const MIN_TOUCH = 60;

/**
 * Panjang kalimat soal yang masih muat TIGA baris di layar 320 px (diukur:
 * 40 karakter = tiga baris, 52 karakter = empat).
 */
const MAX_NARRATION = 40;

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
const { BODY_PARTS, kidFrame, kidSpots } = await load(
  `export * from '${spec('src/engine/ui/Kid.tsx')}'`,
);

/**
 * Berapa piksel satu satuan gambar jadi, di dalam `BOX`. Bingkainya BUKAN lagi
 * salah satu dari dua kotak tetap: sejak gambarnya jadi ilustrasi, engine
 * menghitung kotak terkecil yang memuat semua lingkaran sentuh soal itu, jadi
 * skalanya beda-beda tiap soal — dan skrip ini memakai fungsi yang sama persis
 * (`kidFrame`) supaya yang diukur benar-benar yang dilihat anak.
 */
function scaleOf(frame) {
  const [, , w, h] = frame.split(' ').map(Number);
  return Math.min(BOX.w / w, BOX.h / h);
}

const problems = [];
let checked = 0;
let smallest = { px: Infinity };

for (const config of mod.configs) {
  const levels = config.levels.flatMap((slot) => (Array.isArray(slot) ? slot : [slot]));
  for (const level of levels) {
    if ((level.template ?? config.template) !== 'tap-picture') continue;
    checked += 1;
    const where = `${config.id} ${level.id}: "${level.narration}"`;
    const { parts, answer } = level.data;

    if (!parts.includes(answer)) problems.push(`${where}\n    jawaban "${answer}" tidak ada di parts`);
    if (new Set(parts).size !== parts.length) problems.push(`${where}\n    ada bagian yang ditulis dua kali`);
    if (parts.length < 2 || parts.length > 4) {
      problems.push(`${where}\n    ${parts.length} bagian aktif — pakai 2 sampai 4`);
    }
    for (const part of parts) {
      if (!BODY_PARTS[part]) problems.push(`${where}\n    bagian tak dikenal: "${part}"`);
    }
    if (level.narration.length > MAX_NARRATION) {
      problems.push(
        `${where}\n    kalimatnya ${level.narration.length} karakter (maks ${MAX_NARRATION}) — ` +
          'baris keempat memakan tinggi gambar',
      );
    }
    if (problems.length) continue;

    // Titik sentuh & bingkainya dihitung engine, bukan config — lihat Kid.tsx.
    const spots = kidSpots(parts);
    const frame = kidFrame(spots);
    const px = Math.min(...spots.map((s) => s.r)) * 2 * scaleOf(frame);
    if (px < smallest.px) smallest = { px, where, frame };
    if (px < MIN_TOUCH) {
      problems.push(
        `${where}\n    daerah sentuh terkecil ${px.toFixed(0)} px (min ${MIN_TOUCH}) — ` +
          'ada dua bagian yang terlalu berdempetan, ganti pengecohnya',
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} masalah di level "sentuh gambar":\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  `${checked} level "sentuh gambar" diperiksa. Daerah sentuh terkecil di HP 320 px: ` +
    `${smallest.px.toFixed(0)} px (bingkai ${smallest.frame}) — ${smallest.where}`,
);
