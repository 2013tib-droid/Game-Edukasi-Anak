import type { GameConfig, GameLevel, LevelStamp, ReadStep, SceneId } from '@/engine/core/types';

/**
 * "Detektif Bacaan" (SD Kelas 3 & 4, kelompok `sd2`, mapel Bahasa Indonesia)
 * — versi premium "Kasus Detektif Kucing" (docs/rencana-game-sd-kelas-3-4.md
 * 2b.3 no. 5). Kelompok `sd2` masih `draft`, jadi game ini hanya terlihat di
 * dev server & build penguji.
 *
 * KEPUTUSAN PEMILIK (2026-10-07, ditanyakan sebelum mulai):
 * - Cara main: anak MENYENTUH kalimat bukti di dalam teks (template engine
 *   baru `read-find`), bukan memilih kartu. Menyentuh membacakan kalimatnya.
 * - 9 slot di bawah disetujui; fakta vs pendapat = "sentuh kalimat PENDAPAT"
 *   (bukan tarik ke dua map), supaya satu template cukup.
 * - Tokoh = hewan yang sudah punya seni; teks informasi (ide pokok, fakta vs
 *   pendapat) tentang hewan & tumbuhan boleh tanpa tokoh. "Pelaku" kasus
 *   selalu hewan yang lupa / salah ambil, bukan pencuri jahat.
 * - Papan bukti ikut (misi besar); kaca pembesar yang mengikuti jari DITUNDA.
 * - Seni Detektif Kucing belum ada → pemandu sementara 🔍. Begitu
 *   `public/assets/ui/detektif-kucing.webp` ada, isi `GUIDE` di bawah.
 *
 * ALUR — urutan TETAP, tanpa `sessionLevels`; proyek sesi "Kasus Detektif
 * Kucing" terisi satu stempel per level:
 *   l1 siapa                    (kls 3)
 *   l2 di mana / kapan          (kls 3)
 *   l3 apa yang terjadi         (kls 3)
 *   l4 mengapa                  (kls 3)
 *   l5 urutan: yang PALING AWAL (kls 3)
 *   l6 ide pokok (kalimat utama)(kls 4)
 *   l7 makna kata dari konteks  (kls 4, sentuh KATA)
 *   l8 kalimat PENDAPAT         (kls 4)
 *   l9 MISI BESAR: dua bukti ke papan, lalu tunjuk siapa yang melakukannya
 *
 * ATURAN MENULIS VARIAN BARU:
 * - Tiap kalimat bacaan DIBACAKAN saat disentuh → baris narasi, TANPA digit.
 * - Kalimat ≤ ±45 karakter, 4 kalimat (misi 5) — lebih dari itu bacaan +
 *   tombol tak muat di HP 320 px.
 * - PENGECOH ADA DI TEKS: kalimat lain menyebut benda/tokoh/kata yang sama
 *   dengan pertanyaannya tapi bukan jawabannya. Kalimat jawaban yang
 *   satu-satunya memuat kata kunci pertanyaan bisa ditemukan tanpa membaca.
 * - Hanya SATU kalimat yang sah sebagai jawaban (atau tulis semuanya di
 *   `answer`). Jangan tutup cerita dengan kalimat yang ikut menyebut
 *   jawabannya ("X berterima kasih kepada Kura-kura") — anak yang menyentuh
 *   kalimat itu tidak salah membaca.
 * - Urutan kejadian: kalimat jawaban JANGAN kalimat pertama.
 */

type Level = GameLevel<'read-find'>;

/** Seni tokoh pemandu di `public/assets/ui/` — kosong sampai gambarnya ada. */
const GUIDE: string | undefined = undefined;

