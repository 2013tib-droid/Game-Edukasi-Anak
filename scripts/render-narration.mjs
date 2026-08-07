/**
 * Render every narration line to an audio file with Azure Speech, then write
 * the manifest the app plays from.
 *
 *     npm run suara -- --dry-run          # lihat rencananya, tanpa memanggil Azure
 *     npm run suara -- --only=hutan-hewan # coba satu game dulu (dengarkan hasilnya!)
 *     npm run suara                       # render semua yang belum ada
 *     npm run suara -- --rpm=100          # kalau pakai tier bayar (S0), jauh lebih cepat
 *     npm run suara -- --prune            # buang file audio yang kalimatnya sudah dihapus
 *
 * Input: `scripts/narration-lines.json` (jalankan `npm run narasi` dulu).
 * Output: `public/assets/voice/<scope>/<key>.mp3` + `manifest.json`.
 *
 * Sudah ada file = DILEWATI. Jadi skrip ini aman diulang: kalau koneksi putus
 * di tengah jalan, jalankan lagi dan ia melanjutkan, tanpa memakan kuota untuk
 * kalimat yang sudah jadi. Mengubah kalimat di config akan mengubah `key`-nya,
 * jadi hanya kalimat itu yang dirender ulang.
 *
 * Kunci API dibaca dari environment atau file `.env` (JANGAN di-commit):
 *     AZURE_SPEECH_KEY=...
 *     AZURE_SPEECH_REGION=southeastasia
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LINES_FILE = 'scripts/narration-lines.json';
const OUT_DIR = 'public/assets/voice';

/**
 * Owner's decision (2026-08-07): storyteller voice for the interactive
 * stories, the neutral teacher voice for everything else. Which line gets
 * which is decided in `extract-narration.mjs`, not here.
 *
 * Every voice is slowed down — the app used to ask `speechSynthesis` for rate
 * 0.92 for the same reason: young children need a beat to follow. The amounts
 * differ because the two models have very different default speeds:
 *
 * - `gadis` uses the HD model (owner found the standard neural voice shrill).
 *   -15% is the owner's pick by ear from samples at 0/-15/-30/-45%; the HD
 *   model reads more briskly than the standard one, and this is the pace they
 *   chose for it. Don't "correct" it to match Ardi's number — the two models
 *   have different default speeds, so equal numbers are NOT equal tempo.
 * - `ardi` stays on the standard neural model, approved as-is at -8%.
 */
const VOICES = {
  gadis: { name: 'id-ID-Gadis:DragonHDLatestNeural', rate: '-15%' },
  ardi: { name: 'id-ID-ArdiNeural', rate: '-8%' },
};

/** 24 kHz / 48 kbps mono MP3: plays everywhere, ~6 kB per spoken second. */
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

/** Anything smaller than this is not real audio — treat it as a failure. */
const MIN_BYTES = 500;

/* ---------- Options ---------- */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const dryRun = has('dry-run');
const prune = has('prune');
const only = flag('only', '');
const limit = Number(flag('limit', '0'));
/**
 * Requests per minute. Azure's free F0 tier allows 20 neural requests per
 * minute and answers 429 above that — so the default paces itself instead of
 * hammering and backing off. On the paid S0 tier raise it with --rpm.
 */
const rpm = Number(flag('rpm', '20'));

/* ---------- Credentials ---------- */

// Read .env the same way Vite would, so the key can live in the file the
// project already gitignores instead of being pasted into a shell each time.
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const KEY = process.env.AZURE_SPEECH_KEY ?? '';
const REGION = process.env.AZURE_SPEECH_REGION ?? '';

if (!dryRun && (!KEY || !REGION)) {
  console.error(
    'AZURE_SPEECH_KEY / AZURE_SPEECH_REGION belum diisi.\n' +
      'Ambil dari portal.azure.com → resource Speech → "Keys and Endpoint",\n' +
      'lalu tulis di file .env (lihat .env.example). Coba dulu tanpa kunci: npm run suara -- --dry-run',
  );
  process.exit(1);
}

/* ---------- Work list ---------- */

const { lines } = JSON.parse(readFileSync(LINES_FILE, 'utf8'));
const selected = only ? lines.filter((l) => l.scope === only) : lines;
if (only && !selected.length) {
  console.error(`Tidak ada baris dengan scope "${only}". Lihat ${LINES_FILE}.`);
  process.exit(1);
}

