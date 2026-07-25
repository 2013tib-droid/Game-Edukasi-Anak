import type { GameConfig, GameLevel, ShapeId, ShapeSpec } from '@/engine/core/types';

/**
 * "Labirin Warna" — the colors & shapes world (ported from the Petualangan
 * Pintar ocean world, renamed because the content is about bangun datar and
 * warna, not the sea). Every level is a "pick one card" question
 * (tap-answer) whose cards are colored geometric shapes drawn as SVG (see
 * engine/ui/Shape).
 *
 * Ten slots, each a POOL of interchangeable variants — the shell rolls one
 * variant per slot on every play and every "Main Lagi", so the world stays
 * fresh instead of asking the same seven questions forever:
 *   1–2   Cari Bentuk      (warna sama, pilih bentuk yang disebut)
 *   3–4   Cari Warna       (bentuk sama, pilih warna yang disebut)
 *   5     Yang Beda Sendiri (tiga sama, satu berbeda)
 *   6–7   Bentuk & Warna   (harus cocok DUA ciri sekaligus)
 *   8–10  Pola Ajaib       (tiga level pola: AB, lalu AAB/ABB, lalu ABC)
 *
 * Patterns get three of the ten slots (25 variants) because they are the
 * world's real thinking exercise. Every pattern is exactly six cells long so
 * the row — and the "?" box at its end — stays on one line on a small phone.
 *
 * Design rules:
 * - Decoys are deliberate look-alikes in SHAPE (kotak/ketupat,
 *   lingkaran/oval, bintang/hati) so the child must really discriminate.
 * - COLORS, however, must never be ambiguous: orange was dropped entirely
 *   because kuning vs oranye is unreadable on a phone, and merah/pink are
 *   never used against each other in a color-naming question. The palette
 *   below is seven clearly separated hues.
 */

// Palette — vivid, well-separated hues (no orange; see note above).
const MERAH = '#E53935';
const BIRU = '#2196F3';
const KUNING = '#FFD400';
const HIJAU = '#43A047';
const UNGU = '#8E24AA';
const PINK = '#F06292';
const COKLAT = '#8D6E63';

/* ---------- tiny builders (still plain typed data, just less repetition) ---------- */

const sh = (kind: ShapeId, color: string): ShapeSpec => ({ kind, color });

type Level = GameLevel<'tap-answer'>;

/**
 * A pick-one-card level. First spec is the correct card, the rest are decoys;
 * the template shuffles the order at play time.
 */
function pilih(id: string, narration: string, cards: ShapeSpec[]): Level {
  const [right, ...wrong] = cards;
  return {
    id,
    narration,
    data: {
      choices: [
        { id: 'a', shape: right!, correct: true },
        ...wrong.map((s, i) => ({ id: `d${i}`, shape: s })),
      ],
    },
  };
}

/** "Tiga sama, satu berbeda" — three identical cards plus the odd one out. */
function beda(id: string, narration: string, odd: ShapeSpec, same: ShapeSpec): Level {
  return {
    id,
    narration,
    data: {
      choices: [
        { id: 'a', shape: odd, correct: true },
        { id: 'b', shape: same },
        { id: 'c', shape: same },
        { id: 'd', shape: same },
      ],
    },
  };
}

const POLA_NARRATION = 'Lihat polanya baik-baik. Bentuk apa selanjutnya?';

/**
 * "Pola Ajaib": repeat `unit` `reps` times, blank out the final cell, and ask
 * the child to pick the shape that belongs there. `decoys` are the wrong
 * cards (usually: the previous shape, the right shape in the wrong color, the
 * right color in the wrong shape).
 */
function pola(id: string, unit: ShapeSpec[], reps: number, decoys: ShapeSpec[]): Level {
  const cells: (ShapeSpec | null)[] = [];
  for (let r = 0; r < reps; r += 1) cells.push(...unit);
  const answer = cells[cells.length - 1] as ShapeSpec;
  cells[cells.length - 1] = null;
  return {
    id,
    narration: POLA_NARRATION,
    data: {
      sequence: cells,
      choices: [
        { id: 'a', shape: answer, correct: true },
        ...decoys.map((s, i) => ({ id: `d${i}`, shape: s })),
      ],
    },
  };
}

