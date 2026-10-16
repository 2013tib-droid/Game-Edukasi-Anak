import type { ColorPathData, GameLevel, LevelStamp } from '@/engine/core/types';
import type { CodeDir } from '@/engine/core/codeQuest';
import {
  PAD_COLORS,
  parsePathBoard,
  runPath,
  type PadColor,
  type PathRules,
} from '@/engine/core/colorPath';

/**
 * Builder bersama dua game PETAK WARNA (`color-path`): Petak Ajaib (TK) &
 * Kode Warna (SD Kelas 1 & 2). Tiap soal diperiksa dengan mesin yang sama
 * dengan yang berjalan di layar (`core/colorPath.ts`). Builder ini ikut jalan
 * di HP anak saat game dibuka, jadi cuma memeriksa yang MURAH (jawaban contoh
 * sampai, kode perbaiki memang salah); pemeriksaan BERAT — mencoba SEMUA
 * susunan aturan — ada di `scripts/check-color-levels.mjs` (CI).
 *
 * Varian = rancangan papan yang DICERMINKAN/DIPUTAR (arahnya ikut) dan
 * DIWARNAI ULANG (merah jadi biru, dst.): logikanya sama persis, rupanya
 * berbeda — anak tak bisa menghafal "merah selalu ke bawah".
 */

type Level = GameLevel<'color-path'>;

export interface ColorSpec {
  grid: string[];
  start: CodeDir;
  /** Aturan yang benar, per warna yang ada di papan. */
  solution: PathRules;
  /** Mode PERBAIKI: aturan yang sudah terpasang (wajib gagal). */
  given?: PathRules;
}

export interface ColorCast {
  hero: string;
  heroFaces?: 'kiri' | 'kanan';
  goal: string;
  pickup?: string;
}

type Flip = (d: CodeDir) => CodeDir;
type How = 'id' | 'h' | 'v' | 'hv' | 't';
const MIRROR_H: Flip = (d) => (d === 'kanan' ? 'kiri' : d === 'kiri' ? 'kanan' : d);
const MIRROR_V: Flip = (d) => (d === 'atas' ? 'bawah' : d === 'bawah' ? 'atas' : d);
const TRANSPOSE: Flip = (d) => ({ atas: 'kiri', kiri: 'atas', bawah: 'kanan', kanan: 'bawah' })[d] as CodeDir;

const FLIPS: { how: How; dir: Flip }[] = [
  { how: 'id', dir: (d) => d },
  { how: 'h', dir: MIRROR_H },
  { how: 'v', dir: MIRROR_V },
  { how: 'hv', dir: (d) => MIRROR_H(MIRROR_V(d)) },
  { how: 't', dir: TRANSPOSE },
];

function mapGrid(grid: string[], how: How): string[] {
  const rows = grid.map((r) => [...r]);
  if (how === 'id') return grid;
  if (how === 'h') return rows.map((r) => r.reverse().join(''));
  if (how === 'v') return [...grid].reverse();
  if (how === 'hv') return [...rows].reverse().map((r) => r.reverse().join(''));
  return rows[0]!.map((_, c) => rows.map((r) => r[c]).join(''));
}

/** Permutasi warna per varian (urutan diacak manual, bukan rotasi). */
const COLOR_PERMS: PadColor[][] = [
  ['merah', 'kuning', 'biru', 'hijau'],
  ['biru', 'hijau', 'merah', 'kuning'],
  ['kuning', 'merah', 'hijau', 'biru'],
  ['hijau', 'biru', 'kuning', 'merah'],
  ['merah', 'hijau', 'kuning', 'biru'],
  ['biru', 'kuning', 'hijau', 'merah'],
];
const LETTER: Record<PadColor, string> = { merah: 'm', kuning: 'k', biru: 'b', hijau: 'h' };
const FROM_LETTER: Record<string, PadColor> = { m: 'merah', k: 'kuning', b: 'biru', h: 'hijau' };

