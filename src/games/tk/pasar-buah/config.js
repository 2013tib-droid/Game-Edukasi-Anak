// Pasar Buah — Kenali Buah-buahan! (migrated from petualangan-pintar.html)
import { FRUITS, COLORS, pick, rand, shuffle } from '../_shared/petualangan.js';

function distractorCounts(excludeId, kinds, extra) {
  // Owner's design rule: boards always mix in several kinds of distractor
  // fruit — one of each kind, plus `extra` spread randomly among them.
  const others = shuffle(FRUITS.filter((f) => f.id !== excludeId)).slice(0, kinds);
  const counts = {};
  others.forEach((f) => { counts[f.e] = 1; });
  for (let i = 0; i < extra; i += 1) counts[pick(others).e] += 1;
  return counts;
}

function buyRound() {
  const fruit = pick(FRUITS);
  const need = 2 + rand(4); // buy 2-5
  return {
    prompt: `Ketuk ${need} ${fruit.name.toLowerCase()}!`,
    speak: `Ibu mau beli ${need} ${fruit.name}. Ayo ketuk ${need} ${fruit.name}!`,
    target: fruit.e,
    need,
    targetTotal: need + 1 + rand(2), // always MORE targets than asked
    distractors: distractorCounts(fruit.id, 3, 2 + rand(3)),
  };
}

function findAllRound() {
  const fruit = pick(FRUITS);
  const total = 2 + rand(3);
  return {
    prompt: `Ketuk semua ${fruit.name.toLowerCase()}!`,
    speak: `Cari semua ${fruit.name}. Ayo ketuk semuanya!`,
    target: fruit.e,
    need: total,
    targetTotal: total,
    distractors: distractorCounts(fruit.id, 3, 3 + rand(3)),
  };
}

function pickFruitRound() {
  const fruit = pick(FRUITS);
  const others = shuffle(FRUITS.filter((f) => f.id !== fruit.id)).slice(0, 3);
  return {
    prompt: `Sentuh ${fruit.name.toLowerCase()}!`,
    speak: `Mana ${fruit.name}? Ayo sentuh!`,
    options: shuffle([fruit, ...others]).map((f) => ({
      label: f.e,
      correct: f.id === fruit.id,
    })),
  };
}

function shadowRound() {
  const fruit = pick(FRUITS);
  const others = shuffle(FRUITS.filter((f) => f.id !== fruit.id)).slice(0, 2);
  return {
    prompt: 'Bayangan buah apa ini?',
    speak: 'Lihat bayangan ini. Buah apa ya? Sentuh buah yang sama!',
    stimulusHtml: `<div class="stimulus-emoji stimulus-shadow" style="font-size:4rem">${fruit.e}</div>`,
    options: shuffle([fruit, ...others]).map((f) => ({
      label: f.e,
      correct: f.id === fruit.id,
    })),
  };
}

function makeBasketBoard() {
  const sortable = COLORS.filter((c) => FRUITS.filter((f) => f.color === c.id).length >= 2);
  const baskets = shuffle(sortable).slice(0, 3);
  const fruits = shuffle(
    baskets.flatMap((b) => shuffle(FRUITS.filter((f) => f.color === b.id)).slice(0, 2))
  );
  return {
    zones: baskets.map((b) => ({ id: b.id, label: `🧺 ${b.label}`, color: b.hex })),
    items: fruits.map((f) => ({ id: f.id, label: f.e, zone: f.color })),
  };
}

export default {
  levels: [
    {
      id: 'beli-buah',
      template: 'count-tap',
      title: '🛒 Beli Buah',
      generate: () => ({
        rounds: Array.from({ length: 5 }, () => (Math.random() < 0.55 ? buyRound() : findAllRound())),
      }),
    },
    {
      id: 'tebak-buah',
      template: 'tap-answer',
      title: '🍓 Tebak Buah',
      generate: () => ({
        rounds: Array.from({ length: 5 }, () => (Math.random() < 0.5 ? pickFruitRound() : shadowRound())),
      }),
    },
    {
      id: 'keranjang-warna',
      template: 'drag-drop',
      title: '🧺 Keranjang Warna',
      prompt: 'Masukkan buah ke keranjang warnanya!',
      speak: 'Seret buah ke keranjang yang warnanya sama!',
      generate: makeBasketBoard,
    },
    {
      id: 'kartu-buah',
      template: 'memory',
      title: '🃏 Kartu Buah',
      prompt: 'Temukan pasangan buah yang sama!',
      speak: 'Balik kartunya. Cari dua buah yang sama!',
      generate: () => ({ pairs: shuffle(FRUITS).slice(0, 4).map((f) => f.e) }),
    },
  ],
};
