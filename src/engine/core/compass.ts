/**
 * KURIR KOMPAS (`compass-map`, SD Kelas 3 & 4 · IPAS, 2026-11-16) — SATU
 * sumber aturan. Dipakai template `CompassMap.tsx`, builder
 * `src/games/compassLevels.ts`, pemeriksa CI
 * `scripts/check-compass-levels.mjs`, dan `scripts/extract-narration.mjs`.
 *
 * Yang diajarkan: arah MATA ANGIN menempel pada PETA, bukan pada layar. Peta
 * boleh diputar 90°/180°/270° — utara lalu ada di kanan, bawah, atau kiri
 * layar, dan anak harus membaca mawar anginnya dulu. Ini yang membedakannya
 * dari Kode Kelinci / Misi Kode (arah = atas·kanan·bawah·kiri LAYAR).
 *
 * Keputusan pemilik 2026-11-16: kurir = sepeda / skuter berseni (tanpa nama
 * orang); bangunan = seni item yang ada + emoji untuk kantor pos & stasiun;
 * delapan arah ikut di slot belakang (kelas 4).
 *
 * KOORDINAT: petak = [kolom, baris] di PETA, utara = baris berkurang. Letak di
 * LAYAR dihitung `toScreen()` dari putaran peta — tidak ada CSS rotate, jadi
 * ikon bangunan & huruf selalu tegak.
 */

export type Dir8 = 'u' | 'tl' | 't' | 'tg' | 's' | 'bd' | 'b' | 'bl';
export type Dir4 = 'u' | 't' | 's' | 'b';
/** Putaran peta SEARAH jarum jam: 90 = utara menunjuk ke KANAN layar. */
export type Rot = 0 | 90 | 180 | 270;
export type Cell = readonly [number, number];

/** Urutan searah jarum jam mulai dari utara. */
export const DIRS8: readonly Dir8[] = ['u', 'tl', 't', 'tg', 's', 'bd', 'b', 'bl'];
export const DIRS4: readonly Dir4[] = ['u', 't', 's', 'b'];

export const DIR_NAME: Record<Dir8, string> = {
  u: 'utara',
  tl: 'timur laut',
  t: 'timur',
  tg: 'tenggara',
  s: 'selatan',
  bd: 'barat daya',
  b: 'barat',
  bl: 'barat laut',
};

/** Arah di PETA (utara = y berkurang). */
export const DIR_VEC: Record<Dir8, readonly [number, number]> = {
  u: [0, -1],
  tl: [1, -1],
  t: [1, 0],
  tg: [1, 1],
  s: [0, 1],
  bd: [-1, 1],
  b: [-1, 0],
  bl: [-1, -1],
};

export const opposite = (d: Dir8): Dir8 => DIRS8[(DIRS8.indexOf(d) + 4) % 8]!;

/** Arah di LAYAR (x kanan, y bawah) untuk arah peta `dir` pada putaran `rot`. */
export function screenVec(dir: Dir8, rot: Rot): [number, number] {
  let [x, y] = DIR_VEC[dir];
  for (let k = 0; k < rot / 90; k += 1) [x, y] = [-y, x];
  return [x, y];
}

/** Vektor → arah; `null` kalau tidak tepat lurus / tepat diagonal. */
export function dirOfVec(x: number, y: number): Dir8 | null {
  if (x === 0 && y === 0) return null;
  if (x !== 0 && y !== 0 && Math.abs(x) !== Math.abs(y)) return null;
  const sx = Math.sign(x);
  const sy = Math.sign(y);
  return DIRS8.find((d) => DIR_VEC[d][0] === sx && DIR_VEC[d][1] === sy) ?? null;
}

/** Arah dari petak `a` ke petak `b` (b ada di sebelah … a). */
export const dirBetween = (a: Cell, b: Cell): Dir8 | null => dirOfVec(b[0] - a[0], b[1] - a[1]);

/**
 * Jawaban anak yang TIDAK membaca mawar angin (mengira atas layar = utara).
 * Ini pengecoh terpenting di peta yang diputar.
 */
export function naiveDir(dir: Dir8, rot: Rot): Dir8 {
  const [x, y] = screenVec(dir, rot);
  return dirOfVec(x, y)!;
}

export type ScreenSide = 'atas' | 'kanan' | 'bawah' | 'kiri';
export const SCREEN_SIDES: readonly ScreenSide[] = ['atas', 'kanan', 'bawah', 'kiri'];
/** Di sisi layar mana utara berada. */
export const northSide = (rot: Rot): ScreenSide => SCREEN_SIDES[rot / 90]!;

