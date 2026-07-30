import type {
  BoardItemToken,
  MixedGameConfig,
  MixedLevel,
  MixedSlot,
  TapChoice,
} from '@/engine/core/types';

/**
 * "Hitung Hebat" (SD Kelas 1 & 2) — dunia berhitung: dari penjumlahan
 * bergambar sampai bilangan dua digit, uang, dan perkalian sederhana.
 *
 * Bedanya dengan Hutan Hewan (TK): di sini LAMBANG BILANGAN yang jadi
 * bintang utama. Gambar cuma jembatan di slot-slot awal; makin ke belakang
 * anak membaca angkanya langsung — sesuai kelas 1–2 yang sudah kenal simbol.
 *
 * Tiap slot = kolam varian (lihat `LevelSlot` di engine/core/types.ts), jadi
 * "Main Lagi" hampir selalu memberi soal berbeda. `sessionLevels` membuat
 * satu sesi hanya mengambil 8 dari 10 slot, diacak.
 *
 * Aturan yang dipatuhi (CLAUDE.md):
 *   - `equation` HANYA di papan persamaan (tambah/kurang/kali), tidak pernah
 *     di soal "ayo hitung" — di sana angkanya jadi jawaban soal itu sendiri.
 *   - Papan count-tap selalu mencampur 2–3 pengecoh DAN melebihkan jumlah
 *     target dari yang diminta.
 *   - Narasi tidak pernah memuat jawabannya.
 */

/**
 * Gambar yang boleh dipakai di papan: id item registry
 * (`src/engine/ui/items.ts`, semuanya sudah punya seni WebP) + namanya dalam
 * Bahasa Indonesia untuk narasi ("Ada 7 bebek, lalu 3 pulang ke rumah").
 */
interface Pic {
  id: string;
  n: string;
}

const PIC = {
  rabbit: { id: 'rabbit', n: 'kelinci' },
  duck: { id: 'duck', n: 'bebek' },
  frog: { id: 'frog', n: 'katak' },
  cat: { id: 'cat', n: 'kucing' },
  chicken: { id: 'chicken', n: 'ayam' },
  turtle: { id: 'turtle', n: 'kura-kura' },
  panda: { id: 'panda', n: 'panda' },
  penguin: { id: 'penguin', n: 'pinguin' },
  goat: { id: 'goat', n: 'kambing' },
  monkey: { id: 'monkey', n: 'monyet' },
} satisfies Record<string, Pic>;

/** Rumah tujuan di papan pengurangan. */
const HOUSE = 'house';

/** Angka pengecoh: dekat dengan jawaban supaya anak benar-benar menghitung. */
function numberChoices(answer: number, decoys: number[]): TapChoice[] {
  return [
    { id: 'a', text: String(answer), correct: true },
    ...decoys.map((d, i) => ({ id: `d${i}`, text: String(d) })),
  ];
}

/**
 * Papan persamaan teks ("8 + 7 = ?"). `board` dipecah di spasi BIASA jadi
 * token yang tak boleh patah; karena itu tiap ruas direkatkan dengan NBSP
 * (` `). Di layar sempit barisnya patah antara "8 + 7" dan "= ?" saja,
 * tidak pernah di tengah bilangan dan tandanya.
 */
const NB = ' ';

function equationBoard(left: string | number, op: string, right: string | number): string {
  // Ruas PENDEK (bilangan) direkatkan supaya "8 + 7" terbaca sebagai satu
  // kesatuan. Nilai uang tidak: "Rp10.000 + Rp5.000" jadi satu token selebar
  // ±380px dan MELEBARKAN layar HP 360px, jadi biarkan patah di spasi biasa.
  const compact = String(left).length + String(right).length <= 6;
  const sep = compact ? NB : ' ';
  return `${left}${sep}${op}${sep}${right} =${NB}?`;
}

/* ---------- Pembangun varian (id diisi oleh slot()) ---------- */

/** Penjumlahan bergambar: dua kelompok gambar + persamaannya di bawah. */
function addPic(pic: Pic, a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ada ${a} ${pic.n}, datang lagi ${b} ${pic.n}. Berapa semuanya?`,
    data: {
      boardItems: [{ item: pic.id, count: a }, { op: 'plus' }, { item: pic.id, count: b }],
      equation: `${a} + ${b} = ?`,
      choices: numberChoices(a + b, decoys),
    },
  };
}

/** Pengurangan bergambar: sebagian "pulang ke rumah" (pola dari Hutan Hewan). */
function subPic(pic: Pic, a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ada ${a} ${pic.n}, lalu ${b} pulang ke rumah. Berapa yang tersisa?`,
    data: {
      boardItems: [{ item: pic.id, count: a }, { op: 'arrow' }, { item: HOUSE, count: b }],
      equation: `${a} − ${b} = ?`,
      choices: numberChoices(a - b, decoys),
    },
  };
}

