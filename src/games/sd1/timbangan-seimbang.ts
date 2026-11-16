import type { GameConfig, GameLevel } from '@/engine/core/types';
import {
  MAX_NUMBER,
  MAX_PAN,
  MAX_TRAY,
  balancedSubsets,
  equationCards,
  sideSum,
  solutions,
  type BalanceRef,
  type BalanceStep,
  type Block,
  type Side,
} from '@/engine/core/balance';

/**
 * "Timbangan Seimbang" (SD Kelas 1 & 2, 2026-11-15) — makna tanda "=" sebagai
 * SEIMBANG, dasar aljabar: 5 + 3 = ? + 2, 4 + ? = 9, 7 = 3 + ?. Anak menaruh
 * balok di timbangan dua lengan yang miring sungguhan.
 *
 * Keputusan pemilik 2026-11-15 (lewat pertanyaan sebelum mulai):
 * - slot awal timbangan miring LANGSUNG (eksplorasi); mulai l5 DIKUNCI PASAK —
 *   susun dulu, lalu "Lepas pasak!" (memaksa berpikir, bukan coba-coba);
 * - misi besar = timbangan GAMBAR (1 semangka = 2 nanas → simpulkan);
 * - pemandu gajah penimbang (seni `elephant`).
 *
 * SLOT (urutan tetap, 6 varian per slot):
 *   l1 isi satu sisi (langsung miring)    l6 missing "a = b + ?" (dibaca dari kanan)
 *   l2 satu balok tidak cukup             l7 seimbangkan → pilih kalimat matematika
 *   l3 kedua piring sudah berisi          l8 "a + b = c + ?"
 *   l4 paling sedikit: dua balok saja     l9 MISI BESAR timbangan gambar (3 langkah)
 *   l5 missing "a + ? = b" (mulai pasak)
 *
 * Aturan (dijaga builder di bawah DAN `scripts/check-balance-levels.mjs`):
 * - Semua bilangan & jumlah sisi ≤ 30 (keputusan pemilik 2026-08-01),
 *   termasuk pengecoh — jumlah piring sasaran kalau SEMUA balok baki ditaruh.
 * - Baki ≤ 5 balok (satu baris di HP 320 px) dan SELALU ada pengecoh: balok
 *   yang tak dipakai satu pun susunan yang benar.
 * - `missing` tepat satu balok yang benar; `fewest` banyak balok paling
 *   sedikit = yang diminta; timbangan tidak seimbang sejak awal.
 * - Narasi ≤ 70 karakter, tanpa angka; angka cukup di balok & persamaan.
 * - Tiap soal tentang keseimbangan DUA sisi — bukan tambah/kurang biasa
 *   (itu milik Hitung Hebat).
 */

const MAX_LINE = 70;
const TRAY_LIMIT = Math.min(MAX_TRAY, 5);

const n = (...vs: number[]): Block[] => vs.map((v) => ({ v }));

function line(text: string, where: string): string {
  if (/\d/.test(text)) throw new Error(`timbangan-seimbang ${where}: narasi memuat angka — "${text}"`);
  if (text.length > MAX_LINE) throw new Error(`timbangan-seimbang ${where}: narasi ${text.length} karakter — "${text}"`);
  return text;
}

interface Extra {
  /** Satu balok saja tidak boleh cukup (l2). */
  needMany?: boolean;
}

