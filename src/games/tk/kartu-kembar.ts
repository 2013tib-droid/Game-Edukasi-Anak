import type { GameConfig } from '@/engine/core/types';

// freeDemo: true — masa pra-rilis: semua game dibuka supaya bisa dicoba
// bebas. Saat launching hanya "Hutan Hewan" yang gratis (lihat CLAUDE.md).
const config: GameConfig<'memory'> = {
  id: 'kartu-kembar',
  group: 'tk',
  title: 'Kartu Kembar',
  emoji: '🃏',
  template: 'memory',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration: 'Temukan pasangan hewan yang sama!',
      data: {
        pairs: [
          { id: 'kucing', emoji: '🐱' },
          { id: 'anjing', emoji: '🐶' },
          { id: 'kelinci', emoji: '🐰' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Sekarang lebih banyak! Temukan semua pasangannya!',
      data: {
        pairs: [
          { id: 'gajah', emoji: '🐘' },
          { id: 'singa', emoji: '🦁' },
          { id: 'monyet', emoji: '🐵' },
          { id: 'panda', emoji: '🐼' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Level terakhir! Kamu pasti bisa!',
      data: {
        pairs: [
          { id: 'ikan', emoji: '🐠' },
          { id: 'kura', emoji: '🐢' },
          { id: 'gurita', emoji: '🐙' },
          { id: 'kepiting', emoji: '🦀' },
          { id: 'lumba', emoji: '🐬' },
          { id: 'paus', emoji: '🐳' },
        ],
      },
    },
  ],
};

export default config;
