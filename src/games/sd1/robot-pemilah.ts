import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { ruleSlot, type RuleSlotOpts } from '@/games/ruleLevels';

/**
 * "Robot Pemilah" (SD Kelas 1 & 2) — saudara Pabrik Mainan (TK) yang lebih
 * sulit, template `rule-sort` yang sama. Saudara Misi Kode (urutan &
 * ulangi): di sini konsep coding-nya PERCABANGAN — `kalau … , kalau tidak …`.
 *
 * Yang ditambahkan dibanding TK (satu konsep baru per slot):
 * - UKURAN (besar/kecil) sebagai ciri ketiga;
 * - tanda LAINNYA = `else`: menangkap semua sisa, jadi hanya benar di kotak
 *   TERAKHIR (mesin memeriksa dari kiri; "lainnya" di kotak pertama menelan
 *   semua mainan — soal perbaiki slot 6 justru tentang itu);
 * - kotak DUA TANDA = DAN: mainan harus cocok dengan keduanya;
 * - URUTAN PEMERIKSAAN: kotak dua tanda harus di kiri kotak satu tanda yang
 *   tumpang tindih dengannya (slot 8) — prioritas `if / else if`.
 *
 * SLOT (urutan tetap)
 *   l1 warna atau bentuk? (dua kotak)     l6 PERBAIKI: "lainnya" salah tempat
 *   l2 tiga kotak, cari aturannya          l7 dua aturan + lainnya
 *   l3 besar & kecil                       l8 DAN + satu tanda + lainnya
 *   l4 kenalan tanda LAINNYA               l9 MISI BESAR: ukuran, DAN, lainnya
 *   l5 kenalan kotak DUA tanda (DAN)
 *
 * Isi kotak (contoh) WAJIB cukup untuk menebak aturannya tanpa ragu —
 * diperiksa `scripts/check-rule-levels.mjs` dengan mencoba SEMUA susunan
 * tanda dari baki. Varian = rancangan yang diwarnai ulang (`ruleSlot`), dan
 * di varian ganjil besar↔kecil ikut ditukar.
 */

const OPTS: RuleSlotOpts = {
  owners: ['tiger', 'giraffe', 'zebra', 'lion', 'turtle', 'frog', 'horse', 'duck'],
  machine: 'robot',
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🔩', label: 'Baut' },
  l2: { emoji: '⚙️', label: 'Roda gigi' },
  l3: { emoji: '🔋', label: 'Baterai' },
  l4: { emoji: '💡', label: 'Lampu' },
  l5: { emoji: '🧲', label: 'Magnet' },
  l6: { emoji: '🔧', label: 'Kunci' },
  l7: { emoji: '📡', label: 'Antena' },
  l8: { emoji: '🛰️', label: 'Satelit' },
  l9: { emoji: '🚀', label: 'Roket' },
};

