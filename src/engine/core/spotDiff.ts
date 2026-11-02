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
  /**
   * KELOMPOK: `count` benda kecil yang sama dalam satu posisi (3 apel). Bahan
   * perbedaan "jumlah" (Mata Jeli, SD 3-4). Hanya di posisi darat.
   */
  count?: number;
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
  | { kind: 'besar'; at: number }
  /** Benda di posisi `at` jadi lebih kecil (SD 3-4). */
  | { kind: 'kecil'; at: number }
  /**
   * Benda di posisi `at` PINDAH ke posisi `to` (kosong di gambar A). Dua
   * tempat berbeda sekaligus — menyentuh salah satunya dihitung ketemu.
   */
  | { kind: 'pindah'; at: number; to: number }
  /** Benda di `at` dan `with` SALING BERTUKAR tempat — satu perbedaan. */
  | { kind: 'tukar-tempat'; at: number; with: number }
  /** Kelompok di `at` berubah banyaknya jadi `count`. */
  | { kind: 'jumlah'; at: number; count: number }
  /**
   * GAMBAR LUKISAN (`SpotDiffData.photo`): tempelan `edit` (potongan gambar
   * yang sudah diubah — warna lain, benda dihapus, benda disalin) dipasang di
   * gambar `on` (bawaan B) di tempat ke-`at`. Tempelannya dibuat SEKALI di
   * komputer (`scripts/spot-photo/<foto>.py`) dan dilihat mata dulu, jadi
   * tetap tak mungkin ada perbedaan yang tak terdaftar.
   */
  | { kind: 'foto'; at: number; edit: string; on?: 'a' | 'b' };

export type SpotKind = SpotChange['kind'];
export type SpotLayoutId = 'tk' | 'sd' | 'sd2' | SpotPhotoId;
/** Gambar lukisan utuh (Gemini) — lihat `SPOT_PHOTOS`. */
export type SpotPhotoId = 'kemah';

export interface SpotDiffData {
  place: SpotPlace;
  layout: SpotLayoutId;
  /** Isi gambar A, satu per posisi layout (`null` = kosong). */
  things: (SpotThing | null)[];
  /** Perbedaan gambar B — tiap posisi paling banyak SATU perubahan. */
  changes: SpotChange[];
  /**
   * Jumlah perbedaan DIRAHASIAKAN (SD 3-4): penghitung cuma menulis yang
   * sudah ketemu, dan anak sendiri yang menekan "Sudah semua!".
   */
  hidden?: boolean;
  /**
   * Latar = LUKISAN utuh (`public/assets/spot/<photo>/foto.webp`), bukan
   * latar engine + benda. Perbedaannya hanya `foto`; `things` semuanya null
   * dan `layout` = id lukisannya (posisi = tempat-tempat di lukisan).
   */
  photo?: SpotPhotoId;
}

/** Kalimat template — dibaca juga oleh `extract-narration.mjs`. */
export const SPOT_LINES = {
  /** "Sudah semua!" ditekan padahal masih ada yang belum ketemu. */
  notYet: 'Masih ada yang terlewat. Ayo cari lagi!',
};

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

export interface PhotoSpot {
  /** Nama tempat (untuk pemeriksa & pembaca kode). */
  label: string;
  x: number;
  y: number;
  /** Besar bendanya — jari-jari sentuh = 0,62 × ini (paling kecil `SPOT_MIN_R_BY`). */
  size: number;
  /** Tempelan yang boleh dipakai di tempat ini (satu per soal). */
  edits: string[];
}

export interface SpotPhoto {
  spots: PhotoSpot[];
  /** Kotak tiap tempelan [x, y, lebar, tinggi], satuan gambar 150×100. */
  edits: Record<string, [number, number, number, number]>;
}

/**
 * LUKISAN dari Gemini (2026-11-02): SATU gambar ramai, perbedaannya tempelan
 * yang dibuat `scripts/spot-photo/<id>.py` dari gambar itu sendiri. Kotak
 * tempelan = piksel persis berkasnya (gambar 1200×800, 8 px per satuan).
 */
