import type { GameConfig, GameLevel, SceneId, StoryPage } from '@/engine/core/types';

/**
 * "Baca Cerita" (SD Kelas 1 & 2) — cerita pendek dengan titik pilihan; anak
 * mendengarkan jalan ceritanya lalu memilih apa yang sebaiknya dilakukan
 * tokohnya. Sembilan cerita, anak memilih sendiri judulnya.
 *
 * RIWAYAT NAMA — dulu "Cerita Si Kancil" (satu cerita), lalu "Cerita Anak"
 * (2026-08-09), dan sejak 2026-09-02 "Baca Cerita" setelah game terpisah
 * "Cerita Nusantara" DILEBUR ke sini atas permintaan pemilik. **Id game-nya
 * sengaja TETAP `cerita-kancil` sepanjang tiga penggantian nama itu** — id
 * dipakai route `/game/:id`, bintang yang sudah dikumpulkan anak, dan folder
 * file suaranya (`public/assets/voice/cerita-kancil/`). Mengganti id =
 * bintang hilang + seluruh rekaman narasi harus dirender ulang.
 *
 * ISINYA DUA JENIS, dan pembatasnya berbeda:
 *   - `l1`-`l3` fabel hewan Indonesia (Kancil dkk) — cerita ASLI game ini.
 *   - `n1`-`n6` cerita rakyat & fabel klasik yang sudah dikenal (Timun Mas,
 *     Bawang Putih, Semut & Belalang…), pindahan dari Cerita Nusantara.
 *
 * CERITA BARU BUATAN SENDIRI HARUS BERTOKOH HEWAN (keputusan pemilik
 * 2026-08-09). Percobaan pertama memakai cerita keseharian anak (menjaga
 * kebersihan di taman, berbagi payung saat hujan) dan ditolak: tokoh anak
 * laki-laki & perempuan yang berbagi payung terbaca seperti cerita romansa.
 * Aturan itu TIDAK berlaku surut untuk cerita rakyat yang sudah dikenal —
 * Timun Mas & Bawang Putih bertokoh manusia dan tetap di sini karena anak
 * (dan orang tuanya) sudah mengenal jalan ceritanya.
 *
 * Aturan (CLAUDE.md): tidak ada hukuman. Pilihan yang kurang tepat dijawab
 * lembut dan anak boleh memilih lagi — ceritanya hanya maju setelah pilihan
 * yang baik, jadi pesan moralnya tetap utuh.
 */

/** Halaman cerita biasa (tanpa pilihan). */
const page = (emoji: string, text: string): StoryPage => ({ emoji, text });

/**
 * Halaman bergambar: `id` item dari registry `src/engine/ui/items.ts`.
 * Aturan proyek — kalau halamannya tentang HEWAN dan seninya sudah ada,
 * pakai gambar, jangan emoji (emoji hewan beda bentuk di tiap HP).
 */
const pic = (item: string, text: string): StoryPage => ({ item, text });

/**
 * Halaman berilustrasi adegan: `art` = nama file di `public/assets/story/`.
 * Dipakai kalau satu halaman menceritakan DUA tokoh yang berinteraksi —
 * anak yang belum lancar membaca membaca adegannya dari gambar, dan dua
 * gambar item terpisah yang ditempel berdampingan tidak pernah rapi.
 * `emoji` tetap ditulis sebagai cadangan kalau filenya belum ter-deploy.
 */
const art = (name: string, emoji: string, text: string): StoryPage => ({
  art: name,
  emoji,
  text,
});

/**
 * Menandai halaman ini berpindah tempat: `at('sungai', page(...))`.
 * Latarnya digambar engine (`src/engine/ui/Scene.tsx`), jadi cukup menyebut
 * namanya. Ditulis HANYA saat tempatnya berganti — halaman sesudahnya ikut
 * latar terakhir sampai ada `at()` berikutnya.
 */
const at = <P extends StoryPage>(scene: SceneId, p: P): P => ({ ...p, scene });

/**
 * Halaman keputusan: satu pilihan benar, sisanya diberi tanggapan lembut.
 * Urutan di sini tidak menentukan urutan di layar — `StoryChoice` mengacak
 * pilihannya tiap halaman supaya anak tidak bisa menang dengan selalu
 * menekan kartu pertama.
 *
 * Gambarnya boleh emoji (`ask('🤔', …)`) atau ilustrasi adegan
 * (`ask({ art: 'jalak-kerbau-jawab', emoji: '🤔' }, …)`). Emoji berpikir itu
 * cuma isyarat "ayo pilih"; kalau adegannya punya ilustrasi, ilustrasi itu
 * yang harus tampil — anak yang belum lancar membaca menimbang pilihannya
 * sambil melihat kejadiannya.
 */