/** Periksa satu langkah; melempar error kalau soalnya cacat. */
function check(step: BalanceStep, where: string, extra: Extra = {}): BalanceStep {
  const all = [...step.left, ...step.right, ...step.tray, ...(step.refs ?? []).flatMap((r) => [...r.left, ...r.right])];
  for (const b of all) {
    if (!Number.isInteger(b.v) || b.v < 1 || b.v > MAX_NUMBER) throw new Error(`${where}: balok ${b.v} di luar 1–${MAX_NUMBER}`);
  }
  if (step.tray.length > TRAY_LIMIT) throw new Error(`${where}: baki ${step.tray.length} balok (> ${TRAY_LIMIT})`);
  if (step.left.length > MAX_PAN || step.right.length > MAX_PAN) throw new Error(`${where}: piring terlalu penuh`);
  if (sideSum(step.left) === sideSum(step.right)) throw new Error(`${where}: timbangan sudah seimbang sejak awal`);
  const fixedT = sideSum(step.target === 'kiri' ? step.left : step.right);
  const load = step.mode === 'missing' ? Math.max(...step.tray.map((b) => b.v)) : sideSum(step.tray);
  if (fixedT + load > MAX_NUMBER) throw new Error(`${where}: piring sasaran bisa berjumlah ${fixedT + load} (> ${MAX_NUMBER})`);
  if (sideSum(step.target === 'kiri' ? step.right : step.left) > MAX_NUMBER) throw new Error(`${where}: sisi tetap > ${MAX_NUMBER}`);
  for (const r of step.refs ?? []) {
    if (sideSum(r.left) !== sideSum(r.right)) throw new Error(`${where}: timbangan rujukan tidak seimbang`);
  }

  const sols = solutions(step);
  if (sols.length === 0) throw new Error(`${where}: tak ada susunan baki yang seimbang`);
  // Pengecoh: balok angka yang tak dipakai SATU PUN susunan benar. Balok gambar
  // kembar (empat apel) tak bisa dibedakan per indeks, jadi di sana cukup:
  // tiap susunan benar menyisakan balok di baki.
  const picture = step.tray.some((b) => b.item);
  const used = new Set(sols.flat());
  const decoy = picture ? sols.every((s) => s.length < step.tray.length) : used.size < step.tray.length;
  if (!decoy) throw new Error(`${where}: baki tanpa pengecoh`);
  if (extra.needMany && sols.some((s) => s.length === 1)) throw new Error(`${where}: satu balok sudah cukup`);
  if (step.mode === 'missing' && sols.length !== 1) throw new Error(`${where}: "?" bisa diisi ${sols.length} balok`);
  if (step.mode === 'fewest') {
    const min = Math.min(...balancedSubsets(step).map((s) => s.length));
    if (min !== step.fewest) throw new Error(`${where}: paling sedikit ${min} balok, bukan ${step.fewest}`);
  }
  if (step.mode === 'equation') {
    for (const s of sols) {
      const cards = equationCards(step, s);
      if (cards.length !== 3) throw new Error(`${where}: kartu kalimat kembar untuk susunan ${s}`);
    }
  }
  if (step.say) line(step.say, where);
  return step;
}

let count = 0;
function lvl(id: string, narration: string, stamp: string, steps: BalanceStep[]): GameLevel<'balance-scale'> {
  count += 1;
  return { id, narration: line(narration, id), stamp: { emoji: stamp }, data: { steps } };
}

/** Satu langkah balok angka. */
function one(
  id: string,
  narration: string,
  stamp: string,
  mode: BalanceStep['mode'],
  left: number[],
  right: number[],
  target: Side,
  tray: number[],
  opts: { peg?: boolean; fewest?: number } & Extra = {},
): GameLevel<'balance-scale'> {
  const step: BalanceStep = { mode, left: n(...left), right: n(...right), target, tray: n(...tray) };
  if (opts.peg) step.peg = true;
  if (opts.fewest) step.fewest = opts.fewest;
  return lvl(id, narration, stamp, [check(step, `${id} ${left}|${right}`, opts)]);
}

// ---------- Slot l1–l8 ----------

const L1 = 'Taruh balok di piring kanan sampai timbangannya seimbang!';
const L2 = 'Satu balok saja tidak cukup. Buat timbangannya seimbang!';
const L3 = 'Kedua piring sudah berisi. Buat timbangannya seimbang!';
const L4 = 'Pakai dua balok saja. Buat timbangannya seimbang!';
const L5 = 'Balok mana yang hilang? Taruh, lalu lepas pasaknya!';
const L6 = 'Sama dengan artinya seimbang. Isi tanda tanyanya!';
const L7 = 'Seimbangkan, lalu pilih kalimat yang cocok!';
const L8 = 'Kedua sisi harus sama berat. Isi tanda tanyanya!';

