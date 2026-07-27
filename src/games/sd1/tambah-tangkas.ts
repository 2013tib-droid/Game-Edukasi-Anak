import type { GameConfig } from '@/engine/core/types';

// freeDemo: true — masa pra-rilis: semua game dibuka supaya bisa dicoba
// bebas. Saat launching hanya "Hutan Hewan" yang gratis (lihat CLAUDE.md).
const config: GameConfig<'tap-answer'> = {
  id: 'tambah-tangkas',
  group: 'sd1',
  title: 'Tambah Tangkas',
  emoji: '➕',
  template: 'tap-answer',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration: 'Berapa 2 tambah 3?',
      data: {
        choices: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5', correct: true },
          { id: 'c', text: '6' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Berapa 4 tambah 4?',
      data: {
        choices: [
          { id: 'a', text: '8', correct: true },
          { id: 'b', text: '7' },
          { id: 'c', text: '9' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Berapa 6 tambah 3?',
      data: {
        choices: [
          { id: 'a', text: '8' },
          { id: 'b', text: '10' },
          { id: 'c', text: '9', correct: true },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Berapa 7 tambah 5?',
      data: {
        choices: [
          { id: 'a', text: '12', correct: true },
          { id: 'b', text: '11' },
          { id: 'c', text: '13' },
        ],
      },
    },
  ],
};

export default config;
