import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { colorSlot, type ColorCast } from '@/games/colorLevels';

/**
 * "Kode Warna" (SD Kelas 1 & 2) — saudara "Petak Ajaib" (TK) yang sengaja
 * lebih sulit, template `color-path` yang sama (2026-10-16, menggantikan
 * "Robot Pemilah"). Kucing berjalan sendiri; anak memasang satu panah per
 * warna petak. Gagasan coding-nya: ATURAN BERSYARAT ("kalau merah, belok
 * bawah") yang berlaku di banyak tempat sekaligus, plus MEMPERBAIKI aturan.
 *
 * SLOT (urutan tetap)
 *   l1 tangga: dua warna bergantian
 *   l2 petak sewarna yang menyuruh terus lurus
 *   l3 ambil dua susu, lalu pulang
 *   l4 PERBAIKI: aturan sudah terpasang, satu salah
 *   l5 jalan memutar jauh
 *   l6 petak sewarna didatangi dari arah berbeda
 *   l7 spiral empat warna
 *   l8 PERBAIKI: susu tertinggal
 *   l9 MISI BESAR: spiral empat warna, tiga susu
 *   l10 DUA TOKOH: kucing & ayam, warna yang membelokkan satu tokoh
 *       menyuruh tokoh lain terus lurus
 *   l11 DUA TOKOH: jalan pintas kucing menyesatkan ayam — cari jalan lain
 *   l12 MISI BESAR DUA TOKOH: empat warna, satu aturan untuk berdua
 *
 * - Varian dicerminkan/diputar DAN diwarnai ulang (`colorSlot`) — narasi
 *   TIDAK BOLEH menyebut warna tertentu.
 * - Tiap rancangan punya tepat SATU susunan aturan yang benar; peluang
 *   menebak asal terbesar 6,3% (`scripts/check-color-levels.mjs`, CI).
 */

const MILK: ColorCast = { hero: 'cat', heroFaces: 'kanan', goal: 'milk' };
const HOME: ColorCast = { hero: 'cat', heroFaces: 'kanan', goal: 'house', pickup: 'milk' };
/** Dua tokoh (2026-10-16, permintaan pemilik "agak susah lagi"): kucing ke rumah, ayam ke kandang. */
const DUO: ColorCast = { hero: 'cat', heroFaces: 'kanan', goal: 'house', buddy: { hero: 'chicken', heroFaces: 'kanan', goal: 'barn' } };

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🪜', label: 'Tangga' },
  l2: { emoji: '🧶', label: 'Benang' },
  l3: { emoji: '🥛', label: 'Susu' },
  l4: { emoji: '🔧', label: 'Perbaiki' },
  l5: { emoji: '🌳', label: 'Pohon' },
  l6: { emoji: '🐟', label: 'Ikan' },
  l7: { emoji: '🐌', label: 'Siput' },
  l8: { emoji: '🐞', label: 'Kumbang' },
  l9: { emoji: '🏠', label: 'Rumah' },
  l10: { emoji: '🐔', label: 'Ayam' },
  l11: { emoji: '🧭', label: 'Kompas' },
  l12: { emoji: '🎉', label: 'Pesta' },
};

const SD2 = { grid: ['S...m', 'G....', '.....', '.....', 'b.k.k'], start: 'kanan' } as const;

