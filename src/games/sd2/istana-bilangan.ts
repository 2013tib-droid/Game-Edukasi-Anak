import type {
  LevelStamp,
  MixedGameConfig,
  MixedLevel,
  NumberCueSpec,
  Place,
  PlaceCounts,
  TapChoice,
} from '@/engine/core/types';
import { countsOf, digitAt, valueOf } from '@/engine/core/placeValue';
import { terbilang } from '@/games/numbers';

/**
 * "Istana Bilangan" (SD Kelas 3 & 4, `sd2`) — versi PREMIUM "Pembangun
 * Istana" (docs/rencana-game-sd-kelas-3-4.md bagian 2b.3 no. 1): nilai tempat,
 * membandingkan, dan pembulatan sampai 999.
 *
 * Anak MEMBANGUN bilangan dengan balok ratusan-puluhan-satuan di tiga menara
 * istana Raja Singa (template `place-value`), bukan cuma memilih kartu "347".
 *
 * SLOT (urutan TETAP — kelas 3 dulu, kelas 4 dari slot 7; keputusan pemilik
 * 2026-10-06). Tanpa `sessionLevels`; variasinya dari kolam varian per slot.
 *   l1 BANGUN bilangan dari balok (place-value)
 *   l2 baca balok → pilih bilangan
 *   l3 angka yang menyala bernilai berapa
 *   l4 bentuk panjang (300 + ? + 7 / 300 + 7 = ?)
 *   l5 membandingkan > < =
 *   l6 TUKAR: bangun pakai puluhan saja — 10 puluhan menempel jadi 1 ratusan
 *   l7 pembulatan ke puluhan di bukit bilangan (kls 4)
 *   l8 pembulatan ke ratusan
 *   l9 MISI BESAR "pinjam": ambil puluhan dari istana yang cuma berisi
 *      ratusan → pelat ratusan harus dipecah dulu
 *
 * - Proyek sesi "Istana Raja Singa": tiap level menambah satu bagian istana.
 * - Petunjuk bertingkat P2 (`hints`) dinyalakan — keputusan pemilik: hanya
 *   untuk game `sd2` baru. Visual saja, nol kalimat narasi tambahan.
 * - Batas bilangan `sd2` = 1.000; game ini berhenti di 999 (template-nya
 *   menolak balok yang melewati 999).
 * - Narasi TANPA digit. Bilangan soal hanya tertulis di layar (gelembung Raja
 *   Singa, papan persamaan, bukit), jadi kebanyakan kalimat dipakai bersama
 *   semua varian satu slot — sedikit rekaman.
 * - Pengecoh dari kesalahan khas (bagian 2 dokumen rencana): ANGKA TERTUKAR
 *   TEMPAT (347 ↔ 374), NOL YANG HILANG (307 dibaca 37), nilai angka = angka
 *   itu sendiri (4 di 347 = "4"), tempat yang salah (400), dan pembulatan ke
 *   lembah yang salah / ke tempat yang salah.
 * - Raja Singa = seni `lion` yang sudah ada. Istananya digambar engine.
 */

type Level = MixedLevel;

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🧱', label: 'Fondasi' },
  l2: { emoji: '🚪', label: 'Gerbang' },
  l3: { emoji: '🪟', label: 'Jendela' },
  l4: { emoji: '🏰', label: 'Menara' },
  l5: { emoji: '🚩', label: 'Bendera' },
  l6: { emoji: '🌷', label: 'Taman' },
  l7: { emoji: '🏮', label: 'Lampion' },
  l8: { emoji: '👑', label: 'Mahkota' },
  l9: { emoji: '🌉', label: 'Jembatan' },
};

/** Semua varian dalam satu slot berbagi id (bintang per slot) & bagian istananya. */
function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id, stamp: STAMP[id] }));
}

/** Tiga kartu: yang benar + dua pengecoh, semuanya WAJIB berbeda. */
function choices(correct: string | number, ...wrong: (string | number)[]): TapChoice[] {
  const all = [String(correct), ...wrong.map(String)];
  if (new Set(all).size !== all.length) throw new Error(`Istana Bilangan: kartu kembar ${all.join(', ')}`);
  return all.map((text, i) => ({ id: `c${i}`, text, ...(i === 0 ? { correct: true } : {}) }));
}