const fileFor = (line) => `${line.scope}/${line.key}.mp3`;
const pending = selected.filter((l) => !existsSync(path.join(OUT_DIR, fileFor(l))));
const todo = limit ? pending.slice(0, limit) : pending;
const chars = todo.reduce((sum, l) => sum + l.text.length, 0);

console.log(
  `${selected.length} baris dipilih · ${selected.length - pending.length} sudah ada · ` +
    `${todo.length} akan dirender (${chars.toLocaleString('id-ID')} karakter)`,
);
if (todo.length) {
  const minutes = Math.ceil(todo.length / rpm);
  console.log(`Kecepatan ${rpm} permintaan/menit → perkiraan ±${minutes} menit.\n`);
}

/* ---------- Render ---------- */

function ssml(line) {
  const voice = VOICES[line.voice] ?? VOICES.gadis;
  const text = line.text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="id-ID">` +
    `<voice name="${voice.name}"><prosody rate="${voice.rate}">${text}</prosody></voice></speak>`
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One line → MP3 bytes. Retries on throttling and transient server errors. */
async function synthesize(line) {
  const url = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'petualangan-pintar',
      },
      body: ssml(line),
    });

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) throw new Error(`audio kosong (${buf.length} byte)`);
      return buf;
    }

    // 429 = kuota per menit terlampaui (wajar di tier gratis), 5xx = gangguan
    // sesaat. Sisanya (401 kunci salah, 400 SSML salah) tak akan membaik.
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${(await res.text()).slice(0, 200)}`);
    }
    const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** (attempt - 1);
    console.log(`   … ${res.status}, tunggu ${Math.round(wait / 1000)} detik (percobaan ${attempt}/5)`);
    await sleep(wait);
  }
  throw new Error('gagal setelah 5 percobaan');
}

const gap = Math.ceil(60_000 / rpm);
let done = 0;
const failures = [];

for (const line of todo) {
  const rel = fileFor(line);
  const label = `[${++done}/${todo.length}] ${line.voice} ${rel}  ${line.text.slice(0, 48)}${line.text.length > 48 ? '…' : ''}`;

  if (dryRun) {
    console.log(`DRY ${label}`);
    continue;
  }

  const started = Date.now();
  try {
    const buf = await synthesize(line);
    mkdirSync(path.join(OUT_DIR, line.scope), { recursive: true });
    writeFileSync(path.join(OUT_DIR, rel), buf);
    console.log(`${label}  (${(buf.length / 1024).toFixed(0)} kB)`);
  } catch (err) {
    failures.push({ line, err: String(err.message ?? err) });
    console.error(`GAGAL ${rel} — ${err.message ?? err}`);
  }
  // Pace the next request so the free tier's per-minute limit isn't hit at all.
  const rest = gap - (Date.now() - started);
  if (rest > 0 && done < todo.length) await sleep(rest);
}

/* ---------- Manifest ---------- */

// Built from what is actually ON DISK, never from what we meant to render: a
// manifest entry pointing at a missing file would make the app fetch a 404 and
// fall back to the phone voice — it still speaks, but the console goes noisy.
const manifest = {};
for (const line of lines) {
  if (existsSync(path.join(OUT_DIR, fileFor(line)))) manifest[line.text] = fileFor(line);
}

if (!dryRun) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(`${OUT_DIR}/manifest.json`, `${JSON.stringify(manifest, null, 1)}\n`);
}

/* ---------- Prune ---------- */

if (prune && !dryRun) {
  const wanted = new Set(lines.map(fileFor));
  for (const scope of readdirSync(OUT_DIR, { withFileTypes: true })) {
    if (!scope.isDirectory()) continue;
    for (const file of readdirSync(path.join(OUT_DIR, scope.name))) {
      const rel = `${scope.name}/${file}`;
      if (!wanted.has(rel)) {
        rmSync(path.join(OUT_DIR, rel));
        console.log(`dibuang: ${rel} (kalimatnya sudah tidak ada di config)`);
      }
    }
  }
}

/* ---------- Report ---------- */

console.log(
  `\n${Object.keys(manifest).length}/${lines.length} baris punya suara` +
    (dryRun ? ' (dry-run: manifest tidak ditulis)' : ` · manifest ditulis ke ${OUT_DIR}/manifest.json`),
);
if (failures.length) {
  console.error(`\n${failures.length} baris gagal — jalankan lagi untuk mencoba ulang yang gagal saja:`);
  for (const f of failures.slice(0, 10)) console.error(`  - ${f.line.text.slice(0, 60)} → ${f.err}`);
  process.exit(1);
}
