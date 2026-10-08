import type {
  FoodKind,
  Frac,
  GameConfig,
  GameLevel,
  KitchenChoice,
  KitchenStep,
  KitchenTask,
  LevelStamp,
} from '@/engine/core/types';
import { decimalText, desimal, pecahan } from '@/games/numbers';

/**
 * "Bagi Kue" (SD Kelas 3 & 4, `sd2`) — versi PREMIUM "Toko Kue Bu Beruang"
 * (docs/rencana-game-sd-kelas-3-4.md bagian 2 no. 3 + 2b.3 no. 3): pecahan &
 * desimal awal.
 *
 * Pelanggan hewan datang memesan; anak MEMEGANG pecahannya (template
 * `fraction-kitchen`). Keputusan pemilik 2026-10-08:
 * - versi PENUH: gesek untuk memotong + seret potongan ke piring + TUMPUK
 *   potongan untuk membandingkan;
 * - 9 slot berurutan TETAP (kls 3 → kls 4 dari slot 6), tanpa `sessionLevels`;
 * - Bu Beruang = seni `bear`, pelanggan = hewan berseni WebP yang sudah ada,
 *   makanan digambar SVG engine — nol aset baru;
 * - bentuk: LINGKARAN (kue, pizza) + PERSEGI PANJANG (martabak, cokelat).
 *
 * SLOT
 *   l1 kenal pecahan: gambar → lambang, lambang → gambar (pengecoh potongan
 *      TIDAK sama besar)
 *   l2 potong sesuai pesanan (gesek, seret ke piring)
 *   l3 pecahan dari kumpulan (½ dari 8 kue kering)
 *   l4 bandingkan pecahan satuan dengan menumpuk (½ vs ¼)
 *   l5 pecahan di garis bilangan 0–1
 *   l6 (kls 4) pecahan senilai — pesan ½, kue sudah dipotong empat
 *   l7 bandingkan pecahan berpenyebut sama dengan menumpuk
 *   l8 persepuluhan ↔ desimal (gelas jus, 0,5)
 *   l9 MISI BESAR pesta ulang tahun: tiga pesanan berturut-turut
 *
 * - Narasi TANPA digit (`pecahan()`, `desimal()`); lambang bertumpuk ada di
 *   gelembung pesanan & kartu. Narasi tidak pernah memuat jawabannya.
 * - Pengecoh dari kesalahan khas: bagian yang SUDAH dimakan (sisa), pembilang
 *   & penyebut tertukar, potongan tak sama besar, "¼ > ½ karena 4 > 2"
 *   (kartu ¼ selalu ada di soal tumpuk), 0,5 dibaca 5/100 (→ 0,05), dan
 *   bagian KOSONG gelas (0,3 untuk 0,7). Builder melempar error untuk data
 *   ambigu (dua kartu bernilai sama, jawaban di luar gambar, dsb.).
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = GameLevel<'fraction-kitchen'>;

const ANIMAL: Record<string, string> = {
  rabbit: 'Kelinci',
  cat: 'Kucing',
  lion: 'Singa',
  panda: 'Panda',
  giraffe: 'Jerapah',
  monkey: 'Monyet',
  penguin: 'Pinguin',
  koala: 'Koala',
  zebra: 'Zebra',
  duck: 'Bebek',
  elephant: 'Gajah',
  tiger: 'Harimau',
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🧁', label: 'Mangkuk' },
  l2: { emoji: '🍰', label: 'Kue' },
  l3: { emoji: '🍪', label: 'Kue kering' },
  l4: { emoji: '🥧', label: 'Pai' },
  l5: { emoji: '🍒', label: 'Ceri' },
  l6: { emoji: '🍩', label: 'Donat' },
  l7: { emoji: '🍫', label: 'Cokelat' },
  l8: { emoji: '🧃', label: 'Jus' },
  l9: { emoji: '🎂', label: 'Pesta' },
};

/* ---------- pemeriksa ---------- */

function fail(msg: string): never {
  throw new Error(`Bagi Kue: ${msg}`);
}

function checkFrac(f: Frac, max = 10) {
  if (!Number.isInteger(f.n) || !Number.isInteger(f.d) || f.n < 1 || f.n >= f.d || f.d > max) {
    fail(`pecahan ${f.n}/${f.d} tidak sah (0 < n < d ≤ ${max})`);
  }
}

const sameValue = (a: Frac, b: Frac) => a.n * b.d === b.n * a.d;