export const SPOT_PHOTOS: Record<SpotPhotoId, SpotPhoto> = {
  kemah: {
    spots: [
      { label: 'tenda', x: 46, y: 45, size: 28, edits: ['tenda-biru', 'tenda-merah'] },
      { label: 'tas', x: 16, y: 76.5, size: 17, edits: ['tas-hijau'] },
      { label: 'botol', x: 28.2, y: 78.8, size: 10, edits: ['botol-merah'] },
      { label: 'senter', x: 27.3, y: 86.8, size: 11, edits: ['senter-hilang'] },
      { label: 'pisang', x: 36.5, y: 75.5, size: 10, edits: ['pisang-hijau'] },
      { label: 'kupu-kupu merah muda', x: 57.7, y: 27.7, size: 7, edits: ['kupu1-kuning'] },
      { label: 'kupu-kupu ungu', x: 113.5, y: 49.5, size: 7, edits: ['kupu2-hijau'] },
      { label: 'bunga kiri', x: 5.2, y: 85, size: 7, edits: ['bunga1-biru'] },
      { label: 'bunga kanan', x: 141.5, y: 84.2, size: 7, edits: ['bunga2-kuning'] },
      { label: 'bunga tengah', x: 130.6, y: 53.5, size: 6, edits: ['bunga3-biru'] },
      { label: 'kelinci', x: 120, y: 57, size: 13, edits: ['kelinci-hilang'] },
      { label: 'burung', x: 116, y: 6.2, size: 6, edits: ['burung-hilang'] },
      { label: 'awan', x: 104.3, y: 6.2, size: 15, edits: ['awan-hilang'] },
      { label: 'ikan dekat jembatan', x: 131.2, y: 73.5, size: 7, edits: ['ikan1-hilang'] },
      { label: 'ikan sungai', x: 104, y: 91.4, size: 8, edits: ['ikan2-hilang'] },
      { label: 'kupu-kupu baru', x: 84.2, y: 28.2, size: 7, edits: ['kupu-salin'] },
      { label: 'ikan baru', x: 85.2, y: 90.2, size: 8, edits: ['ikan-salin'] },
    ],
    edits: {
      'tenda-biru': [14, 30, 52.5, 29.5],
      'tenda-merah': [14, 30, 52.5, 29.5],
      'tas-hijau': [7, 66.5, 17.5, 20],
      'botol-merah': [24.5, 73.5, 7.25, 10.5],
      'pisang-hijau': [31.5, 71.5, 10, 8],
      'kupu1-kuning': [54.5, 25, 6.5, 5.5],
      'kupu2-hijau': [109.5, 46.5, 8, 6],
      'bunga1-biru': [1, 81.5, 8.5, 7],
      'bunga2-kuning': [137.5, 80.5, 8, 7.5],
      'bunga3-biru': [127.5, 50.5, 6, 6],
      'senter-hilang': [20.75, 83.5, 13.25, 7],
      'kelinci-hilang': [113, 50.25, 14, 13.75],
      'burung-hilang': [113, 4.5, 6, 3.5],
      'ikan2-hilang': [99.5, 87.5, 9, 7.5],
      'awan-hilang': [95.5, 3, 17.5, 6.5],
      'ikan1-hilang': [127.5, 70.75, 7.5, 5.25],
      'kupu-salin': [81, 25.5, 6.5, 5.5],
      'ikan-salin': [81, 88, 8.5, 4.5],
    },
  },
};

export function photoUrl(photo: SpotPhotoId, file: string): string {
  return `${import.meta.env.BASE_URL}assets/spot/${photo}/${file}.webp`;
}

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
  // SD 3-4 (Mata Jeli): 11 posisi lebih padat (9 terisi + 2 kosong untuk
  // "tambah" & "pindah"), disusun SELANG-SELING 4-3-4 supaya SEMUA pasangan
  // posisi berjarak ≥ 37 satuan — soal 7 perbedaan (pindah & tukar-tempat
  // memakan dua tempat) tetap bisa disusun tanpa daerah sentuh yang menciut.
  sd2: [
    { x: 18, y: 14, size: 16, sky: true },
    { x: 58, y: 14, size: 16, sky: true },
    { x: 98, y: 14, size: 16, sky: true },
    { x: 138, y: 14, size: 16, sky: true },
    { x: 38, y: 46, size: 21, sky: false },
    { x: 78, y: 46, size: 21, sky: false },
    { x: 118, y: 46, size: 21, sky: false },
    { x: 18, y: 80, size: 22, sky: false },
    { x: 58, y: 80, size: 22, sky: false },
    { x: 98, y: 80, size: 22, sky: false },
    { x: 138, y: 80, size: 22, sky: false },
  ],
  kemah: SPOT_PHOTOS.kemah.spots.map(({ x, y, size }) => ({ x, y, size, sky: false })),
};

