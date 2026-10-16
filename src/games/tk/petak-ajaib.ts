import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { colorSlot, type ColorCast } from '@/games/colorLevels';

/**
 * "Petak Ajaib" (Playgroup & TK) — coding anak bagian kedua (template
 * `color-path`, 2026-10-16): ayam berjalan SENDIRI lurus ke depan, anak
 * memasang SATU panah per WARNA petak ("kalau menginjak merah, belok ke
 * bawah"), lalu menekan ▶️ Jalankan. Menggantikan "Pabrik Mainan" yang
 * dinilai pemilik terlalu mudah ("cuma cocok gambar"); keputusan pemilik:
 * "Petak Warna" seperti Kode Kelinci, tapi berpikir.
 *
 * Yang membuatnya berpikir: satu aturan berlaku untuk SEMUA petak sewarna,
 * jadi satu panah harus cocok di beberapa tempat sekaligus.
 *
 * SLOT (urutan tetap)
 *   l1 satu warna, satu belokan (kenalan)
 *   l2 dua warna
 *   l3 satu warna dipakai di DUA belokan
 *   l4 petak sewarna yang satu membelokkan, yang lain menyuruh terus
 *   l5 batu menghalangi → jalan memutar
 *   l6 ambil jagung, lalu pulang ke kandang
 *   l7 jalan berkelok tiga warna
 *   l8 MISI BESAR: dua jagung + kandang
 *
 * - Varian = rancangan yang dicerminkan/diputar DAN diwarnai ulang
 *   (`colorSlot`), jadi narasi TIDAK BOLEH menyebut warna tertentu.
 * - Tiap rancangan punya tepat SATU susunan aturan yang benar
 *   (`scripts/check-color-levels.mjs`, CI).
 * - Rumah hewan = kandang (`barn`), bukan rumah manusia (aturan lama).
 */

const CORN: ColorCast = { hero: 'chicken', heroFaces: 'kanan', goal: 'corn' };
const HOME: ColorCast = { hero: 'chicken', heroFaces: 'kanan', goal: 'barn', pickup: 'corn' };

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🌽', label: 'Jagung' },
  l2: { emoji: '🌱', label: 'Tunas' },
  l3: { emoji: '🌻', label: 'Bunga' },
  l4: { emoji: '🥚', label: 'Telur' },
  l5: { emoji: '🍄', label: 'Jamur' },
  l6: { emoji: '🛖', label: 'Kandang' },
  l7: { emoji: '🦋', label: 'Kupu' },
  l8: { emoji: '🌈', label: 'Pelangi' },
};

const config: GameConfig<'color-path'> = {
  id: 'petak-ajaib',
  group: 'tk',
  title: 'Ayam Cari Jagung',
  emoji: '🐔',
  template: 'color-path',
  project: { title: 'Kebun Ayam' },
  hints: true,
  levels: [
    colorSlot('l1', STAMP.l1!, 'Ayam berjalan sendiri. Pasang panah di petak warna supaya sampai!', CORN, [
      { grid: ['.....', 'S..m.', '...G.'], start: 'kanan', solution: { merah: 'bawah' } },
    ]),
    colorSlot('l2', STAMP.l2!, 'Ada dua warna. Pasang panah untuk tiap warna, lalu Jalankan!', CORN, [
      { grid: ['S..m..', '......', '...b.G'], start: 'kanan', solution: { merah: 'bawah', biru: 'kanan' } },
    ]),
    colorSlot('l3', STAMP.l3!, 'Satu panah berlaku untuk semua petak yang sama warnanya!', CORN, [
      { grid: ['S.m...', '..bm..', '...b.G'], start: 'kanan', solution: { merah: 'bawah', biru: 'kanan' } },
    ]),
    colorSlot('l4', STAMP.l4!, 'Petak sewarna ikut panah yang sama. Pikirkan baik-baik!', CORN, [
      { grid: ['S.km..', '......', '...k.G'], start: 'kanan', solution: { merah: 'bawah', kuning: 'kanan' } },
    ]),
    colorSlot('l5', STAMP.l5!, 'Awas, ada batu! Atur panahnya supaya ayam memutar.', CORN, [
      {
        grid: ['..b.k.', 'S.m#bG', '......'],
        start: 'kanan',
        solution: { merah: 'atas', kuning: 'bawah', biru: 'kanan' },
      },
    ]),
    colorSlot('l6', STAMP.l6!, 'Ambil jagungnya dulu, lalu pulang ke kandang!', HOME, [
      {
        grid: ['S..m..', '......', '...b*m', '.G...k'],
        start: 'kanan',
        solution: { merah: 'bawah', kuning: 'kiri', biru: 'kanan' },
      },
    ]),
    colorSlot('l7', STAMP.l7!, 'Jalannya berkelok. Ke mana ayam harus belok?', CORN, [
      { grid: ['.G....', '.b.m..', '......', 'S..b..'], start: 'kanan', solution: { merah: 'kiri', biru: 'atas' } },
    ]),
    colorSlot('l8', STAMP.l8!, 'Misi besar! Ambil semua jagung, lalu pulang ke kandang.', HOME, [
      {
        grid: ['S.*.m.', '......', 'm.h.k.', '*.....', 'G.....'],
        start: 'kanan',
        solution: { merah: 'bawah', kuning: 'kiri', hijau: 'kiri' },
      },
    ]),
  ],
};

export default config;
