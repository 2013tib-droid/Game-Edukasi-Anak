/**
 * Cloud Functions — Fase 5 (monetisasi).
 *
 * Two callables, both requiring a signed-in account:
 *   redeemActivationCode({ code })            → menukar kode jadi akses kelompok
 *   verifyAccess({ deviceId })                → cek akses + daftarkan perangkat
 *
 * Access rules live here, never on the client: `activation_codes` and the
 * `groups` field are unreachable from the browser (see firestore.rules), so
 * the Admin SDK in these functions is the only way in.
 */

import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { verifyCode, type GroupId } from './activation-code.js';

initializeApp();
const db = getFirestore();

/** Jakarta — lowest latency for Indonesian buyers. */
const REGION = 'asia-southeast2';

/** CLAUDE.md: maksimal 3 perangkat per akun. */
const MAX_DEVICES = 3;

/** Brute-force guard: N percobaan kode per akun per jendela waktu. */
const REDEEM_MAX_ATTEMPTS = 10;
const REDEEM_WINDOW_MS = 10 * 60 * 1000;

const callOptions = { region: REGION, cors: true } as const;

function requireUid(auth: { uid: string } | undefined): string {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Masuk dulu ke akun orang tua ya.');
  }
  return auth.uid;
}

/**
 * Counts redeem attempts per account. Guessing a code is already impractical
 * (25^7 ≈ 6.1e9 per group), but an unthrottled callable is free brute-force
 * infrastructure, so we cap it.
 */
async function assertNotRateLimited(uid: string): Promise<void> {
  const ref = db.doc(`redeem_attempts/${uid}`);
  const now = Date.now();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const windowStart: number = data?.windowStart ?? 0;
    const fresh = now - windowStart > REDEEM_WINDOW_MS;
    const count: number = fresh ? 0 : (data?.count ?? 0);

    if (count >= REDEEM_MAX_ATTEMPTS) {
      const waitMin = Math.ceil((REDEEM_WINDOW_MS - (now - windowStart)) / 60000);
      throw new HttpsError(
        'resource-exhausted',
        `Terlalu banyak percobaan. Coba lagi ${waitMin} menit lagi ya.`,
      );
    }

    tx.set(
      ref,
      { count: count + 1, windowStart: fresh ? now : windowStart, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  });
}

/**
 * Menukar kode aktivasi menjadi akses kelompok pada akun yang sedang masuk.
 *
 * Idempotent untuk pemiliknya: menukar ulang kode yang sudah dipakai akun
 * yang sama tidak error (orang tua sering menekan tombol dua kali), tapi
 * kode milik akun lain selalu ditolak.
 */
export const redeemActivationCode = onCall(callOptions, async (request) => {
  const uid = requireUid(request.auth);

  // Format + checksum dulu: kode salah ketik ditolak tanpa menyentuh Firestore.
  const check = verifyCode((request.data as { code?: unknown } | undefined)?.code);
  if (!check.ok) {
    logger.info('redeem rejected before lookup', { uid, reason: check.reason });
    throw new HttpsError(
      'invalid-argument',
      'Kode tidak dikenali. Periksa lagi ketikannya ya — contoh: TK-ACDE-FGHJ.',
    );
  }

  await assertNotRateLimited(uid);

  const { code, group } = check;
  const codeRef = db.doc(`activation_codes/${code}`);
  const userRef = db.doc(`users/${uid}`);

  const result = await db.runTransaction(async (tx) => {
    // Semua baca sebelum semua tulis — syarat transaksi Firestore.
    const [codeSnap, userSnap] = await Promise.all([tx.get(codeRef), tx.get(userRef)]);

    if (!codeSnap.exists) {
      throw new HttpsError('not-found', 'Kode tidak ditemukan. Pastikan sama persis dengan yang dikirim penjual.');
    }

    const data = codeSnap.data() as {
      group?: GroupId;
      used?: boolean;
      usedBy?: string | null;
    };

    if (data.used) {
      if (data.usedBy === uid) return { group, alreadyOwned: true };
      throw new HttpsError('already-exists', 'Kode ini sudah pernah dipakai di akun lain.');
    }

    // Prefix kode dan field group harus sepakat; kalau tidak, batch-nya salah
    // dibuat dan lebih baik gagal daripada memberi akses yang salah.
    if (data.group && data.group !== group) {
      logger.error('code group mismatch', { code, prefixGroup: group, docGroup: data.group });
      throw new HttpsError('failed-precondition', 'Kode bermasalah. Hubungi penjual ya.');
    }

    const existing: GroupId[] = (userSnap.data()?.groups as GroupId[] | undefined) ?? [];

    tx.set(
      codeRef,
      { used: true, usedBy: uid, usedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    tx.set(
      userRef,
      { groups: FieldValue.arrayUnion(group), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    return { group, alreadyOwned: existing.includes(group) };
  });

  logger.info('code redeemed', { uid, group: result.group });
  return { group: result.group, alreadyOwned: result.alreadyOwned };
});

/**
 * Dipanggil saat login dan **saat game premium diluncurkan** (CLAUDE.md:
 * validasi akses harus online, bukan cuma saat login).
 *
 * Sekalian mendaftarkan perangkat: akun dibatasi 3 perangkat. Perangkat yang
 * sudah terdaftar hanya diperbarui `lastSeenAt`-nya, jadi memakai ulang HP
 * yang sama tidak pernah memakan kuota.
 */
export const verifyAccess = onCall(callOptions, async (request) => {
  const uid = requireUid(request.auth);

  const deviceId = String((request.data as { deviceId?: unknown } | undefined)?.deviceId ?? '').trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(deviceId)) {
    throw new HttpsError('invalid-argument', 'Perangkat tidak dikenali.');
  }

  const userRef = db.doc(`users/${uid}`);
  const deviceRef = userRef.collection('devices').doc(deviceId);

  return db.runTransaction(async (tx) => {
    const [userSnap, deviceSnap, devicesSnap] = await Promise.all([
      tx.get(userRef),
      tx.get(deviceRef),
      tx.get(userRef.collection('devices')),
    ]);

    const groups: GroupId[] = (userSnap.data()?.groups as GroupId[] | undefined) ?? [];

    if (deviceSnap.exists) {
      tx.set(deviceRef, { lastSeenAt: FieldValue.serverTimestamp() }, { merge: true });
    } else {
      if (devicesSnap.size >= MAX_DEVICES) {
        throw new HttpsError(
          'resource-exhausted',
          `Akun ini sudah dipakai di ${MAX_DEVICES} perangkat. Hubungi kami untuk mengganti perangkat ya.`,
        );
      }
      tx.set(deviceRef, {
        createdAt: FieldValue.serverTimestamp(),
        lastSeenAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      groups,
      deviceCount: deviceSnap.exists ? devicesSnap.size : devicesSnap.size + 1,
      maxDevices: MAX_DEVICES,
      checkedAt: Timestamp.now().toMillis(),
    };
  });
});
