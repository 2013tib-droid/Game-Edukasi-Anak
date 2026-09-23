/**
 * Membatalkan (menghanguskan) satu batch kode aktivasi.
 *
 * Dipakai kalau sebuah batch bocor — misalnya pernah tercetak di log
 * GitHub Actions, yang di repo PUBLIK bisa dibaca siapa saja tanpa login.
 * Kode yang sudah bocor harus dianggap terjual ke publik: satu-satunya
 * obatnya menghanguskannya sebelum ada yang menukarnya.
 *
 *   cd functions && npm ci
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'    # PowerShell
 *   node scripts/revoke-codes.mjs --batch=launching-2026-09 --dry-run
 *   node scripts/revoke-codes.mjs --batch=launching-2026-09
 *
 * Langkah lengkapnya untuk Windows: docs/cetak-kode-di-pc.md
 *
 * Pilihan:
 *   --batch=<nama>   batch yang dibatalkan (wajib)
 *   --group=tk|sd1   batasi ke satu kelompok saja (opsional)
 *   --dry-run        cuma hitung, jangan ubah apa pun
 *
 * CARA KERJANYA: kode ditandai `used: true` + `revoked: true`, BUKAN
 * dihapus. Dokumen yang dihapus bisa dibuat ulang oleh generator dengan
 * kode acak yang sama persis (peluangnya kecil, tapi `batch.create()`
 * justru akan BERHASIL dan menghidupkan kembali kode yang bocor). Ditandai
 * terpakai, `redeemActivationCode` menolaknya selamanya.
 *
 * Kode yang SUDAH ditukar pembeli tidak disentuh — kepemilikan kelompok
 * yang sudah dibayar tidak boleh ikut hangus.
 *
 * SAMA SEPERTI GENERATOR: jangan pernah mencetak kodenya ke layar.
 */
import { cert, initializeApp, applicationDefault } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

function arg(name, fallback = undefined) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return process.argv.includes(`--${name}`) ? true : fallback;
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const batch = arg('batch');
const group = arg('group');
const dryRun = arg('dry-run') === true;

if (typeof batch !== 'string' || !batch) fail('--batch=<nama> wajib diisi');
if (group !== undefined && !['tk', 'sd1'].includes(group)) {
  fail('--group harus tk atau sd1');
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
initializeApp(raw ? { credential: cert(JSON.parse(raw)) } : { credential: applicationDefault() });
const db = getFirestore();

let query = db.collection('activation_codes').where('batch', '==', batch);
if (group) query = query.where('group', '==', group);

const snap = await query.get();
if (snap.empty) fail(`Tidak ada kode dengan batch "${batch}"${group ? ` di kelompok ${group}` : ''}.`);

const sudahDipakai = snap.docs.filter((d) => d.get('used') === true && !d.get('revoked'));
const sasaran = snap.docs.filter((d) => d.get('used') !== true);

console.log(`\nBatch "${batch}"${group ? ` (kelompok ${group})` : ''}:`);
console.log(`  ${snap.size} kode ditemukan`);
console.log(`  ${sudahDipakai.length} sudah ditukar pembeli — TIDAK disentuh`);
console.log(`  ${sasaran.length} masih bisa dipakai — inilah yang dibatalkan`);

if (dryRun) {
  console.log('\n(dry run: tidak ada yang diubah)\n');
  process.exit(0);
}
if (sasaran.length === 0) {
  console.log('\nTidak ada yang perlu dibatalkan.\n');
  process.exit(0);
}

let done = 0;
for (let i = 0; i < sasaran.length; i += 200) {
  const writer = db.batch();
  for (const doc of sasaran.slice(i, i + 200)) {
    writer.update(doc.ref, {
      used: true,
      revoked: true,
      revokedAt: FieldValue.serverTimestamp(),
      revokedReason: 'bocor di log Actions repo publik',
    });
  }
  await writer.commit();
  done += Math.min(200, sasaran.length - i);
}

console.log(`\n✓ ${done} kode dibatalkan — tidak bisa ditukar lagi.\n`);
