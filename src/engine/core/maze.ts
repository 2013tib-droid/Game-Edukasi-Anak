/**
 * Mesin LABIRIN (template `maze`, Taman Labirin). SATU sumber untuk template,
 * builder config (`src/games/mazeLevels.ts`) DAN pemeriksa CI
 * (`scripts/check-maze-levels.mjs`) — jadi labirin yang diperiksa CI persis
 * labirin yang dimainkan anak.
 *
 * Labirin = petak `cols × rows`; tiap petak menyimpan bitmask sisi yang
 * TERBUKA (1 atas · 2 kanan · 4 bawah · 8 kiri). Dinding = sisi yang tertutup.
 * Labirin dibuat dari BENIH (acak-tetap), bukan digambar tangan: sama di tiap
 * build & tiap HP, dan menambah varian cukup menambah benih.
 */

export const OPEN_N = 1;
export const OPEN_E = 2;
export const OPEN_S = 4;
export const OPEN_W = 8;

interface DirSpec {
  bit: number;
  opp: number;
  dr: number;
  dc: number;
}

export const MAZE_DIRS: DirSpec[] = [
  { bit: OPEN_N, opp: OPEN_S, dr: -1, dc: 0 },
  { bit: OPEN_E, opp: OPEN_W, dr: 0, dc: 1 },
  { bit: OPEN_S, opp: OPEN_N, dr: 1, dc: 0 },
  { bit: OPEN_W, opp: OPEN_E, dr: 0, dc: -1 },
];

export interface MazeGrid {
  cols: number;
  rows: number;
  /** Bitmask sisi terbuka per petak, baris demi baris (indeks = r * cols + c). */
  open: number[];
}

/**
 * Kalimat tetap template — dipakai template DAN `extract-narration.mjs`, jadi
 * teks yang dibacakan tak bisa menyimpang dari baris yang dirender.
 * `missing` SAMA PERSIS dengan `CODE_LINES.missing` (rekaman `shared`).
 */
export const MAZE_LINES = {
  deadEnd: 'Jalan buntu! Balik lagi, cari jalan lain, ya.',
  missing: 'Masih ada yang belum diambil. Coba lagi, ya!',
  /** Labirin Hujan (SD): genangan air menutup lorong. */
  puddle: 'Ada genangan air! Tidak bisa lewat. Cari jalan lain, ya.',
} as const;