function ask(
  cue: string | { art: string; emoji: string },
  text: string,
  right: string,
  ...wrong: [string, string][]
): StoryPage {
  const { art: artName, emoji } = typeof cue === 'string' ? { art: undefined, emoji: cue } : cue;
  return {
    art: artName,
    emoji,
    text,
    choices: [
      { text: right, correct: true },
      ...wrong.map(([label, feedback]) => ({ text: label, feedback })),
    ],
  };
}

/**
 * Satu cerita = satu level = satu kartu di layar pemilih.
 * - `label` = judul pendek di kartu ("Kancil dan Gajah"),
 * - `pic` = id item registry kalau seninya ada (aturan proyek: hewan pakai
 *   gambar, bukan emoji), kalau tidak `emoji` yang dipakai,
 * - `narration` = kalimat lengkap yang diucapkan saat cerita dimulai dan saat
 *   anak menekan 🔊 di kartunya — JANGAN diubah tanpa alasan, kunci file
 *   suaranya berasal dari isi kalimat ini.
 */
function story(
  id: string,
  card: { label: string; emoji?: string; item?: string },
  narration: string,
  ...pages: StoryPage[]
): GameLevel<'story-choice'> {
  return { id, narration, card, data: { pages } };
}

/* ---------- Cerita ---------- */

/*
 * Cerita pertama game ini sejak awal. Kalimatnya sengaja TIDAK diubah:
 * kunci file suara = hash isi kalimatnya, jadi mengubah satu kata pun
 * membuat rekamannya harus dirender ulang.
 */
const KANCIL = story(
  'l1',
  { label: 'Kancil dan Pak Tani', emoji: '🦌' },
  'Si Kancil berjalan di hutan. Perutnya lapar sekali. Ayo bantu Kancil mencari makan!',
  at('hutan', page('🦌', 'Si Kancil berjalan di hutan. Perutnya lapar sekali.')),
  at(
    'kebun',
    ask(
      '🥒',
      'Kancil melihat kebun mentimun Pak Tani. Apa yang sebaiknya Kancil lakukan?',
      'Minta izin Pak Tani dulu',
      ['Ambil diam-diam', 'Hmm, mengambil tanpa izin itu tidak baik. Coba pilih yang lain!'],
    ),
  ),
  page('👨‍🌾', 'Pak Tani senang Kancil jujur. "Ambillah mentimun secukupnya," kata Pak Tani.'),
  at(
    'sungai',
    ask(
      '🐊',
      'Di sungai, ada buaya menghalangi jalan pulang. Bagaimana Kancil menyeberang?',
      'Ajak buaya berhitung sambil berbaris',
      [
        'Berteriak marah pada buaya',
        'Marah-marah tidak menyelesaikan masalah. Coba cara yang cerdik!',
      ],
    ),
  ),
  page(
    '🎉',
    'Buaya berbaris, Kancil melompat satu-satu sampai seberang. Kancil pulang dengan kenyang dan gembira!',
  ),
);

const JALAK = story(
  'l2',
  { label: 'Jalak dan Kerbau', item: 'jalak' },
  'Burung Jalak dan Kerbau. Ayo ikuti ceritanya!',
  at('sawah', page('🐃', 'Kerbau berkubang di sawah. Punggungnya gatal karena banyak kutu.')),
  art(
    'jalak-kerbau',
    '🐦',
    'Seekor burung jalak hinggap di pagar. "Bolehkah aku hinggap di punggungmu?"',
  ),
  ask(
    { art: 'jalak-kerbau-jawab', emoji: '🤔' },
    'Apa yang sebaiknya kerbau jawab?',
    'Boleh, hinggaplah di punggungku',
    ['Pergi! Aku tidak mau ditumpangi', 'Jalak justru ingin menolong. Coba pilih yang lain!'],
  ),
  art(
    'jalak-kerbau-kutu',
    '🐦',
    'Jalak mematuki kutu di punggung kerbau. Gatalnya hilang, jalak pun kenyang.',
  ),
  ask(
    '🐍',
    'Dari atas, jalak melihat ular besar mendekat. Sebaiknya jalak bagaimana?',
    'Berteriak memberi tahu kerbau',
    ['Terbang pergi diam-diam', 'Kerbau sudah menolongnya. Teman tidak ditinggal saat bahaya. Coba lagi!'],
  ),
  page('🏃', 'Kerbau cepat-cepat menjauh dari rawa. Ular itu pun pergi.'),
  page('⭐', 'Sejak itu jalak dan kerbau selalu bersama. Saling menolong membuat keduanya senang!'),
);

