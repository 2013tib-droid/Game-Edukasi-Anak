import type { GameLevel } from '@/engine/core/types';
import {
  SPOT_FLIPPABLE,
  SPOT_LAYOUTS,
  SPOT_TONE,
  spotProblems,
  thingKey,
  type SpotChange,
  type SpotColor,
  type SpotDiffData,
  type SpotKind,
  type SpotLayoutId,
  type SpotPlace,
  type SpotShape,
  type SpotThing,
} from '@/engine/core/spotDiff';

/**
 * Builder soal "Cari Perbedaan" (Cari Beda TK, Teliti Gambar SD 1-2).
 *
 * Varian dibuat ACAK-TETAP dari benih (id slot + nomor varian): hasilnya sama
 * di tiap build dan tiap HP, jadi pemeriksa CI memeriksa soal yang persis
 * dimainkan anak. Tiap varian berganti tempat (taman, sawah, pantai, …).
 * Soal yang tak sah membuat BUILD GAGAL (`spotProblems`).
 *
 * Isi tiap tempat = benda yang memang ada di dunia anak Indonesia; tanpa
 * musim semi, salju, atau benda negeri empat musim.
 */

const GROUND: Record<SpotPlace, string[]> = {
  taman: ['cat', 'rabbit', 'duck', 'chicken', 'ball', 'teddy', 'bicycle', 'flower', 'tree', 'umbrella', 'scooter', 'backpack'],
  kebun: ['rabbit', 'chicken', 'frog', 'turtle', 'carrot', 'corn', 'strawberry', 'watermelon', 'apple', 'flower', 'tree', 'banana', 'orange'],
  sawah: ['cow', 'goat', 'chicken', 'duck', 'horse', 'tractor', 'corn', 'barn', 'tree', 'frog', 'carrot', 'cat'],
  pantai: ['turtle', 'duck', 'ball', 'umbrella', 'cap', 'shoe', 'watermelon', 'orange', 'backpack', 'banana', 'teddy', 'bicycle'],
  'kebun-binatang': ['lion', 'giraffe', 'elephant', 'panda', 'zebra', 'monkey', 'tiger', 'penguin', 'koala', 'bear', 'tree', 'horse'],
  kota: ['car', 'bus', 'taxi', 'truck', 'scooter', 'bicycle', 'house', 'shop', 'school', 'tree', 'cat', 'train'],
};

/** Benda langit berseni (matahari tak pernah dua). */
const SKY_ITEMS = ['sun', 'cloud', 'jalak'];
const SHAPES: SpotShape[] = ['balon', 'layang', 'kupu'];
const COLORS: SpotColor[] = ['merah', 'kuning', 'biru', 'hijau'];
export const SPOT_PLACES: SpotPlace[] = ['taman', 'kebun', 'sawah', 'pantai', 'kebun-binatang', 'kota'];

function rngFrom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: readonly T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface SpotSpec {
  layout: SpotLayoutId;
  /** Banyak perbedaan. */
  count: number;
  /** Jenis perbedaan yang boleh muncul. */
  kinds: SpotKind[];
  /** Jenis yang WAJIB muncul minimal sekali. */
  must?: SpotKind[];
}

