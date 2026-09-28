/**
 * Cloud Functions — Fase 5.
 *
 * Prinsip proyek ini: yang dijual adalah AKSES, bukan file. Semua keputusan
 * yang menentukan "boleh main atau tidak" harus dibuat DI SINI, karena apa pun
 * yang dijalankan di HP bisa diubah pemiliknya. Client hanya menampilkan
 * hasilnya.
 *
 * Tiga hal yang dijaga:
 *   1. Kode aktivasi hanya bisa dipakai SEKALI (transaksi Firestore).
 *   2. Field `users/{uid}.groups` hanya boleh ditulis dari sini — client
 *      dilarang oleh firestore.rules.
 *   3. Satu akun maksimal 3 perangkat, supaya satu pembelian tidak dibagikan
 *      ke satu grup WhatsApp.
 */
import { randomInt, timingSafeEqual } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import {
  HttpsError,
  onCall,
  onRequest,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { createTransport } from 'nodemailer';

initializeApp();
const db = getFirestore();

// Jakarta — paling dekat dengan pemain, jadi jeda panggilannya paling kecil.
// Client HARUS memakai region yang sama (lihat src/auth/firebase.ts).
setGlobalOptions({ region: 'asia-southeast2', maxInstances: 10 });

/** Kelompok yang dijual. Sengaja diulang di sini: functions itu deployable
 *  terpisah dan tidak boleh ikut mengimpor kode app. */
const GROUPS = ['tk', 'sd1'] as const;
type Group = (typeof GROUPS)[number];

/** Batas perangkat per akun (keputusan pemilik, lihat CLAUDE.md). */
const MAX_DEVICES = 3;

/** Rem percobaan kode: 10 kegagalan per jam per akun. */
const MAX_FAILED_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

// --- Alat bantu -------------------------------------------------------------

function requireUid(request: CallableRequest): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Silakan masuk ke akun dulu.');
  }
  return uid;
}

/**
 * Email yang sudah terverifikasi — SYARAT MENUKAR KODE saja.
 *
 * Kenapa di sini dan bukan di HP: klaim `email_verified` ikut di dalam ID
 * token yang ditandatangani Google, jadi ini satu-satunya tempat yang tidak
 * bisa dipalsukan. Pemeriksaan di halaman aktivasi cuma supaya orang tua
 * melihat penjelasannya lebih cepat.
 *
 * Kenapa cuma untuk aktivasi: akun dengan email salah ketik yang sudah
 * menukar kode jadi akses berbayar yang TIDAK BISA DIPULIHKAN — setel ulang
 * kata sandi mengirim ke alamat yang tidak ada, dan kodenya sudah hangus.
 * Ini memeriksanya tepat pada satu-satunya saat yang penting.
 *
 * JANGAN menambahkan pemeriksaan ini ke `registerDevice`/`removeDevice`:
 * keduanya berjalan di jalur ANAK SEDANG MAU MAIN, dan email verifikasi yang
 * mendarat di folder spam tidak boleh menghentikan permainan yang sudah
 * dibayar.
 */
function requireVerifiedEmail(request: CallableRequest): void {
  if (request.auth?.token.email_verified === true) return;
  throw new HttpsError(
    'failed-precondition',
    'Verifikasi dulu alamat emailnya ya. Kami sudah mengirim tautannya ke email Anda — '
      + 'periksa juga folder spam.',
  );
}

/**
 * Kode diketik orang tua di HP, jadi terima apa adanya: huruf kecil, spasi,
 * dan tanda hubung dibuang. "tk-abcd-2345" dan "TKABCD2345" adalah kode yang
 * sama. Bentuk tanpa pemisah inilah yang jadi id dokumen.
 */
function normalizeCode(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new HttpsError('invalid-argument', 'Kode aktivasi tidak terbaca.');
  }
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 6 || cleaned.length > 32) {
    throw new HttpsError('invalid-argument', 'Kode aktivasi tidak terbaca.');
  }
  return cleaned;
}

function isGroup(value: unknown): value is Group {
  return typeof value === 'string' && (GROUPS as readonly string[]).includes(value);
}

/** Id perangkat dibuat acak di HP; di sini cuma dipastikan bentuknya wajar. */
function normalizeDeviceId(raw: unknown): string {
  if (typeof raw !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(raw)) {
    throw new HttpsError('invalid-argument', 'Id perangkat tidak sah.');
  }
  return raw;
}

/** Label perangkat ditampilkan lagi ke orang tua — potong dan bersihkan. */
function normalizeLabel(raw: unknown): string {
  if (typeof raw !== 'string') return 'Perangkat';
  const cleaned = raw.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 60);
  return cleaned || 'Perangkat';
}

/**
 * Rem percobaan kode. Disimpan di koleksinya sendiri, BUKAN di dokumen user:
 * client boleh menulis dokumen user-nya sendiri (selain `groups`), jadi
 * hitungan yang ditaruh di sana bisa direset sendiri oleh penebak kode.
 * `redeem_attempts` tertutup total dari client di firestore.rules.
 */