/** Soal angka murni (tanpa gambar): papan persamaan + pilihan angka. */
function sum(a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Berapa ${a} tambah ${b}?`,
    data: {
      board: equationBoard(a, '+', b),
      choices: numberChoices(a + b, decoys),
    },
  };
}

function minus(a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Berapa ${a} dikurangi ${b}?`,
    data: {
      board: equationBoard(a, '−', b),
      choices: numberChoices(a - b, decoys),
    },
  };
}

/** Perkalian sebagai penjumlahan berulang — cara kelas 2 mengenalnya. */
function times(pic: Pic, groups: number, per: number, decoys: number[]): MixedLevel {
  const board: BoardItemToken[] = [];
  for (let i = 0; i < groups; i++) {
    if (i > 0) board.push({ op: 'plus' });
    board.push({ item: pic.id, count: per });
  }
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ada ${groups} kelompok ${pic.n}, tiap kelompok isinya ${per}. Berapa semuanya?`,
    data: {
      boardItems: board,
      equation: `${groups} × ${per} = ?`,
      choices: numberChoices(groups * per, decoys),
    },
  };
}

/** Hitung benda di papan (count-tap) — pengecoh wajib, target dilebihkan. */
function count(
  target: { emoji: string; label: string },
  ask: number,
  extra: number,
  decoys: [string, number][],
): MixedLevel {
  return {
    id: '',
    template: 'count-tap',
    narration: `Ketuk ${ask} ${target.label}. Hitung pelan-pelan ya!`,
    data: {
      ask,
      target,
      targetCount: ask + extra,
      decoys: decoys.map(([emoji, c]) => ({ emoji, count: c })),
    },
  };
}

/** Mana yang paling besar / paling kecil? */
function compare(kind: 'besar' | 'kecil', numbers: number[]): MixedLevel {
  const answer = kind === 'besar' ? Math.max(...numbers) : Math.min(...numbers);
  return {
    id: '',
    template: 'tap-answer',
    narration: `Sentuh bilangan yang paling ${kind}!`,
    data: {
      choices: numbers.map((n, i) => ({
        id: `n${i}`,
        text: String(n),
        ...(n === answer ? { correct: true } : {}),
      })),
    },
  };
}

/**
 * Bilangan yang hilang di deret. Tiap bilangan jadi token sendiri supaya
 * deret panjang boleh turun baris di HP kecil, bukan melebarkan layar.
 */
function missing(before: number[], answer: number, after: number[], decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: 'Lihat urutan bilangannya. Bilangan mana yang hilang?',
    data: {
      board: [...before.map(String), '__', ...after.map(String)].join(' '),
      choices: numberChoices(answer, decoys),
    },
  };
}

/** Uang rupiah (kelas 2): jumlahkan dua lembar/keping uang. */
const rp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

function money(a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ibu punya ${rp(a)} dan ${rp(b)}. Berapa uang Ibu semuanya?`,
    data: {
      board: equationBoard(rp(a), '+', rp(b)),
      choices: [
        { id: 'a', text: rp(a + b), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, text: rp(d) })),
      ],
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: MixedLevel[]): MixedSlot {
  return variants.map((v) => ({ ...v, id }));
}

