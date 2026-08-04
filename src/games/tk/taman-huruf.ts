import type { MixedGameConfig, MixedLevel, MixedSlot } from '@/engine/core/types';
import { cap, letterChoices } from '@/games/tk/letters';

/**
 * "Taman Huruf" — ported from the Petualangan Pintar letter world, now
 * strictly about OBJECTS: look at a thing, find the letter its name starts
 * with, then spell the whole word. Pure letter drills (find a letter,
 * capital ↔ lowercase) live in Kenal Huruf.
 *
 * Each of the 7 slots holds a pool of variants (different objects) that the
 * engine re-rolls every play, so it stays fresh. Letter decoys are
 * deliberate look-alikes, per the design rule.
 */

/**
 * `item` (optional) is an id in the item registry (`src/engine/ui/items.ts`):
 * when given, the cue is drawn from real premium art instead of the device
 * emoji font, with `emoji` kept as the fallback.
 */
function firstLetter(word: string, emoji: string, item?: string): MixedLevel {
  const w = word.toUpperCase();
  const rest = w.slice(1).split('').join(' ');
  return {
    id: '',
    template: 'tap-answer',
    narration: `Lihat gambarnya. Ini ${cap(word)}. Huruf apa yang pertama?`,
    data: {
      picture: emoji,
      ...(item ? { pictureItem: item } : {}),
      board: `_ ${rest}`,
      choices: letterChoices(w.charAt(0)),
    },
  };
}

function spellWord(word: string, emoji: string, decoys: string[], item?: string): MixedLevel {
  const w = word.toUpperCase();
  return {
    id: '',
    template: 'spell',
    narration: `Ini ${word.toLowerCase()}. Ayo susun hurufnya: ${w.split('').join(', ')}.`,
    data: { word: w, emoji, decoys, ...(item ? { item } : {}) },
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
  levels: [
    // Slot 1 — huruf pertama: benda sehari-hari
    mslot(
      'l1',
      firstLetter('Bola', '⚽'),
      firstLetter('Buku', '📖'),
      firstLetter('Topi', '🧢', 'cap'),
      firstLetter('Kunci', '🔑'),
      firstLetter('Sepatu', '👟'),
      firstLetter('Balon', '🎈'),
      firstLetter('Roti', '🍞'),
      firstLetter('Jam', '⏰'),
    ),
    // Slot 2 — huruf pertama: hewan (seni premium bila tersedia)
    mslot(
      'l2',
      firstLetter('Gajah', '🐘', 'elephant'),
      firstLetter('Jerapah', '🦒', 'giraffe'),
      firstLetter('Kuda', '🐴', 'horse'),
      firstLetter('Sapi', '🐮', 'cow'),
      firstLetter('Bebek', '🦆', 'duck'),
      firstLetter('Panda', '🐼', 'panda'),
      firstLetter('Singa', '🦁', 'lion'),
      firstLetter('Zebra', '🦓', 'zebra'),
      firstLetter('Katak', '🐸', 'frog'),
      firstLetter('Ayam', '🐔', 'chicken'),
    ),
    // Slot 3 — huruf pertama: makanan & buah
    mslot(
      'l3',
      firstLetter('Apel', '🍎', 'apple'),
      firstLetter('Pisang', '🍌', 'banana'),
      firstLetter('Jeruk', '🍊', 'orange'),
      firstLetter('Semangka', '🍉', 'watermelon'),
      firstLetter('Nanas', '🍍', 'pineapple'),
      firstLetter('Wortel', '🥕'),
      firstLetter('Susu', '🥛'),
      firstLetter('Kue', '🎂'),
    ),
    // Slot 4 — huruf pertama: alam & rumah
    mslot(
      'l4',
      firstLetter('Rumah', '🏠'),
      firstLetter('Bulan', '🌙'),
      firstLetter('Matahari', '☀️', 'sun'),
      firstLetter('Bunga', '🌸'),
      firstLetter('Pohon', '🌳'),
      firstLetter('Awan', '☁️'),
      firstLetter('Daun', '🍃'),
      firstLetter('Payung', '☂️'),
    ),
    // Slot 5 — huruf pertama: kendaraan & mainan
    mslot(
      'l5',
      firstLetter('Mobil', '🚗'),
      firstLetter('Sepeda', '🚲'),
      firstLetter('Roket', '🚀'),
      firstLetter('Boneka', '🧸'),
      firstLetter('Kapal', '🚢'),
      firstLetter('Kereta', '🚂'),
      firstLetter('Pesawat', '✈️'),
      firstLetter('Bus', '🚌'),
    ),
    // Slot 6 — susun kata pendek (4 huruf)
    mslot(
      'l6',
      spellWord('BOLA', '⚽', ['E', 'M']),
      spellWord('BUKU', '📖', ['A', 'T']),
      spellWord('IKAN', '🐟', ['O', 'R']),
      spellWord('BUMI', '🌍', ['A', 'S']),
      spellWord('TOPI', '🧢', ['E', 'R'], 'cap'),
      spellWord('ROTI', '🍞', ['A', 'M']),
      spellWord('DAUN', '🍃', ['I', 'K']),
      spellWord('KUDA', '🐴', ['I', 'P'], 'horse'),
      spellWord('SAPI', '🐮', ['E', 'L'], 'cow'),
      spellWord('AYAM', '🐔', ['I', 'B'], 'chicken'),
    ),
    // Slot 7 — susun kata panjang (5 huruf)
    mslot(
      'l7',
      spellWord('ROKET', '🚀', ['B', 'L']),
      spellWord('RUMAH', '🏠', ['I', 'S']),
      spellWord('BUNGA', '🌸', ['E', 'T']),
      spellWord('MOBIL', '🚗', ['A', 'K']),
      spellWord('KAPAL', '🚢', ['I', 'R']),
      spellWord('POHON', '🌳', ['A', 'M']),
      spellWord('BALON', '🎈', ['I', 'S']),
      spellWord('KUNCI', '🔑', ['A', 'T']),
      spellWord('BEBEK', '🦆', ['O', 'R'], 'duck'),
      spellWord('PANDA', '🐼', ['I', 'U'], 'panda'),
      spellWord('SINGA', '🦁', ['E', 'O'], 'lion'),
      spellWord('ZEBRA', '🦓', ['I', 'O'], 'zebra'),
    ),
  ],
};

export default config;
