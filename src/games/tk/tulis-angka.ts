import type { GameConfig } from '@/engine/core/types';

const config: GameConfig<'tracing'> = {
  id: 'tulis-angka',
  group: 'tk',
  title: 'Tulis Angka',
  emoji: '✏️',
  template: 'tracing',
  freeDemo: true,
  levels: [
    { id: 'l1', narration: 'Tulis angka satu dengan jarimu!', data: { glyph: '1' } },
    { id: 'l2', narration: 'Tulis angka dua dengan jarimu!', data: { glyph: '2' } },
    { id: 'l3', narration: 'Tulis angka tiga dengan jarimu!', data: { glyph: '3' } },
    { id: 'l4', narration: 'Tulis angka empat dengan jarimu!', data: { glyph: '4' } },
    { id: 'l5', narration: 'Tulis angka lima dengan jarimu!', data: { glyph: '5' } },
  ],
};

export default config;
