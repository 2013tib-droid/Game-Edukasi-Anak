import { terbilang } from '@/games/numbers';

/**
 * Bunyi waktu dalam Bahasa Indonesia — dipakai bersama Jam Pintar (`sd1`) dan
 * Waktu Tepat (`sd2`). Satu tempat, supaya "setengah delapan" tidak pernah
 * berarti dua hal di dua game (docs/rencana-game-sd-kelas-3-4.md, Waktu Tepat:
 * "pindahkan ke modul bersama, jangan disalin").
 *
 * Semua fungsi menerima jam 0–23 ATAU 1–12 dan menyebutnya sebagai jam 12-an
 * ("tujuh"), karena begitulah orang Indonesia menyebut jam di muka jam.
 */

/** Nama jam di muka jam: 7 → "tujuh", 19 → "tujuh", 0 → "dua belas". */
export const hourWord = (h: number) => terbilang(((((h - 1) % 12) + 12) % 12) + 1);

/**
 * Sebutan "setengah" ala Indonesia: 07.30 dibaca "setengah DELAPAN" —
 * setengah jalan MENUJU jam berikutnya, bukan setengah setelah jam ini.
 * `h` = jam yang sedang berjalan (7 untuk 07.30).
 */
export const halfToward = (h: number) => `setengah ${hourWord(h + 1)}`;

/** 07.15 → "tujuh lewat seperempat". */
export const quarterPast = (h: number) => `${hourWord(h)} lewat seperempat`;

/**
 * 06.45 → "tujuh kurang seperempat" — seperempat jam MENUJU jam berikutnya,
 * pasangan dari `halfToward`. `h` = jam yang sedang berjalan (6 untuk 06.45).
 */
export const quarterTo = (h: number) => `${hourWord(h + 1)} kurang seperempat`;

/** Tulisan digital format Indonesia: (7, 5) → "07.05", (19, 30) → "19.30". */
export const digits = (h: number, m: number) =>
  `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
