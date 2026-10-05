import type { GameConfig, GameLevel, LevelSlot, Stage, TapChoice } from '@/engine/core/types';

/**
 * "Tangga Membaca" (SD Kelas 1 & 2) — jenjang membaca BERURUTAN, delapan
 * tahap di peta jalan berkelok (`stageMap`). Tahap berikutnya baru terbuka
 * setelah tahap sebelumnya selesai (keputusan pemilik 2026-10-05), jadi
 * orang tua bisa melihat sampai mana anaknya.
 *
 * Asal-usulnya: referensi game "Peta Galaksi" yang dikirim pemilik
 * (docs/rencana-referensi-galaksi.md, tahap 2). Yang diambil JENJANGNYA,
 * bukan galaksinya — dan jenjangnya mengikuti cara anak Indonesia belajar
 * membaca (suku kata dulu), bukan fonik bahasa Inggris.
 *
 * Bedanya dengan Suku Kata & Ejaan Jitu (keduanya tetap ada):
 *   - Suku Kata melengkapi potongan kata, Ejaan Jitu menyusun huruf.
 *   - Di sini anak MEMBACA tulisan utuh lalu menunjuk artinya (gambar), atau
 *     melihat gambar lalu memilih tulisan yang tepat — dan tingkat
 *     kesulitannya naik berurutan dari suku kata sampai kalimat.
 *
 * Aturan yang dijaga:
 *   - Narasi TIDAK PERNAH membacakan kata/kalimatnya. Kalau dibacakan, yang
 *     dilatih jadi mendengar, bukan membaca. Karena itu narasinya cuma empat
 *     kalimat ajakan, dipakai ulang di semua soal.
 *   - Hewan memakai seni WebP (`item`), tak pernah emoji.
 *   - Satu tahap = 6 slot (keputusan pemilik: 6 soal per main). Tiap slot
 *     berisi 1–2 varian kata yang tak dipakai slot lain di tahap yang sama,
 *     jadi satu kali main tak pernah mengulang kata.
 *   - Tahap selesai = keenam slotnya pernah dijawab (lihat `StageMap`).
 */

/* ---------- Kalimat narasi (satu-satunya yang direkam) ---------- */

const READ_SYL = 'Baca suku katanya. Gambar mana yang cocok?';
const READ_WORD = 'Baca katanya. Gambar mana yang cocok?';
const READ_SENT = 'Baca kalimatnya. Gambar mana yang cocok?';
const PICK_WRITE = 'Ini gambar apa? Pilih tulisan yang tepat!';

/* ---------- Kata ---------- */

interface Word {
  /** Tulisannya, HURUF BESAR; tanda "-" memisahkan suku kata (tahap 1). */
  text: string;
  emoji: string;
  item?: string;
  /** Dua tulisan pengecoh, kalau aturan otomatis tahapnya tak cocok. */
  alts?: [string, string];
}

const w = (text: string, emoji: string, item?: string, alts?: [string, string]): Word => ({
  text,
  emoji,
  item,
  alts,
});

/** Tahap 1 — suku kata terbuka, ditulis terpisah (BU-KU). */
const SUKU_KATA: Word[] = [
  w('BU-KU', '📕', 'book'),
  w('BO-LA', '⚽', 'ball'),
  w('TO-PI', '🧢', 'cap'),
  w('SA-PI', '🐮', 'cow'),
  w('KU-DA', '🐴', 'horse'),
  w('RO-TI', '🍞', 'bread'),
  w('SU-SU', '🥛', 'milk', ['SA-SU', 'SU-SI']),
  w('NA-SI', '🍚', 'rice'),
  w('KO-PI', '☕'),
  w('PA-LU', '🔨'),
  w('MA-DU', '🍯'),
  w('DA-DU', '🎲', undefined, ['DI-DU', 'DA-DI']),
];

