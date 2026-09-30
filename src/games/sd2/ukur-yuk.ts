import type {
  BalanceSpec,
  GameConfig,
  GameLevel,
  RulerThing,
  TapChoice,
} from '@/engine/core/types';
import { capitalize, terbilang } from '@/games/numbers';
import { gridArea, gridPerimeter } from '@/engine/core/measure';

/**
 * "Ukur Yuk" (SD Kelas 3 & 4, kelompok `sd2`) — panjang, berat, isi, keliling.
 *
 * Kelompoknya masih `draft` (lihat `docs/rencana-game-sd-kelas-3-4.md` ⚠️):
 * game ini hanya terlihat di dev server & build penguji.
 *
 * ALUR (urutan TETAP — kelas 3 dulu baru kelas 4, dan tiap slot memakai
 * keterampilan slot sebelumnya; jadi tanpa `sessionLevels`, variasinya dari
 * kolam varian per slot — pelajaran Kartu Kembar):
 *   l1  penggaris, benda mulai di 0            (kls 3)
 *   l2  penggaris, benda TIDAK mulai di 0      (kls 3)
 *   l3  memilih satuan (pengecoh beda besaran) (kls 3)
 *   l4  membaca timbangan jarum kg & g         (kls 3)
 *   l5  timbangan dua lengan: lebih/paling berat (kls 3)
 *   l6  konversi satuan                        (kls 4)
 *   l7  membaca gelas takar (mL)               (kls 4)
 *   l8  keliling bangun berpetak               (kls 4)
 *   l9  keliling kebun persegi panjang          (kls 4)
 *
 * KEPUTUSAN PEMILIK 2026-09-30 (ditanyakan sebelum mulai):
 * - Batas bilangan `sd2` = 1.000 TETAP berlaku di konversi: soalnya dipilih
 *   supaya hasilnya ≤ 1.000 (1 kg = 1.000 g, setengah kg, 7 m = 700 cm…),
 *   "2 kg = 2.000 g" tidak dipakai.
 * - Timbangan = timbangan JARUM (timbangan digital menulis jawabannya sendiri).
 * - Soal memilih satuan: pengecohnya dari BESARAN LAIN (berat semangka →
 *   kg / cm / L), jadi hanya satu jawaban yang benar. "Tinggi pintu: cm atau
 *   m?" tidak dipakai — dua-duanya benar.
 *
 * PENGECOH dari kesalahan khas:
 * - penggaris mulai bukan dari 0 → membaca UJUNG benda tanpa mengurangi
 *   titik awal; menghitung GARIS alih-alih jarak (+1);
 * - gelas takar → membaca dari ATAS (1.000 − isi);
 * - konversi → mengali 10 alih-alih 100; "2 m 50 cm" dijumlah jadi 52;
 * - keliling → menghitung LUAS (banyak petak); p + l alih-alih 2 × (p + l).
 *
 * Satuan ditulis dengan LAMBANGNYA (kg, g, cm, m, L, mL) di kartu dan di alat
 * ukur; narasi menyebut namanya dan tanpa digit (`terbilang`).
 */

type Level = GameLevel<'tap-answer'>;

/** Tulis bilangan dengan titik ribuan tanpa `toLocaleString` (bergantung ICU HP). */
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function choices(answer: string, decoys: string[]): TapChoice[] {
  return [
    { id: 'a', text: answer, correct: true },
    ...decoys.map((d, i) => ({ id: `d${i}`, text: d })),
  ];
}

/** Dua pengecoh bilangan: unik, positif, ≤ 1.000, tak sama dengan jawaban. */
function decoyNums(answer: number, candidates: number[]): number[] {
  const out: number[] = [];
  for (const c of candidates) {
    if (c > 0 && c <= 1000 && c !== answer && !out.includes(c)) out.push(c);
    if (out.length === 2) break;
  }
  return out;
}

function numChoices(answer: number, candidates: number[], unit: string): TapChoice[] {
  return choices(
    `${fmt(answer)} ${unit}`,
    decoyNums(answer, candidates).map((d) => `${fmt(d)} ${unit}`),
  );
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id }));
}

// --- l1, l2 Penggaris --------------------------------------------------------

const THING_NAME: Record<RulerThing, string> = {
  pensil: 'pensil',
  krayon: 'krayon',
  pita: 'pita',
  sedotan: 'sedotan',
  penghapus: 'penghapus',
};

function ruler(thing: RulerThing, to: number): Level {
  return {
    id: '',
    narration: `Berapa sentimeter panjang ${THING_NAME[thing]} ini?`,
    data: {
      measure: { kind: 'ruler', thing, from: 0, to },
      choices: numChoices(to, [to + 1, to - 1], 'cm'),
    },
  };
}

function rulerFrom(thing: RulerThing, from: number, to: number): Level {
  const len = to - from;
  return {
    id: '',
    narration: `${capitalize(THING_NAME[thing])} ini tidak mulai dari nol. Berapa sentimeter panjangnya?`,
    data: {
      measure: { kind: 'ruler', thing, from, to },
      // Membaca ujung benda saja (to) dan menghitung garis (len + 1).
      choices: numChoices(len, [to, len + 1, len - 1], 'cm'),
    },
  };
}