function checkCustomer(id: string) {
  if (!ANIMAL[id]) fail(`pelanggan "${id}" belum punya nama`);
}

/** Potongan sebanyak ini masih lega disentuh di HP 320 px. */
function checkCut(food: FoodKind, d: number) {
  const max = food === 'kue' || food === 'pizza' ? 8 : 6;
  if (d > max) fail(`${food} dipotong ${d} — paling banyak ${max}`);
}

function slot(id: string, ...variants: Level[]): Level[] {
  if (variants.length !== 6) fail(`${id} harus 6 varian, ada ${variants.length}`);
  return variants.map((v) => ({ ...v, id, stamp: STAMP[id] }));
}

const level = (narration: string, ...steps: KitchenStep[]): Level => ({
  id: '',
  narration,
  data: { steps },
});

const step = (customer: string, task: KitchenTask, say?: string): KitchenStep => {
  checkCustomer(customer);
  return say ? { customer, task, say } : { customer, task };
};

/** Pilih `count` pengecoh pertama yang sah dari kandidat (urutan = prioritas). */
function pickDecoys<T>(cands: T[], ok: (c: T) => boolean, key: (c: T) => string, count = 2): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const c of cands) {
    if (!ok(c) || seen.has(key(c))) continue;
    seen.add(key(c));
    out.push(c);
    if (out.length === count) return out;
  }
  return fail(`pengecoh kurang dari ${count}`);
}

/* ---------- l1: kenal pecahan ---------- */

/** Gambar → lambang: `k` dari `d` potong masih di piring. */
function name(customer: string, food: FoodKind, k: number, d: number): Level {
  const ans: Frac = { n: k, d };
  checkFrac(ans);
  const decoys = pickDecoys<Frac>(
    [
      { n: d - k, d }, // bagian yang SUDAH dimakan
      { n: d, d: k }, // pembilang & penyebut tertukar
      { n: k, d: d - k }, // yang ada per yang kosong
      { n: k, d: d + 1 },
    ],
    (f) => f.n > 0 && f.d > 0 && !sameValue(f, ans),
    (f) => `${f.n}/${f.d}`,
  );
  const choices: KitchenChoice[] = [{ frac: ans, correct: true }, ...decoys.map((frac) => ({ frac }))];
  return level(
    'Ada yang sudah dimakan! Pecahan berapa yang masih ada di piring?',
    step(customer, { kind: 'pick', picture: { food, d, show: k }, choices }),
  );
}

/** Lambang → gambar, dengan pengecoh potongan TIDAK sama besar. */
function which(customer: string, food: FoodKind, n: number, d: number): Level {
  checkFrac({ n, d });
  if (d - n === n) fail(`${n}/${d}: sisa sama dengan pesanan, pengecoh kembar`);
  const choices: KitchenChoice[] = [
    { picture: { food, d, show: n }, correct: true },
    { picture: { food, d, show: n, uneven: true } }, // "apakah ini seperempat?"
    { picture: { food, d, show: d - n } }, // gambar sisanya
  ];
  return level('Mana gambar yang cocok dengan pesanannya?', step(customer, { kind: 'pick', show: { n, d }, choices }));
}

/* ---------- l2 & l6: potong & berikan ---------- */

const FOOD_WORD: Record<FoodKind, string> = { kue: 'kue', pizza: 'pizza', martabak: 'martabak', cokelat: 'cokelat' };

function cut(customer: string, food: FoodKind, n: number, d: number): Level {
  checkFrac({ n, d });
  checkCut(food, d);
  checkCustomer(customer);
  return level(
    `${ANIMAL[customer]} pesan ${pecahan(n, d)} ${FOOD_WORD[food]}. Potong lalu berikan!`,
    step(customer, { kind: 'cut', food, order: { n, d } }),
  );
}

/** Pecahan senilai: pesan n/d, makanannya SUDAH dipotong `precut`. */
function equiv(customer: string, food: FoodKind, n: number, d: number, precut: number): Level {
  checkFrac({ n, d });
  checkCut(food, precut);
  if (precut % d !== 0 || precut === d) fail(`${n}/${d} tak bisa dari ${precut} potong yang berbeda`);
  return level(
    'Sudah dipotong-potong! Berikan sesuai pesanannya!',
    step(customer, { kind: 'cut', food, order: { n, d }, precut }),
  );
}

/* ---------- l3: pecahan dari kumpulan ---------- */

const SHARE_Q = 'Berapa kue kering di piring yang menyala?';

