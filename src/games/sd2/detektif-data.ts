import type {
  BarChartSpec,
  ChartRow,
  GameConfig,
  GameLevel,
  TapChoice,
} from '@/engine/core/types';
import { terbilang } from '@/games/numbers';

/**
 * "Detektif Data" (SD Kelas 3 & 4, kelompok `sd2`) — turus, piktogram,
 * diagram batang, tabel, modus.
 *
 * Kelompoknya masih `draft` (lihat `docs/rencana-game-sd-kelas-3-4.md` ⚠️):
 * game ini hanya terlihat di dev server & build penguji.
 *
 * ALUR (urutan TETAP — kelas 3 dulu baru kelas 4, tiap slot memakai
 * keterampilan slot sebelumnya; tanpa `sessionLevels`, variasinya dari kolam
 * varian per slot — keputusan pemilik 2026-10-02):
 *   l1  membaca tabel turus (berikat lima)          (kls 3)
 *   l2  piktogram, satu gambar = satu               (kls 3)
 *   l3  piktogram, satu gambar = dua (setengah!)    (kls 3)
 *   l4  membaca diagram batang (garis tiap satu)    (kls 3)
 *   l5  paling banyak / paling sedikit              (kls 3)
 *   l6  selisih & jumlah dari diagram batang        (kls 4)
 *   l7  diagram batang berskala lima / sepuluh      (kls 4)
 *   l8  nilai yang paling sering muncul (modus)     (kls 4) — deret ANGKA
 *   l9  diagram mana yang cocok dengan tabel?       (kls 4) — tabel di atas,
 *       kartu jawaban berisi diagram batang mini
 *
 * Gambar diagram digambar engine dari NILAI (`TapAnswerData.chart`,
 * `src/engine/ui/Chart.tsx`): tak ada angka di atas batang, dan tabel turus /
 * piktogram tak punya kolom angka — itu jawabannya.
 *
 * MAKSIMAL 4 kategori per diagram dan 7 gambar per baris piktogram (lebih dari
 * itu tak muat sebaris di HP 320 px). Batas bilangan `sd2` = 1.000 — di sini
 * paling besar 80.
 *
 * PENGECOH dari kesalahan khas:
 * - turus: lupa garis miring (ikat lima dihitung empat), ikat dihitung satu;
 * - piktogram: membaca baris sebelah; ×2 lupa skala (menghitung gambarnya),
 *   setengah gambar dihitung penuh / diabaikan;
 * - batang: membaca garis sebelah, membaca batang sebelah;
 * - paling banyak: batang kedua tertinggi, batang terendah (terbalik);
 * - selisih: menjumlah, menyebut satu batangnya saja; jumlah: lupa satu batang;
 * - skala lima/sepuluh: menghitung KOTAK garis bantu, bukan nilainya;
 * - modus: menyebut nilai TERBESAR, nilai yang muncul terbanyak kedua;
 * - cocokkan: dua batang tertukar, satu batang salah tinggi.
 *
 * Narasi tanpa digit (`terbilang`); angka hidup di diagram & kartu.
 */

type Level = GameLevel<'tap-answer'>;

const r = (item: string, label: string, value: number): ChartRow => ({ item, label, value });

/** Satu tema data: cara menyebut "yang dihitung" dan kata kerja untuk "paling". */
interface Theme {
  /** "anak yang suka apel" */
  q: (label: string) => string;
  /** "Buah apa" */
  what: string;
  /** "disukai" → "Buah apa yang paling banyak disukai?" */
  verb: string;
}

const BUAH: Theme = { q: (l) => `anak yang suka ${l}`, what: 'Buah apa', verb: 'disukai' };
const JUAL: Theme = { q: (l) => `${l} yang terjual`, what: 'Buah apa', verb: 'terjual' };
const PELIHARA: Theme = {
  q: (l) => `anak yang memelihara ${l}`,
  what: 'Hewan apa',
  verb: 'dipelihara',
};
const KENDARAAN: Theme = {
  q: (l) => `anak yang naik ${l}`,
  what: 'Kendaraan apa',
  verb: 'dinaiki',
};
const BEKAL: Theme = { q: (l) => `anak yang membawa ${l}`, what: 'Bekal apa', verb: 'dibawa' };
const KEBUN_BINATANG: Theme = {
  q: (l) => `anak yang suka ${l}`,
  what: 'Hewan apa',
  verb: 'disukai',
};

