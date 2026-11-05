import type { GameLevel, LevelStamp, SceneId } from '@/engine/core/types';
import {
  bestTour,
  colOf,
  deadEnds,
  distances,
  generateMaze,
  openNeighbors,
  rowOf,
  seedOf,
  shortestPath,
  withPuddles,
  type MazeGrid,
} from '@/engine/core/maze';

/**
 * Pembuat soal LABIRIN (template `maze`). Config cuma menyebut ukuran &
 * tingkat kesulitannya; labirinnya dibuat mesin dari benih `<slot>:<varian>:<n>`
 * — n dinaikkan sampai labirinnya memenuhi syarat slot. Jadi tiap build & tiap
 * HP mendapat labirin yang SAMA, dan `scripts/check-maze-levels.mjs` memeriksa
 * labirin yang persis dimainkan anak.
 */

export interface MazeCast {
  hero: string;
  /** Nama tokoh di kalimat ("kelinci"). */
  name: string;
  heroFaces?: 'kiri' | 'kanan';
  goal: string;
  /** Nama tujuan di kalimat ("wortel", "kandang"). */
  goalName: string;
  pickup?: string;
  /** Nama barang di kalimat ("wortel"). */
  pickupName?: string;
  scene?: SceneId;
}

export interface MazeSpec {
  cols: number;
  rows: number;
  /** Banyak barang yang wajib diambil dulu (0–3). */
  pickups?: number;
  /** 0..1 — sebagian jalan buntu dibuka jadi putaran (lebih ramah). */
  braid?: number;
  /** Jalan mulai→tujuan minimal sepecahan ini dari seluruh petak. */
  minPath?: number;
  /** Persimpangan (petak bercabang ≥ 3) minimal di jalan yang benar. */
  minForks?: number;
  /** Jalan buntu "jebakan" minimal (di luar mulai, tujuan & barang). */
  minDead?: number;
  /**
   * Labirin Hujan (SD): banyak GENANGAN AIR yang menutup jalan pintas. Kalau
   * diisi, tujuan selalu di UJUNG jalan buntu terjauh (tak bisa dilewati),
   * dan kalau ada barang, tujuannya terkunci sampai semuanya terambil.
   */
  puddles?: number;
}

/** Pojok mulai → pojok seberang, bergiliran per varian. */
function corners(m: MazeGrid, k: number): [number, number] {
  const last = m.cols * m.rows - 1;
  const tr = m.cols - 1;
  const bl = (m.rows - 1) * m.cols;
  const pairs: [number, number][] = [
    [0, last],
    [tr, bl],
    [bl, tr],
    [last, 0],
  ];
  return pairs[k % pairs.length]!;
}

interface Built {
  m: MazeGrid;
  start: number;
  goal: number;
  pickups: number[];
  par: number;
  puddles?: number[];
  /** Nomor percobaan benih yang lolos (lihat `seeds` di `mazeSlot`). */
  n: number;
}

/** Semua petak (selain genangan) terjangkau dari `start`? */
function connected(eff: MazeGrid, start: number, puddles: number[]): boolean {
  const d = distances(eff, start);
  return d.every((x, i) => x >= 0 || puddles.includes(i));
}

/** Barang di ujung jalan buntu yang jauh dari jalan utama (dipakai kedua builder). */
function placePickups(m: MazeGrid, main: number[], skip: Set<number>, want: number): number[] {
  const onMain = new Set(main);
  const fromMain = (i: number) => {
    const d = distances(m, i);
    return Math.min(...main.map((p) => d[p]!));
  };
  const candidates = deadEnds(m)
    .filter((i) => !onMain.has(i) && !skip.has(i))
    .map((i) => ({ i, depth: fromMain(i) }))
    .filter((x) => x.depth >= 2)
    .sort((a, b) => b.depth - a.depth || a.i - b.i);
  const picks: number[] = [];
  for (const cand of candidates) {
    if (picks.length >= want) break;
    const d = distances(m, cand.i);
    if (picks.every((p) => d[p]! >= 3)) picks.push(cand.i);
  }
  return picks;
}

/** Tutup sisi antara dua petak bertetangga. */
function shut(m: MazeGrid, a: number, b: number): MazeGrid {
  const open = m.open.slice();
  const dr = rowOf(m, b) - rowOf(m, a);
  const dc = colOf(m, b) - colOf(m, a);
  const bitA = dr === -1 ? 1 : dc === 1 ? 2 : dr === 1 ? 4 : 8;
  const bitB = dr === -1 ? 4 : dc === 1 ? 8 : dr === 1 ? 1 : 2;
  open[a] = open[a]! & ~bitA;
  open[b] = open[b]! & ~bitB;
  return { cols: m.cols, rows: m.rows, open };
}

