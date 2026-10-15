import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { ruleSlot, type RuleSlotOpts } from '@/games/ruleLevels';

/**
 * "Pabrik Mainan" (Playgroup & TK) — coding anak bagian kedua: PERCABANGAN
 * ("kalau … masuk ke sini"). Saudara Kode Kelinci (urutan); template
 * `rule-sort`. Anak memasang TANDA warna/bentuk di papan nama tiap kotak,
 * menekan ▶️ Jalankan, lalu mesin memilah mainan yang lewat di ban berjalan:
 * mainan jatuh ke kotak pertama yang tandanya cocok.
 *
 * Logika yang dilatih bukan cuma mencocokkan warna: mulai slot 3 anak MENEBAK
 * aturannya dari isi kotak (dua mainan yang sudah ada di dalam), dan di
 * slot 6 & 8 ia harus memutuskan sendiri — yang sama itu warnanya atau
 * bentuknya? Satu aturan yang dipasang sekali berlaku untuk SEMUA mainan yang
 * lewat — itulah inti pemrograman.
 *
 * SLOT (urutan tetap, makin sulit)
 *   l1 pesanan warna terlihat (gelembung)   l5 tiga kotak, tebak warna
 *   l2 pesanan bentuk terlihat (gelembung)  l6 warna ATAU bentuk?
 *   l3 tebak warna dari isi kotak           l7 PERBAIKI tanda yang tertukar
 *   l4 tebak bentuk dari isi kotak          l8 MISI BESAR: tiga kotak, tebak sendiri
 *
 * - Varian = rancangan yang DIWARNAI ULANG (`ruleSlot`), jadi warna & bentuk
 *   berganti tiap main. Satu kalimat per slot (8 rekaman).
 * - Bentuk `kotak` sengaja tidak dipakai — tujuan mainan juga disebut "kotak".
 * - Hewan pemilik kotak = seni WebP (aturan lama: hewan WAJIB seni).
 * - Semua soal diperiksa dua kali: builder (`ruleLevels.ts`) & CI
 *   (`scripts/check-rule-levels.mjs` — isi kotak HARUS cukup untuk menebak
 *   aturannya, tak boleh ada tebakan lain yang juga masuk akal).
 */

const OPTS: RuleSlotOpts = {
  owners: ['rabbit', 'panda', 'cat', 'bear', 'elephant', 'monkey', 'penguin', 'koala'],
  machine: 'corong',
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🧸', label: 'Boneka' },
  l2: { emoji: '🪀', label: 'Yoyo' },
  l3: { emoji: '🎈', label: 'Balon' },
  l4: { emoji: '🪁', label: 'Layangan' },
  l5: { emoji: '🚂', label: 'Kereta' },
  l6: { emoji: '🎨', label: 'Cat' },
  l7: { emoji: '🧩', label: 'Puzzle' },
  l8: { emoji: '🎁', label: 'Hadiah' },
};

