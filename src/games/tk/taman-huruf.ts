import type { MixedGameConfig, MixedLevel, MixedSlot, TapChoice } from '@/engine/core/types';

/**
 * "Taman Huruf" — ported from the Petualangan Pintar letter world (Kenali
 * Huruf). A mixed game that walks the source level types: first letter of a
 * word → matching a capital to its lowercase → first letter of a longer word
 * → spelling whole words.
 *
 * Like Hutan Hewan, each of the 7 slots holds a pool of variants (different
 * words/letters) that the engine re-rolls every play, so it stays fresh.
 * Decoys are deliberate look-alikes (b/d/p, a/e/o) so the child must really
 * recognize the letter, per the design rule.
 */

// Uppercase look-alike decoys — the tricky pairs kids confuse.
const LOOK: Record<string, string[]> = {
  A: ['E', 'O'],
  B: ['D', 'P'],
  C: ['O', 'G'],
  D: ['B', 'P'],
  E: ['F', 'B'],
  F: ['E', 'T'],
  G: ['C', 'Q'],
  H: ['N', 'K'],
  I: ['L', 'J'],
  J: ['I', 'L'],
  K: ['H', 'X'],
  L: ['I', 'T'],
  M: ['N', 'W'],
  N: ['M', 'H'],
  O: ['Q', 'C'],
  P: ['B', 'R'],
  Q: ['O', 'G'],
  R: ['P', 'B'],
  S: ['Z', 'C'],
  T: ['F', 'L'],
  U: ['V', 'N'],
  V: ['U', 'W'],
  W: ['M', 'V'],
  X: ['K', 'Y'],
  Y: ['V', 'X'],
  Z: ['S', 'N'],
};

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

/** Correct letter + two look-alike decoys, rendered upper- or lowercase. */
function letterChoices(correct: string, lower = false): TapChoice[] {
  const picked = [correct, ...(LOOK[correct] ?? []).slice(0, 2)];
  while (picked.length < 3) {
    const r = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.map((L, i) => ({
    id: `o${i}`,
    text: lower ? L.toLowerCase() : L,
    correct: L === correct,
  }));
}

// Variant builders (id filled in by mslot()).
function firstLetter(word: string, emoji: string): MixedLevel {
  const w = word.toUpperCase();
  const rest = w.slice(1).split('').join(' ');
  return {
    id: '',
    template: 'tap-answer',
    narration: `Lihat gambarnya. Ini ${cap(word)}. Huruf apa yang pertama?`,
    data: { picture: emoji, board: `_ ${rest}`, choices: letterChoices(w.charAt(0)) },
  };
}

function lowerMatch(letter: string): MixedLevel {
  const U = letter.toUpperCase();
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ini huruf ${U} besar. Mana huruf ${U.toLowerCase()} kecil?`,
    data: { picture: U, choices: letterChoices(U, true) },
  };
}

function spellWord(word: string, emoji: string, decoys: string[]): MixedLevel {
  const w = word.toUpperCase();
  return {
    id: '',
    template: 'spell',
    narration: `Ini ${word.toLowerCase()}. Ayo susun hurufnya: ${w.split('').join(', ')}.`,
    data: { word: w, emoji, decoys },
  };
}

/** Give every variant in a slot the same stable id (star is per-slot). */
function mslot(id: string, ...variants: MixedLevel[]): MixedSlot {
  return variants.map((v) => ({ ...v, id }));
}

const config: MixedGameConfig = {
  id: 'taman-huruf',
  group: 'tk',
  title: 'Taman Huruf',
  emoji: '🏕️',
  template: 'mixed',
  freeDemo: true,
  levels: [
    // Slot 1 — first letter (short words)
    mslot(
      'l1',
      firstLetter('Roket', '🚀'),
      firstLetter('Bola', '⚽'),
      firstLetter('Ikan', '🐟'),
      firstLetter('Topi', '👒'),
      firstLetter('Apel', '🍎'),
      firstLetter('Mobil', '🚗'),
    ),
    // Slot 2 — first letter (more short words)
    mslot(
      'l2',
      firstLetter('Bulan', '🌙'),
      firstLetter('Rumah', '🏠'),
      firstLetter('Buku', '📖'),
      firstLetter('Bunga', '🌸'),
      firstLetter('Kunci', '🔑'),
      firstLetter('Sepatu', '👟'),
    ),
    // Slot 3 — match capital to lowercase (look-alikes)
    mslot(
      'l3',
      lowerMatch('A'),
      lowerMatch('B'),
      lowerMatch('D'),
      lowerMatch('E'),
      lowerMatch('M'),
      lowerMatch('R'),
    ),
    // Slot 4 — match capital to lowercase (more)
    mslot(
      'l4',
      lowerMatch('P'),
      lowerMatch('N'),
      lowerMatch('U'),
      lowerMatch('S'),
      lowerMatch('L'),
      lowerMatch('C'),
    ),
    // Slot 5 — first letter (longer words)
    mslot(
      'l5',
      firstLetter('Teleskop', '🔭'),
      firstLetter('Payung', '☂️'),
      firstLetter('Sepeda', '🚲'),
      firstLetter('Gajah', '🐘'),
      firstLetter('Jerapah', '🦒'),
      firstLetter('Matahari', '☀️'),
    ),
    // Slot 6 — spell a short word (4 letters)
    mslot(
      'l6',
      spellWord('BUMI', '🌍', ['A', 'S']),
      spellWord('IKAN', '🐟', ['O', 'R']),
      spellWord('BOLA', '⚽', ['E', 'M']),
      spellWord('BUKU', '📖', ['A', 'T']),
      spellWord('KUDA', '🐴', ['I', 'P']),
      spellWord('SAPI', '🐮', ['E', 'L']),
    ),
    // Slot 7 — spell a longer word (5 letters)
    mslot(
      'l7',
      spellWord('ROKET', '🚀', ['B', 'L']),
      spellWord('RUMAH', '🏠', ['I', 'S']),
      spellWord('BUNGA', '🌸', ['E', 'T']),
      spellWord('MOBIL', '🚗', ['A', 'K']),
      spellWord('BEBEK', '🦆', ['O', 'R']),
      spellWord('PANDA', '🐼', ['I', 'U']),
    ),
  ],
};

export default config;