/**
 * Jari-jari daerah sentuh paling kecil (satuan gambar). Di HP 320 px gambar
 * selebar ±283 px (1 satuan ≈ 1,89 px), jadi 16,5 satuan = lingkaran ±62 px —
 * target sentuh anak. Posisi layout sengaja berjarak ≥ 33 satuan supaya
 * pemangkasan "setengah jarak" tak pernah turun di bawah angka ini.
 */
export const SPOT_MIN_R = 16.5;
/**
 * Per layout. `sd2` lebih besar: soal berjumlah rahasia punya baris tombol
 * "Sudah semua!" yang memakan tinggi, jadi gambarnya lebih sempit (±259 px
 * di HP 320) — 17,5 satuan tetap ±60 px.
 */
export const SPOT_MIN_R_BY: Record<SpotLayoutId, number> = { tk: SPOT_MIN_R, sd: SPOT_MIN_R, sd2: 17.5, kemah: 17.5 };

/** Pembesaran untuk perubahan `besar`. */
export const SPOT_GROW = 1.4;
/** Pengecilan untuk perubahan `kecil`. */
export const SPOT_SHRINK = 0.62;

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

/** Semua posisi yang disentuh satu perubahan (pindah & tukar-tempat: dua). */
export function changeSpots(c: SpotChange): number[] {
  if (c.kind === 'pindah') return [c.at, c.to];
  if (c.kind === 'tukar-tempat') return [c.at, c.with];
  return [c.at];
}

/** Isi gambar B: benda per posisi + skala. */
export function pictureB(data: SpotDiffData): { thing: SpotThing | null; scale: number }[] {
  const out = data.things.map((thing) => ({ thing, scale: 1 }));
  for (const c of data.changes) {
    const slot = out[c.at]!;
    const cur = data.things[c.at] ?? null;
    if (c.kind === 'hilang') slot.thing = null;
    else if (c.kind === 'tambah' || c.kind === 'tukar') slot.thing = c.thing;
    else if (c.kind === 'warna' && cur) slot.thing = { ...cur, color: c.color };
    else if (c.kind === 'balik' && cur) slot.thing = { ...cur, flip: !cur.flip };
    else if (c.kind === 'besar') slot.scale = SPOT_GROW;
    else if (c.kind === 'kecil') slot.scale = SPOT_SHRINK;
    else if (c.kind === 'jumlah' && cur) slot.thing = { ...cur, count: c.count };
    else if (c.kind === 'pindah') {
      out[c.to]!.thing = cur;
      slot.thing = null;
    } else if (c.kind === 'tukar-tempat') {
      out[c.with]!.thing = cur;
      slot.thing = data.things[c.with] ?? null;
    }
  }
  return out;
}

export interface SpotPoint {
  x: number;
  y: number;
  /** Jari-jari daerah sentuh — satuan gambar. */
  r: number;
}

export interface SpotTarget {
  /** Indeks di `data.changes`. */
  index: number;
  /** Titik sentuh — satu, atau dua untuk pindah & tukar-tempat. */
  pts: SpotPoint[];
}

/**
 * Daerah sentuh tiap perbedaan. Jari-jarinya sebesar bendanya (paling kecil
 * `SPOT_MIN_R`), lalu DIPANGKAS jadi setengah jarak ke titik perbedaan LAIN
 * yang terdekat, jadi dua daerah tak pernah bertindihan (aturan yang sama
 * dengan `figureSpots` Anggota Tubuh). Benda yang dibesarkan dihitung dengan
 * ukuran barunya.
 */
export function spotTargets(data: SpotDiffData): SpotTarget[] {
  const layout = SPOT_LAYOUTS[data.layout];
  const raw = data.changes.map((c, index) =>
    changeSpots(c).map((at) => {
      const p = layout[at]!;
      const size = c.kind === 'besar' ? p.size * SPOT_GROW : p.size;
      return { index, x: p.x, y: p.y, r: Math.max(size * 0.62, SPOT_MIN_R_BY[data.layout]) };
    }),
  );
  const all = raw.flat();
  return raw.map((pts, index) => ({
    index,
    pts: pts.map((p) => {
      let near = Infinity;
      for (const q of all) if (q.index !== index) near = Math.min(near, Math.hypot(p.x - q.x, p.y - q.y));
      return { x: p.x, y: p.y, r: Math.min(p.r, near / 2) };
    }),
  }));
}

