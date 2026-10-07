/**
 * Core game-config contract. Every game is declared as data matching these
 * types — adding a game means writing a config + assets, never new engine
 * code. TypeScript catches config typos (wrong template name, missing
 * fields) at build time instead of at runtime on a kid's tablet.
 */

import type { Denom } from '@/engine/core/money';

export type GroupId = 'tk' | 'sd1' | 'sd2' | 'sd3';

export type TemplateId =
  | 'tap-answer' // pilih jawaban benar dari 2–4 pilihan
  | 'drag-drop' // pasangkan item ke targetnya
  | 'tracing' // menulis huruf/angka dengan jari
  | 'memory' // mencocokkan kartu
  | 'count-tap' // hitung & ketuk (wajib ada pengecoh — lihat CLAUDE.md)
  | 'story-choice' // cerita interaktif
  | 'spell' // eja/susun huruf jadi kata (dari game Petualangan Pintar)
  | 'path-trace' // susuri jalan dengan jari (antar kendaraan ke tujuan)
  | 'puzzle' // susun kepingan gambar sampai utuh
  | 'tap-picture' // sentuh bagian yang benar pada satu gambar (anggota tubuh)
  | 'cashier' // tarik uang ke laci sampai jumlahnya pas (Toko Kembalian)
  | 'clock-set' // putar jarum panjang dengan jari (Waktu Tepat)
  | 'word-train' // susun gerbong kata jadi kalimat (Susun Kalimat)
  | 'place-value' // bangun bilangan dari balok ratusan-puluhan-satuan (Istana Bilangan)
  | 'number-hop' // katak melompat di garis bilangan (Lompat Katak)
  | 'read-find'; // sentuh kalimat/kata bukti di dalam bacaan (Detektif Bacaan)

/* ---------- Per-template level payloads ---------- */

/**
 * Geometric shape ids (ported from SHAPES in petualangan-pintar.html). Used
 * by the Labirin Warna world, where cards are colored geometric shapes rendered
 * as SVG — emoji can't cover every shape×color combination.
 */
export type ShapeId =
  | 'lingkaran'
  | 'kotak'
  | 'segitiga'
  | 'bintang'
  | 'hati'
  | 'oval'
  | 'ketupat'
  // Extra bangun datar so the world doesn't keep asking about the same seven.
  | 'persegi-panjang'
  | 'trapesium'
  | 'segilima'
  | 'segienam'
  | 'layang-layang'
  | 'bulan'
  | 'awan'
  // --- Bangun ruang (SD kelas 1 & 2) ---
  // Digambar semu-3D di `Shape.tsx`: satu warna dasar, sisi-sisinya versi
  // gelap/terang dari warna itu. Kurikulum kelas 1 & 2 memintanya ("bangun
  // ruang: kubus, balok, bola, kerucut") dan sebelum ini tak ada satu game
  // pun yang memakainya. Dipakai Pola Pintar; kelompok TK sengaja TIDAK
  // memakainya (nama-namanya milik SD, aturan yang sama dengan ketupat &
  // segienam).
  | 'kubus'
  | 'balok'
  | 'bola'
  | 'tabung'
  | 'kerucut'
  | 'limas';

/** A single colored shape: which shape + its fill color (hex). */
export interface ShapeSpec {
  kind: ShapeId;
  /** Fill color as hex, e.g. "#EF5350". */
  color: string;
}

/**
 * A time on an analog clock face, drawn as SVG by `src/engine/ui/Clock.tsx`.
 * `h` is 1–12 (12-hour face), `m` is 0–59 (only 0 and 30 are used today).
 * The clock-face emoji (🕐–🕧) are NOT an option: they carry no numerals, so
 * a child can't actually read them.
 */
export interface ClockSpec {
  h: number;
  m?: number;
}

/**
 * Lambang sila Pancasila (Perisai Garuda, `sd2`), digambar engine di
 * `src/engine/ui/Sila.tsx` — config cuma menyebut nomornya.
 */
export type SilaId = 1 | 2 | 3 | 4 | 5;

