/**
 * CARI PERBEDAAN (template `spot-diff`, 2026-10-31) — SATU sumber geometri &
 * aturan, dipakai template (`SpotDiff.tsx`), builder config
 * (`src/games/spotLevels.ts`), DAN pemeriksa CI (`scripts/check-spot-levels.mjs`).
 *
 * Kenapa perbedaannya dibuat MESIN, bukan dua gambar dari AI: AI tidak bisa
 * membuat sepasang gambar yang "sama persis kecuali lima hal" — detail lain
 * ikut bergeser, lalu anak menemukan perbedaan yang tidak dihitung game dan
 * merasa disalahkan padahal benar. Di sini gambar B = gambar A + daftar
 * perubahan, jadi TIDAK MUNGKIN ada perbedaan yang tak terdaftar.
 *
 * Gambar = latar (`SpotPlace`, digambar engine) + benda di POSISI TETAP
 * (`SPOT_LAYOUTS`). Benda = seni item registry ATAU bentuk engine yang bisa
 * berganti warna (balon, layangan, kupu-kupu). Seni hewan TIDAK pernah
 * diwarnai ulang — singa ungu bukan perbedaan, itu gambar rusak.
 *
 * Satuan: kotak gambar 150 × 100 (rasio 3:2).
 */

export type SpotPlace = 'taman' | 'kebun' | 'sawah' | 'pantai' | 'kebun-binatang' | 'kota';
export type SpotShape = 'balon' | 'layang' | 'kupu';
/** Tanpa ungu (pemilik tak suka) dan tanpa oranye/merah muda (tertukar di HP). */
export type SpotColor = 'merah' | 'kuning' | 'biru' | 'hijau';

export interface SpotThing {
  /** Id seni item registry (`items.ts`). */
  item?: string;
  /** Bentuk engine yang bisa berganti warna — wajib `color`. */
  shape?: SpotShape;
  color?: SpotColor;
  /** Dicerminkan (menghadap ke arah lain). */
  flip?: boolean;
}

export type SpotChange =
  /** Benda di posisi `at` tidak ada di gambar B. */
  | { kind: 'hilang'; at: number }
  /** Posisi `at` kosong di gambar A, berisi `thing` di gambar B. */
  | { kind: 'tambah'; at: number; thing: SpotThing }
  /** Benda di posisi `at` diganti `thing` di gambar B. */
  | { kind: 'tukar'; at: number; thing: SpotThing }
  /** Bentuk engine di posisi `at` berganti warna. */
  | { kind: 'warna'; at: number; color: SpotColor }
  /** Benda di posisi `at` menghadap ke arah lain. */
  | { kind: 'balik'; at: number }
  /** Benda di posisi `at` jadi lebih besar. */
  | { kind: 'besar'; at: number };

export type SpotKind = SpotChange['kind'];
export type SpotLayoutId = 'tk' | 'sd';

export interface SpotDiffData {
  place: SpotPlace;
  layout: SpotLayoutId;
  /** Isi gambar A, satu per posisi layout (`null` = kosong). */
  things: (SpotThing | null)[];
  /** Perbedaan gambar B — tiap posisi paling banyak SATU perubahan. */
  changes: SpotChange[];
}

export interface SpotPos {
  /** Titik tengah benda. */
  x: number;
  y: number;
  /** Sisi kotak benda (satuan gambar). */
  size: number;
  /** Langit = benda melayang (matahari, awan, balon); darat = berdiri. */
  sky: boolean;
}

export const SPOT_W = 150;
export const SPOT_H = 100;

/**
 * Posisi tetap. Barisan belakang & depan sengaja SELANG-SELING supaya titik
 * sentuh dua perbedaan yang berdekatan tak pernah menciut di bawah jari anak
 * (pemeriksanya `scripts/check-spot-levels.mjs`). Urutan = urutan gambar:
 * langit dulu, lalu belakang, lalu depan (yang depan menutupi yang belakang).
 */