const fill1 = (l: number, tray: number[]) => one('l1', L1, '🍎', 'fill', [l], [], 'kanan', tray);
const fill2 = (l: number, tray: number[]) => one('l2', L2, '🍌', 'fill', [l], [], 'kanan', tray, { needMany: true });
const fill3 = (l: number[], r: number[], tray: number[]) => one('l3', L3, '🥕', 'fill', l, r, 'kanan', tray);
const fewest2 = (l: number, tray: number[]) => one('l4', L4, '🍊', 'fewest', [l], [], 'kanan', tray, { fewest: 2 });
/** a + ? = b — tempat "?" di piring KIRI. */
const missL = (a: number, b: number, tray: number[]) => one('l5', L5, '🥚', 'missing', [a], [b], 'kiri', tray, { peg: true });
/** a = b + ? — hasilnya di kiri, "?" di kanan. */
const missR = (a: number, b: number, tray: number[]) => one('l6', L6, '🍞', 'missing', [a], [b], 'kanan', tray, { peg: true });
const eqn = (l: number[], r: number[], tray: number[]) => one('l7', L7, '🧀', 'equation', l, r, 'kanan', tray, { peg: true });
const miss2 = (l: number[], c: number, tray: number[]) => one('l8', L8, '🥛', 'missing', l, [c], 'kanan', tray, { peg: true });

// ---------- l9: misi besar timbangan gambar ----------

interface Fruit {
  item: string;
  name: string;
}
const F: Record<string, Fruit> = {
  semangka: { item: 'watermelon', name: 'semangka' },
  melon: { item: 'melon', name: 'melon' },
  nanas: { item: 'pineapple', name: 'nanas' },
  mangga: { item: 'mango', name: 'mangga' },
  pisang: { item: 'banana', name: 'pisang' },
  alpukat: { item: 'avocado', name: 'alpukat' },
  pir: { item: 'pear', name: 'pir' },
  apel: { item: 'apple', name: 'apel' },
  jeruk: { item: 'orange', name: 'jeruk' },
  stroberi: { item: 'strawberry', name: 'stroberi' },
  kiwi: { item: 'kiwi', name: 'kiwi' },
  lemon: { item: 'lemon', name: 'lemon' },
  ceri: { item: 'cherry', name: 'ceri' },
};

/**
 * Tiga buah dengan berat TERSEMBUNYI besar 4 · sedang 2 · kecil 1. Anak cuma
 * melihat timbangan kecil yang sudah seimbang ("1 semangka = 2 nanas"),
 * beratnya tak pernah ditulis atau dibacakan.
 */
function mission(big: string, mid: string, small: string): GameLevel<'balance-scale'> {
  const B: Block = { v: 4, item: F[big]!.item };
  const M: Block = { v: 2, item: F[mid]!.item };
  const S: Block = { v: 1, item: F[small]!.item };
  const refBM: BalanceRef = { left: [B], right: [M, M] };
  const refMS: BalanceRef = { left: [M], right: [S, S] };
  const where = `l9 ${big}`;
  const s1 = check({ mode: 'fill', left: [B], right: [], target: 'kanan', tray: [M, M, M, S], peg: true, refs: [refBM] }, `${where} langkah 1`);
  const s2 = check(
    {
      say: `Satu ${F[mid]!.name} seberat dua ${F[small]!.name}. Seimbangkan lagi!`,
      mode: 'fill',
      left: [B],
      right: [],
      target: 'kanan',
      tray: [S, S, S, S, M],
      peg: true,
      refs: [refBM, refMS],
    },
    `${where} langkah 2`,
  );
  const s3 = check(
    {
      say: 'Kedua piring sudah berisi. Buat seimbang sekali lagi!',
      mode: 'fill',
      left: [B, S],
      right: [M],
      target: 'kanan',
      tray: [M, S, S, S, B],
      peg: true,
      refs: [refBM, refMS],
    },
    `${where} langkah 3`,
  );
  // Langkah 1 harus TUNGGAL: anak belum tahu berat buah kecil.
  const kinds = new Set(solutions(s1).map((sol) => sol.map((i) => s1.tray[i]!.item).sort().join('+')));
  if (kinds.size !== 1) throw new Error(`${where}: langkah 1 bisa dijawab lebih dari satu cara`);
  return lvl('l9', `Kios Timbang! Berapa ${F[mid]!.name} seberat satu ${F[big]!.name}?`, '🍉', [s1, s2, s3]);
}

