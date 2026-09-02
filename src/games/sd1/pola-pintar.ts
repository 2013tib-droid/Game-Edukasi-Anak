import type { GameConfig, GameLevel, ShapeId, ShapeSpec, TapChoice } from '@/engine/core/types';

/**
 * "Pola Pintar" (SD Kelas 1 & 2) — dunia logika & pola.
 *
 * Lahir dari permintaan pemilik (2026-09-02): soal "Pola Ajaib" di Labirin
 * Warna (kelompok TK) adalah latihan berpikir yang paling disukai, dan anak
 * SD butuh versi yang lebih banyak DAN lebih bervariasi. Di sana pola cuma
 * 3 dari 10 slot dan cuma soal bentuk; di sini pola adalah SELURUH game,
 * dengan enam sumbu penalaran yang berbeda.
 *
 * Bedanya dengan "Pola Ajaib" TK — jangan disamakan lagi kalau menambah slot:
 *   - **Bangun datar khas SD dipakai di sini**: `ketupat`, `trapesium`,
 *     `segilima`, `segienam`. Labirin Warna sengaja MENOLAK keempatnya
 *     (keputusan pemilik 2026-07-28: namanya milik SD, bukan TK), dan
 *     ShapeId-nya menganggur di engine sejak itu. Di kelompok SD justru
 *     itulah bahan barunya.
 *   - **Irama pola lebih panjang**: TK berhenti di AB, AAB/ABB, ABC. Di sini
 *     ada ABBC (empat sel per satuan) dan pola dua ciri.
 *   - **Lubangnya tidak selalu di ujung.** Slot 7 & 10 melubangi TENGAH
 *     deret, jadi anak harus membaca pola dua arah — bukan sekadar
 *     meneruskan sel terakhir.
 *   - **Warna bisa jadi polanya sendiri** (slot 5), lepas dari bentuk.
 *   - **Pola bilangan** (slot 8–10) — kurikulum kelas 1 & 2 memintanya
 *     ("melanjutkan pola gambar/bilangan", "menghitung mundur").
 *
 * Sepuluh slot, tiap slot kolam varian yang diacak tiap main & tiap "Main
 * Lagi"; `sessionLevels: 8` mengambil 8 dari 10 slot, jadi dua sesi
 * berturut-turut hampir tak pernah sama.
 *
 * Aturan yang dipatuhi (CLAUDE.md + docs/kurikulum-sd1-2.md):
 *   - **DERET SELALU TEPAT 6 SEL.** `.ta-seq-shape` mengecil mengikuti lebar
 *     layar supaya enam sel termasuk kotak "?" tetap SATU baris di HP kecil;
 *     tujuh sel membuatnya turun baris dan pola berhenti terbaca sebagai pola.
 *   - **BATAS BILANGAN 30** (keputusan pemilik 2026-08-01): tak ada bilangan
 *     di deret maupun di kartu jawaban yang lewat 30.
 *   - Narasi tidak pernah memuat jawabannya.
 *   - Pengecoh selalu "hampir benar": bentuk yang benar dengan WARNA salah,
 *     warna yang benar dengan BENTUK salah, atau sel sebelumnya — supaya anak
 *     harus benar-benar membaca polanya, bukan menebak kartu yang paling beda
 *     sendiri.
 *   - **merah & pink tidak pernah diadu** sebagai jawaban vs pengecoh: di HP
 *     keduanya nyaris tak terbedakan. (Aturan warna Labirin Warna, berlaku
 *     di sini juga.)
 */

// Palet Labirin Warna — tujuh warna yang jelas terpisah, tanpa oranye
// (kuning vs oranye tak terbaca di HP).
const MERAH = '#E53935';
const BIRU = '#2196F3';
const KUNING = '#FFD400';
const HIJAU = '#43A047';
const UNGU = '#8E24AA';
const PINK = '#F06292';
const COKLAT = '#8D6E63';

type Level = GameLevel<'tap-answer'>;

const sh = (kind: ShapeId, color: string): ShapeSpec => ({ kind, color });

/** Satuan pola diulang sampai tepat 6 sel — lihat aturan "6 sel" di atas. */
const ulang = (unit: ShapeSpec[]): ShapeSpec[] =>
  Array.from({ length: 6 }, (_, i) => unit[i % unit.length]!);

