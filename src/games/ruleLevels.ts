import type { GameLevel, LevelStamp, RuleBoxSpec } from '@/engine/core/types';
import {
  RULE_COLORS,
  RULE_SHAPES,
  boxHits,
  chipKind,
  routeToy,
  runSort,
  expectedBoxes,
  type RuleChip,
  type RuleColor,
  type RuleProgram,
  type RuleShape,
  type RuleSize,
  type RuleToy,
} from '@/engine/core/ruleSort';

/**
 * Builder bersama dua game percabangan (`rule-sort`): Pabrik Mainan (TK) &
 * Robot Pemilah (SD Kelas 1 & 2). Tiap soal diperiksa dengan mesin yang sama
 * dengan yang berjalan di layar (`core/ruleSort.ts`); pemeriksaan BERAT
 * (mencoba SEMUA program yang bisa disusun dari baki) ada di
 * `scripts/check-rule-levels.mjs`, bukan di sini — builder ini ikut jalan di
 * HP anak saat game dibuka, jadi cuma boleh memeriksa yang murah.
 *
 * Rancangan ditulis dengan warna & bentuk "kanonik", lalu tiap varian
 * MEWARNAI ULANG dan MENGGANTI BENTUK secara konsisten (permutasi): logikanya
 * sama persis, rupanya berbeda — anak tak bisa menghafal "merah selalu ke
 * kelinci".
 *
 * Tulisan mainan: kata warna + kata bentuk (+ `kecil`), mis. `'merah bintang'`,
 * `'kecil biru lingkaran'`.
 */

type Level = GameLevel<'rule-sort'>;

export interface RuleBoxDesign {
  /** Mainan yang sudah ada di kotak (bukti). */
  ex?: string[];
  /** Tanda yang benar untuk kotak ini (1 atau 2 = DAN). */
  rule: RuleChip[];
  /** Mode PERBAIKI: tanda yang sudah terpasang. */
  given?: RuleChip[];
}

export interface RuleDesign {
  boxes: RuleBoxDesign[];
  queue: string[];
  /**
   * Isi baki. `warna`/`bentuk`/`semua` = diambil dari mainan yang muncul di
   * soal (+ ukuran kalau ada mainan kecil, + `lainnya` kalau jawabannya
   * memakainya); daftar = persis itu.
   */
  tray: 'warna' | 'bentuk' | 'semua' | RuleChip[];
  /** Tanda pengecoh tambahan di baki. */
  extra?: RuleChip[];
  /** Pesanan terlihat di gelembung (level perkenalan). */
  bubbles?: boolean;
  /**
   * `tebak` = tanda jawaban sudah terpasang & terkunci, anak menebak kotak
   * tujuan tiap mainan. `tray` diabaikan (baki kosong), `ex` & `given` tak dipakai.
   */
  mode?: 'tebak';
  /** Antrean rahasia (kado "?"). Wajib ada contoh di kotak (mode susun). */
  hidden?: boolean;
}

export interface RuleSlotOpts {
  owners: string[];
  machine?: 'corong' | 'robot';
  max?: number;
  /**
   * Soal TEBAK tanpa jebakan urutan: tiap mainan cocok dengan TEPAT satu kotak
   * (selain "lainnya"). Untuk TK — prioritas kotak kiri itu materi SD.
   */
  plain?: boolean;
}

function fail(where: string, why: string): never {
  throw new Error(`Soal percabangan ${where}: ${why}`);
}

function parseToy(text: string, where: string): RuleToy {
  let color: RuleColor | undefined;
  let shape: RuleShape | undefined;
  let size: RuleSize | undefined;
  for (const w of text.trim().split(/\s+/)) {
    if ((RULE_COLORS as string[]).includes(w)) color = w as RuleColor;
    else if ((RULE_SHAPES as string[]).includes(w)) shape = w as RuleShape;
    else if (w === 'kecil' || w === 'besar') size = w;
    else fail(where, `kata mainan "${w}" tak dikenal`);
  }
  if (!color || !shape) fail(where, `mainan "${text}" wajib punya warna & bentuk`);
  return size === 'kecil' ? { color, shape, size } : { color, shape };
}

