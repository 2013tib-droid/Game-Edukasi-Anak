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
