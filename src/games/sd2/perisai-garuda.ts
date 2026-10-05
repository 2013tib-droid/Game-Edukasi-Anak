import type {
  LevelStamp,
  MixedGameConfig,
  MixedLevel,
  SilaId,
  StoryPage,
  TapChoice,
} from '@/engine/core/types';

/**
 * "Perisai Garuda" (SD Kelas 3 & 4, kelompok `sd2`, mapel Pancasila) — game
 * Pendidikan Pancasila pertama. Kelompok `sd2` masih `draft`, jadi game ini
 * hanya terlihat di dev server & build penguji.
 *
 * KEPUTUSAN PEMILIK (2026-10-05, ditanyakan sebelum mulai):
 * - Lambang sila DIGAMBAR ENGINE (`src/engine/ui/Sila.tsx`), bukan emoji
 *   (🐂 bukan kepala banteng, padi-kapas tak ada emojinya) dan bukan impor.
 * - Isinya keempat kelompok materi: lambang & urutan sila · sikap sehari-hari ·
 *   aturan, hak & kewajiban · keberagaman & gotong royong. Rumah/pakaian adat
 *   BELUM (butuh seni).
 * - Nama "Perisai Garuda": proyek sesinya (`project`) — tiap level yang benar
 *   mengisi satu halaman, lima yang pertama berisi lambang sila 1–5, jadi di
 *   layar "Selamat!" perisainya lengkap.
 *
 * ALUR — urutan TETAP, tanpa `sessionLevels` (proyek sesinya membaca seperti
 * satu perjalanan, dan lambang 1–5 terisi berurutan):
 *   l1 sila → lambangnya                 (kls 3)
 *   l2 lambang → sila ke berapa           (kls 3)
 *   l3 urutan sila (tarik lambang ke nomornya)
 *   l4 Garuda Pancasila & semboyan
 *   l5 sikap sehari-hari → sila mana      (kls 3–4)
 *   l6 aturan di rumah, sekolah & jalan   (kls 3)
 *   l7 hak & kewajiban                    (kls 4)
 *   l8 keberagaman                        (kls 3–4)
 *   l9 MISI BESAR: kerja bakti — cerita bercabang tentang gotong royong
 *
 * ATURAN MENULIS VARIAN BARU:
 * - Narasi tanpa digit (`npm run narasi` gagal kalau ada); kalimat soal ≤ ±70
 *   karakter supaya muat di HP 320 px.
 * - Jawaban berupa KALIMAT selalu memakai emoji + teks (keterangan boleh turun
 *   baris di spasi). Tulisan tanpa gambar dibesarkan sebaris penuh, jadi
 *   kalimat panjang mengecil sampai tak terbaca.
 * - Kalau emoji pilihan bisa membocorkan jawaban (soal arti semboyan dsb.),
 *   pakai emoji yang SAMA untuk semua pilihan.
 * - Lambang negara: jangan dipakai untuk pilihan yang lucu-lucuan atau salah
 *   arti; pengecoh di soal lambang selalu lambang sila yang lain.
 */

const ALL: SilaId[] = [1, 2, 3, 4, 5];

/** Dua lambang lain sebagai pengecoh — tetap tetangganya supaya bervariasi. */
function others(n: SilaId): SilaId[] {
  const rest = ALL.filter((s) => s !== n);
  const i = (n - 1) % rest.length;
  return [rest[i], rest[(i + 2) % rest.length]];
}

function silaChoices(answer: SilaId, decoys: SilaId[] = others(answer)): TapChoice[] {
  return [
    { id: `s${answer}`, sila: answer, correct: true },
    ...decoys.map((d) => ({ id: `s${d}`, sila: d })),
  ];
}

/** Satu pilihan kalimat: [teks, emoji]. */
type Opt = [text: string, emoji: string];

function cards(answer: Opt, decoys: Opt[]): TapChoice[] {
  return [
    { id: 'c0', text: answer[0], emoji: answer[1], correct: true },
    ...decoys.map(([text, emoji], i) => ({ id: `c${i + 1}`, text, emoji })),
  ];
}

function ask(narration: string, answer: Opt, decoys: Opt[], picture?: string): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-answer',
    data: { picture, choices: cards(answer, decoys) },
  };
}

/** Soal yang jawabannya lambang sila (tiga kartu sebaris). */
function pickSila(narration: string, answer: SilaId, picture?: string): MixedLevel {
  return {
    id: '',
    narration,
    template: 'tap-answer',
    data: { picture, choiceRow: true, choices: silaChoices(answer) },
  };
}

