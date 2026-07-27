import type { GameConfig, GameLevel, LevelSlot } from '@/engine/core/types';
import { ALPHABET, letterChoices } from '@/games/tk/letters';

/**
 * "Kenal Huruf" — the pure-letter game: recognizing a letter by name and
 * matching capitals to lowercase. (Questions about *objects* — "what is the
 * first letter of BOLA?", spelling words — live in Taman Huruf.)
 *
 * One slot per letter A–Z, each holding three interchangeable question
 * types the engine re-rolls every play. `sessionLevels` then draws 8 random
 * letters per session, so a child meets the whole alphabet over time
 * without ever sitting through 26 questions in one sitting.
 */

/** Letters whose stars were saved under the old 5-level ids — keep them. */
const LEGACY_ID: Record<string, string> = { A: 'l1', B: 'l2', M: 'l3', S: 'l4', E: 'l5' };

/** "Mana huruf A?" — four uppercase cards, three of them look-alikes. */
function findUpper(L: string): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Mana huruf ${L}?`,
    data: { choices: letterChoices(L, { count: 4 }) },
  };
}

/** Capital shown, pick its lowercase twin. */
function toLower(L: string): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ini huruf ${L} besar. Mana huruf ${L.toLowerCase()} kecil?`,
    data: { picture: L, choices: letterChoices(L, { lower: true }) },
  };
}

/** Lowercase shown, pick its capital — the reverse direction. */
function toUpper(L: string): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Ini huruf ${L.toLowerCase()} kecil. Mana huruf ${L} besar?`,
    data: { picture: L.toLowerCase(), choices: letterChoices(L, { count: 4 }) },
  };
}

// One slot per letter; every variant in a slot shares the slot's id so the
// star belongs to the letter, not to the question type.
const levels: LevelSlot<'tap-answer'>[] = ALPHABET.map((L) => {
  const id = LEGACY_ID[L] ?? `h${L}`;
  return [findUpper(L), toLower(L), toUpper(L)].map((v) => ({ ...v, id }));
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
