import type { MixedGameConfig, MixedLevel, MixedSlot } from '@/engine/core/types';

/**
 * "Pasangan Pintar" (SD Kelas 1 & 2) — mencari HUBUNGAN antar dua hal:
 * profesi dengan alatnya, hewan dengan rumahnya, kata dengan lawan katanya,
 * soal hitung dengan hasilnya. Ditutup dengan kartu ingatan.
 *
 * Bedanya dengan Pasang Kata (SD, drag-drop): di sana anak memasangkan kata
 * dengan gambar bendanya — mengenali kata. Di sini yang dilatih penalaran:
 * dua hal berbeda yang berkaitan.
 *
 * CATATAN TEKNIS: template drag-drop memasangkan 1:1 — satu target hanya
 * menampung satu item. Jadi tiap level memakai target yang berbeda-beda,
 * bukan "kelompokkan banyak benda ke satu keranjang".
 */

/** Sepasang: target (tempat menaruh) dan item yang ditarik ke sana. */
interface Pair {
  /** Label target. */
  target: string;
  /** Emoji target (boleh kosong untuk target yang berupa tulisan saja). */
  targetEmoji?: string;
  /** Tulisan pada kartu yang ditarik. */
  item: string;
  /** Emoji pada kartu yang ditarik. */
  itemEmoji?: string;
}

/* ---------- Pembangun varian (id diisi oleh slot()) ---------- */

function match(narration: string, ...pairs: Pair[]): MixedLevel {
  // Kartu sengaja digeser satu posisi terhadap targetnya: template drag-drop
  // menampilkan target dan kartu dalam urutan config, jadi kalau keduanya
  // sejajar anak bisa menebak dari POSISI tanpa membaca pasangannya.
  const order = pairs.map((_, i) => (i + 1) % pairs.length);
  return {
    id: '',
    template: 'drag-drop',
    narration,
    data: {
      targets: pairs.map((p, i) => ({
        id: `t${i}`,
        ...(p.targetEmoji ? { emoji: p.targetEmoji } : {}),
        label: p.target,
      })),
      items: order.map((src) => {
        const p = pairs[src]!;
        return {
          id: `i${src}`,
          ...(p.itemEmoji ? { emoji: p.itemEmoji } : {}),
          text: p.item,
          targetId: `t${src}`,
        };
      }),
    },
  };
}

/** Profesi ↔ alat kerjanya. */
const job = (tool: string, toolName: string, person: string, personEmoji: string): Pair => ({
  target: toolName,
  targetEmoji: tool,
  item: person,
  itemEmoji: personEmoji,
});

/** Hewan ↔ tempat tinggalnya. */
const home = (place: string, placeName: string, animal: string, animalEmoji: string): Pair => ({
  target: placeName,
  targetEmoji: place,
  item: animal,
  itemEmoji: animalEmoji,
});

/** Lawan kata: target tulisan saja, kartunya juga tulisan saja. */
const opposite = (a: string, b: string): Pair => ({ target: a, item: b });

/** Soal hitung ↔ hasilnya. */
const solve = (question: string, answer: number): Pair => ({
  target: String(answer),
  item: question,
});

/** Kartu ingatan: cari dua gambar yang sama. */
function cards(...pairs: { id: string; emoji: string }[]): MixedLevel {
  return {
    id: '',
    template: 'memory',
    narration: 'Balik kartunya. Cari dua gambar yang sama!',
    data: { pairs },
  };
}

const card = (id: string, emoji: string) => ({ id, emoji });

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: MixedLevel[]): MixedSlot {
  return variants.map((v) => ({ ...v, id }));
}

const ASK_JOB = 'Tarik setiap orang ke alat kerjanya!';
const ASK_HOME = 'Tarik setiap hewan ke tempat tinggalnya!';
const ASK_OPPOSITE = 'Tarik setiap kata ke lawan katanya!';
const ASK_SOLVE = 'Tarik setiap soal ke hasilnya yang benar!';
const ASK_USE = 'Tarik setiap benda ke tempat yang tepat!';

