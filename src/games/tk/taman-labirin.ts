import type { GameConfig, LevelStamp } from '@/engine/core/types';
import { mazeSlot, type MazeCast } from '@/games/mazeLevels';

/**
 * "Taman Labirin" (Playgroup & TK, 2026-11-05) — labirin berdinding pagar
 * tanaman. Anak MENARIK tokoh dengan jari lewat lorong; garis jejak kuning
 * mengikuti jarinya, kembali ke petak sebelumnya = mundur. Keputusan pemilik:
 * TK lorong lebar, tapi ada soal yang susah juga supaya menarik; tokoh hewan
 * yang sudah berseni (nol aset baru). Versi SD yang lebih sulit (genangan air,
 * kandang terkunci): `src/games/sd1/labirin-hujan.ts`.
 *
 * SLOT (urutan tetap, makin belakang makin sulit)
 *   l1 3×3 kenalan                 l5 5×5 + satu barang dulu
 *   l2 4×4                         l6 6×6 banyak cabang
 *   l3 5×4 ada cabang              l7 6×6 + dua barang
 *   l4 5×5 jalan buntu             l8 MISI BESAR 6×7 + tiga barang
 *
 * - Labirin dibuat MESIN dari benih (`mazeLevels.ts`); tokoh & pojok mulai
 *   bergiliran per varian, jadi tiap main labirinnya lain.
 * - Masuk jalan buntu = SALAH SENYAP (sekali per petak buntu) — itulah yang
 *   menentukan bintang. Barang belum lengkap di tujuan TIDAK dihitung salah.
 * - Rumah hewan = kandang (`barn`), bukan rumah manusia (aturan lama).
 * - Judul TIDAK menyebut nama hewan (keputusan pemilik 2026-10-16).
 */

const RABBIT: MazeCast = { hero: 'rabbit', name: 'kelinci', heroFaces: 'kiri', goal: 'carrot', goalName: 'wortel', scene: 'kebun' };
const CHICKEN: MazeCast = { hero: 'chicken', name: 'ayam', heroFaces: 'kanan', goal: 'corn', goalName: 'jagung', scene: 'sawah' };
const CAT: MazeCast = { hero: 'cat', name: 'kucing', heroFaces: 'kanan', goal: 'milk', goalName: 'susu', scene: 'padang' };
const TURTLE: MazeCast = { hero: 'turtle', name: 'kura-kura', heroFaces: 'kanan', goal: 'flower', goalName: 'bunga', scene: 'hutan' };
const FIND = [RABBIT, CHICKEN, CAT, TURTLE];

const RABBIT_HOME: MazeCast = { ...RABBIT, goal: 'barn', goalName: 'kandang', pickup: 'carrot', pickupName: 'wortel' };
const CHICKEN_HOME: MazeCast = { ...CHICKEN, goal: 'barn', goalName: 'kandang', pickup: 'corn', pickupName: 'jagung' };
const HOME = [RABBIT_HOME, CHICKEN_HOME];

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🌱', label: 'Tunas' },
  l2: { emoji: '🌷', label: 'Tulip' },
  l3: { emoji: '🍄', label: 'Jamur' },
  l4: { emoji: '🦋', label: 'Kupu' },
  l5: { emoji: '🌻', label: 'Bunga' },
  l6: { emoji: '⛲', label: 'Air mancur' },
  l7: { emoji: '🎈', label: 'Balon' },
  l8: { emoji: '🏰', label: 'Istana' },
};

const config: GameConfig<'maze'> = {
  id: 'taman-labirin',
  group: 'tk',
  title: 'Taman Labirin',
  emoji: '🌿',
  template: 'maze',
  project: { title: 'Taman Labirin' },
  hints: true,
  levels: [
    mazeSlot('l1', STAMP.l1!, (c) => `Bantu ${c.name} menemukan ${c.goalName}! Tarik ${c.name} dengan jarimu.`, { cols: 3, rows: 3, minPath: 0.55 }, FIND),
    mazeSlot('l2', STAMP.l2!, (c) => `Ikuti lorongnya sampai ${c.name} tiba di ${c.goalName}!`, { cols: 4, rows: 4, minPath: 0.5, minForks: 1 }, FIND),
    mazeSlot('l3', STAMP.l3!, (c) => `Ada jalan bercabang. Pilih jalan ke ${c.goalName}, ya!`, { cols: 5, rows: 4, minPath: 0.4, minForks: 2 }, FIND),
    mazeSlot('l4', STAMP.l4!, (c) => `Hati-hati, ada jalan buntu! Antar ${c.name} ke ${c.goalName}.`, { cols: 5, rows: 5, minPath: 0.4, minForks: 3 }, FIND),
    mazeSlot('l5', STAMP.l5!, (c) => `Ambil ${c.pickupName} dulu, lalu pulang ke ${c.goalName}!`, { cols: 5, rows: 5, pickups: 1, minPath: 0.3, minForks: 2 }, HOME),
    mazeSlot('l6', STAMP.l6!, (c) => `Labirinnya besar! Cari jalan ke ${c.goalName}.`, { cols: 6, rows: 6, minPath: 0.4, minForks: 4 }, FIND),
    mazeSlot('l7', STAMP.l7!, (c) => `Ambil semua ${c.pickupName}, lalu pulang ke ${c.goalName}!`, { cols: 6, rows: 6, pickups: 2, minPath: 0.3, minForks: 3, minDead: 5 }, HOME),
    mazeSlot('l8', STAMP.l8!, (c) => `Misi besar! Kumpulkan semua ${c.pickupName}, lalu pulang ke ${c.goalName}.`, { cols: 6, rows: 7, pickups: 3, minPath: 0.3, minForks: 4, minDead: 5 }, HOME),
  ],
};

export default config;
