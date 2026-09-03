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
 *   - **Bangun ruang** (slot 8–11) — kubus, balok, bola, tabung, kerucut,
 *     limas. Bahan TERBANYAK di game ini.
 *   - **Pola bilangan** (slot 12) — kurikulum kelas 1 & 2 memintanya
 *     ("melanjutkan pola gambar/bilangan", "menghitung mundur"), tapi cukup
 *     SATU slot: itu ranahnya Hitung Hebat & Tambah Tangkas, sedangkan
 *     game ini soal pola.
 *
 * Dua belas slot, tiap slot kolam varian yang diacak tiap main & tiap "Main
 * Lagi"; `sessionLevels: 8` mengambil 8 dari 12 slot, jadi dua sesi
 * berturut-turut hampir tak pernah sama.
 *
 * Aturan yang dipatuhi (CLAUDE.md + docs/kurikulum-sd1-2.md):
 *   - **DERET SELALU TEPAT 6 SEL.** `.ta-seq-shape` mengecil mengikuti lebar
 *     layar supaya enam sel termasuk kotak "?" tetap SATU baris di HP kecil;
 *     tujuh sel membuatnya turun baris dan pola berhenti terbaca sebagai pola.
 *   - **BATAS BILANGAN 30** (keputusan pemilik 2026-08-01): tak ada bilangan
 *     di deret maupun di kartu jawaban yang lewat 30.
 *   - Narasi tidak pernah memuat jawabannya.
 *   - **Tiga pilihan per soal** (jawaban + 2 pengecoh) — dikecilkan dari 4
 *     pilihan atas permintaan pemilik (2026-09-03). Pengecoh yang dibuang
 *     selalu yang tipe "sel sebelumnya" (nilai yang sudah tampak di deret);
 *     yang dipertahankan adalah pasangan "hampir benar" yang sengaja
 *     dirancang: bentuk yang benar dengan WARNA salah, dan warna yang benar
 *     dengan BENTUK salah — supaya anak harus benar-benar membaca polanya,
 *     bukan menebak kartu yang paling beda sendiri.
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

/* ---------- bangun ruang ---------- */