/** Lambang besar di atas, jawabannya nomor sila. */
function whichNumber(n: SilaId): MixedLevel {
  const [a, b] = others(n);
  return {
    id: '',
    narration: 'Lambang ini milik sila ke berapa?',
    template: 'tap-answer',
    data: {
      sila: n,
      choices: [
        { id: `n${n}`, text: String(n), correct: true },
        { id: `n${a}`, text: String(a) },
        { id: `n${b}`, text: String(b) },
      ],
    },
  };
}

const ORDINAL: Record<SilaId, string> = {
  1: 'Pertama',
  2: 'Kedua',
  3: 'Ketiga',
  4: 'Keempat',
  5: 'Kelima',
};

/** Tarik tiga lambang ke nomor silanya. Kartunya sengaja digeser satu
 *  posisi dari kotaknya — drag-drop tidak mengacak urutan sendiri. */
function order(a: SilaId, b: SilaId, c: SilaId): MixedLevel {
  const set = [a, b, c];
  return {
    id: '',
    narration: 'Tarik setiap lambang ke nomor silanya!',
    template: 'drag-drop',
    data: {
      targets: set.map((n) => ({ id: `t${n}`, label: `Sila ${ORDINAL[n].toLowerCase()}` })),
      items: [c, a, b].map((n) => ({ id: `i${n}`, sila: n, targetId: `t${n}` })),
    },
  };
}

/** Semua varian dalam satu slot berbagi id & halaman perisainya. */
function slot(id: string, stamp: LevelStamp, ...variants: MixedLevel[]): MixedLevel[] {
  return variants.map((v) => ({ ...v, id, stamp }));
}

function page(emoji: string, text: string, scene?: StoryPage['scene']): StoryPage {
  return { emoji, text, scene };
}

function decide(text: string, right: string, wrong: string, feedback: string): StoryPage {
  return {
    emoji: '🤔',
    text,
    choices: [{ text: right, correct: true }, { text: wrong, feedback }],
  };
}

const SEMBOYAN: Opt[] = [
  ['Tut Wuri Handayani', '📜'],
  ['Gemah Ripah Loh Jinawi', '📜'],
];

