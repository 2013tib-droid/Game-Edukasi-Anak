import type { ClockSpec, GameConfig, GameLevel, TapChoice } from '@/engine/core/types';
import { terbilang } from '@/games/numbers';

/**
 * "Jam Pintar" (SD Kelas 1 & 2) — membaca jam: jam tepat, setengah jam,
 * arah jarum, dan jam kegiatan sehari-hari.
 *
 * Jam digambar oleh engine sebagai SVG BERANGKA 1–12 (`src/engine/ui/Clock.tsx`),
 * jadi anak benar-benar membaca jam, bukan sekadar membandingkan sudut jarum.
 *
 * JANGAN kembali memakai emoji muka jam (🕐–🕧): mukanya polos tanpa angka
 * sama sekali (keputusan pemilik 2026-08-01 setelah melihatnya di HP), dan di
 * sebagian HP jarumnya nyaris tak terlihat. Data levelnya cukup menyebut
 * waktunya (`{ h, m }`) — bentuk jamnya urusan engine.
 *
 * Aturan yang dipatuhi (CLAUDE.md): narasi soal "jam berapa ini?" tidak
 * pernah menyebut jawabannya. Soal kebalikannya (dengar waktunya → cari
 * jamnya) memang menyebut waktu, karena di situ yang dicari GAMBAR jamnya.
 * Pengecualiannya cuma soal arah jarum (`hands()`) — alasannya ada di sana.
 *
 * SETIAP soal di game ini memperlihatkan muka jam: sebagai cue besar di atas
 * (`data.clock`) atau sebagai kartu jawaban (`choice.clock`). Kalau menambah
 * varian baru, jangan ada yang cuma kalimat + kartu tulisan — layarnya jadi
 * kosong di tengah (keluhan pemilik 2026-09-03).
 */

const NAMES = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
  'dua belas',
];

/** Satu waktu: jam 1–12 dan apakah lewat 30 menit. */
interface Time {
  h: number;
  half?: boolean;
}

const t = (h: number, half = false): Time => ({ h, half });

/** Waktu itu sebagai muka jam untuk engine. */
const face = (x: Time): ClockSpec => ({ h: x.h, m: x.half ? 30 : 0 });
/** Tulisan digital, format Indonesia: "07.00", "07.30". */
const digits = (x: Time) => `${String(x.h).padStart(2, '0')}.${x.half ? '30' : '00'}`;
/** Bunyi waktunya dalam kata. */
const spoken = (x: Time) =>
  x.half ? `pukul ${NAMES[x.h]!} lewat tiga puluh menit` : `pukul ${NAMES[x.h]!} tepat`;

/**
 * Sebutan "setengah" ala Indonesia: 07.30 dibaca "setengah DELAPAN" —
 * setengah jalan MENUJU jam berikutnya, bukan setengah setelah jam ini.
 */
const halfToward = (x: Time) => `setengah ${NAMES[x.h === 12 ? 1 : x.h + 1]!}`;

/* ---------- Pembangun varian (id diisi oleh slot()) ---------- */

/** Lihat jamnya → pilih tulisan waktunya. */
function readClock(answer: Time, ...decoys: Time[]): GameLevel<'tap-answer'> {
  const choices: TapChoice[] = [
    { id: 'a', text: digits(answer), correct: true },
    ...decoys.map((d, i) => ({ id: `d${i}`, text: digits(d) })),
  ];
  return {
    id: '',
    narration: 'Lihat jam ini. Pukul berapa sekarang?',
    data: { clock: face(answer), choices },
  };
}

