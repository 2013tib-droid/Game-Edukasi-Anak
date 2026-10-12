import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { codeSlot, type CodeCast } from '@/games/codeLevels';

/**
 * "Kode Kelinci" (Playgroup & TK) — coding anak pertama: anak MENYUSUN kartu
 * panah di rel kode, menekan ▶️ Jalankan, dan kelinci berjalan petak demi
 * petak (template `code-quest`). Keputusan pemilik 2026-10-12:
 * - susun dulu, baru jalankan (bukan satu langkah per ketukan);
 * - arah MUTLAK atas · kanan · bawah · kiri — tanpa maju/belok;
 * - tokoh hewan berseni + taman, nol aset baru;
 * - game ini `draft` di registry: tayang bersamaan dengan SD Kelas 3 & 4.
 *
 * SLOT (urutan tetap, papan makin besar)
 *   l1 dua langkah lurus          l5 batu menghalangi → jalan memutar
 *   l2 tiga langkah lurus         l6 pohon & kolam
 *   l3 belok sekali (3×3)         l7 ambil wortel, lalu pulang ke kandang
 *   l4 belok, papan 4×4           l8 MISI BESAR: dua wortel + kandang
 *
 * - Varian = rancangan papan yang dicerminkan/diputar (`codeSlot`), jadi arah
 *   kartunya berganti tiap main. Kalimatnya satu per slot (8 rekaman saja).
 * - Rel diberi SATU tempat lebih dari jalan terpendek: anak yang
 *   menambahkan satu kartu sesudah tiba tetap menang (tokoh berhenti di
 *   tujuan); lencana "Kode hemat!" untuk yang pas.
 * - Rumah hewan = kandang (`barn`), bukan rumah manusia (aturan lama).
 */

const CARROT: CodeCast = { hero: 'rabbit', heroFaces: 'kiri', goal: 'carrot' };
const HOME: CodeCast = { hero: 'rabbit', heroFaces: 'kiri', goal: 'barn', pickup: 'carrot' };

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🥕', label: 'Wortel' },
  l2: { emoji: '🌱', label: 'Tunas' },
  l3: { emoji: '🌷', label: 'Tulip' },
  l4: { emoji: '🌻', label: 'Bunga' },
  l5: { emoji: '🍄', label: 'Jamur' },
  l6: { emoji: '🦋', label: 'Kupu' },
  l7: { emoji: '🛖', label: 'Kandang' },
  l8: { emoji: '🌈', label: 'Pelangi' },
};

const config: GameConfig<'code-quest'> = {
  id: 'kode-kelinci',
  group: 'tk',
  title: 'Kode Kelinci',
  emoji: '🐰',
  template: 'code-quest',
  project: { title: 'Kebun Kelinci' },
  hints: true,
  levels: [
    codeSlot('l1', STAMP.l1!, 'Bantu kelinci ambil wortel! Pilih panahnya, lalu tekan Jalankan.', CARROT, [
      { grid: ['...', 'S.G', '...'] },
      { grid: ['.G.', '...', '.S.'] },
    ]),
    codeSlot('l2', STAMP.l2!, 'Wortelnya lebih jauh. Pasang panah sampai kelinci tiba!', CARROT, [
      { grid: ['....', 'S..G', '....'] },
      { grid: ['.G.', '...', '...', '.S.'] },
    ]),
    codeSlot('l3', STAMP.l3!, 'Kali ini kelinci harus belok. Susun panahnya, ya!', CARROT, [
      { grid: ['S..', '..G', '...'] },
      { grid: ['S..', '...', '.G.'] },
    ]),
    codeSlot('l4', STAMP.l4!, 'Jalannya makin panjang. Susun panahnya satu per satu!', CARROT, [
      { grid: ['S...', '....', '...G', '....'] },
      { grid: ['.S..', '....', '....', 'G...'] },
    ]),
    codeSlot('l5', STAMP.l5!, 'Awas, ada batu! Cari jalan memutar.', CARROT, [
      { grid: ['S#G', '...', '...'] },
      { grid: ['S#.G', '....'] },
    ]),
    codeSlot('l6', STAMP.l6!, 'Hati-hati, jangan sampai menabrak pohon dan kolam!', CARROT, [
      { grid: ['S.T.', '..~.', '....', 'T..G'] },
      { grid: ['S~..', '.T..', '...~', 'T..G'] },
    ]),
    codeSlot('l7', STAMP.l7!, 'Ambil wortelnya dulu, lalu pulang ke kandang!', HOME, [
      { grid: ['S.*', '...', '..G'] },
      { grid: ['S..', '#..', '*.G'] },
    ]),
    codeSlot('l8', STAMP.l8!, 'Misi besar! Ambil semua wortel, lalu pulang ke kandang.', HOME, [
      { grid: ['S*..', '.#..', '..*G'] },
      { grid: ['S..', '*#.', '..*', '..G'] },
    ]),
  ],
};

export default config;
