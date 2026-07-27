import type { TapChoice } from '@/engine/core/types';

/**
 * Shared letter data for the TK letter games (Kenal Huruf = pure letters,
 * Taman Huruf = objects/words). Decoys are deliberate look-alikes — the
 * pairs kids actually confuse — so the child must really recognize the
 * letter instead of picking the odd one out (design rule in CLAUDE.md).
 */
export const LOOK: Record<string, string[]> = {
  A: ['E', 'O', 'V'],
  B: ['D', 'P', 'R'],
  C: ['O', 'G', 'Q'],
  D: ['B', 'P', 'O'],
  E: ['F', 'B', 'L'],
  F: ['E', 'T', 'P'],
  G: ['C', 'Q', 'O'],
  H: ['N', 'K', 'M'],
  I: ['L', 'J', 'T'],
  J: ['I', 'L', 'U'],
  K: ['H', 'X', 'R'],
  L: ['I', 'T', 'J'],
  M: ['N', 'W', 'H'],
  N: ['M', 'H', 'Z'],
  O: ['Q', 'C', 'D'],
  P: ['B', 'R', 'F'],
  Q: ['O', 'G', 'C'],
  R: ['P', 'B', 'K'],
  S: ['Z', 'C', 'G'],
  T: ['F', 'L', 'I'],
  U: ['V', 'N', 'J'],
  V: ['U', 'W', 'Y'],
  W: ['M', 'V', 'N'],
  X: ['K', 'Y', 'Z'],
  Y: ['V', 'X', 'T'],
  Z: ['S', 'N', 'X'],
};

/**
 * Look-alike decoys for questions whose cards are LOWERCASE — a different
 * set from the uppercase one, because lowercase letters get confused in
 * other pairs (b/d/p/q, a/e/o, n/m/r, i/j/l). Keyed by uppercase letter.
 */
export const LOOK_LOWER: Record<string, string[]> = {
  A: ['E', 'O', 'C'],
  B: ['D', 'P', 'H'],
  C: ['E', 'O', 'A'],
  D: ['B', 'P', 'G'],
  E: ['C', 'A', 'O'],
  F: ['T', 'L', 'J'],
  G: ['Q', 'Y', 'P'],
  H: ['N', 'B', 'K'],
  I: ['J', 'L', 'T'],
  J: ['I', 'Y', 'G'],
  K: ['H', 'X', 'R'],
  L: ['I', 'T', 'J'],
  M: ['N', 'W', 'H'],
  N: ['M', 'H', 'R'],
  O: ['A', 'C', 'E'],
  P: ['Q', 'B', 'D'],
  Q: ['P', 'G', 'D'],
  R: ['N', 'V', 'X'],
  S: ['Z', 'C', 'E'],
  T: ['F', 'L', 'I'],
  U: ['V', 'N', 'W'],
  V: ['U', 'W', 'Y'],
  W: ['V', 'M', 'U'],
  X: ['K', 'Y', 'Z'],
  Y: ['V', 'G', 'J'],
  Z: ['S', 'X', 'N'],
};

export const ALPHABET = Object.keys(LOOK);

/** "bola" → "Bola" (for narration). */
export const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

/**
 * The correct letter plus look-alike decoys, rendered upper- or lowercase.
 * `count` is the total number of cards (3 by default — three big cards fit
 * one row on a phone). The shell shuffles card order, so position never
 * gives the answer away.
 */
export function letterChoices(
  correct: string,
  opts: { lower?: boolean; count?: number } = {},
): TapChoice[] {
  const { lower = false, count = 3 } = opts;
  const table = lower ? LOOK_LOWER : LOOK;
  const picked = [correct, ...(table[correct] ?? []).slice(0, count - 1)];
  for (const L of ALPHABET) {
    if (picked.length >= count) break;
    if (!picked.includes(L)) picked.push(L);
  }
  return picked.map((L, i) => ({
    id: `o${i}`,
    text: lower ? L.toLowerCase() : L,
    correct: L === correct,
  }));
}