const GAJAH = story(
  'l3',
  { label: 'Kancil dan Gajah', item: 'elephant' },
  'Kancil dan Gajah. Ayo bantu Kancil menolong temannya!',
  // Dua halaman pembuka ini SENGAJA tanpa `at()`: ilustrasinya (kiriman
  // pemilik, 2026-08-10) sudah membawa rawanya sendiri — hutan, air, dan
  // tepian — jadi latar gambar engine di belakangnya cuma jadi hutan di atas
  // hutan. Latar `sungai` menyusul di halaman keputusan dan berlaku sampai
  // cerita selesai.
  pic('kancil-rawa', 'Pagi itu Kancil berjalan di tepi rawa.'),
  pic('gajah-lumpur', 'Ada gajah terperosok di lumpur. Badannya terlalu berat untuk naik sendiri.'),
  // Rawa belum punya latar sendiri; `sungai` sudah membawa air + tepian hijau
  // dan itu yang dikenali anak dari sisa cerita ini.
  at(
    'sungai',
    ask(
      '🤔',
      'Gajah terlalu berat. Apa yang sebaiknya Kancil lakukan?',
      'Memanggil hewan lain untuk menolong',
      ['Menarik gajah sendirian', 'Gajah terlalu berat untuk ditarik sendiri. Ada cara yang lebih baik!'],
      ['Pergi karena badannya kecil', 'Kancil memang kecil, tapi akalnya besar. Coba pilih yang lain!'],
    ),
  ),
  page('🐃', 'Kancil memanggil kerbau, rusa, dan teman-teman lain. Semua datang membantu.'),
  ask(
    '🌿',
    'Lumpurnya licin sekali. Sebaiknya mereka pakai apa?',
    'Ranting dan daun supaya tidak licin',
    ['Menarik lebih keras lagi saja', 'Kalau licin, tenaganya jadi sia-sia. Coba cara yang lebih cerdik!'],
  ),
  page('💪', 'Semua menarik bersama-sama. Gajah akhirnya keluar dari lumpur!'),
  page('⭐', 'Badan kecil pun bisa menolong, asal punya akal dan teman.'),
);

/* ---------- Cerita rakyat & fabel klasik — pindahan dari game
 * "Cerita Nusantara", yang digabung ke sini 2026-09-02 atas permintaan
 * pemilik. Id-nya `n1`-`n6`, BUKAN melanjutkan `l3`: awalan yang berbeda
 * membuat asalnya terbaca dan membuat pemetaan bintang lama
 * (`migrateMergedStories` di `progress.ts`) cuma soal menukar awalan.
 * Nomornya sengaja sama dengan id lamanya di Cerita Nusantara.
 * ---------- */

const GEMBALA = story(
  'n1',
  { label: 'Anak Gembala dan Serigala', emoji: '🐑' },
  'Anak Gembala dan Serigala. Ayo bantu dia mengambil keputusan!',
  at('padang', page('🧒', 'Seorang anak gembala menjaga domba-dombanya di padang rumput.')),
  page('🐑', 'Hari itu sepi sekali. Anak gembala merasa bosan.'),
  ask(
    '🤔',
    'Dia ingin ada yang menemani. Apa yang sebaiknya dia lakukan?',
    'Bermain seruling sambil menjaga domba',
    ['Berteriak "Ada serigala!" padahal tidak ada', 'Membohongi orang bisa membuat mereka tidak percaya lagi. Coba pilih yang lain!'],
  ),
  page('🎶', 'Anak gembala meniup serulingnya. Domba-domba ikut tenang mendengarnya.'),
  ask(
    '🐺',
    'Tiba-tiba serigala sungguhan datang! Apa yang harus dilakukan anak gembala?',
    'Berteriak minta tolong kepada warga desa',
    ['Diam saja karena takut', 'Kalau diam, domba-dombanya dalam bahaya. Beranilah minta tolong!'],
  ),
  page(
    '🏃',
    'Warga desa langsung datang menolong. Karena anak gembala selalu jujur, semua orang percaya padanya.',
  ),
  page('⭐', 'Domba-domba selamat. Jujur membuat kita dipercaya!'),
);