const bentukQ = (bentuk: string) => `Semua warnanya sama. Sentuh bentuk ${bentuk}!`;
const warnaQ = (warna: string) => `Semua bentuknya sama. Sentuh warna ${warna}!`;
const duaQ = (bentuk: string, warna: string) => `Sentuh ${bentuk} yang berwarna ${warna}!`;

/* ---------- levels ---------- */

// Slot 1 & 2 — Cari Bentuk: one color everywhere, so only the shape matters.
const cariBentukA: Level[] = [
  pilih('l1', bentukQ('segitiga'), [
    sh('segitiga', BIRU),
    sh('kotak', BIRU),
    sh('ketupat', BIRU),
    sh('lingkaran', BIRU),
  ]),
  pilih('l1', bentukQ('bintang'), [
    sh('bintang', MERAH),
    sh('hati', MERAH),
    sh('segitiga', MERAH),
    sh('lingkaran', MERAH),
  ]),
  pilih('l1', bentukQ('lingkaran'), [
    sh('lingkaran', HIJAU),
    sh('oval', HIJAU),
    sh('ketupat', HIJAU),
    sh('kotak', HIJAU),
  ]),
  pilih('l1', bentukQ('kotak'), [
    sh('kotak', UNGU),
    sh('ketupat', UNGU),
    sh('segitiga', UNGU),
    sh('oval', UNGU),
  ]),
  pilih('l1', bentukQ('hati'), [
    sh('hati', PINK),
    sh('bintang', PINK),
    sh('lingkaran', PINK),
    sh('segitiga', PINK),
  ]),
  pilih('l1', bentukQ('ketupat'), [
    sh('ketupat', KUNING),
    sh('kotak', KUNING),
    sh('segitiga', KUNING),
    sh('bintang', KUNING),
  ]),
];

const cariBentukB: Level[] = [
  pilih('l2', bentukQ('oval'), [
    sh('oval', BIRU),
    sh('lingkaran', BIRU),
    sh('kotak', BIRU),
    sh('hati', BIRU),
  ]),
  pilih('l2', bentukQ('kotak'), [
    sh('kotak', HIJAU),
    sh('ketupat', HIJAU),
    sh('oval', HIJAU),
    sh('bintang', HIJAU),
  ]),
  pilih('l2', bentukQ('bintang'), [
    sh('bintang', UNGU),
    sh('hati', UNGU),
    sh('ketupat', UNGU),
    sh('kotak', UNGU),
  ]),
  pilih('l2', bentukQ('segitiga'), [
    sh('segitiga', MERAH),
    sh('ketupat', MERAH),
    sh('bintang', MERAH),
    sh('oval', MERAH),
  ]),
  pilih('l2', bentukQ('hati'), [
    sh('hati', KUNING),
    sh('lingkaran', KUNING),
    sh('oval', KUNING),
    sh('bintang', KUNING),
  ]),
  pilih('l2', bentukQ('lingkaran'), [
    sh('lingkaran', COKLAT),
    sh('oval', COKLAT),
    sh('ketupat', COKLAT),
    sh('hati', COKLAT),
  ]),
];

// Slot 3 & 4 — Cari Warna: one shape everywhere, so only the color matters.
const cariWarnaA: Level[] = [
  pilih('l3', warnaQ('biru'), [
    sh('lingkaran', BIRU),
    sh('lingkaran', UNGU),
    sh('lingkaran', HIJAU),
    sh('lingkaran', KUNING),
  ]),
  pilih('l3', warnaQ('kuning'), [
    sh('bintang', KUNING),
    sh('bintang', HIJAU),
    sh('bintang', BIRU),
    sh('bintang', COKLAT),
  ]),
  pilih('l3', warnaQ('merah'), [
    sh('hati', MERAH),
    sh('hati', BIRU),
    sh('hati', HIJAU),
    sh('hati', KUNING),
  ]),
  pilih('l3', warnaQ('hijau'), [
    sh('kotak', HIJAU),
    sh('kotak', BIRU),
    sh('kotak', KUNING),
    sh('kotak', UNGU),
  ]),
  pilih('l3', warnaQ('ungu'), [
    sh('ketupat', UNGU),
    sh('ketupat', BIRU),
    sh('ketupat', COKLAT),
    sh('ketupat', KUNING),
  ]),
  pilih('l3', warnaQ('merah muda'), [
    sh('oval', PINK),
    sh('oval', KUNING),
    sh('oval', HIJAU),
    sh('oval', BIRU),
  ]),
];

