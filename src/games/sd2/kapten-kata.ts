import type { GameConfig, GameLevel, Stage, VoyMode, VoyPhrase, VoyWord } from '@/engine/core/types';
import { bare, phraseText } from '@/engine/core/wordVoyage';

/**
 * Kapten Kata — Bahasa Inggris SD Kelas 3 & 4 (`sd2`), template `word-voyage`.
 *
 * Keputusan pemilik (2026-10-10, ditanyakan sebelum mulai; diangkat dari
 * prototipe "Kapten Kata" yang dibuat di chat biasa):
 * - kata & kalimat Inggris DIREKAM suara Azure en-US (`voice: 'en'` di
 *   `scripts/extract-narration.mjs`), instruksi tetap suara Gadis;
 * - bentuknya PETA PULAU (stageMap `look: 'sea'`), tiap pulau satu tema,
 *   isinya tujuh misi berganti mode + lawan gurita di akhir;
 * - gambar = seni WebP registry (`items.ts`), WAJIB untuk hewan; benda lain
 *   yang belum berseni pakai emoji. Anjing tidak dipakai (aturan proyek).
 *
 * Urutan pulau: kosakata kelas 3 dulu (hewan, makanan, warna, bilangan,
 * barang), lalu kelas 4 (profesi, kegiatan, tempat & kendaraan). Pulau ke-n
 * terbuka setelah semua misi pulau sebelumnya selesai.
 *
 * Kata yang keluar DIPILIH ENGINE tiap main dari kolam pulau itu (ingatan
 * kata di `core/wordVoyage.ts`), jadi tiap pulau cukup satu level per mode.
 *
 * Aturan menulis kalimat:
 * - tanpa digit (kalimatnya DIUCAPKAN; angka hanya di gambar kata `num`);
 * - `gap` = kata yang dikosongkan saat lawan gurita; dua `wrong` = kesalahan
 *   khas (is/are/am, has/have, a/an, -s) yang BENAR-BENAR salah untuk
 *   kalimat & artinya — bukan sinonim yang juga benar ("the" untuk "a");
 * - `wrong[0]` ikut jadi kartu pengecoh di misi rangkai kalimat.
 */

const W = (en: string, id: string, pic: Partial<Pick<VoyWord, 'item' | 'emoji' | 'color' | 'num'>>): VoyWord => ({
  en,
  id,
  ...pic,
});

const P = (
  words: string[],
  id: string,
  gap: number,
  wrong: [string, string],
  pic: Partial<Pick<VoyPhrase, 'item' | 'emoji'>>,
): VoyPhrase => ({ words, id, gap, wrong, ...pic });

interface Island {
  key: string;
  name: string;
  emoji: string;
  words: VoyWord[];
  phrases: VoyPhrase[];
}

