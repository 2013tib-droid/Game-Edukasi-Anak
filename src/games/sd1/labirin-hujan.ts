import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { mazeSlot, type MazeCast } from '@/games/mazeLevels';

/**
 * "Labirin Hujan" (SD Kelas 1 & 2, 2026-11-05) — saudara Taman Labirin (TK)
 * yang sengaja LEBIH SULIT. Taman habis diguyur hujan: GENANGAN AIR menutup
 * lorong. Permintaan pemilik: "ganti jalan buntu jadi genangan air (tidak
 * bisa lewat)", "kandang gaboleh dilewatin, taruh paling ujung", lebih susah
 * & lebih seru dari versi TK.
 *
 * Yang membuatnya lebih sulit (semuanya fitur engine `maze`, builder
 * `buildRain` di mazeLevels.ts):
 * - Labirinnya BER-PUTARAN, lalu genangan ditaruh mesin TEPAT di jalan pintas
 *   yang paling menggoda — anak harus merencanakan jalan memutar, bukan
 *   sekadar menyusuri lorong. Petak sebelum genangan = jalan buntu jebakan
 *   (salah senyap seperti di TK).
 * - Tujuan SELALU di ujung jalan buntu terjauh (satu pintu), jadi kandang tak
 *   mungkin dilewati. Kalau ada barang, kandang TERKUNCI 🔒 sampai semuanya
 *   terambil — mencoba masuk cuma memantul.
 * - Labirin lebih besar (sampai 6×8) dan barang sampai tiga.
 *
 * SLOT (urutan tetap, makin belakang makin sulit)
 *   l1 5×5 kenalan genangan        l5 6×7 dua barang + genangan
 *   l2 5×6 dua genangan            l6 6×7 banyak genangan
 *   l3 6×6 + satu barang, kandang  l7 6×8 dua barang
 *   l4 6×6 tiga genangan           l8 MISI BESAR 6×8 tiga barang, banyak genangan
 *
 * - Hewan yang sudah berseni, nol aset baru. Bebek SENGAJA tidak dipakai
 *   (bebek kan berenang — genangan tak masuk akal menghalanginya).
 * - Judul TIDAK menyebut nama hewan (keputusan pemilik 2026-10-16).
 */

const RABBIT: MazeCast = { hero: 'rabbit', name: 'kelinci', heroFaces: 'kiri', goal: 'carrot', goalName: 'wortel', scene: 'kebun' };
const CHICKEN: MazeCast = { hero: 'chicken', name: 'ayam', heroFaces: 'kanan', goal: 'corn', goalName: 'jagung', scene: 'sawah' };
const CAT: MazeCast = { hero: 'cat', name: 'kucing', heroFaces: 'kanan', goal: 'milk', goalName: 'susu', scene: 'padang' };
const HORSE: MazeCast = { hero: 'horse', name: 'kuda', heroFaces: 'kanan', goal: 'apple', goalName: 'apel', scene: 'padang' };
const TURTLE: MazeCast = { hero: 'turtle', name: 'kura-kura', heroFaces: 'kanan', goal: 'flower', goalName: 'bunga', scene: 'hutan' };
const FIND = [CAT, HORSE, RABBIT, TURTLE, CHICKEN];

const home = (c: MazeCast): MazeCast => ({ ...c, pickup: c.goal, pickupName: c.goalName, goal: 'barn', goalName: 'kandang' });
const HOME = [home(CHICKEN), home(HORSE), home(RABBIT)];

/**
 * Nomor percobaan benih yang lolos, per varian (lihat `seeds` di mazeSlot):
 * labirin hujan dibuat di HP anak, dan tanpa ini syaratnya bisa butuh ratusan
 * percobaan. Kalau spec slot diubah, build gagal & menyebut angka barunya.
 */
const SEEDS: Record<string, number[]> = {
  l1: [2, 1, 0, 6, 0],
  l2: [197, 2, 51, 27, 180],
  l3: [340, 20, 19, 61, 28],
  l4: [116, 63, 35, 172, 25],
  l5: [126, 68, 76, 96, 18],
  l6: [2323, 24, 462, 156, 286],
  l7: [827, 246, 676, 1225, 2414],
  l8: [2904, 10120, 3220, 13299, 13727],
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '☔', label: 'Payung' },
  l2: { emoji: '💧', label: 'Tetes' },
  l3: { emoji: '🐌', label: 'Siput' },
  l4: { emoji: '🍄', label: 'Jamur' },
  l5: { emoji: '🐸', label: 'Katak' },
  l6: { emoji: '🌧️', label: 'Hujan' },
  l7: { emoji: '🌈', label: 'Pelangi' },
  l8: { emoji: '🏆', label: 'Juara' },
};

const config: GameConfig<'maze'> = {
  id: 'labirin-hujan',
  group: 'sd1',
  title: 'Labirin Hujan',
  emoji: '☔',
  template: 'maze',
  project: { title: 'Taman Sehabis Hujan' },
  hints: true,
  levels: [
    mazeSlot('l1', STAMP.l1!, (c) => `Habis hujan, ada genangan! Antar ${c.name} ke ${c.goalName}.`, { cols: 5, rows: 5, braid: 0.6, puddles: 1, minPath: 0.36 }, FIND, 5, SEEDS.l1),
    mazeSlot('l2', STAMP.l2!, (c) => `Genangan menutup jalan. Cari jalan memutar ke ${c.goalName}!`, { cols: 5, rows: 6, braid: 0.5, puddles: 2, minPath: 0.36, minForks: 2, minDead: 5 }, FIND, 5, SEEDS.l2),
    mazeSlot('l3', STAMP.l3!, (c) => `Kandang terkunci! Ambil ${c.pickupName} dulu, baru pulang.`, { cols: 6, rows: 6, braid: 0.5, puddles: 2, pickups: 1, minPath: 0.3, minForks: 2, minDead: 5 }, HOME, 5, SEEDS.l3),
    mazeSlot('l4', STAMP.l4!, (c) => `Banyak genangan! Rencanakan jalanmu ke ${c.goalName}.`, { cols: 6, rows: 6, braid: 0.6, puddles: 3, minPath: 0.36, minForks: 3, minDead: 5 }, FIND, 5, SEEDS.l4),
    mazeSlot('l5', STAMP.l5!, (c) => `Ambil semua ${c.pickupName}, lalu pulang ke kandang!`, { cols: 6, rows: 7, braid: 0.5, puddles: 2, pickups: 2, minPath: 0.3, minForks: 3, minDead: 5 }, HOME, 5, SEEDS.l5),
    mazeSlot('l6', STAMP.l6!, (c) => `Hujan deras! Hindari genangan, cari ${c.goalName}.`, { cols: 6, rows: 7, braid: 0.65, puddles: 4, minPath: 0.36, minForks: 4, minDead: 5 }, FIND, 5, SEEDS.l6),
    mazeSlot('l7', STAMP.l7!, (c) => `Kumpulkan semua ${c.pickupName}, lalu buka kandangnya!`, { cols: 6, rows: 8, braid: 0.4, puddles: 3, pickups: 2, minPath: 0.28, minForks: 3, minDead: 6 }, HOME, 5, SEEDS.l7),
    mazeSlot('l8', STAMP.l8!, (c) => `Misi besar! Kumpulkan semua ${c.pickupName}, hindari genangan!`, { cols: 6, rows: 8, braid: 0.35, puddles: 3, pickups: 3, minPath: 0.28, minForks: 3, minDead: 6 }, HOME, 5, SEEDS.l8),
  ],
};

export default config;
