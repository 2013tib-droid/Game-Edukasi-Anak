/**
 * Studio Kolase (template `collage-studio`) — SATU sumber untuk bahan kolase
 * dan gambar pola. Dipakai template, gambar (`Collage.tsx`), DAN config game
 * (builder-nya memeriksa bagian pola lewat `COLLAGE_ART` yang sama), jadi
 * nama bagian di config tak bisa menyimpang dari yang digambar.
 *
 * Semua gambar pola ditulis sebagai `path` di kotak 0..100. Bagian ditulis
 * dari BAWAH ke ATAS: bagian yang belakangan menutupi yang lebih dulu
 * (matahari di atas langit), dan engine hanya menghitung bagian yang benar-
 * benar terlihat saat menilai sudah tertutup atau belum.
 */
import type { PaintColor } from '@/engine/core/paint';
import { PAINT_HEX, paintName } from '@/engine/core/paint';

/* ---------- bahan ---------- */

/** Bahan alam untuk kolase biji-bijian (kelas 4). */
export type SeedKind = 'jagung' | 'beras' | 'kacang-hijau' | 'kacang-merah' | 'daun-kering' | 'kulit-telur';

/** Bahan kolase: kertas warna (warna cat Sanggar Warna) ATAU bahan alam. */
export type CollageMaterial = PaintColor | SeedKind;

export interface SeedLook {
  label: string;
  /** Warna isi tiap butir. */
  fill: string;
  /** Garis tepi butir (lebih gelap). */
  edge: string;
  /** Bentuk butir di gambar. */
  grain: 'bulat' | 'lonjong' | 'kotak' | 'serpih' | 'ginjal';
}

export const SEEDS: Record<SeedKind, SeedLook> = {
  jagung: { label: 'Jagung', fill: '#f7c32e', edge: '#b9850c', grain: 'kotak' },
  beras: { label: 'Beras', fill: '#fffaf0', edge: '#b9ad96', grain: 'lonjong' },
  'kacang-hijau': { label: 'Kacang hijau', fill: '#5f9e3f', edge: '#2f5e1d', grain: 'bulat' },
  'kacang-merah': { label: 'Kacang merah', fill: '#9b2d2d', edge: '#5c1414', grain: 'ginjal' },
  'daun-kering': { label: 'Daun kering', fill: '#b9773a', edge: '#6e4218', grain: 'serpih' },
  'kulit-telur': { label: 'Kulit telur', fill: '#fbf4e6', edge: '#b8a98c', grain: 'serpih' },
};

export function isSeed(m: CollageMaterial): m is SeedKind {
  return m in SEEDS;
}

