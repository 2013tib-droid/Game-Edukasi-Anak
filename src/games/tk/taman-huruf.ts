import type { MixedGameConfig } from '@/engine/core/types';

/**
 * "Taman Huruf" — ported from the Petualangan Pintar letter world (Kenali
 * Huruf). A mixed game: it walks through the source levels' question types
 * inside one adventure — first letter of a word (tap-answer), matching a
 * capital to its lowercase (tap-answer), the first letter of a longer word,
 * then spelling whole words (spell). Decoys are deliberate look-alikes
 * (b/d/p, a/e/o) so the child must really recognize the letter.
 */
const config: MixedGameConfig = {
  id: 'taman-huruf',
  group: 'tk',
  title: 'Taman Huruf',
  emoji: '🏕️',
  template: 'mixed',
  freeDemo: true,
  levels: [
    {
      id: 'l1',
      template: 'tap-answer',
      narration: 'Lihat gambarnya. Ini Roket. Huruf apa yang pertama?',
      data: {
        picture: '🚀',
        board: '_ O K E T',
        choices: [
          { id: 'a', text: 'R', correct: true },
          { id: 'b', text: 'P' },
          { id: 'c', text: 'K' },
        ],
      },
    },
    {
      id: 'l2',
      template: 'tap-answer',
      narration: 'Ini Bulan. Huruf apa yang pertama?',
      data: {
        picture: '🌙',
        board: '_ U L A N',
        choices: [
          { id: 'a', text: 'D' },
          { id: 'b', text: 'B', correct: true },
          { id: 'c', text: 'P' },
        ],
      },
    },
    {
      id: 'l3',
      template: 'tap-answer',
      narration: 'Ini huruf B besar. Mana huruf b kecil?',
      data: {
        picture: 'B',
        choices: [
          { id: 'a', text: 'd' },
          { id: 'b', text: 'b', correct: true },
          { id: 'c', text: 'p' },
        ],
      },
    },
    {
      id: 'l4',
      template: 'tap-answer',
      narration: 'Ini huruf A besar. Mana huruf a kecil?',
      data: {
        picture: 'A',
        choices: [
          { id: 'a', text: 'a', correct: true },
          { id: 'b', text: 'e' },
          { id: 'c', text: 'o' },
        ],
      },
    },
    {
      id: 'l5',
      template: 'tap-answer',
      narration: 'Ini Teleskop. Huruf apa yang pertama?',
      data: {
        picture: '🔭',
        board: '_ E L E S K O P',
        choices: [
          { id: 'a', text: 'F' },
          { id: 'b', text: 'T', correct: true },
          { id: 'c', text: 'L' },
        ],
      },
    },
    {
      id: 'l6',
      template: 'spell',
      narration: 'Ini bumi. Ayo susun hurufnya satu per satu: B, U, M, I.',
      data: {
        word: 'BUMI',
        emoji: '🌍',
        decoys: ['A', 'S'],
      },
    },
    {
      id: 'l7',
      template: 'spell',
      narration: 'Ini roket. Ayo susun hurufnya: R, O, K, E, T.',
      data: {
        word: 'ROKET',
        emoji: '🚀',
        decoys: ['B', 'L'],
      },
    },
  ],
};

export default config;
