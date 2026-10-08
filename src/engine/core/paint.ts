/**
 * Warna cat Sanggar Warna (template `paint-studio`) — SATU sumber untuk
 * nama, rupa, hasil campuran, dan suhu warna. Dipakai template, config game,
 * DAN `scripts/extract-narration.mjs` (kalimat "Jadi warna …!" dihitung dari
 * fungsi yang sama dengan layar, jadi tak bisa menyimpang).
 *
 * Nama mengikuti yang diajarkan di SD Indonesia: tiga warna PRIMER (merah,
 * kuning, biru), tiga SEKUNDER (oranye, hijau, ungu), warna MUDA (tambah
 * putih) & TUA (tambah hitam). Rupa di layar sengaja pekat & saling jauh —
 * HP murah menggambar kuning dan oranye nyaris sama (pelajaran Labirin
 * Warna), jadi dua warna itu tak pernah diadu sebagai pilihan.
 */

export type PaintColor =
  | 'merah'
  | 'kuning'
  | 'biru'
  | 'oranye'
  | 'hijau'
  | 'ungu'
  | 'putih'
  | 'hitam'
  | 'merah-muda'
  | 'kuning-muda'
  | 'biru-muda'
  | 'oranye-muda'
  | 'hijau-muda'
  | 'ungu-muda'
  | 'merah-tua'
  | 'kuning-tua'
  | 'biru-tua'
  | 'oranye-tua'
  | 'hijau-tua'
  | 'ungu-tua'
  | 'abu-abu'
  | 'cokelat';

export const PAINT_HEX: Record<PaintColor, string> = {
  merah: '#e03131',
  kuning: '#fcc419',
  biru: '#1c6fd6',
  oranye: '#f76707',
  hijau: '#2f9e44',
  ungu: '#8e3fc9',
  putih: '#ffffff',
  hitam: '#25262b',
  'merah-muda': '#f8a5c2',
  'kuning-muda': '#fff3a3',
  'biru-muda': '#8fc8f6',
  'oranye-muda': '#ffc08a',
  'hijau-muda': '#a9e5a0',
  'ungu-muda': '#d3b0ef',
  'merah-tua': '#8a1c1c',
  'kuning-tua': '#9c8100',
  'biru-tua': '#0d3a73',
  'oranye-tua': '#a84300',
  'hijau-tua': '#1b5e20',
  'ungu-tua': '#4b1c70',
  'abu-abu': '#9aa0a6',
  cokelat: '#8b5a2b',
};

/** Nama yang ditulis & diucapkan: "merah muda" (id "merah-muda"), tapi "abu-abu" tetap. */
export function paintName(c: PaintColor): string {
  return c.replace(/-(muda|tua)$/, ' $1');
}

const BASE: PaintColor[] = ['merah', 'kuning', 'biru', 'oranye', 'hijau', 'ungu'];

export const PRIMARY: PaintColor[] = ['merah', 'kuning', 'biru'];

const SECONDARY: Record<string, PaintColor> = {
  'kuning+merah': 'oranye',
  'biru+kuning': 'hijau',
  'biru+merah': 'ungu',
  // Warna yang berseberangan di roda warna jadi cokelat.
  'hijau+merah': 'cokelat',
  'kuning+ungu': 'cokelat',
  'biru+oranye': 'cokelat',
};

/**
 * Hasil mencampur dua tetes cat sama banyak. `undefined` = campuran yang tidak
 * punya nama di pelajaran SD — config yang memberi tabung begitu ditolak saat
 * build (`checkTubes`), jadi di layar setiap campuran selalu bernama.
 */
export function mixPaint(a: PaintColor, b: PaintColor): PaintColor | undefined {
  if (a === b) return a;
  const pair = [a, b].sort().join('+');
  if (SECONDARY[pair]) return SECONDARY[pair];
  if (pair === 'hitam+putih') return 'abu-abu';
  const other = a === 'putih' || a === 'hitam' ? b : b === 'putih' || b === 'hitam' ? a : null;
  const neutral = other === a ? b : a;
  if (other && BASE.includes(other)) return `${other}-${neutral === 'putih' ? 'muda' : 'tua'}` as PaintColor;
  return undefined;
}

/** Semua tetes dari `tubes` bisa dicampur jadi warna bernama? */
export function checkTubes(tubes: PaintColor[]): string | null {
  for (const a of tubes) for (const b of tubes) if (!mixPaint(a, b)) return `${a} + ${b} tak bernama`;
  return null;
}

/** Warna panas / dingin (kelas 4). `undefined` = tak dipakai di soal suhu. */
export function paintTemp(c: PaintColor): 'panas' | 'dingin' | undefined {
  if (['merah', 'oranye', 'kuning', 'merah-tua', 'oranye-muda', 'oranye-tua'].includes(c)) return 'panas';
  if (['biru', 'hijau', 'ungu', 'biru-muda', 'biru-tua', 'hijau-tua', 'ungu-muda'].includes(c)) return 'dingin';
  return undefined;
}

/** Kalimat saat mangkuk selesai diaduk — dibacakan, ikut diekstrak narasi. */
export function mixLine(c: PaintColor): string {
  return `Jadi warna ${paintName(c)}!`;
}

/** Nama & asal motif batik — yang umum diajarkan (keputusan pemilik 2026-10-08). */
export const BATIK: Record<string, { name: string; from: string }> = {
  kawung: { name: 'kawung', from: 'Yogyakarta' },
  parang: { name: 'parang', from: 'Yogyakarta' },
  'mega-mendung': { name: 'mega mendung', from: 'Cirebon' },
  truntum: { name: 'truntum', from: 'Surakarta' },
};

/** Kalimat sesudah motif dikenali — dibacakan, ikut diekstrak narasi. */
export function batikLine(id: string): string {
  const b = BATIK[id]!;
  return `Benar! Ini motif ${b.name} dari ${b.from}.`;
}

/** Judul kartu nama motif: "Mega mendung". */
export function batikTitle(id: string): string {
  const n = BATIK[id]!.name;
  return n.charAt(0).toUpperCase() + n.slice(1);
}