function read(
  narration: string,
  title: string,
  sentences: string[],
  steps: ReadStep[],
  scene?: SceneId,
): Level {
  for (const s of sentences) {
    if (/[0-9]/.test(s)) throw new Error(`Digit di bacaan: ${s}`);
  }
  for (const step of steps) {
    if (step.kind === 'sentence') {
      for (const a of step.answer) {
        if (!sentences[a]) throw new Error(`Jawaban ${a} di luar bacaan "${title}"`);
      }
    } else if (step.kind === 'word') {
      const words = (sentences[step.sentence] ?? '').split(/\s+/).map((w) => w.replace(/[.,!?;:]/g, ''));
      if (words.filter((w) => w === step.answer).length !== 1) {
        throw new Error(`Kata "${step.answer}" harus muncul tepat sekali di kalimatnya ("${title}")`);
      }
    } else if (step.choices.filter((c) => c.correct).length !== 1) {
      throw new Error(`Kartu "${title}" harus punya tepat satu jawaban benar`);
    }
  }
  return { id: '', narration, data: { title, sentences, steps, scene, guide: GUIDE } };
}

/** Soal satu langkah: sentuh satu kalimat bukti. */
function find(narration: string, title: string, sentences: string[], answer: number, scene?: SceneId): Level {
  return read(narration, title, sentences, [{ kind: 'sentence', answer: [answer] }], scene);
}

const IDE = 'Kalimat mana yang menjadi ide pokok paragraf ini? Sentuh kalimat utamanya!';
const PENDAPAT = 'Kalimat mana yang berisi pendapat, bukan fakta? Sentuh kalimatnya!';

function word(narration: string, title: string, sentences: string[], sentence: number, answer: string): Level {
  return read(narration, title, sentences, [{ kind: 'word', sentence, answer }]);
}

interface Suspect {
  name: string;
  item: string;
  correct?: boolean;
}

/** Misi besar: dua bukti ke papan, lalu tunjuk tokohnya. */
function mission(
  title: string,
  sentences: string[],
  first: { say: string; answer: number; clue: { emoji?: string; item?: string; label: string } },
  second: { say: string; answer: number; clue: { emoji?: string; item?: string; label: string } },
  accuse: string,
  suspects: Suspect[],
  scene: SceneId,
): Level {
  for (const s of suspects) {
    if (!sentences.some((t) => t.includes(s.name))) {
      throw new Error(`Tersangka "${s.name}" tidak disebut di bacaan "${title}"`);
    }
  }
  return read(
    first.say,
    title,
    sentences,
    [
      { kind: 'sentence', answer: [first.answer], clue: first.clue },
      { kind: 'sentence', answer: [second.answer], clue: second.clue, say: second.say },
      {
        kind: 'choose',
        say: accuse,
        choices: suspects.map((s) => ({ text: s.name, item: s.item, correct: s.correct })),
      },
    ],
    scene,
  );
}

/** Semua varian dalam satu slot berbagi id & stempel proyeknya. */
function slot(id: string, stamp: LevelStamp, ...variants: Level[]): Level[] {
  return variants.map((v) => ({ ...v, id, stamp }));
}

