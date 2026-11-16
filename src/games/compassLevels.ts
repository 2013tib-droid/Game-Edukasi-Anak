import type { GameLevel } from '@/engine/core/types';
import {
  COMPASS_LINES,
  DIRS4,
  DIR_NAME,
  MAX_METERS,
  MAX_PLACES,
  MAX_SIDE,
  PLACES,
  cellOf,
  dirBetween,
  findMoves,
  parseTown,
  scaleChoices,
  shortest,
  whereChoices,
  type CompassStep,
  type CompassTask,
  type Dir8,
  type Move,
  type PlaceId,
  type Rot,
  type SymbolId,
  type Town,
} from '@/engine/core/compass';
import { capitalize, terbilang } from '@/games/numbers';

/**
 * Builder Kurir Kompas (`compass-map`). Tiap soal DIPERIKSA saat build dengan
 * mesin yang sama dengan yang dipakai template (`core/compass.ts`): rute yang
 * menabrak, arah yang tidak tepat lurus/diagonal, petunjuk antar yang
 * menunjuk dua bangunan, atau kalimat kepanjangan gagal di `npm run build`,
 * bukan di HP anak.
 *
 * NARASI DIBANGUN DI SINI dari arah sebenarnya (`DIR_NAME`), tidak pernah
 * ditulis tangan per varian — peta dicerminkan/diputar (`xf`), dan kalimat
 * yang ditulis tangan akan diam-diam salah arah.
 */

type Level = GameLevel<'compass-map'>;

export interface TownDef {
  rows: string[];
  places: Record<string, PlaceId>;
}

/** Cerminan rancangan peta: datar · tegak · transpos. */
export type Xf = 'id' | 'h' | 'v' | 't';

function mapRows(rows: string[], how: Xf): string[] {
  const g = rows.map((r) => [...r]);
  if (how === 'h') return g.map((r) => r.reverse().join(''));
  if (how === 'v') return [...rows].reverse();
  if (how === 't') return g[0]!.map((_, c) => g.map((r) => r[c]).join(''));
  return rows;
}

export interface Base {
  town: TownDef;
  xf?: Xf;
  rot?: Rot;
  courier?: 'bicycle' | 'scooter';
}

const MAX_LINE = 70;
const name = (p: PlaceId) => PLACES[p].name;

function line(text: string, where: string): string {
  if (/\d/.test(text)) throw new Error(`kurir-kompas ${where}: narasi memuat angka — "${text}"`);
  if (text.length > MAX_LINE) throw new Error(`kurir-kompas ${where}: narasi ${text.length} karakter — "${text}"`);
  return text;
}

/** Kalimat instruksi `follow` — dipakai builder DAN pemeriksa CI. */
export function followText(moves: readonly Move[]): string {
  const leg = (m: Move) => `${terbilang(m.n)} blok ke ${DIR_NAME[m.dir]}`;
  if (moves.length === 2) return `Antar paket! ${capitalize(leg(moves[0]!))}, lalu ${leg(moves[1]!)}.`;
  const head = moves.slice(0, -1).map(leg).join(', ');
  return `${capitalize(head)}, lalu ${leg(moves[moves.length - 1]!)}.`;
}
export const whereText = (of: PlaceId, from: PlaceId) => `${capitalize(name(of))} ada di sebelah mana ${name(from)}?`;
export const findText = (p: PlaceId) => `Lihat legendanya. Sentuh ${name(p)} di peta!`;
export const scaleText = (from: PlaceId, to: PlaceId) =>
  `Satu kotak seratus meter. Berapa jauh dari ${name(from)} ke ${name(to)}?`;
export const goText = (dir: Dir8, of: PlaceId) => `Antar paket ke bangunan di sebelah ${DIR_NAME[dir]} ${name(of)}!`;

interface Built {
  town: Town;
  rows: string[];
  rot: Rot;
}

function prepare(b: Base, where: string): Built {
  const rows = mapRows(b.town.rows, b.xf ?? 'id');
  const town = parseTown(rows, b.town.places);
  if (town.cols > MAX_SIDE || town.rows > MAX_SIDE) throw new Error(`${where}: peta ${town.cols}×${town.rows} (> ${MAX_SIDE})`);
  if (town.places.length > MAX_PLACES) throw new Error(`${where}: ${town.places.length} bangunan (> ${MAX_PLACES})`);
  const first = town.places[0]!.cell;
  for (const p of town.places) if (!shortest(town, first, p.cell)) throw new Error(`${where}: ${p.id} tak terjangkau lewat jalan`);
  return { town, rows, rot: b.rot ?? 0 };
}

/** Rakit level; peta diputar → langkah pembuka "utara ada di mana?". */
function assemble(id: string, stamp: string, b: Base, built: Built, start: PlaceId | null, tasks: { say: string; task: CompassTask }[]): Level {
  const steps: CompassStep[] = [];
  if (built.rot !== 0) steps.push({ task: { kind: 'north' } });
  for (const t of tasks) steps.push({ say: line(t.say, id), task: t.task });
  const narration = steps[0]!.task.kind === 'north' ? COMPASS_LINES.north : tasks[0]!.say;
  const data: Level['data'] = {
    rows: built.rows,
    places: b.town.places,
    rot: built.rot,
    courier: b.courier ?? 'bicycle',
    steps,
  };
  if (start) data.start = [...cellOf(built.town, start)] as [number, number];
  return { id, narration: line(narration, id), stamp: { emoji: stamp }, data };
}