const ISLANDS: Island[] = [
  {
    key: 'satwa',
    name: 'Pulau Satwa',
    emoji: '🐯',
    words: [
      W('cat', 'kucing', { item: 'cat' }),
      W('rabbit', 'kelinci', { item: 'rabbit' }),
      W('duck', 'bebek', { item: 'duck' }),
      W('horse', 'kuda', { item: 'horse' }),
      W('cow', 'sapi', { item: 'cow' }),
      W('chicken', 'ayam', { item: 'chicken' }),
      W('monkey', 'monyet', { item: 'monkey' }),
      W('elephant', 'gajah', { item: 'elephant' }),
      W('tiger', 'harimau', { item: 'tiger' }),
      W('frog', 'katak', { item: 'frog' }),
      W('turtle', 'kura-kura', { item: 'turtle' }),
      W('lion', 'singa', { item: 'lion' }),
      W('bear', 'beruang', { item: 'bear' }),
      W('goat', 'kambing', { item: 'goat' }),
      W('bird', 'burung', { item: 'jalak' }),
    ],
    phrases: [
      P(['The', 'cat', 'is', 'small.'], 'Kucing itu kecil.', 2, ['are', 'am'], { item: 'cat' }),
      P(['I', 'have', 'a', 'rabbit.'], 'Aku punya seekor kelinci.', 1, ['has', 'am'], { item: 'rabbit' }),
      P(['The', 'bird', 'can', 'fly.'], 'Burung itu bisa terbang.', 2, ['is', 'are'], { item: 'jalak' }),
      P(['The', 'elephant', 'is', 'big.'], 'Gajah itu besar.', 3, ['small', 'short'], { item: 'elephant' }),
      P(['Monkeys', 'like', 'bananas.'], 'Monyet suka pisang.', 1, ['likes', 'is'], { item: 'monkey' }),
      P(['The', 'frog', 'is', 'green.'], 'Katak itu hijau.', 2, ['are', 'am'], { item: 'frog' }),
      P(['Two', 'ducks', 'are', 'swimming.'], 'Dua bebek sedang berenang.', 2, ['is', 'am'], { item: 'duck' }),
      P(['A', 'horse', 'has', 'four', 'legs.'], 'Kuda punya empat kaki.', 2, ['have', 'is'], { item: 'horse' }),
    ],
  },
  {
    key: 'rasa',
    name: 'Pulau Rasa',
    emoji: '🍉',
    words: [
      W('apple', 'apel', { item: 'apple' }),
      W('banana', 'pisang', { item: 'banana' }),
      W('orange', 'jeruk', { item: 'orange' }),
      W('grapes', 'anggur', { item: 'grapes' }),
      W('watermelon', 'semangka', { item: 'watermelon' }),
      W('mango', 'mangga', { item: 'mango' }),
      W('pineapple', 'nanas', { item: 'pineapple' }),
      W('strawberry', 'stroberi', { item: 'strawberry' }),
      W('rice', 'nasi', { item: 'rice' }),
      W('bread', 'roti', { item: 'bread' }),
      W('egg', 'telur', { item: 'egg' }),
      W('milk', 'susu', { item: 'milk' }),
      W('carrot', 'wortel', { item: 'carrot' }),
      W('corn', 'jagung', { item: 'corn' }),
    ],
    phrases: [
      P(['I', 'like', 'apples.'], 'Aku suka apel.', 1, ['likes', 'am'], { item: 'apple' }),
      P(['She', 'drinks', 'milk.'], 'Dia minum susu.', 1, ['drink', 'drinking'], { item: 'milk' }),
      P(['I', 'eat', 'an', 'egg.'], 'Aku makan sebutir telur.', 2, ['a', 'are'], { item: 'egg' }),
      P(['The', 'banana', 'is', 'yellow.'], 'Pisang itu kuning.', 3, ['blue', 'purple'], { item: 'banana' }),
      P(['We', 'eat', 'rice', 'every', 'day.'], 'Kami makan nasi setiap hari.', 1, ['eats', 'is'], { item: 'rice' }),
      P(['The', 'mango', 'is', 'sweet.'], 'Mangga itu manis.', 2, ['are', 'am'], { item: 'mango' }),
      P(['I', 'am', 'hungry.'], 'Aku lapar.', 1, ['is', 'are'], { emoji: '😋' }),
      P(['Do', 'you', 'like', 'corn?'], 'Apakah kamu suka jagung?', 0, ['Does', 'Are'], { item: 'corn' }),
    ],
  },
  {
    key: 'warna',
    name: 'Pulau Warna',
    emoji: '🎨',
    // Oranye sengaja tidak dipakai: di layar HP kuning & oranye sulit dibedakan
    // (aturan yang sama dengan Labirin Warna & keranjang Pasar Buah).
    words: [
      W('red', 'merah', { color: '#e5484d' }),
      W('blue', 'biru', { color: '#2f6fed' }),
      W('green', 'hijau', { color: '#2fa84f' }),
      W('yellow', 'kuning', { color: '#ffd23f' }),
      W('purple', 'ungu', { color: '#8e4ec6' }),
      W('pink', 'merah muda', { color: '#ff8fc4' }),
      W('black', 'hitam', { color: '#1b1b1f' }),
      W('white', 'putih', { color: '#ffffff' }),
      W('brown', 'cokelat', { color: '#8b5a2b' }),
      W('gray', 'abu-abu', { color: '#9aa0a6' }),
    ],
    phrases: [
      P(['The', 'sky', 'is', 'blue.'], 'Langit berwarna biru.', 3, ['green', 'red'], { item: 'cloud' }),
      P(['The', 'apple', 'is', 'red.'], 'Apel itu merah.', 3, ['purple', 'black'], { item: 'apple' }),
      P(['My', 'shoes', 'are', 'black.'], 'Sepatuku hitam.', 2, ['is', 'am'], { item: 'shoe' }),
      P(['I', 'like', 'green.'], 'Aku suka warna hijau.', 1, ['likes', 'is'], { emoji: '💚' }),
      P(['The', 'flower', 'is', 'pink.'], 'Bunga itu merah muda.', 2, ['are', 'am'], { item: 'flower' }),
      P(['Her', 'bag', 'is', 'purple.'], 'Tasnya berwarna ungu.', 0, ['She', 'I'], { item: 'backpack' }),
      P(['The', 'milk', 'is', 'white.'], 'Susu itu putih.', 3, ['black', 'red'], { item: 'milk' }),
      P(['The', 'sun', 'is', 'yellow.'], 'Matahari itu kuning.', 3, ['blue', 'black'], { item: 'sun' }),
    ],
  },
  {
    key: 'angka',
    name: 'Pulau Angka',
    emoji: '🔢',
    // Pasangan -teen / -ty (thirteen ↔ thirty) sengaja ada bersama: begitu
    // katanya mulai dikuasai, engine mengadu yang ejaannya paling mirip.
    words: [
      W('eleven', 'sebelas', { num: 11 }),
      W('twelve', 'dua belas', { num: 12 }),
      W('thirteen', 'tiga belas', { num: 13 }),
      W('fourteen', 'empat belas', { num: 14 }),
      W('fifteen', 'lima belas', { num: 15 }),
      W('sixteen', 'enam belas', { num: 16 }),
      W('twenty', 'dua puluh', { num: 20 }),
      W('thirty', 'tiga puluh', { num: 30 }),
      W('forty', 'empat puluh', { num: 40 }),
      W('fifty', 'lima puluh', { num: 50 }),
      W('sixty', 'enam puluh', { num: 60 }),
      W('one hundred', 'seratus', { num: 100 }),
    ],
    phrases: [
      P(['I', 'am', 'twelve', 'years', 'old.'], 'Umurku dua belas tahun.', 1, ['is', 'are'], { emoji: '🎂' }),
      P(['I', 'have', 'fifteen', 'crayons.'], 'Aku punya lima belas krayon.', 2, ['fifty', 'five'], { emoji: '🖍️' }),
      P(['There', 'are', 'twenty', 'students.'], 'Ada dua puluh murid.', 1, ['is', 'am'], { item: 'school' }),
      P(['My', 'sister', 'is', 'eleven.'], 'Adikku berumur sebelas tahun.', 2, ['are', 'am'], { emoji: '👧' }),
      P(['A', 'week', 'has', 'seven', 'days.'], 'Seminggu ada tujuh hari.', 2, ['have', 'is'], { emoji: '📅' }),
      P(['We', 'need', 'thirty', 'chairs.'], 'Kami perlu tiga puluh kursi.', 2, ['thirteen', 'three'], { item: 'chair' }),
      P(['I', 'can', 'count', 'to', 'one', 'hundred.'], 'Aku bisa berhitung sampai seratus.', 1, ['am', 'is'], { emoji: '💯' }),
    ],
  },
  {
    key: 'barang',
    name: 'Pulau Barangku',
    emoji: '🎒',
    words: [
      W('book', 'buku', { item: 'book' }),
      W('pencil', 'pensil', { item: 'pencil' }),
      W('bag', 'tas', { item: 'backpack' }),
      W('chair', 'kursi', { item: 'chair' }),
      W('door', 'pintu', { item: 'door' }),
      W('ball', 'bola', { item: 'ball' }),
      W('umbrella', 'payung', { item: 'umbrella' }),
      W('shoe', 'sepatu', { item: 'shoe' }),
      W('cap', 'topi', { item: 'cap' }),
      W('key', 'kunci', { item: 'key' }),
      W('balloon', 'balon', { item: 'balloon' }),
      W('teddy bear', 'boneka beruang', { item: 'teddy' }),
      W('ruler', 'penggaris', { emoji: '📏' }),
      W('scissors', 'gunting', { emoji: '✂️' }),
    ],
    phrases: [
      P(['This', 'is', 'my', 'book.'], 'Ini bukuku.', 1, ['are', 'am'], { item: 'book' }),
      P(['I', 'have', 'two', 'pencils.'], 'Aku punya dua pensil.', 3, ['pencil', 'pen'], { item: 'pencil' }),
      P(['Open', 'the', 'door,', 'please.'], 'Tolong buka pintunya.', 0, ['Opens', 'Opening'], { item: 'door' }),
      P(['My', 'bag', 'is', 'blue.'], 'Tasku biru.', 0, ['I', 'Me'], { item: 'backpack' }),
      P(['The', 'ball', 'is', 'under', 'the', 'chair.'], 'Bolanya di bawah kursi.', 3, ['on', 'in'], { item: 'ball' }),
      P(['Where', 'is', 'my', 'umbrella?'], 'Di mana payungku?', 0, ['What', 'Who'], { item: 'umbrella' }),
      P(['I', 'wear', 'a', 'cap.'], 'Aku memakai topi.', 1, ['wears', 'am'], { item: 'cap' }),
    ],
  },
  {
    key: 'profesi',
    name: 'Pulau Profesi',
    emoji: '🧑‍🍳',
    words: [
      W('teacher', 'guru', { item: 'teacher' }),
      W('doctor', 'dokter', { item: 'doctor' }),
      W('farmer', 'petani', { item: 'farmer' }),
      W('chef', 'koki', { item: 'chef' }),
      W('police officer', 'polisi', { item: 'police-officer' }),
      W('firefighter', 'pemadam kebakaran', { item: 'firefighter' }),
      W('mechanic', 'montir', { item: 'mechanic' }),
      W('painter', 'pelukis', { item: 'painter' }),
      W('pilot', 'pilot', { emoji: '🧑‍✈️' }),
      W('singer', 'penyanyi', { emoji: '🧑‍🎤' }),
    ],
    phrases: [
      P(['She', 'is', 'a', 'teacher.'], 'Dia seorang guru.', 2, ['an', 'are'], { item: 'teacher' }),
      P(['He', 'is', 'a', 'doctor.'], 'Dia seorang dokter.', 1, ['are', 'am'], { item: 'doctor' }),
      P(['A', 'farmer', 'works', 'in', 'the', 'field.'], 'Petani bekerja di sawah.', 2, ['work', 'working'], { item: 'farmer' }),
      P(['The', 'chef', 'cooks', 'food.'], 'Koki memasak makanan.', 2, ['cook', 'cooking'], { item: 'chef' }),
      P(['I', 'want', 'to', 'be', 'a', 'pilot.'], 'Aku ingin menjadi pilot.', 1, ['wants', 'am'], { emoji: '🧑‍✈️' }),
      P(['Firefighters', 'are', 'brave.'], 'Pemadam kebakaran itu berani.', 1, ['is', 'am'], { item: 'firefighter' }),
      P(['My', 'father', 'is', 'a', 'mechanic.'], 'Ayahku seorang montir.', 2, ['are', 'am'], { item: 'mechanic' }),
    ],
  },
  {
    key: 'aksi',
    name: 'Pulau Aksi',
    emoji: '🏃',
    words: [
      W('run', 'berlari', { emoji: '🏃' }),
      W('walk', 'berjalan', { emoji: '🚶' }),
      W('swim', 'berenang', { emoji: '🏊' }),
      W('climb', 'memanjat', { emoji: '🧗' }),
      W('dance', 'menari', { emoji: '💃' }),
      W('sing', 'bernyanyi', { emoji: '🎤' }),
      W('read', 'membaca', { emoji: '📖' }),
      W('write', 'menulis', { emoji: '✍️' }),
      W('draw', 'menggambar', { emoji: '🖍️' }),
      W('cook', 'memasak', { emoji: '🍳' }),
      W('sleep', 'tidur', { emoji: '😴' }),
      W('ride', 'naik sepeda', { emoji: '🚴' }),
    ],
    phrases: [
      P(['I', 'can', 'swim.'], 'Aku bisa berenang.', 1, ['am', 'is'], { emoji: '🏊' }),
      P(['She', 'is', 'reading', 'a', 'book.'], 'Dia sedang membaca buku.', 2, ['read', 'reads'], { item: 'book' }),
      P(['They', 'are', 'dancing.'], 'Mereka sedang menari.', 1, ['is', 'am'], { emoji: '💃' }),
      P(['We', 'sing', 'together.'], 'Kami bernyanyi bersama.', 1, ['sings', 'singing'], { emoji: '🎤' }),
      P(['The', 'baby', 'is', 'sleeping.'], 'Bayi itu sedang tidur.', 2, ['are', 'am'], { emoji: '😴' }),
      P(['I', 'ride', 'my', 'bicycle.'], 'Aku naik sepedaku.', 1, ['rides', 'riding'], { item: 'bicycle' }),
      P(['Can', 'you', 'draw', 'a', 'cat?'], 'Bisakah kamu menggambar kucing?', 0, ['Are', 'Is'], { emoji: '🖍️' }),
    ],
  },
  {
    key: 'kota',
    name: 'Pulau Kota',
    emoji: '🚌',
    words: [
      W('car', 'mobil', { item: 'car' }),
      W('bus', 'bus', { item: 'bus' }),
      W('train', 'kereta', { item: 'train' }),
      W('bicycle', 'sepeda', { item: 'bicycle' }),
      W('motorcycle', 'motor', { item: 'motorcycle' }),
      W('truck', 'truk', { item: 'truck' }),
      W('taxi', 'taksi', { item: 'taxi' }),
      W('plane', 'pesawat', { emoji: '✈️' }),
      W('ship', 'kapal', { emoji: '🚢' }),
      W('house', 'rumah', { item: 'house' }),
      W('school', 'sekolah', { item: 'school' }),
      W('hospital', 'rumah sakit', { item: 'hospital' }),
      W('shop', 'toko', { item: 'shop' }),
      W('park', 'taman', { item: 'park' }),
    ],
    phrases: [
      P(['I', 'go', 'to', 'school', 'by', 'bus.'], 'Aku pergi ke sekolah naik bus.', 4, ['at', 'with'], { item: 'bus' }),
      P(['The', 'train', 'is', 'fast.'], 'Kereta itu cepat.', 2, ['are', 'am'], { item: 'train' }),
      P(['My', 'house', 'is', 'near', 'the', 'park.'], 'Rumahku dekat taman.', 2, ['are', 'am'], { item: 'house' }),
      P(['Where', 'is', 'the', 'hospital?'], 'Di mana rumah sakitnya?', 0, ['What', 'Who'], { item: 'hospital' }),
      P(['My', 'mother', 'drives', 'a', 'car.'], 'Ibuku menyetir mobil.', 2, ['drive', 'driving'], { item: 'car' }),
      P(['The', 'plane', 'is', 'in', 'the', 'sky.'], 'Pesawat itu ada di langit.', 3, ['on', 'under'], { emoji: '✈️' }),
      P(['We', 'buy', 'bread', 'at', 'the', 'shop.'], 'Kami membeli roti di toko.', 1, ['buys', 'buying'], { item: 'shop' }),
    ],
  },
];

