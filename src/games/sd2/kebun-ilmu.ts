import type { MixedGameConfig, MixedLevel, PlantPartId, TapChoice } from '@/engine/core/types';

/**
 * "Kebun Ilmu" (SD Kelas 3 & 4, kelompok `sd2`) — IPAS: tumbuhan, hewan,
 * cuaca, wujud zat, dan gaya. Patokannya `docs/rencana-game-sd-kelas-3-4.md`
 * bagian "10. Kebun Ilmu".
 *
 * Kelompok `sd2` masih `draft`, jadi game ini hanya terlihat di dev server &
 * build penguji sampai pemilik menyatakan `sd2` siap rilis.
 *
 * ALUR (kelas 3 dulu, lalu kelas 4; `sessionLevels: 10` mengambil sepuluh dari
 * dua belas slot secara acak — topiknya berdiri sendiri-sendiri, jadi tak ada
 * urutan kesulitan yang harus dijaga):
 *   l1  bagian tumbuhan (SENTUH tanaman)          — kls 3
 *   l2  herbivora / karnivora / omnivora (tarik)   — kls 3
 *   l3  daur hidup tumbuhan                        — kls 3
 *   l4  cuaca                                       — kls 3
 *   l5  dorong atau tarik                          — kls 3
 *   l6  fungsi bagian tumbuhan (SENTUH tanaman)    — kls 4
 *   l7  bagian yang kita makan (SENTUH tanaman)    — kls 4
 *   l8  fotosintesis sederhana                     — kls 4
 *   l9  rantai makanan                             — kls 4
 *   l10 wujud zat: padat / cair / gas (tarik)      — kls 4
 *   l11 perubahan wujud                            — kls 4
 *   l12 jenis gaya                                 — kls 4
 *
 * KEPUTUSAN PEMILIK (2026-09-29), jangan diubah diam-diam:
 * - Tanamannya SVG engine (`src/engine/ui/Plant.tsx`), bukan ilustrasi impor.
 * - "Kelompokkan" memakai drag-drop 1:1 yang ada (satu hewan / benda per
 *   kotak), dan rantai makanan memakai tap-answer ("apa yang hilang di
 *   rantai?") — BUKAN drag-drop urut baru.
 * - Hewan HANYA yang sudah punya seni WebP. Ulat, belalang, ular, elang, dan
 *   tikus belum punya seni, jadi rantai makanan di sini tiga tingkat dari
 *   hewan yang ada (wortel → kelinci → harimau, pisang → monyet → harimau).
 *   Begitu seninya datang, tinggal menambah varian.
 *
 * ATURAN MENULIS VARIAN BARU:
 * - Narasi tanpa digit (`npm run narasi` gagal kalau ada).
 * - Kalimat soal TIDAK boleh memuat jawabannya ("Mencabut wortel", bukan
 *   "Menarik wortel" untuk soal dorong/tarik).
 * - Soal SENTUH tanaman: kalimat ≤ 40 karakter (tiga baris di HP 320 px),
 *   dijaga `scripts/check-body-parts.mjs` bersama daerah sentuhnya.
 * - Pengecoh dari kesalahan khas: akar ↔ batang (sama-sama mengangkut air),
 *   hewan pemakan tumbuhan di posisi pemangsa, mencair ↔ membeku, berteduh di
 *   bawah pohon saat petir.
 * - Satu gambar satu arti: 💨 = udara, ♨️ = uap air, 💧 = air. Jangan dipakai
 *   untuk arti lain di game ini.
 */

/* ---------- builders ---------- */

/** Sentuh bagian tanaman. Jawaban ditulis pertama, pengecoh sesudahnya. */
function touch(narration: string, answer: PlantPartId, ...decoys: PlantPartId[]): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-picture',
    data: { figure: 'tanaman', parts: [answer, ...decoys], answer },
  };
}

/** Sama, dengan isyarat benda di pojok gambar ("Wortel itu bagian yang mana?"). */
function touchWith(
  narration: string,
  cueItem: string,
  answer: PlantPartId,
  ...decoys: PlantPartId[]
): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-picture',
    data: { figure: 'tanaman', parts: [answer, ...decoys], answer, cueItem },
  };
}

/** Satu pilihan jawaban: teks + emoji, atau teks + seni registry (`item:`). */
type Opt = [text: string, pic?: string];

