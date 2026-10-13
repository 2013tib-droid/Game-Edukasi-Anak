/**
 * Satu-satunya sumber logika template `code-quest` (Kode Kelinci · Misi Kode):
 * membaca papan, MENJALANKAN program kartu panah, dan mencari jalan terpendek.
 * Dipakai template (`CodeQuest.tsx`) DAN builder config — jadi soal yang
 * dinyatakan "bisa diselesaikan dengan kode ini" diperiksa dengan mesin yang
 * sama persis dengan yang menjalankan kode anak di layar.
 *
 * Arahnya MUTLAK (atas · kanan · bawah · kiri di layar), bukan maju/belok —
 * keputusan pemilik 2026-10-12: kiri-kanan relatif terhadap arah hadap terlalu
 * sulit untuk anak 6–7 tahun.
 */

export type CodeDir = 'atas' | 'kanan' | 'bawah' | 'kiri';
/**
 * Kartu di rel. `ulangi` = KOTAK SIHIR (2026-10-13, menggantikan rel ulangi
 * terpisah): kotak di rel yang sama, berisi panah (`loop`) yang dijalankan
 * `times` kali. Banyaknya ulangan DIPILIH ANAK (diketuk di kotaknya), bukan
 * ditentukan soal — anak harus menghitung sendiri.
 */
export type CodeCard = CodeDir | 'ulangi';

export interface CodeProgram {
  main: CodeCard[];
  /** Isi kotak ulangi (hanya level ber-`loop`; paling banyak satu kotak). */
  loop?: CodeDir[];
  /** Banyak ulangan kotak. `null`/kosong = anak belum memilih angkanya. */
  times?: number | null;
}

/** Angka yang bisa dipilih di kotak ulangi (diketuk bergiliran). */
export const LOOP_TIMES = [2, 3, 4, 5] as const;

export interface Cell {
  r: number;
  c: number;
}

/**
 * Huruf papan (`CodeQuestData.grid`, satu string per baris):
 * `.` rumput · `S` tokoh mulai · `G` tujuan · `*` barang yang harus diambil ·
 * `#` batu · `T` pohon · `~` kolam. Tiga yang terakhir menghalangi.
 */
export type TileKind = 'rumput' | 'batu' | 'pohon' | 'kolam';

export interface Board {
  rows: number;
  cols: number;
  start: Cell;
  goal: Cell;
  pickups: Cell[];
  tiles: TileKind[][];
}

export const DIRS: CodeDir[] = ['atas', 'kanan', 'bawah', 'kiri'];

export const DELTA: Record<CodeDir, Cell> = {
  atas: { r: -1, c: 0 },
  kanan: { r: 0, c: 1 },
  bawah: { r: 1, c: 0 },
  kiri: { r: 0, c: -1 },
};

/**
 * Kalimat tetap template ini. WAJIB sama dengan yang dikumpulkan
 * `scripts/extract-narration.mjs` (skrip itu mengimpor objek ini, jadi tak
 * bisa menyimpang). Nama kartu dibacakan saat kartunya disentuh — anak TK
 * sedang belajar kata "kanan/kiri/atas/bawah", dan itu justru muatannya.
 */
export const CODE_LINES = {
  card: { atas: 'Atas', kanan: 'Kanan', bawah: 'Bawah', kiri: 'Kiri', ulangi: 'Ulangi' } as Record<CodeCard, string>,
  bump: 'Ups, ada yang menghalangi! Perbaiki kodenya, ya.',
  short: 'Belum sampai. Tambah kodenya, ya!',
  missing: 'Masih ada yang belum diambil. Coba lagi, ya!',
  empty: 'Susun kodenya dulu, ya!',
  /** Kotak ulangi dijalankan kebanyakan: tokoh melewati tujuannya. */
  over: 'Kebanyakan diulang, jadi kelewatan. Hitung lagi, ya!',
  noTimes: 'Berapa kali diulang? Sentuh angka di kotak ulangi.',
  loopEmpty: 'Kotak ulangi masih kosong. Isi dengan panah, ya!',
  times: {
    2: 'Ulangi dua kali',
    3: 'Ulangi tiga kali',
    4: 'Ulangi empat kali',
    5: 'Ulangi lima kali',
  } as Record<number, string>,
};

export function parseBoard(grid: string[]): Board {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let start: Cell | null = null;
  let goal: Cell | null = null;
  const pickups: Cell[] = [];
  const tiles: TileKind[][] = [];
  grid.forEach((line, r) => {
    if (line.length !== cols) throw new Error(`Papan kode: baris ${r + 1} tidak sama panjang`);
    const row: TileKind[] = [];
    [...line].forEach((ch, c) => {
      if (ch === 'S') start = { r, c };
      else if (ch === 'G') goal = { r, c };
      else if (ch === '*') pickups.push({ r, c });
      else if (!'.#T~'.includes(ch)) throw new Error(`Papan kode: huruf "${ch}" tak dikenal`);
      row.push(ch === '#' ? 'batu' : ch === 'T' ? 'pohon' : ch === '~' ? 'kolam' : 'rumput');
    });
    tiles.push(row);
  });
  if (!start || !goal) throw new Error('Papan kode: wajib ada tepat satu S dan satu G');
  return { rows, cols, start, goal, pickups, tiles };
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.r === b.r && a.c === b.c;
}

function open(board: Board, p: Cell): boolean {
  return p.r >= 0 && p.c >= 0 && p.r < board.rows && p.c < board.cols && board.tiles[p.r]![p.c] === 'rumput';
}

