import type { BodyPartId, MixedGameConfig, MixedLevel } from '@/engine/core/types';

/**
 * "Anggota Tubuh" (TK) — mengenal bagian tubuh sendiri.
 *
 * Mengisi satu-satunya celah isi TK yang benar-benar kosong: diri sendiri &
 * panca indera. Daftar bagiannya sengaja mengikuti lagu "Kepala pundak lutut
 * kaki" — kalimat yang sudah dihafal hampir semua anak TK Indonesia — jadi
 * yang dilatih game ini bukan kosakata baru, melainkan menghubungkan kata
 * yang sudah dikenal dengan tempatnya di tubuh.
 *
 * SATU GAMBAR ANAK, ANAK MENYENTUH BAGIANNYA (template `tap-picture`).
 * Bukan kartu jawaban berisi potongan tubuh yang melayang — telinga sendirian
 * atau tangan terpotong menyeramkan untuk anak empat tahun dan melanggar
 * aturan "satu gambar satu arti". Emoji bagian tubuh (👂 ✋ 🦶 👃) juga tidak
 * dipakai: berwarna kulit tertentu dan beda bentuk di tiap HP, masalah yang
 * sama dengan 🕒 di Jam Pintar.
 *
 * NOL ASET BARU. Gambar anaknya SVG milik engine (`src/engine/ui/Kid.tsx`),
 * pola yang sama dengan bangun datar, muka jam, dan latar cerita. Isyarat
 * benda di slot "dipakai di mana" memakai ulang seni item yang sudah ada
 * (topi, sepatu, tas, pensil, susu, bunga).
 *
 * ATURAN MENULIS VARIAN BARU (dijaga `node scripts/check-body-parts.mjs`):
 * - `parts` = jawaban + 2–3 pengecoh; engine memperkecil daerah sentuh tiap
 *   titik supaya dua bagian tak pernah bertindihan, jadi bagian yang
 *   BERDEMPETAN di gambar tidak boleh aktif bersama. Pasangan terlarangnya:
 *   pipi & telinga, lutut & kaki, leher & mulut, dan `kepala` dengan bagian
 *   wajah mana pun (`kepala` itu SELURUH kepala).
 * - Bingkainya dipilih engine sendiri: semua bagian di wajah → gambar wajah
 *   diperbesar, satu bagian badan saja ikut → seluruh badan. Jadi soal wajah
 *   yang halus (hidung lawan mulut) HARUS memakai pengecoh wajah saja.
 * - Skripnya mengukur daerah sentuh terkecil tiap varian pada layar 320×568
 *   (HP terkecil yang didukung) dan menolak yang di bawah target sentuh anak.
 */

/** Sentuh bagian yang benar: jawaban ditulis pertama, pengecoh sesudahnya. */
function ask(narration: string, answer: BodyPartId, ...decoys: BodyPartId[]): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-picture',
    data: { parts: [answer, ...decoys], answer },
  };
}

/** Sama, tapi dengan isyarat benda di pojok gambar ("Topi dipakai di mana?"). */
function withItem(
  narration: string,
  cueItem: string,
  answer: BodyPartId,
  ...decoys: BodyPartId[]
): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-picture',
    data: { parts: [answer, ...decoys], answer, cueItem },
  };
}

/**
 * "Ada berapa mata?" — kartu ANGKA, bukan sentuh gambar: yang dilatih di sini
 * lambang bilangan, dan anak menghitungnya pada tubuhnya sendiri. Angkanya
 * tetap di kartu, tidak pernah di narasi (aturan lama: mesin suara membaca
 * digit dalam bahasanya sendiri).
 */
function count(narration: string, answer: number, ...options: number[]): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-answer',
    data: {
      choices: options.map((n) => ({
        id: `n${n}`,
        text: String(n),
        correct: n === answer ? true : undefined,
      })),
    },
  };
}

/**
 * Semua varian dalam satu slot berbagi id — bintangnya per slot, jadi kolam
 * varian boleh ditambah tanpa membuat total bintang membengkak.
 */