/** Permutasi warna & bentuk per varian (urutan sengaja diacak manual, bukan rotasi). */
const COLOR_PERMS: RuleColor[][] = [
  ['merah', 'kuning', 'biru', 'hijau'],
  ['biru', 'hijau', 'merah', 'kuning'],
  ['kuning', 'merah', 'hijau', 'biru'],
  ['hijau', 'biru', 'kuning', 'merah'],
  ['merah', 'hijau', 'kuning', 'biru'],
  ['biru', 'kuning', 'hijau', 'merah'],
];
const SHAPE_PERMS: RuleShape[][] = [
  ['lingkaran', 'segitiga', 'bintang', 'hati'],
  ['bintang', 'hati', 'lingkaran', 'segitiga'],
  ['hati', 'bintang', 'segitiga', 'lingkaran'],
  ['segitiga', 'lingkaran', 'hati', 'bintang'],
  ['hati', 'lingkaran', 'bintang', 'segitiga'],
  ['segitiga', 'bintang', 'lingkaran', 'hati'],
];

interface Recolor {
  color: (c: RuleColor) => RuleColor;
  shape: (s: RuleShape) => RuleShape;
  size: (s: RuleSize) => RuleSize;
}

function recolor(k: number): Recolor {
  const cp = COLOR_PERMS[k % COLOR_PERMS.length]!;
  const sp = SHAPE_PERMS[(k * 5 + 1) % SHAPE_PERMS.length]!;
  const flipSize = k % 2 === 1;
  return {
    color: (c) => cp[RULE_COLORS.indexOf(c)]!,
    shape: (s) => sp[RULE_SHAPES.indexOf(s)]!,
    size: (s) => (flipSize ? (s === 'besar' ? 'kecil' : 'besar') : s),
  };
}

function mapChip(c: RuleChip, r: Recolor): RuleChip {
  const kind = chipKind(c);
  if (kind === 'warna') return r.color(c as RuleColor);
  if (kind === 'bentuk') return r.shape(c as RuleShape);
  if (kind === 'ukuran') return r.size(c as RuleSize);
  return c;
}

function mapToy(t: RuleToy, r: Recolor, sized: boolean): RuleToy {
  const out: RuleToy = { color: r.color(t.color), shape: r.shape(t.shape) };
  if (sized) {
    const s = r.size(t.size ?? 'besar');
    if (s === 'kecil') out.size = s;
  }
  return out;
}

/** Acak tetap (benih) — urutan antrean berbeda tiap varian tapi sama tiap main. */
function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const TRAY_ORDER: Record<string, number> = { warna: 0, bentuk: 1, ukuran: 2, lainnya: 3 };

function buildTray(design: RuleDesign, toys: RuleToy[], solution: RuleProgram, r: Recolor, sized: boolean): RuleChip[] {
  let chips: RuleChip[];
  if (Array.isArray(design.tray)) chips = design.tray.map((c) => mapChip(c, r));
  else {
    chips = [];
    const colors = design.tray === 'warna' || design.tray === 'semua';
    const shapes = design.tray === 'bentuk' || design.tray === 'semua';
    if (colors) for (const c of RULE_COLORS) if (toys.some((t) => t.color === c)) chips.push(c);
    if (shapes) for (const s of RULE_SHAPES) if (toys.some((t) => t.shape === s)) chips.push(s);
    if (sized) chips.push('besar', 'kecil');
    if (solution.some((b) => b.includes('lainnya'))) chips.push('lainnya');
  }
  for (const c of design.extra ?? []) {
    const m = mapChip(c, r);
    if (!chips.includes(m)) chips.push(m);
  }
  // Urut: warna (urutan palet) · bentuk · ukuran · lainnya — tetap, jadi baki rapi.
  const rank = (c: RuleChip) =>
    TRAY_ORDER[chipKind(c)]! * 10 +
    Math.max(RULE_COLORS.indexOf(c as RuleColor), RULE_SHAPES.indexOf(c as RuleShape), c === 'kecil' ? 1 : 0);
  return [...new Set(chips)].sort((a, b) => rank(a) - rank(b));
}