/** Bilangan acak 0..1 yang SELALU sama untuk benih yang sama (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Benih angka dari teks (FNV-1a). */
export function seedOf(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function rowOf(m: MazeGrid, i: number): number {
  return Math.floor(i / m.cols);
}
export function colOf(m: MazeGrid, i: number): number {
  return i % m.cols;
}

/** Petak tetangga yang bisa dilalui dari `i` (tanpa dinding di antaranya). */
export function openNeighbors(m: MazeGrid, i: number): number[] {
  const r = rowOf(m, i);
  const c = colOf(m, i);
  const out: number[] = [];
  for (const d of MAZE_DIRS) {
    if (!(m.open[i]! & d.bit)) continue;
    const nr = r + d.dr;
    const nc = c + d.dc;
    if (nr < 0 || nc < 0 || nr >= m.rows || nc >= m.cols) continue;
    out.push(nr * m.cols + nc);
  }
  return out;
}

/** Bisakah melangkah satu petak dari `a` ke `b`? */
export function canStep(m: MazeGrid, a: number, b: number): boolean {
  return openNeighbors(m, a).includes(b);
}

/**
 * Labirin "sempurna" (tepat satu jalan antara dua petak mana pun) lewat
 * penelusuran mundur acak — lorongnya panjang berkelok, cocok untuk jari.
 * `braid` (0..1) membuka sebagian jalan buntu jadi putaran: labirin lebih
 * ramah (TK awal), sedangkan 0 = paling banyak jalan buntu.
 */
export function generateMaze(cols: number, rows: number, seed: number, braid = 0): MazeGrid {
  const rand = rng(seed);
  const n = cols * rows;
  const open = new Array<number>(n).fill(0);
  const seen = new Array<boolean>(n).fill(false);
  const stack: number[] = [Math.floor(rand() * n)];
  seen[stack[0]!] = true;
  while (stack.length) {
    const cur = stack[stack.length - 1]!;
    const r = Math.floor(cur / cols);
    const c = cur % cols;
    const options: { d: DirSpec; next: number }[] = [];
    for (const d of MAZE_DIRS) {
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const next = nr * cols + nc;
      if (!seen[next]) options.push({ d, next });
    }
    if (!options.length) {
      stack.pop();
      continue;
    }
    const pick = options[Math.floor(rand() * options.length)]!;
    open[cur] = open[cur]! | pick.d.bit;
    open[pick.next] = open[pick.next]! | pick.d.opp;
    seen[pick.next] = true;
    stack.push(pick.next);
  }
  const m: MazeGrid = { cols, rows, open };
  if (braid > 0) {
    for (const i of deadEnds(m)) {
      if (rand() >= braid) continue;
      if (openNeighbors(m, i).length !== 1) continue; // sudah terbuka oleh putaran lain
      const r = rowOf(m, i);
      const c = colOf(m, i);
      const shut = MAZE_DIRS.filter((d) => {
        const nr = r + d.dr;
        const nc = c + d.dc;
        return !(open[i]! & d.bit) && nr >= 0 && nc >= 0 && nr < rows && nc < cols;
      });
      if (!shut.length) continue;
      const d = shut[Math.floor(rand() * shut.length)]!;
      const next = (r + d.dr) * cols + (c + d.dc);
      open[i] = open[i]! | d.bit;
      open[next] = open[next]! | d.opp;
    }
  }
  return m;
}

/** Petak jalan buntu (cuma satu jalan keluar). */
export function deadEnds(m: MazeGrid): number[] {
  const out: number[] = [];
  for (let i = 0; i < m.open.length; i += 1) if (openNeighbors(m, i).length === 1) out.push(i);
  return out;
}

/** Jarak (banyak langkah) dari `from` ke semua petak. */
export function distances(m: MazeGrid, from: number): number[] {
  const dist = new Array<number>(m.open.length).fill(-1);
  dist[from] = 0;
  const queue = [from];
  for (let q = 0; q < queue.length; q += 1) {
    const cur = queue[q]!;
    for (const next of openNeighbors(m, cur)) {
      if (dist[next] !== -1) continue;
      dist[next] = dist[cur]! + 1;
      queue.push(next);
    }
  }
  return dist;
}

/** Jalan terpendek `from → to`, termasuk kedua ujungnya. Kosong kalau mustahil. */
export function shortestPath(m: MazeGrid, from: number, to: number): number[] {
  const prev = new Array<number>(m.open.length).fill(-2);
  prev[from] = -1;
  const queue = [from];
  for (let q = 0; q < queue.length && prev[to] === -2; q += 1) {
    const cur = queue[q]!;
    for (const next of openNeighbors(m, cur)) {
      if (prev[next] !== -2) continue;
      prev[next] = cur;
      queue.push(next);
    }
  }
  if (prev[to] === -2) return [];
  const path: number[] = [];
  for (let at = to; at !== -1; at = prev[at]!) path.push(at);
  return path.reverse();
}

function permutations<T>(list: T[]): T[][] {
  if (list.length <= 1) return [list.slice()];
  const out: T[][] = [];
  list.forEach((x, i) => {
    for (const rest of permutations([...list.slice(0, i), ...list.slice(i + 1)])) out.push([x, ...rest]);
  });
  return out;
}

/**
 * Rute terpendek yang mengambil SEMUA barang lalu tiba di tujuan (urutan
 * barang dicoba semua — paling banyak tiga barang, jadi enam urutan).
 * Dipakai untuk lencana "Jalan hemat!" dan petunjuk.
 */
export function bestTour(m: MazeGrid, start: number, goal: number, pickups: number[]): number[] {
  let best: number[] = [];
  for (const order of permutations(pickups)) {
    const stops = [start, ...order, goal];
    let route: number[] = [start];
    let ok = true;
    for (let s = 1; s < stops.length; s += 1) {
      const leg = shortestPath(m, stops[s - 1]!, stops[s]!);
      if (!leg.length) {
        ok = false;
        break;
      }
      route = route.concat(leg.slice(1));
    }
    if (ok && (!best.length || route.length < best.length)) best = route;
  }
  return best;
}

/**
 * Langkah-langkah berikutnya dari `at`: ke barang belum terambil yang paling
 * dekat, atau ke tujuan kalau semuanya sudah. Tidak termasuk `at`.
 */
export function nextRoute(m: MazeGrid, at: number, goal: number, left: number[]): number[] {
  if (!left.length) return shortestPath(m, at, goal).slice(1);
  const dist = distances(m, at);
  let target = left[0]!;
  for (const p of left) if (dist[p]! < dist[target]!) target = p;
  return shortestPath(m, at, target).slice(1);
}

/**
 * Labirin EFEKTIF: petak genangan air (`puddles`, Labirin Hujan) ditutup dari
 * semua sisinya. Lorongnya tetap TERGAMBAR terbuka (dinding dari labirin
 * asli), tapi tak bisa dilalui — semua hitungan jalan (langkah, jalan buntu,
 * rute terpendek, petunjuk) memakai labirin efektif ini.
 */
export function withPuddles(m: MazeGrid, puddles?: readonly number[]): MazeGrid {
  if (!puddles?.length) return m;
  const open = m.open.slice();
  for (const p of puddles) {
    const r = rowOf(m, p);
    const c = colOf(m, p);
    for (const d of MAZE_DIRS) {
      if (!(m.open[p]! & d.bit)) continue;
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr < 0 || nc < 0 || nr >= m.rows || nc >= m.cols) continue;
      const n = nr * m.cols + nc;
      open[n] = open[n]! & ~d.opp;
    }
    open[p] = 0;
  }
  return { cols: m.cols, rows: m.rows, open };
}
