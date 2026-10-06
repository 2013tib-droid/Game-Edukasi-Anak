import type { GameConfig, GameLevel, LevelStamp, TrainRound } from '@/engine/core/types';

/**
 * "Susun Kalimat" (SD Kelas 3 & 4, kelompok `sd2`, mapel Bahasa Indonesia) —
 * versi premium "Kereta Kata" (docs/rencana-game-sd-kelas-3-4.md 2b.3 no. 6).
 * Kelompok `sd2` masih `draft`, jadi game ini hanya terlihat di dev server &
 * build penguji.
 *
 * KEPUTUSAN PEMILIK (2026-10-05, ditanyakan sebelum mulai):
 * - Cara main "Kereta Kata": kata = gerbong, diseret ke rel (template engine
 *   baru `word-train`), bukan mengetuk kartu.
 * - Materi: susun kalimat + tanda baca · huruf kapital · kata kerja & kata
 *   sifat · kata baku · imbuhan me-/ber-.
 * - Kalimat DIBACAKAN hanya SESUDAH benar, saat kereta berangkat. Narasi soal
 *   tak pernah menyebut kalimatnya (yang dilatih membaca, bukan mendengar).
 *
 * ALUR — urutan TETAP, tanpa `sessionLevels` (kesulitannya naik, dan proyek
 * sesinya "Kereta Kata" terisi berurutan):
 *   l1 susun 3–4 kata                       (kls 3)
 *   l2 tanda baca akhir . ? !               (kls 3)
 *   l3 huruf kapital (awal kalimat & nama)   (kls 3)
 *   l4 kata kerja                           (kls 3)
 *   l5 kata sifat                           (kls 3)
 *   l6 kalimat lima kata                    (kls 4)
 *   l7 kata baku vs tidak baku              (kls 4)
 *   l8 imbuhan me- / ber-                   (kls 4)
 *   l9 MISI BESAR: dua kalimat jadi satu cerita pendek (tokoh hewan)
 *
 * ATURAN MENULIS VARIAN BARU:
 * - `words` = kalimat UTUH yang benar, tanda bacanya gerbong terakhir. Kalimat
 *   itu sekaligus baris narasi (dibacakan), jadi TANPA digit.
 * - Kalimat yang bisa disusun lebih dari satu cara benar WAJIB menulis `alt`,
 *   atau diganti kalimat yang urutannya cuma satu. Kalau tidak, anak yang
 *   benar ditolak — itu lebih buruk daripada soal yang terlalu mudah.
 * - Paling banyak 7 gerbong di baki (kata + pengecoh): lebih dari itu, rel &
 *   baki tidak muat di HP 320 px.
 * - Soal kata kerja/sifat: kalimatnya HANYA boleh punya satu kata kerja /
 *   satu kata sifat — kalau dua, jawaban yang benar ditolak.
 * - Imbuhan ditulis dengan `|` ("me|nyapu"); pengecohnya imbuhan yang salah
 *   dan BUKAN kata yang ada artinya ("bertanam", "menyanyi" dibuang karena
 *   dua-duanya kata sungguhan).
 */

const PUNCT = ['.', '?', '!'];

/** "Ibu memasak nasi." → ['Ibu','memasak','nasi','.'] */
function w(sentence: string): string[] {
  const m = sentence.match(/^(.*?)([.?!])$/);
  if (!m) throw new Error(`Kalimat tanpa tanda baca: ${sentence}`);
  return [...m[1]!.trim().split(/\s+/), m[2]!];
}

type Level = GameLevel<'word-train'>;

function level(narration: string, rounds: TrainRound[]): Level {
  return { id: '', narration, data: { rounds, scene: 'kota' } };
}

function order(
  narration: string,
  sentence: string,
  extra: { decoys?: string[]; alt?: string[] } = {},
): Level {
  return level(narration, [
    { kind: 'order', words: w(sentence), decoys: extra.decoys, alt: extra.alt?.map(w) },
  ]);
}

/** Pengecoh tanda baca: dua tanda yang bukan miliknya. */
function punct(narration: string, sentence: string): Level {
  const own = sentence.slice(-1);
  return order(narration, sentence, { decoys: PUNCT.filter((p) => p !== own) });
}