// ---------- Bangunan & simbol ----------

export type PlaceId =
  | 'sekolah'
  | 'rumah-sakit'
  | 'toko'
  | 'taman'
  | 'pom-bensin'
  | 'sawah'
  | 'rumah'
  | 'kandang'
  | 'kantor-pos'
  | 'stasiun';

/** `item` = seni registry; tanpa `item` = emoji (belum ada seninya). */
export const PLACES: Record<PlaceId, { name: string; item?: string; emoji: string }> = {
  sekolah: { name: 'sekolah', item: 'school', emoji: '🏫' },
  'rumah-sakit': { name: 'rumah sakit', item: 'hospital', emoji: '🏥' },
  toko: { name: 'toko', item: 'shop', emoji: '🏪' },
  taman: { name: 'taman', item: 'park', emoji: '🏞️' },
  'pom-bensin': { name: 'pom bensin', item: 'gas-station', emoji: '⛽' },
  sawah: { name: 'sawah', item: 'field', emoji: '🌾' },
  rumah: { name: 'rumah', item: 'house', emoji: '🏠' },
  kandang: { name: 'kandang', item: 'barn', emoji: '🛖' },
  'kantor-pos': { name: 'kantor pos', emoji: '🏤' },
  stasiun: { name: 'stasiun', emoji: '🚉' },
};

/** Simbol medan yang digambar engine (soal legenda). */
export type SymbolId = 'sungai' | 'jembatan' | 'jalan' | 'pepohonan';
export const SYMBOL_NAME: Record<SymbolId, string> = {
  sungai: 'Sungai',
  jembatan: 'Jembatan',
  jalan: 'Jalan',
  pepohonan: 'Pohon',
};

// ---------- Peta ----------

export type Tile = 'jalan' | 'pohon' | 'sungai' | 'jembatan';

export interface Town {
  cols: number;
  rows: number;
  /** tiles[baris][kolom] */
  tiles: Tile[][];
  /** Bangunan (berdiri di petak jalan), urutan baca peta. */
  places: { id: PlaceId; cell: Cell }[];
}

/**
 * Papan string per baris: `.` jalan · `#` pepohonan (tak bisa dilewati) ·
 * `~` sungai (tak bisa dilewati) · `=` jembatan · huruf = bangunan menurut
 * `legend`. Melempar error untuk huruf tak dikenal / bangunan kembar.
 */
export function parseTown(rows: readonly string[], legend: Readonly<Record<string, PlaceId>>): Town {
  const cols = rows[0]?.length ?? 0;
  const tiles: Tile[][] = [];
  const places: Town['places'] = [];
  rows.forEach((row, r) => {
    if (row.length !== cols) throw new Error(`peta: baris ${r + 1} panjangnya ${row.length}, bukan ${cols}`);
    tiles.push(
      [...row].map((ch, c) => {
        if (ch === '.') return 'jalan';
        if (ch === '#') return 'pohon';
        if (ch === '~') return 'sungai';
        if (ch === '=') return 'jembatan';
        const id = legend[ch];
        if (!id) throw new Error(`peta: huruf "${ch}" tak ada di legenda`);
        if (places.some((p) => p.id === id)) throw new Error(`peta: ${id} muncul dua kali`);
        places.push({ id, cell: [c, r] });
        return 'jalan';
      }),
    );
  });
  return { cols, rows: rows.length, tiles, places };
}

export const inside = (t: Town, c: number, r: number): boolean => c >= 0 && r >= 0 && c < t.cols && r < t.rows;
export function walkable(t: Town, c: number, r: number): boolean {
  if (!inside(t, c, r)) return false;
  const tile = t.tiles[r]![c]!;
  return tile === 'jalan' || tile === 'jembatan';
}
export const same = (a: Cell, b: Cell): boolean => a[0] === b[0] && a[1] === b[1];
export const placeAt = (t: Town, cell: Cell): PlaceId | null => t.places.find((p) => same(p.cell, cell))?.id ?? null;
export function cellOf(t: Town, id: PlaceId): Cell {
  const p = t.places.find((x) => x.id === id);
  if (!p) throw new Error(`peta: tak ada ${id}`);
  return p.cell;
}

/** Ukuran papan di layar sesudah diputar. */
export const screenSize = (t: Town, rot: Rot): { cols: number; rows: number } =>
  rot === 90 || rot === 270 ? { cols: t.rows, rows: t.cols } : { cols: t.cols, rows: t.rows };