const cariWarnaB: Level[] = [
  pilih('l4', warnaQ('hijau'), [
    sh('segitiga', HIJAU),
    sh('segitiga', KUNING),
    sh('segitiga', MERAH),
    sh('segitiga', BIRU),
  ]),
  pilih('l4', warnaQ('merah'), [
    sh('bintang', MERAH),
    sh('bintang', KUNING),
    sh('bintang', BIRU),
    sh('bintang', UNGU),
  ]),
  pilih('l4', warnaQ('biru'), [
    sh('kotak', BIRU),
    sh('kotak', HIJAU),
    sh('kotak', MERAH),
    sh('kotak', COKLAT),
  ]),
  pilih('l4', warnaQ('kuning'), [
    sh('ketupat', KUNING),
    sh('ketupat', MERAH),
    sh('ketupat', HIJAU),
    sh('ketupat', UNGU),
  ]),
  pilih('l4', warnaQ('ungu'), [
    sh('hati', UNGU),
    sh('hati', MERAH),
    sh('hati', BIRU),
    sh('hati', KUNING),
  ]),
  pilih('l4', warnaQ('coklat'), [
    sh('lingkaran', COKLAT),
    sh('lingkaran', HIJAU),
    sh('lingkaran', BIRU),
    sh('lingkaran', KUNING),
  ]),
];

// Slot 5 — Yang Beda Sendiri: half the variants differ by shape, half by
// color, so the child can't guess which feature to watch.
const BEDA_BENTUK = 'Tiga bentuknya sama, satu berbeda. Sentuh yang berbeda!';
const BEDA_WARNA = 'Tiga warnanya sama, satu berbeda. Sentuh yang berbeda!';

const bedaSendiri: Level[] = [
  beda('l5', BEDA_BENTUK, sh('ketupat', MERAH), sh('kotak', MERAH)),
  beda('l5', BEDA_BENTUK, sh('oval', BIRU), sh('lingkaran', BIRU)),
  beda('l5', BEDA_BENTUK, sh('hati', KUNING), sh('bintang', KUNING)),
  beda('l5', BEDA_BENTUK, sh('segitiga', HIJAU), sh('ketupat', HIJAU)),
  beda('l5', BEDA_WARNA, sh('bintang', MERAH), sh('bintang', BIRU)),
  beda('l5', BEDA_WARNA, sh('kotak', KUNING), sh('kotak', UNGU)),
  beda('l5', BEDA_WARNA, sh('lingkaran', HIJAU), sh('lingkaran', COKLAT)),
  beda('l5', BEDA_WARNA, sh('hati', BIRU), sh('hati', PINK)),
];

// Slot 6 & 7 — Bentuk & Warna: each decoy matches exactly one feature.
const duaCiriA: Level[] = [
  pilih('l6', duaQ('hati', 'merah'), [
    sh('hati', MERAH),
    sh('hati', UNGU),
    sh('lingkaran', MERAH),
    sh('kotak', BIRU),
  ]),
  pilih('l6', duaQ('kotak', 'kuning'), [
    sh('kotak', KUNING),
    sh('kotak', HIJAU),
    sh('ketupat', KUNING),
    sh('segitiga', BIRU),
  ]),
  pilih('l6', duaQ('bintang', 'biru'), [
    sh('bintang', BIRU),
    sh('bintang', HIJAU),
    sh('hati', BIRU),
    sh('kotak', MERAH),
  ]),
  pilih('l6', duaQ('lingkaran', 'hijau'), [
    sh('lingkaran', HIJAU),
    sh('lingkaran', KUNING),
    sh('oval', HIJAU),
    sh('ketupat', MERAH),
  ]),
  pilih('l6', duaQ('segitiga', 'ungu'), [
    sh('segitiga', UNGU),
    sh('segitiga', COKLAT),
    sh('bintang', UNGU),
    sh('kotak', KUNING),
  ]),
  pilih('l6', duaQ('ketupat', 'merah muda'), [
    sh('ketupat', PINK),
    sh('ketupat', BIRU),
    sh('kotak', PINK),
    sh('lingkaran', HIJAU),
  ]),
];

