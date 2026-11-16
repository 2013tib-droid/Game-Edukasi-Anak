/**
 * TIMBANGAN SEIMBANG (`balance-scale`, SD Kelas 1 & 2, 2026-11-15) — SATU
 * sumber aturan. Dipakai template `BalanceScale.tsx`, builder config
 * `src/games/sd1/timbangan-seimbang.ts`, pemeriksa CI
 * `scripts/check-balance-levels.mjs`, dan `scripts/extract-narration.mjs`.
 *
 * Yang diajarkan: tanda "=" artinya SEIMBANG — dua sisi sama nilainya —
 * bukan "tulis hasilnya di sini". Anak menaruh balok di piring timbangan dua
 * lengan yang miring sungguhan.
 *
 * Keputusan pemilik 2026-11-15: slot awal timbangan miring LANGSUNG
 * (eksplorasi), slot lanjut DIKUNCI PASAK (susun dulu, lalu "Lepas pasak!");
 * misi besar = timbangan GAMBAR (berat buah tak pernah ditulis/dibacakan);
 * pemandu gajah penimbang (seni `elephant`).
 */

/** Sisi timbangan, dilihat anak. */
export type Side = 'kiri' | 'kanan';

/**
 * Satu balok. `v` = beratnya. Balok ANGKA (tanpa `item`) menuliskan `v`
 * besar-besar; balok GAMBAR (`item` = id seni registry, misi besar) tidak
 * pernah memperlihatkan beratnya — anak menyimpulkannya dari timbangan kecil.
 */
export interface Block {
  v: number;
  item?: string;
}

/** Timbangan kecil yang SUDAH seimbang (misi gambar): "1 semangka = 2 nanas". */
export interface BalanceRef {
  left: Block[];
  right: Block[];
}

/**
 * Jenis soal:
 * - `fill`     — buat seimbang; susunan apa pun yang seimbang diterima.
 * - `fewest`   — buat seimbang dengan TEPAT `fewest` balok (yang paling sedikit).
 * - `missing`  — persamaan ber-"?" tampil di atas timbangan; piring sasaran
 *                punya satu tempat "?" yang muat SATU balok.
 * - `equation` — buat seimbang, lalu pilih kalimat matematika yang cocok.
 */
export type BalanceMode = 'fill' | 'fewest' | 'missing' | 'equation';

export interface BalanceStep {
  /** Kalimat langkah ke-2 dst. (langkah pertama memakai narasi level). */
  say?: string;
  mode: BalanceMode;
  /** Balok TETAP (terkunci, bergaris) di piring kiri. */
  left: Block[];
  /** Balok TETAP di piring kanan. */
  right: Block[];
  /** Piring yang menerima balok dari baki. */
  target: Side;
  /** Balok yang bisa dipindah — SELALU dengan pengecoh (Aturan Desain Soal). */
  tray: Block[];
  /** Banyak balok yang diminta (`fewest`). */
  fewest?: number;
  /** Timbangan dikunci pasak: miring baru sesudah "Lepas pasak!". */
  peg?: boolean;
  /** Timbangan kecil rujukan (misi gambar). */
  refs?: BalanceRef[];
}

export interface BalanceScaleData {
  /** Satu langkah biasa; misi besar = beberapa langkah. */
  steps: BalanceStep[];
}

/** Batas bilangan SD Kelas 1 & 2 (keputusan pemilik 2026-08-01). */
export const MAX_NUMBER = 30;
/** Balok paling banyak di satu piring (tetap + ditaruh). */
export const MAX_PAN = 5;
/** Balok paling banyak di baki. */
export const MAX_TRAY = 6;
/** Sudut miring terbesar (derajat). */
export const MAX_TILT = 14;
/** Selisih sekecil apa pun tetap terlihat miring. */
export const MIN_TILT = 4;

export const sideSum = (blocks: readonly Block[]): number => blocks.reduce((a, b) => a + b.v, 0);

/**
 * Sudut lengan: POSITIF = kanan lebih berat (lengan berputar searah jarum
 * jam, piring kanan turun). Proporsional terhadap selisih relatif, dijepit
 * ke [MIN_TILT, MAX_TILT] supaya selisih satu tetap kelihatan.
 */
export function tiltOf(left: number, right: number): number {
  const diff = right - left;
  if (diff === 0) return 0;
  const rel = Math.abs(diff) / Math.max(left, right, 1);
  const mag = Math.min(MAX_TILT, Math.max(MIN_TILT, rel * 40));
  return Math.sign(diff) * mag;
}

export const isBalanced = (left: number, right: number): boolean => left === right && left > 0;

