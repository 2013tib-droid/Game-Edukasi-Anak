import type { GameConfig, GameLevel, LevelSlot } from '@/engine/core/types';

/**
 * "Tulis Huruf" (SD Kelas 1 & 2) — menulis huruf A–Z dengan jari, saudara
 * dari Tulis Angka di kelompok TK.
 *
 * Tiap huruf = satu slot berisi dua varian: HURUF BESAR dan huruf kecil.
 * Engine mengacak variannya tiap main, jadi satu huruf tidak selalu muncul
 * dalam bentuk yang sama. `sessionLevels: 7` membuat satu sesi hanya
 * menuliskan 7 huruf acak — 26 huruf sekali duduk terlalu panjang untuk anak.
 *
 * Id slot `hA`–`hZ` (bukan `l1`–`l26`) supaya tidak bentrok dengan bintang
 * game lain kalau nanti isinya dirombak.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Nama huruf saat dinarasikan. Bahasa Indonesia melafalkan huruf berbeda
 * dari bahasa Inggris (C = "ce", G = "ge", Q = "ki"), dan pelafal TTS
 * id-ID membaca huruf tunggal dengan benar — jadi cukup hurufnya saja,
 * tanpa ejaan fonetik buatan yang justru terdengar aneh.
 */
function level(letter: string, lower: boolean): GameLevel<'tracing'> {
  return {
    id: '',
    narration: lower
      ? `Tulis huruf kecil ${letter.toLowerCase()}.`
      : `Tulis huruf besar ${letter}.`,
    data: { glyph: lower ? letter.toLowerCase() : letter },
  };
}

/** Satu huruf = satu slot; variannya bentuk besar dan bentuk kecil. */
function slot(letter: string): LevelSlot<'tracing'> {
  const id = `h${letter}`;
  return [
    { ...level(letter, false), id },
    { ...level(letter, true), id },
  ];
}

const config: GameConfig<'tracing'> = {
  id: 'tulis-huruf',
  group: 'sd1',
  title: 'Tulis Huruf',
  emoji: '🖊️',
  template: 'tracing',
  sessionLevels: 7,
  levels: LETTERS.map(slot),
};

export default config;
