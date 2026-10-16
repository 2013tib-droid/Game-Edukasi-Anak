/**
 * Satu-satunya sumber logika template `color-path` — PETAK WARNA (coding anak
 * bagian kedua: PERCABANGAN, sesudah urutan & ulangi di `code-quest`).
 * Dipakai template (`ColorPath.tsx`), builder config (`games/colorLevels.ts`),
 * pemeriksa CI (`scripts/check-color-levels.mjs`) DAN skrip narasi — jadi
 * "aturan ini membawa tokoh sampai" diperiksa dengan mesin yang sama persis
 * dengan yang berjalan di layar anak.
 *
 * Cara kerjanya (dan itulah yang dipelajari anak): tokoh berjalan SENDIRI
 * lurus ke depan, petak demi petak. Di papan ada petak berwarna. Anak
 * memasang SATU ATURAN per warna — "KALAU menginjak merah, belok ke atas".
 * Aturan itu berlaku untuk SEMUA petak merah, jadi satu panah harus cocok di
 * beberapa tempat sekaligus: itu yang membuatnya berpikir, bukan sekadar
 * menyusun langkah. Tokoh berhenti kalau tiba di tujuan (dengan semua barang
 * terambil), menabrak, atau mulai berputar-putar di jalan yang sama.
 */

import { DELTA, DIRS, sameCell, type Cell, type CodeDir } from '@/engine/core/codeQuest';

export type PadColor = 'merah' | 'kuning' | 'biru' | 'hijau';
export const PAD_COLORS: PadColor[] = ['merah', 'kuning', 'biru', 'hijau'];

/** Huruf petak warna di papan. */
export const PAD_LETTER: Record<string, PadColor> = { m: 'merah', k: 'kuning', b: 'biru', h: 'hijau' };

/** Warna petak — sama dengan cat Sanggar Warna supaya "merah" di app ini satu rupa. */
export const PAD_HEX: Record<PadColor, string> = {
  merah: '#e03131',
  kuning: '#fcc419',
  biru: '#1c6fd6',
  hijau: '#2f9e44',
};

export type PathTile = 'rumput' | 'batu' | 'pohon' | 'kolam';

/**
 * Huruf papan (`ColorPathData.grid`, satu string per baris):
 * `.` rumput · `S` tokoh mulai · `G` tujuan · `*` barang · `#` batu ·
 * `T` pohon · `~` kolam · `m` `k` `b` `h` petak merah/kuning/biru/hijau.
 */
export interface PathBoard {
  rows: number;
  cols: number;
  start: Cell;
  goal: Cell;
  pickups: Cell[];
  tiles: PathTile[][];
  pads: (PadColor | null)[][];
  /** Warna yang ADA di papan, urut palet — satu aturan per warna. */
  colors: PadColor[];
}

/** Aturan anak: warna → arah. `null` = belum dipasang. */
export type PathRules = Partial<Record<PadColor, CodeDir | null>>;

export function parsePathBoard(grid: string[]): PathBoard {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let start: Cell | null = null;
  let goal: Cell | null = null;
  const pickups: Cell[] = [];
  const tiles: PathTile[][] = [];
  const pads: (PadColor | null)[][] = [];
  const seen = new Set<PadColor>();
  grid.forEach((line, r) => {
    if (line.length !== cols) throw new Error(`Papan warna: baris ${r + 1} tidak sama panjang`);
    const row: PathTile[] = [];
    const padRow: (PadColor | null)[] = [];
    [...line].forEach((ch, c) => {
      if (ch === 'S') start = { r, c };
      else if (ch === 'G') goal = { r, c };
      else if (ch === '*') pickups.push({ r, c });
      else if (!'.#T~'.includes(ch) && !PAD_LETTER[ch]) throw new Error(`Papan warna: huruf "${ch}" tak dikenal`);
      const pad = PAD_LETTER[ch] ?? null;
      if (pad) seen.add(pad);
      padRow.push(pad);
      row.push(ch === '#' ? 'batu' : ch === 'T' ? 'pohon' : ch === '~' ? 'kolam' : 'rumput');
    });
    tiles.push(row);
    pads.push(padRow);
  });
  if (!start || !goal) throw new Error('Papan warna: wajib ada tepat satu S dan satu G');
  return { rows, cols, start, goal, pickups, tiles, pads, colors: PAD_COLORS.filter((c) => seen.has(c)) };
}

/**
 * Kalimat tetap template ini. WAJIB sama dengan yang dikumpulkan
 * `scripts/extract-narration.mjs` (skrip itu mengimpor objek ini). Nama arah
 * & warna SENGAJA sama persis dengan `CODE_LINES.card` dan nama tanda lama,
 * jadi rekamannya dipakai bersama.
 */