function numChoices(answer: number, candidates: number[]): TapChoice[] {
  const out: number[] = [];
  for (const c of candidates) {
    if (c > 0 && c <= 1000 && c !== answer && !out.includes(c)) out.push(c);
    if (out.length === 2) break;
  }
  if (out.length < 2) throw new Error(`detektif-data: pengecoh kurang untuk ${answer}`);
  return [
    { id: 'a', text: String(answer), correct: true },
    ...out.map((d, i) => ({ id: `d${i}`, text: String(d) })),
  ];
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id }));
}

/** Nilai baris tetangga (kesalahan "membaca baris sebelah"). */
function neighbour(rows: ChartRow[], i: number): number {
  return rows[i + 1 < rows.length ? i + 1 : i - 1].value;
}

// --- l1 Turus -----------------------------------------------------------------

function tally(t: Theme, rows: ChartRow[], ask: number): Level {
  const v = rows[ask].value;
  const groups = Math.floor(v / 5);
  return {
    id: '',
    narration: `Lihat turusnya. Berapa ${t.q(rows[ask].label)}?`,
    data: {
      chart: { kind: 'tally', rows },
      // Lupa garis miring (tiap ikat dihitung empat) · ikat dihitung satu.
      choices: numChoices(v, [v - groups, groups + (v % 5), v + 1, v - 1]),
    },
  };
}

// --- l2, l3 Piktogram -----------------------------------------------------------

function picto1(t: Theme, rows: ChartRow[], ask: number): Level {
  const v = rows[ask].value;
  return {
    id: '',
    narration: `Lihat piktogramnya. Berapa ${t.q(rows[ask].label)}?`,
    data: {
      chart: { kind: 'picto', rows, per: 1 },
      choices: numChoices(v, [neighbour(rows, ask), v + 1, v - 1]),
    },
  };
}

function picto2(t: Theme, rows: ChartRow[], ask: number): Level {
  const v = rows[ask].value;
  const pics = Math.ceil(v / 2);
  return {
    id: '',
    narration: `Satu gambar sama dengan dua. Berapa ${t.q(rows[ask].label)}?`,
    data: {
      chart: { kind: 'picto', rows, per: 2 },
      // Menghitung gambarnya saja · setengah gambar dihitung penuh / diabaikan.
      choices: numChoices(
        v,
        v % 2 ? [pics, pics * 2, v - 1] : [pics, v + 2, v - 2],
      ),
    },
  };
}

// --- l4 Diagram batang ----------------------------------------------------------

const BAR10 = (rows: ChartRow[]): BarChartSpec => ({
  kind: 'bar',
  rows,
  step: 1,
  max: 10,
  labelEvery: 2,
});

function barRead(t: Theme, rows: ChartRow[], ask: number): Level {
  const v = rows[ask].value;
  return {
    id: '',
    narration: `Lihat diagram batangnya. Berapa ${t.q(rows[ask].label)}?`,
    data: {
      chart: BAR10(rows),
      // Membaca garis sebelah · membaca batang sebelah.
      choices: numChoices(v, [v + 1, neighbour(rows, ask), v - 1]),
    },
  };
}

// --- l5 Paling banyak / sedikit ---------------------------------------------------

function extreme(t: Theme, rows: ChartRow[], most: boolean): Level {
  const sorted = [...rows].sort((a, b) => (most ? b.value - a.value : a.value - b.value));
  const [best, second] = sorted;
  const opposite = sorted[sorted.length - 1];
  if (best.value === second.value) throw new Error('detektif-data: dua batang tertinggi sama');
  return {
    id: '',
    narration: `${t.what} yang paling ${most ? 'banyak' : 'sedikit'} ${t.verb}?`,
    data: {
      chart: BAR10(rows),
      // Batang kedua · batang di ujung sebaliknya (salah paham banyak/sedikit).
      choices: [best, second, opposite].map((c, i) => ({
        id: i === 0 ? 'a' : `d${i}`,
        item: c.item,
        text: c.label.charAt(0).toUpperCase() + c.label.slice(1),
        correct: i === 0,
      })),
    },
  };
}

// --- l6 Selisih & jumlah -----------------------------------------------------------

const BAR20 = (rows: ChartRow[]): BarChartSpec => ({
  kind: 'bar',
  rows,
  step: 2,
  max: 20,
  labelEvery: 2,
});

function diff(rows: ChartRow[], a: number, b: number): Level {
  const [x, y] = [rows[a], rows[b]];
  const d = Math.abs(x.value - y.value);
  return {
    id: '',
    narration: `Berapa selisih ${x.label} dan ${y.label}?`,
    data: {
      chart: BAR20(rows),
      // Menjumlah alih-alih mengurangi · menyebut salah satu batangnya.
      choices: numChoices(d, [x.value + y.value, Math.max(x.value, y.value), Math.min(x.value, y.value)]),
    },
  };
}