function shareTask(cookies: number, plates: number, take: number): KitchenTask {
  if (plates < 2 || plates > 4) fail(`${plates} piring`);
  if (cookies > 12 || cookies % plates !== 0) fail(`${cookies} kue tak bisa dibagi rata ke ${plates} piring`);
  if (take < 1 || take >= plates) fail(`ambil ${take} dari ${plates} piring`);
  const per = cookies / plates;
  const ans = per * take;
  const decoys = pickDecoys<number>(
    [take > 1 ? per : -1, cookies, cookies - ans, plates, ans + per, take],
    (v) => v > 0 && v !== ans,
    String,
  );
  return {
    kind: 'share',
    cookies,
    plates,
    take,
    question: SHARE_Q,
    choices: [{ value: ans, correct: true }, ...decoys.map((value) => ({ value }))],
  };
}

const share = (customer: string, cookies: number, plates: number, take: number) =>
  level('Bagi kue kering sama rata ke semua piring!', step(customer, shareTask(cookies, plates, take)));

/* ---------- l4 & l7: tumpuk untuk membandingkan ---------- */

const STACK_SAY = 'Tumpuk satu potongan di atas yang lain!';
const Q_BIG = 'Mana potongan yang lebih besar?';
const Q_SMALL = 'Mana potongan yang lebih kecil?';

function stack(customer: string, food: FoodKind, a: Frac, b: Frac, want: 'besar' | 'kecil', unit: boolean): Level {
  checkFrac(a);
  checkFrac(b);
  checkCut(food, Math.max(a.d, b.d));
  if (unit && (a.n !== 1 || b.n !== 1 || a.d === b.d)) fail(`${a.n}/${a.d} vs ${b.n}/${b.d} bukan dua pecahan satuan`);
  if (!unit && (a.d !== b.d || a.n === b.n)) fail(`${a.n}/${a.d} vs ${b.n}/${b.d} bukan penyebut sama`);
  const diff = a.n * b.d - b.n * a.d;
  if (diff === 0) fail('dua potongan sama besar — pakai soal senilai');
  const answer = (diff > 0) === (want === 'besar') ? 'a' : 'b';
  return level(
    STACK_SAY,
    step(customer, { kind: 'stack', food, a, b, question: want === 'besar' ? Q_BIG : Q_SMALL, answer }),
  );
}

const unitCmp = (c: string, food: FoodKind, a: number, b: number, want: 'besar' | 'kecil') =>
  stack(c, food, { n: 1, d: a }, { n: 1, d: b }, want, true);

const sameCmp = (c: string, food: FoodKind, d: number, a: number, b: number, want: 'besar' | 'kecil') =>
  stack(c, food, { n: a, d }, { n: b, d }, want, false);

/* ---------- l5: garis bilangan ---------- */

function line(customer: string, n: number, d: number): Level {
  checkFrac({ n, d }, 8);
  return level('Taruh ceri di garis bilangan sesuai pesanan!', step(customer, { kind: 'line', order: { n, d } }));
}

/* ---------- l8: gelas jus ---------- */

function checkTenths(t: number) {
  if (!Number.isInteger(t) || t < 1 || t > 9) fail(`${t} persepuluh`);
}

function fillTask(tenths: number): KitchenTask {
  checkTenths(tenths);
  return { kind: 'juice', mode: 'fill', tenths };
}

function fill(customer: string, tenths: number): Level {
  checkTenths(tenths);
  return level(
    `${ANIMAL[customer]} pesan jus ${desimal(tenths / 10)} liter. Isi gelasnya!`,
    step(customer, fillTask(tenths)),
  );
}

const READ_Q = 'Gelas ini berisi berapa liter? Pilih desimalnya!';

function read(customer: string, tenths: number): Level {
  checkTenths(tenths);
  if (tenths === 5) fail('0,5: bagian kosongnya sama, pengecoh kembar');
  const choices = [
    { text: decimalText(tenths / 10), correct: true },
    { text: decimalText(tenths / 100, 2) }, // dibaca per seratus
    { text: decimalText((10 - tenths) / 10) }, // bagian kosong gelas
  ];
  return level(READ_Q, step(customer, { kind: 'juice', mode: 'read', tenths, question: READ_Q, choices }));
}

/* ---------- l9: misi besar ---------- */

type CutSpec = [customer: string, food: FoodKind, n: number, d: number];
type ShareSpec = [customer: string, cookies: number, plates: number, take: number];

