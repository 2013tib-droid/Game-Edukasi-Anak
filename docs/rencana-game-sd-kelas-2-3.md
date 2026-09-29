# Rencana 10 Game — SD Kelas 2 & 3 (patokan pengerjaan)

Disusun 2026-09-29 atas permintaan pemilik: *"analisa 10 game yang cocok untuk
kelas 2 dan 3 SD, buat judul dan deskripsi per game — jadi patokan pengerjaan."*

Dokumen ini **rencana**, belum keputusan final. Tiap game yang mulai dikerjakan
diberi tanda di tabel "Status" paling bawah, dan catatan pengerjaannya tetap
masuk ke "Status Pengerjaan" di `CLAUDE.md` seperti biasa.

---

## 0. Tiga hal yang perlu diputuskan pemilik DULU

### 0a. "Kelas 2 & 3" menyeberangi dua kelompok

Pola nama resmi (CLAUDE.md "Penamaan Kelompok") adalah **SD Kelas 1 & 2 →
SD Kelas 3 & 4 → SD Kelas 5 & 6**. Kelas 2 ada di `sd1` (sudah dijual), kelas 3
ada di `sd2` (masih `draft`, baru berisi **Kali Kilat**).

**Usulan:** kesepuluh game di bawah jadi isi **`sd2` (SD Kelas 3 & 4)**, dengan
**slot awal tiap game = materi kelas 2 (pemanasan)** dan slot berikutnya materi
kelas 3. Alasannya:
- anak yang baru naik kelas 3 memang butuh jembatan dari kelas 2 — pola yang
  sudah dipakai Kali Kilat (slot `l1` = kali sebagai tambah berulang bergambar);
- tidak mengubah isi `sd1` yang sudah dibayar orang tua, dan tidak membuat
  jenjang baru "Kelas 2 & 3" yang melanggar pola nama resmi;
- materi kelas 4 (pecahan senilai, KPK/FPB, dll.) bisa menyusul sebagai slot
  lanjutan di game yang sama, jadi kelompok `sd2` tetap utuh "Kelas 3 & 4".

Kalau pemilik justru ingin sebagian game ini masuk `sd1` (untuk menutup lubang
kelas 2 di `docs/kurikulum-sd1-2.md`), tandai game-nya di tabel Status — tapi
ingat **batas bilangan 30** milik `sd1` (lihat 0b).

### 0b. Batas bilangan

| Kelompok | Batas sekarang | Kurikulum minta |
|---|---|---|
| `sd1` | **30** (keputusan 2026-08-01) | kelas 2: sampai 100 |
| `sd2` | **100** (ditulis Kali Kilat, 2026-09-29) | kelas 3: **sampai 1.000** |

Game 1 (Istana Bilangan) & game 2 (Lompat Katak) **tidak masuk akal di bawah
1.000** — inti materinya nilai tempat ratusan dan tambah-kurang tiga angka.
**Usulan:** batas `sd2` naik ke **1.000**, TAPI per slot: slot pemanasan kelas 2
tetap ≤ 100, slot kelas 3 boleh sampai 999. Kali Kilat tidak perlu diubah (hasil
perkaliannya memang ≤ 100). Jangan dinaikkan diam-diam — tunggu jawaban pemilik.

### 0c. Game gratis `sd2`

Aturan "Rencana Akses Saat Launching": tiap kelompok berbayar **wajib satu game
gratis**, dan template-nya **tidak boleh sama** dengan demo kelompok lain
(TK = tap-answer, SD1 = tracing). Kandidat terkuat di daftar ini:
**Kebun Ilmu (tap-picture)** atau **Toko Kembalian (drag-drop)** — dua-duanya
kelihatan beda dari "pilih jawaban yang benar". Kali Kilat (tap-answer) justru
kurang cocok jadi demo.

---

## 1. Peta kurikulum yang dipakai

Acuan: Kurikulum Merdeka **Fase A akhir (kelas 2)** dan **Fase B awal (kelas 3)**.
Yang sudah ditutup game lain sengaja **tidak diulang**:

| Materi | Sudah ada di | Jadi di sini… |
|---|---|---|
| Perkalian & pembagian | Kali Kilat (`sd2`) | tidak ada game baru |
| Jam tepat & setengah | Jam Pintar (`sd1`) | naik ke **menit & durasi** (game 5) |
| Uang Rp1.000–Rp15.000 dijumlah | Hitung Hebat slot uang (`sd1`) | naik ke **kembalian** (game 6) |
| Pola bentuk/bilangan, bangun ruang | Pola Pintar (`sd1`) | tidak diulang |
| Cerita bermoral | Baca Cerita (`sd1`) | naik ke **pemahaman bacaan** (game 8) |
| Mengeja kata, suku kata | Ejaan Jitu, Suku Kata (`sd1`) | naik ke **kalimat** (game 9) |

Lubang yang ditutup (dari `docs/kurikulum-sd1-2.md` + kelas 3): nilai tempat,
garis bilangan, pecahan, pengukuran, diagram/data, menit & durasi, kembalian,
membaca pemahaman, kalimat & tanda baca, IPAS.

**Komposisi: 7 matematika · 2 bahasa · 1 IPAS** — orang tua kelas 3 paling
mencari matematika, tapi kelompok berbayar yang isinya angka semua gampang
terasa seperti buku LKS.

---

## 2. Sepuluh game

Format tiap game: **judul · id · template · materi** lalu deskripsi untuk orang
tua (bisa dipakai di kartu/landing), alur slot, kebutuhan engine & aset, dan
jebakan desain soal yang sudah bisa dilihat dari sekarang.

---

### 1. Istana Bilangan 🏰
`id: istana-bilangan` · **mixed** (tap-answer + drag-drop) · nilai tempat, membandingkan, mengurutkan

> **Deskripsi:** Bangun istana dari balok ratusan, puluhan, dan satuan! Anak
> belajar bahwa 347 itu tiga ratusan, empat puluhan, dan tujuh satuan — lalu
> membandingkan dan mengurutkan bilangan sampai seribu.

