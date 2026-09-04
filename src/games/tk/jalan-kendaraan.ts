import type { GameConfig, GameLevel, RoadSpec } from '@/engine/core/types';

/**
 * Jalan Kendaraan (TK) — latihan motorik/pra-menulis: anak menyusuri jalan
 * dengan jari sambil mengantar kendaraan ke tujuannya. Bentuk jalannya naik
 * bertahap: lurus → bukit → gelombang → zigzag → tangga → lengkung → S.
 *
 * Tiap slot = kolam varian (kendaraan + tujuan berbeda) supaya tidak bosan,
 * dan hanya `sessionLevels` slot yang dimainkan tiap sesi. Sejak 2026-09-04:
 * **18 slot, 9 dimainkan** — sembilan slot sisanya adalah cadangan yang ikut
 * diundi tiap kali main, jadi dua sesi berturut-turut hampir tak pernah berisi
 * jalan yang sama. Kolam perjalanannya sendiri ±70 kombinasi kendaraan+tujuan
 * dalam 9 tema, satu tema dipakai persis 2 slot.
 *
 * CATATAN emoji: pakai kendaraan DARAT (menghadap samping) — engine memutar
 * gambar mengikuti arah jalan, jadi pesawat/helikopter/roket yang menghadap
 * serong akan terlihat aneh.
 *
 * Kendaraan yang sudah punya SENI (WebP di registry `items.ts`) menyebutkannya
 * lewat argumen kelima `trip(...)`; emoji tetap ditulis sebagai cadangan kalau
 * asetnya gagal dimuat. Yang belum ada seninya (otoped, papan luncur, truk
 * besar, mobil antar-jemput, bus listrik, dan keluarga kereta selain lokomotif)
 * sementara masih emoji — tinggal isi argumen itu begitu asetnya dibuat.
 * Satu seni JANGAN dipakai untuk dua nama kendaraan berbeda.
 *
 * Hal yang sama berlaku untuk TUJUAN di ujung jalan (argumen keenam,
 * `goalItem`): rumah, sekolah, rumah sakit, toko, pom bensin, sawah, pohon &
 * taman sudah punya seni; tujuan lain (halte, pabrik, istana…) masih emoji.
 */

interface Trip {
  /** Vehicle emoji (kendaraan darat, menghadap samping) — cadangan. */
  vehicle: string;
  /** Indonesian name, dipakai di narasi. */
  name: string;
  /** Goal emoji at the end of the road. */
  goal: string;
  /** Indonesian name of the goal. */
  goalName: string;
  /** Item id (registry `items.ts`) — seni WebP kendaraan, dipakai kalau ada. */
  item?: string;
  /** Item id registry — seni bangunan/tempat tujuan, kalau ada. */
  goalItem?: string;
}

const trip = (
  vehicle: string,
  name: string,
  goal: string,
  goalName: string,
  item?: string,
  goalItem?: string,
): Trip => ({
  vehicle,
  name,
  goal,
  goalName,
  item,
  goalItem,
});

/** One slot: same road shape, many kendaraan/tujuan (varian anti-bosan). */
function slot(id: string, road: RoadSpec, trips: Trip[]): GameLevel<'path-trace'>[] {
  return trips.map((t) => ({
    id,
    narration: `Antar ${t.name} ke ${t.goalName}. Ikuti jalannya dengan jarimu!`,
    data: { road, vehicle: t.vehicle, vehicleItem: t.item, goal: t.goal, goalItem: t.goalItem },
  }));
}

/* --- Kolam perjalanan. Tiap tema dipakai di slot yang berbeda supaya dua
   level dalam satu sesi tidak memakai kendaraan yang sama. --- */

const KOTA: Trip[] = [
  trip('🚗', 'mobil', '🏠', 'rumah', 'car', 'house'),
  trip('🚕', 'taksi', '🏬', 'toko', 'taxi', 'shop'),
  trip('🚙', 'jip', '🌳', 'taman', 'jeep', 'park'),
  trip('🚌', 'bus', '🏫', 'sekolah', 'bus', 'school'),
  trip('🛵', 'skuter', '🏪', 'warung', 'scooter', 'shop'),
  trip('🚐', 'mobil antar-jemput', '🏫', 'sekolah', undefined, 'school'),
  trip('🛺', 'bajaj', '🏘️', 'perumahan', 'bajaj'),
  trip('🚎', 'bus listrik', '🚏', 'halte'),
  trip('🚗', 'mobil', '⛽', 'pom bensin', 'car', 'gas-station'),
];

