import type { CodeQuestData, GameLevel, LevelStamp } from '@/engine/core/types';
import {
  cardCount,
  LOOP_TIMES,
  parseBoard,
  runProgram,
  shortestPath,
  type CodeCard,
  type CodeDir,
  type CodeProgram,
} from '@/engine/core/codeQuest';

/**
 * Builder bersama dua game coding (`code-quest`): Kode Kelinci (TK) & Misi
 * Kode (SD Kelas 1 & 2). Tiap soal DIPERIKSA saat build dengan mesin yang
 * sama dengan yang menjalankan kode anak (`core/codeQuest.ts`) — papan yang
 * mustahil, jawaban contoh yang salah, atau kode "perbaiki" yang ternyata
 * sudah benar gagal di `npm run build`, bukan di HP anak.
 *
 * Varian dibuat dengan MENCERMINKAN/MEMUTAR satu rancangan papan
 * (`flips`): jalan & kodenya ikut dicerminkan, jadi tiap varian tetap soal
 * yang sama sulitnya dengan arah yang berbeda — anak tak bisa menghafal
 * "selalu kanan dulu".
 */

type Level = GameLevel<'code-quest'>;

export interface CodeSpec {
  grid: string[];
  /** Tempat kartu rel utama. Bawaan: panjang jalan terpendek + `spare`. */
  slots?: number;
  /** Tempat cadangan di atas jalan terpendek (bawaan 1). */
  spare?: number;
  loop?: { times: 2 | 3 | 4; slots: number };
  given?: CodeProgram;
  /** Wajib untuk level ber-`loop`; selain itu diambil dari jalan terpendek. */
  solution?: CodeProgram;
}

export interface CodeCast {
  hero: string;
  heroFaces?: 'kiri' | 'kanan';
  goal: string;
  pickup?: string;
}

type Flip = (d: CodeDir) => CodeDir;
const SAME: Flip = (d) => d;
const MIRROR_H: Flip = (d) => (d === 'kanan' ? 'kiri' : d === 'kiri' ? 'kanan' : d);
const MIRROR_V: Flip = (d) => (d === 'atas' ? 'bawah' : d === 'bawah' ? 'atas' : d);
const TRANSPOSE: Flip = (d) => ({ atas: 'kiri', kiri: 'atas', bawah: 'kanan', kanan: 'bawah' })[d] as CodeDir;

function mapGrid(grid: string[], how: 'id' | 'h' | 'v' | 'hv' | 't'): string[] {
  const rows = grid.map((r) => [...r]);
  if (how === 'id') return grid;
  if (how === 'h') return rows.map((r) => r.reverse().join(''));
  if (how === 'v') return [...grid].reverse();
  if (how === 'hv') return [...rows].reverse().map((r) => r.reverse().join(''));
  return rows[0]!.map((_, c) => rows.map((r) => r[c]).join(''));
}

const FLIPS: { how: 'id' | 'h' | 'v' | 'hv' | 't'; dir: Flip }[] = [
  { how: 'id', dir: SAME },
  { how: 'h', dir: MIRROR_H },
  { how: 'v', dir: MIRROR_V },
  { how: 'hv', dir: (d) => MIRROR_H(MIRROR_V(d)) },
  { how: 't', dir: TRANSPOSE },
];

function mapProg(p: CodeProgram | undefined, f: Flip): CodeProgram | undefined {
  if (!p) return undefined;
  const card = (c: CodeCard): CodeCard => (c === 'ulangi' ? c : f(c));
  return { ...p, main: p.main.map(card), loop: p.loop?.map(f) };
}

function fail(where: string, why: string): never {
  throw new Error(`Soal coding ${where}: ${why}`);
}