function opt([text, pic]: Opt, i: number, correct: boolean): TapChoice {
  const art = pic?.startsWith('item:') ? pic.slice(5) : undefined;
  return {
    id: `c${i}`,
    text,
    item: art,
    emoji: art ? undefined : pic,
    correct: correct || undefined,
  };
}

/** Kartu jawaban. Urutan tampilnya diacak engine (`TapAnswer`), jadi yang
 *  benar boleh selalu ditulis pertama di sini. */
function cards(answer: Opt, decoys: Opt[]): TapChoice[] {
  return [opt(answer, 0, true), ...decoys.map((d, i) => opt(d, i + 1, false))];
}

/** Soal pilih jawaban: jawaban, pengecoh, lalu isyarat gambar opsional. */
function ask(
  narration: string,
  answer: Opt,
  decoys: Opt[],
  cue: { picture?: string; pictureItem?: string; board?: string } = {},
): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-answer',
    data: { ...cue, choices: cards(answer, decoys) },
  };
}

/** Rantai makanan bergambar: tiga seni + panah, satu posisi jadi "?". */
function chain(
  narration: string,
  links: [string, string, string],
  missing: 0 | 1 | 2,
  decoys: string[],
): MixedLevel {
  const board = links.flatMap((item, i) => [
    ...(i > 0 ? [{ op: 'arrow' as const }] : []),
    i === missing ? { op: 'question' as const } : { item, count: 1 },
  ]);
  const choices = cards(
    [label(links[missing]), `item:${links[missing]}`],
    decoys.map((d) => [label(d), `item:${d}`] as Opt),
  );
  return { id: '', narration, template: 'tap-answer', data: { boardItems: board, boardRow: true, choices } };
}

/** Rantai bergambar lengkap + pertanyaan istilah (produsen/konsumen). */
function chainTerm(
  narration: string,
  links: [string, string, string],
  answer: string,
  decoys: string[],
): MixedLevel {
  const board = links.flatMap((item, i) => [...(i > 0 ? [{ op: 'arrow' as const }] : []), { item, count: 1 }]);
  return {
    id: '',
    narration,
    template: 'tap-answer',
    data: { boardItems: board, boardRow: true, choices: cards([answer], decoys.map((d) => [d] as Opt)) },
  };
}

const NAMES: Record<string, string> = {
  carrot: 'Wortel',
  rabbit: 'Kelinci',
  tiger: 'Harimau',
  banana: 'Pisang',
  monkey: 'Monyet',
  goat: 'Kambing',
  cow: 'Sapi',
  lion: 'Singa',
  cat: 'Kucing',
  corn: 'Jagung',
  chicken: 'Ayam',
  horse: 'Kuda',
};
const label = (id: string) => NAMES[id] ?? id;

/** Tiga kotak kelompok makanan hewan. */
const EATERS = [
  { id: 'herbi', emoji: '🌿', label: 'Herbivora' },
  { id: 'karni', emoji: '🍖', label: 'Karnivora' },
  { id: 'omni', emoji: '🌿🍖', label: 'Omnivora' },
];

type Animal = [item: string, name: string];

/**
 * Satu hewan per kotak. Kartunya GAMBAR SAJA, tanpa nama: yang dilatih di sini
 * mengelompokkan menurut makanannya, dan nama tujuh huruf ("Kambing",
 * "Harimau") melebarkan kartu sampai tiga kartu tak muat sebaris di HP 320 px
 * (terukur: scroll 72 px). Kartunya DIGESER satu posisi dari kotaknya (omnivora
 * paling kiri): kalau hewan ke-i selalu sejajar kotak ke-i, anak bisa menebak
 * dari posisi — pelajaran `match()` di Pasangan Pintar.
 */
function eaters(herbi: Animal, karni: Animal, omni: Animal): MixedLevel {
  const item = ([id]: Animal, targetId: string) => ({ id: `${targetId}-${id}`, item: id, targetId });
  return {
    id: '',
    narration: 'Tarik tiap hewan ke kelompok makanannya!',
    template: 'drag-drop',
    data: {
      targets: EATERS,
      items: [item(omni, 'omni'), item(herbi, 'herbi'), item(karni, 'karni')],
    },
  };
}

const STATES = [
  { id: 'padat', label: 'Padat' },
  { id: 'cair', label: 'Cair' },
  { id: 'gas', label: 'Gas' },
];

