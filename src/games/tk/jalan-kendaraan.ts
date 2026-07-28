import type { GameConfig, GameLevel, RoadSpec } from '@/engine/core/types';

/**
 * Jalan Kendaraan (TK) — latihan motorik/pra-menulis: anak menyusuri jalan
 * dengan jari sambil mengantar kendaraan ke tujuannya. Bentuk jalannya naik
 * bertahap: lurus → bukit → gelombang → zigzag → tangga → lengkung → S.
 *
 * Tiap slot = kolam varian (kendaraan + tujuan berbeda) supaya tidak bosan,
 * dan hanya `sessionLevels` slot yang dimainkan tiap sesi.
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
}

const trip = (vehicle: string, name: string, goal: string, goalName: string): Trip => ({
  vehicle,
  name,
  goal,
  goalName,
});

/** One slot: same road shape, many kendaraan/tujuan (varian anti-bosan). */
function slot(id: string, road: RoadSpec, trips: Trip[]): GameLevel<'path-trace'>[] {
  return trips.map((t) => ({
    id,
    narration: `Antar ${t.name} ke ${t.goalName}. Ikuti jalannya dengan jarimu!`,
    data: { road, vehicle: t.vehicle, goal: t.goal },
  }));
}

// --- kolam perjalanan, dipakai ulang di beberapa bentuk jalan ---

const KOTA: Trip[] = [
  trip('🚗', 'mobil', '🏠', 'rumah'),
  trip('🚌', 'bus', '🏫', 'sekolah'),
  trip('🚕', 'taksi', '🏬', 'toko'),
  trip('🚙', 'jip', '🌳', 'taman'),
  trip('🛵', 'skuter', '🏪', 'warung'),
  trip('🚐', 'mobil antar-jemput', '🏫', 'sekolah'),
];

const PENOLONG: Trip[] = [
  trip('🚑', 'ambulans', '🏥', 'rumah sakit'),
  trip('🚒', 'mobil pemadam', '🔥', 'api'),
  trip('🚓', 'mobil polisi', '🚧', 'jalan yang rusak'),
  trip('🚚', 'truk', '🏭', 'pabrik'),
  trip('🚛', 'truk besar', '🏗️', 'tempat bangunan'),
];

const SANTAI: Trip[] = [
  trip('🚲', 'sepeda', '🌳', 'taman'),
  trip('🏍️', 'motor', '⛽', 'pom bensin'),
  trip('🛴', 'otoped', '🏞️', 'lapangan'),
  trip('🚗', 'mobil', '🏁', 'garis finis'),
  trip('🚜', 'traktor', '🌾', 'sawah'),
];

const PETUALANG: Trip[] = [
  trip('🚂', 'kereta', '🚉', 'stasiun'),
  trip('🏎️', 'mobil balap', '🏁', 'garis finis'),
  trip('🚙', 'jip', '⛰️', 'gunung'),
  trip('🚚', 'truk', '🏠', 'rumah'),
  trip('🚌', 'bus', '🏖️', 'pantai'),
];

const config: GameConfig<'path-trace'> = {
  id: 'jalan-kendaraan',
  group: 'tk',
  title: 'Jalan Kendaraan',
  emoji: '🚗',
  template: 'path-trace',
  // Pra-rilis semua game dibuka; saat launching game ini jadi false
  // (lihat CLAUDE.md "Rencana Akses Saat Launching").
  freeDemo: true,
  sessionLevels: 6,
  levels: [
    slot('l1', { kind: 'lurus' }, KOTA),
    slot('l2', { kind: 'bukit', steps: 2 }, SANTAI),
    slot('l3', { kind: 'gelombang', steps: 2 }, KOTA),
    slot('l4', { kind: 'zigzag', steps: 3 }, PENOLONG),
    slot('l5', { kind: 'tangga', steps: 3 }, PETUALANG),
    slot('l6', { kind: 'lengkung' }, SANTAI),
    slot('l7', { kind: 'ess' }, PENOLONG),
    slot('l8', { kind: 'zigzag', steps: 5 }, PETUALANG),
    slot('l9', { kind: 'gelombang', steps: 4 }, KOTA),
    slot('l10', { kind: 'bukit', steps: 3 }, PETUALANG),
  ],
};

export default config;
