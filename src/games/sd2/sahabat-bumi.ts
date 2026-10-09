import type { EcoBin, EcoStep, EcoTask, EcoThing, GameConfig, GameLevel, LevelStamp } from '@/engine/core/types';

/**
 * "Sahabat Bumi" (SD Kelas 3 & 4, `sd2`, IPAS) — game IPAS kedua: lingkungan,
 * sampah & sumber daya alam. Template `eco-mission`.
 *
 * Keputusan pemilik 2026-10-09 (semua rekomendasi disetujui):
 * - IPAS dapat tiga game baru, dikerjakan SATU PER SATU; ini yang pertama
 *   (berikutnya Lab Cahaya & Bunyi, lalu Jelajah Kampung);
 * - 9 slot berurutan TETAP (kls 3 → kls 4 dari slot 6), tanpa `sessionLevels`;
 * - benda sampah digambar SVG engine (`Eco.tsx`), bukan emoji — 🍌 itu pisang
 *   utuh, bukan kulitnya;
 * - pemandu = Kura-kura penjaga sungai (seni `turtle` yang sudah ada).
 *
 * SLOT
 *   l1 pilah organik / anorganik (tong hijau & kuning)
 *   l2 pilah tiga tong: + sampah BERBAHAYA (tong merah — baterai, lampu, semprotan)
 *   l3 bank sampah: pilah menurut BAHAN untuk didaur ulang (plastik / kertas / logam)
 *   l4 hemat air: sentuh semua kebiasaan yang boros air
 *   l5 daur air: susun lingkaran menguap → awan → hujan → mengalir (searah jarum jam)
 *   l6 (kls 4) sumber daya alam yang dapat / tidak dapat diperbarui
 *   l7 benda sehari-hari dibuat dari sumber daya apa (kursi → pohon, garam → laut)
 *   l8 sentuh semua yang merusak lingkungan
 *   l9 MISI BESAR sungai: pungut & pilah sampah yang hanyut → jaga sungai →
 *      tanam pohon di tepinya
 *
 * - Warna tong mengikuti tong sampah di Indonesia: hijau organik, kuning
 *   anorganik, merah berbahaya. Kertas SENGAJA tidak dipakai di l1/l2 — di
 *   buku sekolah ia kadang organik kadang anorganik; di l3 ia jelas "kertas".
 * - Narasi TANPA digit dan tidak memuat jawabannya. Builder melempar error
 *   untuk data yang salah (tong tanpa sampah, benda kembar, kartu buruk yang
 *   jumlahnya tak cocok dengan kalimatnya, pilihan benar lebih dari satu).
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = GameLevel<'eco-mission'>;

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🗑️', label: 'Pilah' },
  l2: { emoji: '🔋', label: 'Bahaya' },
  l3: { emoji: '♻️', label: 'Daur ulang' },
  l4: { emoji: '🚰', label: 'Hemat air' },
  l5: { emoji: '🌧️', label: 'Daur air' },
  l6: { emoji: '🌳', label: 'Alam' },
  l7: { emoji: '🪑', label: 'Bahan' },
  l8: { emoji: '🌍', label: 'Jaga bumi' },
  l9: { emoji: '🏞️', label: 'Sungai' },
};

/* ---------- pemeriksa ---------- */

function fail(msg: string): never {
  throw new Error(`sahabat-bumi: ${msg}`);
}

function noDigit(text: string): string {
  if (/\d/.test(text)) fail(`digit di narasi: ${text}`);
  return text;
}

function uniqLabels(list: { label: string }[], what: string) {
  if (new Set(list.map((x) => x.label)).size !== list.length) fail(`${what} kembar`);
}

function level(id: string, narration: string, ...steps: EcoStep[]): Level {
  return { id, narration: noDigit(narration), stamp: STAMP[id], data: { steps } };
}

function step(task: EcoTask, extra: Omit<EcoStep, 'task'> = {}): EcoStep {
  if (extra.say) noDigit(extra.say);
  return { ...extra, task };
}

const WORD = ['nol', 'satu', 'dua', 'tiga', 'empat'];

/* ---------- benda ---------- */

const T = (label: string, look: Omit<EcoThing, 'label'>): EcoThing => ({ label, ...look });