function tap(narration: string, data: { number?: NumberCueSpec; equation?: string; choices: TapChoice[] }): Level {
  return { id: '', narration, template: 'tap-answer', data };
}

function inRange(n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 999) throw new Error(`Istana Bilangan: ${n} di luar 1–999`);
}

/* ---------- Kelas 3 ---------- */

/** 1. Bangun bilangan dari balok. */
function build(target: number): Level {
  inRange(target);
  return {
    id: '',
    narration: 'Raja Singa memesan bilangan ini. Bangun istananya dengan balok!',
    template: 'place-value',
    data: { mode: 'build', target, wallet: [100, 10, 1] },
  };
}

/** 2. Baca balok. Pengecoh: angka tertukar tempat / nol hilang. */
function read(n: number, ...wrong: number[]): Level {
  inRange(n);
  return tap('Raja Singa menyusun balok ini. Bilangan berapa itu?', {
    number: { kind: 'blocks', n },
    choices: choices(n, ...wrong),
  });
}

/** 3. Nilai angka yang menyala. Pengecoh: angka itu sendiri & tempat lain. */
function worth(n: number, mark: Place): Level {
  inRange(n);
  const d = digitAt(n, mark);
  if (d === 0) throw new Error(`Istana Bilangan: angka yang menyala di ${n} nol`);
  const others = ([100, 10, 1] as Place[]).filter((p) => p !== mark).map((p) => d * p);
  return tap('Angka yang menyala bernilai berapa?', {
    number: { kind: 'digits', n, mark },
    choices: choices(d * mark, ...others),
  });
}

/** 4a. Bentuk panjang dengan satu bagian hilang. */
function expanded(n: number, missing: Place): Level {
  inRange(n);
  const c = countsOf(n);
  if (c.h === 0 || c.t === 0 || c.o === 0) throw new Error(`Istana Bilangan: ${n} butuh tiga angka bukan nol`);
  const part = (p: Place) => (p === missing ? '?' : String(digitAt(n, p) * p));
  const d = digitAt(n, missing);
  const others = ([100, 10, 1] as Place[]).filter((p) => p !== missing).map((p) => d * p);
  return tap('Lengkapi bentuk panjangnya!', {
    equation: `${part(100)} + ${part(10)} + ${part(1)} = ${n}`,
    choices: choices(d * missing, ...others),
  });
}

/** 4b. Bentuk panjang yang punya NOL — kesalahan "nol hilang" jadi pengecohnya. */
function expandedZero(hundreds: number, rest: number, ...wrong: number[]): Level {
  const n = hundreds + rest;
  inRange(n);
  return tap('Bilangan berapa ini?', {
    equation: `${hundreds} + ${rest} = ?`,
    choices: choices(n, ...wrong),
  });
}

/** 5. Membandingkan. `left` boleh berupa bentuk panjang ("300 + 40"). */
function compare(left: string, right: number): Level {
  const l = left.split(' + ').reduce((a, b) => a + Number(b), 0);
  inRange(l);
  inRange(right);
  const sign = l < right ? '<' : l > right ? '>' : '=';
  const cards: TapChoice[] = (['<', '>', '='] as const).map((s) => ({
    id: s === '<' ? 'lt' : s === '>' ? 'gt' : 'eq',
    text: s,
    ...(s === sign ? { correct: true } : {}),
  }));
  return tap('Pilih tanda yang tepat!', { equation: `${left} ? ${right}`, choices: cards });
}

/** 6. Tukar: tanpa pelat ratusan, sepuluh batang puluhan menempel jadi satu. */
function exchange(target: number, ones: boolean): Level {
  inRange(target);
  if (target < 100) throw new Error('Istana Bilangan: soal tukar harus melewati seratus');
  if (!ones && target % 10 !== 0) throw new Error(`Istana Bilangan: ${target} butuh satuan`);
  return {
    id: '',
    narration: ones
      ? 'Balok ratusan habis! Bangun bilangannya dengan puluhan dan satuan.'
      : 'Balok ratusan habis! Bangun bilangannya dengan puluhan saja.',
    template: 'place-value',
    data: { mode: 'build', target, wallet: ones ? [10, 1] : [10] },
  };
}