/** Tahap 2 — kata dua suku terbuka, ditulis utuh. */
const KATA_PENDEK: Word[] = [
  w('SAPU', '🧹'),
  w('GIGI', '🦷', undefined, ['GAGI', 'GIGU']),
  w('DASI', '👔'),
  w('SATE', '🍢'),
  w('KADO', '🎁'),
  w('PETA', '🗺️'),
  w('CERI', '🍒', 'cherry'),
  w('KIWI', '🥝', 'kiwi', ['KAWI', 'KIWU']),
  w('PENA', '🖊️'),
  w('BAJU', '👕'),
  w('KUE', '🍰', undefined, ['KUA', 'KOE']),
  w('SOFA', '🛋️'),
];

/** Tahap 3 — kata tiga suku terbuka. */
const TIGA_SUKU: Word[] = [
  w('SEPATU', '👟', 'shoe'),
  w('SEPEDA', '🚲', 'bicycle'),
  w('KERETA', '🚆', 'train'),
  w('BONEKA', '🧸', 'teddy'),
  w('KELAPA', '🥥'),
  w('RADIO', '📻'),
  w('KAMERA', '📷'),
  w('PIANO', '🎹'),
  w('KOALA', '🐨', 'koala', ['KOALI', 'KUALA']),
  w('SELADA', '🥬'),
  w('PERAHU', '⛵'),
  w('KACAMATA', '👓'),
];

/** Tahap 4 — suku kata tertutup (berakhir konsonan). */
const TERTUTUP: Word[] = [
  w('KURSI', '🪑', 'chair'),
  w('PENSIL', '✏️', 'pencil'),
  w('WORTEL', '🥕', 'carrot'),
  w('BEBEK', '🦆', 'duck'),
  w('GAJAH', '🐘', 'elephant'),
  w('TELUR', '🥚', 'egg'),
  w('MOBIL', '🚗', 'car'),
  w('APEL', '🍎', 'apple'),
  w('MELON', '🍈', 'melon'),
  w('JERUK', '🍊', 'orange'),
  w('KUNCI', '🔑', 'key'),
  w('ROKET', '🚀'),
];

/** Tahap 5 — diftong ai, au, oi. Cuma delapan kata yang bisa digambar. */
const DIFTONG: Word[] = [
  w('PANTAI', '🏖️'),
  w('PULAU', '🏝️'),
  w('HARIMAU', '🐯', 'tiger'),
  w('RANTAI', '⛓️'),
  w('KOBOI', '🤠', undefined, ['KOBOY', 'KOBUI']),
  w('CABAI', '🌶️'),
  w('KEDAI', '🏪', 'shop'),
  w('GULAI', '🍛'),
];

/** Tahap 6 — gabungan huruf NG & NY. */
const NG_NY: Word[] = [
  w('BUNGA', '🌸', 'flower'),
  w('JAGUNG', '🌽', 'corn'),
  w('PAYUNG', '☂️', 'umbrella'),
  w('SINGA', '🦁', 'lion'),
  w('MONYET', '🐒', 'monkey'),
  w('KUCING', '🐱', 'cat'),
  w('TANGGA', '🪜'),
  w('BINTANG', '⭐'),
  w('PISANG', '🍌', 'banana'),
  w('SEMANGKA', '🍉', 'watermelon'),
  w('MANGGA', '🥭', 'mango'),
  w('PENGUIN', '🐧', 'penguin'),
];

/** Tahap 7 — klaster (dua konsonan berdampingan: TR, DR, BR, KR, ST…). */
const KLASTER: Word[] = [
  w('TRUK', '🚚', 'truck'),
  w('TRAKTOR', '🚜', 'tractor'),
  w('DRUM', '🥁'),
  w('BROKOLI', '🥦'),
  w('KRAYON', '🖍️'),
  w('BLUS', '👚'),
  w('STROBERI', '🍓', 'strawberry', ['SETROBERI', 'STOBERI']),
  w('ZEBRA', '🦓', 'zebra'),
  w('PLANET', '🪐'),
  w('KRISTAL', '💎'),
  w('SKUTER', '🛴', 'scooter'),
  w('PLESTER', '🩹'),
];