const config: MixedGameConfig = {
  id: 'hitung-hebat',
  group: 'sd1',
  title: 'Hitung Hebat',
  emoji: '🔢',
  template: 'mixed',
  sessionLevels: 8,
  levels: [
    // --- 1. Penjumlahan bergambar (jembatan dari TK) ---
    slot(
      'l1',
      addPic(PIC.rabbit, 4, 3, [6, 8]),
      addPic(PIC.duck, 5, 4, [8, 10]),
      addPic(PIC.frog, 6, 2, [7, 9]),
      addPic(PIC.chicken, 3, 5, [7, 9]),
      addPic(PIC.turtle, 5, 5, [9, 11]),
      addPic(PIC.penguin, 4, 4, [7, 9]),
    ),
    // --- 2. Pengurangan bergambar ---
    slot(
      'l2',
      subPic(PIC.duck, 7, 3, [3, 5]),
      subPic(PIC.cat, 8, 2, [5, 7]),
      subPic(PIC.goat, 6, 4, [1, 3]),
      subPic(PIC.panda, 9, 4, [4, 6]),
      subPic(PIC.monkey, 7, 5, [1, 3]),
      subPic(PIC.rabbit, 8, 5, [2, 4]),
    ),
    // --- 3. Penjumlahan sampai 20 (angka saja) ---
    slot(
      'l3',
      sum(8, 7, [14, 16]),
      sum(9, 6, [14, 16]),
      sum(7, 7, [13, 15]),
      sum(12, 5, [16, 18]),
      sum(9, 9, [17, 19]),
      sum(13, 6, [18, 20]),
      sum(11, 8, [18, 20]),
      sum(6, 9, [14, 16]),
    ),
    // --- 4. Pengurangan sampai 20 (angka saja) ---
    slot(
      'l4',
      minus(15, 6, [8, 10]),
      minus(18, 9, [8, 10]),
      minus(14, 7, [6, 8]),
      minus(20, 8, [11, 13]),
      minus(17, 5, [11, 13]),
      minus(16, 9, [6, 8]),
      minus(13, 4, [8, 10]),
      minus(19, 7, [11, 13]),
    ),
    // --- 5. Bilangan dua digit (kelas 2) ---
    slot(
      'l5',
      sum(23, 14, [36, 38]),
      sum(35, 20, [45, 65]),
      sum(42, 16, [56, 60]),
      minus(46, 15, [21, 41]),
      minus(58, 24, [24, 44]),
      minus(70, 30, [30, 50]),
      sum(27, 13, [30, 50]),
      minus(64, 22, [32, 52]),
    ),
    // --- 6. Hitung benda (count-tap) ---
    slot(
      'l6',
      count({ emoji: '⚽', label: 'bola' }, 6, 2, [
        ['🏀', 3],
        ['🎾', 2],
      ]),
      count({ emoji: '✏️', label: 'pensil' }, 7, 2, [
        ['📕', 2],
        ['📏', 3],
      ]),
      count({ emoji: '🍪', label: 'kue' }, 8, 2, [
        ['🍬', 3],
        ['🍩', 2],
      ]),
      count({ emoji: '🌻', label: 'bunga matahari' }, 5, 3, [
        ['🌷', 3],
        ['🍀', 2],
      ]),
      count({ emoji: '🐟', label: 'ikan' }, 9, 2, [
        ['🐚', 3],
        ['⭐', 2],
      ]),
      count({ emoji: '🚗', label: 'mobil' }, 6, 3, [
        ['🚲', 3],
        ['🛵', 2],
      ]),
    ),
    // --- 7. Membandingkan bilangan ---
    slot(
      'l7',
      compare('besar', [46, 64, 39]),
      compare('kecil', [72, 27, 45]),
      compare('besar', [88, 78, 87]),
      compare('kecil', [31, 13, 30]),
      compare('besar', [55, 45, 54]),
      compare('kecil', [66, 60, 16]),
      compare('besar', [19, 91, 90]),
      compare('kecil', [24, 42, 40]),
    ),
    // --- 8. Bilangan yang hilang ---
    slot(
      'l8',
      missing([11, 12], 13, [14], [15, 31]),
      missing([25, 26], 27, [28], [24, 29]),
      missing([40, 45], 50, [55], [46, 60]),
      missing([2, 4], 6, [8], [5, 7]),
      missing([10, 20], 30, [40], [25, 35]),
      missing([67, 68], 69, [70], [66, 71]),
      missing([5, 10], 15, [20], [12, 16]),
      missing([98, 99], 100, [101], [90, 110]),
    ),
    // --- 9. Perkalian sederhana = penjumlahan berulang (kelas 2) ---
    slot(
      'l9',
      times(PIC.frog, 3, 2, [5, 8]),
      times(PIC.duck, 2, 4, [6, 10]),
      times(PIC.rabbit, 4, 2, [6, 10]),
      times(PIC.chicken, 3, 3, [6, 12]),
      times(PIC.turtle, 2, 5, [7, 12]),
      times(PIC.penguin, 2, 3, [5, 9]),
    ),
    // --- 10. Uang rupiah ---
    slot(
      'l10',
      money(2000, 1000, [2000, 4000]),
      money(5000, 2000, [3000, 8000]),
      money(1000, 500, [2000, 5000]),
      money(10000, 5000, [10500, 20000]),
      money(2000, 2000, [2200, 6000]),
      money(5000, 5000, [5500, 15000]),
    ),
  ],
};

export default config;