/** Dengar waktunya → pilih gambar jamnya. */
function findClock(answer: Time, ...decoys: Time[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Sentuh jam yang menunjukkan ${spoken(answer)}!`,
    data: {
      choices: [
        { id: 'a', clock: face(answer), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, clock: face(d) })),
      ],
    },
  };
}

/** Sebutan "setengah ..." → pilih gambar jamnya. */
function findHalf(answer: Time, ...decoys: Time[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `Sentuh jam yang menunjukkan pukul ${halfToward(answer)}!`,
    data: {
      choices: [
        { id: 'a', clock: face(answer), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, clock: face(d) })),
      ],
    },
  };
}

/**
 * Arah jarum jam. Sengaja HANYA untuk jam tepat: pada pukul setengah, jarum
 * pendek berada di ANTARA dua angka, jadi kalimat "jarum pendek di angka 2"
 * akan mengajarkan hal yang keliru.
 */
function hands(hour: number, ...decoys: Time[]): GameLevel<'tap-answer'> {
  const answer = t(hour);
  return {
    id: '',
    narration: `Jarum pendek di angka ${terbilang(hour)}, jarum panjang di angka dua belas. Pukul berapa itu?`,
    data: {
      // Jamnya IKUT DIGAMBAR (permintaan pemilik 2026-09-03 dari tangkapan
      // layar: soal ini satu-satunya yang layarnya kosong melompong — narasi
      // di atas, tiga kartu tulisan di bawah, tak ada apa-apa di tengah).
      // Ini juga satu-satunya soal yang narasinya menyebut posisi jarum
      // SEKALIGUS memperlihatkan jamnya, jadi memang lebih mudah: yang
      // dilatih di sini kosakata "jarum pendek/panjang" — anak mencocokkan
      // kalimatnya dengan jarum biru gemuk & jarum merah tipis di muka jam,
      // bukan menebak dalam kepala. Jangan "dirapikan" jadi tanpa jam lagi.
      clock: face(answer),
      choices: [
        { id: 'a', text: digits(answer), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, text: digits(d) })),
      ],
    },
  };
}

/** Kegiatan sehari-hari → pilih gambar jamnya. */
function daily(story: string, answer: Time, ...decoys: Time[]): GameLevel<'tap-answer'> {
  return {
    id: '',
    narration: `${story} Sentuh jamnya!`,
    data: {
      choices: [
        { id: 'a', clock: face(answer), correct: true },
        ...decoys.map((d, i) => ({ id: `d${i}`, clock: face(d) })),
      ],
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: GameLevel<'tap-answer'>[]): GameLevel<'tap-answer'>[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'tap-answer'> = {
  id: 'jam-pintar',
  group: 'sd1',
  title: 'Jam Pintar',
  emoji: '🕒',
  template: 'tap-answer',
  sessionLevels: 7,
  levels: [
    // --- 1. Baca jam tepat ---
    slot(
      'l1',
      readClock(t(3), t(4), t(2)),
      readClock(t(7), t(6), t(8)),
      readClock(t(9), t(10), t(8)),
      readClock(t(12), t(11), t(1)),
      readClock(t(5), t(4), t(6)),
      readClock(t(10), t(11), t(9)),
    ),
    // --- 2. Baca jam tepat (angka lain) ---
    slot(
      'l2',
      readClock(t(1), t(2), t(11)),
      readClock(t(6), t(5), t(7)),
      readClock(t(8), t(9), t(7)),
      readClock(t(11), t(10), t(12)),
      readClock(t(2), t(3), t(1)),
      readClock(t(4), t(5), t(3)),
    ),
    // --- 3. Dengar waktunya → cari jamnya ---
    slot(
      'l3',
      findClock(t(5), t(6), t(4)),
      findClock(t(8), t(7), t(9)),
      findClock(t(2), t(3), t(1)),
      findClock(t(10), t(9), t(11)),
      findClock(t(12), t(11), t(6)),
      findClock(t(7), t(8), t(6)),
    ),
    // --- 4. Baca setengah jam ---
    slot(
      'l4',
      readClock(t(3, true), t(3), t(4, true)),
      readClock(t(7, true), t(7), t(8, true)),
      readClock(t(9, true), t(10, true), t(9)),
      readClock(t(1, true), t(1), t(2, true)),
      readClock(t(6, true), t(6), t(5, true)),
      readClock(t(11, true), t(11), t(12, true)),
    ),
    // --- 5. Dengar setengah jam → cari jamnya ---
    slot(
      'l5',
      findClock(t(4, true), t(4), t(5, true)),
      findClock(t(8, true), t(8), t(9, true)),
      findClock(t(2, true), t(3, true), t(2)),
      findClock(t(10, true), t(10), t(11, true)),
      findClock(t(6, true), t(7, true), t(6)),
      findClock(t(12, true), t(12), t(1, true)),
    ),
    // --- 6. Sebutan "pukul setengah ..." (07.30 = setengah delapan) ---
    slot(
      'l6',
      findHalf(t(7, true), t(8, true), t(7)),
      findHalf(t(4, true), t(5, true), t(4)),
      findHalf(t(9, true), t(10, true), t(9)),
      findHalf(t(2, true), t(3, true), t(2)),
      findHalf(t(11, true), t(12, true), t(11)),
      findHalf(t(5, true), t(6, true), t(5)),
    ),
    // --- 7. Arah jarum jam ---
    slot(
      'l7',
      hands(4, t(12), t(5)),
      hands(9, t(12), t(10)),
      hands(6, t(7), t(5)),
      hands(2, t(3), t(12)),
      hands(11, t(12), t(10)),
      hands(8, t(9), t(7)),
    ),
    // --- 8. Jam kegiatan sehari-hari ---
    slot(
      'l8',
      daily('Andi bangun tidur pukul lima pagi.', t(5), t(6), t(4)),
      daily('Bel sekolah berbunyi pukul tujuh pagi.', t(7), t(8), t(6)),
      daily('Kita makan siang pukul dua belas.', t(12), t(11), t(1)),
      daily('Ayah pulang kerja pukul lima sore.', t(5), t(4), t(6)),
      daily('Adik tidur siang pukul satu.', t(1), t(2), t(12)),
      daily('Anak-anak tidur malam pukul sembilan.', t(9), t(10), t(8)),
    ),
  ],
};

export default config;
