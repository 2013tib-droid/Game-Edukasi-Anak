/**
 * Mengekspor angka penjualan dari Firestore ke satu file JSON untuk dibuka di
 * halaman "Dasbor Penjualan" (artifact Claude). Langkahnya: docs/impor-mayar.md
 *
 *   cd functions
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'   # PowerShell
 *   node scripts/export-dashboard.mjs                    # → dasbor.json
 *
 * ISINYA SENGAJA TANPA DATA PRIBADI: tidak ada email, nama, maupun kode
 * aktivasi — cuma tanggal, kelompok, nominal, sumber, dan status tiap
 * pesanan, plus penghitung harian `stats/`. File ini boleh dibuka di halaman
 * dasbor tanpa membocorkan pembeli; tetap jangan di-commit (sudah di
 * .gitignore), karena omzet itu urusan dapur.
 *
 * Pilihan:
 *   --out=dasbor.json   nama file hasil (bawaan: dasbor.json)
 */
import { writeFileSync } from 'node:fs';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const out = arg('out', 'dasbor.json');
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
initializeApp(raw ? { credential: cert(JSON.parse(raw)) } : { credential: applicationDefault() });
const db = getFirestore();

const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null);

const [ordersSnap, statsSnap] = await Promise.all([
  db.collection('orders').get(),
  db.collection('stats').get(),
]);

// Status "sudah diaktifkan" dibaca dari kode aktivasinya sendiri: pembeli
// bisa menukar lewat kode di email ATAU lewat tombol di situs (claimedBy).
const codeIds = ordersSnap.docs
  .map((d) => d.data().code)
  .filter((c) => typeof c === 'string')
  .map((c) => c.replace(/-/g, ''));
const usedCodes = new Set();
for (let i = 0; i < codeIds.length; i += 100) {
  const refs = codeIds.slice(i, i + 100).map((id) => db.doc(`activation_codes/${id}`));
  const snaps = await db.getAll(...refs);
  snaps.forEach((s) => {
    if (s.exists && s.data().used === true) usedCodes.add(s.id);
  });
}

const orders = ordersSnap.docs.map((d) => {
  const o = d.data();
  const code = typeof o.code === 'string' ? o.code.replace(/-/g, '') : null;
  let status;
  if (o.problem && o.problem !== 'impor-riwayat') status = 'masalah';
  else if (o.source === 'mayar-impor') status = 'riwayat';
  else if (code && usedCodes.has(code)) status = 'aktif';
  else if (o.emailedAt) status = 'terkirim';
  else status = 'belum-terkirim';
  return {
    id: d.id,
    paidAt: ms(o.paidAt) ?? ms(o.createdAt),
    group: o.group ?? null,
    amount: Number(o.amount) || 0,
    source: o.source ?? 'mayar',
    status,
    problem: o.problem ?? null,
  };
});

const stats = statsSnap.docs
  .map((d) => {
    const { updatedAt, ...counts } = d.data();
    const clean = {};
    for (const [k, v] of Object.entries(counts)) if (typeof v === 'number') clean[k] = v;
    return { day: d.id, ...clean };
  })
  .sort((a, b) => a.day.localeCompare(b.day));

writeFileSync(
  out,
  JSON.stringify({ kind: 'petualangan-pintar-dasbor', exportedAt: Date.now(), orders, stats }) + '\n',
);
console.log(`\n✓ ${orders.length} pesanan & ${stats.length} hari statistik → ${out}`);
console.log('Buka halaman Dasbor Penjualan, lalu pilih file ini.\n');
