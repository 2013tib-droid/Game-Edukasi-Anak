import { getFirebase, isFirebaseConfigured } from '@/auth/firebase';
import {
  loadProgress,
  mergeRemoteProgress,
  onProgressChange,
  type ProgressStore,
} from '@/engine/core/progress';
import type { Stars } from '@/engine/core/types';

/**
 * Cadangan bintang di Firestore: `users/{uid}/progress/{gameId}`.
 *
 * KEPUTUSAN PEMILIK (2026-09-16): satu akun = SATU kumpulan bintang. Kalau
 * dua anak memakai satu akun orang tua, bintangnya digabung — tidak ada
 * profil anak terpisah. Jadi tidak ada id anak di mana pun di sini; kalau
 * suatu saat profil terpisah dibutuhkan, itu jenjang baru di bawah `uid`,
 * bukan mengubah bentuk dokumen ini.
 *
 * Tiga aturan yang tidak boleh dilanggar:
 *
 * 1. **localStorage tetap sumber utama saat bermain.** Anak yang main tanpa
 *    sinyal tidak boleh kehilangan bintang maupun menunggu jaringan. Semua
 *    yang ada di sini berjalan di latar dan boleh gagal.
 * 2. **GABUNGKAN, JANGAN TIMPA.** Bintang itu nilai TERBAIK per level, jadi
 *    dua perangkat digabung dengan mengambil yang tertinggi — ke dua arah.
 * 3. **Jangan pernah `await` dari jalur permainan.** Pemanggilnya menembak
 *    lalu melupakan; kegagalan diperbaiki sendiri oleh sinkron berikutnya,
 *    karena penggabungan yang mengambil nilai tertinggi selalu aman diulang.
 */

const COLLECTION = 'progress';

/** Jeda sebelum mendorong satu game, supaya beberapa level beruntun jadi satu tulisan. */
const PUSH_DELAY_MS = 1500;

let currentUid: string | null = null;
let pending: ReturnType<typeof setTimeout> | null = null;
const dirty = new Set<string>();
let wired = false;

/**
 * Buang apa pun yang bukan bintang sah.
 *
 * Dokumen server bisa saja rusak atau berisi bentuk lama; satu nilai aneh
 * (`null`, string, 99) yang lolos ke localStorage akan menggelembungkan total
 * bintang dan menaikkan maskot tanpa sebab — dan itu tersimpan permanen di
 * perangkat anak.
 */
function sanitize(data: unknown): Record<string, Stars> {
  const out: Record<string, Stars> = {};
  if (!data || typeof data !== 'object') return out;
  for (const [levelId, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value !== 'number' || !Number.isInteger(value)) continue;
    if (value < 1 || value > 3) continue;
    out[levelId] = value as Stars;
  }
  return out;
}

/** True kalau `local` memuat sesuatu yang belum ada (atau lebih tinggi) di `remote`. */
function isAhead(local: Record<string, Stars>, remote: Record<string, Stars> | undefined): boolean {
  for (const [levelId, stars] of Object.entries(local)) {
    if (stars > (remote?.[levelId] ?? 0)) return true;
  }
  return false;
}

/**
 * Tarik seluruh catatan dari server, gabungkan dengan yang lokal, lalu dorong
 * balik game yang lokalnya lebih maju.
 *
 * Dipanggil saat orang tua masuk akun dan saat jaringan pulih. Karena
 * penggabungannya mengambil nilai tertinggi, menjalankannya berkali-kali
 * tidak pernah merugikan — itulah yang membuat dorongan yang gagal tidak
 * perlu diantre sendiri.
 */
export async function syncProgress(uid: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const { db } = await getFirebase();
  const { collection, doc, getDocs, writeBatch } = await import('firebase/firestore');

  const snap = await getDocs(collection(db, 'users', uid, COLLECTION));
  const remote: ProgressStore = {};
  snap.forEach((d) => {
    remote[d.id] = sanitize(d.data());
  });

  const merged = mergeRemoteProgress(remote);

  const batch = writeBatch(db);
  let writes = 0;
  for (const [gameId, levels] of Object.entries(merged)) {
    if (!isAhead(levels, remote[gameId])) continue;
    batch.set(doc(db, 'users', uid, COLLECTION, gameId), levels);
    writes++;
  }
  if (writes > 0) await batch.commit();
  dirty.clear();
}

/**
 * Dorong satu game ke server, digabungkan di dalam TRANSAKSI.
 *
 * Transaksinya bukan hiasan: perangkat lain bisa menaikkan bintang level yang
 * sama sejak sinkron terakhir, dan `setDoc` biasa akan MENURUNKANNYA kembali.
 * Satu pembacaan per game tamat itu murah — jauh lebih murah daripada anak
 * yang kehilangan bintang yang sudah didapatnya di tablet.
 */
async function pushGame(uid: string, gameId: string): Promise<void> {
  const local = loadProgress()[gameId];
  if (!local || Object.keys(local).length === 0) return;

  const { db } = await getFirebase();
  const { doc, runTransaction } = await import('firebase/firestore');
  const ref = doc(db, 'users', uid, COLLECTION, gameId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const remote = sanitize(snap.data());
    const merged: Record<string, Stars> = { ...remote };
    let changed = false;
    for (const [levelId, stars] of Object.entries(local)) {
      if (stars > (merged[levelId] ?? 0)) {
        merged[levelId] = stars;
        changed = true;
      }
    }
    // Tulis hanya kalau ada yang bertambah — dua HP yang menyinkronkan
    // bergantian tidak boleh saling menulis ulang isi yang sama.
    if (changed) tx.set(ref, merged);
  });
}

function flush(): void {
  pending = null;
  const uid = currentUid;
  if (!uid) return;
  const games = [...dirty];
  dirty.clear();
  for (const gameId of games) {
    // Sengaja tidak di-`await`: kegagalan (sinyal putus, HP dikunci) cukup
    // dibiarkan — sinkron berikutnya yang membereskannya, dan sementara itu
    // bintangnya tetap aman di localStorage.
    void pushGame(uid, gameId).catch(() => {
      dirty.add(gameId);
    });
  }
}

/**
 * Sambungkan sinkron ke akun yang sedang masuk.
 *
 * Dipanggil `AuthProvider` setiap keadaan auth berubah; `null` saat keluar
 * akun. Bintang lokal SENGAJA tidak dihapus saat keluar akun — anak boleh
 * bermain tanpa akun sama sekali, dan menghapusnya akan menghukum orang tua
 * yang cuma keluar sebentar.
 */
export function setSyncUser(uid: string | null): void {
  if (uid === currentUid) return;
  currentUid = uid;
  if (!uid) return;

  wire();
  void syncProgress(uid).catch(() => {
    // Offline saat masuk akun: biarkan. Perubahan lokal tetap tercatat, dan
    // pendengar 'online' di bawah akan mencoba lagi.
  });
}

/** Pasang pendengar sekali saja — `setSyncUser` bisa dipanggil berkali-kali. */
function wire(): void {
  if (wired) return;
  wired = true;

  onProgressChange((gameId) => {
    // `null` = perubahan borongan dari sinkron itu sendiri. Mendorongnya
    // balik akan jadi lingkaran tak berujung.
    if (!gameId || !currentUid) return;
    dirty.add(gameId);
    if (pending) clearTimeout(pending);
    pending = setTimeout(flush, PUSH_DELAY_MS);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      const uid = currentUid;
      if (uid) void syncProgress(uid).catch(() => {});
    });
  }
}
