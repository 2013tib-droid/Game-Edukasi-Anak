import type { GameConfig, GameLevel, LevelSlot } from '@/engine/core/types';
import { ALPHABET, letterChoices } from '@/games/tk/letters';

/**
 * "Kenal Huruf" — the pure-letter game: matching a capital to its lowercase
 * twin, both directions. (Questions about *objects* — "what is the first
 * letter of BOLA?", spelling words — live in Taman Huruf.)
 *
 * There is deliberately no "Mana huruf F?" question: the letter would be
 * written in the prompt right above the cards, so a child could match the
 * shape without knowing the letter. Every question shows one form of the
 * letter and asks for the other.
 *
 * One slot per letter A–Z, each holding two interchangeable question
 * types the engine re-rolls every play. `sessionLevels` then draws 8 random
 * letters per session, so a child meets the whole alphabet over time
 * without ever sitting through 26 questions in one sitting.
 */

/** Letters whose stars were saved under the old 5-level ids — keep them. */
const LEGACY_ID: Record<string, string> = { A: 'l1', B: 'l2', M: 'l3', S: 'l4', E: 'l5' };

/**
 * Capital shown, pick its lowercase twin. The instruction never spells out
 * the answer ("Mana huruf f kecil?" would hand it to the child) — it points
 * at the picture cue instead.
 */
function toLower(L: string): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ini huruf besar ${L}. Mana huruf kecilnya?`,
    data: { picture: L, choices: letterChoices(L, { lower: true }) },
  };
}

/** Lowercase shown, pick its capital — the reverse direction. */
function toUpper(L: string): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ini huruf kecil ${L.toLowerCase()}. Mana huruf besarnya?`,
    data: { picture: L.toLowerCase(), choices: letterChoices(L) },
  };
}

// One slot per letter; every variant in a slot shares the slot's id so the
// star belongs to the letter, not to the question type.
const levels: LevelSlot<'tap-answer'>[] = ALPHABET.map((L) => {
  const id = LEGACY_ID[L] ?? `h${L}`;
  return [toLower(L), toUpper(L)].map((v) => ({ ...v, id }));
});

const config: GameConfig<'tap-answer'> = {
  id: 'kenal-huruf',
  group: 'tk',
  title: 'Kenal Huruf',
  emoji: '🔤',
  template: 'tap-answer',
  freeDemo: true,
  // 26 huruf di kolam soal; tiap sesi main mengambil 8 huruf acak.
  sessionLevels: 8,
  levels,
};

export default config;
