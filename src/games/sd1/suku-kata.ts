import type { GameConfig, GameLevel, TapChoice } from '@/engine/core/types';

/**
 * "Suku Kata" (SD Kelas 1 & 2) — latihan MEMBACA: anak melihat gambar, lalu
 * melengkapi suku kata yang hilang pada tulisan kata itu.
 *
 * Bedanya dengan Taman Huruf (TK): di TK anak mencari HURUF pertama; di sini
 * anak membaca potongan kata (BU-KU, SE-PE-DA) — langkah berikutnya menuju
 * membaca lancar di kelas 1–2.
 *
 * Aturan yang dipatuhi (CLAUDE.md):
 *   - Narasi TIDAK PERNAH menyebut kata atau suku kata jawabannya. Anak
 *     harus mengenali benda di gambar lalu membaca tulisannya — bukan
 *     mencocokkan bunyi yang barusan didengar.
 *   - Pengecoh selalu suku kata MIRIP (beda satu huruf vokal/akhiran), bukan
 *     suku kata acak, supaya benar-benar harus dibaca.
 *
 * Tiap slot berisi kolam varian; `sessionLevels` mengambil 7 dari 8 slot per
 * sesi, jadi tiap main susunan soalnya berbeda.
 */

/** Satu kata: suku katanya + gambar isyaratnya. */
interface Word {
  /** Suku kata dalam HURUF BESAR, mis. ['SE', 'PE', 'DA']. */
  syl: string[];
  emoji: string;
  /** Id item registry (seni WebP) — dipakai lebih dulu daripada `emoji`. */
  item?: string;
}

const w = (emoji: string, ...syl: string[]): Word => ({ syl, emoji });
/** Sama seperti `w`, tapi gambarnya seni WebP (emoji tinggal cadangan). */
const wi = (emoji: string, item: string, ...syl: string[]): Word => ({ syl, emoji, item });

/* --- Kolam kata, dikelompokkan supaya slot yang berbeda memakai tema yang
   berbeda (satu sesi tidak mengulang benda yang sama). --- */

const BENDA: Word[] = [
  wi('📕', 'book', 'BU', 'KU'),
  wi('⚽', 'ball', 'BO', 'LA'),
  wi('🧢', 'cap', 'TO', 'PI'),
  w('👕', 'BA', 'JU'),
  wi('☂️', 'umbrella', 'PA', 'YUNG'),
  wi('🚪', 'door', 'PIN', 'TU'),
  wi('🪑', 'chair', 'KUR', 'SI'),
  wi('🚗', 'car', 'MO', 'BIL'),
  w('🚢', 'KA', 'PAL'),
  w('🔥', 'A', 'PI'),
];

const ALAM: Word[] = [
  wi('🌙', 'moon', 'BU', 'LAN'),
  w('⭐', 'BIN', 'TANG'),
  w('🍃', 'DA', 'UN'),
  wi('🌸', 'flower', 'BU', 'NGA'),
  w('💧', 'A', 'IR'),
  w('⛰️', 'GU', 'NUNG'),
  w('🌧️', 'HU', 'JAN'),
  w('🏖️', 'PAN', 'TAI'),
];

const HEWAN: Word[] = [
  wi('🐮', 'cow', 'SA', 'PI'),
  wi('🐴', 'horse', 'KU', 'DA'),
  wi('🦆', 'duck', 'BE', 'BEK'),
  wi('🐱', 'cat', 'KU', 'CING'),
  wi('🐘', 'elephant', 'GA', 'JAH'),
  w('🐟', 'I', 'KAN'),
  wi('🐔', 'chicken', 'A', 'YAM'),
  wi('🐐', 'goat', 'KAM', 'BING'),
  wi('🐒', 'monkey', 'MO', 'NYET'),
];

const MAKANAN: Word[] = [
  wi('🍚', 'rice', 'NA', 'SI'),
  wi('🍞', 'bread', 'RO', 'TI'),
  wi('🥛', 'milk', 'SU', 'SU'),
  wi('🥚', 'egg', 'TE', 'LUR'),
  wi('🍌', 'banana', 'PI', 'SANG'),
  wi('🍊', 'orange', 'JE', 'RUK'),
  wi('🍇', 'grapes', 'ANG', 'GUR'),
  wi('🍍', 'pineapple', 'NA', 'NAS'),
  wi('🍎', 'apple', 'A', 'PEL'),
  wi('🍉', 'watermelon', 'SE', 'MANG', 'KA'),
];

