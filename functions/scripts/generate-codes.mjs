/**
 * Membuat batch kode aktivasi di Firestore.
 *
 * Tiap kode = satu penjualan. Kode dikirim ke pembeli oleh Lynk.id / Mayar.id
 * sebagai "produk digital", lalu ditukar di halaman /aktivasi.
 *
 * Dijalankan lewat GitHub Actions (tab Actions → "Buat kode aktivasi"), jadi
 * pemilik tidak perlu memasang Node.js. Bisa juga lokal:
 *
 *   cd functions && npm ci
 *   GOOGLE_APPLICATION_CREDENTIALS=kunci.json \
 *     node scripts/generate-codes.mjs --group=tk --count=50
 *
 * Pilihan:
 *   --group=tk|sd1   kelompok yang dibuka kode ini (wajib)
 *   --count=50       berapa kode dibuat (wajib, maksimal 500 sekali jalan)
 *   --prefix=TK      awalan yang terlihat (bawaan: huruf besar dari group)
 *   --batch=juli     penanda batch, untuk pembukuan
 *   --out=kode.csv   simpan CSV ke file
 *   --dry-run        cetak contoh kode TANPA menulis ke Firestore
 */
import { randomInt } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { cert, initializeApp, applicationDefault } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const GROUPS = ['tk', 'sd1'];

/**
 * Huruf & angka yang tidak bisa tertukar saat orang tua menyalin dari WhatsApp:
 * TANPA I, L, O, 0, 1. Jangan tambahkan lagi — tiap karakter ambigu berubah
 * jadi tiket "kode saya tidak bisa" di WhatsApp pemilik.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const BLOCK = 4;
const BLOCKS = 2;

function arg(name, fallback = undefined) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return process.argv.includes(`--${name}`) ? true : fallback;
}

function randomBlock() {
  let out = '';
  for (let i = 0; i < BLOCK; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Bentuk tampilan: TK-ABCD-2345. Id dokumennya versi tanpa tanda hubung. */
function makeCode(prefix) {
  const blocks = Array.from({ length: BLOCKS }, randomBlock);
  return `${prefix}-${blocks.join('-')}`;
}

/** HARUS sama persis dengan normalizeCode() di functions/src/index.ts. */
function normalize(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const group = arg('group');
const count = Number(arg('count'));
const dryRun = arg('dry-run') === true;
const batch = arg('batch', new Date().toISOString().slice(0, 10));
const prefix = String(arg('prefix', group === 'sd1' ? 'SD' : 'TK')).toUpperCase();
const out = arg('out');

if (!GROUPS.includes(group)) fail(`--group harus salah satu dari: ${GROUPS.join(', ')}`);
if (!Number.isInteger(count) || count < 1 || count > 500) {
  fail('--count harus bilangan bulat 1–500');
}
if (!/^[A-Z]{1,6}$/.test(prefix)) fail('--prefix hanya huruf A–Z, maksimal 6');

// --- Buat kode unik ---------------------------------------------------------

const codes = new Map(); // id dokumen -> bentuk tampilan
let guard = 0;
while (codes.size < count) {
  const display = makeCode(prefix);
  codes.set(normalize(display), display);
  if (++guard > count * 50) fail('Gagal membuat kode unik — coba prefix lain.');
}

const rows = [...codes.entries()].map(([id, display]) => ({ id, display }));

if (dryRun) {
  console.log(`\nContoh ${rows.length} kode untuk kelompok "${group}" (TIDAK ditulis):\n`);
  rows.slice(0, 10).forEach((r) => console.log('  ' + r.display));
  if (rows.length > 10) console.log(`  … dan ${rows.length - 10} lagi`);
  console.log('\nJalankan tanpa --dry-run untuk menyimpannya ke Firestore.\n');
  process.exit(0);
}

// --- Tulis ke Firestore -----------------------------------------------------

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
initializeApp(raw ? { credential: cert(JSON.parse(raw)) } : { credential: applicationDefault() });
const db = getFirestore();

let written = 0;
let collisions = 0;

// Ditulis per potongan supaya batch Firestore (batas 500 operasi) tidak jebol.
for (let i = 0; i < rows.length; i += 200) {
  const chunk = rows.slice(i, i + 200);
  const writer = db.batch();
  for (const row of chunk) {
    // `create` GAGAL kalau dokumennya sudah ada — inilah yang menjamin kode
    // lama tidak pernah tertimpa (menimpanya = menghidupkan lagi kode yang
    // sudah dipakai pembeli).
    writer.create(db.doc(`activation_codes/${row.id}`), {
      code: row.id,
      display: row.display,
      group,
      batch: String(batch),
      used: false,
      usedBy: null,
      usedAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  try {
    await writer.commit();
    written += chunk.length;
  } catch (e) {
    collisions += chunk.length;
    console.error(`  ! satu batch gagal ditulis: ${e.message}`);
  }
}

const csv = ['code,group,batch', ...rows.map((r) => `${r.display},${group},${batch}`)].join('\n');
if (typeof out === 'string') {
  writeFileSync(out, csv + '\n');
  console.log(`\nCSV disimpan ke ${out}`);
}

console.log(`\n✓ ${written} kode dibuat untuk kelompok "${group}" (batch: ${batch})`);
if (collisions) console.log(`  ${collisions} kode gagal ditulis — jalankan lagi untuk melengkapi.`);
console.log('\n--- CSV ---\n');
console.log(csv);
console.log(
  '\nSimpan file ini baik-baik: tiap baris setara satu penjualan, dan siapa pun\n' +
    'yang punya kodenya bisa memakainya.\n',
);
