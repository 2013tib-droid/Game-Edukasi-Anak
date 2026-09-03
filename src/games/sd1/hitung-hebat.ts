import type {
  BoardItemToken,
  MixedGameConfig,
  MixedLevel,
  MixedSlot,
  TapChoice,
} from '@/engine/core/types';
import { capitalize, rupiahWords, terbilang } from '@/games/numbers';

/**
 * "Hitung Hebat" (SD Kelas 1 & 2) — dunia berhitung: dari penjumlahan
 * bergambar sampai bilangan dua digit, uang, perkalian, dan seluruh jalur
 * penjumlahan yang dulu bernama "Tambah Tangkas".
 *
 * Bedanya dengan Hutan Hewan (TK): di sini LAMBANG BILANGAN yang jadi
 * bintang utama. Gambar cuma jembatan di slot-slot awal; makin ke belakang
 * anak membaca angkanya langsung — sesuai kelas 1–2 yang sudah kenal simbol.
 *
 * **Tambah Tangkas DILEBUR KE SINI (2026-09-03, permintaan pemilik).** Dulu
 * dua game terpisah yang isinya sama-sama penjumlahan/berhitung — sekarang
 * satu game, satu kartu di portal. Slot `l1`–`l10` = isi Hitung Hebat asli;
 * slot `t1`–`t10` = seluruh isi Tambah Tangkas (persamaan tampil besar di
 * layar lewat field `equation`, bukan `board` — itu yang membedakan fungsi
 * `*Eq()` di bawah dari `sum()`/`minus()` biasa). **Id sengaja dipisah
 * awalan `l`/`t`, bukan dinomori ulang** — bintang lama dipindahkan lewat
 * `migrateMergedMath()` di `progress.ts` (`tambah-tangkas` id `l1`–`l10` →
 * `hitung-hebat` id `t1`–`t10`), pola yang sama dengan peleburan cerita
 * 2026-09-02.
 *
 * Tiap slot = kolam varian (lihat `LevelSlot` di engine/core/types.ts), jadi
 * "Main Lagi" hampir selalu memberi soal berbeda. `sessionLevels: 10`
 * membuat satu sesi mengambil 10 dari 20 slot, diacak — separuh kolam jadi
 * CADANGAN tiap sesi, bukan dibuang.
 *
 * **Diseimbangkan 50:50 gambar vs angka (2026-09-03, keluhan pemilik: "soal
 * masih banyak yg hitung biasa, yg bergambar kurang banyak").** Dulu cuma 4
 * dari 20 slot bergambar (`l1`, `l2`, `l6`, `l9`) — sisanya papan angka
 * polos. Sekarang **10 bergambar : 10 angka**: `l3`, `l4`, `t1`, `t2`, `t4`,
 * `t5` diganti isinya jadi `addPic`/`subPic`/`times`/`count` (id-nya
 * dipertahankan, jadi bintang lama tetap terpakai walau soalnya beda).
 * Angka di slot bergambar sengaja dijaga **≤11** (jumlah maksimum icon yang
 * sudah teruji muat rapi di HP 360px tanpa scroll — lihat riwayat Hutan
 * Hewan "papan 2–11 gambar"), jadi slot yang aslinya berangka besar (sampai
 * 20/30) TIDAK diubah jadi gambar — ikonnya akan terlalu padat. Sisa 10
 * slot angka (`l5`, `l7`, `l8`, `l10`, `t3`, `t6`, `t7`, `t8`, `t9`, `t10`)
 * yang menanggung cakupan kurikulum bilangan besar: dua digit, membandingkan,
 * deret, uang, dobel, puluhan, suku hilang, soal cerita.
 *
 * Aturan yang dipatuhi (CLAUDE.md):
 *   - **BATAS BILANGAN 30** (keputusan pemilik 2026-08-01): bilangan maupun
 *     hasil hitungan tidak pernah lebih dari 30. Satu-satunya pengecualian
 *     adalah slot UANG — nominal rupiah asli (Rp1.000–Rp15.000) tidak bisa
 *     dipaksa ke skala itu.
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

/**
 * Tujuan di papan pengurangan. Yang dihitung selalu HEWAN, jadi kandang —
 * bukan rumah manusia (`house`). Lihat `barn` di `src/engine/ui/items.ts`.
 */