function pick(narration: string, sentence: string, answer: string): Level {
  const words = w(sentence);
  const i = words.indexOf(answer);
  if (i < 0) throw new Error(`"${answer}" tidak ada di "${sentence}"`);
  return level(narration, [{ kind: 'pick', words, answer: [i] }]);
}

/** `right`/`wrong` ditulis apa adanya (boleh ber-`|` untuk imbuhan). */
function fill(narration: string, sentence: string, right: string, wrong: string): Level {
  const words = w(sentence);
  const plain = right.replace(/\|/g, '');
  const gap = words.indexOf(plain);
  if (gap < 0) throw new Error(`"${plain}" tidak ada di "${sentence}"`);
  words[gap] = right;
  return level(narration, [{ kind: 'fill', words, gap, options: [right, wrong] }]);
}

function story(first: string, second: string): Level {
  return level(MISI, [
    { kind: 'order', words: w(first) },
    { kind: 'order', words: w(second), say: MISI_LANJUT },
  ]);
}

/** Semua varian dalam satu slot berbagi id & gerbong proyeknya. */
function slot(id: string, stamp: LevelStamp, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id, stamp }));
}

const SUSUN = 'Seret gerbong kata jadi kalimat yang benar!';
const TANDA = 'Susun kalimatnya, lalu pasang tanda baca yang tepat!';
const KAPITAL = 'Susun kalimatnya. Ingat huruf kapital!';
const KERJA = 'Sentuh gerbong yang berisi kata kerja!';
const SIFAT = 'Sentuh gerbong yang berisi kata sifat!';
const PANJANG = 'Kalimatnya lebih panjang! Susun gerbongnya!';
const BAKU = 'Isi gerbong kosong dengan kata yang baku!';
const IMBUHAN = 'Isi gerbong kosong dengan imbuhan yang tepat!';
const MISI = 'Misi besar! Susun dua kalimat jadi cerita!';
const MISI_LANJUT = 'Bagus! Sekarang susun kalimat kedua!';

