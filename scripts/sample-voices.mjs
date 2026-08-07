/**
 * Render a few sample sentences in several voice settings, so the owner can
 * listen and pick before committing 700+ lines to one setting.
 *
 *     node scripts/sample-voices.mjs
 *
 * Output: `sample-suara/<varian>-<n>.mp3` — sengaja DI LUAR
 * `public/assets/voice/`, supaya contoh coba-coba tidak pernah ikut ter-deploy
 * dan tidak tercampur dengan file narasi sungguhan. Hapus foldernya setelah
 * setelan suaranya diputuskan.
 *
 * Ia juga mencetak SEMUA suara Indonesia yang ditawarkan Azure — daftar itu
 * bisa bertambah sewaktu-waktu, jadi lebih baik ditanyakan daripada ditebak.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT_DIR = 'sample-suara';

/** Kalimat uji: satu pendek (soal) dan satu panjang (kalimat bertingkat). */
const SENTENCES = [
  'Ayo hitung! Ada berapa kelinci?',
  'Ada 5 kelinci. Satu kelinci pulang ke rumah. Berapa yang masih tinggal?',
];

/**
 * Setelan yang dibandingkan. "Cempreng" pada suara perempuan biasanya soal
 * NADA DASAR, bukan kecepatan — jadi yang digeser terutama `pitch`.
 * `sekarang` = setelan yang dipakai 62 file yang sudah dirender.
 */
const VARIANTS = [
  { name: 'sekarang', voice: 'id-ID-GadisNeural', rate: '-8%', pitch: '0%' },
  { name: 'lembut', voice: 'id-ID-GadisNeural', rate: '-8%', pitch: '-8%' },
  { name: 'lebih-lembut', voice: 'id-ID-GadisNeural', rate: '-10%', pitch: '-15%' },
  { name: 'hangat', voice: 'id-ID-GadisNeural', rate: '-12%', pitch: '-22%' },
];

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

/* ---------- Suara apa saja yang tersedia untuk Indonesia? ---------- */

const list = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
  headers: { 'Ocp-Apim-Subscription-Key': KEY },
});
if (list.ok) {
  const voices = await list.json();
  const indo = voices.filter((v) => v.Locale?.startsWith('id-'));
  console.log(`Suara Indonesia yang ditawarkan Azure (${indo.length}):`);
  for (const v of indo) console.log(`  ${v.ShortName}  ${v.Gender}  ${v.VoiceType}`);

  // Suara "multilingual" bisa membaca Indonesia juga — ikut dicoba sebagai
  // kandidat kalau ada, karena pilihan id-ID sendiri cuma dua.
  const multi = voices.filter((v) => v.ShortName?.includes('Multilingual') && v.Gender === 'Female');
  console.log(`\nKandidat multilingual perempuan: ${multi.length}`);
  for (const v of multi.slice(0, 3)) {
    console.log(`  ikut dicoba: ${v.ShortName}`);
    VARIANTS.push({ name: v.ShortName.split('-')[1].toLowerCase(), voice: v.ShortName, rate: '-8%', pitch: '0%' });
  }
} else {
  console.error(`Tidak bisa mengambil daftar suara (HTTP ${list.status}) — lanjut dengan varian bawaan.`);
}

/* ---------- Render ---------- */

mkdirSync(OUT_DIR, { recursive: true });
const esc = (t) => t.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

console.log('');
for (const v of VARIANTS) {
  for (const [i, text] of SENTENCES.entries()) {
    const ssml =
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="id-ID">` +
      `<voice name="${v.voice}"><prosody rate="${v.rate}" pitch="${v.pitch}">${esc(text)}</prosody></voice></speak>`;
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'petualangan-pintar',
      },
      body: ssml,
    });
    if (!res.ok) {
      console.error(`GAGAL ${v.name}-${i + 1}: HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(`${OUT_DIR}/${v.name}-${i + 1}.mp3`, buf);
    console.log(`${v.name}-${i + 1}.mp3  ${v.voice} rate=${v.rate} pitch=${v.pitch}  (${(buf.length / 1024).toFixed(0)} kB)`);
    // Tier gratis: 20 permintaan/menit.
    await new Promise((r) => setTimeout(r, 3100));
  }
}
console.log(`\nSelesai → ${OUT_DIR}/`);