/* ---------- Pengecoh tulisan otomatis per tahap ---------- */

const VOWEL_SWAP: Record<string, string> = { A: 'I', I: 'U', U: 'A', E: 'O', O: 'E' };

/** Ganti vokal ke-n (dari kiri; negatif = dari kanan). */
function swapVowel(text: string, nth: number): string {
  const idx = [...text].map((c, i) => (VOWEL_SWAP[c] ? i : -1)).filter((i) => i >= 0);
  const at = idx[nth < 0 ? idx.length + nth : nth];
  if (at === undefined) return text;
  return text.slice(0, at) + VOWEL_SWAP[text[at]!] + text.slice(at + 1);
}

const isVowel = (c: string | undefined) => !!c && 'AIUEO'.includes(c);

type AltRule = (text: string) => [string, string];

/** Suku terbuka: vokal pertama atau terakhir tertukar. */
const openAlts: AltRule = (t) => [swapVowel(t, 0), swapVowel(t, -1)];

/** Suku tertutup: konsonan penutup pertama hilang, atau vokal tertukar. */
const closedAlts: AltRule = (t) => {
  let drop = t;
  for (let i = 1; i < t.length; i += 1) {
    const c = t[i]!;
    if (!isVowel(c) && isVowel(t[i - 1]) && (i === t.length - 1 || !isVowel(t[i + 1]))) {
      drop = t.slice(0, i) + t.slice(i + 1);
      break;
    }
  }
  return [drop, swapVowel(t, 0)];
};

/**
 * Diftong: vokal keduanya hilang (CABAI→CABA), atau vokalnya terbalik.
 * SENGAJA bukan bentuk lisan (CABE, PULO, RANTE): itu ejaan sehari-hari
 * yang dilihat anak di bungkus & papan warung — menyalahkannya terasa
 * menghukum, padahal yang dilatih membaca dua vokal, bukan ejaan baku.
 */
const diftongAlts: AltRule = (t) => {
  const m = /AI|AU|OI/.exec(t);
  if (!m) return openAlts(t);
  const flip = m[0][1]! + m[0][0]!;
  return [t.replace(m[0], m[0][0]!), t.replace(m[0], flip)];
};

/** NG/NY: kehilangan G/Y (BUNA), atau kehilangan N (BUGA). */
const ngAlts: AltRule = (t) => {
  const m = /NG|NY/.exec(t);
  if (!m) return openAlts(t);
  return [t.replace(m[0], 'N'), t.replace(m[0], m[0][1]!)];
};

/** Klaster: disisipi vokal (TURUK), atau konsonan keduanya hilang (TUK). */
const clusterAlts: AltRule = (t) => {
  const m = /(?<![AIUEO])([BCDFGKPSTZ])([RL])|^(S)([TK])/.exec(t);
  if (!m) return openAlts(t);
  const a = m[1] ?? m[3]!;
  const b = m[2] ?? m[4]!;
  const next = t[m.index + 2] ?? 'E';
  const vowel = isVowel(next) ? next : 'E';
  return [
    t.slice(0, m.index) + a + vowel + b + t.slice(m.index + 2),
    t.slice(0, m.index) + a + t.slice(m.index + 2),
  ];
};

function altsFor(word: Word, rule: AltRule): [string, string] {
  if (word.alts) return word.alts;
  const [x, y] = rule(word.text.replace(/-/g, ''));
  // Tahap 1 ditulis bersuku kata; pengecohnya ikut dipisah di tempat yang sama.
  const cut = word.text.indexOf('-');
  const split = (s: string) => (cut > 0 ? `${s.slice(0, cut)}-${s.slice(cut)}` : s);
  return [split(x), split(y)];
}

/* ---------- Soal ---------- */

/**
 * Pasangan yang tak boleh berdampingan sebagai pilihan gambar: di layar HP
 * bentuknya terlalu mirip, jadi soalnya berubah jadi tebak-tebakan.
 */
