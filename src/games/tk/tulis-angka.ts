import type { GameConfig, LevelSlot } from '@/engine/core/types';

/** Number names 1–20 for the narrated instruction. */
const NAMES = [
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
  'dua belas',
  'tiga belas',
  'empat belas',
  'lima belas',
  'enam belas',
  'tujuh belas',
  'delapan belas',
  'sembilan belas',
  'dua puluh',
];

// Pool of all numbers 1–20 (ids kept as l1… so existing star progress stays).
const levels: LevelSlot<'tracing'>[] = NAMES.map((name, i) => ({
  id: `l${i + 1}`,
  narration: `Tulis angka ${name} dengan jarimu!`,
  data: { glyph: String(i + 1) },
}));

const config: GameConfig<'tracing'> = {
  id: 'tulis-angka',
  group: 'tk',
  title: 'Tulis Angka',
  emoji: '✏️',
  template: 'tracing',
  // 20 angka di kolam soal; tiap sesi main mengambil 7 angka acak.
  sessionLevels: 7,
  levels,
};

export default config;
