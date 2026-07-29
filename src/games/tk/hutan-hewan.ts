import type { GameConfig, GameLevel, LevelSlot, TapChoice } from '@/engine/core/types';

/**
 * "Hutan Hewan" — ported from the Petualangan Pintar forest world (Ayo
 * Berhitung). Progresses like the source levels: count small → count bigger
 * → addition → subtraction.
 *
 * Each of the 8 slots holds a POOL of interchangeable variants (different
 * animals & numbers). The engine picks one variant per slot every play and
 * on "Main Lagi", so the game never feels repetitive — while every variant
 * stays plain typed data. Animals are kid-favourites (horse, penguin, panda,
 * koala…) and no two adjacent counting boards use the same one.
 *
 * Rendering: every animal has premium AI art (see `src/engine/ui/items.ts`)
 * and renders as a real WebP picture via `boardItems`, so it looks identical
 * on every phone. `boardItems` falls back to the item's emoji only if its
 * image fails to load, so nothing ever renders blank.
 *
 * Design rule: wrong answer options sit close to the right number, so the
 * child must actually count, not guess. Equation boards glue each operator
 * to its group with a non-breaking space so a wrap only breaks between the
 * two halves — never orphaning a lone "= ?".
 */

const NBSP = ' ';

interface Animal {
  /** Emoji shown when the animal has no picture asset (or as image fallback). */
  e: string;
  /** Indonesian name, used in the spoken narration. */
  n: string;
  /** Item id in the registry (`items.ts`) when premium WebP art exists. */
  item?: string;
}

// No dog (per owner). Every animal now has premium WebP art (`item`); the
// emoji `e` is kept only as a load-failure fallback in BoardItemPic.
const A = {
  kuda: { e: '🐴', n: 'kuda', item: 'horse' },
  pinguin: { e: '🐧', n: 'pinguin', item: 'penguin' },
  kelinci: { e: '🐰', n: 'kelinci', item: 'rabbit' },
  kucing: { e: '🐱', n: 'kucing', item: 'cat' },
  panda: { e: '🐼', n: 'panda', item: 'panda' },
  koala: { e: '🐨', n: 'koala', item: 'koala' },
  sapi: { e: '🐮', n: 'sapi', item: 'cow' },
  katak: { e: '🐸', n: 'katak', item: 'frog' },
  zebra: { e: '🦓', n: 'zebra', item: 'zebra' },
  monyet: { e: '🐵', n: 'monyet', item: 'monkey' },
  bebek: { e: '🦆', n: 'bebek', item: 'duck' },
  ayam: { e: '🐔', n: 'ayam', item: 'chicken' },
  singa: { e: '🦁', n: 'singa', item: 'lion' },
  harimau: { e: '🐯', n: 'harimau', item: 'tiger' },
  beruang: { e: '🐻', n: 'beruang', item: 'bear' },
  kambing: { e: '🐐', n: 'kambing', item: 'goat' },
  gajah: { e: '🐘', n: 'gajah', item: 'elephant' },
  jerapah: { e: '🦒', n: 'jerapah', item: 'giraffe' },
  kurakura: { e: '🐢', n: 'kura-kura', item: 'turtle' },
} satisfies Record<string, Animal>;

const WORDS = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan'];
const say = (n: number) => WORDS[n] ?? String(n);

/** Correct number + two near-miss decoys (≥1). */
function numChoices(correct: number): TapChoice[] {
  const opts = new Set<number>([correct]);
  for (const d of [correct + 1, correct - 1, correct + 2, correct - 2]) {
    if (opts.size >= 3) break;
    if (d >= 1) opts.add(d);
  }
  return [...opts].map((n, i) => ({ id: `o${i}`, text: String(n), correct: n === correct }));
}