const config: GameConfig<'color-path'> = {
  id: 'kode-warna',
  group: 'sd1',
  title: 'Panah Warna',
  emoji: '🐱',
  template: 'color-path',
  project: { title: 'Rumah Kucing' },
  hints: true,
  levels: [
    colorSlot('l1', STAMP.l1!, 'Kucing berjalan sendiri. Pasang panah di tiap warna supaya sampai!', MILK, [
      { grid: ['S.m..', '..bm.', '...bm', '.....', '....G'], start: 'kanan', solution: { merah: 'bawah', biru: 'kanan' } },
    ]),
    colorSlot('l2', STAMP.l2!, 'Panah sewarna berlaku di semua petaknya. Pikirkan dulu!', MILK, [
      { ...SD2, grid: [...SD2.grid], solution: { merah: 'bawah', kuning: 'kiri', biru: 'atas' } },
    ]),
    colorSlot('l3', STAMP.l3!, 'Ambil semua susu dulu, lalu pulang ke rumah!', HOME, [
      {
        grid: ['S.*.m', '.....', 'b*..k', '.....', 'G....'],
        start: 'kanan',
        solution: { merah: 'bawah', kuning: 'kiri', biru: 'bawah' },
      },
    ]),
    colorSlot('l4', STAMP.l4!, 'Aturannya sudah terpasang, tapi ada yang salah. Perbaiki!', MILK, [
      {
        ...SD2,
        grid: [...SD2.grid],
        solution: { merah: 'bawah', kuning: 'kiri', biru: 'atas' },
        given: { merah: 'bawah', kuning: 'kanan', biru: 'atas' },
      },
    ]),
    colorSlot('l5', STAMP.l5!, 'Kucing harus memutar jauh. Atur panahnya!', MILK, [
      {
        grid: ['..b.k', '.....', 'S...m', '.....', '..G..'],
        start: 'kanan',
        solution: { merah: 'atas', kuning: 'kiri', biru: 'bawah' },
      },
    ]),
    colorSlot('l6', STAMP.l6!, 'Petak sewarna bisa didatangi dari arah lain. Hati-hati!', MILK, [
      {
        grid: ['.....G', '......', '..m.k.', '......', 'S.b.mb'],
        start: 'kanan',
        solution: { merah: 'kanan', kuning: 'bawah', biru: 'atas' },
      },
    ]),
    colorSlot('l7', STAMP.l7!, 'Jalannya berputar seperti siput. Atur semua warnanya!', MILK, [
      {
        grid: ['.b.k.k', '......', '......', '.h.G..', '......', 'S.h..m'],
        start: 'kanan',
        solution: { merah: 'atas', kuning: 'kiri', biru: 'bawah', hijau: 'kanan' },
      },
    ]),
    colorSlot('l8', STAMP.l8!, 'Ada susu yang terlewat. Perbaiki aturannya!', HOME, [
      {
        grid: ['S....G', '......', 'm*k..b', '......', '..m.*b'],
        start: 'bawah',
        solution: { merah: 'kanan', kuning: 'bawah', biru: 'atas' },
        given: { merah: 'kanan', kuning: 'kanan', biru: 'atas' },
      },
    ]),
    colorSlot('l9', STAMP.l9!, 'Misi besar! Ambil semua susu, lalu pulang ke rumah.', HOME, [
      {
        grid: ['S..*.m', '......', 'h..G.m', '......', '.....*', 'b*.k.k'],
        start: 'kanan',
        solution: { merah: 'bawah', kuning: 'kiri', biru: 'atas', hijau: 'kanan' },
      },
    ]),
    colorSlot('l10', STAMP.l10!, 'Kucing dan ayam memakai aturan yang sama. Antar keduanya pulang!', DUO, [
      {
        grid: ['S.m.s', '....m', '..b.G', '.g..k', '.....'],
        start: 'kanan',
        start2: 'bawah',
        solution: { merah: 'bawah', kuning: 'kiri', biru: 'kanan' },
      },
    ]),
    colorSlot('l11', STAMP.l11!, 'Jalan pintas kucing bisa menyesatkan ayam. Pikirkan dulu!', DUO, [
      {
        grid: ['S.m.G', '.....', '..b.k', '.m.s.', '.g...'],
        start: 'kanan',
        start2: 'kiri',
        solution: { merah: 'bawah', kuning: 'atas', biru: 'kanan' },
      },
    ]),
    colorSlot('l12', STAMP.l12!, 'Misi besar! Kucing ke rumah, ayam ke kandang, dengan satu aturan.', DUO, [
      {
        grid: ['S.m.G', '#....', '..b.k', '.mh.h', '.g..s'],
        start: 'kanan',
        start2: 'atas',
        solution: { merah: 'bawah', kuning: 'atas', biru: 'kanan', hijau: 'kiri' },
      },
    ]),
  ],
};

export default config;