/**
 * Builder LABIRIN HUJAN (SD). Labirinnya sengaja ber-PUTARAN (`braid`) supaya
 * ada jalan pintas. Lalu:
 *  1. Tujuan di POJOK SEBERANG mulai, dijadikan ujung jalan buntu (pintu
 *     lain ditutup pagar) — kandang paling ujung, tak mungkin dilewati.
 *  2. Barang di ujung jalan buntu yang dalam, jauh dari jalan utama.
 *  3. Genangan ditaruh satu per satu di rute terpendek, di petak yang paling
 *     memperpanjang rutenya — tiap genangan menutup jalan pintas yang
 *     menggoda, dan petak sebelum genangan jadi jalan buntu jebakan.
 */
function buildRain(id: string, k: number, spec: MazeSpec, from = 0): Built {
  const want = spec.pickups ?? 0;
  const wantPuddles = spec.puddles ?? 0;
  for (let n = from; n < from + 20000; n += 1) {
    const seed = seedOf(`${id}:${k}:${n}`);
    let raw = generateMaze(spec.cols, spec.rows, seed, spec.braid ?? 0);
    const [start, corner] = corners(raw, k);
    const dist0 = distances(raw, start);

    // 1. Tujuan di POJOK SEBERANG (petak pojok itu atau tetangga dekatnya,
    //    yang jalannya paling jauh dari mulai), dijadikan satu pintu.
    let goal = -1;
    const nearCorner = (i: number) =>
      Math.abs(rowOf(raw, i) - rowOf(raw, corner)) + Math.abs(colOf(raw, i) - colOf(raw, corner)) <= 1;
    const far = dist0
      .map((d, i) => ({ d, i }))
      .filter((x) => nearCorner(x.i))
      .sort((a, b) => b.d - a.d || a.i - b.i);
    for (const { i } of far) {
      const nb = openNeighbors(raw, i);
      if (nb.length === 1) {
        goal = i;
        break;
      }
      const keep = nb.reduce((a, b) => (dist0[b]! < dist0[a]! ? b : a));
      let cut = raw;
      for (const x of nb) if (x !== keep) cut = shut(cut, i, x);
      if (connected(cut, start, [])) {
        raw = cut;
        goal = i;
        break;
      }
    }
    if (goal < 0) continue;

    // 2. Barang.
    const picks = placePickups(raw, shortestPath(raw, start, goal), new Set([start, goal]), want);
    if (picks.length < want) continue;

    // 3. Genangan di jalan pintas.
    const puddles: number[] = [];
    let tie = seed;
    const banned = new Set<number>([start, goal, ...picks, ...openNeighbors(raw, start)]);
    for (let p = 0; p < wantPuddles; p += 1) {
      const eff = withPuddles(raw, puddles);
      const base = bestTour(eff, start, goal, picks);
      let best: number[] = [];
      let bestGain = 1;
      for (const c of new Set(base)) {
        if (banned.has(c)) continue;
        const near = puddles.some(
          (q) => Math.abs(rowOf(raw, q) - rowOf(raw, c)) + Math.abs(colOf(raw, q) - colOf(raw, c)) < 2,
        );
        if (near) continue;
        const next = [...puddles, c];
        const eff2 = withPuddles(raw, next);
        if (!connected(eff2, start, next)) continue;
        const gain = bestTour(eff2, start, goal, picks).length - base.length;
        if (gain > bestGain) {
          bestGain = gain;
          best = [c];
        } else if (gain === bestGain && best.length) best.push(c);
      }
      if (!best.length) break;
      tie = Math.imul(tie ^ 0x9e3779b9, 2654435761) >>> 0;
      puddles.push(best[tie % best.length]!);
    }
    if (puddles.length < wantPuddles) continue;

    const eff = withPuddles(raw, puddles);
    const main = shortestPath(eff, start, goal);
    if (main.length < Math.ceil((spec.minPath ?? 0) * eff.open.length)) continue;
    const forks = main.filter((i) => openNeighbors(eff, i).length >= 3).length;
    if (forks < (spec.minForks ?? 0)) continue;
    const traps = deadEnds(eff).filter((i) => i !== start && i !== goal && !picks.includes(i)).length;
    if (traps < (spec.minDead ?? 0)) continue;
    const tour = bestTour(eff, start, goal, picks);
    return { m: raw, start, goal, pickups: picks, par: tour.length - 1, puddles, n };
  }
  throw new Error(`mazeLevels: labirin ${id} varian ${k} tak bisa memenuhi syaratnya — longgarkan spec-nya`);
}