- **Slot:** (kls 2) puluhan–satuan bergambar balok → membaca bilangan dua angka
  → (kls 3) ratusan–puluhan–satuan → nilai angka yang digarisbawahi ("angka 4 di
  347 bernilai?") → bentuk panjang (300 + 40 + 7) → membandingkan > < = →
  mengurutkan tiga bilangan (drag-drop ke 3 kotak) → bilangan terbesar/terkecil
  dari tiga kartu angka.
- **Engine:** komponen SVG baru **`Blocks.tsx`** (balok ratusan = pelat 10×10,
  puluhan = batang, satuan = kubus) — digambar engine, NOL aset, pola `Shape.tsx`.
  Field baru `TapAnswerData.blocks: { h, t, o }`.
- **Jebakan:** pengecoh wajib dari kesalahan khas — **angka tertukar tempat**
  (347 ↔ 374), **nol yang hilang** (307 dibaca 37). Pelat ratusan paling banyak
  3–4 di papan, kalau tidak HP 360 px scroll (pelajaran papan 9 gambar Kali Kilat).

### 2. Lompat Katak 🐸
`id: lompat-katak` · **tap-answer** + garis bilangan · tambah & kurang sampai 1.000

> **Deskripsi:** Si katak melompat di garis bilangan! Tiap lompatan adalah
> penjumlahan atau pengurangan. Anak melihat *kenapa* 58 + 30 = 88, bukan cuma
> menghafal — lalu naik ke tambah-kurang ratusan dan soal cerita.

- **Slot:** (kls 2) lompat 10-an di garis 0–100 → tambah/kurang dua angka dengan
  garis → (kls 3) lompat ratusan (200 + 300) → tambah tiga angka tanpa simpan →
  dengan menyimpan → kurang dengan meminjam → **mengira-ngira** ("398 + 205 kira-kira?")
  → soal cerita → bilangan hilang (450 + ? = 700).
- **Engine:** komponen **`NumberLine.tsx`** (garis + busur lompatan + katak) —
  NOL aset (katak boleh emoji 🐸 dulu, seni WebP menyusul; aturan hewan wajib
  seni berlaku begitu seninya ada). Field `TapAnswerData.numberLine: { from, to, hops[] }`.
- **Jebakan:** garis bilangan yang label angkanya rapat tak terbaca di 320 px —
  tampilkan **paling banyak 5 label**, sisanya titik. Persamaan panjang
  ("458 + 237 = ?") sudah otomatis mengecil lewat `equationClass()`.
- **Beda dengan Hitung Hebat:** di sana hasil ≤ 30 dan tanpa garis; di sini garis
  bilangan jadi alat berpikir.

### 3. Bagi Kue 🍰
`id: bagi-kue` · **mixed** (tap-answer + drag-drop) · pecahan

> **Deskripsi:** Kue, pizza, dan martabak dibagi sama rata! Anak mengenal ½, ⅓,
> dan ¼, lalu membandingkan: mana yang lebih besar, sepotong dari kue yang
> dibagi dua atau dibagi empat?

- **Slot:** (kls 2) setengah & seperempat benda → setengah dari **kumpulan**
  (8 apel → ½ = 4) → (kls 3) mengenal ⅓, ⅕, ⅙ → membaca lambang pecahan dari
  gambar → gambar dari lambang → membandingkan pecahan satuan (½ vs ¼) →
  pecahan pada garis bilangan 0–1 → soal cerita berbagi.
- **Engine:** **`Fraction.tsx`** — lingkaran/persegi panjang dipotong n bagian,
  k bagian diwarnai. Lambang pecahan di kartu/persamaan butuh render bertumpuk
  (pembilang di atas garis), jangan teks "1/4" — anak kelas 3 diajari bentuk
  bertumpuk. Field `TapChoice.fraction` & `TapAnswerData.fraction`.
- **Narasi:** "satu per empat" / "seperempat" — **tidak ada digit** (aturan lama).
  Tambah `pecahan(n, d)` di `src/games/numbers.ts`.
- **Jebakan:** potongan yang **tidak sama besar** harus jadi pengecoh sungguhan
  ("apakah ini seperempat?") — itu salah paham paling umum. Dan **½ < ¼ karena
  4 > 2** adalah kesalahan khas: jadikan pengecoh di slot membandingkan.

### 4. Ukur Yuk 📏
`id: ukur-yuk` · **tap-answer** + penggaris/timbangan · panjang & berat

> **Deskripsi:** Pakai penggaris dan timbangan sungguhan di layar! Berapa
> sentimeter pensil ini? Mana yang lebih berat, semangka atau apel? Anak belajar
> satuan cm, m, kg, dan gram lewat benda sehari-hari.

- **Slot:** (kls 2) mana lebih panjang/pendek → mengukur dengan satuan tidak baku
  (klip, jengkal) → (kls 3) membaca penggaris cm (benda mulai di 0) → benda
  **tidak** mulai di 0 (jebakan kelas 3 yang paling sering) → memilih satuan
  yang tepat (tinggi pintu: cm atau m?) → membaca timbangan kg → gram vs kg →
  membandingkan berat di timbangan dua lengan.
- **Engine:** **`Ruler.tsx`** & **`Scale.tsx`** (SVG). Bendanya pakai seni item
  yang sudah ada (pensil, buku, sepatu, semangka, apel…) — NOL aset baru untuk isi.
- **Jebakan:** item WebP dipotong pas gambarnya tapi bentuknya tidak selalu lurus
  — panjang benda di soal harus **dari data soal**, dan gambarnya dipaksa ke
  panjang itu (`object-fit: fill` di kotak berlebar tetap, hanya untuk benda
  memanjang). Kalau tidak, penggaris "berbohong".

### 5. Waktu Tepat ⏱️
`id: waktu-tepat` · **tap-answer** + `Clock.tsx` · jam & menit, durasi

> **Deskripsi:** Lanjutan Jam Pintar! Sekarang jarum panjang menunjuk menit:
> pukul 07.15, 08.40, 09.55. Anak juga menghitung lama kegiatan — berangkat
> 06.30, sampai 07.00, berapa menit di jalan?

- **Slot:** (kls 2 ulang) jam tepat & setengah → seperempat ("lewat seperempat",
  "kurang seperempat") → (kls 3) kelipatan 5 menit → membaca jam digital ↔ analog
  → durasi dalam menit → durasi melewati jam ("08.45 → 09.15") → jam sebelum/sesudah
  ("30 menit lagi pukul berapa?") → 1 jam = 60 menit, jadwal harian.
- **Engine:** **NOL perubahan** — `Clock.tsx` sudah menerima `m` 0–59 dan jarum
  pendek sudah bergeser mengikuti menit. **Game termurah dari daftar ini → cocok
  dikerjakan pertama.**
- **Jebakan:** sebutan Indonesia "setengah delapan" = 07.30 (sudah ada
  `halfToward()` di Jam Pintar — pindahkan ke modul bersama, jangan disalin).
  Narasi durasi pakai kata ("tiga puluh menit"). Pengecoh khas: **jarum pendek
  dan panjang tertukar**, dan **membaca angka jarum panjang sebagai menit** (jarum
  di angka 3 dibaca "3 menit", bukan 15).

### 6. Toko Kembalian 🏪
`id: toko-kembalian` · **drag-drop** + tap-answer · uang, jual beli

> **Deskripsi:** Anak jadi kasir! Tarik uang yang pas ke laci, hitung total
> belanja, dan beri kembalian yang benar. Nominal rupiah sungguhan dari
> Rp500 sampai Rp50.000.

- **Slot:** (kls 2) mengenal uang koin & kertas → membayar pas (tarik uang ke
  laci sampai jumlahnya sama) → (kls 3) total dua–tiga barang → kembalian →
  cara membayar paling sedikit lembar → membandingkan harga ("lebih murah mana,
  3 × Rp2.000 atau Rp5.000?") → soal cerita menabung.
- **Engine:** drag-drop **banyak ke satu** (beberapa lembar uang ke SATU laci) —
  template sekarang **1:1**, jadi ini fitur engine baru (`DragTarget.accepts: 'many'`
  + total terhitung). Uang digambar sebagai **SVG sederhana bernominal**, bukan
  foto uang asli (hindari reproduksi uang rupiah yang presisi).
- **Pengecualian bilangan:** sama seperti slot uang Hitung Hebat — nominal rupiah
  tidak tunduk pada batas bilangan.
- **Kandidat demo gratis `sd2`** (drag-drop, jelas beda dari tap-answer).

### 7. Detektif Data 📊
`id: detektif-data` · **tap-answer** + diagram · piktogram, turus, diagram batang

> **Deskripsi:** Siapa buah favorit di kelas? Anak membaca piktogram, turus, dan
> diagram batang, lalu menjawab pertanyaan detektif: mana yang paling banyak,
> berapa selisihnya, berapa jumlah semuanya?

- **Slot:** (kls 2) mengelompokkan benda → turus (IIII) → piktogram 1 gambar = 1
  → (kls 3) piktogram 1 gambar = 2 (setengah gambar = 1!) → diagram batang →
  paling banyak/sedikit → selisih → jumlah seluruhnya → tabel ke diagram (pilih
  diagram yang cocok dengan tabel).
- **Engine:** **`Chart.tsx`** (piktogram, batang, turus) — maksimal **4 kategori**
  (sesuai kurikulum, dan itu batas yang muat di 320 px). Ikon kategori pakai seni
  item yang sudah ada (buah, kendaraan).
- **Jebakan:** jangan ada soal yang jawabannya **tertulis di batangnya** (label
  nilai di atas batang = jawaban bocor, prinsip Kenal Huruf). Sumbu diberi garis
  bantu per 2 supaya bisa dibaca tanpa label.

### 8. Detektif Bacaan 🔍
`id: detektif-bacaan` · **tap-answer** dengan teks bacaan · membaca pemahaman

> **Deskripsi:** Baca teks pendek, lalu pecahkan misterinya! Siapa tokohnya, di
> mana kejadiannya, kenapa ia sedih? Melatih anak memahami bacaan — bukan
> sekadar bisa membaca.

- **Slot:** (kls 2) satu–dua kalimat, pertanyaan *siapa* → *di mana/kapan* →
  (kls 3) paragraf pendek (≤ 4 kalimat) *apa yang terjadi* → *mengapa* →
  urutan kejadian → gagasan utama ("teks ini tentang…") → makna kata dari
  konteks → judul yang paling cocok.
- **Engine:** field `TapAnswerData.passage` (kotak bacaan bergulir sendiri kalau
  panjang, rata kiri seperti FAQ). Tombol 🔊 membaca **teksnya**, pertanyaannya
  dibaca terpisah — anak kelas 3 sudah membaca sendiri, tapi narasi tetap wajib
  (standar UX).
- **Beda dengan Baca Cerita:** di sana anak memilih tindakan tokoh (moral); di
  sini menjawab pertanyaan tentang isi teks. Teks buatan sendiri **bertokoh hewan**
  (aturan 2026-08-09); teks informasi (hewan, tumbuhan, pekerjaan) boleh tanpa tokoh.
- **Jebakan:** pengecoh harus **ada di teks tapi bukan jawabannya** (nama tokoh
  lain, tempat lain yang disebut) — pengecoh yang tak pernah muncul di teks bisa
  ditebak tanpa membaca. Anggaran tinggi layar: teks ±4 kalimat + 3 pilihan
  pendek harus muat 360×640 tanpa scroll halaman.

### 9. Susun Kalimat ✏️
`id: susun-kalimat` · **spell (kata)** + tap-answer · kalimat, huruf kapital, tanda baca, kelas kata

> **Deskripsi:** Kata-kata berantakan, ayo disusun jadi kalimat yang benar!
> Lalu pasang huruf kapital dan tanda baca yang tepat, dan kenali kata benda,
> kata kerja, serta kata sifat.

- **Slot:** (kls 2) susun 3 kata jadi kalimat → 4–5 kata → (kls 3) pilih tanda
  baca akhir (. ? !) → pilih kalimat yang huruf kapitalnya benar → kata kerja di
  kalimat → kata sifat → lawan kata (antonim) → persamaan kata (sinonim).
- **Engine:** template `spell` diperluas agar kepingnya **kata**, bukan huruf
  (`SpellData.tokens: string[]`), dengan kata pengecoh di nampan (Aturan Desain
  Soal). Ukuran kartu kata pakai `wordClass()` yang sudah ada.
- **Jebakan:** kalimat yang bisa disusun **lebih dari satu cara benar**
  ("Adik makan roti pagi ini" / "Pagi ini adik makan roti") — validator harus
  menerima daftar urutan sah, atau pilih kalimat yang urutannya cuma satu.
  Narasi **tidak boleh membacakan kalimat jawabannya** (sama seperti Ejaan Jitu
  yang tidak mengejakan huruf) — narasi menyebut maksudnya saja.

### 10. Kebun Ilmu 🌱
`id: kebun-ilmu` · **tap-picture** + drag-drop · IPAS: tumbuhan, hewan, wujud benda

> **Deskripsi:** Jelajahi kebun! Sentuh akar, batang, daun, bunga, dan buah —
> dan cari tahu gunanya. Kelompokkan hewan pemakan tumbuhan dan pemakan daging,
> lalu tebak wujud benda: padat, cair, atau gas.

- **Slot:** (kls 2) sentuh bagian tumbuhan → (kls 3) fungsi bagian tumbuhan
  ("menyerap air dari tanah?") → daur hidup (biji → kecambah → tanaman) →
  hewan & makanannya (drag-drop ke Herbivora / Karnivora / Omnivora) → wujud benda
  (drag-drop Padat / Cair / Gas) → perubahan wujud (es mencair) → cuaca & pakaian.
- **Engine:** `tap-picture` sekarang terkunci ke gambar anak (`Kid.tsx`,
  `BODY_PARTS`). Perlu digeneralisasi: **`figure` + tabel titik per figur**, dengan
  `kidSpots`/`kidFrame` jadi `figureSpots`/`figureFrame`. Figur tumbuhan bisa SVG
  engine (pola `Scene.tsx`) atau satu ilustrasi dari pemilik. `check-body-parts.mjs`
  ikut digeneralisasi — aturan daerah sentuh ≥ 60 px tetap berlaku.
- **Aset:** hewan wajib seni WebP (sudah ada: singa, gajah, jerapah, sapi, kambing,
  kelinci, beruang, kucing, ayam…). Yang belum ada (harimau, ulat) tunggu seninya
  atau jangan dipakai.
- **Kandidat demo gratis `sd2`** (tap-picture, template paling beda dari demo TK & SD1).

---

## 3. Urutan pengerjaan yang disarankan

Diurutkan dari **engine paling sedikit berubah** → paling banyak, supaya `sd2`
cepat punya isi yang bisa dicoba:

| Urutan | Game | Kerja engine | Catatan |
|---|---|---|---|
| 1 | Waktu Tepat | **nol** | `Clock.tsx` sudah siap |
| 2 | Detektif Bacaan | kecil (`passage`) | banyak menulis teks |
| 3 | Susun Kalimat | sedang (`spell` berkeping kata) | |
| 4 | Istana Bilangan | sedang (`Blocks.tsx`) | **tunggu keputusan 0b** |
| 5 | Lompat Katak | sedang (`NumberLine.tsx`) | **tunggu keputusan 0b** |
| 6 | Bagi Kue | sedang (`Fraction.tsx` + pecahan bertumpuk) | |
| 7 | Detektif Data | sedang (`Chart.tsx`) | |
| 8 | Ukur Yuk | sedang (`Ruler.tsx`, `Scale.tsx`) | |
| 9 | Toko Kembalian | besar (drag-drop banyak-ke-satu) | kandidat demo |
| 10 | Kebun Ilmu | besar (generalisasi `tap-picture`) | kandidat demo |

Dengan Kali Kilat, `sd2` jadi **11 game** — masuk target 10–15.

## 4. Aturan yang berlaku untuk SEMUA game di atas (ringkasan dari CLAUDE.md)

- Config = file `.ts` typed di `src/games/sd2/`, daftar di `registry.ts`.
- **Narasi tanpa digit** — pakai `terbilang()` / `rupiahWords()`; angka tampil di
  `equation`/papan. `npm run narasi` akan gagal kalau ada digit.
- **Soal tidak boleh memuat jawabannya** (teks, narasi, label diagram).
- **Pengecoh dihitung dari kesalahan khas**, bukan acak — tiap game di atas
  sudah menyebut kesalahan khasnya.
- Satu gambar satu arti; hewan = seni WebP; tanpa labu 🎃, tanpa salju/benda
  empat musim.
- Tiap game ≥ 8 slot dengan kolam varian + `sessionLevels` (atau urutan tetap
  kalau tingkat kesulitannya harus naik, pelajaran Kartu Kembar).
- Muat tanpa scroll di **360×640** (320×568 minimal tidak patah); ukur **varian
  terburuk**, bukan yang keluar undian.
- Game baru di `sd2` otomatis terkunci selama bukan anggota `FREE_GAME_IDS`, dan
  tidak terlihat di produksi selama `sd2` masih `draft`.
- Narasi baru dirender lewat workflow "Render narasi" (baris baru = scope game
  sendiri; periksa kalimat yang naik ke `shared`).

## 5. Cadangan (kalau salah satu di atas diganti)

- **Keliling Kebun** — keliling bangun datar & luas dengan persegi satuan (Fase B).
- **Arah & Peta** — kanan/kiri, mata angin, membaca denah sederhana (path-trace).
- **Simetri Kupu** — garis simetri & pencerminan (puzzle/tap-picture).
- **Aturan di Rumah & Sekolah** — Pendidikan Pancasila: hak & kewajiban,
  keberagaman (story-choice, bertokoh hewan).

## 6. Status

| # | Game | id | Status |
|---|---|---|---|
| – | Kali Kilat | `kali-kilat` | ✅ sudah ada (2026-09-29), narasi belum dirender |
| 1 | Istana Bilangan | `istana-bilangan` | rencana — menunggu keputusan 0b |
| 2 | Lompat Katak | `lompat-katak` | rencana — menunggu keputusan 0b |
| 3 | Bagi Kue | `bagi-kue` | rencana |
| 4 | Ukur Yuk | `ukur-yuk` | rencana |
| 5 | Waktu Tepat | `waktu-tepat` | rencana |
| 6 | Toko Kembalian | `toko-kembalian` | rencana |
| 7 | Detektif Data | `detektif-data` | rencana |
| 8 | Detektif Bacaan | `detektif-bacaan` | rencana |
| 9 | Susun Kalimat | `susun-kalimat` | rencana |
| 10 | Kebun Ilmu | `kebun-ilmu` | rencana |