const PANJANG: Word[] = [
  wi('🚲', 'bicycle', 'SE', 'PE', 'DA'),
  wi('🐰', 'rabbit', 'KE', 'LIN', 'CI'),
  wi('🧸', 'teddy', 'BO', 'NE', 'KA'),
  wi('🚂', 'train', 'KE', 'RE', 'TA'),
  w('👖', 'CE', 'LA', 'NA'),
  wi('🏫', 'school', 'SE', 'KO', 'LAH'),
  wi('🐯', 'tiger', 'HA', 'RI', 'MAU'),
  w('🐊', 'BU', 'A', 'YA'),
  w('🥒', 'MEN', 'TI', 'MUN'),
  w('🪟', 'JEN', 'DE', 'LA'),
  w('✈️', 'PE', 'SA', 'WAT'),
  w('🐙', 'GU', 'RI', 'TA'),
];

/* ---------- Pembangun varian (id diisi oleh slot()) ---------- */

/**
 * Suku kata yang hilang. Papan menampilkan kata dengan satu bagian jadi
 * "__" — mis. "BU-__". Kata tanpa spasi otomatis jadi SATU token papan,
 * jadi tulisannya tidak pernah patah di tengah.
 */
function gap(word: Word, blank: number, decoys: [string, string]): GameLevel<'tap-answer'> {
  const answer = word.syl[blank]!;
  const board = word.syl.map((s, i) => (i === blank ? '__' : s)).join('-');
  const choices: TapChoice[] = [
    { id: 'a', text: answer, correct: true },
    { id: 'b', text: decoys[0] },
    { id: 'c', text: decoys[1] },
  ];
  return {
    id: '',
    narration: 'Lihat gambarnya, lalu baca tulisannya. Suku kata mana yang hilang?',
    data: { picture: word.emoji, pictureItem: word.item, board, choices },
  };
}

/** Berapa suku katanya? Papan menampilkan kata utuh yang sudah dipenggal. */
function howMany(word: Word): GameLevel<'tap-answer'> {
  const n = word.syl.length;
  const decoys = [n - 1, n + 1].filter((d) => d >= 1);
  return {
    id: '',
    narration: 'Baca kata ini pelan-pelan. Ada berapa suku katanya?',
    data: {
      picture: word.emoji,
      pictureItem: word.item,
      board: word.syl.join('-'),
      choices: [
        { id: 'a', text: String(n), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, text: String(d) })),
      ],
    },
  };
}

/**
 * Mana tulisan yang benar? Pengecohnya kata yang sama dengan satu huruf
 * tertukar — latihan mengeja yang teliti, bukan menebak dari bentuk.
 */
