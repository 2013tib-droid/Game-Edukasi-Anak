import type { AnyGameConfig, GroupId, TemplateId } from '@/engine/core/types';

/**
 * Portal-facing game catalog. Metadata lives here (small, in the main
 * bundle); full configs are lazy-loaded chunks so premium content and big
 * level data never sit in the initial JS.
 */
export interface GameMeta {
  id: string;
  group: GroupId;
  title: string;
  emoji: string;
  /** Portal card badge; "mixed" games change question type per level. */
  template: TemplateId | 'mixed';
  freeDemo: boolean;
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
    freeDemo: true,
    load: () => import('@/games/tk/hutan-hewan'),
  },
  {
    id: 'taman-huruf',
    group: 'tk',
    title: 'Taman Huruf',
    emoji: '🏕️',
    template: 'mixed',
    freeDemo: true,
    load: () => import('@/games/tk/taman-huruf'),
  },
  // --- TK ---
  {
    id: 'hitung-buah',
    group: 'tk',
    title: 'Hitung Buah',
    emoji: '🍎',
    template: 'count-tap',
    freeDemo: true,
    load: () => import('@/games/tk/hitung-buah'),
  },
  {
    id: 'kenal-huruf',
    group: 'tk',
    title: 'Kenal Huruf',
    emoji: '🔤',
    template: 'tap-answer',
    freeDemo: true,
    load: () => import('@/games/tk/kenal-huruf'),
  },
  {
    id: 'tulis-angka',
    group: 'tk',
    title: 'Tulis Angka',
    emoji: '✏️',
    template: 'tracing',
    freeDemo: true,
    load: () => import('@/games/tk/tulis-angka'),
  },
  {
    id: 'kartu-kembar',
    group: 'tk',
    title: 'Kartu Kembar',
    emoji: '🃏',
    template: 'memory',
    freeDemo: false,
    load: () => import('@/games/tk/kartu-kembar'),
  },
  // --- SD Awal ---
  {
    id: 'pasang-kata',
    group: 'sd1',
    title: 'Pasang Kata',
    emoji: '🧩',
    template: 'drag-drop',
    freeDemo: true,
    load: () => import('@/games/sd1/pasang-kata'),
  },
  {
    id: 'cerita-kancil',
    group: 'sd1',
    title: 'Cerita Si Kancil',
    emoji: '🦌',
    template: 'story-choice',
    freeDemo: true,
    load: () => import('@/games/sd1/cerita-kancil'),
  },
  {
    id: 'tambah-tangkas',
    group: 'sd1',
    title: 'Tambah Tangkas',
    emoji: '➕',
    template: 'tap-answer',
    freeDemo: false,
    load: () => import('@/games/sd1/tambah-tangkas'),
  },
];

export function gamesForGroup(group: GroupId): GameMeta[] {
  return games.filter((g) => g.group === group);
}

export function findGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