const UANG = story(
  'n4',
  { label: 'Dompet di Jalan', emoji: '👛' },
  'Dompet di Jalan. Ayo bantu Rani memilih!',
  at('kota', page('👧', 'Rani berjalan pulang dari sekolah.')),
  page('👛', 'Di trotoar, Rani menemukan sebuah dompet berisi uang.'),
  ask(
    '🤔',
    'Apa yang sebaiknya Rani lakukan dengan dompet itu?',
    'Menyerahkannya kepada guru atau satpam',
    ['Menyimpannya untuk jajan', 'Uang itu milik orang lain yang pasti sedang mencarinya. Coba pilih yang lain!'],
    ['Membiarkannya di jalan', 'Kalau dibiarkan, dompetnya bisa hilang. Ada cara yang lebih baik!'],
  ),
  page('👮', 'Rani menyerahkan dompet itu kepada satpam sekolah.'),
  page('🧑', 'Tak lama, seorang bapak datang mencari dompetnya. Wajahnya lega sekali.'),
  page('⭐', '"Terima kasih, Rani. Kamu anak yang jujur," kata bapak itu.'),
);

const SEMUT = story(
  'n2',
  { label: 'Semut dan Belalang', emoji: '🐜' },
  'Semut dan Belalang. Ayo ikuti ceritanya!',
  at('kebun', page('🐜', 'Di musim panas, semut-semut sibuk mengumpulkan makanan.')),
  page('🦗', 'Belalang malah bernyanyi seharian. "Untuk apa bekerja? Makanan masih banyak!" katanya.'),
  ask(
    '☀️',
    'Semut diajak bermain oleh belalang. Sebaiknya semut menjawab apa?',
    'Menyelesaikan pekerjaan dulu, baru bermain',
    ['Ikut bermain dan lupa bekerja', 'Kalau lupa bekerja, nanti tidak ada makanan saat musim hujan. Coba lagi!'],
  ),
  page('🏠', 'Musim hujan tiba. Makanan di ladang habis.'),
  at(
    'rumah',
    ask(
      '🌧️',
      'Belalang datang kelaparan ke rumah semut. Apa yang sebaiknya semut lakukan?',
      'Berbagi makanan dan mengajaknya bekerja bersama',
      ['Mengusir belalang', 'Menolong teman yang kesulitan itu perbuatan baik. Coba pilih yang lain!'],
    ),
  ),
  page('🍚', 'Semut berbagi makanan. Belalang berjanji akan rajin mulai sekarang.'),
  page('⭐', 'Rajin bekerja dan suka menolong, dua-duanya penting!'),
);

const KURA = story(
  'n5',
  { label: 'Kura-kura dan Kelinci', emoji: '🐢' },
  'Kura-kura dan Kelinci. Ayo ikuti lombanya!',
  at('hutan', page('🐢', 'Kura-kura berjalan pelan. Kelinci selalu menertawakannya.')),
  page('🐰', '"Ayo lomba lari!" tantang kelinci. Kura-kura menerima tantangan itu.'),
  ask(
    '🏁',
    'Lomba dimulai. Kura-kura tertinggal jauh. Apa yang sebaiknya dia lakukan?',
    'Terus berjalan pelan-pelan tanpa menyerah',
    ['Berhenti dan pulang saja', 'Menyerah membuat kita tidak pernah sampai. Ayo coba lagi!'],
  ),
  page('😴', 'Kelinci merasa pasti menang. Dia tidur siang di bawah pohon.'),
  ask(
    '🌳',
    'Kura-kura lewat dan melihat kelinci tertidur. Sebaiknya kura-kura bagaimana?',
    'Terus berjalan menuju garis akhir',
    ['Ikut tidur karena lelah', 'Kalau ikut tidur, usahanya jadi sia-sia. Ayo terus melangkah!'],
  ),
  page('🏆', 'Kura-kura sampai lebih dulu di garis akhir. Kelinci terbangun dan kaget.'),
  page('⭐', 'Pelan tapi tekun mengalahkan cepat tapi sombong!'),
);