export interface TapChoice {
  id: string;
  /** Big visual — emoji for now, later an image asset path. */
  emoji?: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`) — real art
   * (WebP) on the answer card instead of the device emoji font. `emoji` stays
   * as the fallback if the asset is missing.
   */
  item?: string;
  text?: string;
  /** Colored geometric shape drawn as SVG (Labirin Warna). */
  shape?: ShapeSpec;
  /** Analog clock face with numerals drawn as SVG (Jam Pintar). */
  clock?: ClockSpec;
  /**
   * Diagram batang MINI di kartu jawaban (Detektif Data "diagram mana yang
   * cocok dengan tabel?"). Hanya `kind: 'bar'`; kartunya otomatis memakai
   * grid lebar dua kolom seperti kartu bergambar.
   */
  chart?: BarChartSpec;
  /** Lambang sila di kartu jawaban (gambar penuh kartu, seperti `item`). */
  sila?: SilaId;
  correct?: boolean;
}

/** Operator symbols usable between item groups on a picture board. */
export type BoardOp = 'plus' | 'minus' | 'equals' | 'arrow' | 'question';

/**
 * One token of a picture board (`TapAnswerData.boardItems`): either a run of
 * `count` copies of the same item picture, or a single operator symbol.
 */
export type BoardItemToken =
  | { item: string; count: number }
  | { op: BoardOp };

export interface TapAnswerData {
  /**
   * Optional big picture cue shown above the choices — e.g. "🚀" for a
   * "which first letter?" question. Emoji for now, later an image path.
   */
  picture?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the big picture cue
   * instead of `picture` — real premium art rather than the device emoji
   * font. Falls back to the item's emoji if the image is missing.
   */
  pictureItem?: string;
  /**
   * Render `picture` as a dark silhouette (Pasar Buah "guess the shadow").
   * The child sees only the outline and taps the matching fruit below.
   */
  silhouette?: boolean;
  /**
   * Optional visual board shown above the choices, e.g. a word with a
   * blank ("_OKET"). Plain text/emoji — the config author composes it.
   * For a board of countable *pictures* (animals, fruit…) prefer
   * `boardItems` below, which renders real image assets instead of the
   * device emoji font.
   */
  board?: string;
  /**
   * Structured picture board: each token is either a group of `count`
   * identical item pictures (looked up by `item` id in the item registry,
   * `src/engine/ui/items.ts`, and rendered from `public/assets/items/`) or
   * an `op` symbol for equation boards ("panda ×3  +  panda ×3  =  ?").
   * When present it is rendered instead of `board`. Falls back to the
   * item's emoji if its image is missing, so configs work before art ships.
   */
  boardItems?: BoardItemToken[];
  /**
   * Papan gambar dibaca sebagai SATU BARIS urutan (rantai makanan Kebun Ilmu:
   * wortel → kelinci → ?). Gambarnya dikecilkan supaya tiga gambar + dua panah
   * tetap sebaris: urutan yang patah jadi dua baris berhenti terbaca sebagai
   * rantai, dan papan besar ukuran hitung-hitungan mendorong kartu jawaban
   * keluar layar. Jangan dipakai di papan HITUNG — di sana gambarnya harus
   * besar dan boleh turun baris.
   */
  boardRow?: boolean;
  /**
   * Kartu jawaban GAMBAR dalam SATU baris (tiga kolom), bukan grid dua kolom
   * yang besar. Untuk soal yang isyaratnya TULISAN (kata/kalimat yang harus
   * dibaca, Tangga Membaca): grid gambar bawaan `minmax(150px)` jatuh ke satu
   * kolom di HP 320 px dan tiga kartu bertumpuk melewati layar (terukur
   * 455 px scroll). Jangan dipakai kalau isyaratnya GAMBAR besar — di sana
   * kartu memang sengaja lebar supaya bentuknya bisa dibandingkan.
   */
  choiceRow?: boolean;
  /**
   * Written sum shown as one line under the picture board ("3 + 3 = ?").
   * Use it on EQUATION boards (addition/subtraction) so the child meets the
   * number symbols next to the pictures they just counted — never on a plain
   * "count these" board, where the numerals would be the answer itself.
   */
  equation?: string;
  /**
   * Optional shape pattern shown above the choices (Labirin Warna "Pola
   * Ajaib"): a repeating ABAB / ABC-ABC sequence where `null` is the empty
   * "?" box the child must fill by picking the next shape.
   */
  sequence?: (ShapeSpec | null)[];
  /**
   * Big analog clock cue shown above the choices (Jam Pintar "pukul berapa
   * ini?"). Drawn with numerals by `Clock.tsx` — see `ClockSpec`.
   */
  clock?: ClockSpec;
  /**
   * Isyarat gambar anak di atas kartu jawaban (Anggota Tubuh, "ada berapa
   * mata?"). Nilainya cuma menyebut BINGKAINYA — wajah, seluruh badan, atau
   * satu tangan — dan geometrinya urusan engine (`KID_CUE_FRAMES` di
   * `src/engine/ui/Kid.tsx`), pola yang sama dengan `RoadKind` di path-trace
   * dan `SceneId` di cerita.
   *
   * Ini murni gambar: tak ada satu pun titik yang bisa disentuh, anak tetap
   * menjawab lewat kartu. Untuk soal yang jawabannya MENYENTUH tubuh, pakai
   * template `tap-picture`, bukan ini.
   */
  kid?: KidView;
  /**
   * Alat ukur di atas kartu jawaban (Ukur Yuk, `sd2`): penggaris, timbangan
   * jarum, timbangan dua lengan, gelas takar, atau bangun berpetak. Config
   * cuma menyebut NILAINYA (panjang, berat, isi); gambarnya digambar engine
   * (`src/engine/ui/Measure.tsx`) supaya alat ukurnya tak pernah "berbohong" —
   * benda di atas penggaris selalu persis sepanjang angka di datanya.
   */
  measure?: MeasureSpec;
  /**
   * Data statistik di atas kartu jawaban (Detektif Data, `sd2`): tabel turus,
   * piktogram, diagram batang, tabel angka, atau deret data. Config cuma
   * menyebut NILAINYA per kategori; gambarnya digambar engine
   * (`src/engine/ui/Chart.tsx`), jadi batang selalu persis setinggi datanya.
   * Diagram batang SENGAJA tanpa angka di atas batang — itu jawaban bocor;
   * yang dibaca anak garis bantu & angka di sumbunya.
   */
  chart?: ChartSpec;
  /** Lambang sila besar sebagai isyarat soal ("lambang ini sila ke berapa?"). */
  sila?: SilaId;
  /**
   * Isyarat BILANGAN (Istana Bilangan, `sd2`): balok ratusan-puluhan-satuan,
   * bilangan dengan satu angka yang menyala, atau bukit pembulatan. Config
   * cuma menyebut bilangannya; gambarnya digambar engine
   * (`src/engine/ui/NumberCue.tsx`), jadi balok selalu persis sebanyak angkanya.
   */
  number?: NumberCueSpec;
  choices: TapChoice[]; // 2–4, exactly one with correct: true
}

/** Nilai tempat yang punya balok sendiri: ratusan (pelat), puluhan (batang), satuan (kubus). */
export type Place = 100 | 10 | 1;

/** Isi balok per nilai tempat. Bilangan 347 = `{ h: 3, t: 4, o: 7 }`. */
export interface PlaceCounts {
  h: number;
  t: number;
  o: number;
}

/**
 * Isyarat bilangan di atas kartu jawaban tap-answer:
 * - `blocks` — balok Dienes sebanyak `n` (TANPA angka; anak yang membacanya).
 * - `digits` — `n` ditulis besar, angka di tempat `mark` menyala ("angka yang
 *   menyala bernilai berapa?").
 * - `hill`   — bukit pembulatan: garis bilangan dari kelipatan `step` di bawah
 *   `n` sampai di atasnya, puncaknya di tengah, bola di `n`. Sesudah soal
 *   terjawab bolanya menggelinding ke lembah terdekat. `n` TIDAK boleh tepat di
 *   puncak (aturan "lima ke atas" tidak terbaca dari bukit).
 */
export type NumberCueSpec =
  | { kind: 'blocks'; n: number }
  | { kind: 'digits'; n: number; mark: Place }
  | { kind: 'hill'; n: number; step: 10 | 100 };

/**
 * Bangun bilangan dari balok (template `place-value`, Istana Bilangan).
 *
 * Anak mengetuk atau menyeret balok dari gudang ke tiga menara istana
 * (ratusan · puluhan · satuan). Di bawah tiap menara tertulis banyak baloknya,
 * jadi bilangannya "terbentuk" di layar sambil dibangun. Dinilai saat anak
 * menekan "Cocok!" — tidak selesai sendiri, supaya mencoba-coba tak dihukum.
 *
 * - `build` — mulai kosong, bangun `target`. **Tukar otomatis**: kubus satuan
 *   ke-10 menempel jadi satu batang puluhan, batang ke-10 jadi satu pelat
 *   ratusan (inti "menyimpan"). Menara yang disentuh = satu balok kembali ke
 *   gudang.
 * - `take` — istana sudah berisi `start`; anak harus MENGAMBIL `take` balok.
 *   Pelat ratusan yang disentuh PECAH jadi sepuluh batang puluhan (inti
 *   "meminjam"); batang/kubus yang disentuh = diambil. Tanpa tukar otomatis
 *   (sepuluh batang hasil pecahan tidak boleh menempel lagi).
 */
export interface PlaceValueData {
  mode: 'build' | 'take';
  /** Bilangan yang harus ada di istana saat "Cocok!" (1–999). */
  target: number;
  /** Balok yang ada di gudang (mode `build`), masing-masing tak terbatas. */
  wallet?: Place[];
  /** Isi awal istana (mode `take`). Puluhannya WAJIB 0 — lihat Istana Bilangan. */
  start?: PlaceCounts;
  /** Banyak yang diambil (mode `take`), ditulis di gelembung Raja Singa. */
  take?: number;
}

export interface DragItem {
  id: string;
  emoji?: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`) — real art
   * (WebP) instead of the device emoji font. `emoji` stays as the fallback.
   */
  item?: string;
  /** Lambang sila di kartu tarik (Perisai Garuda). */
  sila?: SilaId;
  text?: string;
  /** id of the target this item belongs to */
  targetId: string;
}