function tryBuild(place: SpotPlace, spec: SpotSpec, rnd: () => number): SpotDiffData | null {
  const layout = SPOT_LAYOUTS[spec.layout];
  const skyIdx = layout.flatMap((p, i) => (p.sky ? [i] : []));
  const groundIdx = layout.flatMap((p, i) => (p.sky ? [] : [i]));
  const empty = groundIdx[Math.floor(rnd() * groundIdx.length)]!;
  const things: (SpotThing | null)[] = layout.map(() => null);

  // Langit: minimal satu bentuk berwarna (bahan perbedaan "warna"), sisanya
  // campur seni & bentuk. Bentuk tak pernah dua jenis yang sama.
  const shapes = shuffle(SHAPES, rnd);
  const skyItems = shuffle(SKY_ITEMS, rnd);
  shuffle(skyIdx, rnd).forEach((i, k) => {
    const useShape = k === 0 || (rnd() < 0.5 && shapes.length > 0);
    if (useShape && shapes.length) {
      things[i] = { shape: shapes.shift()!, color: COLORS[Math.floor(rnd() * COLORS.length)]! };
    } else if (skyItems.length) {
      things[i] = { item: skyItems.shift()! };
    } else {
      things[i] = { shape: shapes.shift()!, color: COLORS[Math.floor(rnd() * COLORS.length)]! };
    }
  });

  const pool = shuffle(GROUND[place], rnd);
  for (const i of groundIdx) if (i !== empty) things[i] = { item: pool.shift()! };
  // Seni yang menghadap samping kadang dibalik dari awal, supaya "arah
  // hadap" bukan selalu ke kanan → ke kiri.
  for (const t of things) if (t?.item && SPOT_FLIPPABLE.has(t.item) && rnd() < 0.35) t.flip = true;

  const kinds: SpotKind[] = [...(spec.must ?? [])];
  while (kinds.length < spec.count) {
    const k = spec.kinds[Math.floor(rnd() * spec.kinds.length)]!;
    if (k === 'tambah' && kinds.includes('tambah')) continue;
    kinds.push(k);
  }

  const used = new Set<number>();
  const present = new Set(things.map(thingKey).filter(Boolean));
  const changes: SpotChange[] = [];
  const freeSky = shuffle(SKY_ITEMS, rnd).filter((s) => !present.has(s));

  for (const kind of shuffle(kinds, rnd)) {
    const filled = shuffle(
      things.flatMap((t, i) => (t && !used.has(i) ? [i] : [])),
      rnd,
    );
    let at: number | undefined;
    let change: SpotChange | undefined;
    if (kind === 'tambah') {
      const thing = pool.find((p) => !present.has(p));
      if (used.has(empty) || !thing) return null;
      at = empty;
      present.add(thing);
      change = { kind, at, thing: { item: thing } };
    } else if (kind === 'hilang') {
      at = filled[0];
      if (at !== undefined) change = { kind, at };
    } else if (kind === 'tukar') {
      for (const i of filled) {
        const cur = things[i]!;
        if (!cur.item) continue;
        const choices = layout[i]!.sky ? freeSky : pool;
        const next = choices.find((p) => !present.has(p) && SPOT_TONE[p] !== SPOT_TONE[cur.item!]);
        if (!next) continue;
        present.add(next);
        at = i;
        change = { kind, at, thing: { item: next, flip: cur.flip } };
        break;
      }
    } else if (kind === 'warna') {
      at = filled.find((i) => things[i]!.shape);
      if (at !== undefined) {
        const cur = things[at]!.color;
        const others = COLORS.filter((c) => c !== cur);
        change = { kind, at, color: others[Math.floor(rnd() * others.length)]! };
      }
    } else if (kind === 'balik') {
      at = filled.find((i) => things[i]!.item && SPOT_FLIPPABLE.has(things[i]!.item!));
      if (at !== undefined) change = { kind, at };
    } else if (kind === 'besar') {
      // Lebih besar di barisan DEPAN/belakang saja — benda langit yang
      // membesar menabrak tepi atas gambar.
      at = filled.find((i) => !layout[i]!.sky && things[i]!.item);
      if (at !== undefined) change = { kind, at };
    }
    if (at === undefined || !change) return null;
    used.add(at);
    changes.push(change);
  }
  return { place, layout: spec.layout, things, changes };
}

/** Satu slot berisi `variants` soal, tempatnya bergiliran mulai `placeFrom`. */
export function spotSlot(
  id: string,
  narration: string,
  spec: SpotSpec,
  variants: number,
  placeFrom = 0,
): GameLevel<'spot-diff'>[] {
  const out: GameLevel<'spot-diff'>[] = [];
  for (let v = 0; v < variants; v++) {
    const place = SPOT_PLACES[(placeFrom + v) % SPOT_PLACES.length]!;
    const rnd = rngFrom(`${spec.layout}:${id}:${v}`);
    let data: SpotDiffData | null = null;
    for (let tries = 0; tries < 200 && !data; tries++) data = tryBuild(place, spec, rnd);
    if (!data) throw new Error(`spot-diff ${id}#${v}: tak bisa membuat soal`);
    const problems = spotProblems(data);
    if (problems.length) throw new Error(`spot-diff ${id}#${v}: ${problems.join('; ')}`);
    out.push({ id, narration, data });
  }
  return out;
}