/** Total kedua sisi, dengan balok baki terpilih (`picked`, indeks baki) di piring sasaran. */
export function sums(step: BalanceStep, picked: readonly number[]): { left: number; right: number } {
  const extra = picked.reduce((a, i) => a + (step.tray[i]?.v ?? 0), 0);
  const l = sideSum(step.left) + (step.target === 'kiri' ? extra : 0);
  const r = sideSum(step.right) + (step.target === 'kanan' ? extra : 0);
  return { left: l, right: r };
}

/** Apakah susunan ini menyelesaikan soal (seimbang + aturan modenya). */
export function solves(step: BalanceStep, picked: readonly number[]): boolean {
  if (picked.length === 0) return false;
  const { left, right } = sums(step, picked);
  if (!isBalanced(left, right)) return false;
  if (step.mode === 'missing' && picked.length !== 1) return false;
  if (step.mode === 'fewest' && picked.length !== step.fewest) return false;
  return true;
}

/** Semua himpunan bagian baki (indeks) yang seimbang — tanpa aturan mode. */
export function balancedSubsets(step: BalanceStep): number[][] {
  const out: number[][] = [];
  const n = step.tray.length;
  const room = MAX_PAN - (step.target === 'kiri' ? step.left.length : step.right.length);
  for (let mask = 1; mask < 1 << n; mask += 1) {
    const picked: number[] = [];
    for (let i = 0; i < n; i += 1) if (mask & (1 << i)) picked.push(i);
    if (picked.length > room) continue;
    const { left, right } = sums(step, picked);
    if (isBalanced(left, right)) out.push(picked);
  }
  return out;
}

/** Susunan yang diterima (mengikuti aturan mode). */
export function solutions(step: BalanceStep): number[][] {
  return balancedSubsets(step).filter((p) => solves(step, p));
}

/** Teks persamaan untuk soal `missing`, mis. "4 + ? = 9". `filled` = nilai pengisi "?". */
export function equationParts(step: BalanceStep): { left: string[]; right: string[] } {
  const vals = (b: Block[]) => b.map((x) => String(x.v));
  const l = vals(step.left);
  const r = vals(step.right);
  if (step.mode === 'missing') (step.target === 'kiri' ? l : r).push('?');
  return { left: l, right: r };
}

/**
 * Kartu kalimat matematika untuk soal `equation`, dari susunan yang anak buat
 * (bisa lebih dari satu susunan yang benar). Pengecohnya kesalahan khas
 * membaca "=" sebagai "hasilnya": "5 + 3 = 8 + 2" (jumlah kiri dilanjutkan)
 * dan "5 + 3 = 2 + 8" (jumlah kiri dimasukkan ke tempat yang kosong).
 * Kedua pengecoh selalu SALAH secara nilai, jadi tak pernah kembar dengan
 * jawabannya.
 */
export function equationCards(step: BalanceStep, picked: readonly number[]): { text: string; correct: boolean }[] {
  const placed = picked.map((i) => step.tray[i]!.v);
  const fixedT = (step.target === 'kiri' ? step.left : step.right).map((b) => b.v);
  const other = (step.target === 'kiri' ? step.right : step.left).map((b) => b.v);
  const join = (xs: number[]) => xs.join(' + ');
  const sumOther = other.reduce((a, b) => a + b, 0);
  const sentence = (lhs: number[], rhs: number[]) =>
    step.target === 'kanan' ? `${join(lhs)} = ${join(rhs)}` : `${join(rhs)} = ${join(lhs)}`;
  const correct = sentence(other, [...fixedT, ...placed]);
  const rest = fixedT.length ? fixedT : placed;
  const d1 = sentence(other, [sumOther, ...rest]);
  const d2 = sentence(other, [...rest, sumOther]);
  const cards = [
    { text: correct, correct: true },
    { text: d1, correct: false },
    { text: d2, correct: false },
  ];
  // d1 & d2 bisa kembar kalau `rest` cuma satu bilangan yang sama dengan sumOther — buang yang dobel.
  return cards.filter((c, i) => cards.findIndex((x) => x.text === c.text) === i);
}

/** Kalimat tetap template — WAJIB sama dengan yang dirender (extract-narration). */
export const BALANCE_LINES = {
  /** Pasak dilepas tapi belum seimbang (sekali per level). */
  heavy: 'Masih berat sebelah! Sisi mana yang terlalu berat?',
  /** `fewest`: seimbang tapi baloknya lebih dari yang diminta. */
  tooMany: 'Sudah seimbang, tapi baloknya kebanyakan!',
  /** "Lepas pasak!" ditekan sebelum ada balok yang ditaruh. */
  empty: 'Taruh balok dulu, baru lepas pasaknya!',
  /** `equation`: sesudah seimbang, kartu kalimat muncul. */
  pick: 'Kalimat mana yang cocok dengan timbangan?',
} as const;
