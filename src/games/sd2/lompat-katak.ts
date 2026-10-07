import type { LevelStamp, MixedGameConfig, MixedLevel, NumberHopData, TapChoice } from '@/engine/core/types';

/**
 * "Lompat Katak" (SD Kelas 3 & 4, `sd2`) — versi PREMIUM "Katak Penjelajah"
 * (docs/rencana-game-sd-kelas-3-4.md bagian 2b.3 no. 2): tambah & kurang
 * sampai 1.000 di garis bilangan.
 *
 * Anak MENEKAN tombol lompat ±100 / ±10 / ±1 dan katak benar-benar melompat
 * (template `number-hop`). Keputusan pemilik 2026-10-06:
 * - **bebas, asal tiba** — tombol dua arah selalu ada; 458 + 237 boleh
 *   +200 +30 +7 atau +300 −63. Yang dinilai tempat katak berdiri.
 * - **bintang tetap dari jumlah salah**; lompatan paling hemat cuma dapat
 *   lencana pujian "Lompatan hemat!".
 * - 9 slot berurutan TETAP (kls 3 → kls 4 dari slot 6), tanpa `sessionLevels`.
 *
 * SLOT
 *   l1 lompat puluhan (458 + 30)
 *   l2 tanpa menyimpan (324 + 152)
 *   l3 dengan menyimpan — melewati ratusan (458 + 265)
 *   l4 mundur dengan meminjam (523 − 187)
 *   l5 cari jarak: bawa katak ke teratai berbunga, lalu "berapa jauh?"
 *   l6 menaksir: SERET katak ke kira-kira hasilnya (±30)
 *   l7 menaksir lewat pembulatan (kartu)
 *   l8 periksa dengan kebalikan: maju, lalu mundur sejauh tadi
 *   l9 MISI BESAR: dua lompatan berturut-turut menyeberang kolam
 *
 * - Batas bilangan `sd2` 1.000: semua bilangan & hasil 0–999 (dicek builder).
 * - Narasi TANPA digit; soalnya tertulis di layar ("458 + 237"). Kalimatnya
 *   dipakai bersama semua varian satu slot — 12 rekaman saja.
 * - Pengecoh kartu dari kesalahan khas: selisih salah seratus (salah
 *   menyimpan/meminjam di ratusan) dan pembulatan ke ratusan yang salah.
 * - Katak = seni `frog` yang sudah ada (aturan hewan wajib seni). Nol aset baru.
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = MixedLevel;

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🌸', label: 'Teratai' },
  l2: { emoji: '🍃', label: 'Daun' },
  l3: { emoji: '💧', label: 'Embun' },
  l4: { emoji: '🌼', label: 'Bunga' },
  l5: { emoji: '🌿', label: 'Rumput' },
  l6: { emoji: '🍄', label: 'Jamur' },
  l7: { emoji: '🌈', label: 'Pelangi' },
  l8: { emoji: '🌙', label: 'Bulan' },
  l9: { emoji: '🏁', label: 'Seberang' },
};

function slot(id: string, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id, stamp: STAMP[id] }));
}

function check(...ns: number[]) {
  for (const n of ns) {
    if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`Lompat Katak: ${n} di luar 0–999`);
  }
}

function hopLevel(narration: string, data: NumberHopData): Level {
  return { id: '', narration, template: 'number-hop', data };
}

/** Satu soal tambah/kurang yang diselesaikan dengan melompat. */
function calc(narration: string, a: number, op: '+' | '−', b: number): Level {
  const r = op === '+' ? a + b : a - b;
  check(a, b, r);
  return hopLevel(narration, { from: a, steps: [{ target: r, show: `${a} ${op} ${b}` }] });
}

/* ---------- Kelas 3 ---------- */

const tens = (a: number, b: number) => {
  if (b % 10 !== 0 || b >= 100) throw new Error(`Lompat Katak: ${b} harus puluhan`);
  return calc('Bantu katak melompat puluhan. Ke teratai mana ia tiba?', a, '+', b);
};

