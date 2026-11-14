/**
 * WAJAH PERASAAN (template `face-feel`, 2026-11-13) — SATU sumber aturan
 * perasaan, dipakai template (`FaceFeel.tsx`), gambar wajah (`ui/Face.tsx`),
 * builder config (`src/games/tk/wajah-perasaan.ts`), pemeriksa CI
 * (`scripts/check-face-levels.mjs`), DAN `scripts/extract-narration.mjs`.
 *
 * Wajahnya = anak ayam bulat yang digambar ENGINE (keputusan pemilik
 * 2026-11-13), bukan emoji: emoji wajah beda bentuk di tiap HP, dan bagian
 * wajah engine bisa DIGESER anak (mode `make` / `mirror`).
 *
 * Satu ekspresi = empat angka (`FaceShape`):
 *   mouth  −1 (cemberut) … +1 (tersenyum lebar)
 *   brow   −1 (alis dalam terangkat: sedih/cemas) … +1 (alis turun "V": marah)
 *   eye     0 … 1 (0,4 menyipit · 0,6 biasa · 1 melotot lebar)
 *   open    0 … 1 (mulut terbuka — kaget = bulat penuh)
 * Hiasan (pipi merah, air mata, keringat, uap marah) TIDAK disimpan: dihitung
 * dari kedekatan wajah ke tiap perasaan (`feelWeights`), jadi wajah yang
 * sedang diseret anak berubah sedikit demi sedikit — air mata muncul pelan
 * saat mulutnya makin cemberut.
 */

import type { SceneId } from '@/engine/core/types';

export type Feeling = 'senang' | 'sedih' | 'marah' | 'takut' | 'kaget';
/** Perasaan yang bisa DIBENTUK anak dengan pegangan (kaget tidak). */
export type MakeFeeling = Exclude<Feeling, 'kaget'>;
/** Hasil membaca wajah — `biasa` = belum jadi perasaan apa pun. */
export type FaceRead = Feeling | 'biasa';

export const FEELINGS: Feeling[] = ['senang', 'sedih', 'marah', 'takut', 'kaget'];

export interface FaceShape {
  mouth: number;
  brow: number;
  eye: number;
  open: number;
}

/** Wajah tiap perasaan. Empat yang pertama TEPAT bisa dibentuk dengan pegangan. */
export const FACE_OF: Record<FaceRead, FaceShape> = {
  biasa: { mouth: 0, brow: 0, eye: 0.6, open: 0 },
  senang: { mouth: 0.9, brow: -0.15, eye: 0.6, open: 0.4 },
  sedih: { mouth: -0.85, brow: -0.9, eye: 0.5, open: 0 },
  marah: { mouth: -0.55, brow: 0.95, eye: 0.42, open: 0.12 },
  takut: { mouth: -0.15, brow: -0.95, eye: 1, open: 0.42 },
  kaget: { mouth: 0, brow: -0.55, eye: 1, open: 1 },
};

/** Bobot tiap dimensi saat mengukur jarak dua wajah. */
const W = { mouth: 1, brow: 1, eye: 0.7, open: 0.7 };

export function faceDistance(a: FaceShape, b: FaceShape): number {
  return Math.sqrt(
    W.mouth * (a.mouth - b.mouth) ** 2 +
      W.brow * (a.brow - b.brow) ** 2 +
      W.eye * (a.eye - b.eye) ** 2 +
      W.open * (a.open - b.open) ** 2,
  );
}

/**
 * Wajah dibaca sebagai perasaan TERDEKAT, asal cukup dekat (`READ_RADIUS`);
 * kalau tidak, `biasa`. Jari anak tak perlu tepat di titiknya — cukup jelas
 * condong ke satu perasaan.
 */
export const READ_RADIUS = 0.55;

export function feelingOf(shape: FaceShape): FaceRead {
  let best: FaceRead = 'biasa';
  let bestD = faceDistance(shape, FACE_OF.biasa);
  for (const f of FEELINGS) {
    const d = faceDistance(shape, FACE_OF[f]);
    if (d < bestD) {
      best = f;
      bestD = d;
    }
  }
  return best !== 'biasa' && bestD <= READ_RADIUS ? best : 'biasa';
}

/** 0…1 seberapa dekat wajah ke tiap perasaan — dipakai hiasan & sayap. */
export function feelWeights(shape: FaceShape): Record<Feeling, number> {
  const out = {} as Record<Feeling, number>;
  for (const f of FEELINGS) out[f] = Math.max(0, Math.min(1, 1 - faceDistance(shape, FACE_OF[f]) / 0.6));
  return out;
}

/* ---------- Pegangan (mode make / mirror) ---------- */

/**
 * Pegangan yang aktif. `mulut` (TK awal): satu pegangan saja, alis IKUT
 * mulut (cemberut → alis sedih), jadi senang & sedih bisa dibuat dengan satu
 * tarikan. `mulut-alis`: dua pegangan, keempat perasaan bisa dibentuk.
 */
export type FaceControls = 'mulut' | 'mulut-alis';