type Thing = [text: string, pic: string];

/** Satu benda per wujud; urutan kartunya digeser (gas paling kiri). */
function states(padat: Thing, cair: Thing, gas: Thing): MixedLevel {
  const item = ([text, pic]: Thing, targetId: string) => {
    const art = pic.startsWith('item:') ? pic.slice(5) : undefined;
    return { id: `${targetId}-${text}`, text, item: art, emoji: art ? undefined : pic, targetId };
  };
  return {
    id: '',
    narration: 'Tarik tiap benda ke wujudnya!',
    template: 'drag-drop',
    data: {
      targets: STATES,
      items: [item(gas, 'gas'), item(padat, 'padat'), item(cair, 'cair')],
    },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: MixedLevel[]): MixedLevel[] {
  return variants.map((v) => ({ ...v, id }));
}

/* ---------- pilihan yang sering dipakai ---------- */

const DORONG: Opt = ['Dorong'];
const TARIK: Opt = ['Tarik'];
const MENCAIR: Opt = ['Mencair'];
const MEMBEKU: Opt = ['Membeku'];
const MENGUAP: Opt = ['Menguap'];
const MENGEMBUN: Opt = ['Mengembun'];

const config: MixedGameConfig = {
  id: 'kebun-ilmu',
  group: 'sd2',
  title: 'Kebun Ilmu',
  emoji: '🌱',
  template: 'mixed',
  sessionLevels: 10,
  levels: [
    // --- l1 (kls 3) Bagian tumbuhan: sebut namanya, sentuh bagiannya ---
    slot(
      'l1',
      touch('Sentuh akar tanaman ini!', 'akar', 'batang', 'daun', 'buah'),
      touch('Sentuh batang tanaman ini!', 'batang', 'akar', 'daun', 'bunga'),
      touch('Sentuh daun tanaman ini!', 'daun', 'batang', 'bunga', 'buah'),
      touch('Sentuh bunga tanaman ini!', 'bunga', 'daun', 'buah', 'akar'),
      touch('Sentuh buah tanaman ini!', 'buah', 'bunga', 'daun', 'batang'),
    ),

    // --- l2 (kls 3) Hewan & makanannya ---
    slot(
      'l2',
      eaters(['cow', 'Sapi'], ['lion', 'Singa'], ['chicken', 'Ayam']),
      eaters(['goat', 'Kambing'], ['tiger', 'Harimau'], ['monkey', 'Monyet']),
      eaters(['rabbit', 'Kelinci'], ['cat', 'Kucing'], ['bear', 'Beruang']),
      eaters(['horse', 'Kuda'], ['lion', 'Singa'], ['duck', 'Bebek']),
      eaters(['zebra', 'Zebra'], ['tiger', 'Harimau'], ['chicken', 'Ayam']),
      eaters(['giraffe', 'Jerapah'], ['frog', 'Katak'], ['monkey', 'Monyet']),
      eaters(['elephant', 'Gajah'], ['penguin', 'Pinguin'], ['bear', 'Beruang']),
    ),

    // --- l3 (kls 3) Daur hidup tumbuhan ---
    slot(
      'l3',
      ask('Lihat urutannya. Apa yang hilang?', ['Kecambah', '🌱'], [['Buah', '🍅'], ['Bunga', '🌼']], {
        board: '🫘 → ? → 🪴',
      }),
      ask('Biji lalu kecambah. Sesudahnya jadi apa?', ['Tanaman muda', '🪴'], [['Biji', '🫘'], ['Buah', '🍅']], {
        board: '🫘 → 🌱 → ?',
      }),
      ask('Tanaman sudah berbunga. Sesudahnya apa?', ['Buah', '🍅'], [['Kecambah', '🌱'], ['Biji', '🫘']], {
        board: '🪴 → 🌼 → ?',
      }),
      ask('Di dalam buah ada apa?', ['Biji', '🫘'], [['Batu', '🪨'], ['Bunga', '🌼']], {
        picture: '🍅',
      }),
      ask('Kecambah tumbuh dari apa?', ['Biji', '🫘'], [['Bunga', '🌼'], ['Buah', '🍅']], {
        picture: '🌱',
      }),
      ask('Biji butuh apa supaya bisa tumbuh?', ['Air', '💧'], [['Garam', '🧂'], ['Plastik', '🛍️']]),
    ),

    // --- l4 (kls 3) Cuaca ---
    slot(
      'l4',
      ask('Langit mendung gelap. Sebentar lagi?', ['Hujan', '🌧️'], [['Terik', '☀️'], ['Pelangi', '🌈']], {
        picture: '☁️',
      }),
      ask('Hujan turun deras. Apa yang kita bawa?', ['Payung', 'item:umbrella'], [['Topi', 'item:cap'], ['Bola', 'item:ball']]),
      ask('Hujan reda, matahari muncul. Terlihat?', ['Pelangi', '🌈'], [['Bulan', '🌙'], ['Petir', '⚡']]),
      ask('Kapan jemuran paling cepat kering?', ['Panas terik', '☀️'], [['Hujan', '🌧️'], ['Malam', '🌙']], {
        picture: '👕',
      }),
      ask('Siang sangat terik. Apa yang kita pakai?', ['Topi', 'item:cap'], [['Buku', 'item:book'], ['Kunci', 'item:key']]),
      ask(
        'Ada petir menyambar. Sebaiknya kita?',
        ['Masuk rumah', 'item:house'],
        [['Berteduh di pohon', 'item:tree'], ['Main bola', 'item:ball']],
                { picture: '⚡' },
      ),
    ),

    // --- l5 (kls 3) Dorong atau tarik ---
    slot(
      'l5',
      ask('Menendang bola. Gaya apa itu?', DORONG, [TARIK], { pictureItem: 'ball' }),
      ask('Membuka laci meja. Gaya apa itu?', TARIK, [DORONG], { picture: '🗄️' }),
      ask('Mencabut wortel dari tanah. Gaya apa?', TARIK, [DORONG], { pictureItem: 'carrot' }),
      ask('Menimba air dari sumur. Gaya apa itu?', TARIK, [DORONG], { picture: '🪣' }),
      ask('Menekan tombol bel. Gaya apa itu?', DORONG, [TARIK], { picture: '🔔' }),
      ask('Menutup laci meja. Gaya apa itu?', DORONG, [TARIK], { picture: '🗄️' }),
    ),

    // --- l6 (kls 4) Fungsi bagian tumbuhan ---
    slot(
      'l6',
      touch('Mana yang menyerap air dari tanah?', 'akar', 'batang', 'daun'),
      touch('Mana yang membuat makanan tumbuhan?', 'daun', 'batang', 'akar', 'buah'),
      touch('Mana yang mengalirkan air ke daun?', 'batang', 'akar', 'bunga'),
      touch('Mana yang menyimpan biji?', 'buah', 'bunga', 'daun'),
      touch('Mana yang didatangi lebah?', 'bunga', 'buah', 'daun'),
      touch('Mana yang mencengkeram tanah?', 'akar', 'batang', 'buah'),
      touch('Mana yang menopang daun dan bunga?', 'batang', 'akar', 'buah'),
    ),

    // --- l7 (kls 4) Bagian tumbuhan yang kita makan ---
    slot(
      'l7',
      touchWith('Wortel itu bagian yang mana?', 'carrot', 'akar', 'batang', 'buah'),
      touchWith('Apel itu bagian yang mana?', 'apple', 'buah', 'bunga', 'daun'),
      touchWith('Mangga itu bagian yang mana?', 'mango', 'buah', 'akar', 'daun'),
      touch('Bayam yang kita makan bagian mana?', 'daun', 'akar', 'buah'),
      touch('Tebu yang manis itu bagian mana?', 'batang', 'daun', 'akar'),
      touch('Singkong itu bagian yang mana?', 'akar', 'batang', 'daun'),
    ),

    // --- l8 (kls 4) Fotosintesis sederhana ---
    slot(
      'l8',
      ask(
        'Daun membuat makanan dengan bantuan?',
        ['Cahaya matahari', 'item:sun'],
        [['Cahaya bulan', '🌙'], ['Garam', '🧂']],
                { picture: '🌿' },
      ),
      ask('Tanaman lama di tempat gelap. Jadinya?', ['Layu', '🥀'], [['Makin subur', '🌳'], ['Berbuah', '🍅']]),
      ask('Saat membuat makanan, daun melepas?', ['Oksigen'], [['Asap'], ['Garam']], {
        picture: '🌿',
      }),
      ask('Zat hijau daun namanya?', ['Klorofil'], [['Kalori'], ['Karbon']], { picture: '🌿' }),
      ask('Tumbuhan membuat makanannya dari?', ['Air dan cahaya'], [['Tanah saja'], ['Pupuk saja']]),
    ),

    // --- l9 (kls 4) Rantai makanan ---
    slot(
      'l9',
      chain('Siapa yang memakan kelinci?', ['carrot', 'rabbit', 'tiger'], 2, ['goat', 'cow']),
      chain('Apa yang dimakan kelinci?', ['carrot', 'rabbit', 'tiger'], 0, ['lion', 'cat']),
      chain('Siapa yang hilang di tengah?', ['carrot', 'rabbit', 'tiger'], 1, ['lion', 'carrot']),
      chain('Apa yang dimakan monyet?', ['banana', 'monkey', 'tiger'], 0, ['tiger', 'lion']),
      chain('Siapa yang memakan monyet?', ['banana', 'monkey', 'tiger'], 2, ['goat', 'rabbit']),
      chainTerm('Tumbuhan di awal rantai disebut?', ['carrot', 'rabbit', 'tiger'], 'Produsen', ['Konsumen', 'Pengurai']),
      chainTerm('Kalau kelinci habis, harimau jadi?', ['carrot', 'rabbit', 'tiger'], 'Kelaparan', ['Makin banyak', 'Makan wortel']),
    ),

    // --- l10 (kls 4) Wujud zat ---
    slot(
      'l10',
      states(['Batu', '🪨'], ['Air', '💧'], ['Udara', '💨']),
      states(['Buku', 'item:book'], ['Susu', 'item:milk'], ['Uap air', '♨️']),
      states(['Kunci', 'item:key'], ['Madu', '🍯'], ['Udara', '💨']),
      states(['Kayu', '🪵'], ['Susu', 'item:milk'], ['Uap air', '♨️']),
      states(['Bola', 'item:ball'], ['Air', '💧'], ['Uap air', '♨️']),
      states(['Pensil', 'item:pencil'], ['Madu', '🍯'], ['Udara', '💨']),
    ),

    // --- l11 (kls 4) Perubahan wujud ---
    slot(
      'l11',
      ask('Es batu kena panas matahari. Ia?', MENCAIR, [MEMBEKU, MENGUAP], { picture: '🧊' }),
      ask('Air ditaruh di pembeku kulkas. Ia?', MEMBEKU, [MENCAIR, MENGUAP], { picture: '💧' }),
      ask('Air direbus lama-lama berkurang. Ia?', MENGUAP, [MEMBEKU, MENGEMBUN], { picture: '🍲' }),
      ask('Cokelat di saku jadi lembek. Ia?', MENCAIR, [MENGUAP, MEMBEKU], { picture: '🍫' }),
      ask('Gelas es dingin, luarnya basah. Itu?', MENGEMBUN, [MENCAIR, MENGUAP], { picture: '🥤' }),
      ask('Baju basah dijemur jadi kering. Airnya?', MENGUAP, [MENGEMBUN, MEMBEKU], { picture: '👕' }),
      ask('Lilin menyala lama-lama meleleh. Ia?', MENCAIR, [MEMBEKU, MENGEMBUN], { picture: '🕯️' }),
    ),

    // --- l12 (kls 4) Jenis gaya ---
    slot(
      'l12',
      ask('Apel jatuh dari pohon karena gaya?', ['Gravitasi'], [['Magnet'], ['Otot']], { pictureItem: 'apple' }),
      ask('Sepeda berhenti pelan-pelan karena gaya?', ['Gesek'], [['Gravitasi'], ['Magnet']], { picture: '🚲' }),
      ask('Mengangkat tas memakai gaya?', ['Otot'], [['Magnet'], ['Gesek']], { picture: '🎒' }),
      ask('Kita melompat lalu turun lagi karena?', ['Gravitasi'], [['Otot'], ['Gesek']]),
      ask('Rem sepeda bekerja memakai gaya?', ['Gesek'], [['Otot'], ['Gravitasi']]),
      ask('Bola menggelinding lalu berhenti karena?', ['Gesek'], [['Magnet'], ['Otot']], { pictureItem: 'ball' }),
    ),
  ],
};

export default config;