const config: GameConfig<'rule-sort'> = {
  id: 'pabrik-mainan',
  group: 'tk',
  title: 'Pabrik Mainan',
  emoji: '🧸',
  template: 'rule-sort',
  project: { title: 'Toko Mainan' },
  hints: true,
  levels: [
    ruleSlot(
      'l1',
      STAMP.l1!,
      'Lihat pesanan hewan. Pasang tanda warnanya, lalu tekan Jalankan!',
      [
        {
          bubbles: true,
          boxes: [{ rule: ['merah'] }, { rule: ['biru'] }],
          queue: ['merah lingkaran', 'biru bintang', 'merah segitiga', 'biru hati'],
          tray: 'warna',
          extra: ['kuning'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l2',
      STAMP.l2!,
      'Sekarang pesanannya bentuk. Pasang tanda bentuknya, ya!',
      [
        {
          bubbles: true,
          boxes: [{ rule: ['lingkaran'] }, { rule: ['bintang'] }],
          queue: ['merah lingkaran', 'biru bintang', 'kuning bintang', 'hijau lingkaran'],
          tray: 'bentuk',
          extra: ['segitiga'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l3',
      STAMP.l3!,
      'Lihat isi kotaknya. Warna apa yang ada di dalam? Pasang tandanya!',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'merah bintang'], rule: ['merah'] },
            { ex: ['biru segitiga', 'biru lingkaran'], rule: ['biru'] },
          ],
          queue: ['biru bintang', 'merah segitiga', 'merah hati', 'biru hati'],
          tray: 'warna',
          extra: ['kuning'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l4',
      STAMP.l4!,
      'Lihat isi kotaknya. Bentuk apa yang ada di dalam? Pasang tandanya!',
      [
        {
          boxes: [
            { ex: ['merah bintang', 'biru bintang'], rule: ['bintang'] },
            { ex: ['kuning lingkaran', 'merah lingkaran'], rule: ['lingkaran'] },
          ],
          queue: ['kuning bintang', 'biru lingkaran', 'hijau bintang', 'hijau lingkaran'],
          tray: 'bentuk',
          extra: ['segitiga'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l5',
      STAMP.l5!,
      'Ada tiga kotak! Lihat isinya, lalu pasang tanda yang cocok.',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'merah segitiga'], rule: ['merah'] },
            { ex: ['biru bintang', 'biru hati'], rule: ['biru'] },
            { ex: ['kuning segitiga', 'kuning lingkaran'], rule: ['kuning'] },
          ],
          queue: ['kuning bintang', 'merah hati', 'biru lingkaran', 'kuning hati', 'merah bintang'],
          tray: 'warna',
          extra: ['hijau'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l6',
      STAMP.l6!,
      'Hmm, warna atau bentuk? Lihat isi kotaknya baik-baik!',
      [
        {
          // Yang sama = WARNA (bentuknya ada di kedua kotak).
          boxes: [
            { ex: ['merah lingkaran', 'merah bintang'], rule: ['merah'] },
            { ex: ['biru lingkaran', 'biru bintang'], rule: ['biru'] },
          ],
          queue: ['biru lingkaran', 'merah bintang', 'merah lingkaran', 'biru bintang'],
          tray: 'semua',
        },
        {
          // Yang sama = BENTUK (warnanya ada di kedua kotak).
          boxes: [
            { ex: ['merah segitiga', 'biru segitiga'], rule: ['segitiga'] },
            { ex: ['merah hati', 'biru hati'], rule: ['hati'] },
          ],
          queue: ['biru hati', 'merah segitiga', 'biru segitiga', 'merah hati'],
          tray: 'semua',
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l7',
      STAMP.l7!,
      'Ada tanda yang tertukar! Lihat isi kotaknya, lalu perbaiki.',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'merah hati'], rule: ['merah'], given: ['merah'] },
            { ex: ['biru segitiga', 'biru bintang'], rule: ['biru'], given: ['kuning'] },
            { ex: ['kuning hati', 'kuning bintang'], rule: ['kuning'], given: ['biru'] },
          ],
          queue: ['biru lingkaran', 'kuning segitiga', 'merah bintang', 'biru hati', 'kuning lingkaran'],
          tray: 'warna',
        },
        {
          boxes: [
            { ex: ['merah bintang', 'kuning bintang'], rule: ['bintang'], given: ['lingkaran'] },
            { ex: ['biru lingkaran', 'merah lingkaran'], rule: ['lingkaran'], given: ['bintang'] },
          ],
          queue: ['biru bintang', 'kuning lingkaran', 'hijau bintang', 'hijau lingkaran'],
          tray: 'bentuk',
          extra: ['hati'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l8',
      STAMP.l8!,
      'Misi besar! Pasang tanda di tiga kotak!',
      [
        {
          // Tiga BENTUK — warnanya sengaja menyeberang kotak.
          boxes: [
            { ex: ['merah lingkaran', 'biru lingkaran'], rule: ['lingkaran'] },
            { ex: ['merah bintang', 'kuning bintang'], rule: ['bintang'] },
            { ex: ['biru hati', 'kuning hati'], rule: ['hati'] },
          ],
          queue: ['kuning lingkaran', 'biru bintang', 'merah hati', 'merah lingkaran', 'kuning bintang', 'biru hati'],
          tray: 'semua',
        },
        {
          // Tiga WARNA — bentuknya sengaja menyeberang kotak.
          boxes: [
            { ex: ['merah segitiga', 'merah lingkaran'], rule: ['merah'] },
            { ex: ['biru lingkaran', 'biru hati'], rule: ['biru'] },
            { ex: ['kuning hati', 'kuning segitiga'], rule: ['kuning'] },
          ],
          queue: ['biru segitiga', 'kuning lingkaran', 'merah hati', 'biru lingkaran', 'kuning segitiga', 'merah segitiga'],
          tray: 'semua',
        },
      ],
      OPTS,
    ),
  ],
};

export default config;