/**
 * **Bangun ruang** (kubus, balok, bola, tabung, kerucut, limas) — permintaan
 * pemilik 2026-09-03: *"untuk pola angka bikin yang sedikit saja, banyakin
 * pola bangun ruang"*. Empat slot penuh (8–11) plus sisipan di slot warna &
 * dua ciri, lawan satu slot bilangan.
 *
 * Sekaligus menutup lubang kurikulum: `docs/kurikulum-sd1-2.md` menandai
 * "bangun ruang (kubus, balok, bola, kerucut)" **belum ada** di game mana
 * pun, dan enam ShapeId ini memang baru dibuat untuk slot-slot ini.
 *
 * Tak ada gambar yang perlu diimpor: keenamnya digambar SVG semu-3D di
 * `Shape.tsx` — satu warna dasar, sisi-sisinya versi gelap/terang warna itu.
 * Jadi bangun ruang ikut aturan warna yang sama dengan bangun datar, dan
 * pola warna (slot 5) tetap jalan dengan kubus atau tabung.
 *
 * **Pasangan yang tidak boleh diadu sebagai jawaban lawan pengecoh** (di
 * dalam deret tetap boleh berdampingan asal warnanya jauh berbeda) — sama
 * alasannya dengan segilima lawan segienam di slot 1:
 *   - **kubus ↔ balok** — dua-duanya kotak semu-3D; bedanya cuma
 *     perbandingan rusuk, dan di sel 34 px itu ujian menaksir panjang.
 *   - **kerucut ↔ limas** — siluetnya sama-sama segitiga.
 *   - **bola ↔ lingkaran**, **kubus/balok ↔ kotak**, **kerucut ↔ segitiga** —
 *     bangun ruang lawan bangun datar yang sesiluet: bedanya cuma bayangan.
 */
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
        [sh('segienam', HIJAU), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('trapesium', HIJAU), sh('ketupat', MERAH)],
        [sh('ketupat', BIRU), sh('trapesium', MERAH)],
      ),
      lanjut(
        [sh('ketupat', UNGU), sh('segitiga', KUNING)],
        [sh('segitiga', MERAH), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('segienam', HIJAU), sh('lingkaran', PINK)],
        [sh('lingkaran', BIRU), sh('segienam', PINK)],
      ),
      lanjut(
        [sh('trapesium', UNGU), sh('segilima', KUNING)],
        [sh('segilima', HIJAU), sh('trapesium', KUNING)],
      ),
      lanjut(
        [sh('ketupat', BIRU), sh('segienam', MERAH)],
        [sh('segienam', KUNING), sh('ketupat', MERAH)],
      ),
    ),
    // --- 2. Pola AAB / ABB — satu bentuk mengulang, jadi anak tak bisa
    //        sekadar berganti-ganti dua kartu ---
    slot(
      'l2',
      lanjut(
        [sh('segilima', MERAH), sh('segilima', MERAH), sh('trapesium', BIRU)],
        [sh('trapesium', HIJAU), sh('segilima', BIRU)],
      ),
      lanjut(
        [sh('ketupat', HIJAU), sh('ketupat', HIJAU), sh('bintang', KUNING)],
        [sh('bintang', UNGU), sh('ketupat', KUNING)],
      ),
      lanjut(
        [sh('segienam', UNGU), sh('kotak', KUNING), sh('kotak', KUNING)],
        [sh('kotak', HIJAU), sh('segienam', KUNING)],
      ),
      lanjut(
        [sh('trapesium', PINK), sh('lingkaran', BIRU), sh('lingkaran', BIRU)],
        [sh('lingkaran', UNGU), sh('trapesium', BIRU)],
      ),
      lanjut(
        [sh('hati', MERAH), sh('hati', MERAH), sh('segilima', HIJAU)],
        [sh('segilima', BIRU), sh('hati', HIJAU)],
      ),
      lanjut(
        [sh('ketupat', KUNING), sh('segienam', BIRU), sh('segienam', BIRU)],
        [sh('segienam', MERAH), sh('ketupat', BIRU)],
      ),
    ),
    // --- 3. Pola ABC — tiga bentuk berbeda sebelum berulang ---
    slot(
      'l3',
      lanjut(
        [sh('segilima', MERAH), sh('trapesium', BIRU), sh('ketupat', KUNING)],
        [sh('ketupat', HIJAU), sh('segilima', KUNING)],
      ),
      lanjut(
        [sh('segienam', HIJAU), sh('bintang', KUNING), sh('kotak', UNGU)],
        [sh('kotak', MERAH), sh('segienam', UNGU)],
      ),
      lanjut(
        [sh('ketupat', BIRU), sh('lingkaran', PINK), sh('segitiga', HIJAU)],
        [sh('segitiga', KUNING), sh('ketupat', HIJAU)],
      ),
      lanjut(
        [sh('trapesium', UNGU), sh('segienam', KUNING), sh('hati', MERAH)],
        [sh('hati', BIRU), sh('trapesium', MERAH)],
      ),
      lanjut(
        [sh('segilima', COKLAT), sh('oval', HIJAU), sh('ketupat', PINK)],
        [sh('ketupat', BIRU), sh('segilima', PINK)],
      ),
      lanjut(
        [sh('kotak', MERAH), sh('segienam', BIRU), sh('trapesium', KUNING)],
        [sh('trapesium', HIJAU), sh('kotak', KUNING)],
      ),
    ),
    // --- 4. Pola ABBC — empat sel per satuan, jadi deret 6 sel berhenti di
    //        TENGAH satuan kedua. Sel sebelum lubang selalu beda dari
    //        jawabannya, jadi menyalin tetangga pasti salah. ---
    slot(
      'l4',
      lanjut(
        [sh('segilima', MERAH), sh('trapesium', BIRU), sh('trapesium', BIRU), sh('ketupat', KUNING)],
        [sh('ketupat', KUNING), sh('trapesium', HIJAU)],
      ),
      lanjut(
        [sh('kotak', HIJAU), sh('bintang', KUNING), sh('bintang', KUNING), sh('hati', MERAH)],
        [sh('hati', MERAH), sh('bintang', UNGU)],
      ),
      lanjut(
        [sh('segienam', UNGU), sh('lingkaran', PINK), sh('lingkaran', PINK), sh('segitiga', BIRU)],
        [sh('segitiga', BIRU), sh('lingkaran', KUNING)],
      ),
      lanjut(
        [sh('ketupat', KUNING), sh('segilima', HIJAU), sh('segilima', HIJAU), sh('oval', MERAH)],
        [sh('oval', MERAH), sh('segilima', BIRU)],
      ),
      lanjut(
        [sh('trapesium', BIRU), sh('hati', PINK), sh('hati', PINK), sh('segienam', KUNING)],
        [sh('segienam', KUNING), sh('hati', UNGU)],
      ),
      lanjut(
        [sh('bintang', MERAH), sh('ketupat', BIRU), sh('ketupat', BIRU), sh('segilima', KUNING)],
        [sh('segilima', KUNING), sh('ketupat', HIJAU)],
      ),
    ),
    // --- 5. Pola WARNA — bentuknya sama semua, warnanya yang berirama.
    //        Semua kartu jawaban sebentuk, jadi cuma warna yang menentukan. ---
    slot(
      'l5',
      warna('lingkaran', [MERAH, BIRU], [HIJAU, KUNING]),
      warna('kotak', [HIJAU, KUNING], [BIRU, UNGU]),
      warna('bintang', [UNGU, KUNING, HIJAU], [KUNING, BIRU]),
      // Dua varian memakai bangun ruang: bentuknya sama sepanjang deret,
      // jadi bayangan sisinya tidak pernah jadi bahan pembanding — cuma
      // warnanya, dan warna dasar kartu tetap satu.
      warna('kubus', [BIRU, BIRU, MERAH], [UNGU, COKLAT]),
      warna('hati', [PINK, UNGU], [BIRU, COKLAT]),
      warna('tabung', [KUNING, HIJAU, HIJAU], [BIRU, MERAH]),
    ),
    // --- 6. Dua ciri sekaligus — bentuk berirama 2, warna berirama 3.
    //        Slot tersulit di game ini. ---
    slot(
      'l6',
      duaCiri(
        ['lingkaran', 'kotak'],
        [MERAH, BIRU, KUNING],
        [sh('kotak', MERAH), sh('lingkaran', KUNING)],
      ),
      duaCiri(
        ['segitiga', 'bintang'],
        [HIJAU, UNGU, KUNING],
        [sh('bintang', HIJAU), sh('segitiga', KUNING)],
      ),
      duaCiri(
        ['ketupat', 'segienam'],
        [BIRU, KUNING, MERAH],
        [sh('segienam', BIRU), sh('ketupat', MERAH)],
      ),
      duaCiri(
        ['hati', 'oval'],
        [PINK, BIRU, HIJAU],
        [sh('oval', PINK), sh('hati', HIJAU)],
      ),
      duaCiri(
        ['trapesium', 'segilima'],
        [KUNING, HIJAU, UNGU],
        [sh('segilima', KUNING), sh('trapesium', UNGU)],
      ),
      duaCiri(
        ['tabung', 'bola'],
        [COKLAT, KUNING, BIRU],
        [sh('bola', COKLAT), sh('tabung', BIRU)],
      ),
    ),
    // --- 7. Lubang di TENGAH deret — anak harus membaca pola dari kiri DAN
    //        kanan, bukan meneruskan sel terakhir ---
    slot(
      'l7',
      pola(
        ulang([sh('segilima', MERAH), sh('kotak', BIRU)]),
        2,
        [sh('segilima', HIJAU), sh('kotak', MERAH)],
        TENGAH,
      ),
      pola(
        ulang([sh('bintang', KUNING), sh('hati', MERAH), sh('segienam', BIRU)]),
        3,
        [sh('bintang', HIJAU), sh('hati', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('ketupat', HIJAU), sh('ketupat', HIJAU), sh('trapesium', UNGU)]),
        4,
        [sh('ketupat', BIRU), sh('trapesium', HIJAU)],
        TENGAH,
      ),
      pola(
        ulang([sh('lingkaran', UNGU), sh('segitiga', KUNING)]),
        3,
        [sh('segitiga', HIJAU), sh('lingkaran', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('oval', BIRU), sh('hati', PINK), sh('hati', PINK)]),
        2,
        [sh('hati', UNGU), sh('oval', PINK)],
        TENGAH,
      ),
      pola(
        ulang([sh('segienam', MERAH), sh('trapesium', KUNING), sh('kotak', HIJAU)]),
        4,
        [sh('trapesium', BIRU), sh('segienam', KUNING)],
        TENGAH,
      ),
    ),
    // --- 8. BANGUN RUANG, irama AB (pemanasan) — bentuknya yang baru,
    //        iramanya yang paling mudah, persis seperti slot 1 ---
    slot(
      'l8',
      lanjut(
        [sh('kubus', BIRU), sh('bola', KUNING)],
        // Pengecoh "warna benar, bentuk salah" di sini tabung, BUKAN
        // lingkaran: bola lawan lingkaran cuma beda bayangan.
        [sh('bola', HIJAU), sh('tabung', KUNING)],
      ),
      lanjut(
        [sh('tabung', MERAH), sh('kerucut', HIJAU)],
        [sh('kerucut', KUNING), sh('bola', HIJAU)],
      ),
      lanjut(
        [sh('bola', UNGU), sh('balok', KUNING)],
        [sh('balok', HIJAU), sh('tabung', KUNING)],
      ),
      lanjut(
        [sh('limas', HIJAU), sh('tabung', PINK)],
        [sh('tabung', BIRU), sh('kubus', PINK)],
      ),
      lanjut(
        [sh('kubus', MERAH), sh('kerucut', KUNING)],
        [sh('kerucut', BIRU), sh('bola', KUNING)],
      ),
      lanjut(
        [sh('balok', UNGU), sh('limas', KUNING)],
        // Bukan kerucut: siluetnya sama-sama segitiga dengan limas.
        [sh('limas', HIJAU), sh('bola', KUNING)],
      ),
    ),
    // --- 9. Bangun ruang, irama AAB / ABB ---
    slot(
      'l9',
      lanjut(
        [sh('kubus', MERAH), sh('kubus', MERAH), sh('bola', BIRU)],
        [sh('bola', HIJAU), sh('tabung', BIRU)],
      ),
      lanjut(
        [sh('tabung', HIJAU), sh('tabung', HIJAU), sh('limas', KUNING)],
        [sh('limas', UNGU), sh('balok', KUNING)],
      ),
      lanjut(
        [sh('bola', KUNING), sh('bola', KUNING), sh('kerucut', MERAH)],
        [sh('kerucut', BIRU), sh('tabung', MERAH)],
      ),
      lanjut(
        [sh('balok', UNGU), sh('balok', UNGU), sh('tabung', KUNING)],
        [sh('tabung', HIJAU), sh('bola', KUNING)],
      ),
      lanjut(
        [sh('kerucut', PINK), sh('kubus', BIRU), sh('kubus', BIRU)],
        // Bukan balok: bedanya dengan kubus cuma perbandingan rusuk.
        [sh('kubus', KUNING), sh('tabung', BIRU)],
      ),
      lanjut(
        [sh('limas', COKLAT), sh('bola', HIJAU), sh('bola', HIJAU)],
        [sh('bola', KUNING), sh('kubus', HIJAU)],
      ),
    ),
    // --- 10. Bangun ruang, irama ABC — tiga bangun berbeda sebelum
    //         berulang, jadi anak harus memegang urutannya, bukan cuma
    //         bergantian dua kartu ---
    slot(
      'l10',
      lanjut(
        [sh('kubus', MERAH), sh('tabung', BIRU), sh('bola', KUNING)],
        [sh('bola', HIJAU), sh('kerucut', KUNING)],
      ),
      lanjut(
        [sh('bola', HIJAU), sh('kerucut', KUNING), sh('balok', UNGU)],
        [sh('balok', MERAH), sh('tabung', UNGU)],
      ),
      lanjut(
        [sh('limas', BIRU), sh('kubus', KUNING), sh('tabung', MERAH)],
        [sh('tabung', HIJAU), sh('bola', MERAH)],
      ),
      lanjut(
        [sh('tabung', UNGU), sh('balok', KUNING), sh('kerucut', HIJAU)],
        [sh('kerucut', BIRU), sh('bola', HIJAU)],
      ),
      lanjut(
        [sh('kerucut', COKLAT), sh('bola', BIRU), sh('limas', KUNING)],
        [sh('limas', HIJAU), sh('kubus', KUNING)],
      ),
      lanjut(
        [sh('balok', MERAH), sh('limas', HIJAU), sh('kubus', BIRU)],
        [sh('kubus', KUNING), sh('tabung', BIRU)],
      ),
    ),
    // --- 11. Bangun ruang dengan lubang di TENGAH — slot bangun ruang
    //         tersulit: pola dibaca dari kiri DAN kanan ---
    slot(
      'l11',
      pola(
        ulang([sh('kubus', MERAH), sh('bola', BIRU)]),
        2,
        [sh('kubus', HIJAU), sh('tabung', MERAH)],
        TENGAH,
      ),
      pola(
        ulang([sh('bola', KUNING), sh('tabung', MERAH), sh('kerucut', BIRU)]),
        3,
        [sh('bola', HIJAU), sh('tabung', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('limas', HIJAU), sh('limas', HIJAU), sh('balok', UNGU)]),
        4,
        [sh('limas', MERAH), sh('tabung', HIJAU)],
        TENGAH,
      ),
      pola(
        ulang([sh('tabung', UNGU), sh('kubus', KUNING)]),
        3,
        [sh('kubus', HIJAU), sh('bola', KUNING)],
        TENGAH,
      ),
      pola(
        ulang([sh('kerucut', BIRU), sh('bola', PINK), sh('bola', PINK)]),
        2,
        [sh('bola', UNGU), sh('kubus', PINK)],
        TENGAH,
      ),
      pola(
        ulang([sh('balok', MERAH), sh('tabung', KUNING), sh('limas', HIJAU)]),
        4,
        [sh('tabung', BIRU), sh('bola', KUNING)],
        TENGAH,
      ),
    ),
    // --- 12. Pola bilangan — SATU slot berisi ketiga arahnya (maju, mundur,
    //         hilang di tengah). Dulu tiga slot; dikecilkan atas permintaan
    //         pemilik (2026-09-03) supaya game ini tetap tentang POLA, bukan
    //         berhitung — bilangan sudah punya Hitung Hebat & Tambah
    //         Tangkas. Ketiga kalimat narasinya tetap terpakai, jadi tak ada
    //         file suara yang jadi mubazir. Batas 30 tetap berlaku. ---
    slot(
      'l12',
      maju(2, 2, [11, 14]),
      maju(5, 5, [26, 28]),
      mundur(30, 2, [21, 18]),
      mundur(20, 2, [11, 8]),
      hilang(2, 2, 2, [5, 7]),
      hilang(5, 5, 3, [18, 22]),
    ),
  ],
};

export default config;
