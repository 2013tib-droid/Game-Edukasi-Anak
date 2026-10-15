import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { ruleSlot, type RuleSlotOpts } from '@/games/ruleLevels';

/**
 * "Pabrik Mainan" (Playgroup & TK) — coding anak bagian kedua: PERCABANGAN
 * ("kalau … masuk ke sini"). Saudara Kode Kelinci (urutan); template
 * `rule-sort`. Anak memasang TANDA warna/bentuk di papan nama tiap kotak,
 * menekan ▶️ Jalankan, lalu mesin memilah mainan yang lewat di ban berjalan:
 * mainan jatuh ke kotak pertama yang tandanya cocok.
 *
 * Logika yang dilatih bukan cuma mencocokkan warna: anak MENEBAK aturannya
 * dari isi kotak, memutuskan sendiri apakah yang sama itu warnanya atau
 * bentuknya, MEMBACA program yang sudah jadi (mode TEBAK: mainan ini masuk
 * kotak mana?), memperbaiki tanda yang tertukar, mengenal tanda LAINNYA
 * (`else`), dan di misi besar memasang aturan untuk mainan RAHASIA yang
 * belum terlihat — aturannya harus berlaku untuk mainan apa pun.
 *
 * SLOT (urutan tetap, makin sulit — setara Kode Kelinci)
 *   l1 pesanan warna terlihat (gelembung)   l6 warna ATAU bentuk?
 *   l2 tebak warna dari isi kotak           l7 TEBAK: tiga kotak, warna & bentuk
 *   l3 tebak bentuk dari isi kotak          l8 PERBAIKI tanda yang tertukar
 *   l4 TEBAK: mainan masuk kotak mana?      l9 kenalan tanda LAINNYA
 *   l5 tiga kotak, tebak warna              l10 MISI BESAR: mainan rahasia
 *
 * - Soal TEBAK di TK tanpa jebakan urutan (`plain`): tiap mainan cocok dengan
 *   tepat satu kotak. Prioritas kotak kiri itu materi Robot Pemilah (SD).
 * - Varian = rancangan yang DIWARNAI ULANG (`ruleSlot`), jadi warna & bentuk
 *   berganti tiap main. Satu kalimat per slot.
 * - Bentuk `kotak` sengaja tidak dipakai — tujuan mainan juga disebut "kotak".
 * - Hewan pemilik kotak = seni WebP (aturan lama: hewan WAJIB seni).
 * - Semua soal diperiksa dua kali: builder (`ruleLevels.ts`) & CI
 *   (`scripts/check-rule-levels.mjs` — isi kotak HARUS cukup untuk menebak
 *   aturannya, tak boleh ada tebakan lain yang juga masuk akal).
 */

const OPTS: RuleSlotOpts = {
  owners: ['rabbit', 'panda', 'cat', 'bear', 'elephant', 'monkey', 'penguin', 'koala'],
  machine: 'corong',
  plain: true,
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🧸', label: 'Boneka' },
  l2: { emoji: '🎈', label: 'Balon' },
  l3: { emoji: '🪁', label: 'Layangan' },
  l4: { emoji: '🪀', label: 'Yoyo' },
  l5: { emoji: '🚂', label: 'Kereta' },
  l6: { emoji: '🎨', label: 'Cat' },
  l7: { emoji: '🥁', label: 'Gendang' },
  l8: { emoji: '🧩', label: 'Puzzle' },
  l9: { emoji: '🚗', label: 'Mobil' },
  l10: { emoji: '🎁', label: 'Hadiah' },
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
      'l3',
      STAMP.l3!,
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
      'l4',
      STAMP.l4!,
      'Tandanya sudah dipasang. Mainan ini masuk kotak mana? Sentuh kotaknya!',
      [
        {
          mode: 'tebak',
          boxes: [{ rule: ['merah'] }, { rule: ['biru'] }],
          queue: ['biru lingkaran', 'merah bintang', 'merah hati', 'biru segitiga', 'biru bintang'],
          tray: [],
        },
        {
          mode: 'tebak',
          boxes: [{ rule: ['bintang'] }, { rule: ['hati'] }],
          queue: ['merah hati', 'kuning bintang', 'biru bintang', 'kuning hati', 'merah bintang'],
          tray: [],
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
      'Ada tanda warna dan tanda bentuk. Mainan ini masuk kotak mana?',
      [
        {
          // Warna · bentuk · warna — tiap mainan cocok dengan satu kotak saja.
          mode: 'tebak',
          boxes: [{ rule: ['merah'] }, { rule: ['bintang'] }, { rule: ['biru'] }],
          queue: ['kuning bintang', 'biru hati', 'merah lingkaran', 'hijau bintang', 'biru segitiga', 'merah hati'],
          tray: [],
        },
        {
          mode: 'tebak',
          boxes: [{ rule: ['lingkaran'] }, { rule: ['kuning'] }, { rule: ['hati'] }],
          queue: ['kuning bintang', 'merah hati', 'biru lingkaran', 'kuning segitiga', 'hijau hati', 'merah lingkaran'],
          tray: [],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l8',
      STAMP.l8!,
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
      'l9',
      STAMP.l9!,
      'Tanda Lainnya untuk semua mainan sisanya. Pasang di kotak terakhir!',
      [
        {
          boxes: [
            { ex: ['merah lingkaran', 'merah bintang'], rule: ['merah'] },
            { ex: ['biru hati', 'biru segitiga'], rule: ['biru'] },
            { ex: ['kuning bintang', 'hijau lingkaran'], rule: ['lainnya'] },
          ],
          queue: ['kuning hati', 'biru lingkaran', 'merah segitiga', 'hijau segitiga', 'biru bintang'],
          tray: ['merah', 'kuning', 'biru', 'hijau', 'lainnya'],
        },
      ],
      OPTS,
    ),
    ruleSlot(
      'l10',
      STAMP.l10!,
      'Misi besar! Mainannya rahasia. Lihat isi kotak, lalu pasang tandanya!',
      [
        {
          hidden: true,
          boxes: [
            { ex: ['merah bintang', 'biru bintang'], rule: ['bintang'] },
            { ex: ['kuning lingkaran', 'kuning hati'], rule: ['kuning'] },
            { ex: ['merah hati', 'biru lingkaran'], rule: ['lainnya'] },
          ],
          queue: ['hijau bintang', 'kuning segitiga', 'merah segitiga', 'biru hati', 'kuning lingkaran', 'merah bintang'],
          tray: ['merah', 'kuning', 'biru', 'bintang', 'lingkaran', 'hati', 'lainnya'],
        },
        {
          hidden: true,
          boxes: [
            { ex: ['merah lingkaran', 'merah hati'], rule: ['merah'] },
            { ex: ['biru segitiga', 'kuning segitiga'], rule: ['segitiga'] },
            { ex: ['kuning bintang', 'biru hati'], rule: ['lainnya'] },
          ],
          queue: ['merah bintang', 'hijau segitiga', 'biru lingkaran', 'kuning hati', 'merah lingkaran', 'biru segitiga'],
          tray: ['merah', 'kuning', 'biru', 'segitiga', 'lingkaran', 'hati', 'lainnya'],
        },
      ],
      OPTS,
    ),
  ],
};

export default config;
