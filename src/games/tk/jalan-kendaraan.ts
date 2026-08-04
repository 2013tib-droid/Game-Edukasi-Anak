import type { GameConfig, GameLevel, RoadSpec } from '@/engine/core/types';

/**
 * Jalan Kendaraan (TK) — latihan motorik/pra-menulis: anak menyusuri jalan
 * dengan jari sambil mengantar kendaraan ke tujuannya. Bentuk jalannya naik
 * bertahap: lurus → bukit → gelombang → zigzag → tangga → lengkung → S.
 *
 * Tiap slot = kolam varian (kendaraan + tujuan berbeda) supaya tidak bosan,
 * dan hanya `sessionLevels` slot yang dimainkan tiap sesi. Kolamnya sengaja
 * besar (±50 perjalanan) supaya "Main Lagi" hampir selalu memberi kendaraan
 * yang berbeda.
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
  /** Item id (registry `items.ts`) — seni WebP, dipakai kalau ada. */
  item?: string;
}

const trip = (
  vehicle: string,
  name: string,
  goal: string,
  goalName: string,
  item?: string,
): Trip => ({
  vehicle,
  name,
  goal,
  goalName,
  item,
});

/** One slot: same road shape, many kendaraan/tujuan (varian anti-bosan). */
function slot(id: string, road: RoadSpec, trips: Trip[]): GameLevel<'path-trace'>[] {
  return trips.map((t) => ({
    id,
    narration: `Antar ${t.name} ke ${t.goalName}. Ikuti jalannya dengan jarimu!`,
    data: { road, vehicle: t.vehicle, vehicleItem: t.item, goal: t.goal },
  }));
}

/* --- Kolam perjalanan. Tiap tema dipakai di slot yang berbeda supaya dua
   level dalam satu sesi tidak memakai kendaraan yang sama. --- */

const KOTA: Trip[] = [
  trip('🚗', 'mobil', '🏠', 'rumah', 'car'),
  trip('🚕', 'taksi', '🏬', 'toko', 'taxi'),
  trip('🚙', 'jip', '🌳', 'taman', 'jeep'),
  trip('🚌', 'bus', '🏫', 'sekolah', 'bus'),
  trip('🛵', 'skuter', '🏪', 'warung', 'scooter'),
  trip('🚐', 'mobil antar-jemput', '🏫', 'sekolah'),
  trip('🛺', 'bajaj', '🏘️', 'perumahan', 'bajaj'),
  trip('🚎', 'bus listrik', '🚏', 'halte'),
  trip('🚗', 'mobil', '⛽', 'pom bensin', 'car'),
];

const PENOLONG: Trip[] = [
  trip('🚑', 'ambulans', '🏥', 'rumah sakit', 'ambulance'),
  trip('🚒', 'mobil pemadam', '🔥', 'api', 'firetruck'),
  trip('🚓', 'mobil polisi', '🚧', 'jalan yang rusak', 'police'),
  trip('🚔', 'mobil polisi', '🏢', 'kantor', 'police'),
  trip('🛻', 'mobil bak', '🏗️', 'tempat bangunan', 'pickup'),
  trip('🚚', 'truk', '🏭', 'pabrik', 'truck'),
  trip('🚛', 'truk besar', '🏬', 'toko besar'),
  trip('🚑', 'ambulans', '🏫', 'sekolah', 'ambulance'),
];

const DESA: Trip[] = [
  trip('🚜', 'traktor', '🌾', 'sawah', 'tractor'),
  trip('🛻', 'mobil bak', '🌽', 'ladang jagung', 'pickup'),
  trip('🚚', 'truk susu', '🐄', 'peternakan', 'truck'),
  trip('🚲', 'sepeda', '🏡', 'rumah nenek', 'bicycle'),
  trip('🚙', 'jip', '🌳', 'padang rumput', 'jeep'),
  trip('🚜', 'traktor', '🏚️', 'gudang', 'tractor'),
  trip('🛵', 'skuter', '🌻', 'kebun bunga', 'scooter'),
];

const MAIN: Trip[] = [
  trip('🚲', 'sepeda', '🌳', 'taman', 'bicycle'),
  trip('🛴', 'otoped', '🏞️', 'lapangan'),
  trip('🏍️', 'motor', '⛽', 'pom bensin', 'motorcycle'),
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

const config: GameConfig<'path-trace'> = {
  id: 'jalan-kendaraan',
  group: 'tk',
  title: 'Jalan Kendaraan',
  emoji: '🚗',
  template: 'path-trace',
  // Pra-rilis semua game dibuka; saat launching game ini jadi false
  // (lihat CLAUDE.md "Rencana Akses Saat Launching").
  sessionLevels: 6,
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
  ],
};

export default config;
