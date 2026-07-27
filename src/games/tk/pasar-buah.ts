import type { MixedGameConfig, MixedLevel, MixedSlot } from '@/engine/core/types';

/**
 * "Pasar Buah" — the TK fruit world. Ported from Petualangan Pintar (Kenali
 * Buah) and, since 2026-07-26, MERGED with the old standalone game "Hitung
 * Buah": its counting levels now live here as extra variants, so one fruit
 * world holds every fruit question type instead of two thin games.
 *
 * Flow (one question type per slot):
 *   1–3  Beli Buah      → count-tap (tap N of a fruit among decoys)
 *   4    Tebak Buah     → tap-answer (pick the named fruit)
 *   5    Tebak Bayangan → tap-answer with a silhouette picture
 *   6–7  Keranjang Warna → drag-drop (sort fruit into color baskets)
 *   8    Kartu Buah     → memory (match fruit pairs)
 *
 * Every slot holds a POOL of interchangeable variants; the engine draws one
 * per slot on each play and on "Main Lagi" (see `LevelSlot` in
 * `engine/core/types.ts`), so the game stays fresh with many more fruit
 * references than before. Variants inside a slot share one id — the star is
 * per slot, not per variant.
 *
 * Design rule (CLAUDE.md): counting boards mix 2–3 decoy fruit kinds AND show
 * more targets than asked, so the child must recognize the right fruit and
 * stop counting at the asked number; multiple-choice decoys are other real
 * fruits.
 */

interface Fruit {
  /** Emoji shown on boards and cards. */
  e: string;
  /** Indonesian name, used in the spoken narration. */
  n: string;
}

// Basket colors deliberately never pit yellow against orange in one level —
// on a small phone screen those two read as the same color.
const F = {
  apel: { e: '🍎', n: 'apel' },
  pisang: { e: '🍌', n: 'pisang' },
  jeruk: { e: '🍊', n: 'jeruk' },
  anggur: { e: '🍇', n: 'anggur' },
  stroberi: { e: '🍓', n: 'stroberi' },
  semangka: { e: '🍉', n: 'semangka' },
  mangga: { e: '🥭', n: 'mangga' },
  nanas: { e: '🍍', n: 'nanas' },
  pir: { e: '🍐', n: 'pir' },
  kiwi: { e: '🥝', n: 'kiwi' },
  melon: { e: '🍈', n: 'melon' },
  ceri: { e: '🍒', n: 'ceri' },
  lemon: { e: '🍋', n: 'lemon' },
  alpukat: { e: '🥑', n: 'alpukat' },
} satisfies Record<string, Fruit>;

const WORDS = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan'];
const say = (n: number) => WORDS[n] ?? String(n);

/* ---------- Variant builders (id filled in by slot()) ---------- */

/** Beli Buah: tap `ask` of a fruit; `extra` more targets than asked sit on the board. */
function buy(target: Fruit, ask: number, extra: number, decoys: [Fruit, number][]): MixedLevel {
  return {
    id: '',
    template: 'count-tap',
    narration: `Ibu mau beli ${say(ask)} ${target.n}. Ketuk ${say(ask)} ${target.n}!`,
    data: {
      ask,
      target: { emoji: target.e, label: target.n },
      targetCount: ask + extra,
      decoys: decoys.map(([f, count]) => ({ emoji: f.e, count })),
    },
  };
}