async function assertNotRateLimited(uid: string): Promise<void> {
  const snap = await db.doc(`redeem_attempts/${uid}`).get();
  const data = snap.data();
  if (!data) return;
  const startedAt = data.windowStart as Timestamp | undefined;
  const failed = (data.failed as number | undefined) ?? 0;
  if (!startedAt) return;
  const fresh = Date.now() - startedAt.toMillis() < ATTEMPT_WINDOW_MS;
  if (fresh && failed >= MAX_FAILED_ATTEMPTS) {
    throw new HttpsError(
      'resource-exhausted',
      'Terlalu banyak percobaan kode. Coba lagi satu jam lagi ya.',
    );
  }
}

async function noteFailedAttempt(uid: string): Promise<void> {
  const ref = db.doc(`redeem_attempts/${uid}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const startedAt = data?.windowStart as Timestamp | undefined;
    const fresh = startedAt && Date.now() - startedAt.toMillis() < ATTEMPT_WINDOW_MS;
    tx.set(ref, {
      failed: fresh ? ((data?.failed as number) ?? 0) + 1 : 1,
      windowStart: fresh ? startedAt : FieldValue.serverTimestamp(),
      lastAttemptAt: FieldValue.serverTimestamp(),
    });
  });
}

// --- 1. Tukar kode aktivasi -------------------------------------------------

/**
 * Menukar kode aktivasi menjadi akses kelompok.
 *
 * Seluruh pemeriksaan ada di dalam SATU transaksi supaya dua HP yang menekan
 * "Aktifkan" pada detik yang sama tidak bisa memakai kode yang sama dua kali.
 */
export const redeemActivationCode = onCall(async (request) => {
  const uid = requireUid(request);
  // Diperiksa SEBELUM kodenya dibaca: kode yang sah tidak boleh ikut hangus
  // hanya karena emailnya belum diverifikasi.
  requireVerifiedEmail(request);
  const code = normalizeCode((request.data as { code?: unknown } | undefined)?.code);

  await assertNotRateLimited(uid);

  const codeRef = db.doc(`activation_codes/${code}`);
  const userRef = db.doc(`users/${uid}`);

  const result = await db.runTransaction(async (tx) => {
    const codeSnap = await tx.get(codeRef);

    if (!codeSnap.exists) {
      return { status: 'not-found' as const };
    }

    const data = codeSnap.data() ?? {};
    const group = data.group;

    if (!isGroup(group)) {
      // Kode rusak di database — jangan sampai kelihatan seperti salah ketik.
      return { status: 'broken' as const };
    }

    if (data.used === true) {
      // Kode yang SUDAH dipakai akun ini bukan kesalahan: orang tua menekan
      // dua kali, atau membuka lagi halaman aktivasi. Jawab seolah berhasil.
      if (data.usedBy === uid) {
        return { status: 'already-yours' as const, group };
      }
      return { status: 'used' as const };
    }

    tx.update(codeRef, {
      used: true,
      usedBy: uid,
      usedAt: FieldValue.serverTimestamp(),
    });

    // `set` + merge, bukan `update`: dokumen user belum tentu ada kalau
    // pendaftaran sempat terputus di tengah jalan.
    tx.set(
      userRef,
      {
        groups: FieldValue.arrayUnion(group),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { status: 'ok' as const, group };
  });

  if (result.status === 'not-found' || result.status === 'used') {
    await noteFailedAttempt(uid);
    // Pesan yang SAMA untuk "tidak ada" dan "sudah dipakai": kalau dibedakan,
    // penebak kode bisa memakai jawabannya untuk memetakan kode yang valid.
    throw new HttpsError(
      'not-found',
      'Kode tidak ditemukan atau sudah pernah dipakai. Coba periksa lagi ya.',
    );
  }

  if (result.status === 'broken') {
    throw new HttpsError(
      'internal',
      'Kode ini bermasalah. Hubungi penjual lewat WhatsApp ya.',
    );
  }

  // Berhasil — bersihkan hitungan percobaan.
  await db.doc(`redeem_attempts/${uid}`).delete().catch(() => undefined);

  // Hitung penukaran yang BERHASIL di sini, bukan dari HP: ini angka
  // "berapa yang benar-benar membeli", dan di sisi server ia gratis
  // (nol kode di client, nol permintaan tambahan) serta tak bisa dipalsukan.
  // Penukaran ulang oleh akun yang sama tidak dihitung dua kali.
  if (result.status === 'ok') {
    await bumpStat([`redeem_ok`, `redeem_ok_${result.group}`]).catch(() => undefined);
  }

  return { group: result.group, already: result.status === 'already-yours' };
});

// --- 2. Batas perangkat -----------------------------------------------------

interface DeviceInfo {
  id: string;
  label: string;
  lastSeenAt: number | null;
}

function toDeviceInfo(id: string, data: FirebaseFirestore.DocumentData): DeviceInfo {
  const seen = data.lastSeenAt as Timestamp | undefined;
  return {
    id,
    label: (data.label as string | undefined) ?? 'Perangkat',
    lastSeenAt: seen ? seen.toMillis() : null,
  };
}

/**
 * Mendaftarkan perangkat ini, atau menolak kalau kuotanya sudah penuh.
 *
 * Kalau penuh, daftar perangkatnya IKUT dikirim dalam error supaya orang tua
 * bisa langsung memilih mana yang dilepas — tanpa itu, ganti HP berarti
 * kehilangan akses yang sudah dibayar dan hanya bisa dipulihkan lewat japri.
 */
export const registerDevice = onCall(async (request) => {
  const uid = requireUid(request);
  const payload = request.data as { deviceId?: unknown; label?: unknown } | undefined;
  const deviceId = normalizeDeviceId(payload?.deviceId);
  const label = normalizeLabel(payload?.label);

  const devicesRef = db.collection(`users/${uid}/devices`);
  const deviceRef = devicesRef.doc(deviceId);

  // Transaksi ini hanya MELAPORKAN hasilnya; error dilempar sesudahnya.
  // Callback transaksi bisa dijalankan ulang kalau ada tabrakan, dan melempar
  // HttpsError dari dalamnya berisiko terbungkus jadi 'internal' — pesan yang
  // sudah disiapkan untuk orang tua akan hilang.
  const result = await db.runTransaction(async (tx) => {
    // Semua baca harus selesai sebelum tulis pertama (aturan transaksi).
    const existing = await tx.get(deviceRef);
    const all = await tx.get(devicesRef);

    if (existing.exists) {
      tx.update(deviceRef, { label, lastSeenAt: FieldValue.serverTimestamp() });
      return { status: 'ok' as const, deviceCount: all.size };
    }

    if (all.size >= MAX_DEVICES) {
      return {
        status: 'full' as const,
        devices: all.docs.map((d) => toDeviceInfo(d.id, d.data())),
      };
    }

    tx.set(deviceRef, {
      label,
      createdAt: FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp(),
    });
    return { status: 'ok' as const, deviceCount: all.size + 1 };
  });

  if (result.status === 'full') {
    throw new HttpsError(
      'resource-exhausted',
      `Akun ini sudah dipakai di ${MAX_DEVICES} perangkat. Lepas salah satu dulu ya.`,
      { devices: result.devices, max: MAX_DEVICES },
    );
  }

  return { ok: true, deviceCount: result.deviceCount, max: MAX_DEVICES };
});

/** Melepas satu perangkat supaya slotnya bisa dipakai HP baru. */
export const removeDevice = onCall(async (request) => {
  const uid = requireUid(request);
  const deviceId = normalizeDeviceId((request.data as { deviceId?: unknown } | undefined)?.deviceId);
  await db.doc(`users/${uid}/devices/${deviceId}`).delete();
  return { ok: true };
});


// --- 3. Penghitung seadanya (Fase 6 langkah 5) ------------------------------

/**
 * Analytics TANPA library apa pun (keputusan pemilik 2026-09-16).
 *
 * Kenapa bukan Firebase Analytics: SDK-nya ikut masuk bundle landing (halaman
 * yang paling perlu ringan), ia menaruh pengenal di browser pengunjung, dan
 * kebijakan privasi jadi harus menyebut Google sebagai penerima data. Yang
 * dibutuhkan pemilik cuma dua angka: berapa yang membuka landing dan berapa
 * yang menekan tombolnya.
 *
 * Bentuknya `onRequest`, BUKAN `onCall`: callable menuntut SDK Firebase di
 * client, dan itu justru yang mau dihindari. Dengan endpoint HTTP biasa,
 * client cukup memakai `navigator.sendBeacon` — nol library, nol cookie, nol
 * pengenal.
 *
 * Yang disimpan cuma ANGKA JUMLAH per hari (`stats/YYYY-MM-DD`). Tidak ada
 * id pengunjung, tidak ada IP yang kami tulis, tidak ada riwayat per orang —
 * jadi angkanya tidak bisa ditelusuri balik ke siapa pun. `stats` tertutup
 * total dari client di firestore.rules; hanya Admin SDK (dari sini) menulisnya.
 *
 * BATAS YANG DISADARI, jangan dikira lebih dari ini: endpoint-nya publik,
 * jadi siapa pun yang tahu URL-nya bisa menaikkan angkanya. Ini angka
 * PENUNJUK ARAH, bukan data penagihan — jangan pernah dipakai untuk
 * menghitung bagi hasil atau klaim ke pengiklan. Kalau suatu saat
 * disalahgunakan sampai memakan kuota, obatnya membuang function ini; tidak
 * ada bagian app yang bergantung padanya.
 */
const ALLOWED_EVENTS = new Set([
  'landing_view',
  'landing_main_click',
  'landing_parent_click',
  // Tombol "Beli" di kartu harga landing — pasangan corong mayar_paid_*.
  'landing_buy_tk',
  'landing_buy_sd1',
]);

/** Tanggal UTC sebagai `YYYY-MM-DD` — satu dokumen per hari. */
function statDay(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bumpStat(events: string[]): Promise<void> {
  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  events.forEach((e) => {
    patch[e] = FieldValue.increment(1);
  });
  await db.doc(`stats/${statDay()}`).set(patch, { merge: true });
}

export const catatStat = onRequest(
  { cors: true, maxInstances: 3 },
  async (req, res) => {
    // Cuma POST. GET dari crawler tidak boleh ikut menaikkan angka.
    if (req.method !== 'POST') {
      res.status(405).send('');
      return;
    }
    // `sendBeacon` mengirim badan sebagai teks biasa supaya tidak ada
    // preflight; terima juga bentuk JSON kalau nanti dipakai `fetch`.
    const raw =
      typeof req.body === 'string'
        ? req.body
        : ((req.body as { event?: unknown } | undefined)?.event ?? '');
    const event = String(raw).trim().slice(0, 40);

    if (!ALLOWED_EVENTS.has(event)) {
      // Nama yang tidak dikenal dibuang tanpa menulis apa pun — daftar
      // tertutup ini yang mencegah endpoint publik dipakai membuat koleksi
      // sembarangan.
      res.status(204).send('');
      return;
    }

    await bumpStat([event]).catch(() => undefined);
    // Selalu 204: pengunjung tak perlu tahu hasilnya, dan jawaban yang
    // berbeda-beda cuma jadi bahan untuk menebak-nebak.
    res.status(204).send('');
  },
);


// --- 4. Kirim kode otomatis setelah bayar di Mayar --------------------------

/**
 * Webhook Mayar → buat SATU kode baru → kirim ke email pembeli.
 * (Keputusan pemilik 2026-09-25: "ribet kalo lagi sibuk masih manual
 * kirim2 kode".)
 *
 * Alurnya:
 *   1. Pembeli membayar di Mayar. Mayar memanggil URL ini dengan event
 *      `payment.received` (badan: `{ event, data: { id, customerEmail,
 *      customerName, productId, productName, amount, … } }`).
 *   2. Kita menentukan kelompoknya dari produk yang dibeli.
 *   3. Satu kode BARU dibuat khusus untuk pesanan ini, bersama catatan
 *      pesanannya, dalam SATU transaksi — jadi tidak ada stok kode yang perlu
 *      dicetak, dan satu kode tak mungkin jatuh ke dua pembeli.
 *   4. Kodenya dikirim ke email pembeli dari Gmail pemilik.
 *
 * KEAMANAN — header `X-Callback-Token`:
 *   Endpoint ini publik. Tanpa pengaman, siapa pun yang tahu URL-nya bisa
 *   mengirim "pembayaran" palsu dan menerima kode gratis. Mayar menyertakan
 *   Webhook Token milik merchant di header `X-Callback-Token` (dikonfirmasi tim
 *   Mayar 2026-09-25); nilainya kita simpan di Secret Manager sebagai
 *   `MAYAR_WEBHOOK_TOKEN`, BUKAN di repo (repo ini PUBLIK).
 *   Kalau token pernah bocor: buat token baru di dasbor Mayar, perbarui
 *   secret-nya, lalu deploy ulang.
 *
 * YANG DIKONFIRMASI TIM MAYAR (2026-09-25):
 *   - `payment.received` = pembayaran MASUK. Checkout yang belum dibayar
 *     memicu `payment.reminder` (diabaikan di sini), transaksi gagal tidak
 *     memicu webhook apa pun.
 *   - Jawaban non-2xx / timeout diulang sampai 5 kali (jeda bertambah:
 *     ±1, 5, 15 menit, …).
 *   Contoh resmi payload-nya (dari dokumentasi Postman Mayar, ditempel pemilik
 *   2026-09-25): `data.id` (= `data.transactionId`), `status: "SUCCESS"`,
 *   `customerEmail`, `customerName`, `productId`, `productName`, `amount`.
 *   Nama-nama itu yang dicoba PERTAMA oleh `pick()`; kandidat lainnya cuma
 *   jaring pengaman.
 *
 * DIULANG TANPA DOBEL — Mayar mengulang webhook yang gagal. Pesanan dicatat di
 * `orders/{id transaksi Mayar}`: kiriman kedua untuk transaksi yang sama
 * memakai kode yang SUDAH dibuat (tidak membuat kode baru), dan kalau emailnya
 * sudah terkirim, tidak mengirim lagi.
 *
 * GAGAL KIRIM EMAIL → jawab 500, supaya Mayar mencoba lagi. Kodenya sudah
 * tersimpan di pesanan, jadi percobaan berikutnya mengirim kode yang sama.
 *
 * Koleksi `orders` & `config` tertutup total dari client (firestore.rules):
 * isinya email pembeli dan kode yang belum ditukar.
 */
const MAYAR_WEBHOOK_TOKEN = defineSecret('MAYAR_WEBHOOK_TOKEN');
/** App Password Gmail (BUKAN kata sandi Gmail biasa) — lihat docs/kirim-kode-otomatis.md. */
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

/** Pengirim email. HARUS sama dengan src/data/contact.ts & email dukungan Firebase. */
const SENDER_EMAIL = 'petualangsmart@gmail.com';
/** Halaman tempat kode ditukar. Ganti saat pindah ke Firebase Hosting. */
const ACTIVATION_URL = 'https://2013tib-droid.github.io/Game-Edukasi-Anak/app/#/aktivasi';

const GROUP_TITLES: Record<Group, string> = {
  tk: 'Playgroup dan TK',
  sd1: 'SD Kelas 1 & 2',
};

/** HARUS sama dengan ALPHABET di scripts/generate-codes.mjs (tanpa I, L, O, 0, 1). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Bentuk tampilan `K7P-M4X` — sama dengan generate-codes.mjs. */
function mintCode(): { id: string; display: string } {
  const block = () =>
    Array.from({ length: 3 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  const display = `${block()}-${block()}`;
  return { id: display.replace(/-/g, ''), display };
}

/**
 * Produk Mayar → kelompok.
 *
 * Yang dicek pertama: dokumen `config/mayar_products` (`{ "<productId>": "tk" }`)
 * — diisi pemilik di Firebase Console, jadi mengganti produk tak perlu deploy.
 * Cadangannya NAMA produk, yang memang kita tulis sendiri di Mayar.
 * Tidak cocok dua-duanya → `null`, dan pesanannya dicatat untuk ditangani manual
 * (lebih baik satu pembeli dibalas manual daripada dapat kelompok yang salah).
 */
async function groupForProduct(productId: string, productName: string): Promise<Group | null> {
  if (productId) {
    const cfg = (await db.doc('config/mayar_products').get()).data() ?? {};
    const mapped = cfg[productId];
    if (isGroup(mapped)) return mapped;
  }
  return groupFromName(productName);
}

/**
 * Tebakan kelompok dari NAMA produk Mayar — cadangan kalau id produknya belum
 * dipetakan di `config/mayar_products`.
 *
 * SD akan punya tiga tahap (Kelas 1 & 2 → 3 & 4 → 5 & 6), jadi "SD" saja TIDAK
 * cukup: "SD Kelas 3 & 4" yang dipasang di Mayar sebelum kelompok `sd2` ada di
 * kode akan terbaca sebagai `sd1`, dan pembelinya dikirimi kode kelompok yang
 * salah padahal sudah membayar. Karena itu `sd1` hanya kalau namanya menyebut
 * kelas 1 atau 2 dan TIDAK menyebut kelas 3–6. Selebihnya `null` → ditangani manual.
 * Kalau kelompok SD berikutnya dibuat, tambahkan cabangnya di sini.
 */
function groupFromName(productName: string): Group | null {
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

/**
 * Ambil nilai pertama yang ada dari beberapa kandidat nama field (boleh
 * bertitik untuk objek bersarang, mis. `customer.email`). Nama field payload
 * Mayar belum bisa dicocokkan dengan contoh resmi, jadi nama lain yang masuk
 * akal ikut dicoba — lebih baik daripada kode tak pernah terkirim karena satu
 * nama field.
 */
function pick(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    let cur: unknown = data;
    for (const part of key.split('.')) {
      cur = cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[part] : undefined;
    }
    if (typeof cur === 'string' && cur.trim()) return cur;
    if (typeof cur === 'number' && Number.isFinite(cur)) return String(cur);
  }
  return '';
}

function isEmail(value: string): boolean {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && value.length <= 200;
}

/** Teks dari pembeli dipakai di email — buang karakter yang bisa merusak HTML. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function codeEmail(name: string, group: Group, display: string) {
  const title = GROUP_TITLES[group];
  const hello = name ? `Halo ${name},` : 'Halo,';
  const text = [
    hello,
    '',
    `Terima kasih sudah membeli Petualangan Pintar — ${title}.`,
    '',
    `Kode aktivasi Anda: ${display}`,
    '',
    'Cara memakainya:',
    `1. Buka ${ACTIVATION_URL}`,
    '2. Daftar atau masuk (bisa dengan email atau akun Google)',
    '3. Masukkan kode di atas, lalu tekan Aktifkan',
    '',
    'Satu kode untuk satu akun, bisa dipakai di maksimal 3 perangkat.',
    'Simpan email ini baik-baik. Kalau ada kendala, balas saja email ini.',
    '',
    'Salam,',
    'Petualangan Pintar',
  ].join('\n');

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.5">
<p>${escapeHtml(hello)}</p>
<p>Terima kasih sudah membeli <b>Petualangan Pintar — ${title}</b>.</p>
<p>Kode aktivasi Anda:</p>
<p style="font-size:30px;font-weight:bold;letter-spacing:4px;background:#fff4d6;border-radius:12px;padding:12px 18px;display:inline-block;margin:0">${display}</p>
<p><b>Cara memakainya:</b></p>
<ol>
<li>Buka <a href="${ACTIVATION_URL}">halaman aktivasi</a></li>
<li>Daftar atau masuk (bisa dengan email atau akun Google)</li>
<li>Masukkan kode di atas, lalu tekan <b>Aktifkan</b></li>
</ol>
<p>Satu kode untuk satu akun, bisa dipakai di maksimal 3 perangkat.<br>
Simpan email ini baik-baik. Kalau ada kendala, balas saja email ini.</p>
<p>Salam,<br>Petualangan Pintar</p>
</div>`;

  return { subject: `Kode aktivasi Petualangan Pintar — ${title}`, text, html };
}

async function sendCodeEmail(to: string, name: string, group: Group, display: string) {
  const mail = { from: `Petualangan Pintar <${SENDER_EMAIL}>`, to, ...codeEmail(name, group, display) };
  // Di emulator tidak ada email sungguhan yang dikirim: pesannya cuma
  // disusun, supaya webhook bisa diuji tanpa App Password.
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    await createTransport({ jsonTransport: true }).sendMail(mail);
    logger.info('emulator: email tidak dikirim', { to, subject: mail.subject });
    return;
  }
  const transport = createTransport({
    service: 'gmail',
    auth: { user: SENDER_EMAIL, pass: GMAIL_APP_PASSWORD.value().replace(/\s/g, '') },
  });
  await transport.sendMail(mail);
}