/* ---------- Kelas 4 ---------- */

/** 7–8. Pembulatan di bukit. Pengecoh ketiga: membulatkan ke tempat yang lain. */
function round(n: number, step: 10 | 100): Level {
  inRange(n);
  const lo = Math.floor(n / step) * step;
  const hi = lo + step;
  if (n - lo === step / 2 || n === lo) throw new Error(`Istana Bilangan: ${n} di puncak/lembah bukit`);
  const near = n - lo < step / 2 ? lo : hi;
  const far = near === lo ? hi : lo;
  const otherStep = step === 10 ? 100 : 10;
  const other = Math.round(n / otherStep) * otherStep;
  return tap(
    step === 10
      ? 'Bulatkan ke puluhan terdekat! Ke lembah mana bolanya menggelinding?'
      : 'Bulatkan ke ratusan terdekat! Ke lembah mana bolanya menggelinding?',
    { number: { kind: 'hill', n, step }, choices: choices(near, far, other) },
  );
}

/** 9. Misi besar: ambil puluhan — pelat ratusan harus dipecah dulu. */
function borrow(start: PlaceCounts, take: number): Level {
  if (start.t !== 0) throw new Error('Istana Bilangan: soal pinjam mulai TANPA puluhan');
  if (take % 10 !== 0 || take >= 100) throw new Error(`Istana Bilangan: ambil ${take} harus puluhan saja`);
  const target = valueOf(start) - take;
  inRange(target);
  return {
    id: '',
    narration: `Raja Singa perlu ${terbilang(take)} balok untuk jembatan. Ambil dari istana!`,
    template: 'place-value',
    data: { mode: 'take', target, start, take },
  };
}

const config: MixedGameConfig = {
  id: 'istana-bilangan',
  group: 'sd2',
  title: 'Istana Bilangan',
  emoji: '🏰',
  template: 'mixed',
  project: { title: 'Istana Raja Singa' },
  hints: true,
  levels: [
    slot('l1', build(347), build(215), build(432), build(506), build(260), build(183)),
    slot(
      'l2',
      read(253, 235, 352),
      read(416, 461, 146),
      read(307, 37, 370),
      read(520, 52, 502),
      read(138, 183, 318),
      read(604, 64, 640),
    ),
    slot('l3', worth(347, 10), worth(582, 100), worth(269, 1), worth(731, 10), worth(415, 100), worth(658, 10)),
    slot(
      'l4',
      expanded(347, 10),
      expanded(582, 100),
      expanded(619, 1),
      expandedZero(300, 7, 37, 370),
      expandedZero(500, 40, 54, 504),
      expandedZero(800, 6, 86, 860),
    ),
    slot(
      'l5',
      compare('347', 374),
      compare('503', 498),
      compare('610', 601),
      compare('289', 298),
      compare('300 + 40', 340),
      compare('456', 465),
    ),
    slot(
      'l6',
      exchange(120, false),
      exchange(150, false),
      exchange(140, false),
      exchange(115, true),
      exchange(132, true),
      exchange(124, true),
    ),
    slot('l7', round(342, 10), round(347, 10), round(563, 10), round(718, 10), round(236, 10), round(474, 10)),
    slot('l8', round(368, 100), round(432, 100), round(651, 100), round(219, 100), round(776, 100), round(149, 100)),
    slot(
      'l9',
      borrow({ h: 3, t: 0, o: 0 }, 40),
      borrow({ h: 4, t: 0, o: 0 }, 60),
      borrow({ h: 5, t: 0, o: 0 }, 30),
      borrow({ h: 3, t: 0, o: 5 }, 20),
      borrow({ h: 6, t: 0, o: 0 }, 70),
      borrow({ h: 2, t: 0, o: 8 }, 50),
    ),
  ],
};

export default config;