// Variant builders (id filled in by slot()). Each emits a premium picture
// board (`boardItems`) when the animal has art, else an emoji `board`.
function count(a: Animal, n: number): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ayo hitung! Ada berapa ${a.n}?`,
    data: {
      ...(a.item ? { boardItems: [{ item: a.item, count: n }] } : { board: a.e.repeat(n) }),
      choices: numChoices(n),
    },
  };
}

function add(a: Animal, x: number, y: number): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ayo tambahkan! ${say(x)} ${a.n} ditambah ${say(y)} ${a.n}, jadi berapa semuanya?`,
    data: {
      ...(a.item
        ? {
            boardItems: [
              { item: a.item, count: x },
              { op: 'plus' },
              { item: a.item, count: y },
            ],
            // The sum in numbers under the pictures: the child counts the
            // animals and meets the written symbols for the same question.
            equation: `${x} + ${y} = ?`,
          }
        : { board: `${a.e.repeat(x)}${NBSP}➕ ${a.e.repeat(y)}${NBSP}=${NBSP}❓` }),
      choices: numChoices(x + y),
    },
  };
}

function sub(a: Animal, total: number, leave: number): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ada ${total} ${a.n}. ${say(leave)} ${a.n} pulang ke rumah. Berapa yang masih tinggal?`,
    data: {
      ...(a.item
        ? {
            boardItems: [
              { item: a.item, count: total },
              { op: 'arrow' },
              { item: 'house', count: leave },
            ],
            // Board shows "ducks → houses"; the line below states the same
            // thing in numbers, with a real minus sign.
            equation: `${total} − ${leave} = ?`,
          }
        : { board: `${a.e.repeat(total)} ➡️${NBSP}${'🏠'.repeat(leave)}` }),
      choices: numChoices(total - leave),
    },
  };
}

/** Give every variant in a slot the same stable id (star is per-slot). */
function slot(id: string, ...variants: GameLevel<'tap-answer'>[]): LevelSlot<'tap-answer'> {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'tap-answer'> = {
  id: 'hutan-hewan',
  group: 'tk',
  title: 'Hutan Hewan',
  emoji: '🦁',
  template: 'tap-answer',
  levels: [
    // Slot 1 — count small (2–4)
    slot(
      'l1',
      count(A.kuda, 3),
      count(A.pinguin, 2),
      count(A.kelinci, 4),
      count(A.kucing, 3),
      count(A.ayam, 2),
      count(A.zebra, 4),
    ),
    // Slot 2 — count small-med (3–5)
    slot(
      'l2',
      count(A.panda, 4),
      count(A.koala, 5),
      count(A.bebek, 3),
      count(A.monyet, 5),
      count(A.sapi, 4),
      count(A.katak, 3),
    ),
    // Slot 3 — count bigger (5–7)
    slot(
      'l3',
      count(A.pinguin, 6),
      count(A.singa, 5),
      count(A.harimau, 7),
      count(A.beruang, 6),
      count(A.kambing, 5),
      count(A.ayam, 7),
    ),
    // Slot 4 — addition (sum 4–6)
    slot(
      'l4',
      add(A.kelinci, 2, 3),
      add(A.panda, 3, 3),
      add(A.kucing, 2, 2),
      add(A.bebek, 4, 2),
      add(A.monyet, 3, 2),
      add(A.koala, 1, 4),
    ),
    // Slot 5 — addition (sum 5–8)
    slot(
      'l5',
      add(A.beruang, 4, 3),
      add(A.gajah, 3, 4),
      add(A.jerapah, 5, 3),
      add(A.kuda, 4, 4),
      add(A.singa, 2, 5),
      add(A.harimau, 3, 5),
    ),
    // Slot 6 — subtraction (remain 2–4)
    slot(
      'l6',
      sub(A.ayam, 5, 2),
      sub(A.bebek, 4, 1),
      sub(A.zebra, 6, 2),
      sub(A.kelinci, 5, 1),
      sub(A.kucing, 5, 3),
      sub(A.katak, 4, 2),
    ),
    // Slot 7 — subtraction (remain 3–5)
    slot(
      'l7',
      sub(A.bebek, 7, 3),
      sub(A.pinguin, 6, 2),
      sub(A.monyet, 8, 3),
      sub(A.sapi, 7, 2),
      sub(A.panda, 6, 3),
      sub(A.kuda, 8, 4),
    ),
    // Slot 8 — subtraction, walk/swim home (remain 3–5)
    slot(
      'l8',
      sub(A.kurakura, 6, 2),
      sub(A.bebek, 8, 3),
      sub(A.beruang, 7, 2),
      sub(A.gajah, 7, 3),
      sub(A.jerapah, 8, 4),
      sub(A.singa, 6, 2),
    ),
  ],
};

export default config;