type OrderResult =
  | { status: 'ready'; display: string; emailed: boolean }
  | { status: 'exists-unfulfillable' };

/**
 * Membuat (atau mengambil lagi) kode untuk satu pesanan. Kode baru dan catatan
 * pesanan ditulis dalam SATU transaksi: kalau webhook yang sama datang dua
 * kali bersamaan, hanya satu yang berhasil membuat kode.
 */
async function codeForOrder(
  orderId: string,
  order: { email: string; name: string; group: Group; productId: string; productName: string; amount: number },
): Promise<OrderResult> {
  const orderRef = db.doc(`orders/${orderId}`);
  // Tabrakan kode acak (31^6 kemungkinan) nyaris mustahil, tapi `create`
  // menolaknya — coba lagi dengan kode lain beberapa kali.
  for (let attempt = 0; attempt < 5; attempt++) {
    const minted = mintCode();
    const codeRef = db.doc(`activation_codes/${minted.id}`);
    try {
      return await db.runTransaction(async (tx) => {
        const existing = await tx.get(orderRef);
        if (existing.exists) {
          const data = existing.data() ?? {};
          if (typeof data.code !== 'string') return { status: 'exists-unfulfillable' as const };
          return { status: 'ready' as const, display: data.code, emailed: Boolean(data.emailedAt) };
        }
        tx.create(codeRef, {
          code: minted.id,
          display: minted.display,
          group: order.group,
          batch: 'mayar-otomatis',
          orderId,
          used: false,
          usedBy: null,
          usedAt: null,
          createdAt: FieldValue.serverTimestamp(),
        });
        tx.create(orderRef, {
          ...order,
          source: 'mayar',
          code: minted.display,
          emailedAt: null,
          createdAt: FieldValue.serverTimestamp(),
        });
        return { status: 'ready' as const, display: minted.display, emailed: false };
      });
    } catch (e) {
      // 6 = ALREADY_EXISTS: kode acaknya kebetulan sudah ada → coba kode lain.
      if ((e as { code?: unknown }).code === 6) continue;
      throw e;
    }
  }
  throw new Error('Gagal membuat kode unik setelah 5 percobaan');
}