const BARN = 'barn';

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
    narration: `Ada ${terbilang(a)} ${pic.n}, datang lagi ${terbilang(b)} ${pic.n}. Berapa semuanya?`,
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
    narration: `Ada ${terbilang(a)} ${pic.n}, lalu ${terbilang(b)} pulang ke rumah. Berapa yang tersisa?`,
    data: {
      boardItems: [{ item: pic.id, count: a }, { op: 'arrow' }, { item: BARN, count: b }],
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
    narration: `Berapa ${terbilang(a)} tambah ${terbilang(b)}?`,
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
    narration: `Berapa ${terbilang(a)} dikurangi ${terbilang(b)}?`,
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
    narration: `Ada ${terbilang(groups)} kelompok ${pic.n}, tiap kelompok isinya ${terbilang(per)}. Berapa semuanya?`,
    data: {
      boardItems: board,
      equation: `${groups} × ${per} = ?`,
      choices: numberChoices(groups * per, decoys),
    },
  };
}

/** Hitung benda di papan (count-tap) — pengecoh wajib, target dilebihkan. */
function count(
  /** `item` = id item registry (seni WebP); `emoji` tetap jadi cadangan. */
  target: { emoji: string; label: string; item?: string },
  ask: number,
  extra: number,
  decoys: [string, number][],
): MixedLevel {
  return {
    id: '',
    template: 'count-tap',
    narration: `Ketuk ${terbilang(ask)} ${target.label}. Hitung pelan-pelan ya!`,
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

/**
 * Uang rupiah (kelas 2): jumlahkan dua lembar/keping uang. `rp()` = tulisan
 * di papan & kartu jawaban (notasi yang sedang dipelajari anak);
 * `rupiahWords()` = bunyinya dalam narasi, karena angka di narasi dibaca
 * dalam bahasa mesin suaranya.
 */
const rp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

function money(a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Ibu punya ${rupiahWords(a)} dan ${rupiahWords(b)}. Berapa uang Ibu semuanya?`,
    data: {
      board: equationBoard(rp(a), '+', rp(b)),
      choices: [
        { id: 'a', text: rp(a + b), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, text: rp(d) })),
      ],
    },
  };
}

/* ---------- Ported dari Tambah Tangkas (dilebur 2026-09-03) ---------- */

/**
 * Soal penjumlahan angka murni khas Tambah Tangkas: persamaan BESAR lewat
 * `equation` (bukan `board`) — ini yang dulu jadi alasan Tambah Tangkas
 * dirombak 2026-08-01 (layar tengah kosong kalau cuma `board`). `sum()` di
 * atas sengaja tidak dipakai ulang di sini karena field-nya beda.
 */
function sumEq(a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Berapa ${terbilang(a)} tambah ${terbilang(b)}?`,
    data: {
      equation: `${a} + ${b} = ?`,
      choices: numberChoices(a + b, decoys),
    },
  };
}

/** Tiga bilangan sekaligus — anak menjumlahkan bertahap dari kiri. */
function sum3Eq(a: number, b: number, c: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `Berapa ${terbilang(a)} tambah ${terbilang(b)} tambah ${terbilang(c)}?`,
    data: {
      equation: `${a} + ${b} + ${c} = ?`,
      choices: numberChoices(a + b + c, decoys),
    },
  };
}

/**
 * Suku yang hilang: "5 + ? = 9". Narasi sengaja tidak menyebut hasilnya
 * sebagai jawaban — yang ditanyakan justru bilangan di tengah. Beda dari
 * `missing()` di atas (yang mencari bilangan hilang di DERET).
 */
function missingAddend(a: number, total: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: `${capitalize(terbilang(a))} tambah berapa supaya jadi ${terbilang(total)}?`,
    data: {
      equation: `${a} + ? = ${total}`,
      choices: numberChoices(total - a, decoys),
    },
  };
}

/**
 * Soal cerita pendek: konteks sehari-hari dulu, persamaannya tetap tampil di
 * layar supaya anak melihat ceritanya berubah jadi kalimat matematika.
 */