const LOOKALIKE: [string, string][] = [
  ['PANTAI', 'PULAU'],
  ['KURSI', 'SOFA'],
  ['MELON', 'SEMANGKA'],
];

const clash = (a: string, b: string) =>
  LOOKALIKE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** Dua kata lain dari tahap yang sama sebagai gambar pengecoh. */
function otherPics(words: Word[], i: number): Word[] {
  const out: Word[] = [];
  for (let k = 1; out.length < 2 && k < words.length; k += 1) {
    const other = words[(i + k * 5) % words.length]!;
    const plain = (x: Word) => x.text.replace(/-/g, '');
    if (other === words[i] || out.includes(other)) continue;
    if (clash(plain(other), plain(words[i]!)) || out.some((o) => clash(plain(o), plain(other)))) continue;
    out.push(other);
  }
  return out;
}

const pic = (word: Word, correct = false): TapChoice => ({
  id: word.text,
  emoji: word.emoji,
  ...(word.item ? { item: word.item } : {}),
  ...(correct ? { correct: true } : {}),
});

/** Soal "baca → gambar": tulisan di papan, pilih gambarnya. */
function readLevel(id: string, words: Word[], i: number, line: string): GameLevel<'tap-answer'> {
  const word = words[i]!;
  return {
    id,
    narration: line,
    data: {
      // Papan memecah di spasi: tahap 1 tampil sebagai dua suku kata.
      board: word.text.replace(/-/g, ' '),
      choices: [pic(word, true), ...otherPics(words, i).map((o) => pic(o))],
      choiceRow: true,
    },
  };
}

/** Soal "gambar → tulisan": gambar besar, pilih tulisan yang tepat. */
function writeLevel(id: string, word: Word, rule: AltRule): GameLevel<'tap-answer'> {
  const [a, b] = altsFor(word, rule);
  return {
    id,
    narration: PICK_WRITE,
    data: {
      picture: word.emoji,
      ...(word.item ? { pictureItem: word.item } : {}),
      choices: [
        { id: 'ok', text: word.text, correct: true },
        { id: 'x1', text: a },
        { id: 'x2', text: b },
      ],
    },
  };
}

const SLOTS = 6;
const SLOT_NAMES = 'abcdef';

/**
 * Satu tahap kata: kata ke-i masuk slot i mod 6. Slot genap = baca → gambar,
 * slot ganjil = gambar → tulisan, jadi tiap main selang-seling keduanya.
 */
function wordStage(
  n: number,
  label: string,
  emoji: string,
  words: Word[],
  rule: AltRule,
  readLine = READ_WORD,
): { stage: Stage; slots: LevelSlot<'tap-answer'>[] } {
  const slots: LevelSlot<'tap-answer'>[] = [];
  const ids: string[] = [];
  for (let s = 0; s < SLOTS; s += 1) {
    const id = `t${n}${SLOT_NAMES[s]}`;
    ids.push(id);
    const variants: GameLevel<'tap-answer'>[] = [];
    for (let i = s; i < words.length; i += SLOTS) {
      variants.push(s % 2 === 0 ? readLevel(id, words, i, readLine) : writeLevel(id, words[i]!, rule));
    }
    slots.push(variants.length === 1 ? variants[0]! : variants);
  }
  return { stage: { id: `s${n}`, label, emoji, slots: ids }, slots };
}

/* ---------- Tahap 8 — kalimat pendek ---------- */

interface Sentence {
  text: string;
  answer: Word;
  others: [Word, Word];
}

