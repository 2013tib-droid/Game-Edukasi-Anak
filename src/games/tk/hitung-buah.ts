import type { GameConfig } from '@/engine/core/types';

/**
 * Design rule (CLAUDE.md): every count-tap board mixes 2–3 decoy fruit
 * kinds AND shows more targets than asked, so the child must recognize the
 * right fruit and stop counting at the asked number.
 */
const config: GameConfig<'count-tap'> = {
  id: 'hitung-buah',
  group: 'tk',
  title: 'Hitung Buah',
  emoji: '🍎',
  template: 'count-tap',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration: 'Ketuk 2 apel!',
      data: {
        ask: 2,
        target: { emoji: '🍎', label: 'apel' },
        targetCount: 4,
        decoys: [
          { emoji: '🍌', count: 3 },
          { emoji: '🍇', count: 2 },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Ketuk 3 pisang!',
      data: {
        ask: 3,
        target: { emoji: '🍌', label: 'pisang' },
        targetCount: 5,
        decoys: [
          { emoji: '🍎', count: 3 },
          { emoji: '🍊', count: 2 },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Ketuk 4 jeruk!',
      data: {
        ask: 4,
        target: { emoji: '🍊', label: 'jeruk' },
        targetCount: 6,
        decoys: [
          { emoji: '🍓', count: 3 },
          { emoji: '🍌', count: 2 },
          { emoji: '🍉', count: 1 },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Ketuk 5 stroberi!',
      data: {
        ask: 5,
        target: { emoji: '🍓', label: 'stroberi' },
        targetCount: 7,
        decoys: [
          { emoji: '🍇', count: 3 },
          { emoji: '🍊', count: 2 },
        ],
      },
    },
    {
      id: 'l5',
      narration: 'Ketuk 6 anggur!',
      data: {
        ask: 6,
        target: { emoji: '🍇', label: 'anggur' },
        targetCount: 8,
        decoys: [
          { emoji: '🍎', count: 3 },
          { emoji: '🍓', count: 2 },
          { emoji: '🍌', count: 2 },
        ],
      },
    },
  ],
};

export default config;
