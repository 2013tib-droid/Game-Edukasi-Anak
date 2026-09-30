/**
 * Menyalin RIWAYAT transaksi lunas dari dasbor Mayar ke Firestore `orders`.
 *
 * Kenapa perlu: webhook `mayarWebhook` hanya menangkap pembayaran SESUDAH ia
 * terpasang. Pembayaran sebelum itu cuma ada di dasbor Mayar. Skrip ini
 * menarik semuanya lewat API Mayar (`GET /hl/v2/transactions`, endpoint yang
 * sama dengan `mayar tx list` di CLI resmi) supaya pembukuan lengkap di satu
 * tempat.
 *
 * YANG TIDAK DILAKUKAN — dan itu disengaja:
 *   - TIDAK membuat kode aktivasi dan TIDAK mengirim email. Pembeli lama sudah
 *     dilayani manual; kode baru untuk mereka = akses gratis kedua. Pesanan
 *     impor ditulis `code: null`, jadi juga TIDAK muncul di lonceng "Aktifkan
 *     sekarang" (`myPaidOrders` menyaring pesanan tanpa kode).
 *   - TIDAK PERNAH menimpa pesanan yang sudah ada (`create`, bukan `set`).
 *     Pesanan dari webhook memegang kode yang sudah terkirim; menimpanya
 *     menghapus jejak kode itu.
 *   - TIDAK menaikkan penghitung `stats/` — angka harian itu untuk corong
 *     hari ini, bukan untuk riwayat.
 *
 * JANGAN pakai "webhook retry" di dasbor/CLI Mayar untuk riwayat lama: itu
 * memanggil `mayarWebhook` sungguhan, yang MEMBUAT KODE BARU dan MENGIRIM
 * EMAIL ke tiap pembeli lama.
 *
 * DIJALANKAN DI KOMPUTER SENDIRI, bukan di GitHub Actions: hasilnya memuat
 * email pembeli, dan log Actions di repo publik bisa dibaca siapa saja.
 * (Host Mayar juga diblokir dari sesi Claude.) Langkahnya: docs/impor-mayar.md
 *
 *   cd functions && npm ci
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'   # PowerShell
 *   $env:MAYAR_API_KEY = '<API key dari web.mayar.id → Integration>'
 *   node scripts/import-mayar.mjs              # coba dulu: TIDAK menulis apa pun
 *   node scripts/import-mayar.mjs --write      # tulis ke Firestore
 *
 * Pilihan:
 *   --write              benar-benar menulis (bawaan: hanya membaca & melapor)
 *   --since=2026-09-01   hanya transaksi sejak tanggal ini (WIB)
 *   --until=2026-09-30   hanya transaksi sampai tanggal ini (WIB, inklusif)
 *   --sandbox            pakai api.mayar.club
 *
 * Aman dijalankan berulang: pesanan yang sudah ada dilewati.
 */
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';

const GROUPS = ['tk', 'sd1'];
const PAID = new Set(['SUCCESS', 'PAID', 'SETTLED', 'SETTLEMENT', 'COMPLETED']);
const PAGE_SIZE = 50; // batas atas API Mayar v2
const MAX_PAGES = 400; // rem kalau kursor API tak pernah habis

function arg(name, fallback = undefined) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return process.argv.includes(`--${name}`) ? true : fallback;
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/** Tanggal YYYY-MM-DD dibaca sebagai tengah malam WIB. */
function wibDay(value, name) {
  if (value === undefined) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`--${name} harus berbentuk YYYY-MM-DD`);
  }
  const ms = Date.parse(`${value}T00:00:00+07:00`);
  if (Number.isNaN(ms)) fail(`--${name} bukan tanggal yang sah`);
  return ms;
}

const write = arg('write') === true;
const since = wibDay(arg('since'), 'since');
const untilDay = wibDay(arg('until'), 'until');
const until = untilDay === null ? null : untilDay + 24 * 3600 * 1000; // inklusif
const apiKey = process.env.MAYAR_API_KEY?.trim();
const base =
  process.env.MAYAR_API_URL?.replace(/\/+$/, '') ||
  (arg('sandbox') === true ? 'https://api.mayar.club' : 'https://api.mayar.id');

if (!apiKey) fail('MAYAR_API_KEY belum diisi (web.mayar.id → Integration → API Key).');

/** Sama dengan pick() di functions/src/index.ts: kandidat nama field, boleh bertitik. */
function pick(data, keys) {
  for (const key of keys) {
    let cur = data;
    for (const part of key.split('.')) cur = cur && typeof cur === 'object' ? cur[part] : undefined;
    if (typeof cur === 'string' && cur.trim()) return cur;
    if (typeof cur === 'number' && Number.isFinite(cur)) return String(cur);
  }
  return '';
}