const P = {
  milk: w('susu', '🥛', 'milk'),
  bread: w('roti', '🍞', 'bread'),
  egg: w('telur', '🥚', 'egg'),
  bus: w('bus', '🚌', 'bus'),
  car: w('mobil', '🚗', 'car'),
  bike: w('sepeda', '🚲', 'bicycle'),
  train: w('kereta', '🚆', 'train'),
  cap: w('topi', '🧢', 'cap'),
  shoe: w('sepatu', '👟', 'shoe'),
  umbrella: w('payung', '☂️', 'umbrella'),
  ball: w('bola', '⚽', 'ball'),
  teddy: w('boneka', '🧸', 'teddy'),
  balloon: w('balon', '🎈', 'balloon'),
  pencil: w('pensil', '✏️', 'pencil'),
  book: w('buku', '📕', 'book'),
  backpack: w('tas', '🎒', 'backpack'),
  watermelon: w('semangka', '🍉', 'watermelon'),
  banana: w('pisang', '🍌', 'banana'),
  apple: w('apel', '🍎', 'apple'),
  orange: w('jeruk', '🍊', 'orange'),
  corn: w('jagung', '🌽', 'corn'),
  carrot: w('wortel', '🥕', 'carrot'),
  flower: w('bunga', '🌸', 'flower'),
  rice: w('nasi', '🍚', 'rice'),
};

const s = (text: string, answer: Word, a: Word, b: Word): Sentence => ({ text, answer, others: [a, b] });

const SENTENCES: Sentence[] = [
  s('Adik minum susu.', P.milk, P.bread, P.egg),
  s('Ayah naik bus.', P.bus, P.car, P.bike),
  s('Adik main bola.', P.ball, P.teddy, P.balloon),
  s('Kakak makan roti.', P.bread, P.rice, P.egg),
  s('Hujan! Buka payung.', P.umbrella, P.cap, P.shoe),
  s('Ibu beli semangka.', P.watermelon, P.banana, P.apple),
  s('Kakak menulis pakai pensil.', P.pencil, P.book, P.backpack),
  s('Kelinci makan wortel.', P.carrot, P.corn, P.rice),
  s('Monyet suka pisang.', P.banana, P.apple, P.orange),
  s('Ayah menanam jagung.', P.corn, P.carrot, P.flower),
  s('Adik naik sepeda.', P.bike, P.car, P.train),
  s('Kakak memakai topi.', P.cap, P.shoe, P.umbrella),
];

function sentenceStage(n: number): { stage: Stage; slots: LevelSlot<'tap-answer'>[] } {
  const slots: LevelSlot<'tap-answer'>[] = [];
  const ids: string[] = [];
  for (let k = 0; k < SLOTS; k += 1) {
    const id = `t${n}${SLOT_NAMES[k]}`;
    ids.push(id);
    const variants = [];
    for (let i = k; i < SENTENCES.length; i += SLOTS) {
      const sent = SENTENCES[i]!;
      variants.push({
        id,
        narration: READ_SENT,
        data: {
          board: sent.text,
          choices: [pic(sent.answer, true), ...sent.others.map((o) => pic(o))],
          choiceRow: true,
        },
      });
    }
    slots.push(variants);
  }
  return { stage: { id: `s${n}`, label: 'Kalimat', emoji: '📜', slots: ids }, slots };
}

/* ---------- Rakit ---------- */

const parts = [
  wordStage(1, 'Suku Kata', '🧩', SUKU_KATA, openAlts, READ_SYL),
  wordStage(2, 'Kata Pendek', '🌱', KATA_PENDEK, openAlts),
  wordStage(3, 'Tiga Suku', '🌿', TIGA_SUKU, openAlts),
  wordStage(4, 'Suku Tertutup', '🚪', TERTUTUP, closedAlts),
  wordStage(5, 'Diftong', '🎐', DIFTONG, diftongAlts),
  wordStage(6, 'NG dan NY', '🎶', NG_NY, ngAlts),
  wordStage(7, 'Klaster', '🚀', KLASTER, clusterAlts),
  sentenceStage(8),
];

const config: GameConfig<'tap-answer'> = {
  id: 'tangga-membaca',
  group: 'sd1',
  title: 'Tangga Membaca',
  emoji: '🪜',
  template: 'tap-answer',
  levels: parts.flatMap((p) => p.slots),
  stageMap: {
    title: 'Naik satu anak tangga, lalu buka tahap berikutnya!',
    stages: parts.map((p) => p.stage),
  },
};

export default config;
