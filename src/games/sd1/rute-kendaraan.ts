import type { GameConfig, GameLevel, RoadSpec } from '@/engine/core/types';

/**
 * Rute Kendaraan (SD Kelas 1 & 2) — saudara `path-trace` dari Jalan Kendaraan
 * (TK) tapi sengaja dibuat LEBIH SULIT, bukan sekadar dipindah kelompok:
 *
 * 1. `road.narrow: true` di SEMUA slot — engine mempersempit toleransi jari
 *    (lihat NARROW_ON_ROAD/NARROW_OFF_ROAD di `PathTrace.tsx`) dan menggambar
 *    jalannya lebih tipis, jadi anak benar-benar harus mengikuti jalan lebih
 *    presisi, bukan cuma menyapu ke arah tujuan.
 * 2. `steps` lebih banyak (4–6, TK berhenti di 5) — lebih banyak belokan
 *    dalam lebar layar yang sama.
 * 3. Bentuk jalan baru `'kelokan'` (tiga lekukan S, TK cuma sampai dua di
 *    `'ess'`) dipakai sebagai level tersulit.
 *
 * Nama & id SENGAJA mirip "Jalan Kendaraan" (permintaan pemilik) supaya
 * orang tua langsung mengenali ini keluarga game yang sama, level berikutnya.
 *
 * Seni kendaraan & tujuan memakai ulang registry `items.ts` yang sudah ada
 * (tidak ada aset baru yang perlu dibuat untuk game ini). Aturan lama tetap
 * berlaku: kendaraan DARAT saja (emoji menghadap samping — engine memutarnya
 * mengikuti arah jalan), dan satu seni jangan dipakai untuk dua nama
 * kendaraan berbeda.
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

/** One slot: same road shape (sempit & lebih rumit), many kendaraan/tujuan. */
function slot(id: string, road: Omit<RoadSpec, 'narrow'>, trips: Trip[]): GameLevel<'path-trace'>[] {
  return trips.map((t) => ({
    id,
    narration: `Antar ${t.name} ke ${t.goalName}. Ikuti jalannya dengan jarimu!`,
    data: {
      road: { ...road, narrow: true },
      vehicle: t.vehicle,
      vehicleItem: t.item,
      goal: t.goal,
      goalItem: t.goalItem,
    },
  }));
}

/* --- Kolam perjalanan. Tiap tema dipakai di slot yang berbeda supaya dua
   level dalam satu sesi tidak memakai kendaraan yang sama. --- */

const KOTA: Trip[] = [
  trip('🚗', 'mobil', '🏪', 'toko', 'car', 'shop'),
  trip('🚕', 'taksi', '🏥', 'rumah sakit', 'taxi', 'hospital'),
  trip('🚌', 'bus', '🏫', 'sekolah', 'bus', 'school'),
  trip('🚙', 'jip', '🏞️', 'taman', 'jeep', 'park'),
  trip('🛵', 'skuter', '⛽', 'pom bensin', 'scooter', 'gas-station'),
  trip('🛺', 'bajaj', '🏠', 'rumah', 'bajaj', 'house'),
  trip('🚓', 'mobil polisi', '🏢', 'kantor', 'police'),
];

const PENOLONG: Trip[] = [
  trip('🚑', 'ambulans', '🏥', 'rumah sakit', 'ambulance', 'hospital'),
  trip('🚒', 'mobil pemadam', '🔥', 'api', 'firetruck'),
  trip('🚔', 'mobil polisi', '🚧', 'jalan yang rusak', 'police'),
  trip('🛻', 'mobil bak', '🏗️', 'tempat bangunan', 'pickup'),
  trip('🚚', 'truk', '🏭', 'pabrik', 'truck'),
  trip('🚑', 'ambulans', '🏫', 'sekolah', 'ambulance', 'school'),
];

const DESA: Trip[] = [
  trip('🚜', 'traktor', '🌾', 'sawah', 'tractor', 'field'),
  trip('🛻', 'mobil bak', '🌳', 'kebun', 'pickup', 'tree'),
  trip('🚲', 'sepeda', '🏡', 'rumah nenek', 'bicycle', 'house'),
  trip('🚙', 'jip', '🌳', 'hutan', 'jeep', 'tree'),
  trip('🛵', 'skuter', '🌾', 'ladang', 'scooter', 'field'),
];

const SEKOLAH: Trip[] = [
  trip('🚲', 'sepeda', '🏫', 'sekolah', 'bicycle', 'school'),
  trip('🚗', 'mobil', '🏫', 'sekolah', 'car', 'school'),
  trip('🚌', 'bus sekolah', '🏫', 'sekolah', 'bus', 'school'),
  trip('🛵', 'skuter', '🏫', 'sekolah', 'scooter', 'school'),
];

const PETUALANG: Trip[] = [
  trip('🚙', 'jip', '⛰️', 'gunung', 'jeep'),
  trip('🚌', 'bus', '🏕️', 'tempat berkemah', 'bus'),
  trip('🛻', 'mobil bak', '🏜️', 'padang pasir', 'pickup'),
  trip('🏍️', 'motor', '🌋', 'gunung berapi', 'motorcycle'),
  trip('🚗', 'mobil', '🗼', 'menara', 'car'),
  trip('🚲', 'sepeda', '🌉', 'jembatan', 'bicycle'),
];

const KERETA: Trip[] = [
  trip('🚂', 'kereta', '🚉', 'stasiun', 'train'),
  trip('🚄', 'kereta cepat', '🏙️', 'kota'),
  trip('🚋', 'trem', '🏛️', 'museum'),
];

const config: GameConfig<'path-trace'> = {
  id: 'rute-kendaraan',
  group: 'sd1',
  title: 'Rute Kendaraan',
  emoji: '🛣️',
  template: 'path-trace',
  sessionLevels: 7,
  levels: [
    slot('l1', { kind: 'zigzag', steps: 4 }, KOTA),
    slot('l2', { kind: 'gelombang', steps: 4 }, PENOLONG),
    slot('l3', { kind: 'tangga', steps: 4 }, SEKOLAH),
    slot('l4', { kind: 'bukit', steps: 4 }, DESA),
    slot('l5', { kind: 'ess' }, KOTA),
    slot('l6', { kind: 'kelokan' }, PETUALANG),
    slot('l7', { kind: 'zigzag', steps: 6 }, PENOLONG),
    slot('l8', { kind: 'gelombang', steps: 6 }, KERETA),
    slot('l9', { kind: 'tangga', steps: 5 }, PETUALANG),
    slot('l10', { kind: 'lengkung' }, DESA),
  ],
};

export default config;
