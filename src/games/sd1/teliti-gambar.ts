import type { GameConfig } from '@/engine/core/types';
import { spotSlot, type SpotSpec } from '@/games/spotLevels';

/**
 * "Teliti Gambar" (SD Kelas 1 & 2) — saudara "Cari Beda" (TK) yang lebih
 * sulit: LIMA perbedaan, benda lebih kecil & lebih banyak, dan jenis
 * perbedaan yang halus — menghadap ke arah lain, jadi lebih besar.
 * Template `spot-diff` (2026-10-31).
 *
 * SLOT (urutan tetap)
 *   l1–l2 hilang · muncul · tertukar · berganti warna
 *   l3–l4 + menghadap ke arah lain
 *   l5–l6 + jadi lebih besar
 *   l7–l8 MISI TELITI: semuanya, wajib ada arah DAN besar
 */

const BASE: SpotSpec = { layout: 'sd', count: 5, kinds: ['hilang', 'tambah', 'tukar', 'warna'], must: ['tukar', 'warna'] };
const FLIP: SpotSpec = { layout: 'sd', count: 5, kinds: ['hilang', 'tambah', 'tukar', 'warna', 'balik'], must: ['balik', 'tukar'] };
const GROW: SpotSpec = { layout: 'sd', count: 5, kinds: ['hilang', 'tambah', 'tukar', 'warna', 'balik', 'besar'], must: ['besar', 'warna'] };
const ALL: SpotSpec = { layout: 'sd', count: 5, kinds: ['hilang', 'tambah', 'tukar', 'warna', 'balik', 'besar'], must: ['balik', 'besar'] };

const config: GameConfig<'spot-diff'> = {
  id: 'teliti-gambar',
  group: 'sd1',
  title: 'Teliti Gambar',
  emoji: '🖼️',
  template: 'spot-diff',
  levels: [
    spotSlot('l1', 'Temukan lima perbedaan di dua gambar ini!', BASE, 6, 0),
    spotSlot('l2', 'Temukan lima perbedaan di dua gambar ini!', BASE, 6, 3),
    spotSlot('l3', 'Lima perbedaan! Perhatikan juga arah hadapnya.', FLIP, 6, 1),
    spotSlot('l4', 'Lima perbedaan! Perhatikan juga arah hadapnya.', FLIP, 6, 4),
    spotSlot('l5', 'Lima perbedaan! Ada yang jadi lebih besar juga.', GROW, 6, 2),
    spotSlot('l6', 'Lima perbedaan! Ada yang jadi lebih besar juga.', GROW, 6, 5),
    spotSlot('l7', 'Misi teliti! Temukan lima perbedaan sampai habis.', ALL, 6, 0),
    spotSlot('l8', 'Misi teliti! Temukan lima perbedaan sampai habis.', ALL, 6, 3),
  ],
};

export default config;
