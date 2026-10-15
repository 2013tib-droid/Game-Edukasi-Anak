/**
 * Satu-satunya sumber logika template `rule-sort` — MESIN "KALAU" (coding anak
 * bagian kedua: PERCABANGAN, sesudah urutan & ulangi di `code-quest`).
 * Dipakai template (`RuleSort.tsx`), builder config (`games/ruleLevels.ts`),
 * pemeriksa CI (`scripts/check-rule-levels.mjs`) DAN skrip narasi — jadi
 * "aturan ini menyortir semua mainan dengan benar" diperiksa dengan mesin yang
 * sama persis dengan yang berjalan di layar anak.
 *
 * Cara kerjanya (dan itulah yang dipelajari anak): tiap kotak punya TANDA
 * (kondisi). Mainan berjalan di ban berjalan dari KIRI ke KANAN; di atas tiap
 * kotak mesin memeriksa tandanya — cocok = mainan jatuh ke kotak itu, tidak
 * cocok = jalan terus ke kotak berikutnya. Itu persis `if … else if … else`:
 * kotak pertama yang cocok yang menang, dan tanda "lainnya" (selalu cocok)
 * hanya masuk akal di kotak TERAKHIR. Mainan yang tak cocok dengan kotak mana
 * pun jatuh dari ujung ban.
 *
 * Kotak bertanda dua (`slots: 2`) = DAN: mainan harus cocok dengan KEDUA tanda.
 */

export type RuleColor = 'merah' | 'kuning' | 'biru' | 'hijau';
/**
 * Bentuk mainan. `kotak` SENGAJA tidak ada: tujuan mainan di game ini juga
 * disebut "kotak", dan "masuk ke kotak kotak" membingungkan anak.
 */
export type RuleShape = 'lingkaran' | 'segitiga' | 'bintang' | 'hati';
export type RuleSize = 'besar' | 'kecil';
export type RuleChip = RuleColor | RuleShape | RuleSize | 'lainnya';

export interface RuleToy {
  color: RuleColor;
  shape: RuleShape;
  /** Bawaan `besar`. Ukuran baru dipakai di SD (anak TK cukup warna & bentuk). */
  size?: RuleSize;
}

/** Program anak = tanda di tiap kotak, urut dari kiri. */
export type RuleProgram = RuleChip[][];

export const RULE_COLORS: RuleColor[] = ['merah', 'kuning', 'biru', 'hijau'];
export const RULE_SHAPES: RuleShape[] = ['lingkaran', 'segitiga', 'bintang', 'hati'];
export const RULE_SIZES: RuleSize[] = ['besar', 'kecil'];

/** Warna mainan — sama dengan cat Sanggar Warna supaya "merah" di app ini satu rupa. */
export const RULE_HEX: Record<RuleColor, string> = {
  merah: '#e03131',
  kuning: '#fcc419',
  biru: '#1c6fd6',
  hijau: '#2f9e44',
};

export type ChipKind = 'warna' | 'bentuk' | 'ukuran' | 'lainnya';

export function chipKind(chip: RuleChip): ChipKind {
  if ((RULE_COLORS as string[]).includes(chip)) return 'warna';
  if ((RULE_SHAPES as string[]).includes(chip)) return 'bentuk';
  if ((RULE_SIZES as string[]).includes(chip)) return 'ukuran';
  return 'lainnya';
}

/**
 * Kalimat tetap template ini. WAJIB sama dengan yang dikumpulkan
 * `scripts/extract-narration.mjs` (skrip itu mengimpor objek ini). Nama tanda
 * dibacakan saat disentuh — "merah", "segitiga", "besar" itu kosakata yang
 * memang sedang dipelajari anak TK.
 */