const PENOLONG: Trip[] = [
  trip('🚑', 'ambulans', '🏥', 'rumah sakit', 'ambulance', 'hospital'),
  trip('🚒', 'mobil pemadam', '🔥', 'api', 'firetruck'),
  trip('🚓', 'mobil polisi', '🚧', 'jalan yang rusak', 'police'),
  trip('🚔', 'mobil polisi', '🏢', 'kantor', 'police'),
  trip('🛻', 'mobil bak', '🏗️', 'tempat bangunan', 'pickup'),
  trip('🚚', 'truk', '🏭', 'pabrik', 'truck'),
  trip('🚛', 'truk besar', '🏬', 'toko besar', undefined, 'shop'),
  trip('🚑', 'ambulans', '🏫', 'sekolah', 'ambulance', 'school'),
];

const DESA: Trip[] = [
  trip('🚜', 'traktor', '🌾', 'sawah', 'tractor', 'field'),
  trip('🛻', 'mobil bak', '🌽', 'ladang jagung', 'pickup', 'field'),
  trip('🚚', 'truk susu', '🐄', 'peternakan', 'truck'),
  trip('🚲', 'sepeda', '🏡', 'rumah nenek', 'bicycle', 'house'),
  trip('🚙', 'jip', '🌳', 'pohon besar', 'jeep', 'tree'),
  trip('🚜', 'traktor', '🏚️', 'gudang', 'tractor'),
  trip('🛵', 'skuter', '🌻', 'kebun bunga', 'scooter', 'field'),
];

const MAIN: Trip[] = [
  trip('🚲', 'sepeda', '🌳', 'taman', 'bicycle', 'park'),
  trip('🛴', 'otoped', '🏞️', 'lapangan'),
  trip('🏍️', 'motor', '⛽', 'pom bensin', 'motorcycle', 'gas-station'),
  trip('🏎️', 'mobil balap', '🏁', 'garis finis', 'racecar'),
  trip('🚗', 'mobil', '🏖️', 'pantai', 'car'),
  trip('🚌', 'bus', '🎪', 'pasar malam', 'bus'),
  trip('🚙', 'jip', '🎢', 'taman bermain', 'jeep'),
  trip('🛵', 'skuter', '🏟️', 'stadion', 'scooter'),
  trip('🛹', 'papan luncur', '🛝', 'perosotan'),
];

const KERETA: Trip[] = [
  trip('🚂', 'kereta', '🚉', 'stasiun', 'train'),
  trip('🚞', 'kereta gunung', '⛰️', 'gunung'),
  trip('🚄', 'kereta cepat', '🏙️', 'kota'),
  trip('🚋', 'trem', '🏛️', 'museum'),
  trip('🚝', 'monorel', '🎡', 'kincir ria'),
  trip('🚃', 'gerbong kereta', '🏭', 'pabrik'),
  trip('🚈', 'kereta listrik', '🏢', 'kantor'),
];

const PETUALANG: Trip[] = [
  trip('🚙', 'jip', '⛰️', 'gunung', 'jeep'),
  trip('🚌', 'bus', '🏕️', 'tempat berkemah', 'bus'),
  trip('🛻', 'mobil bak', '🏜️', 'padang pasir', 'pickup'),
  trip('🏍️', 'motor', '🌋', 'gunung besar', 'motorcycle'),
  trip('🚚', 'truk', '🏰', 'istana', 'truck'),
  trip('🚗', 'mobil', '🗼', 'menara', 'car'),
  trip('🚜', 'traktor', '🌲', 'hutan pinus', 'tractor'),
  trip('🚲', 'sepeda', '🌉', 'jembatan', 'bicycle'),
];

/* --- Tiga tema tambahan (2026-09-04) supaya 18 slot tetap dapat SATU tema
   sendiri-sendiri: tiap tema dipakai persis 2 slot, jadi satu sesi 9 level
   paling banyak menemui dua slot bertema sama. --- */

