import type { GameConfig, GameLevel, LevelSlot, TapChoice } from '@/engine/core/types';

/**
 * "Tambah Tangkas" (SD Kelas 1 & 2) — dunia penjumlahan.
 *
 * Tiap soal SELALU menampilkan persamaan angkanya di layar ("4 + 4 = ?"),
 * bukan cuma dinarasikan: anak kelas 1–2 sedang belajar MEMBACA lambang
 * bilangan dan tanda +, jadi kalimatnya harus terlihat, bukan hanya terdengar.
 * (Keputusan pemilik 2026-08-01 — sebelumnya layar cuma berisi kalimat tanya
 * dan tiga kartu angka, dengan ruang tengah kosong.)
 *
 * Tiap slot = kolam varian (lihat `LevelSlot` di engine/core/types.ts): satu
 * varian diacak tiap main & tiap "Main Lagi". `sessionLevels: 7` membuat satu
 * sesi mengambil 7 dari 10 slot secara acak — jadi 7 soal per sesi, dan dua
 * sesi berturut-turut hampir tak pernah sama.
 *
 * Bedanya dengan Hitung Hebat: di sana campur (kurang, kali, uang, jam
 * bilangan); di sini KHUSUS penjumlahan, tapi ditelusuri sampai tuntas —
 * dari jumlah kecil, dobel, lewat sepuluh, dua digit, tiga bilangan, sampai
 * mencari suku yang hilang.
 *
 * Aturan yang dipatuhi (CLAUDE.md):
 *   - **BATAS BILANGAN 30** (keputusan pemilik 2026-08-01): tak ada bilangan
 *     maupun HASIL yang lebih dari 30 — anak kelas 1–2 baru sampai situ.
 *     Jangan menambah varian seperti "48 + 6" atau "50 + 50" lagi.
 *   - Narasi tidak pernah memuat jawabannya.
 *   - Pengecoh selalu dekat dengan jawaban (beda 1–2, atau hasil salah hitung
 *     yang lazim) supaya anak benar-benar menjumlahkan, bukan menebak.
 *   - Jawaban teks panjang tidak perlu CSS baru — `mainTextClass()` di
 *     TapAnswer sudah mengecilkan sendiri.
 */

/** Pilihan angka: jawaban benar + pengecoh yang dekat. */
function numberChoices(answer: number, decoys: number[]): TapChoice[] {
  return [
    { id: 'a', text: String(answer), correct: true },
    ...decoys.map((d, i) => ({ id: `d${i}`, text: String(d) })),
  ];
}

/** Soal penjumlahan biasa: persamaan di layar + narasi yang membacakannya. */
function sum(a: number, b: number, decoys: number[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Berapa ${a} tambah ${b}?`,
    data: {
      equation: `${a} + ${b} = ?`,
      choices: numberChoices(a + b, decoys),
    },
  };
}

/** Tiga bilangan sekaligus — anak menjumlahkan bertahap dari kiri. */
function sum3(a: number, b: number, c: number, decoys: number[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Berapa ${a} tambah ${b} tambah ${c}?`,
    data: {
      equation: `${a} + ${b} + ${c} = ?`,
      choices: numberChoices(a + b + c, decoys),
    },
  };
}

/**
 * Suku yang hilang: "5 + ? = 9". Narasi sengaja tidak menyebut hasilnya
 * sebagai jawaban — yang ditanyakan justru bilangan di tengah.
 */