/** Satu langkah yang dijalankan, untuk animasi & penanda kartu. */
export interface TraceStep {
  rail: 'main' | 'loop';
  /** Indeks kartu di rel-nya. */
  index: number;
  /** Indeks kartu `ulangi` di rel utama yang sedang berjalan (langkah rel ulangi). */
  via?: number;
  dir: CodeDir;
  from: Cell;
  to: Cell;
  /** Menabrak (keluar papan / batu / pohon / kolam): tokoh tetap di `from`. */
  bump?: boolean;
  /** Indeks barang di `board.pickups` yang terambil di langkah ini. */
  got?: number;
}

/** `lewat` = tujuan sempat dicapai di tengah kotak ulangi, tapi ulangannya kebanyakan. */
export type RunOutcome = 'sampai' | 'nabrak' | 'kurang' | 'belum-ambil' | 'kosong' | 'lewat';

export interface RunResult {
  steps: TraceStep[];
  outcome: RunOutcome;
}

/** Banyak langkah paling banyak — jaring pengaman, tak pernah tercapai di soal sah. */
const MAX_STEPS = 80;

/**
 * Jalankan program. Berhenti begitu tokoh tiba di tujuan dengan SEMUA barang
 * terambil (sisa kartu di rel diabaikan — anak TK tak dihukum karena satu
 * kartu lebih), atau begitu menabrak. Tujuan yang dilewati sebelum semua
 * barang terambil tidak menghentikan apa pun.
 *
 * KECUALI di dalam kotak ulangi: tiba di tujuan sebelum ulangan terakhir
 * selesai TIDAK menghentikan tokoh — ia jalan terus dan hasilnya `lewat`.
 * Kalau tidak, anak cukup memilih angka terbesar dan tak pernah menghitung.
 */
export function runProgram(board: Board, prog: CodeProgram): RunResult {
  const steps: TraceStep[] = [];
  let pos = board.start;
  const got = new Set<number>();
  let outcome: RunOutcome | null = null;
  let passed = false;
  const times = prog.times ?? 1;
  const body = prog.loop ?? [];

  const done = () => got.size === board.pickups.length && sameCell(pos, board.goal);

  const move = (dir: CodeDir, rail: 'main' | 'loop', index: number, via?: number, lastOfLoop = true): boolean => {
    if (steps.length >= MAX_STEPS) return false;
    const d = DELTA[dir];
    const to = { r: pos.r + d.r, c: pos.c + d.c };
    if (!open(board, to)) {
      steps.push({ rail, index, via, dir, from: pos, to: pos, bump: true });
      outcome = passed ? 'lewat' : 'nabrak';
      return false;
    }
    const step: TraceStep = { rail, index, via, dir, from: pos, to };
    const p = board.pickups.findIndex((q) => sameCell(q, to));
    if (p >= 0 && !got.has(p)) {
      got.add(p);
      step.got = p;
    }
    steps.push(step);
    pos = to;
    if (done()) {
      if (rail === 'loop' && !lastOfLoop) {
        passed = true;
        return true;
      }
      outcome = 'sampai';
      return false;
    }
    return true;
  };

  if (prog.main.length === 0) return { steps, outcome: 'kosong' };

  outer: for (let i = 0; i < prog.main.length; i++) {
    const card = prog.main[i]!;
    if (card === 'ulangi') {
      for (let t = 0; t < times; t++) {
        for (let j = 0; j < body.length; j++) {
          const last = t === times - 1 && j === body.length - 1;
          if (!move(body[j]!, 'loop', j, i, last)) break outer;
        }
      }
    } else if (!move(card, 'main', i)) break;
  }

  if (!outcome) outcome = passed ? 'lewat' : sameCell(pos, board.goal) ? 'belum-ambil' : 'kurang';
  return { steps, outcome };
}

/** Banyak kartu dalam program (rel utama + rel ulangi). */
export function cardCount(prog: CodeProgram): number {
  return prog.main.length + (prog.loop?.length ?? 0);
}

/**
 * Jalan TERPENDEK yang mengambil semua barang lalu tiba di tujuan (BFS atas
 * posisi × barang yang sudah terambil). `null` kalau mustahil.
 */
export function shortestPath(board: Board): CodeDir[] | null {
  const n = board.pickups.length;
  const full = (1 << n) - 1;
  const key = (p: Cell, m: number) => `${p.r},${p.c},${m}`;
  const startMask = 0;
  const prev = new Map<string, { from: string; dir: CodeDir } | null>();
  const queue: { p: Cell; m: number }[] = [{ p: board.start, m: startMask }];
  prev.set(key(board.start, startMask), null);
  while (queue.length) {
    const { p, m } = queue.shift()!;
    if (m === full && sameCell(p, board.goal)) {
      const path: CodeDir[] = [];
      let k: string | undefined = key(p, m);
      while (k && prev.get(k)) {
        const e: { from: string; dir: CodeDir } = prev.get(k)!;
        path.unshift(e.dir);
        k = e.from;
      }
      return path;
    }
    for (const dir of DIRS) {
      const to = { r: p.r + DELTA[dir].r, c: p.c + DELTA[dir].c };
      if (!open(board, to)) continue;
      const pi = board.pickups.findIndex((q) => sameCell(q, to));
      const nm = pi >= 0 ? m | (1 << pi) : m;
      const k = key(to, nm);
      if (prev.has(k)) continue;
      prev.set(k, { from: key(p, m), dir });
      queue.push({ p: to, m: nm });
    }
  }
  return null;
}