const PASAR: Trip[] = [
  trip('🚚', 'truk', '🏬', 'toko', 'truck', 'shop'),
  trip('🛻', 'mobil bak', '🏪', 'warung', 'pickup', 'shop'),
  trip('🛵', 'skuter', '🏠', 'rumah', 'scooter', 'house'),
  trip('🛺', 'bajaj', '🏬', 'pasar', 'bajaj'),
  trip('🚕', 'taksi', '🏬', 'toko', 'taxi', 'shop'),
  trip('🚗', 'mobil', '🏪', 'warung', 'car', 'shop'),
  trip('🏍️', 'motor', '🏠', 'rumah', 'motorcycle', 'house'),
  trip('🚐', 'mobil antar-jemput', '🏥', 'rumah sakit', undefined, 'hospital'),
];

const SEKOLAH: Trip[] = [
  trip('🚲', 'sepeda', '🏫', 'sekolah', 'bicycle', 'school'),
  trip('🚗', 'mobil', '🏫', 'sekolah', 'car', 'school'),
  trip('🛵', 'skuter', '🏫', 'sekolah', 'scooter', 'school'),
  trip('🛺', 'bajaj', '🏫', 'sekolah', 'bajaj', 'school'),
  trip('🚕', 'taksi', '🎨', 'kelas melukis', 'taxi'),
  trip('🚌', 'bus', '📚', 'perpustakaan', 'bus'),
  trip('🚙', 'jip', '⚽', 'lapangan sekolah', 'jeep'),
  trip('🚐', 'mobil antar-jemput', '🎵', 'kelas musik'),
];

const KEBUN_BINATANG: Trip[] = [
  trip('🚚', 'truk', '🦁', 'kebun binatang', 'truck'),
  trip('🛻', 'mobil bak', '🐘', 'kandang gajah', 'pickup', 'barn'),
  trip('🚜', 'traktor', '🐄', 'kandang sapi', 'tractor', 'barn'),
  trip('🚙', 'jip', '🦒', 'kandang jerapah', 'jeep', 'barn'),
  trip('🚌', 'bus', '🦁', 'kebun binatang', 'bus'),
  trip('🚲', 'sepeda', '🐦', 'taman burung', 'bicycle', 'park'),
  trip('🛵', 'skuter', '🐠', 'kolam ikan', 'scooter'),
  trip('🚗', 'mobil', '🐢', 'rumah kura-kura', 'car'),
];

const config: GameConfig<'path-trace'> = {
  id: 'jalan-kendaraan',
  group: 'tk',
  title: 'Jalan Kendaraan',
  emoji: '🚗',
  template: 'path-trace',
  // Pra-rilis semua game dibuka; saat launching game ini jadi false
  // (lihat CLAUDE.md "Rencana Akses Saat Launching").
  //
  // 9 level dimainkan tiap sesi, diundi dari 18 slot — 9 "cadangan" yang
  // ikut diacak, jadi dua sesi berturut-turut hampir tak pernah sama
  // (permintaan pemilik 2026-09-04).
  sessionLevels: 9,
  levels: [
    slot('l1', { kind: 'lurus' }, KOTA),
    slot('l2', { kind: 'bukit', steps: 2 }, MAIN),
    slot('l3', { kind: 'gelombang', steps: 2 }, KERETA),
    slot('l4', { kind: 'zigzag', steps: 3 }, PENOLONG),
    slot('l5', { kind: 'tangga', steps: 3 }, PETUALANG),
    slot('l6', { kind: 'lengkung' }, DESA),
    slot('l7', { kind: 'ess' }, PENOLONG),
    slot('l8', { kind: 'zigzag', steps: 5 }, PETUALANG),
    slot('l9', { kind: 'gelombang', steps: 4 }, KOTA),
    slot('l10', { kind: 'bukit', steps: 3 }, MAIN),
    // --- 8 slot tambahan (2026-09-04): 10 → 18 slot. Id l1–l10 SENGAJA tidak
    // diubah supaya bintang yang sudah dikumpulkan anak tetap terpakai.
    slot('l11', { kind: 'lurus' }, SEKOLAH),
    slot('l12', { kind: 'bukit', steps: 2 }, PASAR),
    slot('l13', { kind: 'tangga', steps: 2 }, KEBUN_BINATANG),
    slot('l14', { kind: 'lengkung' }, KERETA),
    slot('l15', { kind: 'gelombang', steps: 3 }, SEKOLAH),
    slot('l16', { kind: 'zigzag', steps: 4 }, KEBUN_BINATANG),
    slot('l17', { kind: 'ess' }, PASAR),
    slot('l18', { kind: 'tangga', steps: 4 }, DESA),
  ],
};

export default config;
