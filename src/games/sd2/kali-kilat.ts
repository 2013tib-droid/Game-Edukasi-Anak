import type { GameConfig, GameLevel, TapChoice } from '@/engine/core/types';
import { terbilang } from '@/games/numbers';

/**
 * "Kali Kilat" (SD Kelas 3 & 4, kelompok `sd2`) — perkalian & pembagian.
 *
 * Game pertama kelompok `sd2` (2026-09-29). Kelompoknya masih `draft` di
 * `src/data/groups.json`, jadi game ini hanya terlihat di dev server & build
 * penguji sampai `sd2` dirilis (lihat "Penamaan Kelompok" di CLAUDE.md).
 *
 * ALUR BELAJAR (satu slot = satu tahap, sejajar dengan urutan kelas 3):
 *   l1  kali = penjumlahan berulang, BERGAMBAR (jembatan dari kelas 2)
 *   l2  tabel 2, 5, 10        l3  tabel 3 & 4
 *   l4  tabel 6 & 7           l5  tabel 8 & 9
 *   l6  kelipatan (2, 4, 6, …)
 *   l7  faktor yang hilang (4 × ? = 24)
 *   l8  bagi rata BERGAMBAR   l9  fakta bagi (24 ÷ 4 = ?)
 *   l10 soal cerita kali      l11 soal cerita bagi
 *   l12 sifat khusus: × 0, × 1, × 10
 *
 * `sessionLevels: 10` mengambil 10 dari 12 slot secara acak, jadi tiap sesi
 * urutannya beda dan dua slot jadi cadangan.
 *
 * ATURAN BILANGAN untuk `sd2` (BUKAN batas 30 milik `sd1`): tabel perkalian
 * penuh sampai 10 × 10, jadi hasil paling besar **100**. Tidak ada bilangan
 * di atas 100.
 *
 * ATURAN NARASI (sama seperti game lain): tidak ada digit — bilangan ditulis
 * dengan `terbilang()`. Angkanya hidup di `equation` / papan, supaya anak
 * MELIHAT lambangnya sambil MENDENGAR katanya.
 *
 * PAPAN BERGAMBAR (l1, l8) dibatasi **9 gambar**: lebih dari itu, kartu jawaban
 * terdorong keluar layar di HP 360×640 ke bawah (terukur; lihat entri di
 * CLAUDE.md). Kalau menambah varian bergambar, jangan melewati batas itu.
 *
 * PENGECOH dihitung, bukan asal: jawaban salah yang PALING sering dibuat anak —
 * menjumlahkan alih-alih mengalikan (a + b), dan salah satu lompatan tabel
 * (a × (b ± 1)). Anak yang menebak dari "bilangan yang kelihatan dekat" jadi
 * tidak otomatis benar.
 */

type Level = GameLevel<'tap-answer'>;

const choices = (answer: number, decoys: number[]): TapChoice[] => [
  { id: 'a', text: String(answer), correct: true },
  ...decoys.map((d, i) => ({ id: `d${i}`, text: String(d) })),
];

/** Dua pengecoh unik, positif, tak sama dengan jawaban, dari daftar kandidat. */
function pickDecoys(answer: number, candidates: number[]): number[] {
  const out: number[] = [];
  for (const c of candidates) {
    if (c > 0 && c <= 100 && c !== answer && !out.includes(c)) out.push(c);
    if (out.length === 2) break;
  }
  return out;
}

/** Pengecoh perkalian a × b: salah jumlah, dan lompatan tabel ke atas/bawah. */
const timesDecoys = (a: number, b: number) =>
  pickDecoys(a * b, [a + b, a * (b + 1), a * (b - 1), (a + 1) * b, a * (b + 2)]);

/** Pengecoh hasil bagi q: tetangganya, dan pembagi/bilangan salah pakai. */
const divideDecoys = (q: number, b: number) =>
  pickDecoys(q, [q + 1, q - 1, q + b, q + 2, b]);

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id }));
}

