import type { GameConfig } from '@/engine/core/types';

/**
 * "Hutan Hewan" — ported from the Petualangan Pintar forest world (Ayo
 * Berhitung). Progresses like the source levels: count small → count bigger
 * → addition → subtraction. Every question is a tap-answer over numbers,
 * with a visual board of animals to count and near-miss decoy answers
 * (design rule: the wrong options sit close to the right number so the
 * child must actually count, not guess).
 *
 * Animals are kid-favourites (puppy, kitten, bunny, panda, penguin, chick…)
 * and vary level to level so the board stays fun to look at. In the equation
 * boards each operator is glued to its group with a non-breaking space
 * ( ) and only one normal space is left between the two halves, so a
 * wrap breaks cleanly between them — it never orphans a lone "= ?".
 */
const config: GameConfig<'tap-answer'> = {
  id: 'hutan-hewan',
  group: 'tk',
  title: 'Hutan Hewan',
  emoji: '🦁',
  freeDemo: true,
  template: 'tap-answer',
  levels: [
    {
      id: 'l1',
      narration: 'Ayo hitung! Ada berapa anjing?',
      data: {
        board: '🐶🐶🐶',
        choices: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3', correct: true },
          { id: 'c', text: '4' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Ada berapa kucing?',
      data: {
        board: '🐱🐱🐱🐱',
        choices: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4', correct: true },
          { id: 'c', text: '5' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Hitung baik-baik. Ada berapa pinguin?',
      data: {
        board: '🐧🐧🐧🐧🐧🐧',
        choices: [
          { id: 'a', text: '5' },
          { id: 'b', text: '6', correct: true },
          { id: 'c', text: '7' },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Ayo tambahkan! Dua kelinci, ditambah tiga kelinci, jadi berapa semuanya?',
      data: {
        board: '🐰🐰 ➕ 🐰🐰🐰 = ❓',
        choices: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5', correct: true },
          { id: 'c', text: '6' },
        ],
      },
    },
    {
      id: 'l5',
      narration: 'Tiga panda, ditambah tiga panda, ada berapa semuanya?',
      data: {
        board: '🐼🐼🐼 ➕ 🐼🐼🐼 = ❓',
        choices: [
          { id: 'a', text: '5' },
          { id: 'b', text: '6', correct: true },
          { id: 'c', text: '7' },
        ],
      },
    },
    {
      id: 'l6',
      narration: 'Ada lima anak ayam. Dua anak ayam pulang ke rumah. Berapa yang masih tinggal?',
      data: {
        board: '🐥🐥🐥🐥🐥 ➡️ 🏠🏠',
        choices: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3', correct: true },
          { id: 'c', text: '4' },
        ],
      },
    },
    {
      id: 'l7',
      narration: 'Ada tujuh bebek. Tiga bebek berenang pulang. Berapa yang masih tinggal?',
      data: {
        board: '🦆🦆🦆🦆🦆🦆🦆 ➡️ 🏠🏠🏠',
        choices: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4', correct: true },
          { id: 'c', text: '5' },
        ],
      },
    },
  ],
};

export default config;