export function follow(id: string, stamp: string, b: Base & { from: PlaceId; to: PlaceId; legs: 2 | 3 }): Level {
  const where = `${id} ${b.from}→${b.to}`;
  const built = prepare(b, where);
  const moves = findMoves(built.town, cellOf(built.town, b.from), cellOf(built.town, b.to), b.legs);
  if (!moves) throw new Error(`${where}: tak ada rute ${b.legs} ruas`);
  return assemble(id, stamp, b, built, b.from, [{ say: followText(moves), task: { kind: 'follow', moves } }]);
}

export function where(id: string, stamp: string, b: Base & { of: PlaceId; from: PlaceId; eight?: boolean }): Level {
  const at = `${id} ${b.of}/${b.from}`;
  const built = prepare(b, at);
  const dir = dirBetween(cellOf(built.town, b.from), cellOf(built.town, b.of));
  if (!dir) throw new Error(`${at}: tidak tepat lurus / diagonal`);
  const cardinal = (DIRS4 as readonly Dir8[]).includes(dir);
  if (!b.eight && !cardinal) throw new Error(`${at}: jawabannya ${DIR_NAME[dir]}, padahal soal empat arah`);
  const choices = whereChoices(dir, built.rot, !!b.eight);
  if (choices.length !== 4 || !choices.includes(dir)) throw new Error(`${at}: kartu arah cacat`);
  return assemble(id, stamp, b, built, null, [{ say: whereText(b.of, b.from), task: { kind: 'where', of: b.of, from: b.from, choices } }]);
}

export function find(id: string, stamp: string, b: Base & { place: PlaceId }): Level {
  const built = prepare(b, id);
  cellOf(built.town, b.place);
  if (built.town.places.length < 4) throw new Error(`${id}: peta legenda butuh ≥ 4 bangunan (pengecoh)`);
  return assemble(id, stamp, b, built, null, [{ say: findText(b.place), task: { kind: 'find', place: b.place } }]);
}

export function symbol(id: string, stamp: string, b: Base & { symbol: SymbolId; choices: SymbolId[] }): Level {
  const built = prepare(b, id);
  const tile = { sungai: 'sungai', jembatan: 'jembatan', jalan: 'jalan', pepohonan: 'pohon' }[b.symbol];
  if (!built.town.tiles.some((row) => row.some((t) => t === tile))) throw new Error(`${id}: peta tak punya ${b.symbol}`);
  if (new Set(b.choices).size !== 3 || !b.choices.includes(b.symbol)) throw new Error(`${id}: kartu simbol cacat`);
  return assemble(id, stamp, b, built, null, [{ say: COMPASS_LINES.symbol, task: { kind: 'symbol', symbol: b.symbol, choices: b.choices } }]);
}

export function scale(id: string, stamp: string, b: Base & { from: PlaceId; to: PlaceId }): Level {
  const at = `${id} ${b.from}→${b.to}`;
  const built = prepare(b, at);
  const { answer, choices } = scaleChoices(built.town, cellOf(built.town, b.from), cellOf(built.town, b.to));
  if (answer > MAX_METERS) throw new Error(`${at}: ${answer} m (> ${MAX_METERS})`);
  if (choices.length < 3) throw new Error(`${at}: kartu jarak kurang dari tiga`);
  return assemble(id, stamp, b, built, null, [{ say: scaleText(b.from, b.to), task: { kind: 'scale', from: b.from, to: b.to, choices } }]);
}

/** MISI BESAR: tiap paket disebut dengan arah relatif [tujuan, patokan]. */
export function deliver(id: string, stamp: string, b: Base & { from: PlaceId; stops: [PlaceId, PlaceId][] }): Level {
  const built = prepare(b, id);
  let at = b.from;
  const tasks = b.stops.map(([to, ref]) => {
    const w = `${id} ${to} dari ${ref}`;
    const dir = dirBetween(cellOf(built.town, ref), cellOf(built.town, to));
    if (!dir) throw new Error(`${w}: tidak tepat lurus / diagonal`);
    const same = built.town.places.filter((p) => p.id !== ref && dirBetween(cellOf(built.town, ref), p.cell) === dir);
    if (same.length !== 1) throw new Error(`${w}: "${DIR_NAME[dir]} ${ref}" menunjuk ${same.map((p) => p.id).join(' & ')}`);
    if (to === at) throw new Error(`${w}: kurir sudah di sana`);
    at = to;
    return { say: goText(dir, ref), task: { kind: 'go', to, clue: { dir, of: ref } } as CompassTask };
  });
  return assemble(id, stamp, b, built, b.from, tasks);
}