// organik
const PISANG = T('Kulit pisang', { art: 'kulit-pisang' });
const DAUN = T('Daun kering', { art: 'daun-kering' });
const APEL = T('Sisa apel', { art: 'sisa-apel' });
const TELUR = T('Kulit telur', { art: 'kulit-telur' });
const TULANG = T('Tulang ikan', { art: 'tulang-ikan' });
// anorganik
const BOTOL = T('Botol plastik', { art: 'botol' });
const KALENG = T('Kaleng', { art: 'kaleng' });
const KANTONG = T('Kantong plastik', { art: 'kantong' });
const SEDOTAN = T('Sedotan', { art: 'sedotan' });
const GELAS = T('Gelas plastik', { art: 'gelas-plastik' });
// berbahaya
const BATERAI = T('Baterai bekas', { art: 'baterai' });
const LAMPU = T('Lampu bekas', { art: 'bohlam' });
const SEMPROT = T('Semprot nyamuk', { art: 'semprotan' });
// bank sampah
const KARDUS = T('Kardus', { art: 'kardus' });
const KORAN = T('Koran', { art: 'koran' });
const PAKU = T('Paku', { art: 'paku' });
// sumber daya alam
const POHON = T('Pohon', { item: 'tree', emoji: '🌳' });
const SAPI = T('Sapi', { item: 'cow', emoji: '🐮' });
const AYAM = T('Ayam', { item: 'chicken', emoji: '🐔' });
const PADI = T('Padi', { emoji: '🌾' });
const MATAHARI = T('Sinar matahari', { item: 'sun', emoji: '☀️' });
const AIR = T('Air', { emoji: '💧' });
const MINYAK = T('Minyak bumi', { art: 'minyak' });
const BATUBARA = T('Batu bara', { art: 'batu-bara' });
const EMAS = T('Emas', { art: 'emas' });
const LAUT = T('Air laut', { emoji: '🌊' });
const BATU = T('Batu', { emoji: '🪨' });

/* ---------- tong ---------- */

const ORGANIK: EcoBin = { id: 'organik', label: 'Organik', look: 'tong', color: 'hijau', rule: 'Bisa membusuk' };
const ANORGANIK: EcoBin = { id: 'anorganik', label: 'Anorganik', look: 'tong', color: 'kuning', rule: 'Tidak membusuk' };
const BAHAYA: EcoBin = { id: 'bahaya', label: 'Berbahaya', look: 'tong', color: 'merah', rule: 'Beracun' };
const PLASTIK: EcoBin = { id: 'plastik', label: 'Plastik', look: 'tong', color: 'biru', rule: 'Ringan, lentur' };
const KERTAS: EcoBin = { id: 'kertas', label: 'Kertas', look: 'tong', color: 'cokelat', rule: 'Dari kayu' };
const LOGAM: EcoBin = { id: 'logam', label: 'Logam', look: 'tong', color: 'abu', rule: 'Keras, berkilau' };
const BARU: EcoBin = {
  id: 'baru',
  label: 'Dapat diperbarui',
  look: 'kotak',
  color: 'hijau',
  emoji: '♻️',
  rule: 'Bisa tumbuh lagi',
};
const HABIS: EcoBin = {
  id: 'habis',
  label: 'Tidak dapat diperbarui',
  look: 'kotak',
  color: 'abu',
  emoji: '⛏️',
  rule: 'Bisa habis',
};

/* ---------- sort ---------- */

function sortTask(bins: EcoBin[], groups: Record<string, EcoThing[]>): EcoTask {
  const items = bins.flatMap((b) => {
    const list = groups[b.id] ?? [];
    if (!list.length) fail(`tong ${b.id} tanpa benda`);
    return list.map((t) => ({ ...t, bin: b.id }));
  });
  for (const k of Object.keys(groups)) if (!bins.some((b) => b.id === k)) fail(`tong ${k} tak ada`);
  uniqLabels(items, 'benda pilah');
  if (items.length > 6) fail('benda pilah lebih dari enam (tak muat di HP 320)');
  return { kind: 'sort', bins, items };
}

const SORT_TEXT: Record<string, string[]> = {
  l1: [
    'Kura-kura menemukan sampah di taman. Pilah ke tong organik dan anorganik!',
    'Bantu Kura-kura memilah sampah: yang bisa membusuk dan yang tidak!',
  ],
  l2: [
    'Ada sampah berbahaya juga! Pilah ke tiga tong.',
    'Sampah berbahaya jangan dicampur. Pilah ke tong yang benar!',
  ],
  l3: [
    'Di bank sampah, sampah dipilah menurut bahannya. Pilah ke plastik, kertas, dan logam!',
    'Supaya bisa didaur ulang, pilah sampah menurut bahannya!',
  ],
  l6: [
    'Pilah sumber daya alam: yang dapat diperbarui dan yang tidak!',
    'Mana yang bisa tumbuh lagi, mana yang bisa habis? Pilah!',
  ],
};