function total(rows: ChartRow[]): Level {
  const sum = rows.reduce((n, row) => n + row.value, 0);
  const smallest = Math.min(...rows.map((row) => row.value));
  return {
    id: '',
    narration: 'Berapa jumlah semuanya?',
    data: {
      chart: BAR20(rows),
      // Lupa satu batang · salah membaca satu batang satu garis.
      choices: numChoices(sum, [sum - smallest, sum + 2, sum - 2]),
    },
  };
}

// --- l7 Skala lima / sepuluh -----------------------------------------------------------

function scaled(t: Theme, rows: ChartRow[], ask: number, step: 5 | 10): Level {
  const v = rows[ask].value;
  return {
    id: '',
    narration: `Satu garis bernilai ${terbilang(step)}. Berapa ${t.q(rows[ask].label)}?`,
    data: {
      chart: { kind: 'bar', rows, step, max: step * 8 },
      // Menghitung kotak garis bantu · membaca garis sebelah.
      choices: numChoices(v, [v / step, v + step, v - step]),
    },
  };
}

// --- l8 Modus ---------------------------------------------------------------------------

function mode(
  title: string,
  spoken: string,
  ask: string,
  values: number[],
): Level {
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  const byFreq = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const [top, second] = byFreq;
  if (top[1] === second[1]) throw new Error(`detektif-data: modus ganda di ${title}`);
  return {
    id: '',
    narration: `Ini ${spoken} ${terbilang(values.length)} anak. ${ask}`,
    data: {
      chart: { kind: 'list', title: `${title} ${values.length} anak`, values },
      // Nilai terbesar · nilai yang muncul terbanyak kedua.
      choices: numChoices(top[0], [Math.max(...values), second[0], byFreq[2]?.[0] ?? -1]),
    },
  };
}

// --- l9 Diagram mana yang cocok dengan tabel? ------------------------------------------------

function match(rows: ChartRow[], swap: [number, number], wrong: number, delta: number): Level {
  const mini = (rs: ChartRow[]): BarChartSpec => ({ kind: 'bar', rows: rs, step: 1, max: 10, labelEvery: 2 });
  const swapped = rows.map((row, i) =>
    i === swap[0] ? { ...row, value: rows[swap[1]].value } : i === swap[1] ? { ...row, value: rows[swap[0]].value } : row,
  );
  const off = rows.map((row, i) => (i === wrong ? { ...row, value: row.value + delta } : row));
  if (rows[swap[0]].value === rows[swap[1]].value) throw new Error('detektif-data: tukar nilai yang sama');
  return {
    id: '',
    narration: 'Diagram mana yang cocok dengan tabel ini?',
    data: {
      chart: { kind: 'table', rows },
      choices: [
        { id: 'a', chart: mini(rows), correct: true },
        { id: 'd0', chart: mini(swapped) },
        { id: 'd1', chart: mini(off) },
      ],
    },
  };
}

// --- Data --------------------------------------------------------------------------------------

const APEL = 'apple';
const PISANG = 'banana';
const JERUK = 'orange';
const ANGGUR = 'grapes';
const MANGGA = 'mango';
const SEMANGKA = 'watermelon';

