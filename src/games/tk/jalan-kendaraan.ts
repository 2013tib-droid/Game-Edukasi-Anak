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
 */

interface Trip {
  /** Vehicle emoji (kendaraan darat, menghadap samping). */
  vehicle: string;
  /** Indonesian name, dipakai di narasi. */
  name: string;
  /** Goal emoji at the end of the road. */
  goal: string;
  /** Indonesian name of the goal. */
  goalName: string;
  /** Item id registry — seni bangunan/tempat, kalau ada (emoji jadi cadangan). */
  goalItem?: string;
}

const trip = (vehicle: string, name: string, goal: string, goalName: string, goalItem?: string): Trip => ({
  vehicle,
  name,
  goal,
  goalName,
  ...(goalItem ? { goalItem } : {}),
});

/** One slot: same road shape, many kendaraan/tujuan (varian anti-bosan). */
function slot(id: string, road: RoadSpec, trips: Trip[]): GameLevel<'path-trace'>[] {
  return trips.map((t) => ({
    id,
    narration: `Antar ${t.name} ke ${t.goalName}. Ikuti jalannya dengan jarimu!`,
    data: {
      road,
      vehicle: t.vehicle,
      goal: t.goal,
      ...(t.goalItem ? { goalItem: t.goalItem } : {}),
    },
  }));
}

/* --- Kolam perjalanan. Tiap tema dipakai di slot yang berbeda supaya dua
   level dalam satu sesi tidak memakai kendaraan yang sama. --- */

const KOTA: Trip[] = [
  trip('🚗', 'mobil', '🏠', 'rumah', 'house'),
  trip('🚕', 'taksi', '🏬', 'toko', 'shop'),
  trip('🚙', 'jip', '🌳', 'taman', 'park'),
  trip('🚌', 'bus', '🏫', 'sekolah', 'school'),
  trip('🛵', 'skuter', '🏪', 'warung', 'shop'),
  trip('🚐', 'mobil antar-jemput', '🏫', 'sekolah', 'school'),
  trip('🛺', 'bajaj', '🏘️', 'perumahan'),
  trip('🚎', 'bus listrik', '🚏', 'halte'),
  trip('🚗', 'mobil', '⛽', 'pom bensin', 'gas-station'),
];

const PENOLONG: Trip[] = [
  trip('🚑', 'ambulans', '🏥', 'rumah sakit', 'hospital'),
  trip('🚒', 'mobil pemadam', '🔥', 'api'),
  trip('🚓', 'mobil polisi', '🚧', 'jalan yang rusak'),
  trip('🚔', 'mobil polisi', '🏢', 'kantor'),
  trip('🛻', 'mobil bak', '🏗️', 'tempat bangunan'),
  trip('🚚', 'truk', '🏭', 'pabrik'),
  trip('🚛', 'truk besar', '🏬', 'toko besar', 'shop'),
  trip('🚑', 'ambulans', '🏫', 'sekolah', 'school'),
];

const DESA: Trip[] = [
  trip('🚜', 'traktor', '🌾', 'sawah', 'field'),
  trip('🛻', 'mobil bak', '🌽', 'ladang jagung', 'field'),
  trip('🚚', 'truk susu', '🐄', 'peternakan'),
  trip('🚲', 'sepeda', '🏡', 'rumah nenek', 'house'),
  trip('🚙', 'jip', '🌳', 'pohon besar', 'tree'),
  trip('🚜', 'traktor', '🏚️', 'gudang'),
  trip('🛵', 'skuter', '🌻', 'kebun bunga', 'field'),
];

const MAIN: Trip[] = [
  trip('🚲', 'sepeda', '🌳', 'taman', 'park'),
  trip('🛴', 'otoped', '🏞️', 'lapangan'),
  trip('🏍️', 'motor', '⛽', 'pom bensin', 'gas-station'),
  trip('🏎️', 'mobil balap', '🏁', 'garis finis'),
  trip('🚗', 'mobil', '🏖️', 'pantai'),
  trip('🚌', 'bus', '🎪', 'pasar malam'),
  trip('🚙', 'jip', '🎢', 'taman bermain'),
  trip('🛵', 'skuter', '🏟️', 'stadion'),
  trip('🛹', 'papan luncur', '🛝', 'perosotan'),
];

const KERETA: Trip[] = [
  trip('🚂', 'kereta', '🚉', 'stasiun'),
  trip('🚞', 'kereta gunung', '⛰️', 'gunung'),
  trip('🚄', 'kereta cepat', '🏙️', 'kota'),
  trip('🚋', 'trem', '🏛️', 'museum'),
  trip('🚝', 'monorel', '🎡', 'kincir ria'),
  trip('🚃', 'gerbong kereta', '🏭', 'pabrik'),
  trip('🚈', 'kereta listrik', '🏢', 'kantor'),
];

const PETUALANG: Trip[] = [
  trip('🚙', 'jip', '⛰️', 'gunung'),
  trip('🚌', 'bus', '🏕️', 'tempat berkemah'),
  trip('🛻', 'mobil bak', '🏜️', 'padang pasir'),
  trip('🏍️', 'motor', '🌋', 'gunung besar'),
  trip('🚚', 'truk', '🏰', 'istana'),
  trip('🚗', 'mobil', '🗼', 'menara'),
  trip('🚜', 'traktor', '🌲', 'hutan pinus'),
  trip('🚲', 'sepeda', '🌉', 'jembatan'),
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