function spelling(word: Word, ...wrong: string[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: 'Lihat gambarnya. Tulisan mana yang benar?',
    data: {
      picture: word.emoji,
      pictureItem: word.item,
      choices: [
        { id: 'a', text: word.syl.join(''), correct: true },
        ...wrong.map((s, i) => ({ id: `w${i}`, text: s })),
      ],
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: GameLevel<'tap-answer'>[]): GameLevel<'tap-answer'>[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'tap-answer'> = {
  id: 'suku-kata',
  group: 'sd1',
  title: 'Suku Kata',
  emoji: '📖',
  template: 'tap-answer',
  sessionLevels: 7,
  levels: [
    // --- 1. Dua suku kata, bagian BELAKANG hilang (benda) ---
    slot(
      'l1',
      gap(BENDA[0]!, 1, ['KA', 'KO']), // BU-KU
      gap(BENDA[1]!, 1, ['LU', 'LI']), // BO-LA
      gap(BENDA[2]!, 1, ['PA', 'PU']), // TO-PI
      gap(BENDA[3]!, 1, ['JA', 'JI']), // BA-JU
      gap(BENDA[5]!, 1, ['TO', 'TA']), // PIN-TU
      gap(BENDA[7]!, 1, ['BAL', 'BUL']), // MO-BIL
    ),
    // --- 2. Dua suku kata, bagian DEPAN hilang (benda & alam) ---
    slot(
      'l2',
      gap(BENDA[4]!, 0, ['PE', 'PU']), // PA-YUNG
      gap(BENDA[6]!, 0, ['KAR', 'KOR']), // KUR-SI
      gap(BENDA[8]!, 0, ['KO', 'KU']), // KA-PAL
      gap(ALAM[0]!, 0, ['BA', 'BO']), // BU-LAN
      gap(ALAM[1]!, 0, ['BAN', 'BEN']), // BIN-TANG
      gap(ALAM[5]!, 0, ['GA', 'GO']), // GU-NUNG
      gap(ALAM[6]!, 0, ['HA', 'HO']), // HU-JAN
    ),
    // --- 3. Hewan ---
    slot(
      'l3',
      gap(HEWAN[0]!, 1, ['PA', 'PU']), // SA-PI
      gap(HEWAN[1]!, 0, ['KA', 'KO']), // KU-DA
      gap(HEWAN[2]!, 1, ['BAK', 'BOK']), // BE-BEK
      gap(HEWAN[3]!, 1, ['CANG', 'CENG']), // KU-CING
      gap(HEWAN[4]!, 0, ['GO', 'GU']), // GA-JAH
      gap(HEWAN[7]!, 1, ['BANG', 'BUNG']), // KAM-BING
      gap(HEWAN[8]!, 1, ['NYAT', 'NYUT']), // MO-NYET
    ),
    // --- 4. Makanan & buah ---
    slot(
      'l4',
      gap(MAKANAN[0]!, 1, ['SU', 'SO']), // NA-SI
      gap(MAKANAN[1]!, 0, ['RA', 'RU']), // RO-TI
      gap(MAKANAN[3]!, 1, ['LAR', 'LOR']), // TE-LUR
      gap(MAKANAN[4]!, 1, ['SING', 'SUNG']), // PI-SANG
      gap(MAKANAN[5]!, 1, ['RAK', 'ROK']), // JE-RUK
      gap(MAKANAN[7]!, 1, ['NES', 'NIS']), // NA-NAS
      gap(MAKANAN[8]!, 1, ['PAL', 'PIL']), // A-PEL
    ),
    // --- 5. Tiga suku kata, bagian TENGAH hilang ---
    slot(
      'l5',
      gap(PANJANG[0]!, 1, ['PA', 'PI']), // SE-PE-DA
      gap(PANJANG[1]!, 1, ['LAN', 'LUN']), // KE-LIN-CI
      gap(PANJANG[2]!, 1, ['NA', 'NI']), // BO-NE-KA
      gap(PANJANG[3]!, 1, ['RA', 'RI']), // KE-RE-TA
      gap(PANJANG[4]!, 1, ['LI', 'LU']), // CE-LA-NA
      gap(PANJANG[8]!, 1, ['TA', 'TU']), // MEN-TI-MUN
      gap(PANJANG[9]!, 1, ['DA', 'DI']), // JEN-DE-LA
    ),
    // --- 6. Tiga suku kata, bagian DEPAN atau BELAKANG hilang ---
    slot(
      'l6',
      gap(PANJANG[5]!, 2, ['LUH', 'LOH']), // SE-KO-LAH
      gap(PANJANG[6]!, 0, ['HI', 'HU']), // HA-RI-MAU
      gap(PANJANG[7]!, 2, ['YO', 'YU']), // BU-A-YA
      gap(PANJANG[10]!, 2, ['WIT', 'WOT']), // PE-SA-WAT
      gap(PANJANG[11]!, 0, ['GA', 'GO']), // GU-RI-TA
      gap(MAKANAN[9]!, 0, ['SA', 'SI']), // SE-MANG-KA
    ),
    // --- 7. Ada berapa suku katanya? ---
    slot(
      'l7',
      howMany(BENDA[0]!),
      howMany(PANJANG[0]!),
      howMany(HEWAN[3]!),
      howMany(PANJANG[1]!),
      howMany(MAKANAN[9]!),
      howMany(ALAM[1]!),
      howMany(PANJANG[9]!),
      howMany(MAKANAN[4]!),
    ),
    // --- 8. Mana tulisan yang benar? ---
    slot(
      'l8',
      spelling(BENDA[0]!, 'BUKO', 'BOKU'),
      spelling(BENDA[1]!, 'BOLO', 'BALA'),
      spelling(HEWAN[1]!, 'KUDO', 'KODA'),
      spelling(MAKANAN[1]!, 'ROTE', 'RATI'),
      spelling(PANJANG[0]!, 'SEPEDO', 'SEPIDA'),
      spelling(PANJANG[2]!, 'BONIKA', 'BENOKA'),
      spelling(HEWAN[3]!, 'KUCENG', 'KOCING'),
      spelling(MAKANAN[4]!, 'PISENG', 'PESANG'),
    ),
  ],
};

export default config;