function missing(a: number, total: number, decoys: number[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `${a} tambah berapa supaya jadi ${total}?`,
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
function story(text: string, a: number, b: number, decoys: number[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: text,
    data: {
      equation: `${a} + ${b} = ?`,
      choices: numberChoices(a + b, decoys),
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot, bukan per varian. */
function slot(id: string, ...variants: GameLevel<'tap-answer'>[]): LevelSlot<'tap-answer'> {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'tap-answer'> = {
  id: 'tambah-tangkas',
  group: 'sd1',
  title: 'Tambah Tangkas',
  emoji: '➕',
  template: 'tap-answer',
  // 7 soal tiap sesi, diambil acak dari 10 slot di bawah.
  sessionLevels: 7,
  levels: [
    // --- 1. Jumlah kecil, hasil sampai 5 (pemanasan) ---
    slot(
      'l1',
      sum(1, 2, [2, 4]),
      sum(2, 2, [3, 5]),
      sum(2, 3, [4, 6]),
      sum(3, 1, [3, 5]),
      sum(1, 4, [4, 6]),
      sum(2, 1, [4, 5]),
      sum(3, 2, [6, 4]),
      sum(4, 1, [6, 3]),
    ),
    // --- 2. Hasil sampai 10 ---
    slot(
      'l2',
      sum(4, 4, [7, 9]),
      sum(5, 3, [7, 9]),
      sum(6, 2, [7, 9]),
      sum(3, 6, [8, 10]),
      sum(5, 5, [9, 11]),
      sum(7, 2, [8, 10]),
      sum(4, 5, [8, 10]),
      sum(6, 4, [9, 11]),
      sum(2, 7, [8, 10]),
      sum(8, 1, [8, 10]),
    ),
    // --- 3. Bilangan kembar (dobel) — pola yang gampang diingat ---
    slot(
      'l3',
      sum(3, 3, [5, 7]),
      sum(6, 6, [11, 13]),
      sum(7, 7, [12, 15]),
      sum(8, 8, [14, 17]),
      sum(9, 9, [16, 19]),
      sum(10, 10, [18, 21]),
      sum(12, 12, [22, 26]),
      sum(13, 13, [24, 28]),
      sum(15, 15, [25, 29]),
    ),
    // --- 4. Menambah 10 dan 20 (nilai tempat) ---
    slot(
      'l4',
      sum(10, 3, [12, 14]),
      sum(10, 7, [16, 18]),
      sum(10, 9, [18, 20]),
      sum(10, 5, [14, 16]),
      sum(20, 5, [15, 26]),
      sum(20, 8, [18, 29]),
      sum(20, 3, [13, 24]),
      sum(20, 6, [16, 27]),
    ),
    // --- 5. Melewati sepuluh (menyimpan) ---
    slot(
      'l5',
      sum(7, 5, [11, 13]),
      sum(8, 6, [13, 15]),
      sum(9, 4, [12, 14]),
      sum(6, 7, [12, 14]),
      sum(8, 5, [12, 14]),
      sum(9, 8, [16, 18]),
      sum(7, 6, [12, 14]),
      sum(9, 6, [14, 16]),
      sum(8, 7, [14, 16]),
      sum(5, 9, [13, 15]),
    ),
    // --- 6. Bilangan bulat lima & puluhan (sampai 30) ---
    slot(
      'l6',
      sum(10, 20, [20, 25]),
      sum(20, 10, [25, 29]),
      sum(15, 5, [15, 25]),
      sum(5, 15, [10, 25]),
      sum(15, 10, [20, 30]),
      sum(10, 15, [20, 30]),
      sum(25, 5, [20, 29]),
      sum(5, 25, [26, 20]),
    ),
    // --- 7. Dua digit + satu digit ---
    slot(
      'l7',
      sum(13, 4, [16, 18]),
      sum(21, 5, [25, 27]),
      sum(12, 6, [17, 19]),
      sum(24, 3, [26, 28]),
      sum(18, 2, [19, 21]),
      sum(22, 7, [28, 30]),
      sum(16, 3, [18, 20]),
      sum(27, 2, [28, 30]),
      sum(19, 4, [22, 24]),
      sum(25, 4, [28, 30]),
    ),
    // --- 8. Tiga bilangan sekaligus ---
    slot(
      'l8',
      sum3(1, 2, 3, [5, 7]),
      sum3(2, 3, 4, [8, 10]),
      sum3(3, 3, 3, [8, 12]),
      sum3(4, 2, 5, [10, 12]),
      sum3(5, 5, 2, [11, 13]),
      sum3(2, 4, 6, [11, 13]),
      sum3(10, 5, 3, [17, 19]),
      sum3(6, 3, 4, [12, 14]),
    ),
    // --- 9. Suku yang hilang ---
    slot(
      'l9',
      missing(3, 5, [3, 1]),
      missing(4, 9, [4, 6]),
      missing(5, 8, [4, 2]),
      missing(6, 10, [3, 5]),
      missing(7, 12, [4, 6]),
      missing(8, 15, [6, 8]),
      missing(2, 7, [4, 6]),
      missing(10, 16, [5, 7]),
      missing(9, 13, [3, 5]),
    ),
    // --- 10. Soal cerita sehari-hari ---
    slot(
      'l10',
      story('Rani punya 6 kelereng, lalu diberi 5 lagi. Berapa kelerengnya?', 6, 5, [10, 12]),
      story('Di kandang ada 8 ayam, lalu datang 4 lagi. Berapa ayam semuanya?', 8, 4, [11, 13]),
      story('Ibu membeli 12 telur, lalu membeli 6 lagi. Berapa telur Ibu?', 12, 6, [16, 20]),
      story('Budi punya 15 koin, lalu menabung 10 koin lagi. Berapa koin Budi?', 15, 10, [20, 30]),
      story('Di rak ada 9 buku, Kakak menaruh 7 buku lagi. Berapa buku di rak?', 9, 7, [15, 17]),
      story('Ada 18 anak di lapangan, datang 7 anak lagi. Berapa anak semuanya?', 18, 7, [23, 27]),
      story('Andi memetik 14 mangga, Adik memetik 5 mangga. Berapa mangga mereka?', 14, 5, [18, 20]),
      story('Di kolam ada 11 ikan, Ayah menambah 8 ikan. Berapa ikan di kolam?', 11, 8, [18, 20]),
    ),
  ],
};

export default config;