function build(id: string, k: number, spec: MazeSpec, from = 0): Built {
  if (spec.puddles) return buildRain(id, k, spec, from);
  const want = spec.pickups ?? 0;
  for (let n = from; n < from + 4000; n += 1) {
    const m = generateMaze(spec.cols, spec.rows, seedOf(`${id}:${k}:${n}`), spec.braid ?? 0);
    const [start, goal] = corners(m, k);
    const main = shortestPath(m, start, goal);
    if (main.length < Math.ceil((spec.minPath ?? 0) * m.open.length)) continue;
    const forks = main.filter((i) => openNeighbors(m, i).length >= 3).length;
    if (forks < (spec.minForks ?? 0)) continue;

    // Barang di ujung jalan buntu yang JAUH dari jalan utama: anak harus
    // memutar masuk cabang, mengambilnya, lalu kembali.
    const picks = placePickups(m, main, new Set([start, goal]), want);
    if (picks.length < want) continue;
    const traps = deadEnds(m).filter((i) => i !== start && i !== goal && !picks.includes(i)).length;
    if (traps < (spec.minDead ?? 0)) continue;
    const tour = bestTour(m, start, goal, picks);
    return { m, start, goal, pickups: picks, par: tour.length - 1, n };
  }
  throw new Error(`mazeLevels: labirin ${id} varian ${k} tak bisa memenuhi syaratnya — longgarkan spec-nya`);
}

/**
 * Satu slot berisi `count` varian. `say(cast)` menulis kalimat soal untuk
 * tokoh itu — kalimat TIDAK boleh berangka (aturan narasi).
 *
 * `seeds` (opsional) = nomor percobaan benih yang SUDAH diketahui lolos, satu
 * per varian. Labirin dibuat saat game dibuka DI HP ANAK, dan labirin hujan
 * yang syaratnya banyak bisa butuh ratusan percobaan — dengan `seeds` cukup
 * satu. Kalau spec diubah dan angkanya tak lagi lolos tepat di situ, builder
 * GAGAL dan menyebut angka barunya (jadi tak pernah diam-diam lambat).
 */
export function mazeSlot(
  id: string,
  stamp: LevelStamp,
  say: (cast: MazeCast) => string,
  spec: MazeSpec,
  casts: MazeCast[],
  count = 5,
  seeds?: number[],
): GameLevel<'maze'>[] {
  if (spec.cols > 6) throw new Error(`mazeLevels: ${id} lebih dari 6 kolom — lorongnya terlalu sempit di HP 320 px`);
  const out: GameLevel<'maze'>[] = [];
  for (let k = 0; k < count; k += 1) {
    const cast = casts[k % casts.length]!;
    if ((spec.pickups ?? 0) > 0 && !cast.pickup) throw new Error(`mazeLevels: ${id} butuh tokoh yang punya barang`);
    const b = build(id, k, spec, seeds?.[k] ?? 0);
    if (seeds && b.n !== seeds[k]) {
      const fresh = Array.from({ length: count }, (_, j) => build(id, j, spec).n);
      throw new Error(`mazeLevels: ${id} — benih tercatat tak lolos lagi; pakai seeds [${fresh.join(', ')}]`);
    }
    const narration = say(cast);
    if (/\d/.test(narration)) throw new Error(`mazeLevels: ${id} — narasi berangka: ${narration}`);
    out.push({
      id,
      narration,
      stamp,
      data: {
        cols: b.m.cols,
        rows: b.m.rows,
        open: b.m.open,
        start: b.start,
        goal: b.goal,
        pickups: b.pickups.length ? b.pickups : undefined,
        heroItem: cast.hero,
        heroFaces: cast.heroFaces,
        goalItem: cast.goal,
        pickupItem: b.pickups.length ? cast.pickup : undefined,
        par: b.par,
        scene: cast.scene,
        puddles: b.puddles?.length ? b.puddles : undefined,
        goalShut: b.puddles && b.pickups.length ? true : undefined,
      },
    });
  }
  return out;
}

/** Untuk pemeriksa: petak → "r,c". */
export function cellLabel(m: MazeGrid, i: number): string {
  return `${rowOf(m, i)},${colOf(m, i)}`;
}