function slot(id: string, ...variants: MixedLevel[]): MixedLevel[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: MixedGameConfig = {
  id: 'anggota-tubuh',
  group: 'tk',
  title: 'Anggota Tubuh',
  emoji: '🧒',
  template: 'mixed',
  // 8 dimainkan, 2 cadangan: shell mengocok slotnya lalu mengambil delapan,
  // jadi dua yang tak terpakai otomatis jadi cadangan sesi berikutnya.
  sessionLevels: 8,
  levels: [
    // --- 1. Wajah: sebut bagiannya (semua pengecoh di wajah → gambar wajah) ---
    slot(
      'l1',
      ask('Sentuh matamu!', 'mata', 'hidung', 'mulut'),
      ask('Sentuh hidungmu!', 'hidung', 'mata', 'mulut'),
      ask('Sentuh mulutmu!', 'mulut', 'mata', 'hidung'),
      ask('Sentuh telingamu!', 'telinga', 'mata', 'mulut'),
      ask('Sentuh rambutmu!', 'rambut', 'mata', 'mulut'),
      ask('Sentuh pipimu!', 'pipi', 'mata', 'mulut'),
    ),
    // --- 2. Badan: sebut bagiannya ---
    slot(
      'l2',
      ask('Sentuh tanganmu!', 'tangan', 'kaki', 'perut'),
      ask('Sentuh kakimu!', 'kaki', 'tangan', 'kepala'),
      ask('Sentuh perutmu!', 'perut', 'tangan', 'kaki'),
      ask('Sentuh kepalamu!', 'kepala', 'tangan', 'kaki'),
      ask('Sentuh pundakmu!', 'pundak', 'kaki', 'perut'),
      ask('Sentuh lututmu!', 'lutut', 'tangan', 'kepala'),
      ask('Sentuh lehermu!', 'leher', 'tangan', 'kaki'),
    ),
    // --- 3. Panca indera ---
    slot(
      'l3',
      ask('Kita melihat pakai apa? Sentuh!', 'mata', 'telinga', 'mulut'),
      ask('Kita mendengar pakai apa? Sentuh!', 'telinga', 'mata', 'mulut'),
      // Pengecohnya mulut, bukan telinga: lingkaran telinga menarik bingkai
      // melebar ke kedua sisi kepala, dan hidung yang berdempetan dengan
      // mulut ikut menciut jadi 50 px (lihat aturan bingkai di Kid.tsx).
      ask('Kita mencium bau pakai apa? Sentuh!', 'hidung', 'mata', 'mulut'),
      ask('Kita berbicara pakai apa? Sentuh!', 'mulut', 'mata', 'telinga'),
      ask('Kita mengecap rasa pakai apa? Sentuh!', 'mulut', 'hidung', 'mata'),
    ),
    // --- 4. Kegunaannya ---
    slot(
      'l4',
      ask('Kita berjalan pakai apa? Sentuh!', 'kaki', 'tangan', 'kepala'),
      ask('Kita memegang pensil pakai apa? Sentuh!', 'tangan', 'kaki', 'perut'),
      ask('Kalau lapar, mana yang bunyi? Sentuh!', 'perut', 'tangan', 'kepala'),
      ask('Kita menendang bola pakai apa? Sentuh!', 'kaki', 'tangan', 'perut'),
      ask('Kita berpikir pakai apa? Sentuh!', 'kepala', 'tangan', 'kaki'),
      ask('Kita bertepuk pakai apa? Sentuh!', 'tangan', 'kaki', 'kepala'),
    ),
    // --- 5. Benda dipakai di bagian mana (isyarat gambar di pojok) ---
    slot(
      'l5',
      withItem('Topi dipakai di mana? Sentuh!', 'cap', 'kepala', 'kaki', 'tangan'),
      withItem('Sepatu dipakai di mana? Sentuh!', 'shoe', 'kaki', 'tangan', 'kepala'),
      withItem('Tas digendong di mana? Sentuh!', 'backpack', 'pundak', 'kaki', 'tangan'),
      withItem('Pensil dipegang pakai apa? Sentuh!', 'pencil', 'tangan', 'kaki', 'kepala'),
      withItem('Susu diminum lewat mana? Sentuh!', 'milk', 'mulut', 'tangan', 'perut'),
      withItem('Bunga dicium pakai apa? Sentuh!', 'flower', 'hidung', 'tangan', 'kaki'),
    ),
    // --- 6. Ada berapa? (kartu angka) ---
    slot(
      'l6',
      count('Lihat tubuhmu. Ada berapa mata?', 2, 1, 2, 3),
      count('Lihat tubuhmu. Ada berapa telinga?', 2, 1, 2, 3),
      count('Lihat tubuhmu. Ada berapa hidung?', 1, 1, 2, 3),
      count('Lihat tubuhmu. Ada berapa mulut?', 1, 1, 2, 3),
      count('Lihat tubuhmu. Ada berapa kaki?', 2, 1, 2, 3),
      count('Ada berapa jari di satu tanganmu?', 5, 4, 5, 6),
    ),
    // --- 7. Lagu "Kepala pundak lutut kaki" ---
    // Lutut & kaki sengaja tidak pernah aktif bersama: di gambar keduanya cuma
    // berjarak lima belas satuan, jadi daerah sentuhnya akan menciut.
    slot(
      'l7',
      ask('Kepala pundak lutut kaki. Sentuh kepala!', 'kepala', 'pundak', 'lutut'),
      ask('Kepala pundak lutut kaki. Sentuh pundak!', 'pundak', 'kepala', 'kaki'),
      ask('Kepala pundak lutut kaki. Sentuh lutut!', 'lutut', 'kepala', 'pundak'),
      ask('Kepala pundak lutut kaki. Sentuh kaki!', 'kaki', 'kepala', 'pundak'),
    ),
    // --- 8. Merawat tubuh ---
    slot(
      'l8',
      ask('Sisir untuk merapikan apa? Sentuh!', 'rambut', 'tangan', 'kaki'),
      ask('Sebelum makan, apa yang dicuci? Sentuh!', 'tangan', 'kaki', 'perut'),
      ask('Waktu batuk, apa yang ditutup? Sentuh!', 'mulut', 'tangan', 'perut'),
      ask('Sepatu melindungi apa? Sentuh!', 'kaki', 'tangan', 'kepala'),
      ask('Helm melindungi apa? Sentuh!', 'kepala', 'tangan', 'kaki'),
    ),
    // --- 9. Wajah, tiga pengecoh ---
    // HIDUNG SENGAJA TIDAK IKUT DI SINI. Dengan empat bagian aktif, bingkainya
    // harus memuat kedua telinga (lebar 61 satuan) — dan pada bingkai selebar
    // itu hidung, yang cuma berjarak 7,5 satuan dari mulut, tinggal 35 px.
    // Soal hidung yang halus tetap ada di slot 1 dan 3, di mana bingkainya
    // boleh mendekat karena telinga tak ikut aktif.
    slot(
      'l9',
      ask('Lebih sulit! Sentuh matamu!', 'mata', 'telinga', 'mulut', 'rambut'),
      ask('Lebih sulit! Sentuh telingamu!', 'telinga', 'mata', 'mulut', 'rambut'),
      ask('Lebih sulit! Sentuh mulutmu!', 'mulut', 'mata', 'telinga', 'rambut'),
      ask('Lebih sulit! Sentuh rambutmu!', 'rambut', 'mata', 'mulut', 'telinga'),
    ),
    // --- 10. Badan, tiga pengecoh ---
    slot(
      'l10',
      ask('Lebih sulit! Sentuh perutmu!', 'perut', 'tangan', 'kaki', 'kepala'),
      ask('Lebih sulit! Sentuh pundakmu!', 'pundak', 'tangan', 'kaki', 'kepala'),
      ask('Lebih sulit! Sentuh lututmu!', 'lutut', 'tangan', 'perut', 'kepala'),
      ask('Lebih sulit! Sentuh lehermu!', 'leher', 'tangan', 'kaki', 'perut'),
      ask('Lebih sulit! Sentuh tanganmu!', 'tangan', 'kaki', 'perut', 'kepala'),
    ),
  ],
};

export default config;
