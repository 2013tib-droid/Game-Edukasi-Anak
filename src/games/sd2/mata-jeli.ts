import type { GameConfig } from '@/engine/core/types';
import { spotSlot, type SpotSpec } from '@/games/spotLevels';

/**
 * "Mata Jeli" (SD Kelas 3 & 4, IPAS) — saudara paling sulit "Cari Beda" (TK)
 * & "Teliti Gambar" (SD 1-2), template `spot-diff` (2026-10-31). Masuk IPAS
 * karena yang dilatih MENGAMATI dengan teliti — keterampilan inti IPAS
 * (keputusan pemilik).
 *
 * Lebih sulit dari SD 1-2:
 * - 11 posisi, 9 benda lebih kecil, 5–7 perbedaan;
 * - perbedaan baru: PINDAH tempat, dua benda TUKAR TEMPAT (semua benda
 *   masih ada!), JUMLAH dalam kelompok berkurang, jadi LEBIH KECIL;
 * - mulai l5 jumlah perbedaan DIRAHASIAKAN: anak sendiri yang memutuskan
 *   sudah habis lalu menekan "Sudah semua!".
 *
 * SLOT (urutan tetap)
 *   l1 lima perbedaan + pindah tempat
 *   l2 lima perbedaan + lebih kecil
 *   l3 lima perbedaan + tukar tempat
 *   l4 enam perbedaan + jumlah
 *   l5–l6 RAHASIA, enam perbedaan
 *   l7–l8 MISI MATA JELI: rahasia, tujuh perbedaan, semua jenis
 */

const BASE = ['hilang', 'tambah', 'tukar', 'warna', 'balik'] as const;

const MOVE: SpotSpec = { layout: 'sd2', count: 5, kinds: [...BASE, 'pindah'], must: ['pindah'] };
const SMALL: SpotSpec = { layout: 'sd2', count: 5, kinds: [...BASE, 'pindah', 'kecil'], must: ['kecil', 'pindah'] };
const SWAP: SpotSpec = { layout: 'sd2', count: 5, kinds: [...BASE, 'kecil', 'tukar-tempat'], must: ['tukar-tempat'] };
const COUNT: SpotSpec = {
  layout: 'sd2',
  count: 6,
  kinds: [...BASE, 'kecil', 'pindah', 'jumlah'],
  must: ['jumlah', 'pindah'],
};
const SECRET: SpotSpec = {
  layout: 'sd2',
  hidden: true,
  count: 6,
  kinds: [...BASE, 'kecil', 'pindah', 'tukar-tempat', 'jumlah', 'besar'],
  must: ['tukar-tempat', 'pindah'],
};
const MISSION: SpotSpec = {
  layout: 'sd2',
  hidden: true,
  count: 7,
  kinds: [...BASE, 'kecil', 'pindah', 'tukar-tempat', 'jumlah', 'besar'],
  must: ['tukar-tempat', 'jumlah', 'kecil'],
};

const config: GameConfig<'spot-diff'> = {
  id: 'mata-jeli',
  group: 'sd2',
  title: 'Mata Jeli',
  emoji: '🧐',
  template: 'spot-diff',
  levels: [
    spotSlot('l1', 'Temukan lima perbedaan. Ada benda yang pindah tempat juga!', MOVE, 6, 0),
    spotSlot('l2', 'Lima perbedaan lagi. Ada benda yang jadi lebih kecil!', SMALL, 6, 2),
    spotSlot('l3', 'Lima perbedaan. Hati-hati, ada dua benda yang bertukar tempat!', SWAP, 6, 4),
    spotSlot('l4', 'Enam perbedaan. Hitung juga banyaknya buah!', COUNT, 6, 1),
    spotSlot('l5', 'Berapa perbedaannya? Rahasia! Cari semua, lalu tekan Sudah semua.', SECRET, 6, 3),
    spotSlot('l6', 'Berapa perbedaannya? Rahasia! Cari semua, lalu tekan Sudah semua.', SECRET, 6, 5),
    spotSlot('l7', 'Misi mata jeli! Temukan semua perbedaan, lalu tekan Sudah semua.', MISSION, 6, 0),
    spotSlot('l8', 'Misi mata jeli! Temukan semua perbedaan, lalu tekan Sudah semua.', MISSION, 6, 3),
  ],
};

export default config;