export const PATH_LINES = {
  dir: { atas: 'Atas', kanan: 'Kanan', bawah: 'Bawah', kiri: 'Kiri' } as Record<CodeDir, string>,
  color: { merah: 'Merah', kuning: 'Kuning', biru: 'Biru', hijau: 'Hijau' } as Record<PadColor, string>,
  /** Tokoh menabrak batu/pohon/kolam/tepi papan. */
  bump: 'Ups, menabrak! Ubah aturannya, ya.',
  /** Tokoh berputar di jalan yang sama terus. */
  loop: 'Wah, berputar-putar terus! Ubah aturannya, ya.',
  /** Tiba di tujuan tapi barang tertinggal — sama dengan `CODE_LINES.missing`. */
  missing: 'Masih ada yang belum diambil. Coba lagi, ya!',
  /** Ada warna yang belum diberi panah. */
  empty: 'Pasang panah di setiap warna dulu, ya!',
};

export interface PathStep {
  from: Cell;
  to: Cell;
  dir: CodeDir;
  /** Menabrak: tokoh tetap di `from`. */
  bump?: boolean;
  /** Indeks barang di `board.pickups` yang terambil di langkah ini. */
  got?: number;
  /** Warna petak yang diinjak di `to` — arah berikutnya = aturan warna ini. */
  pad?: PadColor;
}

export type PathOutcome = 'sampai' | 'nabrak' | 'putar' | 'belum-ambil' | 'kosong';

export interface PathRun {
  steps: PathStep[];
  outcome: PathOutcome;
  /** Warna yang terakhir membelokkan tokoh sebelum gagal (untuk ditandai merah). */
  blame?: PadColor;
}

const MAX_STEPS = 80;

function open(board: PathBoard, p: Cell): boolean {
  return p.r >= 0 && p.c >= 0 && p.r < board.rows && p.c < board.cols && board.tiles[p.r]![p.c] === 'rumput';
}

/** Semua warna di papan sudah diberi panah? */
export function rulesComplete(board: PathBoard, rules: PathRules): boolean {
  return board.colors.every((c) => !!rules[c]);
}

/**
 * Jalankan tokoh. Mulai di S menghadap `startDir`, tiap langkah maju satu
 * petak; menginjak petak warna = arahnya berganti jadi aturan warna itu.
 * Tiba di tujuan sebelum semua barang terambil = berhenti (`belum-ambil`).
 * Keadaan (petak, arah, barang) yang terulang = berputar selamanya (`putar`).
 */
export function runPath(board: PathBoard, startDir: CodeDir, rules: PathRules): PathRun {
  if (!rulesComplete(board, rules)) return { steps: [], outcome: 'kosong' };
  const steps: PathStep[] = [];
  let pos = board.start;
  let dir = startDir;
  let mask = 0;
  let blame: PadColor | undefined;
  const seen = new Set<string>();
  while (steps.length < MAX_STEPS) {
    const state = `${pos.r},${pos.c},${dir},${mask}`;
    if (seen.has(state)) return { steps, outcome: 'putar', blame };
    seen.add(state);
    const to = { r: pos.r + DELTA[dir].r, c: pos.c + DELTA[dir].c };
    if (!open(board, to)) {
      steps.push({ from: pos, to: pos, dir, bump: true });
      return { steps, outcome: 'nabrak', blame };
    }
    const step: PathStep = { from: pos, to, dir };
    const pi = board.pickups.findIndex((q) => sameCell(q, to));
    if (pi >= 0 && !(mask & (1 << pi))) {
      mask |= 1 << pi;
      step.got = pi;
    }
    const pad = board.pads[to.r]![to.c];
    if (pad) {
      step.pad = pad;
      dir = rules[pad]!;
      blame = pad;
    }
    steps.push(step);
    pos = to;
    if (sameCell(pos, board.goal)) {
      return { steps, outcome: mask === (1 << board.pickups.length) - 1 ? 'sampai' : 'belum-ambil', blame };
    }
  }
  return { steps, outcome: 'putar', blame };
}

/** Semua susunan aturan untuk warna-warna papan (4^k). */
export function* allRules(colors: PadColor[]): Generator<PathRules> {
  const idx = colors.map(() => 0);
  while (true) {
    const rules: PathRules = {};
    colors.forEach((c, i) => (rules[c] = DIRS[idx[i]!]));
    yield rules;
    let k = 0;
    while (k < idx.length && ++idx[k]! === DIRS.length) idx[k++] = 0;
    if (k === idx.length) return;
  }
}

/** Semua susunan aturan yang membawa tokoh sampai. */
export function solutions(board: PathBoard, startDir: CodeDir): PathRules[] {
  const out: PathRules[] = [];
  for (const r of allRules(board.colors)) if (runPath(board, startDir, r).outcome === 'sampai') out.push(r);
  return out;
}