const config: GameConfig<'rule-sort'> = {
  id: 'robot-pemilah',
  group: 'sd1',
  title: 'Robot Pemilah',
  emoji: '🤖',
  template: 'rule-sort',
  project: { title: 'Bengkel Robot' },
  hints: true,
  levels: [
    ruleSlot(
      'l1',
      STAMP.l1!,
      'Warna atau bentuk? Lihat isi kotak, lalu pasang tandanya!',
      [
        {
          boxes: [
            { ex: ['merah segitiga', 'biru segitiga'], rule: ['segitiga'] },
            { ex: ['merah bintang', 'biru bintang'], rule: ['bintang'] },
          ],
          queue: ['kuning segitiga', 'biru bintang', 'merah segitiga', 'kuning bintang', 'biru segitiga'],
          tray: 'semua',
        },
        {
          boxes: [
            { ex: ['hijau lingkaran', 'hijau hati'], rule: ['hijau'] },
            { ex: ['kuning hati', 'kuning lingkaran'], rule: ['kuning'] },
          ],
          queue: ['kuning segitiga', 'hijau lingkaran', 'hijau segitiga', 'kuning hati', 'hijau hati'],
          tray: 'semua',
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l2',
      STAMP.l2!,
      'Tiga kotak! Cari aturan setiap kotak dari isinya.',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'biru lingkaran'], rule: ['lingkaran'] },
            { ex: ['biru segitiga', 'kuning segitiga'], rule: ['segitiga'] },
            { ex: ['kuning hati', 'merah hati'], rule: ['hati'] },
          ],
          queue: ['kuning lingkaran', 'merah segitiga', 'biru hati', 'merah lingkaran', 'kuning segitiga', 'merah hati'],
          tray: 'semua',
        },
        {
          boxes: [
            { ex: ['merah bintang', 'merah segitiga'], rule: ['merah'] },
            { ex: ['hijau segitiga', 'hijau lingkaran'], rule: ['hijau'] },
            { ex: ['biru lingkaran', 'biru bintang'], rule: ['biru'] },
          ],
          queue: ['hijau bintang', 'biru segitiga', 'merah lingkaran', 'biru bintang', 'hijau lingkaran', 'merah segitiga'],
          tray: 'semua',
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l3',
      STAMP.l3!,
      'Ada mainan besar dan kecil. Lihat isinya, lalu pasang tandanya!',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'biru bintang'], rule: ['besar'] },
            { ex: ['kecil merah bintang', 'kecil biru lingkaran'], rule: ['kecil'] },
          ],
          queue: ['kecil biru bintang', 'merah bintang', 'kecil merah lingkaran', 'biru lingkaran', 'kecil merah bintang'],
          tray: 'semua',
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l4',
      STAMP.l4!,
      'Tanda Lainnya artinya semua sisanya. Pakai di kotak terakhir!',
      [
        {
          boxes: [
            { ex: ['merah bintang', 'biru bintang'], rule: ['bintang'] },
            { ex: ['merah lingkaran', 'kuning hati', 'biru segitiga'], rule: ['lainnya'] },
          ],
          queue: ['kuning bintang', 'biru hati', 'merah segitiga', 'biru bintang', 'kuning lingkaran'],
          tray: ['merah', 'biru', 'kuning', 'bintang', 'lingkaran', 'hati', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l5',
      STAMP.l5!,
      'Kotak ini punya dua tanda. Mainan harus cocok dengan keduanya!',
      [
        {
          boxes: [
            { ex: ['merah bintang', 'merah bintang'], rule: ['merah', 'bintang'] },
            { ex: ['merah lingkaran', 'biru bintang', 'kuning hati'], rule: ['lainnya'] },
          ],
          queue: ['biru bintang', 'merah bintang', 'merah hati', 'kuning bintang', 'merah bintang'],
          tray: ['merah', 'biru', 'kuning', 'bintang', 'lingkaran', 'hati', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l6',
      STAMP.l6!,
      'Semua mainan masuk kotak pertama. Perbaiki tandanya!',
      [
        {
          boxes: [
            { ex: ['biru hati', 'kuning hati'], rule: ['hati'], given: ['lainnya'] },
            { ex: ['biru lingkaran', 'merah segitiga', 'kuning bintang'], rule: ['lainnya'], given: ['hati'] },
          ],
          queue: ['merah hati', 'biru segitiga', 'kuning lingkaran', 'biru hati', 'merah bintang'],
          tray: ['merah', 'biru', 'kuning', 'lingkaran', 'hati', 'bintang', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l7',
      STAMP.l7!,
      'Tiga kotak, satu untuk semua sisanya. Atur robotnya!',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'merah bintang'], rule: ['merah'] },
            { ex: ['biru hati', 'biru segitiga'], rule: ['biru'] },
            { ex: ['kuning bintang', 'hijau lingkaran'], rule: ['lainnya'] },
          ],
          queue: ['hijau segitiga', 'biru lingkaran', 'merah hati', 'kuning hati', 'biru bintang', 'merah segitiga'],
          tray: ['merah', 'kuning', 'biru', 'hijau', 'lingkaran', 'bintang', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l8',
      STAMP.l8!,
      'Robot memeriksa kotak dari kiri. Atur tandanya!',
      [
        {
          boxes: [
            { ex: ['merah bintang'], rule: ['merah', 'bintang'] },
            { ex: ['biru bintang', 'kuning bintang'], rule: ['bintang'] },
            { ex: ['merah lingkaran', 'biru hati'], rule: ['lainnya'] },
          ],
          queue: ['kuning bintang', 'merah bintang', 'merah hati', 'biru bintang', 'kuning lingkaran', 'merah bintang'],
          tray: ['merah', 'biru', 'kuning', 'bintang', 'lingkaran', 'hati', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l9',
      STAMP.l9!,
      'Misi besar! Pecahkan aturan robotnya!',
      [
        {
          boxes: [
            { ex: ['kecil merah bintang', 'kecil merah lingkaran'], rule: ['kecil', 'merah'] },
            { ex: ['merah lingkaran', 'kecil biru lingkaran'], rule: ['lingkaran'] },
            { ex: ['kecil biru bintang', 'merah hati'], rule: ['lainnya'] },
          ],
          queue: [
            'kecil merah hati',
            'biru lingkaran',
            'kecil biru hati',
            'merah bintang',
            'kecil merah lingkaran',
            'kecil biru lingkaran',
          ],
          tray: ['kecil', 'besar', 'merah', 'biru', 'lingkaran', 'bintang', 'lainnya'],
        },
      ],
      OPTS,
    ),
  ],
};

export default config;
