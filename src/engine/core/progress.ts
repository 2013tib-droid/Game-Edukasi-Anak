import type { Stars } from '@/engine/core/types';

/**
 * Star progress, stored locally per device for now.
 * Fase 5 syncs this to users/{uid}/progress in Firestore.
 */

const KEY = 'pp_progress_v1';

interface ProgressStore {
  [gameId: string]: { [levelId: string]: Stars };
}

function load(): ProgressStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as ProgressStore;
  } catch {
    return {};
  }
}

export function getLevelStars(gameId: string, levelId: string): Stars {
  return load()[gameId]?.[levelId] ?? 0;
}

export function getGameStars(gameId: string): number {
  const game = load()[gameId] ?? {};
  return Object.values(game).reduce<number>((sum, s) => sum + s, 0);
}

/** Total stars across every game — drives the mascot's growth. */
export function getTotalStars(): number {
  const store = load();
  return Object.values(store).reduce<number>(
    (sum, game) => sum + Object.values(game).reduce<number>((s, v) => s + v, 0),
    0,
  );
}

export function saveLevelStars(gameId: string, levelId: string, stars: Stars): void {
  const store = load();
  const game = store[gameId] ?? {};
  // Keep the best result — replaying never lowers a score.
  if (stars > (game[levelId] ?? 0)) {
    game[levelId] = stars;
    store[gameId] = game;
    localStorage.setItem(KEY, JSON.stringify(store));
    // Beri tahu pencadang (kalau ada yang mendengarkan). Dipanggil SESUDAH
    // localStorage ditulis, jadi cadangan selalu membawa angka yang sudah
    // pasti tersimpan di perangkat ini.
    notifyProgress(gameId);
  }
}

/**
 * Pindahkan bintang "Cerita Nusantara" ke game gabungannya.
 *
 * Game itu dilebur ke `cerita-kancil` (judul "Baca Cerita") pada 2026-09-02.
 * Bintang disimpan per `[gameId][levelId]`, jadi tanpa pemindahan ini anak
 * yang sudah menamatkan Timun Mas akan menemukan bintangnya hilang — dan
 * maskotnya ikut mengecil, karena `getTotalStars()` yang menumbuhkannya.
 *
 * Id level ikut berpindah `l1`-`l6` → `n1`-`n6` (nomornya tetap; awalannya
 * dibedakan supaya tidak bentrok dengan `l1`-`l3` milik fabel Kancil).
 *
 * Kunci lama DIHAPUS setelah dipindah — kalau ditinggal, `getTotalStars()`
 * menghitung bintang yang sama dua kali dan maskot melonjak tanpa sebab.
 * Aman dijalankan berulang: sesudah kunci lamanya hilang, fungsi ini
 * langsung keluar.
 */
export function migrateMergedStories(): void {
  const store = load();
  const old = store['cerita-nusantara'];
  if (!old) return;

  const merged = store['cerita-kancil'] ?? {};
  for (const [levelId, stars] of Object.entries(old)) {
    const moved = levelId.replace(/^l/, 'n');
    // Ambil yang terbaik: anak mungkin sudah main lagi di game gabungannya.
    if (stars > (merged[moved] ?? 0)) merged[moved] = stars;
  }
  store['cerita-kancil'] = merged;
  delete store['cerita-nusantara'];

  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Penyimpanan penuh / dimatikan: biarkan keadaan lama, jangan sampai
    // boot aplikasi gagal cuma karena pemindahan bintang.
  }
}

/**
 * Pindahkan bintang "Tambah Tangkas" ke `hitung-hebat` (dilebur 2026-09-03).
 *
 * Id level ikut berpindah `l1`-`l10` → `t1`-`t10` (awalan `t` supaya tidak
 * bentrok dengan `l1`-`l10` milik Hitung Hebat sendiri) — lihat komentar
 * kepala `src/games/sd1/hitung-hebat.ts`. Pola & alasannya sama persis
 * dengan `migrateMergedStories()` di atas: tanpa pemindahan ini, anak yang
 * sudah mengumpulkan bintang di Tambah Tangkas akan melihatnya hilang dan
 * maskotnya ikut mengecil. Aman dijalankan berulang.
 */
