// Hutan Hewan — Ayo Berhitung! (migrated from petualangan-pintar.html)
import { ANIMALS, pick, rand, numberOptions, repeatEmoji } from '../_shared/petualangan.js';

const ROUNDS = 5;

function countRound(maxCount) {
  const count = 1 + rand(maxCount);
  const animal = pick(ANIMALS);
  return {
    prompt: 'Ada berapa hewan ini?',
    speak: 'Ayo hitung! Ada berapa hewan ini?',
    stimulusHtml: `<div class="stimulus-emoji">${repeatEmoji(animal, count)}</div>`,
    options: numberOptions(count),
  };
}

function addRound() {
  const a = 1 + rand(4);
  const b = 1 + rand(4);
  const animal = pick(ANIMALS);
  return {
    prompt: 'Berapa jumlah semuanya?',
    speak: `Ayo hitung! ${a} tambah ${b} jadi berapa semuanya?`,
    stimulusHtml: `<div class="stimulus-emoji">${repeatEmoji(animal, a)} <b>+</b> ${repeatEmoji(animal, b)} <b>= ?</b></div>`,
    options: numberOptions(a + b),
  };
}

export default {
  levels: [
    {
      id: 'hitung-1-5',
      template: 'tap-answer',
      title: '🐰 Hitung Sampai 5',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, () => countRound(5)) }),
    },
    {
      id: 'hitung-1-9',
      template: 'tap-answer',
      title: '🦁 Hitung Sampai 9',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, () => countRound(9)) }),
    },
    {
      id: 'tambah-tambahan',
      template: 'tap-answer',
      title: '🐘 Tambah-tambahan',
      generate: () => ({ rounds: Array.from({ length: ROUNDS }, addRound) }),
    },
  ],
};