/**
 * Satu soal pola bentuk: deret 6 sel dengan satu sel dikosongkan (`null` =
 * kotak "?" di layar), lalu anak memilih kartu yang seharusnya ada di situ.
 *
 * `lubang` boleh di mana saja — indeks 5 (ujung) = "apa selanjutnya",
 * indeks tengah = "apa yang hilang", yang jauh lebih sulit karena anak harus
 * membaca pola dari kiri DAN kanan.
 */
function pola(cells: ShapeSpec[], lubang: number, decoys: ShapeSpec[], narration: string): Level {
  const answer = cells[lubang]!;
  const sequence: (ShapeSpec | null)[] = [...cells];
  sequence[lubang] = null;
  return {
    id: '',
    narration,
    data: {
      sequence,
      choices: [
        { id: 'a', shape: answer, correct: true },
        ...decoys.map((s, i) => ({ id: `d${i}`, shape: s })),
      ],
    },
  };
}

const LANJUT = 'Lihat polanya baik-baik. Bentuk apa selanjutnya?';
const TENGAH = 'Lihat polanya baik-baik. Bentuk apa yang hilang di tengah?';
const WARNA = 'Semua bentuknya sama. Lihat warnanya. Warna apa selanjutnya?';
const DUA_CIRI = 'Bentuk dan warnanya sama-sama berpola. Yang mana selanjutnya?';

/** Pola bentuk yang lubangnya di ujung — bentuk soal paling umum. */
const lanjut = (unit: ShapeSpec[], decoys: ShapeSpec[]) => pola(ulang(unit), 5, decoys, LANJUT);

/** Pola warna: satu bentuk sepanjang deret, warnanya yang berirama. */
const warna = (kind: ShapeId, colors: string[], decoyColors: string[]) =>
  pola(
    Array.from({ length: 6 }, (_, i) => sh(kind, colors[i % colors.length]!)),
    5,
    decoyColors.map((c) => sh(kind, c)),
    WARNA,
  );

/**
 * Dua ciri sekaligus: bentuk berirama DUA sel, warna berirama TIGA sel, jadi
 * keduanya baru berulang bersamaan di sel ke-7. Anak tak bisa menyalin sel
 * mana pun — harus melacak bentuk dan warna sebagai dua pola terpisah.
 */
const duaCiri = (kinds: [ShapeId, ShapeId], colors: [string, string, string], decoys: ShapeSpec[]) =>
  pola(
    Array.from({ length: 6 }, (_, i) => sh(kinds[i % 2]!, colors[i % 3]!)),
    5,
    decoys,
    DUA_CIRI,
  );

/* ---------- pola bilangan ---------- */

const numberChoices = (answer: number, decoys: number[]): TapChoice[] => [
  { id: 'a', text: String(answer), correct: true },
  ...decoys.map((d, i) => ({ id: `d${i}`, text: String(d) })),
];

/**
 * Deret bilangan dengan satu bilangan dihilangkan. Tiap bilangan jadi token
 * sendiri (dipisah spasi biasa) supaya deret panjang boleh turun baris di HP
 * kecil, sama seperti slot "bilangan hilang" di Hitung Hebat.
 */
function polaAngka(deret: number[], lubang: number, decoys: number[], narration: string): Level {
  const answer = deret[lubang]!;
  const board = deret.map((n, i) => (i === lubang ? '__' : String(n))).join(' ');
  return { id: '', narration, data: { board, choices: numberChoices(answer, decoys) } };
}

const MAJU = 'Lihat urutan bilangannya. Bilangan apa selanjutnya?';
const MUNDUR = 'Bilangannya menghitung mundur. Bilangan apa selanjutnya?';
const HILANG = 'Lihat urutan bilangannya. Bilangan mana yang hilang?';

/** Enam bilangan berloncat tetap; `loncat` negatif = menghitung mundur. */
const deret = (mulai: number, loncat: number): number[] =>
  Array.from({ length: 6 }, (_, i) => mulai + i * loncat);

const maju = (mulai: number, loncat: number, decoys: number[]) =>
  polaAngka(deret(mulai, loncat), 5, decoys, MAJU);
