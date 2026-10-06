import type { Place, PlaceCounts } from '@/engine/core/types';

/**
 * Nilai tempat untuk Istana Bilangan (`sd2`): satu tempat yang memecah
 * bilangan jadi ratusan-puluhan-satuan. Dipakai engine (template
 * `place-value`, isyarat `number` di tap-answer) DAN config game, jadi
 * hitungan di soal tak bisa menyimpang dari gambar baloknya.
 */

export const PLACES: Place[] = [100, 10, 1];

/** Kunci `PlaceCounts` untuk tiap nilai tempat. */
export const PLACE_KEY: Record<Place, keyof PlaceCounts> = { 100: 'h', 10: 't', 1: 'o' };

/** Nama nilai tempat untuk layar ("Ratusan"). */
export const PLACE_NAME: Record<Place, string> = { 100: 'Ratusan', 10: 'Puluhan', 1: 'Satuan' };

/** 347 → { h: 3, t: 4, o: 7 }. Hanya 0–999. */
export function countsOf(n: number): PlaceCounts {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`Bilangan di luar 0–999: ${n}`);
  return { h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 };
}

/** { h: 3, t: 4, o: 7 } → 347 (tak harus kanonis: { t: 12 } = 120). */
export function valueOf(c: PlaceCounts): number {
  return c.h * 100 + c.t * 10 + c.o;
}

/** Angka di tempat `place` dari `n` (347, 10 → 4). */
export function digitAt(n: number, place: Place): number {
  return Math.floor(n / place) % 10;
}