function sorting(id: string, t: number, bins: EcoBin[], groups: Record<string, EcoThing[]>): Level {
  return level(id, SORT_TEXT[id]![t]!, step(sortTask(bins, groups)));
}

/* ---------- spot ---------- */

const C = (emoji: string, label: string, bad?: boolean): EcoThing & { bad?: boolean } => ({
  emoji,
  label,
  ...(bad ? { bad } : {}),
});

const WATER_BAD = [
  C('🚰💧', 'Keran bocor dibiarkan', true),
  C('🪥🚰', 'Keran terbuka saat sikat gigi', true),
  C('🪣💦', 'Ember dibiarkan meluap', true),
  C('🚿', 'Mandi lama sekali', true),
];
const WATER_GOOD = [
  C('🪣', 'Mandi pakai gayung'),
  C('🪴💧', 'Siram tanaman pakai air bekas'),
  C('🌧️🪣', 'Menampung air hujan'),
  C('🔧🚰', 'Memperbaiki keran bocor'),
  C('🥛', 'Minum secukupnya'),
];
const EARTH_BAD = [
  C('🗑️🌊', 'Buang sampah ke sungai', true),
  C('🪓🌳', 'Menebang pohon sembarangan', true),
  C('🔥🌳', 'Membakar hutan', true),
  C('🏭💨', 'Asap pabrik dibiarkan', true),
];
const EARTH_GOOD = [
  C('🌱', 'Menanam pohon'),
  C('🚲', 'Bersepeda ke sekolah'),
  C('♻️', 'Memilah sampah'),
  C('👜', 'Bawa tas belanja sendiri'),
  C('💡', 'Mematikan lampu'),
];

function spot(id: string, what: string, bad: EcoThing[], good: EcoThing[]): Level {
  const cards = [...bad, ...good];
  if (cards.length !== 6) fail('kartu spot harus enam');
  if (bad.length < 2 || bad.length > 3) fail('kartu buruk harus dua atau tiga');
  uniqLabels(cards, 'kartu');
  return level(id, `Ada ${WORD[bad.length]} ${what}. Sentuh semuanya!`, step({ kind: 'spot', cards }));
}

const pickN = <X>(list: X[], ix: number[]): X[] => ix.map((i) => list[i] ?? fail(`indeks ${i} di luar daftar`));

/* ---------- cycle ---------- */

const MENGUAP = T('Air menguap', { emoji: '♨️' });
const AWAN = T('Jadi awan', { emoji: '☁️' });
const HUJAN = T('Hujan turun', { emoji: '🌧️' });
const MENGALIR = T('Mengalir ke laut', { emoji: '🌊' });
const DAUR = [MENGUAP, AWAN, HUJAN, MENGALIR];
const PELANGI = T('Pelangi', { emoji: '🌈' });
const PETIR = T('Petir', { emoji: '⚡' });

function cycle(given: number, decoys: EcoThing[] = []): Level {
  if (given < 0 || given >= DAUR.length) fail('awal daur di luar lingkaran');
  uniqLabels([...DAUR, ...decoys], 'kartu daur');
  return level(
    'l5',
    decoys.length
      ? 'Susun daur airnya! Hati-hati, ada kartu yang bukan bagiannya.'
      : 'Air di bumi berputar terus. Susun daur airnya searah panah!',
    step({ kind: 'cycle', stages: DAUR, given, decoys }),
  );
}

/* ---------- pick ---------- */

function pick(id: string, narration: string, cue: EcoThing, right: EcoThing, wrongs: EcoThing[]): Level {
  const choices = [{ ...right, correct: true }, ...wrongs];
  if (choices.length !== 3) fail('pilihan harus tiga');
  uniqLabels(choices, 'pilihan');
  return level(id, narration, step({ kind: 'pick', cue, choices }));
}

const KURSI = T('Kursi', { item: 'chair', emoji: '🪑' });
const NASI = T('Nasi', { item: 'rice', emoji: '🍚' });
const SUSU = T('Susu', { item: 'milk', emoji: '🥛' });
const TELUR_AYAM = T('Telur', { item: 'egg', emoji: '🥚' });
const BUKU = T('Buku', { item: 'book', emoji: '📖' });
const GARAM = T('Garam', { emoji: '🧂' });

/* ---------- misi besar ---------- */