// --- l3 Memilih satuan ---------------------------------------------------------

function unitOf(item: string, narration: string, answer: string, decoys: [string, string]): Level {
  return {
    id: '',
    narration,
    data: { pictureItem: item, choices: choices(answer, decoys) },
  };
}

// --- l4 Timbangan jarum -------------------------------------------------------

function weigh(item: string, name: string, value: number, unit: 'kg' | 'g'): Level {
  const step = unit === 'kg' ? 1 : 100;
  return {
    id: '',
    narration: `Berapa berat ${name}? Lihat jarum timbangannya.`,
    data: {
      measure: { kind: 'scale', item, value, unit },
      choices: numChoices(value, [value + step, value - step], unit),
    },
  };
}

// --- l5 Timbangan dua lengan -------------------------------------------------

interface Thing {
  item: string;
  name: string;
}

const SEMANGKA: Thing = { item: 'watermelon', name: 'Semangka' };
const APEL: Thing = { item: 'apple', name: 'Apel' };
const NANAS: Thing = { item: 'pineapple', name: 'Nanas' };
const STROBERI: Thing = { item: 'strawberry', name: 'Stroberi' };
const TAS: Thing = { item: 'backpack', name: 'Tas' };
const PENSIL: Thing = { item: 'pencil', name: 'Pensil' };
const BUKU: Thing = { item: 'book', name: 'Buku' };
const MELON: Thing = { item: 'melon', name: 'Melon' };
const JERUK: Thing = { item: 'orange', name: 'Jeruk' };
const CERI: Thing = { item: 'cherry', name: 'Ceri' };

const card = (t: Thing, correct = false): TapChoice => ({
  id: t.item,
  item: t.item,
  text: t.name,
  ...(correct ? { correct: true } : {}),
});

/** Satu timbangan. `heavy` di sisi `side`; tanyakan yang lebih berat/ringan. */
function compare(heavy: Thing, light: Thing, side: 'left' | 'right', ask: 'berat' | 'ringan'): Level {
  const spec: BalanceSpec =
    side === 'left'
      ? { leftItem: heavy.item, rightItem: light.item, heavier: 'left' }
      : { leftItem: light.item, rightItem: heavy.item, heavier: 'right' };
  return {
    id: '',
    narration: `Mana yang lebih ${ask}?`,
    data: {
      measure: { kind: 'balance', scales: [spec] },
      choices: [card(heavy, ask === 'berat'), card(light, ask === 'ringan')],
    },
  };
}

/**
 * Dua timbangan: a > b dan b > c. Benda tengah (b) muncul di KEDUANYA — anak
 * menyimpulkan urutannya, tak ada satu timbangan pun yang menunjukkan
 * jawabannya langsung.
 */
function chain(a: Thing, b: Thing, c: Thing, ask: 'berat' | 'ringan'): Level {
  return {
    id: '',
    narration: `Mana yang paling ${ask}?`,
    data: {
      measure: {
        kind: 'balance',
        scales: [
          { leftItem: b.item, rightItem: a.item, heavier: 'right' },
          { leftItem: b.item, rightItem: c.item, heavier: 'left' },
        ],
      },
      choices: [card(a, ask === 'berat'), card(b), card(c, ask === 'ringan')],
    },
  };
}

// --- l6 Konversi ----------------------------------------------------------------

function convert(narration: string, equation: string, answer: string, decoys: [string, string]): Level {
  return { id: '', narration, data: { equation, choices: choices(answer, decoys) } };
}

// --- l7 Gelas takar -----------------------------------------------------------

function beaker(ml: number, liquid: 'air' | 'susu' | 'jus'): Level {
  return {
    id: '',
    narration: `Berapa mililiter ${liquid} di gelas takar?`,
    data: {
      measure: { kind: 'beaker', ml, liquid },
      // Membaca dari atas (1.000 − isi), lalu garis tetangga.
      choices: numChoices(ml, [1000 - ml, ml + 100, ml - 100, ml + 200], 'mL'),
    },
  };
}

// --- l8, l9 Keliling ------------------------------------------------------------

function gridPerim(rows: string[]): Level {
  const p = gridPerimeter(rows);
  return {
    id: '',
    narration: 'Satu petak panjangnya satu sentimeter. Berapa keliling bangun ini?',
    data: {
      measure: { kind: 'grid', rows },
      // Menghitung LUAS (banyak petak) — kesalahan keliling nomor satu.
      choices: numChoices(p, [gridArea(rows), p + 2, p - 2], 'cm'),
    },
  };
}

function plot(w: number, h: number): Level {
  const p = 2 * (w + h);
  return {
    id: '',
    narration: 'Berapa meter keliling kebun ini?',
    data: {
      measure: { kind: 'rect', w, h, unit: 'm' },
      // p + l (lupa dua sisi lagi) dan p × l (luas).
      choices: numChoices(p, [w + h, w * h, p + w], 'm'),
    },
  };
}

