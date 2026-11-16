import type { GameConfig } from '@/engine/core/types';
import { deliver, find, follow, scale, symbol, where, type TownDef } from '@/games/compassLevels';

/**
 * "Kurir Kompas" (SD Kelas 3 & 4 · IPAS, 2026-11-16) — peta & arah: empat
 * lalu delapan arah mata angin, membaca MAWAR ANGIN (utara tidak selalu di
 * atas), legenda, dan skala sederhana (satu kotak = seratus meter).
 *
 * Keputusan pemilik 2026-11-16 (lewat pertanyaan sebelum mulai): kurir =
 * sepeda / skuter berseni; bangunan = seni item + emoji untuk kantor pos &
 * stasiun; delapan arah ikut di slot belakang.
 *
 * BEDA dari Kode Kelinci / Misi Kode: di sana arah = sisi LAYAR dan anak
 * menyusun program. Di sini arah menempel pada PETA yang bisa diputar, dan
 * kurirnya digerakkan langsung.
 *
 * SLOT (urutan tetap, 6 varian per slot):
 *   Kelas 3: l1 ikuti arah, satu belokan     l4 ikuti arah, dua belokan
 *            l2 di sebelah mana? (4 arah)    l5 peta diputar seperempat
 *            l3 legenda & simbol
 *   Kelas 4: l6 delapan arah                 l8 skala (meter)
 *            l7 peta diputar jauh            l9 MISI BESAR antar tiga paket
 *
 * Narasi TIDAK ditulis di sini: builder menyusunnya dari arah sebenarnya
 * (peta dicerminkan per varian). Semua aturan dijaga builder DAN
 * `scripts/check-compass-levels.mjs`.
 */

// Kota kecil lima kali lima: jalan berkisi, empat blok pohon.
const KISI: TownDef = {
  rows: ['K...T', '.#.#.', 'R...H', '.#.#.', 'S...P'],
  places: { K: 'kantor-pos', T: 'toko', R: 'rumah', H: 'rumah-sakit', S: 'sekolah', P: 'taman' },
};

// Desa di tepi sungai: satu jembatan, jadi jalan memutar.
const SUNGAI: TownDef = {
  rows: ['G..#N', '.#...', '~~=~~', '...#.', 'W...D'],
  places: { G: 'pom-bensin', N: 'stasiun', W: 'sawah', D: 'kandang' },
};

// Kota enam kali enam: banyak pasangan diagonal.
const KOTA: TownDef = {
  rows: ['K....N', '.##.#.', '......', '.#.##.', '....H.', 'S.#P.R'],
  places: { K: 'kantor-pos', N: 'stasiun', H: 'rumah-sakit', S: 'sekolah', P: 'taman', R: 'rumah' },
};

// Kota besar bersungai.
const SEBERANG: TownDef = {
  rows: ['G...#W', '.#.#..', '...S.H', '~~=~~~', '...#..', '.#T..R'],
  places: { G: 'pom-bensin', W: 'sawah', S: 'sekolah', H: 'rumah-sakit', T: 'toko', R: 'rumah' },
};