const config: GameConfig<'read-find'> = {
  id: 'detektif-bacaan',
  group: 'sd2',
  title: 'Detektif Bacaan',
  emoji: '🔍',
  template: 'read-find',
  project: { title: 'Kasus Detektif Kucing' },
  hints: true,
  levels: [
    // --- l1 Siapa ---
    slot(
      'l1',
      { emoji: '🐾', label: 'Siapa' },
      find(
        'Siapa yang menyiram bunga Bu Panda? Sentuh kalimat buktinya!',
        'Bunga yang Segar',
        [
          'Bu Panda menanam bunga di depan rumah.',
          'Bebek memetik bunga untuk ibunya.',
          'Pagi ini, Kelinci menyiram bunga itu.',
          'Kini bunga Bu Panda segar sekali.',
        ],
        2,
        'kebun',
      ),
      find(
        'Siapa yang menemukan bola Monyet? Sentuh kalimat buktinya!',
        'Bola Merah',
        [
          'Monyet kehilangan bola merahnya.',
          'Zebra mencari bola di dekat pohon.',
          'Kura-kura menemukan bola itu di semak.',
          'Monyet senang bolanya kembali.',
        ],
        2,
        'padang',
      ),
      find(
        'Siapa yang membawa kue ke rumah Nenek? Sentuh kalimat buktinya!',
        'Kue untuk Nenek',
        [
          'Bu Bebek membuat kue pisang.',
          'Ayam ingin mencicipi kue itu.',
          'Kucing membawa kue itu ke rumah Nenek.',
          'Nenek Kura-kura tersenyum gembira.',
        ],
        2,
        'rumah',
      ),
      find(
        'Siapa yang meminjamkan payung kepada Panda? Sentuh kalimat buktinya!',
        'Payung Biru',
        [
          'Hujan turun deras sekali.',
          'Panda lupa membawa payung.',
          'Koala meminjamkan payung birunya.',
          'Mereka pulang bersama tanpa basah.',
        ],
        2,
        'kota',
      ),
      find(
        'Siapa yang memperbaiki sepeda Jerapah? Sentuh kalimat buktinya!',
        'Sepeda Rusak',
        [
          'Rantai sepeda Jerapah putus.',
          'Gajah membawa sepeda itu ke bengkel.',
          'Beruang memperbaiki rantainya.',
          'Jerapah bisa bersepeda lagi.',
        ],
        2,
        'kota',
      ),
      find(
        'Siapa yang menjaga telur Bu Ayam? Sentuh kalimat buktinya!',
        'Telur di Sarang',
        [
          'Bu Ayam pergi mencari makan.',
          'Telurnya ada di dalam sarang.',
          'Bebek duduk di dekat sarang menjaganya.',
          'Saat Bu Ayam pulang, telurnya aman.',
        ],
        2,
        'sawah',
      ),
    ),

    // --- l2 Di mana / kapan ---
    slot(
      'l2',
      { emoji: '📍', label: 'Tempat' },
      find(
        'Di mana kunci Kelinci akhirnya ditemukan? Sentuh kalimat buktinya!',
        'Kunci Kelinci',
        [
          'Kunci rumah Kelinci hilang.',
          'Ia mencari di bawah meja, tidak ada.',
          'Ia mencari di kebun, juga tidak ada.',
          'Ternyata kuncinya ada di dalam tas.',
        ],
        3,
        'rumah',
      ),
      find(
        'Kapan Panda pergi ke pasar? Sentuh kalimat buktinya!',
        'Ke Pasar',
        [
          'Panda suka makan bambu segar.',
          'Hari Minggu pagi, Panda ke pasar.',
          'Di pasar ia membeli bambu dan apel.',
          'Siang harinya ia makan bersama keluarga.',
        ],
        1,
        'kota',
      ),
      find(
        'Di mana Bebek berenang setiap pagi? Sentuh kalimat buktinya!',
        'Rumah Bebek',
        [
          'Bebek tinggal di dekat sawah.',
          'Setiap pagi, Bebek berenang di kolam.',
          'Sore hari ia bermain di halaman.',
          'Malam hari ia tidur di kandang.',
        ],
        1,
        'sawah',
      ),
      find(
        'Kapan Kura-kura sampai di sekolah? Sentuh kalimat buktinya!',
        'Kura-kura Rajin',
        [
          'Kura-kura berangkat sangat pagi.',
          'Jalannya pelan tapi tidak berhenti.',
          'Ia sampai sebelum bel berbunyi.',
          'Teman-temannya datang sesudah itu.',
        ],
        2,
        'kota',
      ),
      find(
        'Di mana Monyet menyimpan pisangnya? Sentuh kalimat buktinya!',
        'Pisang Monyet',
        [
          'Monyet memetik pisang di hutan.',
          'Ia membawa pisang itu pulang.',
          'Pisangnya ia simpan di atas lemari.',
          'Adiknya mencari pisang di dapur.',
        ],
        2,
        'hutan',
      ),
      find(
        'Kapan Gajah mandi di sungai? Sentuh kalimat buktinya!',
        'Gajah Mandi',
        [
          'Gajah suka bermain air.',
          'Pagi hari, Gajah makan rumput.',
          'Saat siang panas, Gajah mandi di sungai.',
          'Malam hari ia tidur di bawah pohon.',
        ],
        2,
        'sungai',
      ),
    ),

    // --- l3 Apa yang terjadi ---
    slot(
      'l3',
      { emoji: '❗', label: 'Kejadian' },
      find(
        'Apa yang terjadi pada layang-layang Kucing? Sentuh kalimat buktinya!',
        'Layang-layang',
        [
          'Kucing bermain layang-layang di lapangan.',
          'Angin bertiup sangat kencang.',
          'Tali layang-layangnya putus.',
          'Kucing dan Ayam mengejarnya bersama.',
        ],
        2,
        'padang',
      ),
      find(
        'Apa yang terjadi pada apel Beruang? Sentuh kalimat buktinya!',
        'Keranjang Apel',
        [
          'Beruang membawa sekeranjang apel.',
          'Kakinya tersandung batu.',
          'Apel-apelnya jatuh berguling ke jalan.',
          'Zebra membantu memungutnya.',
        ],
        2,
        'kebun',
      ),
      find(
        'Apa yang terjadi pada kue Bu Bebek? Sentuh kalimat buktinya!',
        'Kue Gosong',
        [
          'Bu Bebek membuat kue di dapur.',
          'Ia lupa mematikan kompor.',
          'Kuenya menjadi gosong dan hitam.',
          'Esok harinya ia membuat kue lagi.',
        ],
        2,
        'rumah',
      ),
      find(
        'Apa yang terjadi saat Jerapah lewat jalan becek? Sentuh buktinya!',
        'Jalan Becek',
        [
          'Jerapah pulang dari sekolah.',
          'Ia melewati jalan yang becek.',
          'Sepatunya terbenam di dalam lumpur.',
          'Ibu membantu mencuci sepatunya.',
        ],
        2,
        'sawah',
      ),
      find(
        'Apa yang terjadi pada balon Kelinci? Sentuh kalimat buktinya!',
        'Balon Kuning',
        [
          'Kelinci mendapat balon dari Paman.',
          'Balonnya berwarna kuning cerah.',
          'Tiba-tiba balon itu terbang tinggi.',
          'Kelinci melambai ke balonnya.',
        ],
        2,
        'padang',
      ),
      find(
        'Apa yang terjadi pada perahu kertas Bebek? Sentuh kalimat buktinya!',
        'Perahu Kertas',
        [
          'Bebek membuat perahu dari kertas.',
          'Ia meletakkannya di sungai kecil.',
          'Perahu itu hanyut terbawa arus.',
          'Katak melihatnya dari atas daun.',
        ],
        2,
        'sungai',
      ),
    ),

    // --- l4 Mengapa ---
    slot(
      'l4',
      { emoji: '💭', label: 'Sebab' },
      find(
        'Mengapa Monyet sedih? Sentuh kalimat buktinya!',
        'Monyet Sedih',
        [
          'Monyet duduk sendirian di bawah pohon.',
          'Wajahnya terlihat sedih.',
          'Mainan kesayangannya rusak tadi pagi.',
          'Gajah datang menghiburnya.',
        ],
        2,
        'hutan',
      ),
      find(
        'Mengapa Panda tidak masuk sekolah? Sentuh kalimat buktinya!',
        'Panda Sakit',
        [
          'Hari ini Panda tidak masuk sekolah.',
          'Badannya panas dan ia batuk.',
          'Teman-teman mengirim surat untuknya.',
          'Lusa Panda sudah sehat lagi.',
        ],
        1,
        'rumah',
      ),
      find(
        'Mengapa Kucing berlari ke dapur? Sentuh kalimat buktinya!',
        'Bau Ikan',
        [
          'Kucing sedang tidur di kursi.',
          'Ia mencium bau ikan goreng.',
          'Kucing langsung berlari ke dapur.',
          'Ibu memberinya sepotong ikan.',
        ],
        1,
        'rumah',
      ),
      find(
        'Mengapa Ayam bangun lebih pagi? Sentuh kalimat buktinya!',
        'Lomba Lari',
        [
          'Ayam ingin datang paling awal ke lomba.',
          'Karena itu, Ayam bangun lebih pagi.',
          'Ia sarapan jagung sebentar.',
          'Lalu ia berlari menuju lapangan.',
        ],
        0,
        'padang',
      ),
      find(
        'Mengapa Kura-kura membuka payungnya? Sentuh kalimat buktinya!',
        'Payung Kuning',
        [
          'Kura-kura pergi ke rumah Kelinci.',
          'Langit tiba-tiba menjadi gelap.',
          'Hujan mulai turun rintik-rintik.',
          'Kura-kura membuka payung kuningnya.',
        ],
        2,
        'kota',
      ),
      find(
        'Mengapa Gajah membawa ember berisi air? Sentuh kalimat buktinya!',
        'Ember Gajah',
        [
          'Gajah berjalan ke taman sekolah.',
          'Ia membawa ember berisi air.',
          'Kelinci menunggu di dekat pagar.',
          'Gajah ingin menyiram bunga yang layu.',
        ],
        3,
        'kebun',
      ),
    ),

    // --- l5 Urutan: yang paling awal ---
    slot(
      'l5',
      { emoji: '⏱️', label: 'Urutan' },
      find(
        'Apa yang Kelinci lakukan paling awal? Sentuh kalimat buktinya!',
        'Wortel Kelinci',
        [
          'Kelinci makan wortel di meja.',
          'Sebelum makan, ia mencuci wortel itu.',
          'Wortel itu ia cabut dari kebun pagi tadi.',
          'Sesudah makan, ia mencuci piring.',
        ],
        2,
        'rumah',
      ),
      find(
        'Apa yang Panda lakukan paling awal? Sentuh kalimat buktinya!',
        'Buku Cerita',
        [
          'Panda tidur siang dengan nyenyak.',
          'Sebelum tidur, ia membaca buku cerita.',
          'Buku itu ia pinjam di sekolah pagi tadi.',
          'Sore harinya ia bermain bola.',
        ],
        2,
        'rumah',
      ),
      find(
        'Apa yang Bebek lakukan paling awal? Sentuh kalimat buktinya!',
        'Kolam Jernih',
        [
          'Bebek berenang di kolam yang jernih.',
          'Sesudah berenang, ia mengeringkan bulu.',
          'Sebelum berenang, ia sarapan jagung.',
          'Jagung itu ia petik kemarin sore.',
        ],
        3,
        'sawah',
      ),
      find(
        'Apa yang Beruang lakukan paling awal? Sentuh kalimat buktinya!',
        'Roti dan Madu',
        [
          'Beruang makan roti dengan madu.',
          'Rotinya ia beli di toko pagi tadi.',
          'Sesudah makan, ia minum susu.',
          'Lalu ia pergi bermain ke taman.',
        ],
        1,
        'kota',
      ),
      find(
        'Apa yang Gajah lakukan paling awal? Sentuh kalimat buktinya!',
        'Gambar Pohon',
        [
          'Gajah menggambar pohon di kertas.',
          'Sebelum menggambar, ia meraut pensil.',
          'Pensil itu ia terima dari Nenek kemarin.',
          'Gambarnya lalu ditempel di dinding.',
        ],
        2,
        'rumah',
      ),
      find(
        'Apa yang Zebra lakukan paling awal? Sentuh kalimat buktinya!',
        'Sepatu Baru',
        [
          'Zebra memakai sepatu barunya.',
          'Sepatu itu ia beli bersama Ayah kemarin.',
          'Sebelum memakainya, ia mencuci kaki.',
          'Lalu Zebra berlari ke lapangan.',
        ],
        1,
        'padang',
      ),
    ),

    // --- l6 Ide pokok (kelas 4) ---
    slot(
      'l6',
      { emoji: '💡', label: 'Ide pokok' },
      find(
        IDE,
        'Gajah',
        [
          'Gajah adalah hewan darat yang besar.',
          'Tingginya melebihi atap rumah.',
          'Beratnya sama dengan beberapa mobil.',
          'Telinganya lebar seperti kipas.',
        ],
        0,
      ),
      find(
        IDE,
        'Bambu',
        [
          'Bambu banyak sekali gunanya.',
          'Batangnya dipakai untuk membuat rumah.',
          'Anyamannya dijadikan keranjang.',
          'Rebungnya bisa dimasak jadi sayur.',
        ],
        0,
      ),
      find(
        IDE,
        'Kura-kura',
        [
          'Kura-kura berjalan pelan sekali.',
          'Cangkangnya keras melindungi badannya.',
          'Ia bisa menahan lapar berhari-hari.',
          'Kura-kura adalah hewan yang tangguh.',
        ],
        3,
      ),
      find(
        IDE,
        'Pohon Kelapa',
        [
          'Pohon kelapa sangat berguna bagi kita.',
          'Air kelapa segar untuk diminum.',
          'Daunnya dianyam menjadi ketupat.',
          'Batangnya bisa dipakai untuk jembatan.',
        ],
        0,
      ),
      find(
        IDE,
        'Hewan Ternak',
        [
          'Ayam berkokok saat matahari terbit.',
          'Bebek mencari makan di kolam.',
          'Sapi makan rumput di padang.',
          'Tiap hewan ternak punya kebiasaan sendiri.',
        ],
        3,
      ),
      find(
        IDE,
        'Air',
        [
          'Kita memerlukan air setiap hari.',
          'Air dipakai untuk minum dan memasak.',
          'Kita juga mandi dengan air.',
          'Tanaman di kebun pun perlu disiram.',
        ],
        0,
      ),
    ),

    // --- l7 Makna kata dari konteks (kelas 4) ---
    slot(
      'l7',
      { emoji: '🔤', label: 'Makna kata' },
      word(
        'Kata mana yang artinya capek? Sentuh katanya!',
        'Kuda Berlari',
        ['Kuda berlari mengelilingi lapangan.', 'Sesudah itu, ia merasa sangat letih.', 'Ia duduk dan minum air.'],
        1,
        'letih',
      ),
      word(
        'Kata mana yang artinya senang? Sentuh katanya!',
        'Hadiah Buku',
        ['Kelinci mendapat hadiah buku.', 'Ia melompat-lompat karena hatinya gembira.', 'Ia membaca buku itu sampai sore.'],
        1,
        'gembira',
      ),
      word(
        'Kata mana yang artinya kecil? Sentuh katanya!',
        'Anak Ayam',
        ['Bu Ayam punya anak yang baru menetas.', 'Anak ayam itu mungil dan berbulu kuning.', 'Ia selalu berjalan di belakang ibunya.'],
        1,
        'mungil',
      ),
      word(
        'Kata mana yang artinya cepat? Sentuh katanya!',
        'Panda Flu',
        ['Panda sedang sakit flu.', 'Teman-teman berdoa agar Panda lekas sembuh.', 'Mereka membawakan buah untuknya.'],
        1,
        'lekas',
      ),
      word(
        'Kata mana yang artinya dingin dan segar? Sentuh katanya!',
        'Di Bawah Pohon',
        ['Gajah berteduh di bawah pohon.', 'Udara di bawah pohon itu terasa sejuk.', 'Gajah pun tertidur dengan nyenyak.'],
        1,
        'sejuk',
      ),
      word(
        'Kata mana yang artinya ramai? Sentuh katanya!',
        'Pasar Pagi',
        ['Pasar pagi itu penuh pembeli.', 'Suara pedagang dan pembeli sangat riuh.', 'Bebek menutup kedua telinganya.'],
        1,
        'riuh',
      ),
    ),

    // --- l8 Fakta atau pendapat (kelas 4) ---
    slot(
      'l8',
      { emoji: '⚖️', label: 'Pendapat' },
      find(
        PENDAPAT,
        'Jerapah',
        [
          'Jerapah punya leher yang panjang.',
          'Jerapah makan daun di pohon tinggi.',
          'Menurutku, jerapah hewan paling cantik.',
          'Jerapah tinggal di padang rumput.',
        ],
        2,
      ),
      find(
        PENDAPAT,
        'Mangga',
        [
          'Mangga tumbuh di daerah yang panas.',
          'Mangga muda berwarna hijau.',
          'Mangga adalah buah paling enak.',
          'Mangga bisa dibuat jus.',
        ],
        2,
      ),
      find(
        PENDAPAT,
        'Bus Sekolah',
        [
          'Bus sekolah berwarna kuning.',
          'Bus itu berangkat setiap pagi.',
          'Naik bus sekolah sangat menyenangkan.',
          'Bus itu bisa membawa banyak anak.',
        ],
        2,
      ),
      find(
        PENDAPAT,
        'Kucing',
        [
          'Kucing punya kumis yang panjang.',
          'Kucing suka tidur di tempat hangat.',
          'Saya rasa kucing lebih lucu dari kelinci.',
          'Kucing membersihkan bulunya sendiri.',
        ],
        2,
      ),
      find(
        PENDAPAT,
        'Sepak Bola',
        [
          'Sepak bola dimainkan dua regu.',
          'Setiap regu ingin mencetak gol.',
          'Bola ditendang dengan kaki.',
          'Sepak bola adalah olahraga paling seru.',
        ],
        3,
      ),
      find(
        PENDAPAT,
        'Matahari',
        [
          'Matahari terbit di sebelah timur.',
          'Pagi adalah waktu terbaik untuk belajar.',
          'Matahari membuat tanaman tumbuh.',
          'Malam hari matahari tidak terlihat.',
        ],
        1,
      ),
    ),

    // --- l9 MISI BESAR: papan bukti + tunjuk siapa ---
    slot(
      'l9',
      { emoji: '🏅', label: 'Kasus' },
      mission(
        'Mangga Pak Beruang',
        [
          'Mangga di meja Pak Beruang hilang satu.',
          'Zebra dan Kelinci bermain bola di halaman.',
          'Ada kulit mangga di bawah pohon besar.',
          'Monyet sedang tidur siang di pohon itu.',
          'Pak Beruang mencari ke mana-mana.',
        ],
        {
          say: 'Bukti pertama: di mana ada sisa mangga?',
          answer: 2,
          clue: { item: 'mango', label: 'Kulit mangga' },
        },
        { say: 'Bukti kedua: siapa yang ada di pohon itu?', answer: 3, clue: { item: 'tree', label: 'Di pohon' } },
        'Siapa yang mengambil mangga itu? Tunjuk dia!',
        [
          { name: 'Zebra', item: 'zebra' },
          { name: 'Kelinci', item: 'rabbit' },
          { name: 'Monyet', item: 'monkey', correct: true },
        ],
        'kebun',
      ),
      mission(
        'Topi Biru',
        [
          'Topi biru Ayah Kelinci hilang.',
          'Bebek datang memakai topi merahnya.',
          'Topi biru itu ada di dekat kolam.',
          'Pinguin bermain di kolam sepanjang pagi.',
          'Kambing duduk di teras rumah.',
        ],
        {
          say: 'Bukti pertama: di mana topi biru itu?',
          answer: 2,
          clue: { item: 'cap', label: 'Dekat kolam' },
        },
        { say: 'Bukti kedua: siapa yang bermain di tempat itu?', answer: 3, clue: { emoji: '💧', label: 'Di kolam' } },
        'Siapa yang membawa topi itu ke kolam? Tunjuk dia!',
        [
          { name: 'Bebek', item: 'duck' },
          { name: 'Pinguin', item: 'penguin', correct: true },
          { name: 'Kambing', item: 'goat' },
        ],
        'sungai',
      ),
      mission(
        'Buku yang Hilang',
        [
          'Satu buku cerita di kelas hilang.',
          'Sampul buku itu bergambar gajah.',
          'Kuda membaca buku tentang mobil.',
          'Jerapah membaca buku bergambar gajah.',
          'Koala sedang menggambar di mejanya.',
        ],
        {
          say: 'Bukti pertama: sampul buku itu bergambar apa?',
          answer: 1,
          clue: { item: 'book', label: 'Gambar gajah' },
        },
        { say: 'Bukti kedua: siapa yang membaca buku itu?', answer: 3, clue: { emoji: '👀', label: 'Dibaca' } },
        'Siapa yang lupa mengembalikan buku? Tunjuk dia!',
        [
          { name: 'Kuda', item: 'horse' },
          { name: 'Jerapah', item: 'giraffe', correct: true },
          { name: 'Koala', item: 'koala' },
        ],
        'kota',
      ),
      mission(
        'Wortel Bu Kambing',
        [
          'Wortel di kebun Bu Kambing tercabut.',
          'Ada jejak kaki kecil di tanah kebun.',
          'Gajah punya kaki yang sangat besar.',
          'Kelinci berkaki kecil dan suka wortel.',
          'Sapi tidak suka makan wortel.',
        ],
        {
          say: 'Bukti pertama: jejak apa yang ada di kebun?',
          answer: 1,
          clue: { emoji: '🐾', label: 'Jejak kecil' },
        },
        { say: 'Bukti kedua: siapa yang kakinya kecil?', answer: 3, clue: { item: 'rabbit', label: 'Kaki kecil' } },
        'Siapa yang mencabut wortel itu? Tunjuk dia!',
        [
          { name: 'Gajah', item: 'elephant' },
          { name: 'Kelinci', item: 'rabbit', correct: true },
          { name: 'Sapi', item: 'cow' },
        ],
        'kebun',
      ),
      mission(
        'Payung Ibu Panda',
        [
          'Payung Ibu Panda tidak ada di rak.',
          'Siang tadi hujan turun deras.',
          'Koala pulang sekolah tanpa basah.',
          'Harimau pulang dengan baju basah.',
          'Ayam tidak keluar rumah hari ini.',
        ],
        {
          say: 'Bukti pertama: bagaimana cuaca siang tadi?',
          answer: 1,
          clue: { emoji: '🌧️', label: 'Hujan' },
        },
        { say: 'Bukti kedua: siapa yang pulang tanpa basah?', answer: 2, clue: { item: 'umbrella', label: 'Tidak basah' } },
        'Siapa yang meminjam payung itu? Tunjuk dia!',
        [
          { name: 'Koala', item: 'koala', correct: true },
          { name: 'Harimau', item: 'tiger' },
          { name: 'Ayam', item: 'chicken' },
        ],
        'kota',
      ),
      mission(
        'Kue Cokelat',
        [
          'Kue cokelat di piring tinggal sedikit.',
          'Di lantai ada remah kue cokelat.',
          'Remah itu sampai ke kamar Beruang.',
          'Kucing tidur di sofa sejak pagi.',
          'Bebek baru pulang dari sekolah.',
        ],
        {
          say: 'Bukti pertama: apa yang ada di lantai?',
          answer: 1,
          clue: { emoji: '🍪', label: 'Remah kue' },
        },
        { say: 'Bukti kedua: remah itu sampai ke mana?', answer: 2, clue: { item: 'house', label: 'Kamar' } },
        'Siapa yang memakan kue itu? Tunjuk dia!',
        [
          { name: 'Beruang', item: 'bear', correct: true },
          { name: 'Kucing', item: 'cat' },
          { name: 'Bebek', item: 'duck' },
        ],
        'rumah',
      ),
    ),
  ],
};

export default config;