const config: GameConfig<'tap-answer'> = {
  id: 'detektif-data',
  group: 'sd2',
  title: 'Detektif Data',
  emoji: '📊',
  template: 'tap-answer',
  levels: [
    // --- l1 (kls 3) Tabel turus ---
    slot(
      'l1',
      tally(BUAH, [r(APEL, 'apel', 8), r(PISANG, 'pisang', 5), r(JERUK, 'jeruk', 11)], 0),
      tally(BUAH, [r(MANGGA, 'mangga', 6), r(ANGGUR, 'anggur', 12), r(APEL, 'apel', 4)], 1),
      tally(PELIHARA, [r('cat', 'kucing', 9), r('rabbit', 'kelinci', 6), r('chicken', 'ayam', 3)], 0),
      tally(KENDARAAN, [r('bicycle', 'sepeda', 7), r('car', 'mobil', 4), r('bus', 'bus', 13)], 2),
      tally(BEKAL, [r('bread', 'roti', 10), r('rice', 'nasi', 14), r('egg', 'telur', 6)], 2),
      tally(KEBUN_BINATANG, [r('elephant', 'gajah', 7), r('giraffe', 'jerapah', 11), r('panda', 'panda', 5)], 1),
    ),

    // --- l2 (kls 3) Piktogram 1 gambar = 1 ---
    slot(
      'l2',
      picto1(JUAL, [r(APEL, 'apel', 5), r(JERUK, 'jeruk', 3), r(PISANG, 'pisang', 7)], 0),
      picto1(JUAL, [r(MANGGA, 'mangga', 6), r(ANGGUR, 'anggur', 4), r(SEMANGKA, 'semangka', 2)], 1),
      picto1(PELIHARA, [r('cat', 'kucing', 4), r('duck', 'bebek', 6), r('turtle', 'kura-kura', 3)], 1),
      picto1(KENDARAAN, [r('bicycle', 'sepeda', 6), r('motorcycle', 'motor', 7), r('car', 'mobil', 3)], 0),
      picto1(BEKAL, [r('bread', 'roti', 3), r('corn', 'jagung', 5), r('egg', 'telur', 7), r('rice', 'nasi', 4)], 1),
      picto1(KEBUN_BINATANG, [r('lion', 'singa', 5), r('zebra', 'zebra', 2), r('tiger', 'harimau', 6)], 2),
    ),

    // --- l3 (kls 3) Piktogram 1 gambar = 2 ---
    slot(
      'l3',
      picto2(JUAL, [r(APEL, 'apel', 7), r(JERUK, 'jeruk', 10), r(PISANG, 'pisang', 4)], 0),
      picto2(JUAL, [r(MANGGA, 'mangga', 12), r(ANGGUR, 'anggur', 9), r(SEMANGKA, 'semangka', 6)], 1),
      picto2(PELIHARA, [r('cat', 'kucing', 11), r('rabbit', 'kelinci', 8), r('duck', 'bebek', 5)], 2),
      picto2(KENDARAAN, [r('bicycle', 'sepeda', 13), r('bus', 'bus', 6), r('car', 'mobil', 8)], 0),
      picto2(BEKAL, [r('rice', 'nasi', 14), r('bread', 'roti', 10), r('egg', 'telur', 7)], 1),
      picto2(KEBUN_BINATANG, [r('elephant', 'gajah', 8), r('panda', 'panda', 12), r('giraffe', 'jerapah', 3)], 1),
    ),

    // --- l4 (kls 3) Membaca diagram batang ---
    slot(
      'l4',
      barRead(BUAH, [r(APEL, 'apel', 7), r(PISANG, 'pisang', 4), r(JERUK, 'jeruk', 9), r(MANGGA, 'mangga', 5)], 0),
      barRead(BUAH, [r(ANGGUR, 'anggur', 6), r(SEMANGKA, 'semangka', 8), r(APEL, 'apel', 3)], 1),
      barRead(PELIHARA, [r('cat', 'kucing', 5), r('rabbit', 'kelinci', 9), r('chicken', 'ayam', 2), r('duck', 'bebek', 6)], 3),
      barRead(KENDARAAN, [r('bicycle', 'sepeda', 8), r('car', 'mobil', 3), r('motorcycle', 'motor', 7)], 2),
      barRead(BEKAL, [r('bread', 'roti', 4), r('rice', 'nasi', 9), r('corn', 'jagung', 3), r('egg', 'telur', 6)], 2),
      barRead(KEBUN_BINATANG, [r('giraffe', 'jerapah', 5), r('lion', 'singa', 7), r('panda', 'panda', 9)], 0),
    ),

    // --- l5 (kls 3) Paling banyak / paling sedikit ---
    slot(
      'l5',
      extreme(BUAH, [r(APEL, 'apel', 6), r(PISANG, 'pisang', 9), r(JERUK, 'jeruk', 3), r(ANGGUR, 'anggur', 7)], true),
      extreme(BUAH, [r(MANGGA, 'mangga', 8), r(SEMANGKA, 'semangka', 4), r(APEL, 'apel', 5), r(PISANG, 'pisang', 9)], false),
      extreme(PELIHARA, [r('rabbit', 'kelinci', 7), r('turtle', 'kura-kura', 2), r('cat', 'kucing', 9), r('chicken', 'ayam', 4)], true),
      extreme(KENDARAAN, [r('bicycle', 'sepeda', 5), r('car', 'mobil', 2), r('bus', 'bus', 8), r('motorcycle', 'motor', 4)], false),
      extreme(BEKAL, [r('bread', 'roti', 6), r('rice', 'nasi', 8), r('corn', 'jagung', 3), r('egg', 'telur', 10)], true),
      extreme(KEBUN_BINATANG, [r('elephant', 'gajah', 7), r('zebra', 'zebra', 3), r('lion', 'singa', 9), r('panda', 'panda', 5)], false),
    ),

    // --- l6 (kls 4) Selisih & jumlah ---
    slot(
      'l6',
      diff([r(APEL, 'apel', 16), r(PISANG, 'pisang', 10), r(JERUK, 'jeruk', 6), r(MANGGA, 'mangga', 12)], 0, 2),
      diff([r('cat', 'kucing', 14), r('rabbit', 'kelinci', 8), r('duck', 'bebek', 18)], 2, 1),
      diff([r('bicycle', 'sepeda', 12), r('car', 'mobil', 4), r('bus', 'bus', 18), r('motorcycle', 'motor', 10)], 2, 0),
      total([r(APEL, 'apel', 6), r(PISANG, 'pisang', 10), r(JERUK, 'jeruk', 8)]),
      total([r('bread', 'roti', 12), r('rice', 'nasi', 16), r('egg', 'telur', 4)]),
      total([r('elephant', 'gajah', 14), r('giraffe', 'jerapah', 6), r('panda', 'panda', 10)]),
    ),

    // --- l7 (kls 4) Skala lima / sepuluh ---
    slot(
      'l7',
      scaled(BUAH, [r(APEL, 'apel', 25), r(PISANG, 'pisang', 15), r(JERUK, 'jeruk', 35)], 0, 5),
      scaled(PELIHARA, [r('cat', 'kucing', 30), r('rabbit', 'kelinci', 20), r('duck', 'bebek', 10), r('chicken', 'ayam', 35)], 3, 5),
      scaled(BEKAL, [r('bread', 'roti', 15), r('rice', 'nasi', 40), r('egg', 'telur', 20)], 1, 5),
      scaled(KENDARAAN, [r('bicycle', 'sepeda', 60), r('car', 'mobil', 30), r('bus', 'bus', 70), r('motorcycle', 'motor', 40)], 0, 10),
      scaled(KEBUN_BINATANG, [r('elephant', 'gajah', 50), r('lion', 'singa', 80), r('panda', 'panda', 40)], 2, 10),
      scaled(JUAL, [r(MANGGA, 'mangga', 70), r(SEMANGKA, 'semangka', 20), r(ANGGUR, 'anggur', 50)], 1, 10),
    ),

    // --- l8 (kls 4) Modus: deret angka ---
    slot(
      'l8',
      mode('Nilai ulangan', 'nilai ulangan', 'Nilai berapa yang paling sering muncul?', [7, 8, 7, 9, 6, 7, 8, 9]),
      mode('Ukuran sepatu', 'ukuran sepatu', 'Ukuran berapa yang paling sering muncul?', [30, 32, 31, 32, 33, 32, 30, 31]),
      mode('Buku dibaca', 'banyak buku yang dibaca', 'Bilangan berapa yang paling sering muncul?', [2, 4, 3, 4, 1, 4, 2, 5, 3]),
      mode('Umur', 'umur', 'Umur berapa yang paling sering muncul?', [9, 8, 9, 10, 8, 9, 9, 10]),
      mode('Tinggi tanaman (cm)', 'tinggi tanaman milik', 'Tinggi berapa yang paling sering muncul?', [13, 14, 12, 14, 15, 14, 13, 12]),
      mode('Banyak saudara', 'banyak saudara', 'Bilangan berapa yang paling sering muncul?', [1, 2, 2, 0, 3, 2, 1, 2]),
    ),

    // --- l9 (kls 4) Diagram yang cocok dengan tabel ---
    slot(
      'l9',
      match([r(APEL, 'apel', 6), r(PISANG, 'pisang', 3), r(JERUK, 'jeruk', 8)], [0, 2], 1, 2),
      match([r(MANGGA, 'mangga', 4), r(ANGGUR, 'anggur', 7), r(SEMANGKA, 'semangka', 5), r(APEL, 'apel', 2)], [1, 2], 3, 3),
      match([r('cat', 'kucing', 7), r('rabbit', 'kelinci', 5), r('duck', 'bebek', 2)], [0, 1], 2, 3),
      match([r('bicycle', 'sepeda', 3), r('car', 'mobil', 6), r('bus', 'bus', 9), r('motorcycle', 'motor', 5)], [0, 3], 1, -2),
      match([r('bread', 'roti', 8), r('rice', 'nasi', 5), r('egg', 'telur', 3)], [1, 2], 0, -2),
      match([r('lion', 'singa', 4), r('zebra', 'zebra', 9), r('panda', 'panda', 6), r('giraffe', 'jerapah', 3)], [0, 2], 1, -3),
    ),
  ],
};

export default config;