const duaCiriB: Level[] = [
  pilih('l7', duaQ('oval', 'biru'), [
    sh('oval', BIRU),
    sh('oval', MERAH),
    sh('lingkaran', BIRU),
    sh('hati', KUNING),
  ]),
  pilih('l7', duaQ('hati', 'kuning'), [
    sh('hati', KUNING),
    sh('hati', HIJAU),
    sh('bintang', KUNING),
    sh('oval', MERAH),
  ]),
  pilih('l7', duaQ('kotak', 'merah'), [
    sh('kotak', MERAH),
    sh('kotak', BIRU),
    sh('ketupat', MERAH),
    sh('bintang', HIJAU),
  ]),
  pilih('l7', duaQ('bintang', 'hijau'), [
    sh('bintang', HIJAU),
    sh('bintang', COKLAT),
    sh('segitiga', HIJAU),
    sh('lingkaran', UNGU),
  ]),
  pilih('l7', duaQ('lingkaran', 'ungu'), [
    sh('lingkaran', UNGU),
    sh('lingkaran', BIRU),
    sh('oval', UNGU),
    sh('kotak', KUNING),
  ]),
  pilih('l7', duaQ('segitiga', 'coklat'), [
    sh('segitiga', COKLAT),
    sh('segitiga', HIJAU),
    sh('ketupat', COKLAT),
    sh('hati', BIRU),
  ]),
];

// Slot 8 — Pola Ajaib AB AB AB ?: the easiest rhythm, two alternating cards.
const polaAB: Level[] = [
  pola('l8', [sh('lingkaran', MERAH), sh('bintang', KUNING)], 3, [
    sh('lingkaran', MERAH),
    sh('bintang', HIJAU),
    sh('kotak', KUNING),
  ]),
  pola('l8', [sh('kotak', BIRU), sh('segitiga', HIJAU)], 3, [
    sh('kotak', BIRU),
    sh('segitiga', KUNING),
    sh('ketupat', HIJAU),
  ]),
  pola('l8', [sh('hati', PINK), sh('lingkaran', UNGU)], 3, [
    sh('hati', PINK),
    sh('lingkaran', HIJAU),
    sh('oval', UNGU),
  ]),
  pola('l8', [sh('bintang', KUNING), sh('ketupat', BIRU)], 3, [
    sh('bintang', KUNING),
    sh('ketupat', MERAH),
    sh('kotak', BIRU),
  ]),
  pola('l8', [sh('segitiga', MERAH), sh('oval', HIJAU)], 3, [
    sh('segitiga', MERAH),
    sh('oval', BIRU),
    sh('lingkaran', HIJAU),
  ]),
  pola('l8', [sh('kotak', COKLAT), sh('lingkaran', KUNING)], 3, [
    sh('kotak', COKLAT),
    sh('lingkaran', MERAH),
    sh('bintang', KUNING),
  ]),
  pola('l8', [sh('hati', MERAH), sh('kotak', BIRU)], 3, [
    sh('hati', MERAH),
    sh('kotak', HIJAU),
    sh('ketupat', BIRU),
  ]),
  pola('l8', [sh('oval', UNGU), sh('bintang', KUNING)], 3, [
    sh('oval', UNGU),
    sh('bintang', BIRU),
    sh('hati', KUNING),
  ]),
  pola('l8', [sh('ketupat', HIJAU), sh('segitiga', PINK)], 3, [
    sh('ketupat', HIJAU),
    sh('segitiga', BIRU),
    sh('kotak', PINK),
  ]),
];

