/**
 * Statistik game: game mana yang paling sering dimainkan.
 *
 * DIJALANKAN DI KOMPUTER SENDIRI, sama seperti generate-codes.mjs (lihat
 * docs/cetak-kode-di-pc.md untuk menyiapkan Node.js & kunci.json):
 *
 *   cd functions && npm ci
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'    # PowerShell
 *   node scripts/statistik-game.mjs                        # bulan ini
 *   node scripts/statistik-game.mjs --bulan=2026-10        # bulan tertentu
 *
 * Tiga tabel, semuanya ANGKA JUMLAH saja — skrip ini tidak pernah mencetak
 * email, uid, atau data per anak. Jangan diubah supaya mencetaknya: hasilnya
 * sering ditempel ke chat/WhatsApp, dan Kebijakan Privasi berjanji angka ini
 * "tidak pernah dilihat per akun".
 *
 *   1. GAME GRATIS (semua pengunjung, tanpa login) — dari `stats/YYYY-MM-DD`,
 *      peristiwa `main_<id>` / `tamat_<id>` (countFreePlay di
 *      src/portal/stats.ts). Hitungan = browser per hari, bukan orang unik
 *      sebulan: satu anak yang main 5 hari terhitung 5. Baru terisi sesudah
 *      backend & web yang memuat penghitung ini ter-deploy.
 *   2. AKUN YANG LOGIN — dari cadangan bintang `users/{uid}/progress/*`:
 *      berapa akun yang pernah memainkan tiap game (punya bintang), dan
 *      berapa HARI game itu ditamatkan bulan ini (bonus rajin
 *      `bonus-YYYY-MM`, level `DD_<gameId>`, tercatat sekali per game per
 *      hari per akun). Game yang dibuka tapi tak pernah dijawab satu level
 *      pun tidak terlihat di sini.
 *   3. Landing & penjualan bulan itu (angka lain di `stats/`), sebagai
 *      pembanding.
 *
 * Hanya MEMBACA Firestore. Tidak menulis apa pun.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldPath, getFirestore } from 'firebase-admin/firestore';

function arg(name, fallback = undefined) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const now = new Date();
const month =
  arg('bulan') ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
if (!/^\d{4}-\d{2}$/.test(month)) {
  console.error('Format --bulan harus YYYY-MM, mis. --bulan=2026-10');
  process.exit(2);
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

/** Cetak tabel rata kiri tanpa library. */
function table(title, head, rows) {
  console.log(`\n=== ${title} ===`);
  if (rows.length === 0) {
    console.log('(belum ada data)');
    return;
  }
  const all = [head, ...rows].map((r) => r.map(String));
  const w = head.map((_, i) => Math.max(...all.map((r) => r[i].length)));
  const line = (r) => r.map((c, i) => (i === 0 ? c.padEnd(w[i]) : c.padStart(w[i]))).join('   ');
  console.log(line(all[0]));
  console.log(w.map((n) => '-'.repeat(n)).join('   '));
  all.slice(1).forEach((r) => console.log(line(r)));
}

// --- 1 & 3. stats/YYYY-MM-DD bulan itu --------------------------------------
const statSnap = await db
  .collection('stats')
  .where(FieldPath.documentId(), '>=', `${month}-01`)
  .where(FieldPath.documentId(), '<=', `${month}-31`)
  .get();
const totals = {};
statSnap.forEach((d) => {
  for (const [k, v] of Object.entries(d.data())) {
    if (typeof v === 'number') totals[k] = (totals[k] ?? 0) + v;
  }
});

const freeIds = new Set();
for (const k of Object.keys(totals)) {
  const m = /^(main|tamat)_(.+)$/.exec(k);
  if (m) freeIds.add(m[2]);
}
const freeRows = [...freeIds]
  .map((id) => [id, totals[`main_${id}`] ?? 0, totals[`tamat_${id}`] ?? 0])
  .sort((a, b) => b[1] - a[1]);
table(
  `Game GRATIS ${month} (semua pengunjung; hitungan browser per hari)`,
  ['Game', 'Dibuka', 'Ditamatkan'],
  freeRows,
);

// --- 2. cadangan bintang akun -----------------------------------------------
const progSnap = await db.collectionGroup('progress').get();
const players = {}; // gameId -> Set(uid)
const daysDone = {}; // gameId -> jumlah (akun × hari) tamat bulan ini
const accounts = new Set();
const activeThisMonth = new Set();
progSnap.forEach((d) => {
  const uid = d.ref.parent.parent?.id;
  if (!uid) return;
  const levels = d.data().levels ?? {};
  if (d.id.startsWith('bonus-')) {
    if (d.id !== `bonus-${month}`) return;
    for (const key of Object.keys(levels)) {
      const gameId = key.slice(key.indexOf('_') + 1);
      daysDone[gameId] = (daysDone[gameId] ?? 0) + 1;
      activeThisMonth.add(uid);
    }
    return;
  }
  if (!Object.values(levels).some((v) => typeof v === 'number' && v > 0)) return;
  (players[d.id] ??= new Set()).add(uid);
  accounts.add(uid);
});

const gameIds = new Set([...Object.keys(players), ...Object.keys(daysDone)]);
const accRows = [...gameIds]
  .map((id) => [id, players[id]?.size ?? 0, daysDone[id] ?? 0])
  .sort((a, b) => b[2] - a[2] || b[1] - a[1]);
table(
  `Akun yang login (${accounts.size} akun pernah main; ${activeThisMonth.size} akun menamatkan game di ${month})`,
  ['Game', 'Akun pernah main', `Hari ditamatkan ${month}`],
  accRows,
);

// --- 3. pembanding ------------------------------------------------------------
const other = Object.entries(totals)
  .filter(([k]) => !/^(main|tamat)_/.test(k))
  .sort((a, b) => b[1] - a[1]);
table(`Landing & penjualan ${month}`, ['Peristiwa', 'Jumlah'], other);
console.log('');