export const SPOT_LAYOUTS: Record<SpotLayoutId, SpotPos[]> = {
  // TK: 7 posisi besar (6 terisi + 1 kosong untuk perbedaan "tambah").
  tk: [
    { x: 30, y: 21, size: 26, sky: true },
    { x: 120, y: 20, size: 26, sky: true },
    { x: 42, y: 52, size: 32, sky: false },
    { x: 108, y: 52, size: 32, sky: false },
    { x: 20, y: 80, size: 32, sky: false },
    { x: 75, y: 81, size: 32, sky: false },
    { x: 130, y: 80, size: 32, sky: false },
  ],
  // SD: 10 posisi lebih kecil (9 terisi + 1 kosong).
  sd: [
    { x: 24, y: 18, size: 19, sky: true },
    { x: 75, y: 16, size: 19, sky: true },
    { x: 126, y: 18, size: 19, sky: true },
    { x: 17, y: 53, size: 24, sky: false },
    { x: 56, y: 51, size: 24, sky: false },
    { x: 94, y: 53, size: 24, sky: false },
    { x: 133, y: 51, size: 24, sky: false },
    { x: 37, y: 81, size: 26, sky: false },
    { x: 75, y: 82, size: 26, sky: false },
    { x: 113, y: 81, size: 26, sky: false },
  ],
};

/**
 * Jari-jari daerah sentuh paling kecil (satuan gambar). Di HP 320 px gambar
 * selebar ±283 px (1 satuan ≈ 1,89 px), jadi 16,5 satuan = lingkaran ±62 px —
 * target sentuh anak. Posisi layout sengaja berjarak ≥ 33 satuan supaya
 * pemangkasan "setengah jarak" tak pernah turun di bawah angka ini.
 */
export const SPOT_MIN_R = 16.5;

/** Pembesaran untuk perubahan `besar`. */
export const SPOT_GROW = 1.4;

export const SPOT_HEX: Record<SpotColor, string> = {
  merah: '#ef5350',
  kuning: '#ffd23f',
  biru: '#42a5f5',
  hijau: '#4caf50',
};

/**
 * Seni yang menghadap SAMPING — hanya ini yang boleh `balik`. Benda yang
 * tampak depan (panda, bola, matahari) terlihat SAMA saat dicerminkan, jadi
 * perbedaannya tak mungkin ditemukan. Bus sengaja tidak: tulisannya
 * ("BUS SEKOLAH") ikut terbalik.
 */
export const SPOT_FLIPPABLE: ReadonlySet<string> = new Set([
  'cat',
  'duck',
  'cow',
  'horse',
  'zebra',
  'jalak',
  'turtle',
  'shoe',
  'car',
  'taxi',
  'truck',
  'tractor',
  'scooter',
  'bicycle',
  'train',
  'umbrella',
  'carrot',
  'banana',
]);

/**
 * Warna utama tiap seni — benda yang DITUKAR harus beda warna utama dari yang
 * digantikannya (apel ↔ stroberi sama-sama merah dan bulat; di gambar selebar
 * jempol keduanya terbaca sama).
 */
export const SPOT_TONE: Record<string, string> = {
  cat: 'oranye',
  rabbit: 'putih',
  duck: 'kuning',
  chicken: 'putih',
  goat: 'putih',
  cow: 'putih',
  horse: 'cokelat',
  lion: 'cokelat',
  giraffe: 'kuning',
  elephant: 'abu',
  panda: 'hitam',
  zebra: 'hitam',
  monkey: 'cokelat',
  tiger: 'oranye',
  penguin: 'hitam',
  koala: 'abu',
  bear: 'cokelat',
  turtle: 'hijau',
  frog: 'hijau',
  jalak: 'hitam',
  ball: 'hitam',
  teddy: 'cokelat',
  umbrella: 'biru',
  shoe: 'biru',
  cap: 'biru',
  flower: 'merah muda',
  tree: 'hijau',
  sun: 'kuning',
  cloud: 'putih',
  bicycle: 'biru',
  car: 'merah',
  bus: 'kuning',
  taxi: 'biru',
  truck: 'biru',
  tractor: 'hijau',
  scooter: 'merah muda',
  train: 'biru',
  apple: 'merah',
  banana: 'kuning',
  watermelon: 'merah',
  corn: 'kuning',
  carrot: 'oranye',
  strawberry: 'merah',
  orange: 'oranye',
  backpack: 'merah',
  barn: 'cokelat',
  house: 'merah',
  shop: 'merah',
  school: 'merah',
};

export function thingKey(t: SpotThing | null | undefined): string {
  if (!t) return '';
  return t.item ?? `${t.shape}:${t.color}`;
}

/** Isi gambar B: benda per posisi + skala (1 atau `SPOT_GROW`). */
export function pictureB(data: SpotDiffData): { thing: SpotThing | null; scale: number }[] {
  const out = data.things.map((thing) => ({ thing, scale: 1 }));
  for (const c of data.changes) {
    const slot = out[c.at]!;
    const cur = slot.thing;
    if (c.kind === 'hilang') slot.thing = null;
    else if (c.kind === 'tambah' || c.kind === 'tukar') slot.thing = c.thing;
    else if (c.kind === 'warna' && cur) slot.thing = { ...cur, color: c.color };
    else if (c.kind === 'balik' && cur) slot.thing = { ...cur, flip: !cur.flip };
    else if (c.kind === 'besar') slot.scale = SPOT_GROW;
  }
  return out;
}