const KEEP = [
  {
    say: 'Sungainya sudah bersih! Supaya tetap bersih, apa yang kita lakukan?',
    right: C('🗑️', 'Buang sampah di tong sampah'),
    wrongs: [C('🌊', 'Buang sampah ke sungai'), C('🔥', 'Bakar sampah di tepi sungai')],
  },
  {
    say: 'Sungainya sudah bersih! Belanja ke pasar, sebaiknya bawa apa?',
    right: C('👜', 'Tas belanja sendiri'),
    wrongs: [C('🛍️', 'Kantong plastik baru'), C('🥤', 'Gelas plastik')],
  },
  {
    say: 'Sungainya sudah bersih! Baterai bekas dibuang ke mana?',
    right: C('🟥', 'Tong sampah berbahaya'),
    wrongs: [C('🌊', 'Ke sungai'), C('🌱', 'Dikubur di kebun')],
  },
];

const PLANT_SAY = 'Sekarang tanam pohon di tepi sungai supaya tanahnya kuat!';

function mission(groups: Record<string, EcoThing[]>, keep: number): Level {
  const k = KEEP[keep] ?? fail('pertanyaan misi tak ada');
  const ask = { kind: 'pick' as const, choices: [{ ...k.right, correct: true }, ...k.wrongs] };
  uniqLabels(ask.choices, 'pilihan misi');
  return level(
    'l9',
    'Misi besar! Sungai penuh sampah hanyut. Ambil dan pilah sampahnya!',
    step(sortTask([ORGANIK, ANORGANIK, BAHAYA], groups), { river: true }),
    step(ask, { say: k.say }),
    step({ kind: 'plant', spots: 3 }, { say: PLANT_SAY }),
  );
}

/* ---------- config ---------- */