const TIMUN = story(
  'n3',
  { label: 'Timun Mas', emoji: '🥒' },
  'Timun Mas. Ayo bantu Timun Mas pulang dengan selamat!',
  at('kebun', page('👵', 'Mbok Srini merawat seorang anak perempuan bernama Timun Mas.')),
  page('👹', 'Suatu hari, raksasa datang menagih janji. Timun Mas harus lari!'),
  at(
    'hutan',
    ask(
      '🏃‍♀️',
      'Mbok Srini memberi Timun Mas empat bungkusan ajaib. Apa yang sebaiknya Timun Mas lakukan?',
      'Membawanya dan berlari ke hutan',
      ['Meninggalkan bungkusan itu', 'Bungkusan itu bisa menolongnya nanti. Coba pilih yang lain!'],
    ),
  ),
  at('kebun', page('🥒', 'Timun Mas menebar biji timun. Seketika tumbuh ladang timun yang lebat.')),
  ask(
    '🌊',
    'Raksasa masih mengejar. Bungkusan terakhir berisi terasi. Sebaiknya Timun Mas bagaimana?',
    'Menebarkan terasi lalu terus berlari',
    ['Berhenti dan menangis', 'Timun Mas anak yang berani. Ayo gunakan akalnya!'],
  ),
  at('sungai', page('🌫️', 'Terasi berubah menjadi lautan lumpur. Raksasa tidak bisa lewat.')),
  page('⭐', 'Timun Mas pulang dengan selamat. Berani dan cerdik menyelamatkannya!'),
);

const BAWANG = story(
  'n6',
  // 💎 = perhiasan di dalam labu, adegan yang paling diingat anak. Emoji labu
  // 🎃 sengaja TIDAK dipakai: di HP bentuknya labu Halloween berwajah ukiran.
  { label: 'Bawang Putih', emoji: '💎' },
  'Bawang Putih yang Baik Hati. Ayo ikuti ceritanya!',
  at('kebun', page('👧', 'Bawang Putih rajin membantu pekerjaan rumah setiap hari.')),
  at('sungai', page('🏞️', 'Saat mencuci di sungai, bajunya hanyut terbawa arus.')),
  at(
    'hutan',
    ask(
      '👵',
      'Bawang Putih sampai di rumah seorang nenek. Apa yang sebaiknya dia lakukan?',
      'Menyapa dengan sopan dan meminta tolong',
      ['Masuk tanpa permisi', 'Masuk rumah orang harus permisi dulu ya. Coba lagi!'],
    ),
  ),
  at(
    'rumah',
    page('🧹', 'Nenek meminta bantuan membersihkan rumah. Bawang Putih membantu dengan senang hati.'),
  ),
  ask(
    '🎁',
    'Nenek menyuruhnya memilih satu labu sebagai hadiah. Sebaiknya Bawang Putih memilih apa?',
    'Labu yang paling kecil',
    ['Labu yang paling besar sambil meminta lebih', 'Bawang Putih anak yang tidak serakah. Coba pilih yang lain!'],
  ),
  page('✨', 'Di dalam labu kecil itu ternyata ada perhiasan dan emas!'),
  page('⭐', 'Kebaikan hati selalu kembali kepada kita.'),
);

const config: GameConfig<'story-choice'> = {
  // Id TETAP `cerita-kancil` walau judulnya kini "Baca Cerita" — id ini dipakai
  // route `/game/:id`, bintang yang sudah dikumpulkan anak, dan folder file
  // suaranya (`public/assets/voice/cerita-kancil/`). Menggantinya = bintang
  // hilang + 166 rekaman narasi harus dirender ulang.
  id: 'cerita-kancil',
  group: 'sd1',
  title: 'Baca Cerita',
  emoji: '📗',
  template: 'story-choice',
  // Anak memilih sendiri ceritanya — kesembilan judul tampil sebagai kartu
  // begitu game dibuka. Satu cerita sudah cukup panjang untuk sekali duduk,
  // jadi tidak ada `sessionLevels`: satu pilihan = satu cerita.
  chooseLevel: { title: 'Pilih ceritamu!', again: '📗 Pilih Cerita Lain' },
  // Fabel Kancil dulu (`l1`-`l3`, cerita asli game ini), lalu cerita rakyat &
  // fabel klasik (`n1`-`n6`) dalam urutan berpasangan menurut pesan moralnya:
  // jujur & tanggung jawab, rajin & pantang menyerah, berani & baik hati.
  levels: [KANCIL, JALAK, GAJAH, GEMBALA, UANG, SEMUT, KURA, TIMUN, BAWANG],
};

export default config;
