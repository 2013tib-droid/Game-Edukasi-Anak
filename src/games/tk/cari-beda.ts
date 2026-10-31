import type { GameConfig } from '@/engine/core/types';
import { spotSlot, type SpotSpec } from '@/games/spotLevels';

/**
 * "Cari Beda" (Playgroup & TK) — template `spot-diff` (2026-10-31, keputusan
 * pemilik dari referensi lembar "temukan perbedaan"). Dua gambar, TIGA
 * perbedaan yang mencolok, benda besar. Gambar kedua dibuat MESIN dari gambar
 * pertama (`src/engine/core/spotDiff.ts`), jadi tak ada perbedaan liar.
 *
 * SLOT (urutan tetap, makin belakang makin beragam)
 *   l1–l2 benda hilang / benda baru muncul
 *   l3–l4 + benda tertukar
 *   l5–l6 + berganti warna
 *
 * Tiap slot 6 varian, tempatnya bergiliran (taman, kebun, sawah, pantai,
 * kebun binatang, kota). Judul TANPA nama hewan (aturan pemilik).
 */

const EASY: SpotSpec = { layout: 'tk', count: 3, kinds: ['hilang', 'tambah'], must: ['tambah'] };
const SWAP: SpotSpec = { layout: 'tk', count: 3, kinds: ['hilang', 'tambah', 'tukar'], must: ['tukar'] };
const COLOR: SpotSpec = { layout: 'tk', count: 3, kinds: ['hilang', 'tambah', 'tukar', 'warna'], must: ['warna'] };

const FIND = 'Temukan tiga perbedaan di dua gambar ini!';

const config: GameConfig<'spot-diff'> = {
  id: 'cari-beda',
  group: 'tk',
  title: 'Cari Beda',
  emoji: '👀',
  template: 'spot-diff',
  levels: [
    spotSlot('l1', 'Dua gambar ini hampir sama. Ada tiga yang berbeda. Ayo temukan!', EASY, 6, 0),
    spotSlot('l2', FIND, EASY, 6, 3),
    spotSlot('l3', FIND, SWAP, 6, 1),
    spotSlot('l4', FIND, SWAP, 6, 4),
    spotSlot('l5', 'Ada yang berganti warna juga. Temukan tiga perbedaannya!', COLOR, 6, 2),
    spotSlot('l6', 'Ada yang berganti warna juga. Temukan tiga perbedaannya!', COLOR, 6, 5),
  ],
};

export default config;