/** Alis yang ikut mulut di mode satu pegangan. */
export function coupledBrow(mouth: number): number {
  return mouth < 0 ? mouth * (0.9 / 0.85) : mouth * (-0.15 / 0.9);
}

const ANCHORS: MakeFeeling[] = ['senang', 'sedih', 'marah', 'takut'];

/**
 * Wajah utuh dari posisi pegangan (mulut, alis). Mata & bukaan mulut tak
 * punya pegangan: diturunkan dari titik-titik wajah perasaan (rata-rata
 * berbobot jarak), jadi di posisi TEPAT sebuah perasaan hasilnya persis
 * `FACE_OF` perasaan itu.
 */
export function faceFromControls(mouth: number, brow: number): FaceShape {
  const m = clamp1(mouth);
  const b = clamp1(brow);
  let sw = 0;
  let eye = 0;
  let open = 0;
  for (const f of ['biasa', ...ANCHORS] as FaceRead[]) {
    const a = FACE_OF[f];
    const d2 = (a.mouth - m) ** 2 + (a.brow - b) ** 2;
    if (d2 < 1e-9) return { mouth: m, brow: b, eye: a.eye, open: a.open };
    const w = 1 / (d2 * d2);
    sw += w;
    eye += w * a.eye;
    open += w * a.open;
  }
  return { mouth: m, brow: b, eye: eye / sw, open: open / sw };
}

export function controlsFace(controls: FaceControls, mouth: number, brow: number): FaceShape {
  return faceFromControls(mouth, controls === 'mulut' ? coupledBrow(mouth) : brow);
}