const config: MixedGameConfig = {
  id: 'perisai-garuda',
  group: 'sd2',
  title: 'Perisai Garuda',
  emoji: '🦅',
  template: 'mixed',
  project: { title: 'Perisai Garuda' },
  levels: [
    // --- l1 Sila → lambangnya ---
    slot(
      'l1',
      { emoji: '⭐', sila: 1, label: 'Sila 1' },
      pickSila('Mana lambang sila pertama?', 1),
      pickSila('Mana lambang sila kedua?', 2),
      pickSila('Mana lambang sila ketiga?', 3),
      pickSila('Mana lambang sila keempat?', 4),
      pickSila('Mana lambang sila kelima?', 5),
      pickSila('Mana lambang sila Ketuhanan Yang Maha Esa?', 1),
      pickSila('Mana lambang sila Persatuan Indonesia?', 3),
      pickSila('Mana lambang sila tentang musyawarah?', 4),
      pickSila('Mana lambang sila Keadilan sosial?', 5),
    ),

    // --- l2 Lambang → sila ke berapa ---
    slot(
      'l2',
      { emoji: '🔗', sila: 2, label: 'Sila 2' },
      whichNumber(1),
      whichNumber(2),
      whichNumber(3),
      whichNumber(4),
      whichNumber(5),
    ),

    // --- l3 Urutan sila ---
    slot(
      'l3',
      { emoji: '🌳', sila: 3, label: 'Sila 3' },
      order(1, 2, 3),
      order(2, 3, 4),
      order(3, 4, 5),
      order(1, 3, 5),
      order(1, 2, 4),
      order(2, 4, 5),
    ),

    // --- l4 Garuda Pancasila & semboyan ---
    slot(
      'l4',
      { emoji: '🐂', sila: 4, label: 'Sila 4' },
      ask(
        'Apa nama lambang negara kita?',
        ['Garuda Pancasila', '🦅'],
        [
          ['Burung Merak', '🦚'],
          ['Burung Beo', '🦜'],
        ],
      ),
      ask(
        'Garuda mencengkeram pita bertuliskan semboyan. Apa bunyinya?',
        ['Bhinneka Tunggal Ika', '📜'],
        SEMBOYAN,
      ),
      ask(
        'Apa arti Bhinneka Tunggal Ika?',
        ['Berbeda-beda tetapi tetap satu', '📜'],
        [
          ['Rajin pangkal pandai', '📜'],
          ['Hemat pangkal kaya', '📜'],
        ],
      ),
      {
        id: '',
        narration: 'Ada berapa sila dalam Pancasila?',
        template: 'tap-answer',
        data: {
          choices: [
            { id: 'a5', text: '5', correct: true },
            { id: 'a3', text: '3' },
            { id: 'a7', text: '7' },
          ],
        },
      },
      ask(
        'Kapan kita memperingati Hari Lahir Pancasila?',
        ['1 Juni', '📅'],
        [
          ['17 Agustus', '📅'],
          ['2 Mei', '📅'],
        ],
      ),
      ask(
        'Lambang sila ada di perisai. Perisai itu di bagian mana Garuda?',
        ['Di dadanya', '🛡️'],
        [
          ['Di kakinya', '🛡️'],
          ['Di ekornya', '🛡️'],
        ],
      ),
    ),

    // --- l5 Sikap sehari-hari → sila mana ---
    slot(
      'l5',
      { emoji: '🌾', sila: 5, label: 'Sila 5' },
      pickSila('Dina berdoa sebelum makan. Ini sila yang mana?', 1, '🙏'),
      pickSila('Raka menghormati teman yang beribadah. Sila yang mana?', 1, '🤲'),
      pickSila('Bayu menolong teman yang jatuh. Ini sila yang mana?', 2, '🩹'),
      pickSila('Sinta meminta maaf saat berbuat salah. Sila yang mana?', 2, '🙇'),
      pickSila('Kami bermain dengan teman dari suku lain. Sila yang mana?', 3, '⚽'),
      pickSila('Kami menyanyikan Indonesia Raya dengan khidmat. Sila mana?', 3, '🎵'),
      pickSila('Kelas memilih ketua dengan musyawarah. Sila yang mana?', 4, '🗳️'),
      pickSila('Rani menerima hasil musyawarah. Ini sila yang mana?', 4, '🙋'),
      pickSila('Tono menabung dan tidak boros jajan. Sila yang mana?', 5, '🐷'),
      pickSila('Kakak membagi kue sama rata. Ini sila yang mana?', 5, '🍰'),
    ),

    // --- l6 Aturan di rumah, sekolah & jalan ---
    slot(
      'l6',
      { emoji: '📏', label: 'Aturan' },
      ask(
        'Mana yang menaati aturan di sekolah?',
        ['Membuang sampah di tempatnya', '🗑️'],
        [
          ['Berlari-lari di dalam kelas', '🏃'],
          ['Mencoret-coret meja', '✏️'],
        ],
      ),
      ask(
        'Mana yang menaati aturan di sekolah?',
        ['Datang ke sekolah tepat waktu', '⏰'],
        [
          ['Tidur saat guru menjelaskan', '😴'],
          ['Berteriak di perpustakaan', '📢'],
        ],
      ),
      ask(
        'Mana yang menaati aturan di rumah?',
        ['Merapikan tempat tidur sendiri', '🛏️'],
        [
          ['Membiarkan mainan berserakan', '🧸'],
          ['Menonton TV sampai larut malam', '📺'],
        ],
      ),
      ask(
        'Mana yang menaati aturan di rumah?',
        ['Menggosok gigi sebelum tidur', '🪥'],
        [
          ['Makan permen sebelum tidur', '🍬'],
          ['Bermain gim terus tanpa belajar', '🎮'],
        ],
      ),
      ask(
        'Mana yang MELANGGAR aturan sekolah?',
        ['Mencoret-coret dinding kelas', '🖍️'],
        [
          ['Memakai seragam dengan rapi', '👕'],
          ['Mengangkat tangan sebelum bertanya', '🙋'],
        ],
      ),
      ask(
        'Mana yang menaati aturan di jalan?',
        ['Menyeberang di zebra cross', '🚸'],
        [
          ['Menerobos lampu merah', '🚦'],
          ['Bermain bola di jalan raya', '⚽'],
        ],
      ),
    ),

    // --- l7 Hak & kewajiban ---
    slot(
      'l7',
      { emoji: '⚖️', label: 'Hak' },
      ask(
        'Mana yang termasuk HAK anak?',
        ['Mendapat pendidikan', '📚'],
        [
          ['Menyapu halaman rumah', '🧹'],
          ['Mengerjakan PR', '📝'],
        ],
      ),
      ask(
        'Mana yang termasuk HAK anak?',
        ['Bermain dan beristirahat', '⚽'],
        [
          ['Membantu menjemur pakaian', '🧺'],
          ['Piket membersihkan kelas', '🗑️'],
        ],
      ),
      ask(
        'Mana yang termasuk HAK anak?',
        ['Mendapat makanan bergizi', '🍲'],
        [
          ['Mencuci piring sendiri', '🧽'],
          ['Menyiram tanaman', '🪴'],
        ],
      ),
      ask(
        'Mana yang termasuk KEWAJIBAN anak di sekolah?',
        ['Piket membersihkan kelas', '🧹'],
        [
          ['Bermain saat jam istirahat', '⚽'],
          ['Meminjam buku perpustakaan', '📚'],
        ],
      ),
      ask(
        'Mana yang termasuk KEWAJIBAN anak di rumah?',
        ['Membantu merapikan rumah', '🧺'],
        [
          ['Tidur siang yang cukup', '💤'],
          ['Mendapat kasih sayang', '💗'],
        ],
      ),
      ask(
        'Mana yang sebaiknya dilakukan lebih dulu?',
        ['Melaksanakan kewajiban', '⚖️'],
        [
          ['Menuntut hak', '⚖️'],
          ['Tidak usah keduanya', '⚖️'],
        ],
      ),
    ),

    // --- l8 Keberagaman ---
    slot(
      'l8',
      { emoji: '🤝', label: 'Beragam' },
      ask(
        'Ada teman baru dari Papua. Apa yang kamu lakukan?',
        ['Mengajaknya bermain bersama', '🤝'],
        [
          ['Menjauhinya', '🙈'],
          ['Menertawakan logatnya', '😆'],
        ],
      ),
      ask(
        'Temanmu sedang berdoa menurut agamanya. Apa sikapmu?',
        ['Tenang dan menghormatinya', '🤫'],
        [
          ['Mengajaknya mengobrol keras', '📢'],
          ['Mengganggunya', '😜'],
        ],
      ),
      ask(
        'Bekal temanmu makanan khas daerahnya. Apa sikapmu?',
        ['Menghargai dan bertanya namanya', '😋'],
        [
          ['Bilang makanannya aneh', '🤢'],
          ['Menyuruhnya makan di luar', '🙅'],
        ],
      ),
      ask(
        'Indonesia punya banyak suku dan bahasa. Bagaimana sikap kita?',
        ['Saling menghargai', '🤝'],
        [
          ['Merasa suku sendiri paling hebat', '🤝'],
          ['Hanya berteman dengan yang sama', '🤝'],
        ],
      ),
      ask(
        'Warga memperbaiki pos ronda bersama-sama. Ini disebut apa?',
        ['Gotong royong', '🔨'],
        [
          ['Lomba', '🔨'],
          ['Pameran', '🔨'],
        ],
      ),
      ask(
        'Teman sekelasmu berbeda agama. Bagaimana kalian berteman?',
        ['Tetap rukun dan saling menghormati', '🤝'],
        [
          ['Tidak usah berteman', '🤝'],
          ['Memaksanya ikut agamamu', '🤝'],
        ],
      ),
    ),

    // --- l9 MISI BESAR: kerja bakti (cerita bercabang) ---
    {
      id: 'l9',
      narration: 'Kerja bakti di kampung. Ayo ikuti ceritanya!',
      stamp: { emoji: '🧹', label: 'Gotong royong' },
      template: 'story-choice',
      data: {
        pages: [
          page(
            '🧹',
            'Minggu pagi, warga kampung Raka bekerja bakti membersihkan selokan.',
            'kota',
          ),
          decide(
            'Raka masih ingin bermain gim. Apa yang sebaiknya Raka lakukan?',
            'Ikut kerja bakti bersama warga',
            'Terus bermain gim di rumah',
            'Kerja bakti itu tugas semua warga, termasuk anak-anak. Ayo coba lagi!',
          ),
          page('🪣', 'Raka membawa ember dan membantu Pak RT mengangkat sampah.'),
          decide(
            'Ada warga yang belum kebagian sapu. Apa yang Raka lakukan?',
            'Memakai sapunya bergantian',
            'Menyembunyikan sapunya',
            'Gotong royong berarti saling membantu. Coba pikirkan lagi!',
          ),
          page(
            '✨',
            'Selokan bersih, kampung jadi indah. Bersama-sama, pekerjaan berat terasa ringan!',
          ),
        ],
      },
    },
  ],
};

export default config;