/** Tebak Buah: pick the named fruit among other real fruits. */
function guess(target: Fruit, ...decoys: Fruit[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Mana ${target.n}? Ayo sentuh!`,
    data: {
      choices: [
        { id: 'a', emoji: target.e, correct: true },
        ...decoys.map((f, i) => ({ id: `d${i}`, emoji: f.e })),
      ],
    },
  };
}

/** Tebak Bayangan: the cue is drawn as a dark silhouette of the answer. */
function shadow(target: Fruit, ...decoys: Fruit[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: 'Lihat bayangan ini. Buah apa ya? Sentuh yang sama!',
    data: {
      picture: target.e,
      silhouette: true,
      choices: [
        { id: 'a', emoji: target.e, correct: true },
        ...decoys.map((f, i) => ({ id: `d${i}`, emoji: f.e })),
      ],
    },
  };
}

/** Color of a basket: label + the colored circle shown on it. */
const COLORS = {
  merah: '🔴',
  kuning: '🟡',
  hijau: '🟢',
  oranye: '🟠',
  ungu: '🟣',
} satisfies Record<string, string>;

type ColorId = keyof typeof COLORS;

/**
 * Keranjang Warna: one fruit per basket — the drag-drop template pairs 1:1,
 * so each level uses distinct colors.
 */
function baskets(...pairs: [ColorId, Fruit][]): MixedLevel {
  return {
    id: '',
    template: 'drag-drop',
    narration: 'Masukkan setiap buah ke keranjang warnanya!',
    data: {
      targets: pairs.map(([c]) => ({
        id: c,
        emoji: COLORS[c],
        label: c[0]!.toUpperCase() + c.slice(1),
      })),
      items: pairs.map(([c, f], i) => ({ id: `i${i}`, emoji: f.e, targetId: c })),
    },
  };
}

/** Kartu Buah: flip and match pairs. */
function cards(...fruits: Fruit[]): MixedLevel {
  return {
    id: '',
    template: 'memory',
    narration: 'Balik kartunya. Cari dua buah yang sama!',
    data: { pairs: fruits.map((f) => ({ id: f.n, emoji: f.e })) },
  };
}

/** Give every variant in a slot the same stable id (star is per-slot). */
function slot(id: string, ...variants: MixedLevel[]): MixedSlot {
  return variants.map((v) => ({ ...v, id }));
}

const config: MixedGameConfig = {
  id: 'pasar-buah',
  group: 'tk',
  title: 'Pasar Buah',
  emoji: '🍉',
  template: 'mixed',
  freeDemo: true,
  levels: [
    // --- Beli Buah (count-tap), easy → hard ---
    // Slot 1 — tap 2–3
    slot(
      'l1',
      buy(F.apel, 3, 2, [
        [F.pisang, 3],
        [F.anggur, 2],
      ]),
      buy(F.apel, 2, 2, [
        [F.pisang, 3],
        [F.anggur, 2],
      ]),
      buy(F.pisang, 3, 2, [
        [F.apel, 3],
        [F.jeruk, 2],
      ]),
      buy(F.stroberi, 2, 2, [
        [F.melon, 2],
        [F.anggur, 3],
      ]),
      buy(F.pir, 3, 1, [
        [F.ceri, 3],
        [F.jeruk, 2],
      ]),
      buy(F.lemon, 2, 3, [
        [F.kiwi, 2],
        [F.semangka, 2],
      ]),
    ),
    // Slot 2 — tap 4
    slot(
      'l2',
      buy(F.jeruk, 4, 2, [
        [F.stroberi, 3],
        [F.melon, 2],
        [F.anggur, 1],
      ]),
      buy(F.semangka, 4, 2, [
        [F.pisang, 2],
        [F.kiwi, 3],
      ]),
      buy(F.mangga, 4, 1, [
        [F.apel, 3],
        [F.anggur, 2],
      ]),
      buy(F.nanas, 4, 2, [
        [F.ceri, 3],
        [F.pir, 2],
      ]),
      buy(F.anggur, 4, 3, [
        [F.jeruk, 2],
        [F.alpukat, 2],
      ]),
      buy(F.kiwi, 4, 2, [
        [F.stroberi, 2],
        [F.pisang, 3],
      ]),
    ),
    // Slot 3 (id l8 — appended after the merge with "Hitung Buah"; kept out of
    // id order so stars earned on the older slots l1–l7 are not lost) — tap 5–6
    slot(
      'l8',
      buy(F.stroberi, 5, 2, [
        [F.anggur, 3],
        [F.jeruk, 2],
      ]),
      buy(F.anggur, 6, 2, [
        [F.apel, 3],
        [F.stroberi, 2],
        [F.pisang, 2],
      ]),
      buy(F.apel, 5, 3, [
        [F.pir, 3],
        [F.melon, 2],
      ]),
      buy(F.pisang, 6, 2, [
        [F.jeruk, 3],
        [F.kiwi, 2],
      ]),
      buy(F.ceri, 5, 2, [
        [F.lemon, 3],
        [F.alpukat, 2],
      ]),
      buy(F.melon, 6, 1, [
        [F.semangka, 2],
        [F.nanas, 3],
      ]),
    ),
    // --- Tebak Buah (tap-answer) ---
    slot(
      'l3',
      guess(F.mangga, F.pir, F.pisang, F.anggur),
      guess(F.semangka, F.apel, F.melon, F.jeruk),
      guess(F.nanas, F.lemon, F.kiwi, F.stroberi),
      guess(F.anggur, F.ceri, F.pir, F.pisang),
      guess(F.alpukat, F.kiwi, F.apel, F.melon),
      guess(F.stroberi, F.ceri, F.jeruk, F.pir),
    ),
    // --- Tebak Bayangan (tap-answer + siluet) ---
    slot(
      'l4',
      shadow(F.pisang, F.apel, F.anggur),
      shadow(F.nanas, F.pir, F.stroberi),
      shadow(F.anggur, F.jeruk, F.pisang),
      shadow(F.semangka, F.kiwi, F.ceri),
      shadow(F.pir, F.mangga, F.anggur),
      shadow(F.ceri, F.melon, F.pisang),
    ),
    // --- Keranjang Warna (drag-drop), 3 baskets ---
    slot(
      'l5',
      baskets(['merah', F.apel], ['kuning', F.pisang], ['hijau', F.pir]),
      baskets(['merah', F.stroberi], ['ungu', F.anggur], ['hijau', F.kiwi]),
      baskets(['oranye', F.jeruk], ['merah', F.semangka], ['hijau', F.alpukat]),
      baskets(['kuning', F.lemon], ['merah', F.ceri], ['hijau', F.melon]),
    ),
    // --- Keranjang Warna (drag-drop), 4 baskets ---
    slot(
      'l6',
      baskets(['merah', F.semangka], ['oranye', F.jeruk], ['ungu', F.anggur], ['hijau', F.kiwi]),
      baskets(['merah', F.apel], ['kuning', F.pisang], ['ungu', F.anggur], ['hijau', F.pir]),
      baskets(['merah', F.ceri], ['kuning', F.nanas], ['hijau', F.alpukat], ['ungu', F.anggur]),
      baskets(['merah', F.stroberi], ['oranye', F.jeruk], ['hijau', F.melon], ['ungu', F.anggur]),
    ),
    // --- Kartu Buah (memory) ---
    slot(
      'l7',
      cards(F.apel, F.pisang, F.jeruk, F.anggur),
      cards(F.semangka, F.stroberi, F.pir, F.nanas),
      cards(F.mangga, F.kiwi, F.ceri, F.lemon),
      cards(F.melon, F.alpukat, F.apel, F.anggur),
    ),
  ],
};

export default config;