/** Petak peta → petak layar. */
export function toScreen(t: Town, rot: Rot, [c, r]: Cell): [number, number] {
  if (rot === 90) return [t.rows - 1 - r, c];
  if (rot === 180) return [t.cols - 1 - c, t.rows - 1 - r];
  if (rot === 270) return [r, t.cols - 1 - c];
  return [c, r];
}

/** Petak layar → petak peta. */
export function fromScreen(t: Town, rot: Rot, sc: number, sr: number): [number, number] {
  if (rot === 90) return [sr, t.rows - 1 - sc];
  if (rot === 180) return [t.cols - 1 - sc, t.rows - 1 - sr];
  if (rot === 270) return [t.cols - 1 - sr, sc];
  return [sc, sr];
}

// ---------- Rute ----------

export interface Move {
  dir: Dir4;
  n: number;
}

/** Jalani instruksi dari `start`; `null` kalau menabrak / keluar peta. */
export function runMoves(t: Town, start: Cell, moves: readonly Move[]): Cell[] | null {
  const path: Cell[] = [start];
  let [c, r] = start;
  for (const m of moves) {
    const [dx, dy] = DIR_VEC[m.dir];
    for (let k = 0; k < m.n; k += 1) {
      c += dx;
      r += dy;
      if (!walkable(t, c, r)) return null;
      path.push([c, r]);
    }
  }
  return path;
}

export const routeOk = (t: Town, start: Cell, moves: readonly Move[]): boolean => runMoves(t, start, moves) !== null;

/** Jalur terpendek lewat JALAN (BFS), termasuk kedua ujungnya. */
export function shortest(t: Town, a: Cell, b: Cell): Cell[] | null {
  const key = (c: number, r: number) => r * t.cols + c;
  const prev = new Map<number, number>();
  const queue: Cell[] = [a];
  prev.set(key(a[0], a[1]), -1);
  while (queue.length) {
    const cur = queue.shift()!;
    if (same(cur, b)) {
      const out: Cell[] = [];
      let k = key(cur[0], cur[1]);
      while (k !== -1) {
        out.unshift([k % t.cols, Math.floor(k / t.cols)]);
        k = prev.get(k)!;
      }
      return out;
    }
    for (const d of DIRS4) {
      const c = cur[0] + DIR_VEC[d][0];
      const r = cur[1] + DIR_VEC[d][1];
      if (!walkable(t, c, r) || prev.has(key(c, r))) continue;
      prev.set(key(c, r), key(cur[0], cur[1]));
      queue.push([c, r]);
    }
  }
  return null;
}

/**
 * Cari instruksi TEPAT `legs` ruas lurus (tiap ruas berbelok dari ruas
 * sebelumnya, tak pernah menginjak petak yang sama dua kali) dari `start` ke
 * `end`. Hasilnya tetap untuk masukan yang sama (urutan coba u·t·s·b).
 */
export function findMoves(t: Town, start: Cell, end: Cell, legs: number): Move[] | null {
  const seen = new Set<string>([start.join()]);
  function rec(pos: Cell, left: number, last: Dir4 | null): Move[] | null {
    for (const dir of DIRS4) {
      if (last && (dir === last || dir === opposite(last))) continue;
      const [dx, dy] = DIR_VEC[dir];
      const walked: string[] = [];
      let found: Move[] | null = null;
      for (let n = 1; ; n += 1) {
        const cell: Cell = [pos[0] + dx * n, pos[1] + dy * n];
        if (!walkable(t, cell[0], cell[1]) || seen.has(cell.join())) break;
        seen.add(cell.join());
        walked.push(cell.join());
        if (left === 1) {
          if (same(cell, end)) {
            found = [{ dir, n }];
            break;
          }
        } else if (!same(cell, end)) {
          const rest = rec(cell, left - 1, dir);
          if (rest) {
            found = [{ dir, n }, ...rest];
            break;
          }
        }
      }
      for (const w of walked) seen.delete(w);
      if (found) return found;
    }
    return null;
  }
  return rec(start, legs, null);
}

/**
 * Kartu arah soal "di sebelah mana". Empat arah: keempatnya, urutan tetap.
 * Delapan arah: jawaban + pengecoh khas (jawaban tanpa membaca mawar angin,
 * arah berlawanan, cerminan timur-barat, arah tetangga), urutan mawar angin.
 */