const config: GameConfig<'compass-map'> = {
  id: 'kurir-kompas',
  group: 'sd2',
  title: 'Kurir Kompas',
  emoji: '🧭',
  template: 'compass-map',
  hints: true,
  project: { title: 'Peta Kurir' },
  levels: [
    // l1 — ikuti arah, satu belokan (empat arah, utara di atas)
    [
      follow('l1', '📦', { town: KISI, from: 'kantor-pos', to: 'rumah-sakit', legs: 2 }),
      follow('l1', '📦', { town: KISI, xf: 'h', from: 'sekolah', to: 'toko', legs: 2, courier: 'scooter' }),
      follow('l1', '📦', { town: KOTA, from: 'rumah-sakit', to: 'stasiun', legs: 2 }),
      follow('l1', '📦', { town: KISI, xf: 't', from: 'rumah', to: 'taman', legs: 2, courier: 'scooter' }),
      follow('l1', '📦', { town: KOTA, xf: 'h', from: 'rumah-sakit', to: 'rumah', legs: 2 }),
      follow('l1', '📦', { town: KISI, xf: 'v', from: 'taman', to: 'rumah', legs: 2, courier: 'scooter' }),
    ],
    // l2 — di sebelah mana? (empat arah)
    [
      where('l2', '🧭', { town: KISI, of: 'toko', from: 'kantor-pos' }),
      where('l2', '🧭', { town: KISI, xf: 'h', of: 'rumah', from: 'sekolah' }),
      where('l2', '🧭', { town: SUNGAI, of: 'sawah', from: 'pom-bensin' }),
      where('l2', '🧭', { town: KOTA, xf: 'h', of: 'sekolah', from: 'taman' }),
      where('l2', '🧭', { town: SUNGAI, xf: 'v', of: 'kandang', from: 'stasiun' }),
      where('l2', '🧭', { town: KOTA, of: 'kantor-pos', from: 'stasiun' }),
    ],
    // l3 — legenda & simbol
    [
      find('l3', '🗺️', { town: KOTA, place: 'kantor-pos' }),
      symbol('l3', '🗺️', { town: SUNGAI, symbol: 'sungai', choices: ['jalan', 'sungai', 'pepohonan'] }),
      find('l3', '🗺️', { town: SEBERANG, xf: 'h', place: 'pom-bensin' }),
      symbol('l3', '🗺️', { town: SEBERANG, symbol: 'jembatan', choices: ['jembatan', 'jalan', 'sungai'] }),
      find('l3', '🗺️', { town: KOTA, xf: 'v', place: 'stasiun' }),
      symbol('l3', '🗺️', { town: SUNGAI, xf: 'h', symbol: 'pepohonan', choices: ['sungai', 'jembatan', 'pepohonan'] }),
    ],
    // l4 — ikuti arah, dua belokan
    [
      follow('l4', '🚲', { town: KISI, from: 'kantor-pos', to: 'taman', legs: 3 }),
      follow('l4', '🚲', { town: KOTA, from: 'sekolah', to: 'rumah-sakit', legs: 3, courier: 'scooter' }),
      follow('l4', '🚲', { town: SEBERANG, from: 'pom-bensin', to: 'sekolah', legs: 3 }),
      follow('l4', '🚲', { town: KISI, xf: 'h', from: 'rumah', to: 'toko', legs: 3, courier: 'scooter' }),
      follow('l4', '🚲', { town: KOTA, xf: 't', from: 'kantor-pos', to: 'taman', legs: 3 }),
      follow('l4', '🚲', { town: SEBERANG, xf: 'h', from: 'pom-bensin', to: 'rumah-sakit', legs: 3, courier: 'scooter' }),
    ],
    // l5 — peta diputar seperempat: baca mawar angin dulu
    [
      where('l5', '🔄', { town: KISI, rot: 90, of: 'sekolah', from: 'kantor-pos' }),
      follow('l5', '🔄', { town: KISI, rot: 90, from: 'rumah', to: 'toko', legs: 2 }),
      where('l5', '🔄', { town: SUNGAI, rot: 90, of: 'stasiun', from: 'pom-bensin' }),
      follow('l5', '🔄', { town: KOTA, rot: 90, from: 'kantor-pos', to: 'rumah', legs: 2, courier: 'scooter' }),
      where('l5', '🔄', { town: KOTA, xf: 'h', rot: 90, of: 'stasiun', from: 'rumah' }),
      follow('l5', '🔄', { town: KISI, xf: 'v', rot: 90, from: 'sekolah', to: 'rumah-sakit', legs: 2, courier: 'scooter' }),
    ],
    // l6 — delapan arah
    [
      where('l6', '🌟', { town: KISI, of: 'taman', from: 'kantor-pos', eight: true }),
      where('l6', '🌟', { town: KOTA, of: 'rumah-sakit', from: 'taman', eight: true }),
      where('l6', '🌟', { town: SUNGAI, of: 'sawah', from: 'stasiun', eight: true }),
      where('l6', '🌟', { town: KOTA, of: 'kantor-pos', from: 'rumah-sakit', eight: true }),
      where('l6', '🌟', { town: SEBERANG, of: 'sawah', from: 'sekolah', eight: true }),
      where('l6', '🌟', { town: KISI, xf: 'h', of: 'toko', from: 'sekolah', eight: true }),
    ],
    // l7 — peta diputar setengah / tiga perempat
    [
      where('l7', '🧩', { town: KISI, rot: 180, of: 'sekolah', from: 'toko', eight: true }),
      follow('l7', '🧩', { town: KISI, rot: 180, from: 'kantor-pos', to: 'taman', legs: 3 }),
      where('l7', '🧩', { town: SUNGAI, rot: 270, of: 'kandang', from: 'pom-bensin', eight: true }),
      follow('l7', '🧩', { town: KOTA, rot: 270, from: 'sekolah', to: 'rumah-sakit', legs: 3, courier: 'scooter' }),
      where('l7', '🧩', { town: KISI, xf: 'v', rot: 270, of: 'rumah-sakit', from: 'rumah', eight: true }),
      follow('l7', '🧩', { town: KISI, xf: 'h', rot: 180, from: 'rumah', to: 'toko', legs: 3, courier: 'scooter' }),
    ],
    // l8 — skala: satu kotak seratus meter, jarak lewat JALAN
    [
      scale('l8', '📏', { town: SUNGAI, from: 'pom-bensin', to: 'sawah' }),
      scale('l8', '📏', { town: KISI, from: 'rumah', to: 'toko' }),
      scale('l8', '📏', { town: SEBERANG, from: 'toko', to: 'sekolah' }),
      scale('l8', '📏', { town: SUNGAI, xf: 'h', from: 'kandang', to: 'stasiun' }),
      scale('l8', '📏', { town: KOTA, from: 'sekolah', to: 'stasiun' }),
      scale('l8', '📏', { town: SEBERANG, xf: 'h', from: 'rumah', to: 'rumah-sakit' }),
    ],
    // l9 — MISI BESAR: antar tiga paket, peta diputar
    [
      deliver('l9', '⭐', { town: KOTA, rot: 90, from: 'kantor-pos', stops: [['sekolah', 'kantor-pos'], ['rumah-sakit', 'taman'], ['stasiun', 'rumah']] }),
      deliver('l9', '⭐', { town: KISI, rot: 180, from: 'rumah', courier: 'scooter', stops: [['rumah-sakit', 'rumah'], ['sekolah', 'toko'], ['toko', 'kantor-pos']] }),
      deliver('l9', '⭐', { town: SEBERANG, rot: 270, from: 'pom-bensin', stops: [['sawah', 'sekolah'], ['rumah', 'rumah-sakit'], ['toko', 'rumah']] }),
      deliver('l9', '⭐', { town: KOTA, xf: 'h', rot: 270, from: 'rumah', courier: 'scooter', stops: [['stasiun', 'rumah'], ['sekolah', 'kantor-pos'], ['rumah-sakit', 'taman']] }),
      deliver('l9', '⭐', { town: KISI, xf: 'v', rot: 90, from: 'sekolah', stops: [['taman', 'kantor-pos'], ['rumah', 'rumah-sakit'], ['toko', 'kantor-pos']] }),
      deliver('l9', '⭐', { town: SEBERANG, xf: 'h', rot: 180, from: 'toko', courier: 'scooter', stops: [['rumah-sakit', 'sekolah'], ['sawah', 'rumah-sakit'], ['rumah', 'toko']] }),
    ],
  ],
};

export default config;