/** Perbedaan yang tersentuh di titik (x, y) satuan gambar, atau `null`. */
export function hitTarget(targets: SpotTarget[], x: number, y: number): SpotTarget | null {
  let best: SpotTarget | null = null;
  let bestD = Infinity;
  for (const t of targets) {
    for (const p of t.pts) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d <= p.r && d < bestD) {
        best = t;
        bestD = d;
      }
    }
  }
  return best;
}

/**
 * Daftar masalah sebuah soal (kosong = sah). Dipakai builder (soal yang
 * bermasalah diganti undian lain / build gagal) DAN pemeriksa CI.
 */
export function spotProblems(data: SpotDiffData): string[] {
  const out: string[] = [];
  const layout = SPOT_LAYOUTS[data.layout];
  if (data.things.length !== layout.length) out.push(`isi ${data.things.length} ≠ ${layout.length} posisi`);
  const used = new Set<number>();
  const keysA = data.things.map(thingKey).filter(Boolean);
  if (new Set(keysA).size !== keysA.length) out.push('ada benda kembar di gambar A');

  for (const c of data.changes) {
    for (const at of changeSpots(c)) {
      if (used.has(at)) out.push(`posisi ${at} dapat dua perubahan`);
      used.add(at);
      if (!layout[at]) out.push(`posisi ${at} tak ada`);
    }
    const cur = data.things[c.at];
    if (!layout[c.at]) continue;
    if (c.kind === 'foto') {
      const photo = data.photo ? SPOT_PHOTOS[data.photo] : undefined;
      if (!photo || data.layout !== data.photo) out.push('foto tanpa lukisan');
      else if (!photo.spots[c.at]?.edits.includes(c.edit) || !photo.edits[c.edit]) out.push(`tempelan ${c.edit} bukan milik tempat ${c.at}`);
      if (cur) out.push('foto di tempat yang berisi benda');
      continue;
    }
    if (data.photo) out.push(`lukisan hanya boleh perubahan foto (${c.kind})`);
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
    if (c.kind === 'balik' && (!cur?.item || !SPOT_FLIPPABLE.has(cur.item) || cur.count)) out.push(`balik ${thingKey(cur)} tak terlihat`);
    if (c.kind === 'pindah') {
      if (data.things[c.to]) out.push(`pindah ke posisi ${c.to} yang tidak kosong`);
      if (layout[c.to]?.sky !== layout[c.at]?.sky) out.push('pindah antara langit & darat');
    }
    if (c.kind === 'tukar-tempat') {
      const other = data.things[c.with];
      if (!other || thingKey(other) === thingKey(cur)) out.push('tukar-tempat butuh dua benda berbeda');
      if (layout[c.with]?.sky !== layout[c.at]?.sky) out.push('tukar-tempat antara langit & darat');
    }
    if (c.kind === 'jumlah' && (!cur?.count || c.count < 1 || c.count === cur.count)) out.push('jumlah tidak sah');
  }
  data.things.forEach((t, i) => {
    if (t?.shape && !t.color) out.push(`bentuk ${t.shape} tanpa warna`);
    if (t?.item && !(t.item in SPOT_TONE)) out.push(`seni ${t.item} belum terdaftar di SPOT_TONE`);
    if (t?.count && layout[i]?.sky) out.push('kelompok di langit');
  });
  // Benda baru juga tak boleh kembar satu sama lain.
  const newKeys = data.changes.flatMap((c) => (c.kind === 'tukar' || c.kind === 'tambah' ? [thingKey(c.thing)] : []));
  if (new Set(newKeys).size !== newKeys.length) out.push('benda baru kembar');
  // Dua perbedaan yang berdempetan = daerah sentuh menciut di bawah jari anak.
  for (const t of spotTargets(data)) {
    for (const p of t.pts) if (p.r < SPOT_MIN_R_BY[data.layout] - 1e-9) out.push(`perbedaan berdempetan (r ${p.r.toFixed(1)})`);
  }
  return out;
}