export function migrateMergedMath(): void {
  const store = load();
  const old = store['tambah-tangkas'];
  if (!old) return;

  const merged = store['hitung-hebat'] ?? {};
  for (const [levelId, stars] of Object.entries(old)) {
    const moved = levelId.replace(/^l/, 't');
    if (stars > (merged[moved] ?? 0)) merged[moved] = stars;
  }
  store['hitung-hebat'] = merged;
  delete store['tambah-tangkas'];

  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Penyimpanan penuh / dimatikan: biarkan keadaan lama, jangan sampai
    // boot aplikasi gagal cuma karena pemindahan bintang.
  }
}

// --- Cadangan ke Firestore (Fase 6) ----------------------------------------
//
// PENTING: file ini tetap TIDAK tahu-menahu soal Firebase. localStorage
// adalah sumber utama selagi anak main — anak yang main tanpa sinyal tidak
// boleh kehilangan bintang atau menunggu jaringan. Yang menyambungkannya ke
// Firestore adalah `src/auth/progressSync.ts`, dan ia memakai tiga fungsi di
// bawah ini. Jangan mengimpor apa pun dari `@/auth` ke sini: engine harus
// tetap bisa dibangun & dimainkan tanpa lapisan akun.

/** Bentuk cadangan yang baru diunduh: belum diperiksa, jadi `unknown`. */
export type IncomingProgress = Record<string, Record<string, unknown> | undefined>;

function isStars(v: unknown): v is Stars {
  return v === 1 || v === 2 || v === 3;
}

/** Seluruh bintang di perangkat ini, untuk dikirim sebagai cadangan. */
export function getAllProgress(): ProgressStore {
  return load();
}

/**
 * Gabungkan bintang dari perangkat lain ke perangkat ini.
 *
 * **Ambil yang TERTINGGI per level, jangan pernah menimpa.** Bintang itu
 * nilai TERBAIK per level (lihat `saveLevelStars`), jadi penggabungan dua
 * perangkat = maksimum per level. Anak yang main di tablet lalu di HP tidak
 * boleh kehilangan apa pun — termasuk saat cadangan yang diunduh lebih tua
 * daripada yang ada di HP ini.
 *
 * Mengembalikan `true` kalau ada yang benar-benar berubah di perangkat ini,
 * supaya pemanggilnya tahu apakah tampilan perlu digambar ulang.
 */
export function mergeProgress(incoming: IncomingProgress): boolean {
  const store = load();
  let changed = false;

  for (const [gameId, levels] of Object.entries(incoming)) {
    if (!levels || typeof levels !== 'object') continue;
    const game = store[gameId] ?? {};
    for (const [levelId, raw] of Object.entries(levels)) {
      // Cadangan datang dari jaringan, jadi bentuknya TIDAK dipercaya —
      // itu sebabnya parameternya `unknown` dan bukan `Stars`. Bintang di
      // luar 1-3 dibuang, bukan dipaksa masuk.
      if (!isStars(raw)) continue;
      if (raw > (game[levelId] ?? 0)) {
        game[levelId] = raw;
        changed = true;
      }
    }
    if (Object.keys(game).length > 0) store[gameId] = game;
  }

  if (!changed) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Penyimpanan penuh / dimatikan: biarkan keadaan lama. Bintang yang baru
    // diunduh hilang lagi, tapi permainan tetap jalan — dan percobaan sinkron
    // berikutnya akan mengunduhnya ulang.
    return false;
  }
  return true;
}

// Pemberitahuan "ada bintang baru tersimpan", supaya pencadangan bisa
// dijadwalkan tanpa `saveLevelStars` perlu tahu siapa yang mendengarkan.
const progressListeners = new Set<(gameId: string) => void>();

export function subscribeProgress(fn: (gameId: string) => void): () => void {
  progressListeners.add(fn);
  return () => {
    progressListeners.delete(fn);
  };
}

function notifyProgress(gameId: string): void {
  progressListeners.forEach((fn) => {
    try {
      fn(gameId);
    } catch {
      // Pencadangan tidak boleh pernah menjatuhkan permainan.
    }
  });
}