function mapRules(rules: PathRules | undefined, color: (c: PadColor) => PadColor, dir: Flip): PathRules | undefined {
  if (!rules) return undefined;
  const out: PathRules = {};
  for (const c of PAD_COLORS) {
    const d = rules[c];
    if (d) out[color(c)] = dir(d);
  }
  return out;
}

function fail(where: string, why: string): never {
  throw new Error(`Soal petak warna ${where}: ${why}`);
}

/** Satu soal, diperiksa (yang murah saja — lihat kepala berkas). */
export function colorLevel(narration: string, cast: ColorCast, spec: ColorSpec, where: string): Level {
  if (/\d/.test(narration)) fail(where, `narasi memuat angka: "${narration}"`);
  const board = parsePathBoard(spec.grid);
  if (board.rows > 6 || board.cols > 6) fail(where, 'papan lebih dari 6×6');
  if (board.colors.length === 0) fail(where, 'papan tanpa petak warna');
  if (board.pickups.length > 0 && !cast.pickup) fail(where, 'papan punya * tapi `pickup` kosong');
  if (board.pickups.length > 3) fail(where, 'lebih dari tiga barang');
  const keys = PAD_COLORS.filter((c) => spec.solution[c]);
  if (keys.join() !== board.colors.join()) fail(where, 'aturan contoh tidak pas dengan warna di papan');
  if (runPath(board, spec.start, spec.solution).outcome !== 'sampai') fail(where, 'aturan contoh tidak sampai');
  if (spec.given) {
    if (PAD_COLORS.filter((c) => spec.given![c]).join() !== board.colors.join()) fail(where, 'aturan perbaiki tidak lengkap');
    if (runPath(board, spec.start, spec.given).outcome === 'sampai') fail(where, 'aturan "perbaiki" ternyata sudah benar');
  }
  const data: ColorPathData = {
    grid: spec.grid,
    startDir: spec.start,
    heroItem: cast.hero,
    heroFaces: cast.heroFaces,
    goalItem: cast.goal,
    pickupItem: cast.pickup,
    given: spec.given,
    solution: spec.solution,
  };
  return { id: '', narration, data };
}

/**
 * Satu SLOT: tiap rancangan dicerminkan/diputar DAN diwarnai ulang jadi
 * beberapa varian (kembar dibuang), bergiliran antar-rancangan.
 */
export function colorSlot(
  id: string,
  stamp: LevelStamp,
  narration: string,
  cast: ColorCast,
  designs: ColorSpec[],
  opts: { max?: number; flips?: How[] } = {},
): Level[] {
  const allowed = opts.flips ?? ['id', 'h', 'v', 'hv', 't'];
  const perDesign: Level[][] = [];
  const seen = new Set<string>();
  let k = 0;
  for (const [di, design] of designs.entries()) {
    const out: Level[] = [];
    perDesign.push(out);
    for (const f of FLIPS) {
      if (!allowed.includes(f.how)) continue;
      const perm = COLOR_PERMS[k++ % COLOR_PERMS.length]!;
      const color = (c: PadColor) => perm[PAD_COLORS.indexOf(c)]!;
      const grid = mapGrid(design.grid, f.how).map((row) =>
        [...row].map((ch) => (FROM_LETTER[ch] ? LETTER[color(FROM_LETTER[ch]!)] : ch)).join(''),
      );
      const key = grid.join('/');
      if (seen.has(key)) continue;
      seen.add(key);
      const spec: ColorSpec = {
        grid,
        start: f.dir(design.start),
        solution: mapRules(design.solution, color, f.dir)!,
        given: mapRules(design.given, color, f.dir),
      };
      out.push({ ...colorLevel(narration, cast, spec, `${id} rancangan ${di + 1}/${f.how}`), id, stamp });
    }
  }
  const mixed: Level[] = [];
  for (let i = 0; perDesign.some((d) => i < d.length); i++) {
    for (const d of perDesign) if (d[i]) mixed.push(d[i]!);
  }
  return mixed.slice(0, opts.max ?? 6);
}
