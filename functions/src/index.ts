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
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';

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
