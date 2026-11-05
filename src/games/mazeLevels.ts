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

function build(id: string, k: number, spec: MazeSpec) {
  const want = spec.pickups ?? 0;
  for (let n = 0; n < 4000; n += 1) {
    const m = generateMaze(spec.cols, spec.rows, seedOf(`${id}:${k}:${n}`), spec.braid ?? 0);
    const [start, goal] = corners(m, k);
    const main = shortestPath(m, start, goal);
    if (main.length < Math.ceil((spec.minPath ?? 0) * m.open.length)) continue;
    const forks = main.filter((i) => openNeighbors(m, i).length >= 3).length;
    if (forks < (spec.minForks ?? 0)) continue;

    // Barang di ujung jalan buntu yang JAUH dari jalan utama: anak harus
    // memutar masuk cabang, mengambilnya, lalu kembali.
    const onMain = new Set(main);
    const fromMain = (i: number) => {
      const d = distances(m, i);
      return Math.min(...main.map((p) => d[p]!));
    };
    const candidates = deadEnds(m)
      .filter((i) => !onMain.has(i) && i !== start && i !== goal)
      .map((i) => ({ i, depth: fromMain(i) }))
      .filter((x) => x.depth >= 2)
      .sort((a, b) => b.depth - a.depth || a.i - b.i);
    const picks: number[] = [];
    for (const cand of candidates) {
      if (picks.length >= want) break;
      const d = distances(m, cand.i);
      if (picks.every((p) => d[p]! >= 3)) picks.push(cand.i);
    }
    if (picks.length < want) continue;
    const traps = deadEnds(m).filter((i) => i !== start && i !== goal && !picks.includes(i)).length;
    if (traps < (spec.minDead ?? 0)) continue;
    const tour = bestTour(m, start, goal, picks);
    return { m, start, goal, pickups: picks, par: tour.length - 1 };
  }
  throw new Error(`mazeLevels: labirin ${id} varian ${k} tak bisa memenuhi syaratnya — longgarkan spec-nya`);
}

/**
 * Satu slot berisi `count` varian. `say(cast)` menulis kalimat soal untuk
 * tokoh itu — kalimat TIDAK boleh berangka (aturan narasi).
 */
export function mazeSlot(
  id: string,
  stamp: LevelStamp,
  say: (cast: MazeCast) => string,
  spec: MazeSpec,
  casts: MazeCast[],
  count = 5,
): GameLevel<'maze'>[] {
  if (spec.cols > 6) throw new Error(`mazeLevels: ${id} lebih dari 6 kolom — lorongnya terlalu sempit di HP 320 px`);
  const out: GameLevel<'maze'>[] = [];
  for (let k = 0; k < count; k += 1) {
    const cast = casts[k % casts.length]!;
    if ((spec.pickups ?? 0) > 0 && !cast.pickup) throw new Error(`mazeLevels: ${id} butuh tokoh yang punya barang`);
    const b = build(id, k, spec);
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
      },
    });
  }
  return out;
}

/** Untuk pemeriksa: petak → "r,c". */
export function cellLabel(m: MazeGrid, i: number): string {
  return `${rowOf(m, i)},${colOf(m, i)}`;
}