const config: GameConfig<'balance-scale'> = {
  id: 'timbangan-seimbang',
  group: 'sd1',
  title: 'Timbangan Seimbang',
  emoji: '⚖️',
  template: 'balance-scale',
  project: { title: 'Kios Timbang' },
  hints: true,
  levels: [
    [
      fill1(5, [2, 5, 7, 3]),
      fill1(8, [6, 8, 3, 9]),
      fill1(4, [4, 6, 1, 9]),
      fill1(7, [2, 9, 7, 6]),
      fill1(9, [9, 4, 8, 2]),
      fill1(6, [3, 8, 6, 10]),
    ],
    [
      fill2(9, [4, 5, 8, 2]),
      fill2(12, [7, 5, 10, 3]),
      fill2(10, [6, 3, 4, 8]),
      fill2(11, [9, 6, 5, 1]),
      fill2(13, [8, 6, 5, 9]),
      fill2(14, [9, 3, 5, 12]),
    ],
    [
      fill3([6, 3], [4], [5, 2, 7, 1]),
      fill3([8], [2], [6, 3, 9, 4]),
      fill3([5, 5], [3], [7, 4, 8, 2]),
      fill3([9, 4], [6], [3, 7, 5, 9]),
      fill3([10], [7, 1], [2, 4, 1, 6]),
      fill3([7, 6], [9], [4, 6, 2, 8]),
    ],
    [
      fewest2(10, [1, 2, 3, 7, 4]),
      fewest2(12, [5, 7, 2, 3, 4]),
      fewest2(9, [1, 3, 5, 4, 2]),
      fewest2(14, [8, 6, 3, 5, 1]),
      fewest2(11, [2, 4, 5, 6, 3]),
      fewest2(13, [9, 4, 2, 6, 1]),
    ],
    [
      missL(4, 9, [5, 13, 9, 3]),
      missL(6, 10, [4, 16, 10, 6]),
      missL(3, 11, [8, 14, 11, 7]),
      missL(7, 12, [5, 19, 12, 6]),
      missL(5, 13, [8, 18, 13, 9]),
      missL(8, 15, [7, 22, 15, 6]),
    ],
    [
      missR(7, 3, [4, 10, 7, 5]),
      missR(9, 5, [4, 14, 9, 3]),
      missR(12, 4, [8, 16, 12, 7]),
      missR(10, 7, [3, 17, 10, 4]),
      missR(15, 9, [6, 21, 15, 5]),
      missR(11, 2, [9, 13, 11, 8]),
    ],
    [
      eqn([5, 3], [2], [6, 8, 4, 1]),
      eqn([4, 4], [3], [5, 8, 2, 7]),
      eqn([6, 2], [5], [3, 8, 1, 6]),
      eqn([7, 5], [4], [8, 3, 5, 9]),
      eqn([9, 3], [6], [6, 2, 4, 12]),
      eqn([8, 6], [7], [7, 3, 9, 4]),
    ],
    [
      miss2([5, 4], 6, [3, 9, 15, 4]),
      miss2([7, 6], 8, [5, 13, 21, 6]),
      miss2([9, 3], 5, [7, 12, 17, 6]),
      miss2([8, 8], 10, [6, 16, 5, 7]),
      miss2([6, 5], 4, [7, 11, 15, 8]),
      miss2([9, 7], 12, [4, 16, 3, 5]),
    ],
    [
      mission('semangka', 'nanas', 'apel'),
      mission('melon', 'mangga', 'jeruk'),
      mission('nanas', 'pisang', 'stroberi'),
      mission('semangka', 'alpukat', 'kiwi'),
      mission('melon', 'pir', 'lemon'),
      mission('nanas', 'mangga', 'ceri'),
    ],
  ],
};

if (count !== 54) throw new Error(`timbangan-seimbang: ${count} varian, harusnya 54`);

export default config;