function story(text: string, a: number, b: number, decoys: number[]): MixedLevel {
  return {
    id: '',
    template: 'tap-answer',
    narration: text,
    data: {
      equation: `${a} + ${b} = ?`,
      choices: numberChoices(a + b, decoys),
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
  // 10 soal tiap sesi, diambil acak dari 20 slot (l1–l10 + t1–t10 di bawah).
  sessionLevels: 10,
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
    // --- 3. Penjumlahan bergambar (hasil sampai 11) ---
    slot(
      'l3',
      addPic(PIC.cat, 3, 4, [6, 8]),
      addPic(PIC.goat, 5, 3, [7, 9]),
      addPic(PIC.monkey, 4, 4, [6, 10]),
      addPic(PIC.panda, 6, 3, [8, 10]),
      addPic(PIC.chicken, 5, 4, [7, 11]),
      addPic(PIC.frog, 4, 6, [8, 12]),
      addPic(PIC.rabbit, 5, 5, [9, 11]),
      addPic(PIC.duck, 6, 5, [9, 13]),
    ),
    // --- 4. Pengurangan bergambar (minuend sampai 11) ---
    slot(
      'l4',
      subPic(PIC.chicken, 9, 3, [4, 8]),
      subPic(PIC.frog, 10, 4, [5, 9]),
      subPic(PIC.turtle, 8, 3, [3, 7]),
      subPic(PIC.penguin, 11, 5, [4, 8]),
      subPic(PIC.duck, 9, 6, [1, 5]),
      subPic(PIC.cat, 10, 7, [2, 6]),
      subPic(PIC.goat, 11, 4, [5, 9]),
      subPic(PIC.monkey, 8, 5, [1, 5]),
    ),
    // --- 5. Bilangan dua digit (masih dalam batas 30) ---
    slot(
      'l5',
      sum(13, 14, [26, 28]),
      sum(15, 12, [26, 28]),
      sum(21, 8, [28, 30]),
      minus(26, 15, [10, 12]),
      minus(28, 14, [12, 16]),
      minus(30, 10, [15, 25]),
      sum(17, 13, [28, 29]),
      minus(24, 12, [10, 14]),
    ),
    // --- 6. Hitung benda (count-tap) ---
    slot(
      'l6',
      count({ emoji: '⚽', label: 'bola', item: 'ball' }, 6, 2, [
        ['🏀', 3],
        ['🎾', 2],
      ]),
      count({ emoji: '✏️', label: 'pensil', item: 'pencil' }, 7, 2, [
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
      compare('besar', [16, 24, 19]),
      compare('kecil', [27, 12, 25]),
      compare('besar', [28, 18, 27]),
      compare('kecil', [21, 13, 20]),
      compare('besar', [25, 15, 24]),
      compare('kecil', [26, 20, 16]),
      compare('besar', [19, 21, 20]),
      compare('kecil', [24, 12, 14]),
    ),
    // --- 8. Bilangan yang hilang ---
    slot(
      'l8',
      missing([11, 12], 13, [14], [15, 21]),
      missing([25, 26], 27, [28], [24, 29]),
      missing([14, 15], 16, [17], [13, 18]),
      missing([2, 4], 6, [8], [5, 7]),
      missing([10, 15], 20, [25], [18, 22]),
      missing([27, 28], 29, [30], [26, 24]),
      missing([5, 10], 15, [20], [12, 16]),
      missing([6, 9], 12, [15], [11, 13]),
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
    // ===== Ported dari Tambah Tangkas (2026-09-03) — id awalan `t` =====
    // --- t1. Jumlah kecil bergambar, hasil sampai 5 (pemanasan) ---
    slot(
      't1',
      addPic(PIC.rabbit, 1, 2, [2, 4]),
      addPic(PIC.duck, 2, 2, [3, 5]),
      addPic(PIC.frog, 2, 3, [4, 6]),
      addPic(PIC.cat, 3, 1, [3, 5]),
      addPic(PIC.chicken, 1, 4, [4, 6]),
      addPic(PIC.turtle, 2, 1, [4, 5]),
      addPic(PIC.panda, 3, 2, [6, 4]),
      addPic(PIC.penguin, 4, 1, [6, 3]),
    ),
    // --- t2. Hasil bergambar sampai 10 ---
    slot(
      't2',
      addPic(PIC.goat, 4, 4, [7, 9]),
      addPic(PIC.monkey, 5, 3, [7, 9]),
      addPic(PIC.rabbit, 6, 2, [7, 9]),
      addPic(PIC.duck, 3, 6, [8, 10]),
      addPic(PIC.frog, 5, 5, [9, 11]),
      addPic(PIC.cat, 7, 2, [8, 10]),
      addPic(PIC.chicken, 4, 5, [8, 10]),
      addPic(PIC.turtle, 6, 4, [9, 11]),
      addPic(PIC.panda, 2, 7, [8, 10]),
      addPic(PIC.penguin, 8, 1, [8, 10]),
    ),
    // --- t3. Bilangan kembar (dobel) — pola yang gampang diingat ---
    slot(
      't3',
      sumEq(3, 3, [5, 7]),
      sumEq(6, 6, [11, 13]),
      sumEq(7, 7, [12, 15]),
      sumEq(8, 8, [14, 17]),
      sumEq(9, 9, [16, 19]),
      sumEq(10, 10, [18, 21]),
      sumEq(12, 12, [22, 26]),
      sumEq(13, 13, [24, 28]),
      sumEq(15, 15, [25, 29]),
    ),
    // --- t4. Perkalian bergambar (kelompok kedua) ---
    slot(
      't4',
      times(PIC.cat, 2, 3, [4, 8]),
      times(PIC.goat, 3, 3, [6, 12]),
      times(PIC.monkey, 2, 4, [6, 10]),
      times(PIC.panda, 3, 2, [4, 8]),
      times(PIC.cat, 4, 2, [6, 10]),
      times(PIC.goat, 2, 5, [7, 12]),
    ),
    // --- t5. Hitung benda bergambar (kelompok kedua) ---
    slot(
      't5',
      count({ emoji: '📖', label: 'buku', item: 'book' }, 5, 3, [
        ['🔑', 2],
        ['✏️', 2],
      ]),
      count({ emoji: '🔑', label: 'kunci', item: 'key' }, 7, 2, [
        ['🧸', 2],
        ['🎈', 3],
      ]),
      count({ emoji: '☂️', label: 'payung', item: 'umbrella' }, 6, 3, [
        ['👟', 2],
        ['🎈', 2],
      ]),
      count({ emoji: '👟', label: 'sepatu', item: 'shoe' }, 8, 2, [
        ['🌸', 3],
        ['🎈', 2],
      ]),
      count({ emoji: '🧸', label: 'boneka', item: 'teddy' }, 9, 2, [
        ['🎈', 3],
        ['⭐', 2],
      ]),
      count({ emoji: '🥚', label: 'telur', item: 'egg' }, 6, 3, [
        ['🍞', 2],
        ['🥛', 2],
      ]),
    ),
    // --- t6. Bilangan bulat lima & puluhan (sampai 30) ---
    slot(
      't6',
      sumEq(10, 20, [20, 25]),
      sumEq(20, 10, [25, 29]),
      sumEq(15, 5, [15, 25]),
      sumEq(5, 15, [10, 25]),
      sumEq(15, 10, [20, 30]),
      sumEq(10, 15, [20, 30]),
      sumEq(25, 5, [20, 29]),
      sumEq(5, 25, [26, 20]),
    ),
    // --- t7. Dua digit + satu digit ---
    slot(
      't7',
      sumEq(13, 4, [16, 18]),
      sumEq(21, 5, [25, 27]),
      sumEq(12, 6, [17, 19]),
      sumEq(24, 3, [26, 28]),
      sumEq(18, 2, [19, 21]),
      sumEq(22, 7, [28, 30]),
      sumEq(16, 3, [18, 20]),
      sumEq(27, 2, [28, 30]),
      sumEq(19, 4, [22, 24]),
      sumEq(25, 4, [28, 30]),
    ),
    // --- t8. Tiga bilangan sekaligus ---
    slot(
      't8',
      sum3Eq(1, 2, 3, [5, 7]),
      sum3Eq(2, 3, 4, [8, 10]),
      sum3Eq(3, 3, 3, [8, 12]),
      sum3Eq(4, 2, 5, [10, 12]),
      sum3Eq(5, 5, 2, [11, 13]),
      sum3Eq(2, 4, 6, [11, 13]),
      sum3Eq(10, 5, 3, [17, 19]),
      sum3Eq(6, 3, 4, [12, 14]),
    ),
    // --- t9. Suku yang hilang ---
    slot(
      't9',
      missingAddend(3, 5, [3, 1]),
      missingAddend(4, 9, [4, 6]),
      missingAddend(5, 8, [4, 2]),
      missingAddend(6, 10, [3, 5]),
      missingAddend(7, 12, [4, 6]),
      missingAddend(8, 15, [6, 8]),
      missingAddend(2, 7, [4, 6]),
      missingAddend(10, 16, [5, 7]),
      missingAddend(9, 13, [3, 5]),
    ),
    // --- t10. Soal cerita sehari-hari ---
    slot(
      't10',
      // Bilangannya ditulis dengan KATA: kalimat ini dibacakan, dan angka
      // di narasi terbaca dalam bahasa mesin suaranya. Persamaannya tetap
      // tampil berangka di papan.
      story('Rani punya enam kelereng, lalu diberi lima lagi. Berapa kelerengnya?', 6, 5, [10, 12]),
      story('Di kandang ada delapan ayam, lalu datang empat lagi. Berapa ayam semuanya?', 8, 4, [11, 13]),
      story('Ibu membeli dua belas telur, lalu membeli enam lagi. Berapa telur Ibu?', 12, 6, [16, 20]),
      story('Budi punya lima belas koin, lalu menabung sepuluh koin lagi. Berapa koin Budi?', 15, 10, [20, 30]),
      story('Di rak ada sembilan buku, Kakak menaruh tujuh buku lagi. Berapa buku di rak?', 9, 7, [15, 17]),
      story('Ada delapan belas anak di lapangan, datang tujuh anak lagi. Berapa anak semuanya?', 18, 7, [23, 27]),
      story('Andi memetik empat belas mangga, Adik memetik lima mangga. Berapa mangga mereka?', 14, 5, [18, 20]),
      story('Di kolam ada sebelas ikan, Ayah menambah delapan ikan. Berapa ikan di kolam?', 11, 8, [18, 20]),
    ),
  ],
};

export default config;
