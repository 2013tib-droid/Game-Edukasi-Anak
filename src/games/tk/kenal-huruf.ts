import type { GameConfig } from '@/engine/core/types';

// Decoy letters are deliberate lookalikes (mixing principle from CLAUDE.md).
const config: GameConfig<'tap-answer'> = {
  id: 'kenal-huruf',
  group: 'tk',
  title: 'Kenal Huruf',
  emoji: '🔤',
  template: 'tap-answer',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration: 'Mana huruf A?',
      data: {
        choices: [
          { id: 'a', text: 'A', correct: true },
          { id: 'b', text: 'V' },
          { id: 'c', text: 'H' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Mana huruf B?',
      data: {
        choices: [
          { id: 'a', text: 'P' },
          { id: 'b', text: 'B', correct: true },
          { id: 'c', text: 'R' },
          { id: 'd', text: 'D' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Mana huruf M?',
      data: {
        choices: [
          { id: 'a', text: 'W' },
          { id: 'b', text: 'N' },
          { id: 'c', text: 'M', correct: true },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Mana huruf S?',
      data: {
        choices: [
          { id: 'a', text: 'S', correct: true },
          { id: 'b', text: 'Z' },
          { id: 'c', text: 'C' },
          { id: 'd', text: 'G' },
        ],
      },
    },
    {
      id: 'l5',
      narration: 'Mana huruf E?',
      data: {
        choices: [
          { id: 'a', text: 'F' },
          { id: 'b', text: 'E', correct: true },
          { id: 'c', text: 'L' },
          { id: 'd', text: 'B' },
        ],
      },
    },
  ],
};

export default config;