const config: MixedGameConfig = {
  id: 'pasangan-pintar',
  group: 'sd1',
  title: 'Pasangan Pintar',
  emoji: '🧠',
  template: 'mixed',
  sessionLevels: 6,
  levels: [
    // --- 1. Profesi & alat kerjanya ---
    slot(
      'l1',
      match(
        ASK_JOB,
        job('🩺', 'stetoskop', 'dokter', '👩‍⚕️'),
        job('🚒', 'mobil pemadam', 'pemadam', '👨‍🚒'),
        job('🌾', 'sawah', 'petani', '👨‍🌾'),
      ),
      match(
        ASK_JOB,
        job('✂️', 'gunting', 'penata rambut', '💇'),
        job('🍳', 'wajan', 'koki', '👨‍🍳'),
        job('📚', 'buku', 'guru', '👩‍🏫'),
      ),
      match(
        ASK_JOB,
        job('🎨', 'kuas', 'pelukis', '👩‍🎨'),
        job('🚌', 'bus', 'sopir', '🧑‍✈️'),
        job('🔧', 'kunci', 'montir', '🧑‍🔧'),
        job('🚓', 'mobil polisi', 'polisi', '👮'),
      ),
    ),
    // --- 2. Hewan & tempat tinggalnya ---
    slot(
      'l2',
      match(
        ASK_HOME,
        home('🌊', 'laut', 'ikan', '🐟'),
        home('🪹', 'sarang', 'burung', '🐦'),
        home('🏡', 'kandang', 'ayam', '🐔'),
      ),
      match(
        ASK_HOME,
        home('🌳', 'pohon', 'monyet', '🐒'),
        home('🕸️', 'jaring', 'laba-laba', '🕷️'),
        home('🏞️', 'sungai', 'buaya', '🐊'),
      ),
      match(
        ASK_HOME,
        home('🌊', 'laut', 'gurita', '🐙'),
        home('🌵', 'gurun', 'unta', '🐫'),
        home('❄️', 'kutub', 'pinguin', '🐧'),
        home('🌳', 'hutan', 'harimau', '🐯'),
      ),
    ),
    // --- 3. Lawan kata ---
    slot(
      'l3',
      match(
        ASK_OPPOSITE,
        opposite('PANAS', 'DINGIN'),
        opposite('BESAR', 'KECIL'),
        opposite('TINGGI', 'RENDAH'),
      ),
      match(
        ASK_OPPOSITE,
        opposite('SIANG', 'MALAM'),
        opposite('BANYAK', 'SEDIKIT'),
        opposite('CEPAT', 'LAMBAT'),
      ),
      match(
        ASK_OPPOSITE,
        opposite('NAIK', 'TURUN'),
        opposite('BERAT', 'RINGAN'),
        opposite('DEPAN', 'BELAKANG'),
      ),
      match(
        ASK_OPPOSITE,
        opposite('BUKA', 'TUTUP'),
        opposite('BERSIH', 'KOTOR'),
        opposite('PANJANG', 'PENDEK'),
      ),
    ),
    // --- 4. Soal hitung & hasilnya ---
    slot(
      'l4',
      match(ASK_SOLVE, solve('5 + 3', 8), solve('9 − 4', 5), solve('6 + 6', 12)),
      match(ASK_SOLVE, solve('7 + 4', 11), solve('10 − 3', 7), solve('8 + 8', 16)),
      match(ASK_SOLVE, solve('12 − 5', 7), solve('9 + 5', 14), solve('20 − 10', 10)),
      match(
        ASK_SOLVE,
        solve('3 + 3', 6),
        solve('15 − 6', 9),
        solve('11 + 2', 13),
        solve('18 − 0', 18),
      ),
    ),
    // --- 5. Benda & tempatnya ---
    slot(
      'l5',
      match(
        ASK_USE,
        { target: 'rak buku', targetEmoji: '📚', item: 'buku', itemEmoji: '📕' },
        { target: 'kulkas', targetEmoji: '🧊', item: 'susu', itemEmoji: '🥛' },
        { target: 'tempat sampah', targetEmoji: '🗑️', item: 'sampah', itemEmoji: '🍌' },
      ),
      match(
        ASK_USE,
        { target: 'lemari', targetEmoji: '🗄️', item: 'baju', itemEmoji: '👕' },
        { target: 'jalan raya', targetEmoji: '🛣️', item: 'mobil', itemEmoji: '🚗' },
        { target: 'kolam', targetEmoji: '💧', item: 'ikan', itemEmoji: '🐠' },
      ),
      match(
        ASK_USE,
        { target: 'saat hujan', targetEmoji: '🌧️', item: 'payung', itemEmoji: '☂️' },
        { target: 'saat panas', targetEmoji: '☀️', item: 'topi', itemEmoji: '🧢' },
        { target: 'saat dingin', targetEmoji: '❄️', item: 'jaket', itemEmoji: '🧥' },
      ),
    ),
    // --- 6. Kartu ingatan, 4 pasang ---
    slot(
      'l6',
      cards(card('buku', '📕'), card('pensil', '✏️'), card('tas', '🎒'), card('bola', '⚽')),
      cards(card('kucing', '🐱'), card('kuda', '🐴'), card('bebek', '🦆'), card('katak', '🐸')),
      cards(card('mobil', '🚗'), card('kapal', '🚢'), card('sepeda', '🚲'), card('kereta', '🚂')),
      cards(card('bulan', '🌙'), card('awan', '☁️'), card('daun', '🍃'), card('bunga', '🌸')),
    ),
    // --- 7. Kartu ingatan, 5 pasang (lebih menantang dari kelompok TK) ---
    slot(
      'l7',
      cards(
        card('nasi', '🍚'),
        card('roti', '🍞'),
        card('susu', '🥛'),
        card('telur', '🥚'),
        card('madu', '🍯'),
      ),
      cards(
        card('gajah', '🐘'),
        card('jerapah', '🦒'),
        card('singa', '🦁'),
        card('zebra', '🦓'),
        card('monyet', '🐒'),
      ),
      cards(
        card('gitar', '🎸'),
        card('drum', '🥁'),
        card('piano', '🎹'),
        card('biola', '🎻'),
        card('terompet', '🎺'),
      ),
    ),
  ],
};

export default config;
