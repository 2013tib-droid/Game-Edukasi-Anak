import type { LabEnergy, LabPass } from './types';

/**
 * Lab Cahaya & Bunyi — SATU sumber hitungan percobaan. Dipakai template
 * (`LightLab.tsx`) DAN config (`lab-cahaya-bunyi.ts`, untuk memeriksa soal
 * saat build), jadi yang dinilai di layar tak bisa menyimpang dari yang
 * diperiksa builder.
 */

/* ---------- nada ---------- */

/**
 * Gelas DIKETUK: makin banyak air makin RENDAH nadanya. (Kalau DITIUP justru
 * kebalikannya — karena itu soal gelas di game ini selalu diketuk.) Isi air
 * dibulatkan ke enam tingkat supaya tiap tingkat jatuh di nada pentatonik
 * yang enak didengar — dan gamelan gelas di misi besar jadi lagu, bukan
 * deretan bunyi sumbang.
 */
const GLASS_HZ = [1046.5, 880, 784, 659.25, 587.33, 523.25];
/** Karet: makin kencang makin TINGGI. */
const BAND_HZ = [261.63, 293.66, 329.63, 392, 440, 523.25];

export const PITCH_STEPS = GLASS_HZ.length - 1;

/** Tingkat 0..5 dari nilai 0..1. */
export const pitchStep = (v: number) => Math.max(0, Math.min(PITCH_STEPS, Math.round(v * PITCH_STEPS)));

export type LabSource = 'gelas' | 'karet';

export function pitchHz(source: LabSource, v: number): number {
  return (source === 'gelas' ? GLASS_HZ : BAND_HZ)[pitchStep(v)]!;
}

/* ---------- bayangan ---------- */

/**
 * Bayangan dilihat dari SAMPING (`size`): senter di rel, benda di tengah,
 * kelir di ujung. Skala bayangan = jarak senter→kelir ÷ jarak senter→benda —
 * fisika sungguhan, jadi makin DEKAT senter ke benda makin BESAR bayangannya.
 */
export const RAIL = { min: 6, max: 84, thing: 96, screen: 192 } as const;
/** Tinggi benda di kelir pada skala 1 (satuan gambar kelir, tinggi 120). */
export const SHADOW_BASE = 26;

export function shadowScale(lx: number): number {
  const d = Math.max(1, RAIL.thing - lx);
  return (RAIL.screen - lx) / d;
}

export const shadowHeight = (lx: number) => SHADOW_BASE * shadowScale(lx);

/**
 * Tiga zona tinggi bayangan. Ada celah di antaranya — bayangan yang "nanggung"
 * tidak dinilai benar untuk zona mana pun. `frame` = tinggi bingkai yang
 * digambar di kelir sebagai sasaran.
 */
export const SHADOW_GOALS = {
  kecil: { lo: 0, hi: 62, frame: 54 },
  sedang: { lo: 66, hi: 88, frame: 77 },
  besar: { lo: 96, hi: Infinity, frame: 108 },
} as const;

export type ShadowGoal = keyof typeof SHADOW_GOALS;

export function shadowFits(goal: ShadowGoal, lx: number): boolean {
  const h = shadowHeight(lx);
  const g = SHADOW_GOALS[goal];
  return h >= g.lo && h <= g.hi;
}

/** Posisi rel tempat bayangan tepat setinggi bingkai sasaran (petunjuk P2). */
export function railFor(goal: ShadowGoal): number {
  const k = SHADOW_GOALS[goal].frame / SHADOW_BASE;
  // k = (S - lx) / (T - lx)  →  lx = (S - kT) / (1 - k)
  const lx = (RAIL.screen - k * RAIL.thing) / (1 - k);
  return Math.max(RAIL.min, Math.min(RAIL.max, lx));
}

/**
 * Bayangan dilihat dari ATAS (`side`): selalu jatuh di sisi yang BERLAWANAN
 * dengan senter. Sudut dalam derajat, 0 = kanan, 90 = bawah (searah jarum jam,
 * sama dengan layar).
 */
export const shadowAngle = (lightDeg: number) => (lightDeg + 180) % 360;