/** Satu soal, diperiksa (yang murah saja — lihat kepala berkas). */
export function ruleLevel(
  narration: string,
  design: RuleDesign,
  k: number,
  owners: string[],
  machine: 'corong' | 'robot' | undefined,
  where: string,
  plain = false,
): Level {
  const tebak = design.mode === 'tebak';
  if (/\d/.test(narration)) fail(where, `narasi memuat angka: "${narration}"`);
  const n = design.boxes.length;
  if (n < 2 || n > 3) fail(where, 'kotak harus 2 atau 3');
  if (design.queue.length < 3 || design.queue.length > 6) fail(where, 'antrean 3–6 mainan');
  const r = recolor(k);
  const rawToys = [...design.queue, ...design.boxes.flatMap((b) => b.ex ?? [])].map((t) => parseToy(t, where));
  const sized = rawToys.some((t) => t.size === 'kecil');

  const solution: RuleProgram = design.boxes.map((b) => b.rule.map((c) => mapChip(c, r)));
  const rand = seeded(k * 7919 + design.queue.length * 31 + n);
  const queue = design.queue
    .map((t) => mapToy(parseToy(t, where), r, sized))
    .map((t) => ({ t, w: rand() }))
    .sort((a, b) => a.w - b.w)
    .map((x) => x.t);
  const boxes: RuleBoxSpec[] = design.boxes.map((b, i) => {
    if (b.rule.length < 1 || b.rule.length > 2) fail(where, `kotak ${i + 1}: tanda 1 atau 2`);
    const spec: RuleBoxSpec = { owner: owners[(k + i) % owners.length]!, slots: b.rule.length as 1 | 2 };
    if (tebak) {
      if (b.ex || b.given) fail(where, 'soal tebak tak memakai contoh/perbaiki');
      spec.given = b.rule.map((c) => mapChip(c, r));
      return spec;
    }
    if (b.ex) spec.examples = b.ex.map((t) => mapToy(parseToy(t, where), r, sized));
    if (b.given) {
      if (b.given.length !== b.rule.length) fail(where, `kotak ${i + 1}: tanda perbaiki tak sama banyak`);
      spec.given = b.given.map((c) => mapChip(c, r));
    }
    return spec;
  });
  if (new Set(boxes.map((b) => b.owner)).size !== n) fail(where, 'pemilik kotak kembar');

  const tray = tebak ? [] : buildTray(design, [...queue, ...boxes.flatMap((b) => b.examples ?? [])], solution, r, sized);
  // Tujuh tanda sebaris = 36 px per tanda di HP 320 (batas bawah target sentuh).
  if (tray.length > 7) fail(where, `baki ${tray.length} tanda (maks 7)`);
  if (!tebak) for (const chips of solution) for (const c of chips) if (!tray.includes(c)) fail(where, `tanda jawaban "${c}" tak ada di baki`);

  const want = expectedBoxes(solution, queue);
  if (want.some((b) => b < 0)) fail(where, 'ada mainan antrean yang tak masuk kotak mana pun menurut jawaban');
  for (let b = 0; b < n; b++) if (!want.includes(b)) fail(where, `kotak ${b + 1} tak menerima mainan antrean — aturannya tak teruji`);
  boxes.forEach((b, i) => {
    for (const toy of b.examples ?? []) {
      if (routeToy(solution, toy).box !== i) fail(where, `contoh di kotak ${i + 1} tidak cocok dengan jawabannya`);
    }
  });
  if (tebak && plain) {
    queue.forEach((t, i) => {
      const hits = solution.filter((chips) => !chips.includes('lainnya') && boxHits(chips, t));
      if (hits.length > 1) fail(where, `mainan ke-${i + 1} cocok dengan dua kotak — jebakan urutan bukan untuk TK`);
    });
  }
  if (!tebak && boxes.some((b) => b.given)) {
    const given = boxes.map((b) => b.given ?? []);
    if (runSort(given, queue, want).outcome === 'benar') fail(where, 'tanda "perbaiki" ternyata sudah benar');
  }
  if (!tebak && !design.bubbles && !boxes.some((b) => b.examples?.length)) fail(where, 'tanpa gelembung WAJIB ada contoh di kotak');

  return {
    id: '',
    narration,
    data: {
      boxes,
      queue,
      tray,
      solution,
      bubbles: design.bubbles,
      machine,
      ...(tebak ? { mode: 'tebak' as const } : {}),
      ...(design.hidden ? { hidden: true } : {}),
    },
  };
}

/**
 * Satu SLOT: rancangan-rancangan diwarnai ulang jadi beberapa varian,
 * bergiliran antar-rancangan (rancangan 1 · 2 · 1 · 2 …).
 */
export function ruleSlot(
  id: string,
  stamp: LevelStamp,
  narration: string,
  designs: RuleDesign[],
  opts: RuleSlotOpts,
): Level[] {
  const count = opts.max ?? 6;
  const out: Level[] = [];
  const seen = new Set<string>();
  for (let k = 0; out.length < count && k < count * 3; k++) {
    const d = designs[k % designs.length]!;
    const lv = { ...ruleLevel(narration, d, k, opts.owners, opts.machine, `${id} varian ${k + 1}`, opts.plain), id, stamp };
    const key = JSON.stringify([lv.data.boxes, lv.data.queue]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(lv);
  }
  return out;
}