export function clamp1(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

/**
 * Daerah sentuh pegangan, dalam satuan gambar wajah (kotak 200×200). Daerah
 * itu yang bisa diseret — bukan cuma bulatan pegangannya — supaya jari anak
 * yang menyentuh mulut atau dahi langsung kena. Pemeriksa CI menuntut sisi
 * terpendeknya ≥ 64 px di wajah terkecil (`MIN_FACE_PX`).
 */
export const HANDLE_ZONES = {
  brow: { x: 30, y: 16, w: 140, h: 68 },
  mouth: { x: 30, y: 96, w: 140, h: 70 },
} as const;

/** Lebar wajah terkecil yang digambar CSS untuk mode make/mirror (`.ff-big`). */
export const MIN_FACE_PX = 200;

/** Jarak seret (px) yang menggeser pegangan dari −1 sampai +1. */
export const DRAG_SPAN_PX = 150;

/* ---------- Kejadian & tindakan ---------- */

/** Hewan berseni registry yang boleh jadi tokoh cerita (JANGAN anjing). */
export type FeelHero = 'rabbit' | 'cat' | 'duck' | 'panda' | 'bear' | 'turtle' | 'chicken' | 'monkey' | 'elephant';

export const HERO_NAME: Record<FeelHero, string> = {
  rabbit: 'Kelinci',
  cat: 'Kucing',
  duck: 'Bebek',
  panda: 'Panda',
  bear: 'Beruang',
  turtle: 'Kura-kura',
  chicken: 'Ayam',
  monkey: 'Monyet',
  elephant: 'Gajah',
};

/** Kejadian penyebab perasaan — digambar engine (`ui/FeelArt.tsx`). */
export type FeelEvent =
  | 'kado'
  | 'kue'
  | 'pelangi'
  | 'es-jatuh'
  | 'balon-lepas'
  | 'mainan-rusak'
  | 'menara-roboh'
  | 'gambar-dicoret'
  | 'mainan-direbut'
  | 'petir'
  | 'lampu-mati'
  | 'kotak-kejutan';

export interface FeelEventDef {
  feeling: Feeling;
  /**
   * Perasaan yang JUGA masuk akal untuk kejadian ini — tak boleh jadi
   * pengecoh (soal jadi ambigu: mainan direbut bisa membuat sedih juga).
   */
  notWith: Feeling[];
  /** Kalimat kejadian, `{n}` = nama tokoh. */
  story: string;
  /** Nama pendek untuk pembaca layar. */
  label: string;
}

export const FEEL_EVENTS: Record<FeelEvent, FeelEventDef> = {
  kado: { feeling: 'senang', notWith: ['kaget'], story: '{n} dapat kado dari teman.', label: 'dapat kado' },
  kue: { feeling: 'senang', notWith: ['kaget'], story: '{n} dapat kue yang enak.', label: 'dapat kue' },
  pelangi: { feeling: 'senang', notWith: ['kaget'], story: '{n} melihat pelangi indah.', label: 'melihat pelangi' },
  'es-jatuh': { feeling: 'sedih', notWith: ['marah'], story: 'Es krim {n} jatuh ke tanah.', label: 'es krim jatuh' },
  'balon-lepas': { feeling: 'sedih', notWith: ['marah'], story: 'Balon {n} terbang lepas.', label: 'balon terbang' },
  'mainan-rusak': { feeling: 'sedih', notWith: ['marah'], story: 'Mobil mainan {n} rusak.', label: 'mainan rusak' },
  'menara-roboh': { feeling: 'marah', notWith: ['sedih'], story: 'Menara balok {n} ditendang teman.', label: 'menara roboh' },
  'gambar-dicoret': { feeling: 'marah', notWith: ['sedih'], story: 'Gambar {n} dicoret-coret teman.', label: 'gambar dicoret' },
  'mainan-direbut': { feeling: 'marah', notWith: ['sedih'], story: 'Mainan {n} direbut teman.', label: 'mainan direbut' },
  petir: { feeling: 'takut', notWith: ['sedih', 'kaget'], story: '{n} mendengar petir keras.', label: 'petir' },
  'lampu-mati': { feeling: 'takut', notWith: ['sedih', 'kaget'], story: 'Lampu mati, kamar {n} gelap.', label: 'lampu mati' },
  'kotak-kejutan': { feeling: 'kaget', notWith: ['takut', 'senang'], story: 'Boneka melompat dari kotak, boing!', label: 'kotak kejutan' },
};

/** Pasangan yang tak pernah boleh jadi jawaban-vs-pengecoh di soal yang sama. */
export const FORBIDDEN_PAIRS: [Feeling, Feeling][] = [
  ['takut', 'kaget'],
  ['senang', 'kaget'],
];

/** Tindakan di kartu `help` — gambar engine + kata pendek (≤ 3 kata). */
export type FeelAction =
  | 'peluk'
  | 'pinjamkan'
  | 'ajak-main'
  | 'temani'
  | 'tarik-napas'
  | 'bilang-pelan'
  | 'minta-peluk'
  | 'tertawa'
  | 'pergi'
  | 'berteriak'
  | 'cemberut';

export interface FeelActionDef {
  label: string;
  /** Tindakan yang baik — selebihnya pengecoh (tidak baik, tapi TIDAK kasar). */
  good: boolean;
}

export const FEEL_ACTIONS: Record<FeelAction, FeelActionDef> = {
  peluk: { label: 'Peluk', good: true },
  pinjamkan: { label: 'Pinjamkan', good: true },
  'ajak-main': { label: 'Ajak main', good: true },
  temani: { label: 'Temani', good: true },
  'tarik-napas': { label: 'Tarik napas', good: true },
  'bilang-pelan': { label: 'Bicara pelan', good: true },
  'minta-peluk': { label: 'Minta peluk', good: true },
  tertawa: { label: 'Tertawa', good: false },
  pergi: { label: 'Pergi', good: false },
  berteriak: { label: 'Teriak', good: false },
  cemberut: { label: 'Cemberut', good: false },
};

/* ---------- Data level ---------- */

/** Panel kejadian: tokoh + kejadiannya. */
export interface FeelCue {
  hero: FeelHero;
  event: FeelEvent;
}

export type FaceTask =
  /** Cerita → pilih WAJAH yang cocok. */
  | { kind: 'pick'; cue: FeelCue; choices: Feeling[]; answer: Feeling }
  /** Bentuk wajah sendiri dengan pegangan. */
  | { kind: 'make'; cue?: FeelCue; target: MakeFeeling; controls: FaceControls }
  /** Wajah ditunjukkan → pilih KEJADIAN penyebabnya. */
  | { kind: 'cause'; feeling: Feeling; choices: FeelEvent[]; answer: FeelEvent }
  /**
   * Apa yang baik dilakukan? `who` = tokoh yang merasakan; tanpa `who` =
   * "aku" (wajah anak ayam sendiri).
   */
  | { kind: 'help'; who?: FeelHero; feeling: Feeling; event: FeelEvent; choices: FeelAction[]; answer: FeelAction }
  /** Wajah teman ditunjukkan → anak meniru wajah yang sama (empati). */
  | { kind: 'mirror'; who: FeelHero; event: FeelEvent; target: MakeFeeling; controls: FaceControls };

export interface FaceStep {
  /** Kalimat langkah ke-2 dst. (langkah pertama = narasi level). */
  say?: string;
  task: FaceTask;
}

export interface FaceFeelData {
  steps: FaceStep[];
  scene?: SceneId;
}

/* ---------- Kalimat tetap template ---------- */

export const FEEL_LINES = {
  /** Nama perasaan, dibacakan saat kartu wajah disentuh. */
  name: {
    senang: 'Senang',
    sedih: 'Sedih',
    marah: 'Marah',
    takut: 'Takut',
    kaget: 'Kaget',
  } as Record<Feeling, string>,
  /** Mode make/mirror: "✓ Cocok!" ditekan tapi wajahnya belum jadi. */
  notYet: {
    biasa: 'Hmm, wajahnya masih biasa. Geser lagi, ya!',
    senang: 'Hmm, wajahnya masih senang. Coba lagi, ya!',
    sedih: 'Hmm, wajahnya masih sedih. Coba lagi, ya!',
    marah: 'Hmm, wajahnya masih marah. Coba lagi, ya!',
    takut: 'Hmm, wajahnya masih takut. Coba lagi, ya!',
  } as Record<Exclude<FaceRead, 'kaget'>, string>,
  /** Sesudah tindakan baik di soal `help`. */
  helped: 'Lihat, perasaannya jadi lebih baik!',
  /** Sesudah tindakan baik saat "aku" marah. */
  calm: 'Nah, hatimu jadi lebih tenang!',
} as const;
