import type { GameConfig, GameLevel, LevelSlot } from '@/engine/core/types';

/**
 * "Pasang Kata" (SD Kelas 1 & 2) — membaca kata lalu menarikannya ke gambar
 * yang cocok.
 *
 * Bedanya dengan Pasangan Pintar: di sini yang dicocokkan adalah KATA dengan
 * gambar bendanya (latihan membaca); Pasangan Pintar mencari HUBUNGAN antar
 * benda (profesi–alat, lawan kata). Satu slot di sini memang soal hubungan —
 * hewan & makanannya — karena kartunya tetap kata hewan yang harus dibaca.
 *
 * Tiap slot = kolam varian (lihat `LevelSlot` di engine/core/types.ts): satu
 * varian diacak tiap main & tiap "Main Lagi". `sessionLevels: 6` membuat satu
 * sesi mengambil 6 dari 9 slot, jadi dua sesi berturut-turut tidak sama.
 *
 * Aturan gambar (keputusan pemilik 2026-08-01):
 *   - **Kalau bendanya HEWAN, pakai seni yang sudah diimpor** lewat id item
 *     registry (`src/engine/ui/items.ts` → `public/assets/items/*.webp`),
 *     bukan emoji. Emoji hewan berbeda bentuknya di tiap HP; seni WebP sama di
 *     semua perangkat. Benda yang belum punya seni tetap emoji — cukup isi
 *     `item` begitu asetnya masuk.
 *   - `pictureTargets: true` supaya gambarnya besar: di game ini gambar itu
 *     SOALNYA, bukan sekadar label.
 *   - Tidak memakai anjing (lihat Hutan Hewan di CLAUDE.md).
 */

/** Satu pasangan gambar + kata yang harus ditarik ke gambar itu. */
interface Pair {
  word: string;
  /** Id item registry (seni WebP). Dipakai lebih dulu daripada `emoji`. */
  item?: string;
  emoji?: string;
}

/**
 * Soal "tarik kata ke gambarnya".
 *
 * Kartu sengaja DIGESER satu posisi dari kotaknya: kalau kata ke-i selalu
 * sejajar dengan gambar ke-i, anak bisa menebak dari posisi tanpa membaca
 * (pelajaran dari Pasangan Pintar).
 */
function words(...pairs: Pair[]): GameLevel<'drag-drop'> {
  const n = pairs.length;
  return {
    id: '',
    narration: 'Tarik kata ke gambar yang cocok!',
    data: {
      pictureTargets: true,
      targets: pairs.map((p, i) => ({ id: `t${i}`, item: p.item, emoji: p.emoji, label: '?' })),
      items: pairs.map((_, i) => {
        const at = (i + 1) % n;
        return { id: `i${i}`, text: pairs[at]!.word, targetId: `t${at}` };
      }),
    },
  };
}

