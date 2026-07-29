import type { AnyGameConfig, GroupId, TemplateId } from '@/engine/core/types';

/**
 * Portal-facing game catalog. Metadata lives here (small, in the main
 * bundle); full configs are lazy-loaded chunks so premium content and big
 * level data never sit in the initial JS.
 *
 * CATATAN: status gratis/terkunci TIDAK ada di sini. Sumbernya satu tempat:
 * `src/data/access.ts` (`FREE_GAME_IDS` + mode kunci). Dulu nilainya ditulis
 * dua kali (registry + config game) dan gampang tidak sinkron.
 */
export interface GameMeta {
  id: string;
  group: GroupId;
  title: string;
  emoji: string;
  /** Portal card badge; "mixed" games change question type per level. */
  template: TemplateId | 'mixed';
  load: () => Promise<{ default: AnyGameConfig }>;
}

export const games: GameMeta[] = [
  // --- TK: dunia Petualangan Pintar (Fase 3) ---
  {
    id: 'hutan-hewan',
    group: 'tk',
    title: 'Hutan Hewan',
    emoji: '🦁',
    template: 'tap-answer',
    load: () => import('@/games/tk/hutan-hewan'),
  },
  {
    id: 'taman-huruf',
    group: 'tk',
    title: 'Taman Huruf',
    emoji: '🏕️',
    template: 'mixed',
    load: () => import('@/games/tk/taman-huruf'),
  },
  {
    id: 'labirin-warna',
    group: 'tk',
    title: 'Labirin Warna',
    emoji: '🎨',
    template: 'tap-answer',
    load: () => import('@/games/tk/labirin-warna'),
  },
  {
    id: 'pasar-buah',
    group: 'tk',
    title: 'Pasar Buah',
    emoji: '🍉',
    template: 'mixed',
    load: () => import('@/games/tk/pasar-buah'),
  },
  // --- TK ---
  // "Hitung Buah" dilebur ke Pasar Buah (2026-07-26): soal hitung buah-nya
  // jadi varian slot count-tap di sana, jadi satu dunia buah, referensi lebih
  // banyak.
  {
    id: 'kenal-huruf',
    group: 'tk',
    title: 'Kenal Huruf',
    emoji: '🔤',
    template: 'tap-answer',
    load: () => import('@/games/tk/kenal-huruf'),
  },
  {
    id: 'tulis-angka',
    group: 'tk',
    title: 'Tulis Angka',
    emoji: '✏️',
    template: 'tracing',
    load: () => import('@/games/tk/tulis-angka'),
  },
  {
    id: 'jalan-kendaraan',
    group: 'tk',
    title: 'Jalan Kendaraan',
    emoji: '🚗',
    template: 'path-trace',
    load: () => import('@/games/tk/jalan-kendaraan'),
  },
  {
    id: 'kartu-kembar',
    group: 'tk',
    title: 'Kartu Kembar',
    emoji: '🃏',
    template: 'memory',
    load: () => import('@/games/tk/kartu-kembar'),
  },
  // --- SD Kelas 1 & 2 (group id tetap `sd1`) ---
  {
    id: 'pasang-kata',
    group: 'sd1',
    title: 'Pasang Kata',
    emoji: '🧩',
    template: 'drag-drop',
    load: () => import('@/games/sd1/pasang-kata'),
  },
  {
    id: 'cerita-kancil',
    group: 'sd1',
    title: 'Cerita Si Kancil',
    emoji: '🦌',
    template: 'story-choice',
    load: () => import('@/games/sd1/cerita-kancil'),
  },
  {
    id: 'tambah-tangkas',
    group: 'sd1',
    title: 'Tambah Tangkas',
    emoji: '➕',
    template: 'tap-answer',
    load: () => import('@/games/sd1/tambah-tangkas'),
  },
];

export function gamesForGroup(group: GroupId): GameMeta[] {
  return games.filter((g) => g.group === group);
}

export function findGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