export interface SpotTarget {
  /** Indeks di `data.changes`. */
  index: number;
  x: number;
  y: number;
  /** Jari-jari daerah sentuh — satuan gambar. */
  r: number;
}

/**
 * Daerah sentuh tiap perbedaan. Jari-jarinya sebesar bendanya, lalu DIPANGKAS
 * jadi setengah jarak ke perbedaan lain yang terdekat, jadi dua daerah tak
 * pernah bertindihan (aturan yang sama dengan `figureSpots` Anggota Tubuh).
 * Benda yang dibesarkan dihitung dengan ukuran barunya.
 */
export function spotTargets(data: SpotDiffData): SpotTarget[] {
  const layout = SPOT_LAYOUTS[data.layout];
  const pts = data.changes.map((c, index) => {
    const p = layout[c.at]!;
    const size = c.kind === 'besar' ? p.size * SPOT_GROW : p.size;
    return { index, x: p.x, y: p.y, r: Math.max(size * 0.62, SPOT_MIN_R) };
  });
  return pts.map((p) => {
    let near = Infinity;
    for (const q of pts) if (q !== p) near = Math.min(near, Math.hypot(p.x - q.x, p.y - q.y));
    return { ...p, r: Math.min(p.r, near / 2) };
  });
}

/** Perbedaan yang tersentuh di titik (x, y) satuan gambar, atau `null`. */
export function hitTarget(targets: SpotTarget[], x: number, y: number): SpotTarget | null {
  let best: SpotTarget | null = null;
  let bestD = Infinity;
  for (const t of targets) {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d <= t.r && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}

/**
 * Daftar masalah sebuah soal (kosong = sah). Dipakai builder (melempar saat
 * build) DAN pemeriksa CI.
 */
export function spotProblems(data: SpotDiffData): string[] {
  const out: string[] = [];
  const layout = SPOT_LAYOUTS[data.layout];
  if (data.things.length !== layout.length) out.push(`isi ${data.things.length} ≠ ${layout.length} posisi`);
  const used = new Set<number>();
  const keysA = data.things.map(thingKey).filter(Boolean);
  if (new Set(keysA).size !== keysA.length) out.push('ada benda kembar di gambar A');

  for (const c of data.changes) {
    if (used.has(c.at)) out.push(`posisi ${c.at} dapat dua perubahan`);
    used.add(c.at);
    const cur = data.things[c.at];
    const pos = layout[c.at];
    if (!pos) {
      out.push(`posisi ${c.at} tak ada`);
      continue;
    }
    if (c.kind === 'tambah') {
      if (cur) out.push(`tambah di posisi ${c.at} yang tidak kosong`);
    } else if (!cur) {
      out.push(`${c.kind} di posisi kosong ${c.at}`);
      continue;
    }
    if (c.kind === 'tukar' || c.kind === 'tambah') {
      const k = thingKey(c.thing);
      if (keysA.includes(k)) out.push(`${c.kind}: ${k} sudah ada di gambar`);
      if (c.kind === 'tukar' && cur?.item && c.thing.item) {
        if (SPOT_TONE[cur.item] === SPOT_TONE[c.thing.item]) out.push(`tukar ${cur.item}→${c.thing.item} warnanya sama`);
      }
      if (c.kind === 'tukar' && (!!cur?.shape !== !!c.thing.shape)) out.push('tukar bentuk ↔ seni');
    }
    if (c.kind === 'warna' && (!cur?.shape || cur.color === c.color)) out.push(`warna di posisi ${c.at} tidak sah`);
    if (c.kind === 'balik' && (!cur?.item || !SPOT_FLIPPABLE.has(cur.item))) out.push(`balik ${thingKey(cur)} tak terlihat`);
  }
  for (const t of data.things) {
    if (t?.shape && !t.color) out.push(`bentuk ${t.shape} tanpa warna`);
    if (t?.item && !(t.item in SPOT_TONE)) out.push(`seni ${t.item} belum terdaftar di SPOT_TONE`);
  }
  // Benda baru juga tak boleh kembar satu sama lain.
  const newKeys = data.changes.flatMap((c) => (c.kind === 'tukar' || c.kind === 'tambah' ? [thingKey(c.thing)] : []));
  if (new Set(newKeys).size !== newKeys.length) out.push('benda baru kembar');
  return out;
}