/** Hewan (kartu bergambar + kata) ditarik ke makanannya. */
function food(
  ...pairs: {
    animal: string;
    word: string;
    food: string;
    /** Id item registry untuk makanannya (seni WebP), kalau ada. */
    foodItem?: string;
    label: string;
  }[]
): GameLevel<'drag-drop'> {
  const n = pairs.length;
  return {
    id: '',
    narration: 'Pasangkan hewan dengan makanannya!',
    data: {
      pictureTargets: true,
      targets: pairs.map((p) => ({ id: p.label, emoji: p.food, item: p.foodItem, label: p.label })),
      items: pairs.map((_, i) => {
        const at = (i + 1) % n;
        const p = pairs[at]!;
        return { id: `i${i}`, item: p.animal, text: p.word, targetId: p.label };
      }),
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: GameLevel<'drag-drop'>[]): LevelSlot<'drag-drop'> {
  return variants.map((v) => ({ ...v, id }));
}

/** Hewan ber-seni: id registry + katanya. */
const A = {
  kucing: { word: 'kucing', item: 'cat' },
  kelinci: { word: 'kelinci', item: 'rabbit' },
  kambing: { word: 'kambing', item: 'goat' },
  panda: { word: 'panda', item: 'panda' },
  harimau: { word: 'harimau', item: 'tiger' },
  gajah: { word: 'gajah', item: 'elephant' },
  kuda: { word: 'kuda', item: 'horse' },
  sapi: { word: 'sapi', item: 'cow' },
  ayam: { word: 'ayam', item: 'chicken' },
  beruang: { word: 'beruang', item: 'bear' },
  monyet: { word: 'monyet', item: 'monkey' },
  zebra: { word: 'zebra', item: 'zebra' },
  jerapah: { word: 'jerapah', item: 'giraffe' },
  singa: { word: 'singa', item: 'lion' },
  koala: { word: 'koala', item: 'koala' },
  bebek: { word: 'bebek', item: 'duck' },
  katak: { word: 'katak', item: 'frog' },
  kura: { word: 'kura-kura', item: 'turtle' },
  pinguin: { word: 'pinguin', item: 'penguin' },
} satisfies Record<string, Pair>;

const config: GameConfig<'drag-drop'> = {
  id: 'pasang-kata',
  group: 'sd1',
  title: 'Pasang Kata',
  emoji: '🧩',
  template: 'drag-drop',
  // 6 soal per sesi, diambil acak dari 9 slot di bawah.
  sessionLevels: 6,
  levels: [
    // --- 1. Hewan berkaki empat (seni WebP) ---
    slot(
      'l1',
      words(A.kucing, { word: 'bola', emoji: '⚽' }, { word: 'buku', emoji: '📖' }),
      words(A.kelinci, A.kambing, A.kucing),
      words(A.panda, A.harimau, A.gajah),
      words(A.kuda, A.sapi, A.kambing),
      words(A.beruang, A.monyet, A.zebra),
      words(A.jerapah, A.singa, A.koala),
    ),
    // --- 2. Benda di sekitar rumah ---
    slot(
      'l2',
      words(
        { word: 'rumah', item: 'house' },
        { word: 'mobil', emoji: '🚗' },
        { word: 'pohon', emoji: '🌳' },
        { word: 'matahari', item: 'sun' },
      ),
      words({ word: 'topi', item: 'cap' }, { word: 'sepatu', emoji: '👟' }, { word: 'payung', emoji: '☂️' }),
      words({ word: 'kursi', emoji: '🪑' }, { word: 'lampu', emoji: '💡' }, { word: 'pintu', emoji: '🚪' }),
      words({ word: 'bunga', emoji: '🌸' }, { word: 'awan', emoji: '☁️' }, { word: 'bintang', emoji: '⭐' }),
      words({ word: 'kunci', emoji: '🔑' }, { word: 'jam', emoji: '⏰' }, { word: 'sapu', emoji: '🧹' }),
    ),
    // --- 3. Hewan & makanannya ---
    slot(
      'l3',
      food(
        { animal: 'rabbit', word: 'kelinci', food: '🥕', label: 'wortel' },
        { animal: 'monkey', word: 'monyet', food: '🍌', foodItem: 'banana', label: 'pisang' },
        { animal: 'goat', word: 'kambing', food: '🌿', label: 'rumput' },
      ),
      food(
        { animal: 'chicken', word: 'ayam', food: '🌽', label: 'jagung' },
        { animal: 'panda', word: 'panda', food: '🎋', label: 'bambu' },
        { animal: 'rabbit', word: 'kelinci', food: '🥕', label: 'wortel' },
      ),
      food(
        { animal: 'bear', word: 'beruang', food: '🍯', label: 'madu' },
        { animal: 'cat', word: 'kucing', food: '🐟', label: 'ikan' },
        { animal: 'cow', word: 'sapi', food: '🌿', label: 'rumput' },
      ),
      food(
        { animal: 'monkey', word: 'monyet', food: '🍌', foodItem: 'banana', label: 'pisang' },
        { animal: 'penguin', word: 'pinguin', food: '🐟', label: 'ikan' },
        { animal: 'horse', word: 'kuda', food: '🌾', label: 'jerami' },
      ),
    ),
    // --- 4. Hewan air & unggas (seni WebP) ---
    slot(
      'l4',
      words(A.bebek, A.katak, A.kura),
      words(A.pinguin, A.bebek, A.ayam),
      words(A.katak, A.kura, A.pinguin),
      words(A.bebek, A.ayam, A.kura, A.katak),
    ),
    // --- 5. Buah ---
    slot(
      'l5',
      words({ word: 'apel', emoji: '🍎', item: 'apple' }, { word: 'pisang', emoji: '🍌', item: 'banana' }, { word: 'jeruk', emoji: '🍊', item: 'orange' }),
      words({ word: 'semangka', emoji: '🍉', item: 'watermelon' }, { word: 'anggur', emoji: '🍇', item: 'grapes' }, { word: 'nanas', emoji: '🍍', item: 'pineapple' }),
      words({ word: 'mangga', emoji: '🥭', item: 'mango' }, { word: 'melon', emoji: '🍈', item: 'melon' }, { word: 'stroberi', emoji: '🍓', item: 'strawberry' }),
      words({ word: 'pir', emoji: '🍐', item: 'pear' }, { word: 'ceri', emoji: '🍒', item: 'cherry' }, { word: 'kelapa', emoji: '🥥' }),
    ),
    // --- 6. Kendaraan ---
    slot(
      'l6',
      words({ word: 'mobil', emoji: '🚗' }, { word: 'bus', emoji: '🚌' }, { word: 'sepeda', emoji: '🚲' }),
      words({ word: 'kereta', emoji: '🚂' }, { word: 'kapal', emoji: '🚢' }, { word: 'pesawat', emoji: '✈️' }),
      words({ word: 'motor', emoji: '🏍️' }, { word: 'truk', emoji: '🚚' }, { word: 'ambulans', emoji: '🚑' }),
      words({ word: 'perahu', emoji: '⛵' }, { word: 'helikopter', emoji: '🚁' }, { word: 'traktor', emoji: '🚜' }),
    ),
    // --- 7. Benda sekolah ---
    slot(
      'l7',
      words({ word: 'buku', emoji: '📖' }, { word: 'pensil', emoji: '✏️' }, { word: 'tas', emoji: '🎒' }),
      words({ word: 'penggaris', emoji: '📏' }, { word: 'krayon', emoji: '🖍️' }, { word: 'gunting', emoji: '✂️' }),
      words({ word: 'globe', emoji: '🌍' }, { word: 'sempoa', emoji: '🧮' }, { word: 'kuas', emoji: '🖌️' }),
    ),
    // --- 8. Makanan & minuman ---
    slot(
      'l8',
      words({ word: 'nasi', emoji: '🍚' }, { word: 'roti', emoji: '🍞' }, { word: 'telur', emoji: '🥚' }),
      words({ word: 'susu', emoji: '🥛' }, { word: 'kue', emoji: '🍪' }, { word: 'es krim', emoji: '🍦' }),
      words({ word: 'mie', emoji: '🍜' }, { word: 'keju', emoji: '🧀' }, { word: 'madu', emoji: '🍯' }),
    ),
    // --- 9. Alat musik & mainan ---
    slot(
      'l9',
      words({ word: 'gitar', emoji: '🎸' }, { word: 'drum', emoji: '🥁' }, { word: 'terompet', emoji: '🎺' }),
      words({ word: 'balon', emoji: '🎈' }, { word: 'layang-layang', emoji: '🪁' }, { word: 'boneka', emoji: '🧸' }),
      words({ word: 'bola', emoji: '⚽' }, { word: 'raket', emoji: '🏸' }, { word: 'sepeda', emoji: '🚲' }),
    ),
  ],
};

export default config;
