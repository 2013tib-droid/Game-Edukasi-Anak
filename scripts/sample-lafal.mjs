/**
 * Render contoh LAFAL: kalimat yang sama diucapkan dengan ejaan sekarang vs
 * ejaan lafal (`scripts/pronounce.mjs`), supaya pemilik memilih dengan telinga
 * sebelum ratusan file suara dirender ulang.
 *
 *     node scripts/sample-lafal.mjs
 *
 * Output: `sample-suara/lafal-*.mp3` — sengaja DI LUAR `public/assets/voice/`,
 * jadi contoh coba-coba tidak pernah ikut ter-deploy. Hapus foldernya setelah
 * diputuskan.
 *
 * Tiga varian sengaja dirender sekaligus, supaya satu kali panggil Azure sudah
 * menjawab dua pertanyaan berbeda:
 *   1. `sebelum` vs `sesudah` — apakah ejaan é memperbaiki bunyinya?
 *   2. `ipa` — kalau é ternyata DIABAIKAN model HD, apakah tag <phoneme>
 *      dituruti? Itu rencana cadangannya, dan lebih baik diuji sekarang
 *      daripada satu putaran lagi nanti.
 *
 * Skrip ini juga membandingkan UKURAN file sebelum/sesudah: kalau dua file
 * berukuran persis sama, ejaannya diabaikan mentah-mentah — itu jawaban yang
 * bisa dibaca dari log, tanpa perlu mendengarkan.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { forSpeech } from './pronounce.mjs';

const OUT_DIR = 'sample-suara';

/** Setelan suara narasi soal — sama persis dengan yang dipakai produksi. */
const VOICE = 'id-ID-Gadis:DragonHDLatestNeural';
const RATE = '-15%';
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

/**
 * Kalimat uji. Yang pertama persis kalimat yang dilaporkan pemilik; sisanya
 * kata-kata lain yang se-kelas (e taling) supaya sekali dengar bisa menilai
 * banyak kata.
 */
const SENTENCES = [
  'Ayo hitung! Ada berapa bebek?',
  'Ada delapan bebek. Tiga bebek pulang ke rumah. Berapa yang masih tinggal?',
  'Bel sekolah berbunyi pukul tujuh pagi. Jarum pendek di angka dua.',
  'Rani punya enam kelereng. Ada zebra, sepeda, wortel, dan pensil.',
];

/**
 * Lafal IPA untuk rencana cadangan. Hanya kata yang dipakai kalimat di atas —
 * ini uji coba mekanisme, bukan kamus.
 */
const IPA = {
  bebek: 'bɛbɛk',
  bel: 'bɛl',
  pendek: 'pɛndɛk',
  kelereng: 'kəlɛrɛŋ',
  zebra: 'zɛbra',
  sepeda: 'səpɛda',
  wortel: 'wortɛl',
  pensil: 'pɛnsil',
};
const IPA_RE = new RegExp(`\\b(${Object.keys(IPA).join('|')})\\b`, 'gi');
const withPhonemes = (text) =>
  text.replace(
    IPA_RE,
    (m) => `<phoneme alphabet="ipa" ph="${IPA[m.toLowerCase()]}">${m}</phoneme>`,
  );

const escape = (t) => t.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** `inner` sudah berupa SSML siap pakai (boleh memuat tag). */
const ssml = (inner) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="id-ID">` +
  `<voice name="${VOICE}"><prosody rate="${RATE}">${inner}</prosody></voice></speak>`;

const VARIANTS = [
  { name: 'sebelum', build: (t) => escape(t) },
  { name: 'sesudah', build: (t) => escape(forSpeech(t)) },
  { name: 'ipa', build: (t) => withPhonemes(escape(t)) },
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
  console.log(`  diucapkan  : ${forSpeech(sentence)}`);
  for (const variant of VARIANTS) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'petualangan-pintar',
      },
      body: ssml(variant.build(sentence)),
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
  const before = sizes.get(`${i}-sebelum`);
  for (const name of ['sesudah', 'ipa']) {
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