/** Narasi tiap mode — sama di semua pulau (nama pulau tertulis di kepala misi). */
const MODES: { mode: VoyMode; say: string; stamp: string; label: string }[] = [
  { mode: 'pick', say: 'Lihat gambarnya. Pilih kata bahasa Inggrisnya!', stamp: '🧭', label: 'Gambar' },
  { mode: 'listen', say: 'Dengarkan baik-baik. Sentuh gambar yang disebut!', stamp: '🐚', label: 'Dengar' },
  { mode: 'spell', say: 'Dengarkan katanya, lalu susun hurufnya!', stamp: '🔑', label: 'Eja' },
  { mode: 'bubbles', say: 'Ketuk gelembung yang berisi kata yang dicari!', stamp: '🐠', label: 'Gelembung' },
  { mode: 'pairs', say: 'Balik kartunya. Cari gambar dan kata yang cocok!', stamp: '🃏', label: 'Kembar' },
  { mode: 'build', say: 'Baca artinya. Susun kalimat bahasa Inggrisnya!', stamp: '📜', label: 'Kalimat' },
  { mode: 'boss', say: 'Gurita penjaga pulau datang! Jawab soalnya untuk mengalahkannya!', stamp: '👑', label: 'Gurita' },
];

/* ---------- Pemeriksaan saat build: data yang salah gagal sebelum sampai ke HP ---------- */