const mundur = (mulai: number, loncat: number, decoys: number[]) =>
  polaAngka(deret(mulai, -loncat), 5, decoys, MUNDUR);
const hilang = (mulai: number, loncat: number, lubang: number, decoys: number[]) =>
  polaAngka(deret(mulai, loncat), lubang, decoys, HILANG);

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'tap-answer'> = {
  id: 'pola-pintar',
  group: 'sd1',
  title: 'Pola Pintar',
  emoji: '🔷',
  template: 'tap-answer',
  sessionLevels: 8,
  levels: [
    // --- 1. Pola AB dengan bangun datar khas SD (pemanasan) ---
    // Iramanya paling mudah, tapi bentuknya baru: segilima, segienam,
    // trapesium, ketupat tak pernah muncul di kelompok TK.
    slot(
      'l1',
      lanjut(
        // Pengecoh "warna benar, bentuk salah" di sini ketupat, BUKAN
        // segilima: segilima dan segienam berwarna sama cuma beda satu sisi,
        // dan di slot pemanasan itu jadi ujian menggambar, bukan ujian pola.
        // Di deretnya sendiri keduanya boleh berdampingan — warnanya beda
        // jauh, jadi iramanya tetap terbaca.
        [sh('segilima', BIRU), sh('segienam', KUNING)],
        [sh('segilima', BIRU), sh('segienam', HIJAU), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('trapesium', HIJAU), sh('ketupat', MERAH)],
        [sh('trapesium', HIJAU), sh('ketupat', BIRU), sh('trapesium', MERAH)],
      ),
      lanjut(
        [sh('ketupat', UNGU), sh('segitiga', KUNING)],
        [sh('ketupat', UNGU), sh('segitiga', MERAH), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('segienam', HIJAU), sh('lingkaran', PINK)],
        [sh('segienam', HIJAU), sh('lingkaran', BIRU), sh('segienam', PINK)],
      ),
      lanjut(
        [sh('trapesium', UNGU), sh('segilima', KUNING)],
        [sh('trapesium', UNGU), sh('segilima', HIJAU), sh('trapesium', KUNING)],
      ),
      lanjut(
        [sh('ketupat', BIRU), sh('segienam', MERAH)],
        [sh('ketupat', BIRU), sh('segienam', KUNING), sh('ketupat', MERAH)],
      ),
    ),
    // --- 2. Pola AAB / ABB — satu bentuk mengulang, jadi anak tak bisa
    //        sekadar berganti-ganti dua kartu ---
    slot(
      'l2',
      lanjut(
        [sh('segilima', MERAH), sh('segilima', MERAH), sh('trapesium', BIRU)],
        [sh('segilima', MERAH), sh('trapesium', HIJAU), sh('segilima', BIRU)],
      ),
      lanjut(
        [sh('ketupat', HIJAU), sh('ketupat', HIJAU), sh('bintang', KUNING)],
        [sh('ketupat', HIJAU), sh('bintang', UNGU), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('segienam', UNGU), sh('kotak', KUNING), sh('kotak', KUNING)],
        [sh('segienam', UNGU), sh('kotak', HIJAU), sh('segienam', KUNING)],
      ),
      lanjut(
        [sh('trapesium', PINK), sh('lingkaran', BIRU), sh('lingkaran', BIRU)],
        [sh('trapesium', PINK), sh('lingkaran', UNGU), sh('trapesium', BIRU)],
      ),
      lanjut(
        [sh('hati', MERAH), sh('hati', MERAH), sh('segilima', HIJAU)],
        [sh('hati', MERAH), sh('segilima', BIRU), sh('hati', HIJAU)],
      ),
      lanjut(
        [sh('ketupat', KUNING), sh('segienam', BIRU), sh('segienam', BIRU)],
        [sh('ketupat', KUNING), sh('segienam', MERAH), sh('ketupat', BIRU)],
      ),
    ),
    // --- 3. Pola ABC — tiga bentuk berbeda sebelum berulang ---
    slot(
      'l3',
      lanjut(
        [sh('segilima', MERAH), sh('trapesium', BIRU), sh('ketupat', KUNING)],
        [sh('trapesium', BIRU), sh('ketupat', HIJAU), sh('segilima', KUNING)],
      ),
      lanjut(
        [sh('segienam', HIJAU), sh('bintang', KUNING), sh('kotak', UNGU)],
        [sh('bintang', KUNING), sh('kotak', MERAH), sh('segienam', UNGU)],
      ),
      lanjut(
        [sh('ketupat', BIRU), sh('lingkaran', PINK), sh('segitiga', HIJAU)],
        [sh('lingkaran', PINK), sh('segitiga', KUNING), sh('ketupat', HIJAU)],
      ),
      lanjut(
        [sh('trapesium', UNGU), sh('segienam', KUNING), sh('hati', MERAH)],
        [sh('segienam', KUNING), sh('hati', BIRU), sh('trapesium', MERAH)],
      ),
      lanjut(
        [sh('segilima', COKLAT), sh('oval', HIJAU), sh('ketupat', PINK)],
        [sh('oval', HIJAU), sh('ketupat', BIRU), sh('segilima', PINK)],
      ),
      lanjut(
        [sh('kotak', MERAH), sh('segienam', BIRU), sh('trapesium', KUNING)],
        [sh('segienam', BIRU), sh('trapesium', HIJAU), sh('kotak', KUNING)],
      ),
    ),
    // --- 4. Pola ABBC — empat sel per satuan, jadi deret 6 sel berhenti di
    //        TENGAH satuan kedua. Sel sebelum lubang selalu beda dari
    //        jawabannya, jadi menyalin tetangga pasti salah. ---
    slot(
      'l4',
      lanjut(
        [sh('segilima', MERAH), sh('trapesium', BIRU), sh('trapesium', BIRU), sh('ketupat', KUNING)],
        [sh('segilima', MERAH), sh('ketupat', KUNING), sh('trapesium', HIJAU)],
      ),
      lanjut(
        [sh('kotak', HIJAU), sh('bintang', KUNING), sh('bintang', KUNING), sh('hati', MERAH)],
        [sh('kotak', HIJAU), sh('hati', MERAH), sh('bintang', UNGU)],
      ),
      lanjut(
        [sh('segienam', UNGU), sh('lingkaran', PINK), sh('lingkaran', PINK), sh('segitiga', BIRU)],
        [sh('segienam', UNGU), sh('segitiga', BIRU), sh('lingkaran', KUNING)],
      ),
      lanjut(
        [sh('ketupat', KUNING), sh('segilima', HIJAU), sh('segilima', HIJAU), sh('oval', MERAH)],
        [sh('ketupat', KUNING), sh('oval', MERAH), sh('segilima', BIRU)],
      ),
      lanjut(
        [sh('trapesium', BIRU), sh('hati', PINK), sh('hati', PINK), sh('segienam', KUNING)],
        [sh('trapesium', BIRU), sh('segienam', KUNING), sh('hati', UNGU)],
      ),
      lanjut(
        [sh('bintang', MERAH), sh('ketupat', BIRU), sh('ketupat', BIRU), sh('segilima', KUNING)],
        [sh('bintang', MERAH), sh('segilima', KUNING), sh('ketupat', HIJAU)],
      ),
    ),
    // --- 5. Pola WARNA — bentuknya sama semua, warnanya yang berirama.
    //        Semua kartu jawaban sebentuk, jadi cuma warna yang menentukan. ---
    slot(
      'l5',
      warna('lingkaran', [MERAH, BIRU], [MERAH, HIJAU, KUNING]),
      warna('kotak', [HIJAU, KUNING], [HIJAU, BIRU, UNGU]),
      warna('bintang', [UNGU, KUNING, HIJAU], [UNGU, KUNING, BIRU]),
      warna('segienam', [BIRU, BIRU, MERAH], [BIRU, UNGU, COKLAT]),
      warna('hati', [PINK, UNGU], [PINK, BIRU, COKLAT]),
      warna('trapesium', [KUNING, HIJAU, HIJAU], [KUNING, BIRU, MERAH]),
    ),
    // --- 6. Dua ciri sekaligus — bentuk berirama 2, warna berirama 3.
    //        Slot tersulit di game ini. ---
    slot(
      'l6',
      duaCiri(
        ['lingkaran', 'kotak'],
        [MERAH, BIRU, KUNING],
        [sh('kotak', MERAH), sh('lingkaran', KUNING), sh('lingkaran', MERAH)],
      ),
      duaCiri(
        ['segitiga', 'bintang'],
        [HIJAU, UNGU, KUNING],
        [sh('bintang', HIJAU), sh('segitiga', KUNING), sh('segitiga', HIJAU)],
      ),
      duaCiri(
        ['ketupat', 'segienam'],
        [BIRU, KUNING, MERAH],
        [sh('segienam', BIRU), sh('ketupat', MERAH), sh('ketupat', BIRU)],
      ),
      duaCiri(
        ['hati', 'oval'],
        [PINK, BIRU, HIJAU],
        [sh('oval', PINK), sh('hati', HIJAU), sh('hati', PINK)],
      ),
      duaCiri(
        ['trapesium', 'segilima'],
        [KUNING, HIJAU, UNGU],
        [sh('segilima', KUNING), sh('trapesium', UNGU), sh('trapesium', KUNING)],
      ),
      duaCiri(
        ['kotak', 'segitiga'],
        [COKLAT, KUNING, BIRU],
        [sh('segitiga', COKLAT), sh('kotak', BIRU), sh('kotak', COKLAT)],
      ),
    ),
    // --- 7. Lubang di TENGAH deret — anak harus membaca pola dari kiri DAN
    //        kanan, bukan meneruskan sel terakhir ---
    slot(
      'l7',
      pola(
        ulang([sh('segilima', MERAH), sh('kotak', BIRU)]),
        2,
        [sh('kotak', BIRU), sh('segilima', HIJAU), sh('kotak', MERAH)],
        TENGAH,
      ),
      pola(
        ulang([sh('bintang', KUNING), sh('hati', MERAH), sh('segienam', BIRU)]),
        3,
        [sh('segienam', BIRU), sh('bintang', HIJAU), sh('hati', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('ketupat', HIJAU), sh('ketupat', HIJAU), sh('trapesium', UNGU)]),
        4,
        [sh('trapesium', UNGU), sh('ketupat', BIRU), sh('trapesium', HIJAU)],
        TENGAH,
      ),
      pola(
        ulang([sh('lingkaran', UNGU), sh('segitiga', KUNING)]),
        3,
        [sh('lingkaran', UNGU), sh('segitiga', HIJAU), sh('lingkaran', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('oval', BIRU), sh('hati', PINK), sh('hati', PINK)]),
        2,
        [sh('oval', BIRU), sh('hati', UNGU), sh('oval', PINK)],
        TENGAH,
      ),
      pola(
        ulang([sh('segienam', MERAH), sh('trapesium', KUNING), sh('kotak', HIJAU)]),
        4,
        [sh('kotak', HIJAU), sh('trapesium', BIRU), sh('segienam', KUNING)],
        TENGAH,
      ),
    ),
    // --- 8. Pola bilangan maju (loncat tetap, tak pernah lewat 30) ---
    slot(
      'l8',
      maju(2, 2, [11, 14]),
      maju(5, 5, [26, 28]),
      maju(3, 3, [17, 20]),
      maju(1, 2, [10, 12]),
      maju(4, 4, [22, 25]),
      maju(10, 2, [19, 22]),
    ),
    // --- 9. Pola bilangan mundur — kurikulum kelas 1 minta "menghitung
    //        maju-mundur", dan tak ada game lain yang melatih arah mundur ---
    slot(
      'l9',
      mundur(30, 2, [21, 18]),
      mundur(20, 2, [11, 8]),
      mundur(30, 5, [8, 0]),
      mundur(18, 3, [4, 2]),
      mundur(10, 1, [4, 7]),
      mundur(24, 4, [6, 2]),
    ),
    // --- 10. Bilangan hilang di TENGAH deret ---
    slot(
      'l10',
      hilang(2, 2, 2, [5, 7]),
      hilang(5, 5, 3, [18, 22]),
      hilang(30, -3, 2, [25, 23]),
      hilang(1, 3, 3, [9, 11]),
      hilang(20, -2, 3, [13, 15]),
      hilang(12, 2, 2, [15, 17]),
    ),
  ],
};

export default config;
