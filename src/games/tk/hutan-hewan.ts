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
 * and vary level to level so the board stays fun to look at. The board uses
 * `boardItems` — real picture assets (flat SVG in public/assets/items/)
 * instead of the device emoji font — so a panda looks the same on every
 * phone. Each token is either a group of identical animals ({ item, count })
 * or an operator ({ op }); the template lays out equation boards as
 * "rabbit ×2  +  rabbit ×3  =  ?".
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
        boardItems: [{ item: 'dog', count: 3 }],
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
        boardItems: [{ item: 'cat', count: 4 }],
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
        boardItems: [{ item: 'penguin', count: 6 }],
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
        boardItems: [
          { item: 'rabbit', count: 2 },
          { op: 'plus' },
          { item: 'rabbit', count: 3 },
          { op: 'equals' },
          { op: 'question' },
        ],
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
        boardItems: [
          { item: 'panda', count: 3 },
          { op: 'plus' },
          { item: 'panda', count: 3 },
          { op: 'equals' },
          { op: 'question' },
        ],
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
        boardItems: [
          { item: 'chick', count: 5 },
          { op: 'arrow' },
          { item: 'house', count: 2 },
        ],
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
        boardItems: [
          { item: 'duck', count: 7 },
          { op: 'arrow' },
          { item: 'house', count: 3 },
        ],
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