const config: GameConfig<'tap-answer'> = {
  id: 'ukur-yuk',
  group: 'sd2',
  title: 'Ukur Yuk',
  emoji: '📏',
  template: 'tap-answer',
  levels: [
    // --- l1 (kls 3) Penggaris, mulai dari nol ---
    slot(
      'l1',
      ruler('pensil', 8),
      ruler('krayon', 6),
      ruler('pita', 11),
      ruler('sedotan', 13),
      ruler('penghapus', 4),
      ruler('pensil', 10),
    ),

    // --- l2 (kls 3) Penggaris, TIDAK mulai dari nol ---
    slot(
      'l2',
      rulerFrom('pensil', 2, 9),
      rulerFrom('krayon', 3, 8),
      rulerFrom('pita', 4, 13),
      rulerFrom('sedotan', 1, 12),
      rulerFrom('penghapus', 5, 9),
      rulerFrom('pita', 6, 14),
    ),

    // --- l3 (kls 3) Memilih satuan: pengecoh dari besaran lain ---
    slot(
      'l3',
      unitOf('watermelon', 'Berat semangka diukur dengan satuan apa?', 'kg', ['cm', 'L']),
      unitOf('pencil', 'Panjang pensil diukur dengan satuan apa?', 'cm', ['kg', 'L']),
      unitOf('milk', 'Banyak susu ini diukur dengan satuan apa?', 'L', ['kg', 'm']),
      unitOf('door', 'Tinggi pintu diukur dengan satuan apa?', 'm', ['g', 'L']),
      unitOf('apple', 'Berat apel diukur dengan satuan apa?', 'g', ['cm', 'mL']),
      unitOf('umbrella', 'Panjang payung diukur dengan satuan apa?', 'cm', ['g', 'mL']),
    ),

    // --- l4 (kls 3) Timbangan jarum ---
    slot(
      'l4',
      weigh('watermelon', 'semangka', 5, 'kg'),
      weigh('backpack', 'tas', 3, 'kg'),
      weigh('pineapple', 'nanas', 2, 'kg'),
      weigh('apple', 'apel', 200, 'g'),
      weigh('book', 'buku', 300, 'g'),
      weigh('banana', 'pisang', 700, 'g'),
    ),

    // --- l5 (kls 3) Timbangan dua lengan ---
    slot(
      'l5',
      compare(SEMANGKA, APEL, 'left', 'berat'),
      compare(TAS, PENSIL, 'right', 'ringan'),
      compare(NANAS, STROBERI, 'right', 'berat'),
      chain(SEMANGKA, NANAS, APEL, 'berat'),
      chain(TAS, BUKU, PENSIL, 'ringan'),
      chain(MELON, JERUK, CERI, 'berat'),
    ),

    // --- l6 (kls 4) Konversi satuan (hasil ≤ 1.000) ---
    slot(
      'l6',
      convert(`${capitalize(terbilang(3))} meter sama dengan berapa sentimeter?`, '3 m = ? cm', '300 cm', ['30 cm', '3 cm']),
      convert(`${capitalize(terbilang(7))} meter sama dengan berapa sentimeter?`, '7 m = ? cm', '700 cm', ['70 cm', '17 cm']),
      convert('Satu kilogram sama dengan berapa gram?', '1 kg = ? g', '1.000 g', ['100 g', '10 g']),
      convert('Setengah kilogram sama dengan berapa gram?', '½ kg = ? g', '500 g', ['50 g', '250 g']),
      convert('Setengah liter sama dengan berapa mililiter?', '½ L = ? mL', '500 mL', ['50 mL', '200 mL']),
      convert(
        `${capitalize(terbilang(2))} meter ${terbilang(50)} sentimeter sama dengan berapa sentimeter?`,
        '2 m 50 cm = ? cm',
        '250 cm',
        ['52 cm', '205 cm'],
      ),
      convert(`${capitalize(terbilang(600))} sentimeter sama dengan berapa meter?`, '600 cm = ? m', '6 m', ['60 m', '600 m']),
    ),

    // --- l7 (kls 4) Gelas takar ---
    slot(
      'l7',
      beaker(600, 'air'),
      beaker(300, 'susu'),
      beaker(800, 'jus'),
      beaker(200, 'air'),
      beaker(500, 'susu'),
      beaker(900, 'jus'),
    ),

    // --- l8 (kls 4) Keliling bangun berpetak ---
    slot(
      'l8',
      gridPerim(['###', '###']),
      gridPerim(['####', '####']),
      gridPerim(['###', '###', '###']),
      gridPerim(['#...', '#...', '####']),
      gridPerim(['#####', '#####']),
      gridPerim(['.#.', '###', '.#.']),
    ),

    // --- l9 (kls 4) Keliling kebun persegi panjang ---
    slot('l9', plot(8, 5), plot(10, 6), plot(12, 4), plot(9, 5), plot(15, 10), plot(20, 12)),
  ],
};

export default config;
