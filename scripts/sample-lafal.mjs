/**
 * Render contoh LAFAL "e": kalimat yang sama dalam beberapa varian, supaya
 * pemilik memilih dengan telinga sebelum ratusan file suara dirender ulang.
 *
 *     node scripts/sample-lafal.mjs          # render contoh (butuh kunci Azure)
 *     node scripts/sample-lafal.mjs --cek    # daftar kata yang dianggap PEPET
 *
 * Output: `sample-suara/lafal-*.mp3` — sengaja DI LUAR `public/assets/voice/`,
 * jadi contoh coba-coba tidak pernah ikut ter-deploy. Hapus foldernya setelah
 * diputuskan (SESUDAH merge — lihat CLAUDE.md, folder ini bisa hidup lagi).
 *
 * Putaran 2026-10-01 (laporan pemilik: "masih terasa seperti bule, terutama
 * di kata e, sering terbolak-balik"). Tiga varian per kalimat:
 *   1. `sekarang` — persis render produksi hari ini (Gadis HD + daftar lafal
 *      tambalan di pronounce.mjs).
 *   2. `kamus`    — Gadis HD, tapi SETIAP kata ber-e diberi lafal IPA dari
 *      kamus penuh (`kamusSsml`). Menjawab: apakah menghapus tebakan Azure
 *      membereskan "e"-nya?
 *   3. `neural`   — kamus yang sama dengan suara Gadis NEURAL biasa (bukan HD).
 *      Menjawab: kalau "bule"-nya ternyata dari model HD sendiri (model HD itu
 *      multibahasa), apakah suara non-HD lebih Indonesia? Gadis neural dulu
 *      ditolak karena "cempreng" — dengarkan lagi dengan pertanyaan yang beda.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAllPepet, kamusSsml, speechSsml } from './pronounce.mjs';

const OUT_DIR = 'sample-suara';
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

/* ---------- --cek: kata ber-e yang dianggap pepet ---------- */

if (process.argv.includes('--cek')) {
  const { lines } = JSON.parse(readFileSync('scripts/narration-lines.json', 'utf8'));
  const words = new Set();
  for (const l of lines) for (const m of l.text.matchAll(/[A-Za-z]*[eE][A-Za-z]*/g)) words.add(m[0].toLowerCase());
  const pepet = [...words].filter(isAllPepet).sort();
  console.log(`${pepet.length} kata ber-e dianggap PEPET seluruhnya.`);
  console.log('Kalau ada yang ber-e taling, tambahkan ke KAMUS_TALING di scripts/pronounce.mjs:\n');
  console.log(pepet.join(' '));
  process.exit(0);
}

/**
 * Kalimat uji. Dua yang pertama persis tangkapan layar pemilik (Kebun Ilmu);
 * sisanya mencakup "sentuh" (tag IPA yang belum pernah dikonfirmasi telinga),
 * campuran taling+pepet, nama huruf E, dan kalimat game baru.
 */
const SENTENCES = [
  'Menendang bola. Gaya apa itu?',
  'Hujan turun deras. Apa yang kita bawa?',
  'Sentuh lehermu!',
  'Ada delapan bebek merah. Berapa semuanya?',
  'Ini huruf besar E. Mana huruf kecilnya?',
  'Pembeli sudah membayar. Beri kembaliannya!',
];

const ssml = (voice, rate, inner) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="id-ID">` +
  `<voice name="${voice}"><prosody rate="${rate}">${inner}</prosody></voice></speak>`;

const HD = 'id-ID-Gadis:DragonHDLatestNeural';
const VARIANTS = [
  { name: 'sekarang', build: (t) => ssml(HD, '-15%', speechSsml(t)) },
  { name: 'kamus', build: (t) => ssml(HD, '-15%', kamusSsml(t)) },
  { name: 'neural', build: (t) => ssml('id-ID-GadisNeural', '-8%', kamusSsml(t)) },
];

/* ---------- Kunci ---------- */

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const KEY = process.env.AZURE_SPEECH_KEY ?? '';
const REGION = process.env.AZURE_SPEECH_REGION ?? 'southeastasia';
if (!KEY) {
  console.error('AZURE_SPEECH_KEY belum diisi.');
  process.exit(1);
}

/* ---------- Render ---------- */

mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sizes = new Map();

for (const [i, sentence] of SENTENCES.entries()) {
  console.log(`\nKalimat ${i + 1}: ${sentence}`);
  console.log(`  kamus      : ${kamusSsml(sentence)}`);
  for (const variant of VARIANTS) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'petualangan-pintar',
      },
      body: variant.build(sentence),
    });
    if (!res.ok) {
      console.error(`  ✗ ${variant.name}: HTTP ${res.status} — ${(await res.text()).slice(0, 160)}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const file = `${OUT_DIR}/lafal-${i + 1}-${variant.name}.mp3`;
    writeFileSync(file, buf);
    sizes.set(`${i}-${variant.name}`, buf.length);
    console.log(`  ✓ ${file}  (${(buf.length / 1024).toFixed(1)} kB)`);
    await sleep(3500); // 20 permintaan/menit = batas tier gratis
  }
}

/* ---------- Apakah ejaannya berpengaruh sama sekali? ---------- */

console.log('\nPerbandingan ukuran (file yang identik = ejaannya diabaikan):');
for (const [i] of SENTENCES.entries()) {
  const before = sizes.get(`${i}-sekarang`);
  for (const name of ['kamus']) {
    const after = sizes.get(`${i}-${name}`);
    if (!before || !after) continue;
    const diff = after - before;
    console.log(
      `  kalimat ${i + 1} ${name.padEnd(8)}: ${before} → ${after} byte ` +
        `(${diff === 0 ? 'SAMA — kemungkinan diabaikan' : `beda ${diff > 0 ? '+' : ''}${diff}`})`,
    );
  }
}
console.log('\nDengarkan file di sample-suara/, lalu pilih varian yang benar.');