export const RULE_LINES = {
  chip: {
    merah: 'Merah',
    kuning: 'Kuning',
    biru: 'Biru',
    hijau: 'Hijau',
    lingkaran: 'Lingkaran',
    segitiga: 'Segitiga',
    bintang: 'Bintang',
    hati: 'Hati',
    besar: 'Besar',
    kecil: 'Kecil',
    lainnya: 'Lainnya',
  } as Record<RuleChip, string>,
  /** Mainan jatuh ke kotak yang salah. */
  wrongBox: 'Ups, mainan ini masuk kotak yang salah. Ubah tandanya, ya!',
  /** Mainan tak cocok dengan kotak mana pun, jatuh dari ujung ban. */
  noBox: 'Mainan ini tidak cocok dengan kotak mana pun. Ubah tandanya, ya!',
  /** Ada tempat tanda yang masih kosong. */
  empty: 'Pasang tanda di setiap kotak dulu, ya!',
  /** Semua mainan masuk kotak yang benar. */
  done: 'Hore, semua mainan masuk kotak yang benar!',
};

/** Ukuran mainan, dengan bawaan. */
export function sizeOf(toy: RuleToy): RuleSize {
  return toy.size ?? 'besar';
}

/** Satu tanda cocok dengan mainan? (`lainnya` selalu cocok.) */
export function chipHits(chip: RuleChip, toy: RuleToy): boolean {
  if (chip === 'lainnya') return true;
  return chip === toy.color || chip === toy.shape || chip === sizeOf(toy);
}

/** Kotak cocok = SEMUA tandanya cocok (DAN). Kotak tanpa tanda tak pernah cocok. */
export function boxHits(chips: RuleChip[], toy: RuleToy): boolean {
  return chips.length > 0 && chips.every((c) => chipHits(c, toy));
}

/** Satu pemeriksaan di atas satu kotak, untuk animasi (tiap tanda menyala ✓/✗). */
export interface RuleCheck {
  box: number;
  hits: boolean[];
  ok: boolean;
}

export interface RuleRoute {
  /** Kotak tujuan, atau -1 kalau jatuh dari ujung ban. */
  box: number;
  checks: RuleCheck[];
}

/** Jalankan SATU mainan di ban: periksa kotak dari kiri, berhenti di yang pertama cocok. */
export function routeToy(prog: RuleProgram, toy: RuleToy): RuleRoute {
  const checks: RuleCheck[] = [];
  for (let b = 0; b < prog.length; b++) {
    const chips = prog[b]!;
    const hits = chips.map((c) => chipHits(c, toy));
    const ok = chips.length > 0 && hits.every(Boolean);
    checks.push({ box: b, hits, ok });
    if (ok) return { box: b, checks };
  }
  return { box: -1, checks };
}

/** Kotak yang SEHARUSNYA dituju tiap mainan = menurut jawaban contoh. */
export function expectedBoxes(solution: RuleProgram, toys: RuleToy[]): number[] {
  return toys.map((t) => routeToy(solution, t).box);
}

export type SortOutcome = 'benar' | 'salah-kotak' | 'tanpa-kotak';

export interface SortRun {
  routes: RuleRoute[];
  /** Indeks mainan pertama yang salah (`routes` berhenti di situ), atau -1. */
  failAt: number;
  outcome: SortOutcome;
}

/**
 * Jalankan seluruh antrean. Berhenti di mainan pertama yang salah — anak
 * melihat persis mainan mana dan kotak mana yang keliru.
 */
export function runSort(prog: RuleProgram, queue: RuleToy[], want: number[]): SortRun {
  const routes: RuleRoute[] = [];
  for (let i = 0; i < queue.length; i++) {
    const r = routeToy(prog, queue[i]!);
    routes.push(r);
    if (r.box !== want[i]) return { routes, failAt: i, outcome: r.box < 0 ? 'tanpa-kotak' : 'salah-kotak' };
  }
  return { routes, failAt: -1, outcome: 'benar' };
}

/** Program anak menyortir semua mainan ini persis seperti jawaban contoh? */
export function sortsLike(prog: RuleProgram, solution: RuleProgram, toys: RuleToy[]): boolean {
  return toys.every((t) => routeToy(prog, t).box === routeToy(solution, t).box);
}

/** Dua tanda di satu kotak, urutan tak penting: dibandingkan sebagai himpunan. */
export function sameChips(a: RuleChip[], b: RuleChip[]): boolean {
  return a.length === b.length && a.every((c) => b.includes(c)) && b.every((c) => a.includes(c));
}