/** Satu soal, diperiksa lengkap. */
export function codeLevel(narration: string, cast: CodeCast, spec: CodeSpec, where: string): Level {
  if (/\d/.test(narration)) fail(where, `narasi memuat angka: "${narration}"`);
  const board = parseBoard(spec.grid);
  if (board.rows > 5 || board.cols > 5) fail(where, 'papan lebih dari 5×5');
  if (board.pickups.length > 0 && !cast.pickup) fail(where, 'papan punya * tapi `pickup` kosong');
  if (board.pickups.length > 3) fail(where, 'lebih dari tiga barang');
  const path = shortestPath(board);
  if (!path) fail(where, 'papan tak bisa diselesaikan');

  const times = spec.loop?.times;
  let solution = spec.solution;
  if (spec.loop && !solution) fail(where, 'level ber-ulangi wajib menulis `solution`');
  if (!solution) solution = { main: path };
  if (times) solution = { ...solution, times };
  const given = spec.given && times ? { ...spec.given, times } : spec.given;
  const slots = spec.slots ?? (spec.loop ? solution.main.length + (spec.spare ?? 0) : path.length + (spec.spare ?? 1));

  const check = (p: CodeProgram, what: string) => {
    if (p.main.length > slots) fail(where, `${what} lebih panjang dari rel utama`);
    if ((p.loop?.length ?? 0) > (spec.loop?.slots ?? 0)) fail(where, `${what}: rel ulangi kepanjangan`);
    if (!spec.loop && (p.main.includes('ulangi') || p.loop)) fail(where, `${what} memakai ulangi tanpa rel ulangi`);
    if (p.main.filter((c) => c === 'ulangi').length > 1) fail(where, `${what}: lebih dari satu kotak ulangi`);
  };
  check(solution, 'jawaban contoh');
  if (runProgram(board, solution).outcome !== 'sampai') fail(where, 'jawaban contoh tidak sampai');
  if (spec.loop) {
    // Anak memilih angkanya sendiri: angka lain WAJIB gagal, kalau tidak
    // soal ini tak melatih menghitung ulangan sama sekali.
    for (const t of LOOP_TIMES) {
      if (t !== times && runProgram(board, { ...solution, times: t }).outcome === 'sampai') {
        fail(where, `ulangi ×${t} juga sampai — angka ulangannya tak perlu dihitung`);
      }
    }
    if (path.length <= slots) fail(where, 'rel utama cukup tanpa ulangi — kartu ulangi tak terasa perlu');
    if (!solution.main.includes('ulangi')) fail(where, 'jawaban contoh tidak memakai ulangi');
  }
  if (given) {
    check(given, 'kode perbaiki');
    if (runProgram(board, given).outcome === 'sampai') fail(where, 'kode "perbaiki" ternyata sudah benar');
    if (cardCount(given) === 0) fail(where, 'kode perbaiki kosong');
  }

  const data: CodeQuestData = {
    grid: spec.grid,
    heroItem: cast.hero,
    heroFaces: cast.heroFaces,
    goalItem: cast.goal,
    pickupItem: cast.pickup,
    slots,
    loop: spec.loop,
    given,
    solution,
  };
  return { id: '', narration, data };
}

/**
 * Satu SLOT: tiap rancangan papan dicerminkan/diputar jadi beberapa varian
 * (kembar dibuang), lalu diambil paling banyak `max`.
 */
export function codeSlot(
  id: string,
  stamp: LevelStamp,
  narration: string,
  cast: CodeCast,
  designs: CodeSpec[],
  opts: { max?: number; flips?: ('id' | 'h' | 'v' | 'hv' | 't')[] } = {},
): Level[] {
  const allowed = opts.flips ?? ['id', 'h', 'v', 'hv', 't'];
  const seen = new Set<string>();
  const perDesign: Level[][] = [];
  for (const [di, design] of designs.entries()) {
    const out: Level[] = [];
    perDesign.push(out);
    for (const f of FLIPS) {
      if (!allowed.includes(f.how)) continue;
      const grid = mapGrid(design.grid, f.how);
      const key = grid.join('/');
      if (seen.has(key)) continue;
      seen.add(key);
      const spec: CodeSpec = {
        ...design,
        grid,
        given: mapProg(design.given, f.dir),
        solution: mapProg(design.solution, f.dir),
      };
      out.push({ ...codeLevel(narration, cast, spec, `${id} rancangan ${di + 1}/${f.how}`), id, stamp });
    }
  }
  // Sebar varian antar-rancangan dulu, baru antar-cermin.
  const mixed: Level[] = [];
  for (let i = 0; perDesign.some((d) => i < d.length); i++) {
    for (const d of perDesign) if (d[i]) mixed.push(d[i]!);
  }
  return mixed.slice(0, opts.max ?? 6);
}