export interface DragTarget {
  id: string;
  emoji?: string;
  /** Item id from the picture registry — see `DragItem.item`. */
  item?: string;
  /** Lambang sila di kotak tujuan — lihat `DragItem.sila`. */
  sila?: SilaId;
  label: string;
}

export interface DragDropData {
  targets: DragTarget[];
  items: DragItem[];
  /**
   * The picture inside each target IS the question — "which word belongs to
   * this cat?" (Pasang Kata) — so it is drawn big, like a tap-answer cue.
   * Leave it off when the target picture is only a label the child reads past,
   * e.g. the colored dot on a Pasar Buah basket: enlarging those would crowd
   * out the basket's name and push a four-basket level off a small phone.
   */
  pictureTargets?: boolean;
}

export interface TracingData {
  /**
   * Karakter yang ditulis, mis. "3", "A", "a" — boleh lebih dari satu untuk
   * bilangan dua digit ("14"). Bentuk & urutan goresannya ada di ENGINE
   * (`src/engine/templates/glyphStrokes.ts`), config cuma menyebut hurufnya —
   * pola yang sama dengan `RoadKind` di path-trace.
   *
   * Tiap karakter WAJIB punya data goresan di situ: sejak template `tracing`
   * jadi rel yang diikuti jari, karakter tanpa data tidak lagi jatuh ke font
   * HP — tak ada yang bisa ditelusuri anak. Dijaga `scripts/check-glyphs.mjs`.
   */
  glyph: string;
  /**
   * Berapa kali glyph yang sama ditulis dalam SATU level (bawaan 1). Menulis
   * ulang itu cara menghafal bentuk huruf; tiga bulatan di atas panggung
   * menunjukkan sudah ulangan ke berapa. Bintang tetap per level, bukan per
   * ulangan — jadi menaikkan angka ini memperpanjang sesi, pertimbangkan
   * `sessionLevels`-nya.
   */
  repeat?: number;
}