const config: GameConfig<'word-train'> = {
  id: 'susun-kalimat',
  group: 'sd2',
  title: 'Susun Kalimat',
  emoji: '🚂',
  template: 'word-train',
  project: { title: 'Kereta Kata' },
  levels: [
    // --- l1 Susun 3–4 kata ---
    slot(
      'l1',
      { emoji: '🚃', label: 'Susun' },
      order(SUSUN, 'Ibu memasak nasi.'),
      order(SUSUN, 'Adik makan roti.'),
      order(SUSUN, 'Ayah membaca koran.'),
      order(SUSUN, 'Kakak menyapu halaman.'),
      order(SUSUN, 'Kucing tidur di kursi.'),
      order(SUSUN, 'Burung bernyanyi di pohon.'),
    ),

    // --- l2 Tanda baca akhir ---
    slot(
      'l2',
      { emoji: '❓', label: 'Tanda' },
      punct(TANDA, 'Siapa nama kucingmu?'),
      punct(TANDA, 'Apakah kamu sudah makan?'),
      punct(TANDA, 'Ayo kita bermain!'),
      punct(TANDA, 'Tolong buka pintunya!'),
      punct(TANDA, 'Adik sedang tidur.'),
      punct(TANDA, 'Jangan buang sampah sembarangan!'),
    ),

    // --- l3 Huruf kapital: awal kalimat & nama orang/tempat ---
    slot(
      'l3',
      { emoji: '🔠', label: 'Kapital' },
      order(KAPITAL, 'Rina pergi ke Bali.', { decoys: ['rina', 'bali'] }),
      order(KAPITAL, 'Kami tinggal di Medan.', { decoys: ['kami', 'medan'] }),
      order(KAPITAL, 'Budi suka makan apel.', { decoys: ['budi'] }),
      order(KAPITAL, 'Nenek tinggal di Bandung.', { decoys: ['nenek', 'bandung'] }),
      order(KAPITAL, 'Ayah bekerja di Jakarta.', { decoys: ['ayah', 'jakarta'] }),
      order(KAPITAL, 'Tono dan Rani bermain.', {
        decoys: ['tono'],
        alt: ['Rani dan Tono bermain.'],
      }),
    ),

    // --- l4 Kata kerja (satu per kalimat) ---
    slot(
      'l4',
      { emoji: '🏃', label: 'Kerja' },
      pick(KERJA, 'Kakak membaca buku.', 'membaca'),
      pick(KERJA, 'Ayah menyiram tanaman.', 'menyiram'),
      pick(KERJA, 'Adik tidur di kamar.', 'tidur'),
      pick(KERJA, 'Kucing mengejar tikus.', 'mengejar'),
      pick(KERJA, 'Ibu menjahit baju.', 'menjahit'),
      pick(KERJA, 'Rina menulis surat.', 'menulis'),
    ),

    // --- l5 Kata sifat (satu per kalimat, tanpa kata kerja) ---
    slot(
      'l5',
      { emoji: '🌸', label: 'Sifat' },
      pick(SIFAT, 'Bunga mawar itu harum.', 'harum'),
      pick(SIFAT, 'Gajah itu besar.', 'besar'),
      pick(SIFAT, 'Kue buatan Ibu enak.', 'enak'),
      pick(SIFAT, 'Air sungai itu jernih.', 'jernih'),
      pick(SIFAT, 'Kamar Adik bersih.', 'bersih'),
      pick(SIFAT, 'Kelinci itu lucu.', 'lucu'),
    ),

    // --- l6 Kalimat lima kata ---
    slot(
      'l6',
      { emoji: '🛤️', label: 'Panjang' },
      order(PANJANG, 'Adik bermain bola di halaman.'),
      order(PANJANG, 'Kakak membantu Ibu memasak.', {
        alt: ['Ibu membantu Kakak memasak.'],
      }),
      order(PANJANG, 'Kami belajar di perpustakaan sekolah.'),
      order(PANJANG, 'Nenek menanam bunga di kebun.'),
      order(PANJANG, 'Ayah pergi ke pasar pagi ini.', {
        alt: ['Ayah pergi pagi ini ke pasar.'],
      }),
      order(PANJANG, 'Pak Guru menulis di papan.'),
    ),

    // --- l7 Kata baku vs tidak baku ---
    slot(
      'l7',
      { emoji: '📘', label: 'Baku' },
      fill(BAKU, 'Ibu membeli obat di apotek.', 'apotek', 'apotik'),
      fill(BAKU, 'Adik makan telur rebus.', 'telur', 'telor'),
      fill(BAKU, 'Ayah memberi nasihat baik.', 'nasihat', 'nasehat'),
      fill(BAKU, 'Kami membaca jadwal pelajaran.', 'jadwal', 'jadual'),
      fill(BAKU, 'Nenek menanam cabai merah.', 'cabai', 'cabe'),
      fill(BAKU, 'Hari Rabu kami berenang.', 'Rabu', 'Rebo'),
    ),

    // --- l8 Imbuhan me- / ber- ---
    slot(
      'l8',
      { emoji: '🧩', label: 'Imbuhan' },
      fill(IMBUHAN, 'Ibu menyapu lantai.', 'me|nyapu', 'ber|sapu'),
      fill(IMBUHAN, 'Adik bersepeda ke taman.', 'ber|sepeda', 'me|nyepeda'),
      fill(IMBUHAN, 'Kakak memasak nasi goreng.', 'me|masak', 'ber|masak'),
      fill(IMBUHAN, 'Kami bermain bola.', 'ber|main', 'me|main'),
      fill(IMBUHAN, 'Adik menyiram bunga.', 'me|nyiram', 'ber|siram'),
      fill(IMBUHAN, 'Kucing berlari di halaman.', 'ber|lari', 'me|lari'),
    ),

    // --- l9 MISI BESAR: dua kalimat jadi satu cerita ---
    slot(
      'l9',
      { emoji: '🏁', label: 'Cerita' },
      story('Kancil haus sekali.', 'Ia minum di sungai.'),
      story('Kucing melihat bola.', 'Ia mengejar bola itu.'),
      story('Burung membuat sarang.', 'Sarangnya di pohon tinggi.'),
      story('Kelinci lapar sekali.', 'Ia makan wortel segar.'),
      story('Gajah mandi di sungai.', 'Belalainya menyemprot air.'),
      story('Monyet naik pohon.', 'Ia memetik pisang.'),
    ),
  ],
};

export default config;