/** Nama bahan yang ditulis di bawah lembarnya: "Merah", "Kacang hijau". */
export function materialLabel(m: CollageMaterial): string {
  if (isSeed(m)) return SEEDS[m].label;
  const n = paintName(m);
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** Warna utama bahan (untuk contoh, petunjuk, dan isi bagian yang sudah penuh). */
export function materialHex(m: CollageMaterial): string {
  return isSeed(m) ? SEEDS[m].fill : PAINT_HEX[m];
}

/**
 * Pasangan warna yang di HP murah terbaca sama (pelajaran Labirin Warna &
 * Sanggar Warna) — tak boleh muncul bersama sebagai pilihan lembar/keping.
 */
const LOOK_ALIKE: [CollageMaterial, CollageMaterial][] = [
  ['kuning', 'oranye'],
  ['merah', 'merah-muda'],
  ['beras', 'kulit-telur'],
  ['putih', 'beras'],
  ['putih', 'kulit-telur'],
  ['cokelat', 'daun-kering'],
];

/** Pasangan yang terbaca sama di layar, kalau ada; `null` kalau aman. */
export function lookAlike(list: CollageMaterial[]): [CollageMaterial, CollageMaterial] | null {
  for (const [a, b] of LOOK_ALIKE) if (list.includes(a) && list.includes(b)) return [a, b];
  return null;
}

/* ---------- geometri ---------- */

const f = (n: number) => +n.toFixed(2);

export function rect(x: number, y: number, w: number, h: number): string {
  return `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
}

/**
 * Semua bentuk dasar digambar SEARAH jarum jam. Bagian yang tersusun dari
 * beberapa bentuk yang bertumpuk (awan = tiga lingkaran + persegi) diisi
 * dengan aturan `nonzero`: kalau arahnya berlawanan, tumpukannya justru jadi
 * LUBANG — dan titik di lubang itu tak bisa ditempeli.
 */
export function ellipse(cx: number, cy: number, rx: number, ry = rx): string {
  return `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 1 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 1 ${f(-2 * rx)} 0Z`;
}

export function poly(...pts: [number, number][]): string {
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
}

/** Awan dari tiga lingkaran + alas. */
function cloud(cx: number, cy: number, s: number): string {
  return [
    ellipse(cx - 9 * s, cy + 2 * s, 7 * s),
    ellipse(cx, cy - 2 * s, 9 * s),
    ellipse(cx + 9 * s, cy + 2 * s, 7 * s),
    rect(cx - 9 * s, cy + 1 * s, 18 * s, 8 * s),
  ].join('');
}

export interface CollageRegion {
  id: string;
  /** Nama bagian (aria-label & petunjuk). */
  label: string;
  d: string;
}

export interface CollageArt {
  /** Nama gambar di kalimat soal: "semangka", "kupu-kupu". */
  name: string;
  /** Bagian dari BAWAH ke ATAS. */
  regions: CollageRegion[];
  /** Garis tinta yang selalu tergambar di atas (mata, urat daun, tiang). */
  ink?: string[];
  /** Titik/bidang kecil berwarna yang selalu tergambar di atas (mata, biji). */
  dots?: { d: string; fill: string }[];
}

const R = (id: string, label: string, ...d: string[]): CollageRegion => ({ id, label, d: d.join('') });

export const COLLAGE_ART = {
  /* ----- gambar alam: warnanya ditalar anak sendiri ----- */
  semangka: {
    name: 'semangka',
    regions: [
      R('kulit', 'Kulit', 'M6 28A44 44 0 0 0 94 28Z'),
      R('daging', 'Daging buah', 'M14 28A36 36 0 0 0 86 28Z'),
    ],
    dots: [
      [34, 40],
      [50, 46],
      [66, 40],
      [41, 55],
      [59, 55],
    ].map(([x, y]) => ({ d: ellipse(x!, y!, 1.8, 2.8), fill: '#25262b' })),
  },
  wortel: {
    name: 'wortel',
    regions: [
      R(
        'daun',
        'Daun',
        'M50 36C42 24 36 12 40 4C48 10 51 22 50 36Z',
        'M50 36C51 20 56 10 63 7C64 18 59 28 50 36Z',
        'M50 36C60 26 72 22 78 24C74 32 63 36 50 36Z',
        'M50 36C40 28 27 23 21 25C26 33 38 36 50 36Z',
      ),
      R('umbi', 'Umbi', 'M32 38Q50 28 68 38Q61 66 50 96Q39 66 32 38Z'),
    ],
    ink: ['M41 52h7', 'M53 64h6', 'M44 76h5'],
  },
  pohon: {
    name: 'pohon',
    regions: [
      R('batang', 'Batang', 'M43 52H57L60 94H40Z'),
      R('daun', 'Daun', ellipse(50, 30, 24), ellipse(30, 42, 16), ellipse(70, 42, 16), ellipse(50, 50, 18)),
    ],
  },
  terong: {
    name: 'terong',
    regions: [
      R('buah', 'Buah', 'M42 30C26 38 20 62 28 80C36 98 68 98 74 80C80 62 72 40 60 30Z'),
      R('tangkai', 'Tangkai', 'M28 42C32 22 68 22 72 42C65 35 61 49 55 40C53 51 47 51 45 40C39 49 35 35 28 42Z', rect(46, 6, 8, 22)),
    ],
  },
  tomat: {
    name: 'tomat',
    regions: [
      R('buah', 'Buah', ellipse(50, 60, 37, 33)),
      R('daun', 'Daun', poly([50, 26], [57, 34], [70, 30], [62, 41], [69, 49], [50, 43], [31, 49], [38, 41], [30, 30], [43, 34]), rect(47, 14, 6, 16)),
    ],
  },
  langit: {
    name: 'langit',
    regions: [
      R('langit', 'Langit', rect(0, 0, 100, 100)),
      R('matahari', 'Matahari', ellipse(72, 30, 15)),
      R('awan', 'Awan', cloud(34, 62, 1.6)),
    ],
  },
  pemandangan: {
    name: 'pemandangan',
    regions: [
      R('langit', 'Langit', rect(0, 0, 100, 100)),
      R('matahari', 'Matahari', ellipse(76, 22, 13)),
      R('awan', 'Awan', cloud(30, 24, 1.3)),
      R('bukit', 'Bukit', 'M0 62Q25 40 50 58Q75 38 100 56V100H0Z'),
    ],
  },
  laut: {
    name: 'laut',
    regions: [
      R('langit', 'Langit', rect(0, 0, 100, 100)),
      R('matahari', 'Matahari', ellipse(78, 22, 12)),
      R('layar', 'Layar', poly([50, 22], [50, 60], [78, 60]), poly([46, 28], [46, 60], [26, 60])),
      R('laut', 'Laut', 'M0 72Q12 66 25 72T50 72T75 72T100 72V100H0Z'),
      R('perahu', 'Perahu', poly([14, 62], [86, 62], [76, 80], [24, 80])),
    ],
    ink: ['M48 18V63'],
  },

  /* ----- gambar rancangan: warnanya mengikuti contoh ----- */
  ikan: {
    name: 'ikan',
    regions: [
      R('ekor', 'Ekor', poly([70, 50], [94, 30], [94, 70])),
      R('sirip', 'Sirip', 'M38 33Q48 12 62 32Z', 'M42 67Q50 84 60 68Z'),
      R('badan', 'Badan', ellipse(46, 50, 32, 21)),
    ],
    ink: ['M34 38Q42 50 34 62'],
    dots: [
      { d: ellipse(25, 45, 3.6), fill: '#25262b' },
      { d: ellipse(24, 44, 1.2), fill: '#ffffff' },
    ],
  },
  kupu: {
    name: 'kupu-kupu',
    regions: [
      R(
        'sayap-atas',
        'Sayap atas',
        'M47 46C30 12 4 16 8 38C12 54 34 52 47 50Z',
        'M53 46C70 12 96 16 92 38C88 54 66 52 53 50Z',
      ),
      R('sayap-bawah', 'Sayap bawah', 'M47 53C29 56 14 72 24 86C34 95 46 76 47 59Z', 'M53 53C71 56 86 72 76 86C66 95 54 76 53 59Z'),
      R('badan', 'Badan', ellipse(50, 54, 5, 24)),
    ],
    ink: ['M48 32Q42 20 36 14', 'M52 32Q58 20 64 14'],
  },
  rumah: {
    name: 'rumah',
    regions: [
      R('dinding', 'Dinding', rect(20, 46, 60, 46)),
      R('atap', 'Atap', poly([10, 50], [50, 12], [90, 50])),
      R('pintu', 'Pintu', rect(43, 64, 15, 28)),
      R('jendela', 'Jendela', rect(25, 58, 13, 13), rect(63, 58, 13, 13)),
    ],
    ink: ['M31.5 58V71M25 64.5H38', 'M69.5 58V71M63 64.5H76'],
    dots: [{ d: ellipse(54.5, 79, 1.4), fill: '#25262b' }],
  },
  bunga: {
    name: 'bunga',
    regions: [
      R(
        'batang',
        'Batang',
        rect(47.5, 46, 5, 50),
        'M52 76C62 62 78 62 82 66C74 78 62 80 52 78Z',
        'M48 68C38 56 22 56 18 60C26 72 38 74 48 70Z',
      ),
      R('kelopak', 'Kelopak', ...[0, 72, 144, 216, 288].map((a) => {
        const t = ((a - 90) * Math.PI) / 180;
        return ellipse(50 + 16 * Math.cos(t), 34 + 16 * Math.sin(t), 12);
      })),
      R('tengah', 'Tengah bunga', ellipse(50, 34, 10)),
    ],
  },
  perahu: {
    name: 'perahu',
    regions: [
      R('layar', 'Layar', poly([50, 14], [50, 58], [82, 58]), poly([46, 22], [46, 58], [22, 58])),
      R('laut', 'Laut', 'M0 74Q12 68 25 74T50 74T75 74T100 74V100H0Z'),
      R('lambung', 'Lambung', poly([12, 60], [88, 60], [76, 82], [24, 82])),
    ],
    ink: ['M48 10V62'],
  },
  layang: {
    name: 'layang-layang',
    regions: [
      R('kiri', 'Sisi kiri', poly([50, 4], [20, 36], [50, 36]), poly([80, 36], [50, 74], [50, 36])),
      R('kanan', 'Sisi kanan', poly([50, 4], [80, 36], [50, 36]), poly([20, 36], [50, 74], [50, 36])),
      R('pita', 'Pita', poly([50, 84], [61, 78], [61, 90]), poly([72, 84], [61, 78], [61, 90]), poly([66, 96], [77, 90], [77, 100])),
    ],
    ink: ['M50 4V74M20 36H80', 'M50 74Q46 84 58 86T70 96'],
  },
  ayam: {
    name: 'ayam',
    regions: [
      R('ekor', 'Ekor', poly([70, 52], [94, 34], [90, 70])),
      R('badan', 'Badan', ellipse(56, 62, 27, 22), ellipse(30, 40, 14)),
      R('jengger', 'Jengger', 'M20 30Q20 16 27 22Q30 11 36 21Q42 14 42 30Z'),
      R('paruh', 'Paruh', poly([17, 37], [4, 42], [17, 47])),
    ],
    ink: ['M50 84V94M44 94H56', 'M62 84V94M56 94H68'],
    dots: [{ d: ellipse(28, 38, 2.4), fill: '#25262b' }],
  },
} satisfies Record<string, CollageArt>;

export type CollageArtId = keyof typeof COLLAGE_ART;

export function artOf(id: CollageArtId): CollageArt {
  return COLLAGE_ART[id];
}

/* ---------- montase ---------- */

/**
 * Montase = potongan gambar JADI yang ditempel jadi satu adegan. Di sini
 * potongannya seni item WebP yang sudah ada (bertepi putih seperti
 * guntingan), di atas latar langit + tanah.
 */
export type MontageScene = 'kota' | 'desa' | 'taman';

export interface MontagePiece {
  item: string;
  emoji: string;
  /** Pusat (persen) & lebar (persen kotak). */
  x: number;
  y: number;
  w: number;
}

export const MONTAGE: Record<MontageScene, MontagePiece[]> = {
  kota: [
    { item: 'sun', emoji: '☀️', x: 80, y: 18, w: 24 },
    { item: 'school', emoji: '🏫', x: 30, y: 44, w: 44 },
    { item: 'tree', emoji: '🌳', x: 76, y: 50, w: 30 },
    { item: 'bus', emoji: '🚌', x: 38, y: 78, w: 46 },
    { item: 'car', emoji: '🚗', x: 78, y: 82, w: 30 },
  ],
  desa: [
    { item: 'cloud', emoji: '☁️', x: 24, y: 16, w: 30 },
    { item: 'barn', emoji: '🛖', x: 66, y: 42, w: 42 },
    { item: 'tree', emoji: '🌳', x: 22, y: 48, w: 32 },
    { item: 'cow', emoji: '🐮', x: 34, y: 80, w: 36 },
    { item: 'chicken', emoji: '🐔', x: 76, y: 82, w: 24 },
  ],
  taman: [
    { item: 'sun', emoji: '☀️', x: 20, y: 18, w: 24 },
    { item: 'balloon', emoji: '🎈', x: 76, y: 24, w: 22 },
    { item: 'tree', emoji: '🌳', x: 66, y: 52, w: 36 },
    { item: 'flower', emoji: '🌼', x: 24, y: 70, w: 24 },
    { item: 'bicycle', emoji: '🚲', x: 56, y: 84, w: 40 },
  ],
};

/* ---------- acak tetap ---------- */

/** Bilangan acak 0..1 yang SELALU sama untuk benih yang sama (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sobekan kertas: poligon bergerigi di sekitar (0,0) berjari-jari ±r. */
export function tornPath(r: number, seed: number): string {
  const rnd = seeded(seed);
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const a = ((i + rnd() * 0.5) / n) * Math.PI * 2;
    const rr = r * (0.78 + rnd() * 0.3);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  // Titik tengah tiap sisi ditarik keluar-masuk sedikit: tepi robekan.
  const out: [number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const [x1, y1] = pts[i]!;
    const [x2, y2] = pts[(i + 1) % n]!;
    out.push([x1, y1]);
    for (let k = 1; k <= 2; k += 1) {
      const t = k / 3;
      const j = 1 + (rnd() - 0.5) * 0.16;
      out.push([(x1 + (x2 - x1) * t) * j, (y1 + (y2 - y1) * t) * j]);
    }
  }
  return poly(...out);
}

/** Butir-butir bahan alam di sekitar (0,0): [x, y, putar°] per butir. */
export function grains(r: number, seed: number, count = 11): [number, number, number][] {
  const rnd = seeded(seed);
  const list: [number, number, number][] = [];
  for (let i = 0; i < count; i += 1) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.85;
    list.push([Math.cos(a) * d, Math.sin(a) * d, Math.floor(rnd() * 180)]);
  }
  return list;
}