const config: GameConfig<'eco-mission'> = {
  id: 'sahabat-bumi',
  group: 'sd2',
  title: 'Sahabat Bumi',
  emoji: '🌍',
  template: 'eco-mission',
  project: { title: 'Sungai Bersih' },
  hints: true,
  levels: [
    [
      sorting('l1', 0, [ORGANIK, ANORGANIK], { organik: [PISANG, DAUN], anorganik: [BOTOL, KALENG] }),
      sorting('l1', 1, [ORGANIK, ANORGANIK], { organik: [APEL, TELUR], anorganik: [KANTONG, SEDOTAN] }),
      sorting('l1', 0, [ORGANIK, ANORGANIK], { organik: [TULANG, PISANG], anorganik: [GELAS, KALENG] }),
      sorting('l1', 1, [ORGANIK, ANORGANIK], { organik: [DAUN, APEL, TELUR], anorganik: [BOTOL, SEDOTAN] }),
      sorting('l1', 0, [ORGANIK, ANORGANIK], { organik: [PISANG, TULANG], anorganik: [KANTONG, GELAS, KALENG] }),
      sorting('l1', 1, [ORGANIK, ANORGANIK], { organik: [TELUR, DAUN, TULANG], anorganik: [BOTOL, KANTONG, SEDOTAN] }),
    ],
    [
      sorting('l2', 0, [ORGANIK, ANORGANIK, BAHAYA], { organik: [PISANG], anorganik: [BOTOL, KALENG], bahaya: [BATERAI] }),
      sorting('l2', 1, [ORGANIK, ANORGANIK, BAHAYA], { organik: [DAUN, APEL], anorganik: [SEDOTAN], bahaya: [LAMPU] }),
      sorting('l2', 0, [ORGANIK, ANORGANIK, BAHAYA], { organik: [TELUR], anorganik: [KANTONG], bahaya: [SEMPROT, BATERAI] }),
      sorting('l2', 1, [ORGANIK, ANORGANIK, BAHAYA], {
        organik: [TULANG, PISANG],
        anorganik: [GELAS, BOTOL],
        bahaya: [LAMPU],
      }),
      sorting('l2', 0, [ORGANIK, ANORGANIK, BAHAYA], {
        organik: [APEL],
        anorganik: [KALENG, KANTONG],
        bahaya: [BATERAI, SEMPROT],
      }),
      sorting('l2', 1, [ORGANIK, ANORGANIK, BAHAYA], {
        organik: [DAUN, TELUR],
        anorganik: [SEDOTAN, GELAS],
        bahaya: [LAMPU, BATERAI],
      }),
    ],
    [
      sorting('l3', 0, [PLASTIK, KERTAS, LOGAM], { plastik: [BOTOL], kertas: [KARDUS], logam: [KALENG] }),
      sorting('l3', 1, [PLASTIK, KERTAS, LOGAM], { plastik: [KANTONG, SEDOTAN], kertas: [KORAN], logam: [PAKU] }),
      sorting('l3', 0, [PLASTIK, KERTAS, LOGAM], { plastik: [GELAS], kertas: [KARDUS, KORAN], logam: [KALENG] }),
      sorting('l3', 1, [PLASTIK, KERTAS, LOGAM], { plastik: [BOTOL, GELAS], kertas: [KORAN], logam: [PAKU, KALENG] }),
      sorting('l3', 0, [PLASTIK, KERTAS, LOGAM], { plastik: [SEDOTAN, KANTONG], kertas: [KARDUS], logam: [KALENG] }),
      sorting('l3', 1, [PLASTIK, KERTAS, LOGAM], { plastik: [GELAS, BOTOL], kertas: [KARDUS, KORAN], logam: [PAKU] }),
    ],
    [
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [0, 1]), pickN(WATER_GOOD, [0, 1, 2, 3])),
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [1, 2, 3]), pickN(WATER_GOOD, [1, 3, 4])),
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [0, 2]), pickN(WATER_GOOD, [0, 2, 3, 4])),
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [0, 1, 3]), pickN(WATER_GOOD, [0, 1, 4])),
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [2, 3]), pickN(WATER_GOOD, [1, 2, 3, 4])),
      spot('l4', 'kebiasaan yang boros air', pickN(WATER_BAD, [0, 1, 2]), pickN(WATER_GOOD, [0, 2, 3])),
    ],
    [cycle(0), cycle(1), cycle(2), cycle(3), cycle(0, [PELANGI]), cycle(2, [PETIR])],
    [
      sorting('l6', 0, [BARU, HABIS], { baru: [POHON, SAPI], habis: [MINYAK, BATUBARA] }),
      sorting('l6', 1, [BARU, HABIS], { baru: [PADI, AYAM], habis: [EMAS, MINYAK] }),
      sorting('l6', 0, [BARU, HABIS], { baru: [AIR, POHON], habis: [BATUBARA, EMAS] }),
      sorting('l6', 1, [BARU, HABIS], { baru: [MATAHARI, SAPI, PADI], habis: [MINYAK, BATUBARA] }),
      sorting('l6', 0, [BARU, HABIS], { baru: [AYAM, AIR], habis: [MINYAK, EMAS, BATUBARA] }),
      sorting('l6', 1, [BARU, HABIS], { baru: [POHON, MATAHARI, AYAM], habis: [EMAS, BATUBARA] }),
    ],
    [
      pick('l7', 'Kursi kayu ini dibuat dari apa?', KURSI, POHON, [SAPI, BATU]),
      pick('l7', 'Nasi ini berasal dari apa?', NASI, PADI, [POHON, AYAM]),
      pick('l7', 'Susu ini berasal dari apa?', SUSU, SAPI, [AYAM, PADI]),
      pick('l7', 'Telur ini berasal dari apa?', TELUR_AYAM, AYAM, [SAPI, LAUT]),
      pick('l7', 'Kertas buku ini dibuat dari apa?', BUKU, POHON, [BATU, SAPI]),
      pick('l7', 'Garam dapur dibuat dari apa?', GARAM, LAUT, [BATU, PADI]),
    ],
    [
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [0, 1]), pickN(EARTH_GOOD, [0, 1, 2, 3])),
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [1, 2, 3]), pickN(EARTH_GOOD, [1, 3, 4])),
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [0, 3]), pickN(EARTH_GOOD, [0, 2, 3, 4])),
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [0, 1, 2]), pickN(EARTH_GOOD, [0, 1, 4])),
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [2, 3]), pickN(EARTH_GOOD, [1, 2, 3, 4])),
      spot('l8', 'hal yang merusak lingkungan', pickN(EARTH_BAD, [0, 2, 3]), pickN(EARTH_GOOD, [0, 2, 3])),
    ],
    [
      mission({ organik: [PISANG, DAUN], anorganik: [BOTOL, KANTONG], bahaya: [BATERAI] }, 0),
      mission({ organik: [APEL], anorganik: [KALENG, SEDOTAN], bahaya: [LAMPU] }, 1),
      mission({ organik: [TULANG, TELUR], anorganik: [GELAS], bahaya: [SEMPROT] }, 2),
      mission({ organik: [DAUN], anorganik: [BOTOL, KALENG, SEDOTAN], bahaya: [BATERAI] }, 0),
      mission({ organik: [PISANG, APEL], anorganik: [KANTONG, GELAS], bahaya: [LAMPU] }, 1),
      mission({ organik: [TELUR, TULANG], anorganik: [KALENG, BOTOL], bahaya: [BATERAI] }, 2),
    ],
  ],
};

export default config;