// --- Fakta perkalian --------------------------------------------------------

function fact(a: number, b: number): Level {
  return {
    id: '',
    narration: `Berapa ${terbilang(a)} kali ${terbilang(b)}?`,
    data: {
      equation: `${a} × ${b} = ?`,
      choices: choices(a * b, timesDecoys(a, b)),
    },
  };
}

/** Faktor yang hilang: a × ? = a·b. Jawabannya b. */
function missing(a: number, b: number): Level {
  const p = a * b;
  return {
    id: '',
    narration: `${capital(terbilang(a))} kali berapa sama dengan ${terbilang(p)}?`,
    data: {
      equation: `${a} × ? = ${p}`,
      choices: choices(b, pickDecoys(b, [b + 1, b - 1, a, b + 2, b - 2])),
    },
  };
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --- Fakta pembagian --------------------------------------------------------

function divide(p: number, b: number): Level {
  const q = p / b;
  return {
    id: '',
    narration: `Berapa ${terbilang(p)} dibagi ${terbilang(b)}?`,
    data: {
      equation: `${p} ÷ ${b} = ?`,
      choices: choices(q, divideDecoys(q, b)),
    },
  };
}

// --- Bergambar --------------------------------------------------------------

interface Pic {
  id: string;
  /** Nama benda, dipakai di kalimat ("Ada tiga kelompok apel"). */
  n: string;
}

/**
 * Penjumlahan berulang: `groups` kelompok berisi `per` benda. Papan hanya
 * SATU baris gambar (kelompok dipisah tanda tambah) — persamaan "3 × 4 = ?"
 * tampil di bawahnya, jadi anak menghubungkan "4 + 4 + 4" dengan "3 × 4".
 */
function groupsOf(pic: Pic, groups: number, per: number): Level {
  const tokens: NonNullable<Level['data']['boardItems']> = [];
  for (let g = 0; g < groups; g++) {
    if (g > 0) tokens.push({ op: 'plus' });
    tokens.push({ item: pic.id, count: per });
  }
  return {
    id: '',
    narration: `Ada ${terbilang(groups)} kelompok ${pic.n}, tiap kelompok ${terbilang(per)}. Berapa semuanya?`,
    data: {
      boardItems: tokens,
      equation: `${groups} × ${per} = ?`,
      choices: choices(groups * per, timesDecoys(groups, per)),
    },
  };
}

/** Bagi rata: `total` benda dibagi ke `into` tempat. Jawabannya per tempat. */
function shareOut(pic: Pic, total: number, into: number, place: string): Level {
  const q = total / into;
  return {
    id: '',
    narration: `Ada ${terbilang(total)} ${pic.n} dibagi rata ke ${terbilang(into)} ${place}. Tiap ${place} dapat berapa?`,
    data: {
      boardItems: [{ item: pic.id, count: total }],
      equation: `${total} ÷ ${into} = ?`,
      choices: choices(q, divideDecoys(q, into)),
    },
  };
}

const APEL = { id: 'apple', n: 'apel' };
const JERUK = { id: 'orange', n: 'jeruk' };
const PISANG = { id: 'banana', n: 'pisang' };
const BOLA = { id: 'ball', n: 'bola' };
const BUKU = { id: 'book', n: 'buku' };
const BALON = { id: 'balloon', n: 'balon' };
const TELUR = { id: 'egg', n: 'telur' };
const BUNGA = { id: 'flower', n: 'bunga' };
const PENSIL = { id: 'pencil', n: 'pensil' };
const ROTI = { id: 'bread', n: 'roti' };

// --- Soal cerita ------------------------------------------------------------

/** Cerita perkalian: kalimat dirakit dari kata, angka cuma di persamaan. */
function storyTimes(text: (a: string, b: string) => string, a: number, b: number): Level {
  return {
    id: '',
    narration: text(terbilang(a), terbilang(b)),
    data: {
      equation: `${a} × ${b} = ?`,
      choices: choices(a * b, timesDecoys(a, b)),
    },
  };
}

function storyDivide(text: (p: string, b: string) => string, p: number, b: number): Level {
  const q = p / b;
  return {
    id: '',
    narration: text(terbilang(p), terbilang(b)),
    data: {
      equation: `${p} ÷ ${b} = ?`,
      choices: choices(q, divideDecoys(q, b)),
    },
  };
}

// --- Kelipatan --------------------------------------------------------------

/** Lima bilangan berloncat tetap, bilangan berikutnya yang ditanyakan. */
function skip(step: number, start = step): Level {
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
  const answer = start + 5 * step;
  return {
    id: '',
    // Kalimat sengaja BEDA dari Pola Pintar (SD1): kalimat yang dipakai dua game
    // naik ke scope `shared`, dan itu memindahkan file suara Pola Pintar.
    narration: 'Lihat loncatan bilangannya. Bilangan apa selanjutnya?',
    data: {
      board: `${seq.join(' ')} __`,
      choices: choices(answer, pickDecoys(answer, [answer + 1, answer - 1, answer + step, answer - step])),
    },
  };
}

// --- Sifat khusus -----------------------------------------------------------

function special(a: number, b: number): Level {
  const answer = a * b;
  // Hasil 0 tak punya "lompatan tabel" yang wajar; pengecohnya salah-kaprah
  // yang khas: menjumlahkan, atau mengira hasilnya 1.
  const decoys = answer === 0 ? pickDecoys(0, [a + b, 1, Math.max(a, b)]) : timesDecoys(a, b);
  return {
    id: '',
    narration: `Berapa ${terbilang(a)} kali ${terbilang(b)}?`,
    data: { equation: `${a} × ${b} = ?`, choices: choices(answer, decoys) },
  };
}

const config: GameConfig<'tap-answer'> = {
  id: 'kali-kilat',
  group: 'sd2',
  title: 'Kali Kilat',
  emoji: '✖️',
  template: 'tap-answer',
  sessionLevels: 10,
  levels: [
    // --- l1. Kali = tambah berulang, bergambar (maks. 9 gambar per papan) ---
    slot(
      'l1',
      groupsOf(APEL, 2, 3),
      groupsOf(JERUK, 3, 2),
      groupsOf(BOLA, 2, 4),
      groupsOf(BUKU, 3, 3),
      groupsOf(PISANG, 4, 2),
      groupsOf(BALON, 2, 2),
      groupsOf(TELUR, 3, 2),
      groupsOf(BUNGA, 2, 3),
    ),
    // --- l2. Tabel 2, 5, 10 ---
    slot('l2', fact(2, 4), fact(2, 7), fact(5, 3), fact(5, 6), fact(5, 8), fact(10, 4), fact(10, 7), fact(2, 9)),
    // --- l3. Tabel 3 & 4 ---
    slot('l3', fact(3, 4), fact(3, 6), fact(3, 8), fact(4, 3), fact(4, 6), fact(4, 7), fact(3, 9), fact(4, 9)),
    // --- l4. Tabel 6 & 7 ---
    slot('l4', fact(6, 3), fact(6, 5), fact(6, 7), fact(6, 9), fact(7, 3), fact(7, 5), fact(7, 6), fact(7, 8)),
    // --- l5. Tabel 8 & 9 ---
    slot('l5', fact(8, 3), fact(8, 5), fact(8, 7), fact(8, 9), fact(9, 3), fact(9, 5), fact(9, 6), fact(9, 8)),
    // --- l6. Kelipatan ---
    slot('l6', skip(2), skip(3), skip(4), skip(5), skip(6), skip(7), skip(8), skip(10)),
    // --- l7. Faktor yang hilang ---
    slot('l7', missing(3, 4), missing(4, 5), missing(5, 6), missing(6, 3), missing(7, 4), missing(8, 5), missing(9, 3), missing(2, 8)),
    // --- l8. Bagi rata, bergambar (maks. 9 gambar per papan) ---
    slot(
      'l8',
      shareOut(APEL, 6, 2, 'keranjang'),
      shareOut(JERUK, 9, 3, 'piring'),
      shareOut(ROTI, 8, 4, 'anak'),
      shareOut(PENSIL, 8, 2, 'kotak'),
      shareOut(BUNGA, 6, 3, 'vas'),
      shareOut(BOLA, 8, 4, 'tim'),
      shareOut(BUKU, 4, 2, 'rak'),
      shareOut(BALON, 9, 3, 'anak'),
    ),
    // --- l9. Fakta bagi ---
    slot('l9', divide(12, 3), divide(20, 4), divide(24, 6), divide(18, 3), divide(35, 5), divide(40, 8), divide(63, 9), divide(56, 7)),
    // --- l10. Cerita perkalian ---
    slot(
      'l10',
      storyTimes((a, b) => `Ibu membeli ${a} kantong jeruk. Tiap kantong berisi ${b} jeruk. Berapa jeruk semuanya?`, 4, 5),
      storyTimes((a, b) => `Di kebun ada ${a} baris pohon. Tiap baris ada ${b} pohon. Berapa pohon semuanya?`, 6, 4),
      storyTimes((a, b) => `Pak Tani punya ${a} kandang ayam. Tiap kandang berisi ${b} ekor. Berapa ekor ayam semuanya?`, 3, 8),
      storyTimes((a, b) => `Satu kotak berisi ${b} pensil. Ada ${a} kotak. Berapa pensil semuanya?`, 7, 6),
      storyTimes((a, b) => `Satu sepeda punya ${b} roda. Berapa roda ${a} sepeda?`, 9, 2),
      storyTimes((a, b) => `Satu laba-laba punya ${b} kaki. Berapa kaki ${a} laba-laba?`, 5, 8),
      storyTimes((a, b) => `Tiap hari Adi membaca ${b} halaman buku. Berapa halaman dalam ${a} hari?`, 7, 5),
      storyTimes((a, b) => `Ada ${a} meja di kelas. Tiap meja diduduki ${b} anak. Berapa anak semuanya?`, 8, 2),
    ),
    // --- l11. Cerita pembagian ---
    slot(
      'l11',
      storyDivide((p, b) => `Ada ${p} permen dibagi rata untuk ${b} anak. Tiap anak dapat berapa permen?`, 20, 4),
      storyDivide((p, b) => `Bu Guru punya ${p} buku untuk ${b} kelompok. Tiap kelompok dapat berapa buku?`, 18, 6),
      storyDivide((p, b) => `Ada ${p} kelereng dimasukkan ke ${b} kantong sama banyak. Tiap kantong berisi berapa kelereng?`, 24, 8),
      storyDivide((p, b) => `${capital(p)} kue dibagi rata ke ${b} piring. Tiap piring ada berapa kue?`, 15, 3),
      storyDivide((p, b) => `Ada ${p} bunga dirangkai jadi ${b} buket sama banyak. Tiap buket berisi berapa bunga?`, 30, 5),
      storyDivide((p, b) => `Ada ${p} kursi disusun jadi ${b} baris sama banyak. Tiap baris ada berapa kursi?`, 21, 7),
      storyDivide((p, b) => `Uang ${p} ribu rupiah dibagi rata untuk ${b} hari. Tiap hari berapa ribu rupiah?`, 36, 9),
      storyDivide((p, b) => `Ada ${p} apel dibagi rata ke ${b} keranjang. Tiap keranjang ada berapa apel?`, 16, 2),
    ),
    // --- l12. Sifat khusus: × 1, × 0, × 10 ---
    slot('l12', special(9, 1), special(1, 7), special(0, 6), special(8, 0), special(10, 5), special(10, 9), special(10, 3), special(10, 8)),
  ],
};

export default config;