const noCarry = (a: number, b: number) => {
  if ((a % 10) + (b % 10) >= 10 || (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10) {
    throw new Error(`Lompat Katak: ${a} + ${b} ternyata menyimpan`);
  }
  return calc('Lompat ratusan, puluhan, lalu satuan. Ke mana katak tiba?', a, '+', b);
};

const carry = (a: number, b: number) => {
  if (Math.floor(a / 100) === Math.floor((a + b) / 100) - Math.floor(b / 100)) {
    throw new Error(`Lompat Katak: ${a} + ${b} tidak melewati ratusan`);
  }
  return calc('Lompatannya melewati ratusan! Ke mana katak tiba?', a, '+', b);
};

const borrow = (a: number, b: number) => {
  if (a % 10 >= b % 10 && Math.floor(a / 10) % 10 >= Math.floor(b / 10) % 10) {
    throw new Error(`Lompat Katak: ${a} − ${b} tidak meminjam`);
  }
  return calc('Katak melompat mundur. Ke mana ia tiba?', a, '−', b);
};

/** 5. Cari jarak: tujuannya digambar, lalu "berapa jauh?". */
function distance(from: number, to: number): Level {
  const d = to - from;
  check(from, to, d);
  const choices = [d, d + 100, d - 100 >= 0 ? d - 100 : d + 10].map(String);
  if (new Set(choices).size !== 3) throw new Error(`Lompat Katak: kartu kembar ${choices}`);
  return hopLevel('Bawa katak ke teratai berbunga!', {
    from,
    steps: [{ target: to, show: `${from} + ? = ${to}`, goal: true }],
    ask: {
      prompt: 'Berapa jauh katak melompat?',
      choices: choices.map((text, i) => ({ text, ...(i === 0 ? { correct: true } : {}) })),
    },
  });
}

/* ---------- Kelas 4 ---------- */

/** 6. Menaksir dengan menyeret katak di garis 0–1.000. */
function guess(a: number, op: '+' | '−', b: number): Level {
  const r = op === '+' ? a + b : a - b;
  check(a, b, r);
  return hopLevel('Seret katak ke kira-kira hasilnya!', {
    from: 0,
    steps: [{ kind: 'place', target: r, show: `${a} ${op} ${b}`, tolerance: 30 }],
  });
}

/** 7. Menaksir lewat pembulatan ke ratusan (kartu jawaban). */
function round(a: number, op: '+' | '−', b: number): Level {
  const ra = Math.round(a / 100) * 100;
  const rb = Math.round(b / 100) * 100;
  const est = op === '+' ? ra + rb : ra - rb;
  check(a, b, est, est + 100, est - 100);
  const choices: TapChoice[] = [est, est - 100, est + 100].map((n, i) => ({
    id: `c${i}`,
    text: String(n),
    ...(i === 0 ? { correct: true } : {}),
  }));
  return {
    id: '',
    narration: 'Kira-kira berapa hasilnya? Bulatkan dulu ke ratusan!',
    template: 'tap-answer',
    data: { equation: `${a} ${op} ${b} ≈ ?`, choices },
  };
}

/** 8. Periksa dengan kebalikan: maju b, lalu mundur b — kembali ke a. */
function inverse(a: number, b: number): Level {
  check(a, b, a + b);
  return hopLevel('Lompat maju dulu sesuai soalnya!', {
    from: a,
    steps: [
      { target: a + b, show: `${a} + ${b}` },
      { target: a, show: `${a + b} − ${b}`, say: 'Sekarang mundur sejauh tadi. Kembali ke mana?' },
    ],
  });
}

/** 9. Misi besar: dua lompatan berturut-turut. */
function mission(from: number, first: number, second: number): Level {
  const mid = from + first;
  const end = mid + second;
  check(from, mid, end, Math.abs(first), Math.abs(second));
  const sign = (n: number) => (n < 0 ? '−' : '+');
  return hopLevel('Misi kolam! Ikuti dua lompatan katak sampai seberang.', {
    from,
    steps: [
      { target: mid, show: `${from} ${sign(first)} ${Math.abs(first)}` },
      {
        target: end,
        show: `${mid} ${sign(second)} ${Math.abs(second)}`,
        say: 'Lompatan kedua! Ke mana katak tiba sekarang?',
      },
    ],
  });
}

const config: MixedGameConfig = {
  id: 'lompat-katak',
  group: 'sd2',
  title: 'Lompat Katak',
  emoji: '🐸',
  template: 'mixed',
  project: { title: 'Kolam Katak' },
  hints: true,
  levels: [
    slot('l1', tens(458, 30), tens(215, 40), tens(327, 50), tens(604, 20), tens(133, 60), tens(742, 30)),
    slot(
      'l2',
      noCarry(324, 152),
      noCarry(213, 345),
      noCarry(401, 236),
      noCarry(132, 624),
      noCarry(520, 317),
      noCarry(241, 153),
    ),
    slot('l3', carry(458, 265), carry(276, 148), carry(365, 259), carry(187, 436), carry(529, 284), carry(648, 175)),
    slot(
      'l4',
      borrow(523, 187),
      borrow(704, 259),
      borrow(612, 348),
      borrow(831, 465),
      borrow(450, 176),
      borrow(925, 368),
    ),
    slot(
      'l5',
      distance(450, 700),
      distance(380, 600),
      distance(520, 800),
      distance(275, 500),
      distance(640, 900),
      distance(150, 420),
    ),
    slot(
      'l6',
      guess(398, '+', 205),
      guess(502, '+', 297),
      guess(251, '+', 349),
      guess(703, '−', 296),
      guess(199, '+', 499),
      guess(812, '−', 395),
    ),
    slot(
      'l7',
      round(398, '+', 205),
      round(512, '+', 289),
      round(701, '−', 298),
      round(603, '−', 195),
      round(189, '+', 412),
      round(795, '−', 404),
    ),
    slot('l8', inverse(458, 237), inverse(312, 145), inverse(526, 268), inverse(247, 385), inverse(605, 129), inverse(183, 452)),
    slot(
      'l9',
      mission(120, 350, -80),
      mission(245, 410, -130),
      mission(300, 275, 160),
      mission(510, -240, 125),
      mission(650, 180, -305),
      mission(75, 530, 210),
    ),
  ],
};

export default config;