function check(isle: Island) {
  const fail = (msg: string) => {
    throw new Error(`Kapten Kata · ${isle.name}: ${msg}`);
  };
  if (isle.words.length < 8) fail('kolam kata kurang dari 8');
  const ens = new Set<string>();
  const ids = new Set<string>();
  for (const w of isle.words) {
    if (ens.has(w.en)) fail(`kata kembar "${w.en}"`);
    if (ids.has(w.id)) fail(`arti kembar "${w.id}"`);
    ens.add(w.en);
    ids.add(w.id);
    const pics = [w.item, w.emoji, w.color, w.num].filter((x) => x !== undefined).length;
    if (pics !== 1) fail(`"${w.en}" harus punya tepat satu gambar`);
    if (/[0-9]/.test(w.en)) fail(`"${w.en}" memuat digit (diucapkan!)`);
  }
  if (isle.words.filter((w) => /^[a-z]{3,8}$/i.test(w.en)).length < 4) fail('kata yang bisa dieja kurang dari 4');
  if (isle.phrases.length < 6) fail('kalimat kurang dari 6');
  for (const p of isle.phrases) {
    const text = phraseText(p);
    if (/[0-9]/.test(text)) fail(`kalimat memuat digit: "${text}"`);
    if (p.words.length > 6) fail(`kalimat lebih dari enam kata: "${text}"`);
    const answer = p.words[p.gap];
    if (answer === undefined) fail(`gap di luar kalimat: "${text}"`);
    const a = bare(answer!).toLowerCase();
    for (const w of p.wrong) {
      if (w.toLowerCase() === a) fail(`pengecoh sama dengan jawaban: "${text}"`);
    }
    if (p.wrong[0].toLowerCase() === p.wrong[1].toLowerCase()) fail(`pengecoh kembar: "${text}"`);
    if ((p.item ? 1 : 0) + (p.emoji ? 1 : 0) !== 1) fail(`kalimat harus punya tepat satu gambar: "${text}"`);
  }
}

ISLANDS.forEach(check);

const levels: GameLevel<'word-voyage'>[] = ISLANDS.flatMap((isle) =>
  MODES.map(({ mode, say, stamp, label }) => ({
    id: `${isle.key}-${mode}`,
    narration: say,
    stamp: { emoji: stamp, label },
    data: { mode, island: isle.name, words: isle.words, phrases: isle.phrases },
  })),
);

const stages: Stage[] = ISLANDS.map((isle) => ({
  id: isle.key,
  label: isle.name.replace('Pulau ', ''),
  emoji: isle.emoji,
  slots: MODES.map(({ mode }) => `${isle.key}-${mode}`),
}));

const config: GameConfig<'word-voyage'> = {
  id: 'kapten-kata',
  group: 'sd2',
  title: 'Kapten Kata',
  emoji: '⛵',
  template: 'word-voyage',
  hints: true,
  project: { title: 'Peti Harta Kapten' },
  stageMap: {
    title: 'Ayo berlayar dari pulau ke pulau sambil belajar bahasa Inggris!',
    look: 'sea',
    stages,
  },
  levels,
};

export default config;
