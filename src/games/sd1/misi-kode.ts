import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { codeSlot, type CodeCast } from '@/games/codeLevels';

/**
 * "Misi Kode" (SD Kelas 1 & 2) — saudara "Kode Kelinci" (TK) yang sengaja
 * lebih sulit, template `code-quest` yang sama. Kura-kura mengambil stroberi
 * lalu pergi ke taman. Keputusan pemilik 2026-10-12: susun dulu baru
 * jalankan, arah mutlak, ditambah kartu ULANGI dan soal MEMPERBAIKI kode
 * (debug) — tiga gagasan inti berpikir komputasional: urutan, pengulangan,
 * dan mencari kesalahan. `draft` di registry sampai launching SD Kelas 3 & 4.
 *
 * SLOT (urutan tetap)
 *   l1 pemanasan: belok + ambil satu stroberi
 *   l2 labirin: dua stroberi
 *   l3 PERBAIKI: kode sudah tersusun, satu kartunya salah
 *   l4 kenalan kartu ULANGI: jalan lurus, rel utama terlalu pendek
 *   l5 ulangi pola tangga (kanan-bawah)
 *   l6 satu langkah dulu, baru ulangi
 *   l7 PERBAIKI kode ulangi (urutannya terbalik)
 *   l8 pola tiga kartu diulang
 *   l9 MISI BESAR: langkah + ulangi + langkah, tiga stroberi
 *
 * - Level ber-ulangi: rel utama sengaja LEBIH PENDEK dari jalan terpendek
 *   (dicek builder), jadi kartu ulangi benar-benar dibutuhkan, bukan hiasan.
 * - Kura-kura menghadap kanan di seninya (`turtle`); dibalik saat ke kiri.
 * - Narasi tanpa angka; banyaknya ulangan tertulis di kartu (×3).
 */

// Tujuan = BUNGA, bukan seni `park`: taman itu gambar lebar (bangku + rumput)
// yang di petak ±40 px cuma terbaca garis — terukur di tangkapan layar 320 px.
const CAST: CodeCast = { hero: 'turtle', heroFaces: 'kanan', goal: 'flower', pickup: 'strawberry' };

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🍓', label: 'Stroberi' },
  l2: { emoji: '🌸', label: 'Bunga' },
  l3: { emoji: '🐞', label: 'Kumbang' },
  l4: { emoji: '🍀', label: 'Semanggi' },
  l5: { emoji: '🪜', label: 'Tangga' },
  l6: { emoji: '🌼', label: 'Aster' },
  l7: { emoji: '🔧', label: 'Perbaiki' },
  l8: { emoji: '🎈', label: 'Balon' },
  l9: { emoji: '🏆', label: 'Juara' },
};

const config: GameConfig<'code-quest'> = {
  id: 'misi-kode',
  group: 'sd1',
  title: 'Misi Kode',
  emoji: '🐢',
  template: 'code-quest',
  project: { title: 'Taman Kura-kura' },
  hints: true,
  levels: [
    codeSlot('l1', STAMP.l1!, 'Kura-kura mau ke taman. Ambil stroberinya dulu, lalu jalankan kodenya!', CAST, [
      { grid: ['S..T', '.#..', '..*.', 'T..G'] },
      { grid: ['S.*.', '.T..', '..#.', '...G'] },
    ]),
    codeSlot('l2', STAMP.l2!, 'Ada dua stroberi. Susun kode yang mengambil semuanya!', CAST, [
      { grid: ['S.#..', '.*#..', '.....', '..#*G'], spare: 0 },
      { grid: ['S.T.', '.*..', 'T..*', '..#G'], spare: 0 },
    ]),
    codeSlot('l3', STAMP.l3!, 'Kode ini ada yang salah. Jalankan dulu, lalu perbaiki!', CAST, [
      {
        grid: ['S..T', '.#..', '..*.', 'T..G'],
        spare: 0,
        given: { main: ['kanan', 'kanan', 'kanan', 'bawah', 'bawah', 'bawah'] },
      },
      {
        grid: ['S.*.', '.T..', '..#.', '...G'],
        spare: 0,
        given: { main: ['kanan', 'kanan', 'bawah', 'bawah', 'kanan', 'bawah'] },
      },
    ]),
    codeSlot('l4', STAMP.l4!, 'Ini kartu ulangi! Isinya dijalankan berkali-kali. Isi kotak ulangi dengan panah.', CAST, [
      {
        grid: ['.....', 'S...G', '.....'],
        loop: { times: 4, slots: 1 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan'] },
      },
      {
        grid: ['S.*.G', '.....', '.....'],
        loop: { times: 4, slots: 1 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan'] },
      },
    ]),
    codeSlot('l5', STAMP.l5!, 'Jalannya seperti tangga. Pakai kartu ulangi supaya kodenya pendek!', CAST, [
      {
        grid: ['S....', 'T.*..', '.T...', '..T.*', '...TG'],
        loop: { times: 4, slots: 2 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan', 'bawah'] },
      },
      {
        grid: ['S...', 'T*..', '.T.*', '..TG'],
        loop: { times: 3, slots: 2 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan', 'bawah'] },
      },
    ]),
    codeSlot('l6', STAMP.l6!, 'Satu langkah dulu, baru ulangi panahnya. Kamu pasti bisa!', CAST, [
      {
        grid: ['S#...', '..*.G', '.....'],
        loop: { times: 4, slots: 1 },
        spare: 1,
        solution: { main: ['bawah', 'ulangi'], loop: ['kanan'] },
      },
      {
        grid: ['S#...', '.....', '.*..G'],
        loop: { times: 4, slots: 1 },
        spare: 1,
        solution: { main: ['bawah', 'bawah', 'ulangi'], loop: ['kanan'] },
      },
    ]),
    codeSlot('l7', STAMP.l7!, 'Ada yang salah di kode ulangi. Jalankan, lalu perbaiki urutannya!', CAST, [
      {
        grid: ['S...', 'T*..', '.T.*', '..TG'],
        loop: { times: 3, slots: 2 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan', 'bawah'] },
        given: { main: ['ulangi'], loop: ['bawah', 'kanan'] },
      },
      {
        grid: ['S.*..', 'TT..*', '..T.G'],
        loop: { times: 2, slots: 3 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan', 'kanan', 'bawah'] },
        given: { main: ['ulangi'], loop: ['kanan', 'bawah', 'kanan'] },
      },
    ]),
    codeSlot('l8', STAMP.l8!, 'Pola jalannya berulang. Cari polanya, lalu pakai kartu ulangi!', CAST, [
      {
        grid: ['S.*..', 'TT..*', '..T.G'],
        loop: { times: 2, slots: 3 },
        spare: 1,
        solution: { main: ['ulangi'], loop: ['kanan', 'kanan', 'bawah'] },
      },
    ]),
    codeSlot('l9', STAMP.l9!, 'Misi besar! Ambil semua stroberi, lalu pergi ke taman.', CAST, [
      {
        grid: ['...TG', '....*', '...*T', '..*T.', 'S.T..'],
        loop: { times: 3, slots: 2 },
        spare: 1,
        solution: { main: ['kanan', 'ulangi', 'atas'], loop: ['atas', 'kanan'] },
      },
    ]),
  ],
};

export default config;