/**
 * HARUS sama dengan groupFromName() di functions/src/index.ts — kalau yang
 * satu diubah (mis. menambah `sd2`), ubah yang lain di commit yang sama.
 */
function groupFromName(productName) {
  const name = productName.toLowerCase();
  const isSd = /\bsd\b/.test(name);
  const isTk = /\btk\b|playgroup/.test(name);
  if (isTk && !isSd) return 'tk';
  if (isSd && !isTk) {
    const grades = name.match(/\b[1-6]\b/g) ?? [];
    const early = grades.some((g) => g === '1' || g === '2');
    const later = grades.some((g) => Number(g) >= 3);
    if (early && !later) return 'sd1';
  }
  return null;
}

function isEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && value.length <= 200;
}

/** createdAt Mayar bisa angka milidetik atau teks tanggal. */
function toMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value < 1e12 ? value * 1000 : value;
  if (typeof value === 'string' && value.trim()) {
    if (/^\d+$/.test(value)) return toMillis(Number(value));
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

// --- 1. Tarik semua transaksi lunas dari Mayar ------------------------------

async function fetchPage(after) {
  const url = new URL(`${base}/hl/v2/transactions`);
  url.searchParams.set('limit', String(PAGE_SIZE));
  if (after) url.searchParams.set('startingAfter', after);
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (res.ok) return res.json();
    // Kunci salah tidak akan membaik dengan diulang.
    if (res.status === 401 || res.status === 403) {
      fail(`API Mayar menolak kuncinya (${res.status}). Periksa MAYAR_API_KEY & --sandbox.`);
    }
    if (attempt >= 4 || (res.status !== 429 && res.status < 500)) {
      const text = (await res.text()).slice(0, 300);
      fail(`API Mayar menjawab ${res.status}: ${text}`);
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

const transactions = [];
let cursor;
const seenCursors = new Set();
for (let page = 0; ; page++) {
  if (page >= MAX_PAGES) fail(`Lebih dari ${MAX_PAGES} halaman — berhenti supaya tidak berputar tanpa akhir.`);
  const body = await fetchPage(cursor);
  const data = Array.isArray(body?.data) ? body.data : [];
  transactions.push(...data);
  process.stdout.write(`\r  mengambil dari Mayar… ${transactions.length} transaksi`);
  const next = body?.nextStartingAfter;
  if (!data.length || !next || body?.hasMore === false) break;
  if (seenCursors.has(next)) break;
  seenCursors.add(next);
  cursor = next;
}
console.log('');

// --- 2. Ubah ke bentuk `orders` ---------------------------------------------

const summary = {
  fetched: transactions.length,
  outOfRange: 0,
  notPaid: {},
  noId: 0,
  byGroup: {},
  unknownProduct: [],
};

let productMap = {};
let db = null;
// Firestore dibuka juga saat uji coba kalau kuncinya ada: supaya pemetaan
// config/mayar_products dan hitungan "sudah ada" sama dengan saat --write.
const haveCreds = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (write || haveCreds) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  initializeApp(raw ? { credential: cert(JSON.parse(raw)) } : { credential: applicationDefault() });
  db = getFirestore();
  productMap = (await db.doc('config/mayar_products').get()).data() ?? {};
}

const orders = [];
for (const tx of transactions) {
  const orderId = pick(tx, ['id', 'transactionId', 'transaction_id'])
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 100);
  if (!orderId) {
    summary.noId++;
    continue;
  }
  const paidMs = toMillis(tx.createdAt ?? tx.updatedAt ?? tx.paidAt);
  if ((since !== null || until !== null) && paidMs === null) {
    summary.outOfRange++;
    continue;
  }
  if ((since !== null && paidMs < since) || (until !== null && paidMs >= until)) {
    summary.outOfRange++;
    continue;
  }
  const status = pick(tx, ['status']).toUpperCase();
  if (status && !PAID.has(status)) {
    summary.notPaid[status] = (summary.notPaid[status] ?? 0) + 1;
    continue;
  }

  const email = pick(tx, ['customer.email', 'customerEmail', 'email']).trim().toLowerCase();
  const name = pick(tx, ['customer.name', 'customerName', 'name'])
    .replace(/[\u0000-\u001f<>]/g, '')
    .trim()
    .slice(0, 80);
  const productId = pick(tx, ['paymentLink.id', 'productId', 'product.id', 'paymentLinkId']).slice(0, 100);
  const productName = pick(tx, ['paymentLink.name', 'productName', 'product.name', 'paymentLinkName']).slice(0, 200);
  const amount = Number(pick(tx, ['credit', 'amount', 'totalAmount'])) || 0;

  const mapped = productId ? productMap[productId] : undefined;
  const group = GROUPS.includes(mapped) ? mapped : groupFromName(productName);
  if (!group) summary.unknownProduct.push(orderId);
  const key = group ?? 'tidak-dikenal';
  const g = (summary.byGroup[key] ??= { count: 0, amount: 0 });
  g.count++;
  g.amount += amount;

  orders.push({
    orderId,
    doc: {
      email: isEmail(email) ? email : '',
      name,
      productId,
      productName,
      amount,
      group,
      source: 'mayar-impor',
      code: null,
      problem: group ? 'impor-riwayat' : 'produk-tidak-dikenal',
      paidAt: paidMs === null ? null : Timestamp.fromMillis(paidMs),
    },
    paidMs,
  });
}

// --- 3. Tulis (hanya dengan --write) ----------------------------------------

let created = 0;
let existed = 0;
let failed = 0;
let fixed = 0;
if (!write && db) {
  for (let i = 0; i < orders.length; i += 100) {
    const refs = orders.slice(i, i + 100).map((o) => db.doc(`orders/${o.orderId}`));
    const snaps = await db.getAll(...refs);
    existed += snaps.filter((s) => s.exists).length;
  }
}
if (write) {
  for (const { orderId, doc, paidMs } of orders) {
    try {
      await db.doc(`orders/${orderId}`).create({
        ...doc,
        createdAt: paidMs === null ? FieldValue.serverTimestamp() : doc.paidAt,
        importedAt: FieldValue.serverTimestamp(),
      });
      created++;
    } catch (e) {
      // 6 = ALREADY_EXISTS: sudah dicatat webhook atau impor sebelumnya.
      if (e?.code === 6) {
        existed++;
        // Satu-satunya yang boleh diperbarui: hasil impor SENDIRI yang dulu
        // produknya belum dikenal, sekarang sudah dipetakan. Catatan webhook
        // (`source: 'mayar'`) tidak pernah disentuh.
        const ref = db.doc(`orders/${orderId}`);
        const old = (await ref.get()).data() ?? {};
        if (old.source === 'mayar-impor' && !old.group && doc.group) {
          await ref.update({ group: doc.group, problem: 'impor-riwayat' });
          fixed++;
        }
      } else {
        failed++;
        console.error(`  ! ${orderId}: ${e.message}`);
      }
    }
  }
}

// --- 4. Laporan: ANGKA saja, tanpa email/nama pembeli ------------------------

const rupiah = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
console.log(`\nDiambil dari Mayar    : ${summary.fetched} transaksi`);
if (summary.outOfRange) console.log(`Di luar rentang tanggal: ${summary.outOfRange}`);
for (const [s, n] of Object.entries(summary.notPaid)) console.log(`Dilewati, status ${s}: ${n}`);
if (summary.noId) console.log(`Dilewati, tanpa id    : ${summary.noId}`);
console.log(`Pesanan lunas         : ${orders.length}`);
for (const [g, v] of Object.entries(summary.byGroup)) {
  console.log(`  ${g.padEnd(14)} ${String(v.count).padStart(4)} pesanan · ${rupiah(v.amount)}`);
}
if (summary.unknownProduct.length) {
  console.log(
    `\n${summary.unknownProduct.length} pesanan produknya tidak dikenal (id transaksi Mayar):\n  ` +
      summary.unknownProduct.slice(0, 30).join('\n  ') +
      (summary.unknownProduct.length > 30 ? `\n  … dan ${summary.unknownProduct.length - 30} lagi` : '') +
      '\nPetakan id produknya di Firestore config/mayar_products, lalu jalankan ulang.',
  );
}
if (!write) {
  if (db) console.log(`\nSudah ada di Firestore : ${existed} · akan dicatat baru: ${orders.length - existed}`);
  else console.log('\n(Tanpa kunci Firebase: pemetaan config/mayar_products & cek "sudah ada" dilewati.)');
  console.log('\nBELUM ADA YANG DITULIS. Tambahkan --write untuk menyimpannya ke Firestore.\n');
} else {
  console.log(`\n✓ ${created} pesanan baru dicatat · ${existed} sudah ada (dilewati)` + (fixed ? ` · ${fixed} diberi kelompok` : '') + (failed ? ` · ${failed} gagal` : ''));
  console.log('Kode aktivasi TIDAK dibuat dan email TIDAK dikirim.\n');
  if (failed) process.exit(1);
}