function mission([c1, food, n, d]: CutSpec, [c2, cookies, plates, take]: ShareSpec, [c3, tenths]: [string, number]): Level {
  checkFrac({ n, d });
  checkCut(food, d);
  if (new Set([c1, c2, c3]).size !== 3) fail('misi butuh tiga pelanggan berbeda');
  return level(
    'Pesta ulang tahun! Ada tiga pesanan. Pertama, potong sesuai pesanan!',
    step(c1, { kind: 'cut', food, order: { n, d } }),
    step(c2, shareTask(cookies, plates, take), 'Pesanan kedua: bagi kue kering sama rata!'),
    step(c3, fillTask(tenths), 'Pesanan terakhir: isi gelas jusnya sesuai pesanan!'),
  );
}

const config: GameConfig<'fraction-kitchen'> = {
  id: 'bagi-kue',
  group: 'sd2',
  title: 'Bagi Kue',
  emoji: '🍰',
  template: 'fraction-kitchen',
  project: { title: 'Etalase Toko Kue' },
  hints: true,
  levels: [
    slot(
      'l1',
      name('rabbit', 'kue', 3, 4),
      which('lion', 'kue', 1, 4),
      name('panda', 'martabak', 2, 3),
      which('monkey', 'cokelat', 1, 3),
      name('cat', 'pizza', 5, 6),
      which('koala', 'pizza', 2, 5),
    ),
    slot(
      'l2',
      cut('rabbit', 'kue', 1, 4),
      cut('cat', 'pizza', 3, 4),
      cut('penguin', 'martabak', 1, 3),
      cut('giraffe', 'kue', 2, 3),
      cut('zebra', 'cokelat', 2, 5),
      cut('duck', 'pizza', 5, 6),
    ),
    slot(
      'l3',
      share('koala', 8, 2, 1),
      share('rabbit', 12, 4, 1),
      share('cat', 9, 3, 1),
      share('lion', 8, 4, 3),
      share('panda', 6, 3, 2),
      share('monkey', 12, 3, 2),
    ),
    slot(
      'l4',
      unitCmp('cat', 'kue', 2, 4, 'besar'),
      unitCmp('rabbit', 'pizza', 3, 6, 'kecil'),
      unitCmp('panda', 'martabak', 4, 2, 'besar'),
      unitCmp('lion', 'cokelat', 5, 3, 'besar'),
      unitCmp('koala', 'kue', 8, 4, 'kecil'),
      unitCmp('giraffe', 'pizza', 2, 3, 'kecil'),
    ),
    slot(
      'l5',
      line('cat', 1, 4),
      line('rabbit', 3, 4),
      line('panda', 2, 3),
      line('lion', 1, 3),
      line('giraffe', 3, 5),
      line('koala', 5, 6),
    ),
    slot(
      'l6',
      equiv('cat', 'kue', 1, 2, 4),
      equiv('rabbit', 'pizza', 1, 2, 6),
      equiv('penguin', 'martabak', 1, 3, 6),
      equiv('monkey', 'pizza', 1, 4, 8),
      equiv('zebra', 'cokelat', 2, 3, 6),
      equiv('lion', 'kue', 3, 4, 8),
    ),
    slot(
      'l7',
      sameCmp('duck', 'kue', 5, 3, 2, 'besar'),
      sameCmp('tiger', 'martabak', 6, 2, 5, 'besar'),
      sameCmp('cat', 'pizza', 8, 3, 5, 'kecil'),
      sameCmp('elephant', 'cokelat', 5, 4, 2, 'kecil'),
      sameCmp('rabbit', 'kue', 4, 2, 3, 'besar'),
      sameCmp('panda', 'pizza', 6, 5, 4, 'kecil'),
    ),
    slot('l8', fill('panda', 5), read('cat', 7), fill('rabbit', 3), read('lion', 4), fill('koala', 8), read('giraffe', 2)),
    slot(
      'l9',
      mission(['rabbit', 'kue', 1, 4], ['cat', 8, 2, 1], ['panda', 6]),
      mission(['lion', 'pizza', 3, 4], ['koala', 12, 4, 1], ['monkey', 4]),
      mission(['giraffe', 'martabak', 2, 3], ['duck', 9, 3, 2], ['zebra', 7]),
      mission(['penguin', 'pizza', 5, 6], ['rabbit', 12, 3, 1], ['cat', 9]),
      mission(['monkey', 'kue', 2, 3], ['lion', 6, 2, 1], ['koala', 3]),
      mission(['panda', 'cokelat', 3, 5], ['giraffe', 8, 4, 3], ['duck', 5]),
    ),
  ],
};

export default config;