// Slot 9 — Pola Ajaib AAB / ABB: one card repeats, so the child can't just
// alternate — they have to hear the rhythm.
const polaGanda: Level[] = [
  pola('l9', [sh('hati', PINK), sh('hati', PINK), sh('bintang', UNGU)], 2, [
    sh('hati', PINK),
    sh('bintang', KUNING),
    sh('kotak', UNGU),
  ]),
  pola('l9', [sh('kotak', KUNING), sh('kotak', KUNING), sh('lingkaran', HIJAU)], 2, [
    sh('kotak', KUNING),
    sh('lingkaran', MERAH),
    sh('oval', HIJAU),
  ]),
  pola('l9', [sh('segitiga', BIRU), sh('segitiga', BIRU), sh('hati', MERAH)], 2, [
    sh('segitiga', BIRU),
    sh('hati', HIJAU),
    sh('bintang', MERAH),
  ]),
  pola('l9', [sh('bintang', KUNING), sh('bintang', KUNING), sh('ketupat', COKLAT)], 2, [
    sh('bintang', KUNING),
    sh('ketupat', BIRU),
    sh('kotak', COKLAT),
  ]),
  pola('l9', [sh('oval', PINK), sh('oval', PINK), sh('kotak', BIRU)], 2, [
    sh('oval', PINK),
    sh('kotak', KUNING),
    sh('ketupat', BIRU),
  ]),
  pola('l9', [sh('lingkaran', MERAH), sh('kotak', BIRU), sh('kotak', BIRU)], 2, [
    sh('lingkaran', MERAH),
    sh('kotak', HIJAU),
    sh('ketupat', BIRU),
  ]),
  pola('l9', [sh('bintang', HIJAU), sh('oval', UNGU), sh('oval', UNGU)], 2, [
    sh('bintang', HIJAU),
    sh('oval', KUNING),
    sh('lingkaran', UNGU),
  ]),
  pola('l9', [sh('hati', MERAH), sh('segitiga', KUNING), sh('segitiga', KUNING)], 2, [
    sh('hati', MERAH),
    sh('segitiga', BIRU),
    sh('ketupat', KUNING),
  ]),
];

// Slot 10 — Pola Ajaib ABC: three different cards before the pattern repeats,
// the hardest rhythm in the world.
const polaTiga: Level[] = [
  pola('l10', [sh('lingkaran', MERAH), sh('kotak', BIRU), sh('bintang', KUNING)], 2, [
    sh('lingkaran', MERAH),
    sh('kotak', BIRU),
    sh('bintang', HIJAU),
  ]),
  pola('l10', [sh('segitiga', HIJAU), sh('oval', BIRU), sh('ketupat', MERAH)], 2, [
    sh('segitiga', HIJAU),
    sh('oval', BIRU),
    sh('ketupat', KUNING),
  ]),
  pola('l10', [sh('bintang', KUNING), sh('hati', MERAH), sh('kotak', BIRU)], 2, [
    sh('bintang', KUNING),
    sh('hati', MERAH),
    sh('kotak', HIJAU),
  ]),
  pola('l10', [sh('hati', PINK), sh('lingkaran', HIJAU), sh('segitiga', UNGU)], 2, [
    sh('hati', PINK),
    sh('lingkaran', HIJAU),
    sh('segitiga', KUNING),
  ]),
  pola('l10', [sh('kotak', COKLAT), sh('bintang', KUNING), sh('oval', BIRU)], 2, [
    sh('kotak', COKLAT),
    sh('bintang', KUNING),
    sh('oval', MERAH),
  ]),
  pola('l10', [sh('ketupat', UNGU), sh('segitiga', KUNING), sh('hati', MERAH)], 2, [
    sh('ketupat', UNGU),
    sh('segitiga', KUNING),
    sh('hati', BIRU),
  ]),
  pola('l10', [sh('oval', HIJAU), sh('kotak', MERAH), sh('bintang', BIRU)], 2, [
    sh('oval', HIJAU),
    sh('kotak', MERAH),
    sh('bintang', KUNING),
  ]),
  pola('l10', [sh('lingkaran', BIRU), sh('hati', KUNING), sh('ketupat', HIJAU)], 2, [
    sh('lingkaran', BIRU),
    sh('hati', KUNING),
    sh('ketupat', PINK),
  ]),
];

const config: GameConfig<'tap-answer'> = {
  id: 'labirin-warna',
  group: 'tk',
  title: 'Labirin Warna',
  emoji: '🎨',
  freeDemo: true,
  template: 'tap-answer',
  levels: [
    cariBentukA,
    cariBentukB,
    cariWarnaA,
    cariWarnaB,
    bedaSendiri,
    duaCiriA,
    duaCiriB,
    polaAB,
    polaGanda,
    polaTiga,
  ],
};

export default config;
