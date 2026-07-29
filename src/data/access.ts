/**
 * SATU-SATUNYA sumber kebenaran soal "game mana yang terkunci".
 *
 * Dulu status gratis/berbayar ditulis dua kali (config game + registry) dan
 * harus diubah satu per satu di 11 file. Sekarang cukup di sini:
 *
 *   - `FREE_GAME_IDS` = daftar game yang GRATIS saat rilis.
 *   - `lock mode`     = saklar buka/tutup semua kunci, untuk testing.
 *
 * Mode kunci:
 *   'buka'  → semua game terbuka (masa pra-rilis / testing).
 *   'kunci' → hanya game di `FREE_GAME_IDS` yang terbuka; sisanya minta
 *             login + kode aktivasi.
 *
 * Cara mengubahnya (tiga cara, prioritas dari atas):
 *   1. Saklar di layar (mode penguji) — lihat `LockToggle`, tersimpan di
 *      localStorage per perangkat. Ini yang dipakai untuk testing.
 *   2. Env saat build: `VITE_LOCK_MODE=kunci npm run build`.
 *   3. `DEFAULT_LOCK_MODE` di bawah — ubah saat launching.
 */

export type LockMode = 'buka' | 'kunci';

/** Game yang tetap GRATIS saat mode 'kunci' (keputusan pemilik). */
export const FREE_GAME_IDS: readonly string[] = ['hutan-hewan'];

const envMode = import.meta.env.VITE_LOCK_MODE as string | undefined;

/**
 * Mode bawaan aplikasi. Pra-rilis 'buka' supaya semua game bisa dicoba.
 * SAAT LAUNCHING: ganti jadi 'kunci' (atau build dengan VITE_LOCK_MODE=kunci).
 */
export const DEFAULT_LOCK_MODE: LockMode = isLockMode(envMode) ? envMode : 'buka';

const MODE_KEY = 'pp_lock_mode_v1';
const TEST_KEY = 'pp_test_mode_v1';

function isLockMode(v: unknown): v is LockMode {
  return v === 'buka' || v === 'kunci';
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* mode privat / storage penuh — abaikan, fallback ke default */
  }
}

// --- Mode kunci -------------------------------------------------------------

/** Mode yang berlaku sekarang: override penguji kalau ada, kalau tidak default. */
export function getLockMode(): LockMode {
  const stored = read(MODE_KEY);
  return isLockMode(stored) ? stored : DEFAULT_LOCK_MODE;
}

/** Apakah mode sekarang berasal dari saklar penguji (bukan default build). */
export function hasLockOverride(): boolean {
  return isLockMode(read(MODE_KEY));
}

export function setLockMode(mode: LockMode): void {
  write(MODE_KEY, mode);
  emit();
}

/** Buang override penguji — kembali ke `DEFAULT_LOCK_MODE`. */
export function clearLockMode(): void {
  write(MODE_KEY, null);
  emit();
}

export function toggleLockMode(): LockMode {
  const next: LockMode = getLockMode() === 'buka' ? 'kunci' : 'buka';
  setLockMode(next);
  return next;
}

// --- Pertanyaan yang dipakai UI --------------------------------------------

/** Gratis selamanya (juga saat mode 'kunci'). */
export function isFreeGame(gameId: string): boolean {
  return FREE_GAME_IDS.includes(gameId);
}

/** Boleh dimainkan tanpa login sekarang juga? */
export function isGameUnlocked(gameId: string): boolean {
  return getLockMode() === 'buka' || isFreeGame(gameId);
}

// --- Mode penguji (menampilkan saklar) --------------------------------------

/**
 * Saklar hanya muncul untuk penguji, bukan untuk orang tua pembeli.
 * Aktif kalau: dev server, ATAU pernah membuka URL `?test=1`.
 */
export function isTestMode(): boolean {
  if (import.meta.env.DEV) return true;
  return read(TEST_KEY) === '1';
}

export function setTestMode(on: boolean): void {
  write(TEST_KEY, on ? '1' : null);
  emit();
}

/**
 * Baca `?test=1` / `?test=0` dari URL. Dipanggil sekali saat app start.
 * Dicek di search maupun di dalam hash, karena build Pages pakai HashRouter
 * (`/#/portal?test=1`).
 */
export function syncTestModeFromUrl(): void {
  try {
    const { search, hash } = window.location;
    const q = hash.includes('?') ? hash.slice(hash.indexOf('?')) : '';
    const value =
      new URLSearchParams(search).get('test') ?? new URLSearchParams(q).get('test');
    if (value === '1') setTestMode(true);
    else if (value === '0') setTestMode(false);
  } catch {
    /* URL aneh — abaikan */
  }
}

// --- Notifikasi perubahan (supaya UI ikut berubah tanpa reload) --------------

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => {
    fn();
  });
}

export function subscribeAccess(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