export interface MemoryPair {
  id: string;
  emoji: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`). When set the
   * card face shows the real art (WebP) instead of the device emoji font;
   * `emoji` stays as the fallback if the asset is missing.
   */
  item?: string;
}

export interface MemoryData {
  pairs: MemoryPair[]; // 3–6 pairs
}

export interface CountTapData {
  /** How many the child must tap ("Ketuk 4 apel"). */
  ask: number;
  /** `item` = picture-registry id (real art); `emoji` is the fallback. */
  target: { emoji: string; label: string; item?: string };
  /**
   * How many target items to show — MUST be greater than `ask` so the
   * child has to stop counting at the asked number (design rule).
   */
  targetCount: number;
  /** 2–3 decoy item kinds mixed in (design rule: never monotone). */
  decoys: { emoji: string; count: number; item?: string }[];
}

/**
 * Tempat cerita berlangsung, digambar layar penuh oleh engine
 * (`src/engine/ui/Scene.tsx`) — bukan gambar yang harus diunduh. Config cuma
 * menyebut namanya, persis seperti `RoadKind` di path-trace.
 */
export type SceneId =
  | 'hutan'
  | 'kebun'
  | 'sungai'
  | 'sawah'
  | 'padang'
  | 'kota'
  | 'rumah'
  | 'laut'
  | 'gunung'
  | 'malam';

export interface StoryPage {
  emoji?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the page picture
   * instead of `emoji` — real art instead of the device emoji font. Same rule
   * as everywhere else: if the page is about an ANIMAL and art exists, use it.
   * `emoji` stays as the fallback.
   */
  item?: string;
  /**
   * ILUSTRASI ADEGAN: nama file (tanpa ekstensi) di `public/assets/story/`,
   * mis. `'jalak-kerbau'` → `public/assets/story/jalak-kerbau.webp`.
   *
   * Bedanya dengan `item`: item itu satu benda/hewan yang dipotong transparan
   * dan bisa dipakai di soal mana pun, sedangkan ilustrasi adegan sudah
   * membawa LATARNYA SENDIRI dan menggambarkan satu momen cerita — dua tokoh
   * yang berinteraksi ("jalak bertengger di punggung kerbau") hanya bisa
   * digambar begini; menempelkan dua gambar terpisah tidak pernah rapi.
   *
   * Kalau diisi, ini yang dipakai dan `item`/`emoji` tinggal jadi cadangan
   * (dipakai kalau filenya gagal dimuat). Latar engine (`Scene`) TETAP
   * digambar di belakangnya: langit + rumput di sekeliling panel gambar jauh
   * lebih menyatu dengan ilustrasi daripada latar pastel bawaan app —
   * sudah dibandingkan dengan tangkapan layar, jangan dibalik lagi. Pilih
   * `scene` yang tempatnya sama dengan ilustrasinya.
   */
  art?: string;
  text: string;
  /**
   * Latar tempat halaman ini. Ditulis hanya saat tempatnya BERGANTI: halaman
   * tanpa `scene` memakai latar halaman sebelumnya, jadi satu cerita cukup
   * menyebutnya sekali di halaman pertama.
   */
  scene?: SceneId;
  /** Absent = plain "Lanjut" page; present = a decision point. */
  choices?: { text: string; correct?: boolean; feedback?: string }[];
}

export interface StoryChoiceData {
  pages: StoryPage[];
}

export interface SpellData {
  /** Target word in UPPERCASE, e.g. "ROKET". Child taps letters in order. */
  word: string;
  /** Picture cue for the word, e.g. "🚀". */
  emoji: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the picture cue
   * instead of `emoji` — real art instead of the device emoji font.
   */
  item?: string;
  /**
   * Decoy letters mixed into the tray (design rule: never monotone — the
   * child must pick the right letters, not just tap everything in sight).
   * Should NOT already appear in `word`.
   */
  decoys: string[];
}

/**
 * Road shapes the `path-trace` template can draw. The geometry lives in the
 * engine (`src/engine/templates/PathTrace.tsx`); a config only names the shape
 * so level data stays plain data.
 */
export type RoadKind =
  | 'lurus' // garis lurus (paling mudah)
  | 'bukit' // bukit-bukit melengkung
  | 'gelombang' // ombak naik-turun
  | 'zigzag' // patah-patah tajam
  | 'tangga' // anak tangga (belok siku)
  | 'lengkung' // huruf U
  | 'ess' // huruf S
  // Tiga lekukan berturut-turut (bukan dua seperti 'ess') — dipakai game SD
  // yang levelnya sengaja lebih sulit dari 'ess' TK, lihat 'Rute Kendaraan'.
  | 'kelokan';

export interface RoadSpec {
  kind: RoadKind;
  /**
   * How many repeats for shapes that repeat (bukit, gelombang, zigzag,
   * tangga) — more repeats = jalan lebih panjang & sulit. Default 3,
   * maksimal 8.
   */
  steps?: number;
  /**
   * Jalan lebih SEMPIT: toleransi jari yang masih dianggap "di jalan"
   * dipersempit di engine (lihat `PathTrace.tsx`), dan garis jalannya
   * digambar lebih tipis supaya anak melihat bedanya. Dipakai game SD yang
   * levelnya sengaja menuntut presisi lebih daripada TK — bukan cuma bentuk
   * jalannya yang lebih rumit, tapi ruang geraknya sendiri lebih kecil.
   */
  narrow?: boolean;
}

export interface PathTraceData {
  road: RoadSpec;
  /** Vehicle emoji driven along the road, e.g. "🚗". */
  vehicle: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the vehicle instead
   * of the emoji — real art when the assets ship. Falls back to `vehicle`.
   */
  vehicleItem?: string;
  /** Emoji at the end of the road (rumah, sekolah, garis finis…). */
  goal?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the destination
   * instead of the emoji — real art (rumah, sekolah, rumah sakit…). Falls
   * back to `goal`.
   */
  goalItem?: string;
}

/**
 * Puzzle gambar: anak menarik kepingan dari baki ke papan sampai gambarnya
 * utuh.
 *
 * GAMBARNYA TIDAK PERNAH DIPOTONG JADI BERKAS. Tiap keping merender gambar
 * UTUH yang sama, diperbesar sebesar papan lalu digeser sehingga cuma
 * potongannya sendiri yang terlihat. Jadi satu puzzle = nol aset baru dan
 * satu unduhan per level, dan menambah puzzle cukup menyebut gambar yang
 * sudah ada.
 *
 * Dua sumber gambar — lihat komentar kepala `src/games/tk/puzzle-gambar.ts`
 * untuk aturan memilih ukuran papan supaya tak ada keping yang jadi bidang
 * kosong (kepingan polos tak bisa ditebak anak, dan itu tidak adil):
 *  - `item` = seni potongan dari registry (`src/engine/ui/items.ts`), digelar
 *    di atas panel berwarna.
 *  - `art`  = ilustrasi berlatar penuh di `public/assets/story/`.
 */
export interface PuzzleData {
  /** Id item registry — seni benda/hewan di atas panel berwarna. */
  item?: string;
  /** Nama berkas (tanpa ekstensi) di `public/assets/story/`. */
  art?: string;
  /**
   * Warna panel di belakang gambar `item`. Diabaikan kalau memakai `art`
   * (ilustrasi sudah membawa latarnya sendiri).
   */
  bg?: string;
  /** Jumlah kolom & baris papan. Kepingan = cols × rows (4 atau 6). */
  cols: 2 | 3;
  rows: 2 | 3;
}

/**
 * Bagian tubuh yang bisa disentuh pada gambar anak. GEOMETRINYA ADA DI ENGINE
 * (`src/engine/ui/Kid.tsx`): config cuma MENYEBUT namanya, persis seperti
 * `RoadKind` di path-trace dan `SceneId` di cerita. Jadi kalau gambarnya nanti
 * diganti ilustrasi kiriman pemilik, koordinatnya dibetulkan di SATU tempat dan
 * tak satu pun config ikut berubah.
 *
 * Daftarnya sengaja mengikuti lagu "Kepala pundak lutut kaki" — kalimat yang
 * sudah dihafal hampir semua anak TK Indonesia — plus bagian yang disebut bait
 * keduanya (mata, telinga, mulut, hidung, pipi).
 */
export type BodyPartId =
  | 'rambut'
  | 'kepala'
  | 'mata'
  | 'telinga'
  | 'hidung'
  | 'mulut'
  | 'pipi'
  | 'leher'
  | 'pundak'
  | 'tangan'
  | 'perut'
  | 'lutut'
  | 'kaki';

/**
 * "Kamera" untuk gambar anak yang sama (`src/engine/ui/Kid.tsx`) saat ia
 * dipakai sebagai ISYARAT SOAL — bukan sebagai papan sentuh.
 *
 * Bingkai template `tap-picture` dihitung engine dari bagian yang aktif
 * (`kidFrame`), karena di sana yang harus muat adalah lingkaran sentuhnya. Di
 * kartu jawaban tak ada lingkaran sentuh sama sekali, jadi bingkainya dipilih
 * config: soal "ada berapa mata?" butuh wajah yang besar, "ada berapa kaki?"
 * butuh seluruh badan, dan "ada berapa jari?" butuh satu tangan saja — di
 * seluruh badan jarinya cuma beberapa piksel dan tak mungkin dihitung.
 *
 * Kotak tiap bingkai ada di `KID_CUE_FRAMES` (Kid.tsx), satu tempat bersama
 * koordinat tubuhnya, supaya ikut dibetulkan kalau gambarnya diganti lagi.
 */
export type KidView = 'wajah' | 'badan' | 'tangan';

/**
 * Benda memanjang yang diletakkan di atas penggaris. SENGAJA digambar engine
 * (SVG), bukan seni item: seni item digambar miring/berbingkai bebas, jadi
 * ujungnya tak bisa dijamin jatuh tepat di garis sentimeter. Benda di sini
 * direntangkan persis dari `from` sampai `to`.
 */
export type RulerThing = 'pensil' | 'krayon' | 'pita' | 'sedotan' | 'penghapus';

/** Satu timbangan dua lengan: dua benda (id item registry) dan sisi yang lebih berat. */
export interface BalanceSpec {
  leftItem: string;
  rightItem: string;
  heavier: 'left' | 'right';
}

/** Lihat `TapAnswerData.measure`. Semua bilangan dalam satuan yang disebut. */
export type MeasureSpec =
  /** Penggaris 0…`max` cm (bawaan: sependek yang perlu, 10–15 cm); benda terentang dari `from` ke `to` cm. */
  | { kind: 'ruler'; thing: RulerThing; from: number; to: number; max?: number }
  /**
   * Timbangan jarum. `kg`: skala 0–10 kg, tiap kilogram berangka. `g`: skala
   * 0–1.000 g, garis tiap 100 g, angka tiap 200 g — nilai ganjil (300 g) harus
   * dibaca dari garisnya.
   */
  | { kind: 'scale'; item: string; value: number; unit: 'kg' | 'g' }
  /** Satu atau dua timbangan dua lengan berdampingan (membandingkan berat). */
  | { kind: 'balance'; scales: BalanceSpec[] }
  /** Gelas takar 0–1.000 mL, garis tiap 100 mL, angka tiap 200 mL. */
  | { kind: 'beaker'; ml: number; liquid?: 'air' | 'susu' | 'jus' }
  /** Bangun di kertas berpetak: tiap string satu baris, `#` = petak terisi. */
  | { kind: 'grid'; rows: string[] }
  /** Persegi panjang berlabel panjang & lebar (keliling kebun/lapangan). */
  | { kind: 'rect'; w: number; h: number; unit: 'cm' | 'm' };

/**
 * Satu kategori data statistik (Detektif Data): gambarnya (id item registry,
 * `src/engine/ui/items.ts`), namanya, dan nilainya. Maksimal 4 kategori per
 * diagram — sesuai kurikulum Fase B dan batas yang muat di HP 320 px.
 */
export interface ChartRow {
  item: string;
  label: string;
  value: number;
}

/**
 * Diagram batang tegak. Garis bantu tiap `step`, angka di sumbu tiap
 * `step × (labelEvery ?? 1)`, puncak sumbu `max` (kelipatan `step`).
 */
export interface BarChartSpec {
  kind: 'bar';
  rows: ChartRow[];
  step: number;
  max: number;
  labelEvery?: number;
}

/** Lihat `TapAnswerData.chart`. */
export type ChartSpec =
  /** Tabel turus: gambar + nama + turus (berikat lima). Tanpa kolom angka. */
  | { kind: 'tally'; rows: ChartRow[] }
  /**
   * Piktogram: gambar kategori diulang. `per` = nilai SATU gambar (1 atau 2;
   * nilai ganjil pada `per: 2` digambar setengah gambar). Keterangan
   * "gambar = per" selalu ikut tergambar.
   */
  | { kind: 'picto'; rows: ChartRow[]; per: 1 | 2 }
  | BarChartSpec
  /** Tabel angka mendatar: satu kolom per kategori (gambar di atas angka). */
  | { kind: 'table'; rows: ChartRow[] }
  /** Deret data mentah (mis. nilai ulangan) dengan judul pendek — soal modus. */
  | { kind: 'list'; title: string; values: number[] };

/**
 * Bagian tanaman yang bisa disentuh (Kebun Ilmu, sd2). Geometrinya di
 * `src/engine/ui/Plant.tsx` — config cuma menyebut namanya.
 */
export type PlantPartId = 'akar' | 'batang' | 'daun' | 'bunga' | 'buah';

/**
 * Gambar yang dipakai template `tap-picture`. `anak` = gambar anak
 * (`Kid.tsx`, Anggota Tubuh), `tanaman` = tanaman SVG (`Plant.tsx`, Kebun
 * Ilmu). Tabel keduanya dikumpulkan di `src/engine/ui/figures.ts`.
 */
export type FigureId = 'anak' | 'tanaman';

interface TapPictureBase<F extends FigureId, P extends string> {
  /** Figur yang disentuh. Bawaannya `anak`, supaya config lama tak berubah. */
  figure?: F;
  /** Bagian yang bisa disentuh di level ini (2–5, termasuk jawabannya). */
  parts: P[];
  /** Jawaban yang benar — wajib salah satu isi `parts`. */
  answer: P;
  /**
   * Isyarat benda di pojok gambar ("Topi dipakai di bagian mana?") — id item
   * registry (`src/engine/ui/items.ts`). Bendanya yang ditanyakan, jadi anak
   * tetap menjawab dengan menyentuh gambar, bukan memilih kartu.
   */
  cueItem?: string;
}

/**
 * Sentuh bagian yang benar pada SATU gambar utuh.
 *
 * Sengaja bukan kartu jawaban berisi potongan tubuh (telinga sendirian, tangan
 * terpotong): itu menyeramkan untuk anak empat tahun dan melanggar aturan
 * "satu gambar satu arti". Emoji bagian tubuh (👂 ✋ 🦶 👃) juga tidak dipakai —
 * berwarna kulit tertentu dan beda bentuk di tiap HP, masalah yang sama dengan
 * 🕒 di Jam Pintar.
 *
 * ATURAN MENULIS LEVEL (dijaga `scripts/check-body-parts.mjs`):
 * - `parts` = jawaban + 2–3 pengecoh (tanaman boleh sampai 4 — kelimanya).
 *   Makin banyak bagian yang aktif, makin kecil daerah sentuhnya — engine memperkecil radius tiap titik supaya dua
 *   bagian tak pernah bertindihan, jadi bagian yang berdempetan di gambar
 *   (pipi & telinga, lutut & kaki, leher & mulut) JANGAN diaktifkan bersama.
 * - Engine memilih framing sendiri: semua bagian di wajah → gambar wajah
 *   diperbesar; ada satu saja bagian badan → seluruh badan. Jadi jangan
 *   mencampur bagian wajah yang kecil (hidung, mulut, pipi) dengan bagian
 *   badan — di tampilan seluruh badan wajahnya jadi terlalu kecil.
 * - `kepala` itu SELURUH kepala; jangan disatukan dengan bagian wajah mana pun.
 * - Figur tanaman: kelima bagian boleh aktif bersamaan (letaknya berjauhan).
 *
 * Discriminated union: `parts`/`answer` diperiksa TypeScript terhadap figur
 * yang dipilih, jadi "akar" di gambar anak (atau "hidung" di tanaman) gagal
 * saat build, bukan saat anak main.
 */
export type TapPictureData =
  | (TapPictureBase<'anak', BodyPartId> & { figure?: 'anak' })
  | (TapPictureBase<'tanaman', PlantPartId> & { figure: 'tanaman' });

/** Pecahan rupiah yang tersedia di template `cashier` — lihat `src/engine/core/money.ts`. */
export type { Denom };

/** Satu barang di papan soal kasir: gambar + harga yang tertulis di labelnya. */
export interface CashierGood {
  /** Id registry item (seni WebP); `emoji` jadi cadangan. */
  item?: string;
  emoji?: string;
  /** Nama pendek untuk pembaca layar ("roti"). */
  label: string;
  /** Harga dalam rupiah, ditulis di label "Rp4.000". */
  price: number;
}

/**
 * Kasir: tarik uang dari dompet ke SATU baki sampai jumlahnya pas.
 *
 * Bedanya dengan `drag-drop`: di sana satu kartu ke satu kotak dan kartunya
 * habis; di sini dompetnya TAK TERBATAS (tiap pecahan boleh ditarik berkali-
 * kali), banyak lembar masuk ke satu baki, dan yang dinilai JUMLAHNYA. Uang
 * yang sudah masuk baki bisa disentuh untuk dikembalikan ke dompet.
 *
 * Dua cara menilai (`check`), dipilih per soal oleh config:
 * - `'auto'`  — baki menampilkan "terkumpul / target" dan soal selesai sendiri
 *   begitu pas. Untuk soal yang targetnya MEMANG diketahui ("bayar Rp7.000").
 *   Kelebihan = satu kesalahan senyap, lembar terakhir memantul balik.
 * - `'button'` — baki hanya menampilkan jumlah terkumpul, targetnya tidak, dan
 *   anak menekan tombol untuk menyerahkan. Wajib untuk soal yang targetnya
 *   JAWABANNYA (total belanja, kembalian, tabungan): kalau soal selesai sendiri
 *   di angka yang benar, anak cukup menambah Rp1.000 terus sampai "menang"
 *   tanpa pernah menghitung.
 */
export interface CashierData {
  /** Jumlah yang harus terkumpul di baki (rupiah). */
  target: number;
  /**
   * Pecahan di dompet (masing-masing tak terbatas), 2–4 macam — empat kartu
   * pas sebaris di HP 320 px, lima tidak (turun baris = layar scroll).
   */
  wallet: Denom[];
  check: 'auto' | 'button';
  /** Barang yang dibeli, dengan harganya — isyarat soal di atas baki. */
  goods?: CashierGood[];
  /** Uang yang diserahkan pembeli (soal kembalian), ditampilkan di papan soal. */
  paid?: Denom[];
  /**
   * Baki harus diisi dengan lembar/keping PALING SEDIKIT. Soal hanya benar
   * kalau jumlahnya pas DAN banyaknya = minimum yang dihitung engine
   * (`fewestPieces`), jadi config tak perlu — dan tak bisa salah — menulisnya.
   */
  fewest?: boolean;
  /** Nama baki: laci kasir (membayar), tangan pembeli (kembalian), celengan. */
  tray: 'laci' | 'tangan' | 'celengan';
}

/**
 * Satu tugas di template `number-hop` (Lompat Katak). Langkah bersambung: katak
 * memulai langkah berikutnya dari tempat ia tiba.
 * - `hop` (bawaan): anak menekan tombol lompat ±100 / ±10 / ±1 (bebas, boleh
 *   maju-mundur) lalu "Cocok!". Benar kalau katak berdiri di `target`. Tujuan
 *   TIDAK digambar — kecuali `goal`, untuk soal "bawa katak ke teratai itu".
 * - `place`: anak MENYERET katak ke kira-kira hasil `show` (menaksir) di garis
 *   0–1.000; diterima kalau selisihnya ≤ `tolerance`. Sesudahnya katak
 *   melompat ke hasil sebenarnya.
 */
export interface HopStep {
  kind?: 'hop' | 'place';
  target: number;
  /** Soal yang ditulis besar di atas garis, mis. "458 + 237". Tulisan layar. */
  show: string;
  /** Gambar teratai tujuan (berbunga + angkanya) di `target`. */
  goal?: boolean;
  /** Kalimat yang dibacakan saat langkah ini mulai (langkah ke-2 dst.). */
  say?: string;
  /** Langkah `place`: selisih yang masih diterima (bawaan 30). */
  tolerance?: number;
}

/** Lompat Katak: katak melompat di garis bilangan — lihat `HopStep`. */
export interface NumberHopData {
  /** Teratai tempat katak mulai (0–999). */
  from: number;
  steps: HopStep[];
  /** Pertanyaan penutup sesudah langkah terakhir (pilihan diacak engine). */
  ask?: {
    prompt: string;
    choices: { text: string; correct?: boolean }[];
  };
}

/**
 * Waktu dalam sehari untuk template `clock-set`: `h` 0–23 (format 24 jam),
 * `m` 0–59. Muka jamnya tetap 12 jam — `h` 24 jam dipakai supaya "pukul tujuh
 * malam" (19.00) dan "pukul tujuh pagi" (07.00) tidak dianggap sama.
 */
export interface DayTime {
  h: number;
  m: number;
}

/**
 * Satu tugas memutar jarum di template `clock-set`. Anak memutar jarum
 * PANJANG; jarum pendek ikut bergerak sendiri (60 menit = 1 jam).
 */
export interface ClockStep {
  /** Waktu yang harus ditunjukkan jam sebelum tombol "Cocok!" diterima. */
  to: DayTime;
  /**
   * Gambar BUSUR WAKTU dari posisi jam saat langkah ini dimulai sampai posisi
   * jarum sekarang — "tiga puluh menit" jadi setengah lingkaran yang terlihat.
   * Untuk soal lama kegiatan.
   */
  arc?: boolean;
  /**
   * Tulisan jam digital besar di atas jam ("08.40"), untuk soal digital →
   * analog. Tulisan layar saja, tidak pernah dibacakan — boleh berdigit.
   */
  show?: string;
  /**
   * Kalimat untuk langkah KE-2 dan seterusnya (langkah pertama memakai
   * `narration` level). Dibacakan, jadi TANPA digit.
   */
  say?: string;
}

/**
 * Template `clock-set` (Waktu Tepat): anak MEMEGANG jamnya — memutar jarum
 * panjang dengan jari — bukan memilih satu dari tiga kartu jam.
 *
 * Satu level = satu kegiatan dalam hari Kancil: nol, satu, atau beberapa
 * langkah memutar jarum (`steps`, dikerjakan berurutan dan bersambung dari
 * posisi langkah sebelumnya), lalu boleh ditutup satu pertanyaan (`ask`).
 * `steps: []` = jamnya diam dan cuma dibaca (soal analog → digital).
 */
export interface ClockSetData {
  /** Posisi jam saat level dimulai. */
  from: DayTime;
  steps: ClockStep[];
  /**
   * Pertanyaan sesudah semua langkah selesai, dijawab dengan mengetuk salah
   * satu pilihan tulisan. Pengecohnya dari kesalahan khas (jarum tertukar,
   * angka di bawah jarum panjang dibaca sebagai menit, 09.15 − 08.45 = 70).
   */
  ask?: {
    /** Dibacakan — TANPA digit. */
    prompt: string;
    choices: { text: string; correct?: boolean }[];
  };
  /** Cincin luar 13–24 (kelas 4, jam 24): muncul saat hari sudah sore. */
  ring24?: boolean;
  /** Latar tempat kegiatan ini (pagi di rumah, siang di kota, malam…). */
  scene?: SceneId;
}

/**
 * Satu putaran template `word-train` (Susun Kalimat → "Kereta Kata"): tiap
 * kata = satu GERBONG. `words` SELALU kalimat utuh yang benar, dari kata
 * pertama (berhuruf kapital) sampai tanda bacanya sendiri sebagai gerbong
 * terakhir (".", "?", "!"). Kalimat itulah yang dibacakan saat kereta
 * berangkat — dan HANYA sesudah benar (lihat `sentenceText` di wordTrain.ts).
 *
 * Kata boleh memuat `|` untuk menandai imbuhan ("me|nyapu"): di gerbong,
 * bagian sebelum `|` tampil sebagai gerbong kecil berwarna; di suara & di
 * penilaian `|`-nya dibuang.
 */
export type TrainRound =
  /** Seret/ketuk gerbong ke rel sampai urutannya benar. */
  | {
      kind: 'order';
      words: string[];
      /** Urutan lain yang JUGA benar (kalimat yang bisa disusun dua cara). */
      alt?: string[][];
      /** Gerbong pengecoh di baki: tanda baca lain, huruf kecil di depan… */
      decoys?: string[];
      say?: string;
    }
  /** Kereta sudah tersusun; sentuh gerbong yang ditanyakan (kata kerja…). */
  | { kind: 'pick'; words: string[]; answer: number[]; say?: string }
  /** Satu gerbong kosong; pilih gerbong yang tepat dari baki. */
  | { kind: 'fill'; words: string[]; gap: number; options: string[]; say?: string };

export interface WordTrainData {
  /**
   * Dikerjakan berurutan dalam satu level; level selesai sesudah putaran
   * terakhir. Misi besar = dua kalimat yang menjadi satu cerita pendek.
   * `say` putaran pertama diabaikan (narasi level yang dibacakan).
   */
  rounds: TrainRound[];
  scene?: SceneId;
}

/**
 * Satu langkah template `read-find` (Detektif Bacaan → "Kasus Detektif
 * Kucing"). Langkah-langkah satu level dikerjakan berurutan di atas bacaan
 * yang SAMA; `say` langkah pertama diabaikan (narasi level yang dibacakan).
 */
export type ReadStep =
  /**
   * Sentuh KALIMAT bukti. `answer` = indeks kalimat di `sentences` (boleh
   * lebih dari satu kalau dua kalimat sama-sama bukti yang sah).
   */
  | {
      kind: 'sentence';
      answer: number[];
      say?: string;
      /**
       * Kartu di PAPAN BUKTI begitu kalimatnya ketemu. Papan hanya tampil di
       * level yang punya `clue` (misi besar).
       */
      clue?: { emoji?: string; item?: string; label: string };
    }
  /**
   * Sentuh KATA di dalam satu kalimat (makna kata dari konteks). Hanya
   * kalimat `sentence` yang katanya bisa disentuh; `answer` = kata itu persis
   * seperti tertulis (tanpa tanda baca).
   */
  | { kind: 'word'; sentence: number; answer: string; say?: string }
  /** Tunjuk jawabannya dari kartu (misi besar: siapa yang melakukannya?). */
  | {
      kind: 'choose';
      say: string;
      choices: { text: string; item?: string; emoji?: string; correct?: boolean }[];
    };

export interface ReadFindData {
  /** Judul kasus di atas bacaan, mis. "Mangga yang Hilang". Tulisan layar. */
  title: string;
  /**
   * Bacaannya, SATU KALIMAT per butir. Tiap kalimat bisa disentuh dan
   * DIBACAKAN saat disentuh (anak yang tersendat membaca tetap terbantu),
   * jadi tiap kalimat juga baris narasi — TANPA digit.
   */
  sentences: string[];
  steps: ReadStep[];
  scene?: SceneId;
  /**
   * Seni tokoh pemandu: nama file (tanpa ekstensi) di `public/assets/ui/`.
   * Kosong = kaca pembesar emoji. Sengaja opsional: `<img>` ke berkas yang
   * belum ada akan mengotori console dengan 404.
   */
  guide?: string;
}

export interface LevelDataMap {
  'tap-answer': TapAnswerData;
  'drag-drop': DragDropData;
  tracing: TracingData;
  memory: MemoryData;
  'count-tap': CountTapData;
  'story-choice': StoryChoiceData;
  spell: SpellData;
  'path-trace': PathTraceData;
  puzzle: PuzzleData;
  'tap-picture': TapPictureData;
  cashier: CashierData;
  'clock-set': ClockSetData;
  'word-train': WordTrainData;
  'place-value': PlaceValueData;
  'number-hop': NumberHopData;
  'read-find': ReadFindData;
}

/* ---------- Game config ---------- */

/**
 * How a level shows up on the level picker (see `GameConfig.chooseLevel`).
 * The card needs a SHORT title: `narration` is a full spoken sentence
 * ("Timun Mas. Ayo bantu Timun Mas pulang dengan selamat!") and would not fit.
 */
export interface LevelCard {
  /** Judul pendek di kartu, mis. "Timun Mas". */
  label: string;
  emoji?: string;
  /** Item id (registry `src/engine/ui/items.ts`) — art instead of the emoji. */
  item?: string;
  /**
   * SAMPUL kartu: nama file (tanpa ekstensi) di `public/assets/story/`, mis.
   * `'jalak-kerbau'`. Dirender selebar kartu seperti sampul buku, jadi yang
   * dipakai harus ILUSTRASI ADEGAN berlatar (`StoryPage.art`), bukan item yang
   * dipotong transparan — item akan tampak melayang di dalam bingkai sampul.
   *
   * Gambarnya DIPOTONG mengikuti kotak sampul (`object-fit: cover`), jadi pilih
   * adegan yang tokohnya di TENGAH; yang menempel di tepi akan terpotong.
   * `item`/`emoji` tetap jadi cadangan kalau filenya gagal dimuat.
   */
  art?: string;
  /**
   * Kartu tampil TAPI belum bisa dimainkan ("segera hadir"): redup, bergembok,
   * tidak bisa ditekan. Dipakai saat isinya sudah ditulis tapi tampilannya
   * belum digarap — anak tetap melihat judulnya, jadi jelas ceritanya menyusul
   * dan bukan hilang. Levelnya SENGAJA tetap ada di `levels`: id dan bintang
   * yang sudah terkumpul tidak ikut hilang saat kartunya dibuka lagi nanti.
   */
  soon?: boolean;
}

/**
 * Turn the game's opening screen into a LEVEL PICKER: every level is shown as
 * a card and the child chooses which one to play (owner's decision 2026-08-09
 * for the story games — the six titles are on screen from the start instead of
 * two being drawn at random).
 *
 * Rules for a game that uses it:
 * - every slot must be ONE level (no variant pools) carrying a `card`,
 * - level ids must be unique — the picker shows the stars earned per level,
 * - `sessionLevels` is ignored: one pick = one level.
 */
/**
 * Satu tahap di peta tahap (`GameConfig.stageMap`): sekelompok slot yang
 * dimainkan berurutan dalam satu kali main.
 */
export interface Stage {
  /** Id stabil; jangan diubah — dipakai sebagai kunci React & penanda uji. */
  id: string;
  /** Nama pendek di bawah titik peta, mis. "Suku Kata". */
  label: string;
  /** Ikon titik peta. */
  emoji: string;
  /**
   * Id slot (`GameLevel.id`) yang menjadi isi tahap ini, dimainkan berurutan.
   * Tiap slot WAJIB milik tepat satu tahap. Tahap dianggap SELESAI kalau
   * semua slotnya sudah punya bintang — jadi kemajuan tahap diturunkan dari
   * bintang biasa (ikut tersinkron ke Firestore tanpa penyimpanan baru).
   */
  slots: string[];
}

/**
 * Peta tahap berkelok (Tangga Membaca, 2026-10-05): layar pembuka berupa
 * jalan dengan titik-titik tahap. Tahap ke-n baru terbuka setelah tahap
 * sebelumnya selesai (keputusan pemilik: terkunci berurutan). Mengetuk tahap
 * memainkan seluruh slot tahap itu; tak ada "lanjutkan permainan" — satu
 * tahap cukup pendek untuk diulang.
 */
export interface StageMap {
  /** Ajakan di bawah judul game, mis. "Naik satu anak tangga tiap hari!". */
  title: string;
  stages: Stage[];
}

export interface LevelPicker {
  /** Ajakan di atas kartu-kartu, mis. "Pilih ceritamu!". */
  title: string;
  /** Tombol di layar selesai. Bawaan: "🔁 Pilih Lagi". */
  again?: string;
}

/**
 * PROYEK SESI (lapisan premium P3, docs/rencana-game-sd-kelas-3-4.md 2b.2):
 * satu benda yang terbangun selama satu sesi main — tiap level yang benar
 * menambah satu bagian (`GameLevel.stamp`), dan layar "Selamat!"
 * memperlihatkan hasilnya utuh. Saat dipasang, deretan titik level di atas
 * layar diganti halaman-halaman proyek ini, jadi tidak memakan tinggi layar.
 */
export interface ProjectSpec {
  /** Nama proyeknya, mis. "Buku Harian Kancil". */
  title: string;
}

/** Bagian proyek sesi yang didapat dari satu level — lihat `ProjectSpec`. */
export interface LevelStamp {
  emoji: string;
  /** Lambang sila sebagai bagian proyek (Perisai Garuda); `emoji` tetap cadangan teks. */
  sila?: SilaId;
  /** Keterangan pendek di bawahnya (mis. "07.15"). Tulisan layar saja. */
  label?: string;
}

export interface GameLevel<T extends TemplateId = TemplateId> {
  id: string;
  /** Narrated instruction (TTS/speechSynthesis) — every level must have one. */
  narration: string;
  /** Only for games with `chooseLevel` — how this level looks on the picker. */
  card?: LevelCard;
  /** Bagian proyek sesi dari level ini — hanya untuk game ber-`project`. */
  stamp?: LevelStamp;
  data: LevelDataMap[T];
}

/**
 * A level "slot": either a single fixed level, or an array of interchangeable
 * variants. When it's an array the shell picks one variant at random each
 * time the game is played (and on "Main Lagi") — so replays stay fresh and
 * the questions don't feel repetitive, without any per-question logic living
 * in the engine. All variants are still plain typed data.
 */
export type LevelSlot<T extends TemplateId = TemplateId> = GameLevel<T> | GameLevel<T>[];

/** Mixed-game equivalent of LevelSlot. */
export type MixedSlot = MixedLevel | MixedLevel[];

export interface GameConfig<T extends TemplateId = TemplateId> {
  id: string;
  group: GroupId;
  title: string;
  /**
   * Fallback icon only. The icon actually shown (portal card + intro screen)
   * is `GameMeta.emoji` in `src/games/registry.ts` — one place, so the two
   * screens can't drift apart.
   */
  emoji: string;
  template: T;
  /**
   * Ordered slots; a slot may be one level or a pool of random variants.
   *
   * NOTE: free/locked status is NOT declared per game any more — it lives in
   * `src/data/access.ts` (`FREE_GAME_IDS` + lock mode) so there is one place
   * to flip. See CLAUDE.md "Sistem Kunci Game".
   */
  levels: LevelSlot<T>[];
  /**
   * Play only this many slots per session, drawn at random (no repeats) and
   * in random order — e.g. a game holding all numbers 1–20 but asking 7 of
   * them each play. Omit (or >= levels.length) to play every slot in order.
   */
  sessionLevels?: number;
  /** Let the child pick the level from a card grid — see `LevelPicker`. */
  chooseLevel?: LevelPicker;
  /** Layar pembuka berupa peta tahap — lihat `StageMap`. */
  stageMap?: StageMap;
  /** Proyek sesi — lihat `ProjectSpec`. */
  project?: ProjectSpec;
  /**
   * PETUNJUK BERTINGKAT (lapisan premium P2): sesudah salah ke-2 di satu soal,
   * bagian yang perlu dilihat menyala; sesudah salah ke-3, satu langkah
   * diperlihatkan. Template menerimanya sebagai `TemplateProps.hint`. Bintang
   * tetap dihitung seperti biasa. Keputusan pemilik 2026-10-06: dinyalakan
   * HANYA di game `sd2` baru — game TK & SD 1-2 yang sudah dijual tidak.
   */
  hints?: boolean;
}

/**
 * A level that carries its own template — used by "mixed" games where the
 * question type changes level to level (ported worlds from Petualangan
 * Pintar mix counting, letters, spelling, etc. inside one game). The
 * discriminated union keeps `data` type-safe against the level's `template`.
 */
export type MixedLevel = {
  [T in TemplateId]: {
    id: string;
    narration: string;
    /** See `GameLevel.card` — only used by games with `chooseLevel`. */
    card?: LevelCard;
    /** See `GameLevel.stamp`. */
    stamp?: LevelStamp;
    template: T;
    data: LevelDataMap[T];
  };
}[TemplateId];

/**
 * Game whose levels each declare their own template. `template: 'mixed'`
 * flags the portal/shell to resolve the template per level instead of once
 * per game. Homogeneous games keep using the simpler `GameConfig<T>`.
 */
export interface MixedGameConfig {
  id: string;
  group: GroupId;
  title: string;
  /** Fallback icon only — see `GameConfig.emoji`. */
  emoji: string;
  template: 'mixed';
  /** Free/locked status: see `src/data/access.ts` (not declared per game). */
  levels: MixedSlot[];
  /** See `GameConfig.sessionLevels`. */
  sessionLevels?: number;
  /** See `GameConfig.chooseLevel`. */
  chooseLevel?: LevelPicker;
  /** See `GameConfig.stageMap`. */
  stageMap?: StageMap;
  /** See `GameConfig.project`. */
  project?: ProjectSpec;
  /** See `GameConfig.hints`. */
  hints?: boolean;
}

/** Either kind of game — what the shell, registry, and pages accept. */
export type AnyGameConfig = GameConfig | MixedGameConfig;

/** Star progress per level, stored per device (Firestore sync in Fase 5). */
export type Stars = 0 | 1 | 2 | 3;
