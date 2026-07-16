// Luar Angkasa — Kenali Huruf! (migrated from petualangan-pintar.html)
import {
  EASY_WORDS, HARD_WORDS, LOWERCASE_CONFUSABLES,
  pick, rand, shuffle,
} from '../_shared/petualangan.js';

const ROUNDS = 5;

function firstLetterRound(words) {
  const word = pick(words);
  const first = word.w[0].toUpperCase();
  const set = new Set([first]);
  while (set.size < 3) set.add(String.fromCharCode(65 + rand(26)));
  return {
    prompt: 'Huruf apa yang hilang?',
    speak: `Lihat gambarnya. Ini ${word.w}. ${word.w}. Huruf apa yang pertama?`,
    stimulusHtml: `
      <div style="font-size:3.5rem">${word.e}</div>
      <div class="stimulus-word">_${word.w.slice(1)}</div>`,
    options: [...set].map((letter) => ({ label: letter, correct: letter === first })),
  };
}

function lowercaseRound() {
  const big = pick(Object.keys(LOWERCASE_CONFUSABLES));
  const [correct, ...wrong] = LOWERCASE_CONFUSABLES[big];
  return {
    prompt: `Mana huruf kecil dari "${big}"?`,
    speak: `Ini huruf ${big} besar. Mana huruf ${big} yang kecil?`,
    stimulusHtml: `<div class="stimulus-letter">${big}</div>`,
    options: shuffle([correct, ...wrong]).map((letter) => ({
      label: letter,
      correct: letter === correct,
    })),
  };
}

export default {
  levels: [
    {
      id: 'huruf-mudah',
      template: 'tap-answer',
      title: '🚀 Huruf Pertama',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, () => firstLetterRound(EASY_WORDS)) }),
    },
    {
      id: 'huruf-kecil',
      template: 'tap-answer',
      title: '🌙 Huruf Besar-Kecil',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, lowercaseRound) }),
    },
    {
      id: 'huruf-sulit',
      template: 'tap-answer',
      title: '🛰️ Kata Antariksa',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, () => firstLetterRound(HARD_WORDS)) }),
    },
  ],
};