export function whereChoices(answer: Dir8, rot: Rot, eight: boolean): Dir8[] {
  if (!eight) return [...DIRS4];
  const i = DIRS8.indexOf(answer);
  const [x, y] = DIR_VEC[answer];
  const cand: (Dir8 | null)[] = [
    answer,
    rot === 0 ? null : naiveDir(answer, rot),
    opposite(answer),
    dirOfVec(-x, y),
    DIRS8[(i + 1) % 8]!,
    DIRS8[(i + 7) % 8]!,
    dirOfVec(x, -y),
  ];
  const out: Dir8[] = [];
  for (const d of cand) if (d && !out.includes(d) && out.length < 4) out.push(d);
  return out.sort((a, b) => DIRS8.indexOf(a) - DIRS8.indexOf(b));
}

/** Meter per petak (skala peta). Batas bilangan `sd2` = 1.000. */
export const METERS_PER_CELL = 100;
export const MAX_METERS = 1000;

/**
 * Kartu jarak soal skala: jarak lewat JALAN + kesalahan khas — lupa satu
 * blok, mengukur garis lurus (bukan lewat jalan), dan satu kotak dikira
 * sepuluh meter.
 */
export function scaleChoices(t: Town, a: Cell, b: Cell): { answer: number; choices: number[] } {
  const path = shortest(t, a, b);
  if (!path) throw new Error('skala: tak ada jalan');
  const d = path.length - 1;
  const straight = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  const set = new Set<number>([d * METERS_PER_CELL, (d - 1) * METERS_PER_CELL, d * 10]);
  if (straight !== d) set.add(straight * METERS_PER_CELL);
  return { answer: d * METERS_PER_CELL, choices: [...set].filter((v) => v > 0).sort((x, y) => x - y) };
}

// ---------- Data level ----------

export type CompassTask =
  /** Peta diputar: "utara ada di mana?" — ketuk panah sisi layar. */
  | { kind: 'north' }
  /** Ikuti instruksi arah; dinilai saat "Sampai!". */
  | { kind: 'follow'; moves: Move[] }
  /** Antar ke bangunan yang disebut dengan arah relatif (`clue`). */
  | { kind: 'go'; to: PlaceId; clue: { dir: Dir8; of: PlaceId } }
  /** "`of` ada di sebelah mana `from`?" — kartu tulisan arah. */
  | { kind: 'where'; of: PlaceId; from: PlaceId; choices: Dir8[] }
  /** Legenda: sentuh bangunan di peta. */
  | { kind: 'find'; place: PlaceId }
  /** Legenda: simbol medan ini artinya apa? */
  | { kind: 'symbol'; symbol: SymbolId; choices: SymbolId[] }
  /** Skala: jarak lewat jalan, kartu meter. */
  | { kind: 'scale'; from: PlaceId; to: PlaceId; choices: number[] };

export interface CompassStep {
  /** Kalimat langkah ke-2 dst. (langkah pertama memakai narasi level). */
  say?: string;
  task: CompassTask;
}

export interface CompassMapData {
  rows: string[];
  /** Huruf di `rows` → bangunan. */
  places: Record<string, PlaceId>;
  rot: Rot;
  /** Seni kurir (id item registry). */
  courier: 'bicycle' | 'scooter';
  /** Petak mulai kurir — wajib kalau ada langkah `follow` / `go`. */
  start?: [number, number];
  steps: CompassStep[];
}

/** Papan terbesar: petak ≥ 40 px di HP 320×568. */
export const MAX_SIDE = 6;
/** Bangunan terbanyak per peta (legenda dua kolom × tiga baris). */
export const MAX_PLACES = 6;

/** Jawaban benar langkah gerak: petak tujuan. */
export function goalOf(t: Town, task: CompassTask, from: Cell): Cell | null {
  if (task.kind === 'follow') {
    const path = runMoves(t, from, task.moves);
    return path ? path[path.length - 1]! : null;
  }
  if (task.kind === 'go') return cellOf(t, task.to);
  return null;
}

/** Kalimat tetap template — WAJIB sama dengan yang dirender (extract-narration). */
export const COMPASS_LINES = {
  /** Peta diputar: langkah pembuka. */
  north: 'Lihat kompasnya dulu! Utara ada di mana?',
  /** "Sampai!" di tempat yang salah (sekali per level). */
  check: 'Coba cek kompasnya lagi!',
  /** Soal simbol legenda. */
  symbol: 'Simbol ini artinya apa?',
} as const;