export const mayarWebhook = onRequest(
  { secrets: [MAYAR_WEBHOOK_TOKEN, GMAIL_APP_PASSWORD], maxInstances: 3 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('');
      return;
    }
    const header = req.get('x-callback-token');
    const token = typeof header === 'string' ? header : '';
    const expected = MAYAR_WEBHOOK_TOKEN.value();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(401).send('');
      return;
    }

    const body = (req.body ?? {}) as { event?: unknown; data?: Record<string, unknown> };
    const event = String(body.event ?? '');
    const data = body.data ?? {};

    // Event lain (pengingat, membership, uji coba dari dasbor) diterima tapi
    // diabaikan — menjawab 200 supaya Mayar tidak terus mengulanginya.
    if (event !== 'payment.received') {
      logger.info('mayarWebhook: event diabaikan', { event });
      res.status(200).json({ ok: true, ignored: event });
      return;
    }

    const orderId = pick(data, ['id', 'transactionId', 'transaction_id'])
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 100);
    const email = pick(data, ['customerEmail', 'customer.email', 'email']).trim().toLowerCase();
    const name = pick(data, ['customerName', 'customer.name', 'name'])
      .replace(/[\u0000-\u001f<>]/g, '')
      .trim()
      .slice(0, 80);
    const productId = pick(data, ['productId', 'product.id', 'paymentLinkId']).slice(0, 100);
    const productName = pick(data, ['productName', 'product.name', 'paymentLinkName']).slice(0, 200);
    const amount = Number(pick(data, ['amount', 'totalAmount', 'credit'])) || 0;

    if (!orderId || !isEmail(email)) {
      // Yang dicatat cuma NAMA field-nya, bukan isinya (isinya data pribadi
      // pembeli). Cukup untuk membetulkan `pick()` kalau nama field Mayar
      // ternyata lain dari dugaan.
      logger.warn('mayarWebhook: data pesanan tidak lengkap', {
        orderId,
        hasEmail: Boolean(email),
        fields: Object.keys(data).slice(0, 40),
      });
      res.status(200).json({ ok: false, reason: 'incomplete' });
      return;
    }

    // Contoh resmi Mayar memuat `status: "SUCCESS"`. Status lain yang TERTULIS
    // (bukan yang kosong) tidak dibuatkan kode, tapi pesanannya dicatat supaya
    // pemilik bisa memeriksanya — lebih baik satu pembeli dibalas manual
    // daripada kode terkirim untuk pembayaran yang belum sah.
    const status = pick(data, ['status']).toUpperCase();
    if (status && !['SUCCESS', 'PAID', 'SETTLED'].includes(status)) {
      await db.doc(`orders/${orderId}`).set(
        {
          email, name, productId, productName, amount, source: 'mayar',
          code: null, problem: `status-${status.toLowerCase().slice(0, 20)}`,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      logger.warn('mayarWebhook: status pembayaran bukan SUCCESS — tidak dikirimi kode', { orderId, status });
      res.status(200).json({ ok: false, reason: 'not-success' });
      return;
    }

    const group = await groupForProduct(productId, productName);
    if (!group) {
      // Dicatat supaya pemilik bisa membalas manual — tidak ada kode dibuat.
      await db.doc(`orders/${orderId}`).set(
        {
          email, name, productId, productName, amount, source: 'mayar',
          code: null, problem: 'produk-tidak-dikenal', createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      logger.error('mayarWebhook: produk tidak dikenal — kirim kode manual', { orderId, productId, productName });
      res.status(200).json({ ok: false, reason: 'unknown-product' });
      return;
    }

    const result = await codeForOrder(orderId, { email, name, group, productId, productName, amount });
    if (result.status === 'exists-unfulfillable') {
      res.status(200).json({ ok: false, reason: 'needs-manual' });
      return;
    }
    if (result.emailed) {
      res.status(200).json({ ok: true, already: true });
      return;
    }

    try {
      await sendCodeEmail(email, name, group, result.display);
    } catch (e) {
      // KODENYA TIDAK DICATAT DI LOG — log Cloud Functions bisa dibaca siapa
      // pun yang punya akses project, dan kode = barang jualan.
      logger.error('mayarWebhook: email gagal terkirim, Mayar akan mengulang', {
        orderId,
        error: (e as Error).message,
      });
      res.status(500).json({ ok: false, reason: 'email-failed' });
      return;
    }

    await db.doc(`orders/${orderId}`).update({ emailedAt: FieldValue.serverTimestamp() });
    await bumpStat(['mayar_paid', `mayar_paid_${group}`]).catch(() => undefined);
    logger.info('mayarWebhook: kode terkirim', { orderId, group });
    res.status(200).json({ ok: true });
  },
);

// --- 5. Pesanan Mayar muncul di situs (lonceng & /aktivasi) -----------------

/**
 * Pembeli yang sudah bayar di Mayar melihat "Pembayaran diterima" di lonceng
 * dan bisa mengaktifkan kelompoknya dengan SATU KETUKAN, tanpa mengetik kode
 * dari email (permintaan pemilik 2026-09-26). Email kodenya tetap dikirim
 * seperti biasa — ini jalan kedua, bukan pengganti: pembeli yang email Mayar-nya
 * beda dengan email akunnya tetap memakai kode dari email.
 *
 * Pesanan dicocokkan lewat EMAIL: `orders.email` (dari halaman bayar Mayar)
 * sama dengan email akun yang sedang masuk.
 *
 * SYARAT MUTLAK: email akun SUDAH TERVERIFIKASI (klaim `email_verified` di ID
 * token). Tanpa itu siapa pun bisa mendaftar memakai email pembeli lain lalu
 * mengambil pesanannya — karena itu dua function ini membaca email dari
 * TOKEN, tidak pernah dari data yang dikirim HP.
 *
 * KODENYA TIDAK PERNAH DIKIRIM KE HP lewat jalur ini. `myPaidOrders` hanya
 * menjawab "ada pesanan kelompok X yang belum diaktifkan"; `claimPaidOrder`
 * menukarnya di server. Kode yang tampil di situs bisa difoto & dibagikan.
 */

/** Email dari ID token yang sudah terverifikasi, huruf kecil (sama dengan `orders.email`). */
function verifiedEmail(request: CallableRequest): string | null {
  const token = request.auth?.token;
  if (token?.email_verified !== true || typeof token.email !== 'string') return null;
  return token.email.trim().toLowerCase();
}

interface PaidOrderInfo {
  orderId: string;
  group: Group;
  paidAt: number | null;
}

/**
 * Pesanan Mayar milik email akun ini yang BELUM diaktifkan.
 *
 * Yang disaring keluar:
 *   - pesanan tanpa kode (produk tak dikenal / status bukan SUCCESS — itu
 *     ditangani manual oleh pemilik);
 *   - kode yang sudah dipakai, oleh akun ini maupun akun lain (misalnya kode
 *     dari email sudah diteruskan ke HP lain);
 *   - kelompok yang SUDAH dimiliki akun ini: menukarnya lagi cuma membakar
 *     kode kedua tanpa guna. Kode itu tetap ada di email, bisa diberikan ke
 *     akun lain.
 *
 * Email belum terverifikasi → daftar kosong + `needsVerify`, BUKAN error:
 * pemanggilnya lonceng di setiap halaman, dan error di sana tidak berguna.
 */
export const myPaidOrders = onCall(async (request) => {
  const uid = requireUid(request);
  const email = verifiedEmail(request);
  if (!email) return { orders: [] as PaidOrderInfo[], needsVerify: true };

  const [ordersSnap, userSnap] = await Promise.all([
    db.collection('orders').where('email', '==', email).limit(20).get(),
    db.doc(`users/${uid}`).get(),
  ]);
  const owned = new Set<string>((userSnap.data()?.groups as string[] | undefined) ?? []);

  const candidates = ordersSnap.docs
    .map((d) => ({ id: d.id, data: d.data() }))
    .filter((o) => typeof o.data.code === 'string' && isGroup(o.data.group))
    .filter((o) => !owned.has(o.data.group as string));

  const codeSnaps = await Promise.all(
    candidates.map((o) =>
      db.doc(`activation_codes/${(o.data.code as string).replace(/-/g, '')}`).get(),
    ),
  );

  // Urutan hasil query tidak dijamin; yang lebih dulu dibayar tampil di atas.
  const paidMs = (o: (typeof candidates)[number]) =>
    (o.data.createdAt as Timestamp | undefined)?.toMillis() ?? 0;
  const order = candidates.map((o, i) => ({ o, i })).sort((x, y) => paidMs(x.o) - paidMs(y.o));

  const orders: PaidOrderInfo[] = [];
  const seenGroups = new Set<string>();
  order.forEach(({ o, i }) => {
    const code = codeSnaps[i]?.data();
    if (!code || code.used === true) return;
    const group = o.data.group as Group;
    // Dua pesanan belum aktif untuk kelompok yang sama → cukup satu kartu;
    // mengaktifkan satu saja sudah membuka kelompoknya.
    if (seenGroups.has(group)) return;
    seenGroups.add(group);
    const created = o.data.createdAt as Timestamp | undefined;
    orders.push({ orderId: o.id, group, paidAt: created ? created.toMillis() : null });
  });

  return { orders, needsVerify: false };
});

/**
 * Mengaktifkan satu pesanan Mayar untuk akun ini — setara menukar kodenya,
 * tapi kodenya tak pernah keluar dari server.
 *
 * Tidak memakai rem percobaan kode: di sini tak ada yang bisa ditebak. Id
 * pesanan saja tidak cukup; email pesanannya harus sama dengan email token.
 */
export const claimPaidOrder = onCall(async (request) => {
  const uid = requireUid(request);
  requireVerifiedEmail(request);
  const email = verifiedEmail(request);
  const raw = (request.data as { orderId?: unknown } | undefined)?.orderId;
  if (typeof raw !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(raw) || !email) {
    throw new HttpsError('invalid-argument', 'Pesanan tidak terbaca.');
  }

  const orderRef = db.doc(`orders/${raw}`);
  const userRef = db.doc(`users/${uid}`);

  // Pola yang sama dengan redeemActivationCode: transaksi hanya MELAPORKAN
  // hasilnya, error dilempar sesudahnya.
  const result = await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    const order = orderSnap.data();
    if (!order || order.email !== email || typeof order.code !== 'string' || !isGroup(order.group)) {
      return { status: 'not-found' as const };
    }
    const group = order.group;
    const codeRef = db.doc(`activation_codes/${order.code.replace(/-/g, '')}`);
    const codeSnap = await tx.get(codeRef);
    const code = codeSnap.data();
    if (!code) return { status: 'not-found' as const };
    if (code.used === true) {
      return code.usedBy === uid
        ? { status: 'already-yours' as const, group }
        : { status: 'used' as const };
    }

    tx.update(codeRef, { used: true, usedBy: uid, usedAt: FieldValue.serverTimestamp() });
    tx.set(
      userRef,
      { groups: FieldValue.arrayUnion(group), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    tx.update(orderRef, { claimedBy: uid, claimedAt: FieldValue.serverTimestamp() });
    return { status: 'ok' as const, group };
  });

  if (result.status === 'not-found') {
    throw new HttpsError('not-found', 'Pesanan ini tidak ditemukan untuk akun ini.');
  }
  if (result.status === 'used') {
    throw new HttpsError(
      'failed-precondition',
      'Kode pesanan ini sudah dipakai di akun lain. Hubungi kami lewat WhatsApp ya.',
    );
  }

  if (result.status === 'ok') {
    // Dihitung sebagai penukaran berhasil (corong redeem_ok), ditambah
    // penanda jalurnya supaya kelihatan berapa yang memakai tombol ini.
    await bumpStat(['redeem_ok', `redeem_ok_${result.group}`, 'redeem_ok_tombol']).catch(
      () => undefined,
    );
    logger.info('claimPaidOrder: pesanan diaktifkan', { orderId: raw, group: result.group });
  }

  return { group: result.group, already: result.status === 'already-yours' };
});
