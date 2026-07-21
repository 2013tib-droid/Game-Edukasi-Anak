import type { GameConfig } from '@/engine/core/types';

/**
 * "Hutan Hewan" — ported from the Petualangan Pintar forest world (Ayo
 * Berhitung). Progresses like the source levels: count small → count bigger
 * → addition → subtraction. Every question is a tap-answer over numbers,
 * with a visual board of animals to count and near-miss decoy answers
 * (design rule: the wrong options sit close to the right number so the
 * child must actually count, not guess).
 */
const config: GameConfig<'tap-answer'> = {
  id: 'hutan-hewan',
  group: 'tk',
  title: 'Hutan Hewan',
  emoji: '🦁',
  template: 'tap-answer',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      narration: 'Ayo hitung! Ada berapa singa?',
      data: {
        board: '🦁🦁🦁',
        choices: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3', correct: true },
          { id: 'c', text: '4' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Ada berapa kelinci?',
      data: {
        board: '🐰🐰🐰🐰🐰',
        choices: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5', correct: true },
          { id: 'c', text: '6' },
        ],
      },
    },
    {
      id: 'l3',
      narration: 'Hitung baik-baik. Ada berapa katak?',
      data: {
        board: '🐸🐸🐸🐸🐸🐸🐸',
        choices: [
          { id: 'a', text: '6' },
          { id: 'b', text: '7', correct: true },
          { id: 'c', text: '8' },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Ayo tambahkan! Dua monyet, ditambah tiga monyet, jadi berapa semuanya?',
      data: {
        board: '🐵🐵 ➕ 🐵🐵🐵 = ❓',
        choices: [
          { id: 'a', text: '4' },
          { id: 'b', text: '5', correct: true },
          { id: 'c', text: '6' },
        ],
      },
    },
    {
      id: 'l5',
      narration: 'Empat rusa, ditambah tiga rusa, ada berapa semuanya?',
      data: {
        board: '🦌🦌🦌🦌 ➕ 🦌🦌🦌 = ❓',
        choices: [
          { id: 'a', text: '6' },
          { id: 'b', text: '7', correct: true },
          { id: 'c', text: '8' },
        ],
      },
    },
    {
      id: 'l6',
      narration: 'Ada lima bebek. Dua bebek pulang ke rumah. Berapa bebek yang masih tinggal?',
      data: {
        board: '🦆🦆🦆🦆🦆 ➡️ 🏠🏠',
        choices: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3', correct: true },
          { id: 'c', text: '4' },
        ],
      },
    },
    {
      id: 'l7',
      narration: 'Ada tujuh burung. Tiga burung terbang pulang. Berapa yang masih tinggal?',
      data: {
        board: '🐦🐦🐦🐦🐦🐦🐦 ➡️ 🏠🏠🏠',
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