export function angleGap(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 540) % 360 - 180);
  return d;
}

export const SIDE_TOLERANCE = 26;

/* ---------- getaran ---------- */

/** Tarikan (0..1) yang dihitung pelan / keras. Di antaranya = "nanggung". */
export const PULL = { pluck: 0.12, soft: 0.42, loud: 0.68 } as const;

export function pullFits(goal: 'keras' | 'pelan' | 'stop', pull: number): boolean {
  if (pull < PULL.pluck) return false;
  if (goal === 'pelan') return pull <= PULL.soft;
  if (goal === 'keras') return pull >= PULL.loud;
  return true;
}

/* ---------- cermin ---------- */

export type Dir = 0 | 1 | 2 | 3; // kanan, bawah, kiri, atas
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
const SOURCE: Record<string, Dir> = { '>': 0, v: 1, '<': 2, '^': 3 };

export interface MirrorCell {
  r: number;
  c: number;
}

export interface Beam {
  /** Titik-titik tengah sel yang dilalui sinar, berurutan (termasuk senter). */
  path: MirrorCell[];
  /** Ujung sinar. */
  end: 'target' | 'wall' | 'edge';
  /** Arah sinar keluar dari sel terakhir (untuk menggambar ujungnya). */
  dir: Dir;
}

export function mirrorCells(grid: string[]): MirrorCell[] {
  const out: MirrorCell[] = [];
  grid.forEach((row, r) => [...row].forEach((ch, c) => (ch === '/' || ch === '\\') && out.push({ r, c })));
  return out;
}

/**
 * Telusuri sinar senter. `turn[i]` = orientasi cermin ke-i (urutan baca,
 * kiri→kanan, atas→bawah): `'/'` atau `'\\'`.
 */
export function traceBeam(grid: string[], turn: string[]): Beam {
  const mirrors = mirrorCells(grid);
  const at = new Map(mirrors.map((m, i) => [`${m.r},${m.c}`, turn[i] ?? grid[m.r]![m.c]!]));
  let start: MirrorCell | null = null;
  let dir: Dir = 0;
  grid.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch in SOURCE) {
        start = { r, c };
        dir = SOURCE[ch]!;
      }
    }),
  );
  if (!start) throw new Error('cermin: tak ada senter');
  const path: MirrorCell[] = [start];
  let { r, c } = start as MirrorCell;
  for (let guard = 0; guard < 80; guard += 1) {
    r += DY[dir]!;
    c += DX[dir]!;
    const ch = grid[r]?.[c];
    if (ch === undefined) return { path, end: 'edge', dir };
    if (ch === '#') return { path, end: 'wall', dir };
    path.push({ r, c });
    if (ch === 'T') return { path, end: 'target', dir };
    const m = at.get(`${r},${c}`);
    if (m === '/') dir = ([3, 2, 1, 0] as Dir[])[dir]!;
    else if (m === '\\') dir = ([1, 0, 3, 2] as Dir[])[dir]!;
  }
  return { path, end: 'edge', dir };
}

/** Semua susunan cermin yang mengenai sasaran (untuk builder & petunjuk). */
export function mirrorSolutions(grid: string[]): string[][] {
  const n = mirrorCells(grid).length;
  const out: string[][] = [];
  for (let mask = 0; mask < 1 << n; mask += 1) {
    const turn = Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? '\\' : '/'));
    if (traceBeam(grid, turn).end === 'target') out.push(turn);
  }
  return out;
}

/* ---------- energi & bahan ---------- */

export const ENERGY: Record<LabEnergy, { label: string; emoji: string }> = {
  cahaya: { label: 'Cahaya', emoji: '💡' },
  panas: { label: 'Panas', emoji: '🔥' },
  bunyi: { label: 'Bunyi', emoji: '🔊' },
  gerak: { label: 'Gerak', emoji: '🌀' },
};

export const PASS_BOX: Record<LabPass, { label: string; rule: string }> = {
  tembus: { label: 'Tembus cahaya', rule: 'Terang' },
  sebagian: { label: 'Tembus sebagian', rule: 'Redup' },
  tidak: { label: 'Tidak tembus', rule: 'Gelap' },
};
