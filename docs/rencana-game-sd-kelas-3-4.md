# Rencana 10 Game — SD Kelas 3 & 4 (`sd2`) — patokan pengerjaan

Disusun 2026-09-29 atas permintaan pemilik: *"analisa 10 game yang cocok untuk
SD, buat judul dan deskripsi per game — jadi patokan pengerjaan."* Permintaan
awalnya menyebut "kelas 2 & 3"; pemilik meluruskan di sesi yang sama: **untuk
kelas 3 & 4**, yaitu kelompok `sd2` ("SD Kelas 3 & 4", masih `draft`).

Tiap game yang mulai dikerjakan diberi tanda di tabel "Status" paling bawah, dan
catatan pengerjaannya tetap masuk ke "Status Pengerjaan" di `CLAUDE.md`.

---

## ⚠️ STATUS: MASIH DEVELOPMENT — JANGAN IKUT DIRILIS KE PRODUCTION

**Keputusan pemilik 2026-09-29:** SD Kelas 3 & 4 baru mulai dikerjakan. Selama
dokumen ini belum menyatakan `sd2` siap rilis, kelompok ini **hanya boleh
tampil di development**: dev server (`npm run dev`) dan build penguji
(`VITE_ALLOW_TEST_TOGGLE=1`, base `/uji-…/`). Deploy production untuk TK dan
SD Kelas 1 & 2 **tetap jalan seperti biasa** — `sd2` saja yang tidak ikut
tampil.

Mekanismenya sudah ada, jadi yang dijaga adalah **jangan dilepas**:
- `"draft": true` pada `sd2` di `src/data/groups.json` **tetap terpasang**. Di
  build production, `isGroupVisible()` (`src/data/access.ts`) menyembunyikan
  `sd2` dari `/portal` dan `/kelompok/sd2`.
- Game `sd2` boleh terdaftar di `registry.ts` dan kodenya ikut ter-build —
  itu tidak membuatnya terlihat. Yang tahu URL `/game/<id>` langsung hanya
  melihat layar gembok (`canPlayGame` menuntut kepemilikan `sd2`, dan backend
  belum bisa memberikannya), jadi gamenya tidak bisa dimainkan.

**JANGAN dilakukan sebelum pemilik bilang `sd2` siap rilis:**
1. menghapus `"draft": true` dari `sd2`;
2. menambah `sd2` ke `GROUPS` / `groupFromName()` di `functions/` atau membuat
   produk SD Kelas 3 & 4 di Mayar;
3. memasukkan game `sd2` (termasuk Toko Kembalian) ke `FREE_GAME_IDS`;
4. mengubah kartu "Segera hadir" SD Kelas 3 & 4 di landing jadi kartu harga,
   menambah chip dunia `sd2` di landing, atau memasang pengumuman lonceng
   tentang game `sd2`.

Urutan rilisnya nanti (satu tempat, jangan diacak) ada di `CLAUDE.md`
"Penamaan Kelompok": hapus `draft` → `sd2` di backend + deploy → demo ke
`FREE_GAME_IDS` → landing jadi kartu harga.

**[DICABUT 2026-10-06 — pemilik minta deploy sesudah PR #94; `sd2` tetap `draft`, jadi tetap tak terlihat pembeli.]** ~~TAHAN DEPLOY WEB (keputusan pemilik 2026-10-05):~~ sejak layar "Pilih Mata
Pelajaran" + nama sapaan anak masuk `main` (PR #82), **jangan menjalankan
Actions → "Deploy web" sampai game SD Kelas 3 & 4 sudah beres dan matang** —
pemilik sendiri yang menyatakan kapan. Ini lebih ketat dari aturan "deploy TK &
SD 1-2 tetap jalan seperti biasa" di atas: yang tayang di petualanganpintar.com
tetap build terakhir sebelum PR #82. Kalau ada bugfix darurat untuk pembeli TK /
SD 1-2 sebelum itu, **tanya pemilik dulu** — deploy dari `main` otomatis ikut
membawa kolom nama anak & halaman privasi yang baru.

**Cek cepat sebelum setiap deploy production:** `grep -n '"draft": true'
src/data/groups.json` harus masih menemukan baris `sd2`.

---

## 0. Keputusan pemilik (2026-09-29)

| Pertanyaan | Keputusan |
|---|---|
| Kelompok tujuan | **`sd2` — SD Kelas 3 & 4.** Slot awal tiap game = materi kelas 3, slot lanjutan = kelas 4. Isi `sd1` tidak disentuh. |
| Batas bilangan `sd2` | **Naik dari 100 ke 1.000.** Kali Kilat tidak berubah (hasilnya memang ≤ 100). Pengecualian tetap: **nominal rupiah** (Toko Kembalian), sama seperti slot uang Hitung Hebat. |
| Game gratis `sd2` | Diserahkan ke Claude → **Toko Kembalian** (alasan di bawah). |

**Kenapa Toko Kembalian jadi demo gratis:**
- Template **drag-drop** — beda dari demo TK (tap-answer, Hutan Hewan) dan SD1
  (tracing, Tulis Huruf). Aturan "demo antar-kelompok tidak boleh bertemplate
  sama" terpenuhi, dan ketiga demo sekaligus memperlihatkan tiga kemampuan engine.
- **Uang & kembalian** langsung terbaca "berguna" oleh orang tua kelas 3–4 —
  itu yang dilihat calon pembeli sebelum membayar. Matematika juga yang paling
  dicari orang tua di jenjang ini.
- Kebun Ilmu (tap-picture) ditolak jadi demo: templatenya sama dengan Anggota
  Tubuh (TK, berbayar), jadi tidak memperlihatkan hal baru.
- **Konsekuensi urutan kerja:** `sd2` tidak bisa dirilis sebelum Toko Kembalian
  jadi (tiap kelompok wajib punya demo). Karena itu ia naik ke urutan awal di
  bagian 3, walau engine-nya paling banyak berubah.

**Satu hal yang masih terbuka (tidak menghalangi mulai):** kurikulum kelas 4
meminta bilangan cacah **sampai 10.000**. Dengan batas 1.000, slot kelas 4 di
Istana Bilangan berhenti di ribuan pertama (1.000). Kalau nanti mau sampai
10.000, itu keputusan terpisah — jangan dinaikkan diam-diam.

---

## 1. Peta kurikulum yang dipakai

Acuan: Kurikulum Merdeka **Fase B (kelas 3–4)**. Materi yang sudah ditutup game
lain **tidak diulang**:

| Materi | Sudah ada di | Jadi di sini… |
|---|---|---|
| Perkalian & pembagian | Kali Kilat (`sd2`) | tidak ada game baru |
| Jam tepat & setengah | Jam Pintar (`sd1`) | naik ke **menit, durasi, jam 24** (game 5) |
| Uang dijumlah (≤ Rp15.000) | Hitung Hebat (`sd1`) | naik ke **total & kembalian** (game 6) |
| Pola, bangun ruang dikenalkan | Pola Pintar (`sd1`) | tidak diulang |
| Cerita bermoral | Baca Cerita (`sd1`) | naik ke **pemahaman bacaan** (game 8) |
| Mengeja kata | Ejaan Jitu, Suku Kata (`sd1`) | naik ke **kalimat & kata baku** (game 9) |

**Komposisi: 7 matematika · 2 bahasa · 1 IPAS.** Dengan Kali Kilat, `sd2` jadi
**11 game** — masuk target 10–15.

---

## 2. Sepuluh game

Format: **judul · id · template · materi**, lalu deskripsi untuk orang tua (bisa
dipakai di kartu/landing), alur slot (kls 3 → kls 4), kebutuhan engine & aset,
dan jebakan desain soal yang sudah bisa dilihat sekarang.

---

### 1. Istana Bilangan 🏰
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: istana-bilangan` · **mixed** (tap-answer + drag-drop) · nilai tempat, membandingkan, pembulatan

> **Deskripsi:** Bangun istana dari balok ratusan, puluhan, dan satuan! Anak
> belajar bahwa 347 itu tiga ratusan, empat puluhan, dan tujuh satuan — lalu
> membandingkan, mengurutkan, dan membulatkan bilangan sampai seribu.

- **Slot:** (kls 3) membaca bilangan dari balok ratusan–puluhan–satuan → nilai
  angka yang ditandai ("angka 4 di 347 bernilai?") → bentuk panjang
  (300 + 40 + 7) → membandingkan > < = → mengurutkan tiga bilangan (drag-drop) →
  (kls 4) pembulatan ke puluhan terdekat → ke ratusan terdekat → genap/ganjil →
  bilangan sebelum/sesudah melewati ratusan (399 → 400).
- **Engine:** SVG baru **`Blocks.tsx`** (ratusan = pelat 10×10, puluhan = batang,
  satuan = kubus), NOL aset, pola `Shape.tsx`. Field `TapAnswerData.blocks: { h, t, o }`.
- **Jebakan:** pengecoh dari kesalahan khas: **angka tertukar tempat**
  (347 ↔ 374) dan **nol yang hilang** (307 dibaca 37). Pelat ratusan maksimal
  3–4 di papan, kalau tidak HP 360 px scroll (pelajaran papan 9 gambar Kali Kilat).

### 2. Lompat Katak 🐸
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: lompat-katak` · **tap-answer** + garis bilangan · tambah & kurang sampai 1.000

> **Deskripsi:** Si katak melompat di garis bilangan! Tiap lompatan adalah
> penjumlahan atau pengurangan. Anak melihat *kenapa* 458 + 30 = 488, lalu naik
> ke tambah-kurang ratusan, menaksir hasil, dan soal cerita dua langkah.

- **Slot:** (kls 3) lompat puluhan & ratusan → tambah tiga angka tanpa menyimpan
  → dengan menyimpan → kurang dengan meminjam → bilangan hilang (450 + ? = 700) →
  (kls 4) menaksir hasil lewat pembulatan ("398 + 205 kira-kira?") → soal cerita
  dua langkah → memeriksa hasil dengan operasi kebalikan.
- **Engine:** **`NumberLine.tsx`** (garis + busur lompatan + katak). Katak boleh
  emoji 🐸 dulu; begitu seni WebP-nya ada, aturan "hewan wajib seni" berlaku.
  Field `TapAnswerData.numberLine: { from, to, hops[] }`.
- **Jebakan:** label angka rapat tak terbaca di 320 px — **maksimal 5 label**,
  sisanya titik. Persamaan panjang ("458 + 237 = ?") sudah otomatis mengecil
  lewat `equationClass()`. Pengecoh khas: **lupa menyimpan** (458 + 237 = 685)
  dan **mengurangi angka kecil dari besar per kolom** (523 − 187 = 464).

### 3. Bagi Kue 🍰
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: bagi-kue` · **mixed** (tap-answer + drag-drop) · pecahan & desimal awal

> **Deskripsi:** Kue, pizza, dan martabak dibagi sama rata! Anak mengenal ½, ⅓,
> dan ¼, membandingkan potongan, menemukan bahwa ½ sama dengan 2/4, sampai
> mengenal 0,5.

- **Slot:** (kls 3) mengenal pecahan dari gambar → gambar dari lambang →
  pecahan dari **kumpulan** (½ dari 8 apel) → membandingkan pecahan satuan
  (½ vs ¼) → pecahan pada garis bilangan 0–1 → (kls 4) **pecahan senilai**
  (½ = 2/4 = 4/8) → membandingkan pecahan berpenyebut sama (3/5 vs 2/5) →
  pecahan persepuluhan ↔ desimal (5/10 = 0,5) → soal cerita berbagi.
- **Engine:** **`Fraction.tsx`** — lingkaran/persegi panjang dipotong n bagian,
  k diwarnai. Lambang pecahan harus **bertumpuk** (pembilang di atas garis),
  bukan teks "1/4". Field `TapChoice.fraction` & `TapAnswerData.fraction`.
- **Narasi:** "satu per empat"/"seperempat", "nol koma lima" — **tanpa digit**.
  Tambah `pecahan(n, d)` & `desimal()` di `src/games/numbers.ts`.
- **Jebakan:** potongan **tidak sama besar** jadi pengecoh sungguhan ("apakah ini
  seperempat?"). Dan **"¼ lebih besar dari ½ karena 4 > 2"** — kesalahan khas
  paling umum, jadikan pengecoh di slot membandingkan.

### 4. Ukur Yuk 📏
`id: ukur-yuk` · **tap-answer** + penggaris/timbangan · panjang, berat, volume, keliling

> **Deskripsi:** Pakai penggaris, timbangan, dan gelas takar di layar! Berapa
> sentimeter pensil ini? Berapa gram gula? Anak belajar satuan baku, mengubah
> satuan, sampai menghitung keliling kebun.

- **Slot:** (kls 3) membaca penggaris cm (benda mulai di 0) → benda **tidak**
  mulai di 0 → memilih satuan yang tepat (tinggi pintu: cm atau m?) → membaca
  timbangan kg & g → membandingkan berat di timbangan dua lengan → (kls 4)
  konversi (1 m = 100 cm, 1 kg = 1.000 g) → liter & mililiter di gelas takar →
  keliling bangun datar berpetak.
- **Engine:** **`Ruler.tsx`**, **`Scale.tsx`**, **`Beaker.tsx`** (SVG). Bendanya
  pakai seni item yang sudah ada (pensil, buku, sepatu, semangka, apel, susu…).
  **Dikoreksi saat dikerjakan (2026-09-30):** benda di atas PENGGARIS digambar
  SVG engine (pensil, krayon, pita, sedotan, penghapus) — seni item digambar
  miring, ujungnya tak bisa jatuh tepat di garis cm. Seni item tetap dipakai di
  timbangan (berat tak punya ukuran di gambar).
- **Keputusan pemilik 2026-09-30:** konversi tetap **≤ 1.000** (tanpa "2 kg =
  2.000 g"); timbangan **jarum**; soal memilih satuan memakai pengecoh dari
  **besaran lain** (berat semangka → kg / cm / L), bukan "cm atau m".
- **Jebakan:** panjang benda harus **dari data soal**, gambarnya dipaksa ke
  panjang itu (kotak berlebar tetap, hanya untuk benda memanjang) — kalau tidak,
  penggarisnya "berbohong". Pengecoh khas: **membaca ujung benda tanpa
  mengurangi titik awal** (benda dari 2 sampai 9 dibaca 9 cm).

### 5. Waktu Tepat ⏱️
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: waktu-tepat` · **tap-answer** + `Clock.tsx` · menit, durasi, jam 24, kalender

> **Deskripsi:** Lanjutan Jam Pintar! Jarum panjang sekarang menunjuk menit:
> pukul 07.15, 08.40, 09.55. Anak menghitung lama kegiatan, membaca jam 13.00
> sebagai pukul satu siang, dan memakai kalender.

- **Slot:** (kls 3) seperempat ("lewat/kurang seperempat") → kelipatan 5 menit →
  jam digital ↔ analog → durasi dalam menit → durasi melewati jam
  ("08.45 → 09.15") → "30 menit lagi pukul berapa?" → (kls 4) **jam 24**
  (13.00 = pukul satu siang) → konversi jam–menit, hari–minggu → membaca kalender
  ("tiga hari sesudah Senin?").
- **Engine:** **nol perubahan** untuk jam — `Clock.tsx` sudah menerima `m` 0–59
  dan jarum pendek ikut bergeser. Kalender butuh `Calendar.tsx` kecil (slot
  terakhir saja; bisa menyusul).
- **Jebakan:** sebutan "setengah delapan" = 07.30 sudah ada di `halfToward()`
  Jam Pintar — **pindahkan ke modul bersama, jangan disalin**. Pengecoh khas:
  **jarum tertukar**, dan **angka di bawah jarum panjang dibaca sebagai menit**
  (jarum di angka 3 dibaca "3 menit", bukan 15).

### 6. Toko Kembalian 🏪 — **DEMO GRATIS `sd2`**
`id: toko-kembalian` · **drag-drop** + tap-answer · uang, jual beli

> **Deskripsi:** Anak jadi kasir! Tarik uang yang pas ke laci, hitung total
> belanja, dan beri kembalian yang benar. Nominal rupiah sungguhan, dari koin
> Rp500 sampai uang Rp50.000.

- **Slot:** (kls 3) membayar pas (tarik uang ke laci sampai jumlahnya sama) →
  total dua barang → kembalian dari satu lembar → cara membayar dengan lembar
  paling sedikit → (kls 4) total tiga barang → kembalian dari beberapa lembar →
  membandingkan harga ("lebih murah 3 × Rp2.000 atau Rp5.000?") → soal cerita
  menabung.
- **Engine:** drag-drop **banyak ke satu** (beberapa lembar ke SATU laci, total
  dihitung) — template sekarang **1:1**, jadi ini fitur engine baru
  (`DragTarget.accepts: 'many'`). Uang digambar sebagai **SVG sederhana
  bernominal**, bukan tiruan presisi uang rupiah.
- **Bilangan:** nominal rupiah **dikecualikan** dari batas 1.000.
- **Karena demo:** game ini **tidak dipotong** dan harus paling rapi di antara
  sepuluhnya — ini yang dilihat calon pembeli. Setelah jadi, masukkan ke
  `FREE_GAME_IDS` saat `sd2` dirilis (urutan rilis di "Penamaan Kelompok").
- **SUDAH DIKERJAKAN (2026-09-30)** — keputusan pemilik di sesi itu:
  1. **Gambar uang = foto SPECIMEN BI yang sudah ada di registry**, BUKAN SVG
     (menggantikan rencana "SVG sederhana" di atas): anak harus mengenali uang
     asli. Izin pakai dari BI diurus sebelum `sd2` rilis.
  2. **Saat bayar pas, baki menampilkan total / target** dan soal selesai
     sendiri begitu pas.
  3. **Kembalian juga DITARIK**, bukan kartu pilihan.
  - Engine: **template baru `cashier`** (`src/engine/templates/Cashier.tsx`),
    bukan `DragTarget.accepts: 'many'` — dompetnya tak terbatas, isi baki
    dinilai dari JUMLAHNYA, dan uang di baki bisa disentuh untuk dikembalikan;
    itu perilaku yang tak ada hubungannya dengan drag-drop 1:1. Pecahan →
    gambar di `src/engine/core/money.ts` (Rp500 koin, Rp1.000–Rp50.000 kertas).
  - 8 slot × 6 varian, urutan tetap (tanpa `sessionLevels`, karena demo tidak
    dipotong). Slot l7 (membandingkan harga) memakai tap-answer seperti rencana.


### 7. Detektif Data 📊
`id: detektif-data` · **tap-answer** + diagram · piktogram, diagram batang, tabel

> **Deskripsi:** Siapa buah favorit di kelas? Anak membaca piktogram, diagram
> batang, dan tabel, lalu menjawab pertanyaan detektif: mana yang paling banyak,
> berapa selisihnya, berapa jumlah semuanya?

- **Slot:** (kls 3) turus → piktogram 1 gambar = 1 → piktogram 1 gambar = 2
  (setengah gambar = 1!) → diagram batang → paling banyak/sedikit → (kls 4)
  selisih & jumlah → skala batang per 5/10 → nilai yang paling sering muncul →
  memilih diagram yang cocok dengan tabel.
- **Engine:** **`Chart.tsx`** (turus, piktogram, batang), **maksimal 4 kategori**
  (sesuai kurikulum, dan batas yang muat di 320 px). Ikon kategori pakai seni item
  yang sudah ada.
- **Jebakan:** jangan ada label nilai di atas batang — itu jawaban bocor
  (prinsip Kenal Huruf). Sumbu diberi garis bantu supaya bisa dibaca tanpa label.

### 8. Detektif Bacaan 🔍
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: detektif-bacaan` · **tap-answer** dengan teks bacaan · membaca pemahaman

> **Deskripsi:** Baca teks pendek, lalu pecahkan misterinya! Siapa tokohnya,
> kenapa ia sedih, apa ide pokok paragrafnya? Melatih anak memahami bacaan —
> bukan sekadar bisa membaca.

- **Slot:** (kls 3) *siapa* → *di mana/kapan* → *apa yang terjadi* → *mengapa*
  → urutan kejadian → (kls 4) **ide pokok paragraf** → makna kata dari konteks
  → fakta atau pendapat → kesimpulan/judul yang paling cocok.
- **Engine:** field `TapAnswerData.passage` (kotak bacaan bergulir sendiri kalau
  panjang, rata kiri seperti FAQ). 🔊 membacakan teksnya, pertanyaan dibaca
  terpisah — narasi tetap wajib walau anak kelas 3–4 sudah membaca sendiri.
- **Beda dengan Baca Cerita:** di sana memilih tindakan tokoh (moral); di sini
  menjawab pertanyaan tentang isi teks. Teks cerita buatan sendiri **bertokoh
  hewan** (aturan 2026-08-09); teks informasi (hewan, tumbuhan, pekerjaan) boleh
  tanpa tokoh.
- **Jebakan:** pengecoh harus **ada di teks tapi bukan jawabannya** (tokoh lain,
  tempat lain yang disebut) — pengecoh yang tak pernah muncul di teks bisa
  ditebak tanpa membaca. Teks ±4–5 kalimat + 3 pilihan harus muat 360×640.

### 9. Susun Kalimat ✏️
> ⭐ **Cara mainnya DIGANTI versi premium — lihat bagian 2b.** Materi & jebakan di bawah tetap berlaku.

`id: susun-kalimat` · **spell (kata)** + tap-answer · kalimat, tanda baca, kelas kata, kata baku

> **Deskripsi:** Kata-kata berantakan, ayo disusun jadi kalimat yang benar!
> Pasang huruf kapital dan tanda baca yang tepat, kenali kata kerja dan kata
> sifat, lalu pilih kata baku yang benar.

- **Slot:** (kls 3) susun 4–5 kata jadi kalimat → tanda baca akhir (. ? !) →
  kalimat dengan huruf kapital yang benar → kata kerja dalam kalimat → kata
  sifat → sinonim & antonim → (kls 4) **kata baku vs tidak baku**
  (apotek/apotik) → imbuhan me-/ber- yang tepat → kalimat utama paragraf.
- **Engine:** template `spell` diperluas agar kepingnya **kata**
  (`SpellData.tokens: string[]`), dengan kata pengecoh di nampan. Ukuran kartu
  kata pakai `wordClass()` yang sudah ada.
- **Jebakan:** kalimat yang bisa disusun **lebih dari satu cara benar** — validator
  menerima daftar urutan sah, atau pilih kalimat yang urutannya cuma satu.
  Narasi **tidak membacakan kalimat jawabannya** (seperti Ejaan Jitu yang tidak
  mengejakan huruf).

### 10. Kebun Ilmu 🌱
`id: kebun-ilmu` · **tap-picture** + drag-drop · IPAS: tumbuhan, hewan, wujud zat, gaya

> **Deskripsi:** Jelajahi kebun! Sentuh akar, batang, daun, dan bunga, lalu cari
> tahu gunanya. Susun rantai makanan, kelompokkan benda padat, cair, dan gas,
> dan temukan apa yang terjadi saat es mencair.

- **Slot:** (kls 3) bagian tumbuhan → hewan & makanannya (drag-drop ke Herbivora
  / Karnivora / Omnivora) → daur hidup (biji → kecambah → tanaman) → cuaca &
  pakaian → (kls 4) fungsi bagian tumbuhan & fotosintesis sederhana ("daun
  membuat makanan dengan bantuan cahaya") → **rantai makanan** (urutkan) →
  wujud zat (Padat / Cair / Gas) → perubahan wujud (mencair, membeku, menguap) →
  gaya dorong & tarik.
- **Engine:** `tap-picture` sekarang terkunci ke gambar anak (`Kid.tsx`).
  Perlu digeneralisasi: **`figure` + tabel titik per figur**, `kidSpots`/`kidFrame`
  jadi `figureSpots`/`figureFrame`, dan `check-body-parts.mjs` ikut
  digeneralisasi — daerah sentuh ≥ 60 px tetap berlaku. Figur tumbuhan: SVG engine
  (pola `Scene.tsx`) atau satu ilustrasi pemilik.
- **Aset:** hewan wajib seni WebP (sudah ada: singa, gajah, jerapah, sapi,
  kambing, kelinci, kucing, ayam…). Yang belum ada (harimau, ulat, elang) tunggu
  seninya atau jangan dipakai.
- **SUDAH DIKERJAKAN (2026-09-29)** — keputusan pemilik di sesi itu:
  1. **Tanaman = SVG engine** (`src/engine/ui/Plant.tsx`, kotak 100×128),
     bukan ilustrasi. `tap-picture` sekarang menerima `figure: 'anak' | 'tanaman'`;
     rumusnya pindah ke `src/engine/ui/figure.ts` (`figureSpots`/`figureFrame`),
     tabel figurnya di `figures.ts`, dan `check-body-parts.mjs` memeriksa keduanya.
  2. **Template yang ada saja**: kelompokkan = drag-drop 1:1 (tiga kotak, satu
     hewan/benda per kotak); rantai makanan = tap-answer "apa yang hilang di
     rantai" dengan papan gambar sebaris (field engine baru `boardRow`). Tidak
     ada drag-drop urut.
  3. **Hanya hewan berseni**: rantai makanan tiga tingkat (wortel → kelinci →
     harimau, pisang → monyet → harimau). Ulat, belalang, ular, elang, tikus
     menunggu seninya — tinggal menambah varian.
  - Isi akhirnya 12 slot (kls 3: bagian tumbuhan · herbi/karni/omnivora · daur
    hidup · cuaca · dorong/tarik; kls 4: fungsi bagian · bagian yang dimakan ·
    fotosintesis · rantai makanan · wujud zat · perubahan wujud · jenis gaya),
    `sessionLevels: 10`. Slot "cuaca & pakaian" jadi "cuaca" (payung, topi, dan
    keselamatan saat petir) — tak ada benda empat musim.

---

## 2b. ARAH PREMIUM untuk game yang belum dibuat (keinginan pemilik 2026-10-02)

Permintaan pemilik: *"sisa game yang belum dibuat lebih banyak interaksi, lebih
menarik, dan seperti game mahal yang kalau subscribe harganya ratusan ribu."*

**Bagian ini MENGGANTIKAN rancangan di bagian 2 untuk enam game yang belum
dibuat** (Istana Bilangan, Lompat Katak, Bagi Kue, Waktu Tepat, Detektif
Bacaan, Susun Kalimat). Materi kurikulum, batas bilangan 1.000, dan jebakan
desain soal di bagian 2 TETAP berlaku — yang berubah adalah CARA anak
memainkannya. Kalau bagian 2 dan bagian ini bertentangan soal cara bermain,
**bagian ini yang menang.**

**Status: USULAN.** Belum ada yang diputuskan pemilik selain arahnya. Daftar
keputusan yang ditunggu ada di 2b.6.

### 2b.1 Apa yang membuat game anak terasa "mahal"

Diambil dari pola aplikasi berlangganan (DragonBox, Khan Academy Kids, Prodigy,
Endless, Toca Boca), lalu disaring dengan aturan proyek ini:

| Ciri game mahal | Ciri game murah | Artinya untuk kita |
|---|---|---|
| Anak **memegang** konsepnya: memotong kue, memutar jarum, menyusun balok | Anak **memilih** satu dari tiga kartu | Tiap game sisa punya cara main sendiri, bukan tap-answer lagi |
| Benda di layar **bereaksi**: memantul, berbunyi, bergabung, berubah | Layar diam sampai jawaban dinilai | Animasi & bunyi untuk SETIAP sentuhan, bukan cuma saat benar |
| Ada **dunia yang tumbuh** selama main: istana makin tinggi, kereta makin panjang | Level berganti tanpa bekas | Tiap game punya "proyek" yang terbangun selama satu sesi |
| **Banyak jalan benar** (458 → 693 boleh +200+30+5 atau +235) | Satu jawaban, satu cara | Nilai hasilnya, bukan langkahnya |
| Anak **tak pernah buntu**: petunjuk muncul bertahap | "Salah, coba lagi" berulang tanpa bantuan | Petunjuk bertingkat sesudah dua kali salah |
| **Tokoh** yang punya kebutuhan ("Pak Beruang pesan ¾ martabak") | Soal tanpa alasan | Tiap game punya tokoh hewan pemberi tugas |
| **Puncak** di akhir sesi: soal gabungan yang terasa seperti misi | Level terakhir sama dengan level pertama | Level terakhir tiap sesi = "misi besar" |

**Yang TIDAK kita tiru** (walau game mahal memakainya): iklan, pembelian di
dalam game, kotak hadiah acak, penghitung mundur yang menghukum, nyawa yang
habis, dan peringkat antar-anak. Semuanya bertentangan dengan "Standar UX Anak"
di CLAUDE.md. Premium di sini = **lebih kaya interaksinya**, bukan lebih
menekan anaknya.

### 2b.2 Lapisan premium untuk SEMUA game (fitur engine, sekali bangun)

Lima hal ini dikerjakan di engine, jadi game lama (termasuk TK & SD Kelas 1 & 2
yang sudah dijual) ikut terangkat tanpa menyentuh config-nya.

| # | Fitur | Isinya | Biaya | Catatan |
|---|---|---|---|---|
| P1 | **"Hidup" saat disentuh** | percikan bintang saat benar, kartu memantul saat disentuh, getar halus (`navigator.vibrate`, Android saja), angka bintang yang "terbang" ke penghitung | kecil | dimatikan oleh `prefers-reduced-motion`; CSS transform + rAF saja, tanpa library (HP murah) |
| P2 | **Petunjuk bertingkat** | salah ke-2 → bagian yang perlu dilihat menyala; salah ke-3 → satu langkah diperlihatkan | sedang (per template) | menggantikan "coba lagi" yang berulang tanpa bantuan; bintang tetap dihitung seperti sekarang |
| P3 | **Proyek sesi** | tiap level benar menambah satu bagian gambar (menara, gerbong, kue di etalase); layar "Selamat!" memperlihatkan hasil utuhnya | sedang | `GameConfig.project`: daftar tahap gambar, satu per level; SVG engine, bukan aset impor |
| P4 | **Misi besar** | level terakhir tiap sesi menggabungkan dua-tiga keterampilan + tokoh yang berterima kasih | kecil (config) | cukup slot terakhir berurutan tetap, bukan ikut diundi `sessionLevels` |
| P5 | **Album stiker** | satu stiker per game yang ditamatkan, dipajang di portal | sedang | **dihitung dari bintang yang sudah tersimpan** — nol data baru, jadi Kebijakan Privasi tidak berubah |

**Status (2026-10-02):** **P1 SELESAI** (`src/engine/ui/juice.ts`, berlaku di
semua game termasuk TK & SD Kelas 1 & 2 — atas permintaan pemilik). **P3
SELESAI sebagai fitur engine** (`GameConfig.project` + `GameLevel.stamp`),
pemakai pertamanya Waktu Tepat; game lama belum memakainya. P2, P4 (selain di
Waktu Tepat), P5 belum.

**Status (2026-10-06):** **P2 SELESAI sebagai fitur engine** (`GameConfig.hints`
→ `TemplateProps.hint` 0/1/2). Keputusan pemilik: **hanya dinyalakan di game
`sd2` baru**, game TK & SD 1-2 tidak. Pemakai pertama Istana Bilangan:
tap-answer menyalakan isyarat bilangan (tingkat 1) lalu memudarkan satu kartu
salah (tingkat 2); `place-value` menyalakan menara yang salah lalu menulis
banyak balok yang dibutuhkan samar-samar. Visual saja, nol narasi tambahan.

Urutan kerja yang disarankan: **P1 dulu** (murah, langsung terasa di semua 25
game), lalu P2 & P3 sambil membangun game premium pertama.

### 2b.3 Enam game sisa, versi premium

Pola tiap game: **cara main inti** (yang dipegang anak) → **momen "wah"** →
**proyek sesi** → **misi besar** → **biaya engine**.

---

#### 1. Istana Bilangan 🏰 → "Pembangun Istana"
- **Cara main:** anak MENYERET balok ratusan, puluhan, dan satuan ke tiang
  istana sampai sama dengan bilangan pesanan Raja Singa. Bukan memilih kartu
  "347", tapi **membangun** 347.
- **Momen wah — tukar otomatis:** begitu ada **10 kubus satuan**, kubusnya
  bergabung (animasi menempel) jadi **1 batang puluhan**; 10 batang jadi 1 pelat
  ratusan. Itulah inti "menyimpan" yang selama ini cuma dihafal anak. Arah
  sebaliknya juga ada: ketuk batang → pecah jadi 10 kubus (inti "meminjam").
- **Pembulatan = bukit:** bola diletakkan di garis bilangan berbentuk bukit
  (350 di puncak) lalu menggelinding ke lembah terdekat — 300 atau 400.
  Anak melihat KENAPA 349 turun dan 351 naik.
- **Proyek sesi:** tiap level benar menambah satu bagian istana (gerbang,
  menara, bendera); misi besar = menyalakan lampu istana.
- **Engine:** template `cashier` sudah menilai "jumlah isi baki", dompet tak
  terbatas, dan isi baki bisa dikembalikan — persis yang dibutuhkan.
  **Generalisasi `cashier` jadi template "baki nilai"** (token uang ATAU balok)
  + aturan tukar 10→1, ditambah `Blocks.tsx`. Biaya sedang-besar, tapi Toko
  Kembalian ikut mendapat fitur tukar uang (Rp10.000 → 10 × Rp1.000) gratis.

#### 2. Lompat Katak 🐸 → "Katak Penjelajah"
- **Cara main:** katak duduk di daun teratai 458, tujuannya teratai 693. Anak
  menekan tombol lompat **+100 / +10 / +1** (dan −100 / −10 / −1); tiap tekan,
  katak benar-benar melompat di garis bilangan dengan busur & bunyi "plung".
  Persamaannya **tersusun sendiri** di bawah: 458 + 100 + 100 + 10 + … = 693.
- **Banyak jalan benar:** +200+35 atau +235 atau +300−65 sama-sama sampai.
  Yang dinilai: katak tiba di teratai yang benar. Bintang 3 kalau lompatannya
  hemat (jumlah lompatan paling sedikit) — dorongan halus ke strategi, bukan
  hukuman.
- **Tombol "mundur satu lompat"** — anak boleh memperbaiki tanpa mengulang.
- **Menaksir:** anak menyeret katak ke kira-kira tempat 398 + 205; diterima
  dalam rentang toleransi, lalu angka sebenarnya muncul.
- **Proyek sesi:** setiap teratai yang dicapai tumbuh bunga; misi besar =
  menyeberangi seluruh kolam (soal cerita dua langkah).
- **Engine:** template baru `number-hop` (`NumberLine.tsx` + tombol lompat).
  Narasi lompatan memakai kata ("tambah seratus") yang dirender sekali, dipakai
  ulang semua level — jumlah rekaman kecil.
- **Aset:** seni katak WebP (aturan hewan wajib seni) — satu gambar.

#### 3. Bagi Kue 🍰 → "Toko Kue Bu Beruang"
- **Cara main:** pelanggan hewan datang memesan ("Kelinci pesan seperempat
  martabak"). Anak **MEMOTONG** dengan menggesek jari melintasi kue — garis
  potong mengunci ke potongan sama besar — lalu **menyeret potongan** ke piring
  pelanggan.
- **Momen wah — tumpuk untuk membandingkan:** potongan ¼ diseret ke atas ½,
  dan terlihat ia cuma menutupi separuhnya. Pecahan senilai = dua potongan ¼
  pas menutupi satu ½. Anak melihat ½ > ¼ alih-alih dihafalkan.
- **Pecahan dari kumpulan:** 12 kue kering dibagi ke 4 piring dengan menyeret
  — tiap piring berisi ¼.
- **Desimal (kls 4):** gelas jus dibagi 10 garis; "nol koma lima" = isi sampai
  garis kelima.
- **Proyek sesi:** etalase toko terisi kue yang sudah terjual; misi besar =
  pesta ulang tahun dengan tiga pesanan sekaligus.
- **Engine:** template baru `fraction-kitchen` + `Fraction.tsx` (SVG, potong
  bergaris, potongan bisa diseret). Biaya **paling besar** di daftar ini — kalau
  waktu sempit, pakai versi ringan: memotong saja, tanpa tumpuk.

#### 4. Waktu Tepat ⏱️ → "Sehari Bersama Kancil"
- **Cara main:** anak **MEMUTAR jarum panjang dengan jari**; jarum pendek ikut
  bergerak sendiri seperti jam sungguhan (60 menit = 1 jam). Tugasnya: "Kancil
  berangkat sekolah pukul tujuh lewat seperempat — atur jamnya!"
- **Momen wah — busur waktu:** saat menghitung lama kegiatan, jarum diputar dari
  jam berangkat ke jam tiba, dan **busur berwarna** mengisi permukaan jam.
  "Tiga puluh menit" jadi setengah lingkaran yang kelihatan.
- **Hari yang berjalan:** level-level satu sesi = satu hari Kancil (bangun →
  sekolah → main → makan → tidur). **Latar `Scene` ikut berubah**: pagi, siang,
  senja, malam — latar yang sudah ada di engine.
- **Jam 24 (kls 4):** cincin luar angka 13–24 muncul saat matahari terbenam.
- **Proyek sesi:** buku harian Kancil terisi satu halaman per kegiatan; misi
  besar = menyusun jadwal satu hari.
- **Engine:** `Clock.tsx` jadi bisa diputar + busur; template baru `clock-set`.
  Biaya sedang. **Paling murah di antara keenamnya** karena jam & latar sudah ada.

#### 5. Detektif Bacaan 🔍 → "Kasus Detektif Kucing"
- **Cara main:** Detektif Kucing membawa kasus ("Siapa yang mengambil mangga
  Pak Kerbau?"). Anak membaca teks pendek lalu **MENYENTUH KALIMAT di dalam
  teks** yang menjadi bukti — bukan memilih kartu A/B/C. Menyentuh kalimat juga
  membacakannya, jadi anak yang tersendat membaca tetap terbantu.
- **Momen wah — papan bukti:** tiap bukti yang ditemukan terbang ke papan kasus
  (kartu foto + benang merah). Di misi besar, anak menyusun bukti-bukti itu
  untuk menunjuk pelakunya — deduksi kecil, bukan hafalan.
- **Kaca pembesar:** teks disapu kaca pembesar yang mengikuti jari — sekadar
  rasa main detektif, tidak mengubah penilaian.
- **Kelas 4:** ide pokok (sentuh kalimat utama), fakta vs pendapat (tarik
  kalimat ke dua map), makna kata dari konteks (sentuh kata).
- **Proyek sesi:** satu kasus utuh per sesi, ditutup dengan "Kasus Terpecahkan!"
- **Engine:** template baru `read-find` (teks dengan kalimat/kata yang bisa
  disentuh; jawaban = id kalimat). Biaya sedang. Tokoh: hewan semua (aturan
  cerita buatan sendiri). **Seni detektif kucing** perlu dibuat — promptnya
  di `docs/prompt-detektif-kucing.md` (2026-10-07; tokohnya abu-abu belang
  supaya beda dari kucing soal & kucing "Coba lagi").
- **Jebakan baru:** kalimat yang bisa disentuh harus selebar target sentuh
  (≥ 64 px tinggi baris) — teks ±4 kalimat, huruf besar, jarak baris lega.

#### 6. Susun Kalimat ✏️ → "Kereta Kata"
- **Cara main:** kata-kata adalah **gerbong kereta**. Anak menyeret gerbong ke
  rel sesuai urutan; lokomotif = kata pertama (berhuruf kapital), gerbong
  terakhir membawa tanda baca (. ? !).
- **Momen wah — kereta berangkat:** begitu urutannya benar, kereta melaju
  sambil **membacakan kalimatnya** satu kata per gerbong yang lewat. Hadiahnya
  adalah mendengar kalimat buatan sendiri.
- **Salah urut:** kereta tidak bergerak, sambungan yang salah menyala lembut
  (petunjuk P2) — tanpa overlay penghukum.
- **Kelas kata:** "sentuh gerbong yang berisi kata KERJA" → gerbongnya
  berjoget. **Imbuhan:** tempelkan gerbong kecil "me-"/"ber-" ke kata dasar.
- **Proyek sesi:** rel kereta makin panjang menembus kota; misi besar =
  menyusun dua kalimat jadi satu cerita pendek.
- **Engine:** template baru `word-train` (urutkan dengan seret). Hanya kalimat
  yang BENAR yang dibacakan — kalimatnya diketahui sebelumnya, jadi bisa
  dirender Azure; urutan salah tidak pernah dibacakan.

### 2b.4 Dua game BARU yang sama premiumnya (usulan, di luar sepuluh)

Kalau pemilik mau `sd2` lebih dari 11 game (target kelompok 10–15):

- **Misi Robot 🤖 (arah, peta & logika berurutan)** — anak menyusun **deret
  perintah panah** (maju, belok kiri, belok kanan) lalu menekan "Jalan!" dan
  robot menjalankannya di peta kota berpetak. Latihan mata angin & denah (Fase B)
  sekaligus pengenalan berpikir komputasional — jenis game yang paling sering
  dijual mahal. Engine: template baru `command-grid`. Menggantikan cadangan
  "Arah & Peta".
- **Lipat Kubus 📦 (bangun ruang & jaring-jaring)** — anak memilih jaring-jaring
  lalu melihatnya **terlipat jadi kubus/balok** dalam animasi; misinya membuat
  kotak kado untuk teman hewan. Engine: SVG lipat semu-3D (pola `Shape.tsx`).
  Biaya sedang-besar.

### 2b.5 Sentuhan premium untuk game `sd2` yang SUDAH jadi (opsional)

Tidak wajib — game ini sudah bisa dimainkan. Kalau ada waktu sesudah enam game
di atas:
- **Toko Kembalian:** antrean pelanggan hewan + rekap "uang hari ini" di akhir
  sesi (proyek sesi).
- **Kali Kilat:** slot "kebun larik" — anak menanam bibit berbaris-berkolom
  untuk membuat 3 × 4 (model luas perkalian).
- **Detektif Data:** anak **menarik batang diagram** sendiri sampai tingginya
  sesuai tabel (dari membaca diagram ke membuat diagram).
- **Ukur Yuk:** anak **menggeser penggaris** sendiri ke benda, bukan membaca
  penggaris yang sudah terpasang.
- **Kebun Ilmu:** rantai makanan disusun dengan menyeret (dulu ditunda karena
  belum ada template urutkan — `word-train` di atas bisa dipakai ulang).

### 2b.6 Harga yang dibayar & keputusan yang ditunggu

**Harga yang disadari:**
- Dulu menambah game = menulis config. Versi premium = **satu template baru per
  game** (5 template baru + generalisasi `cashier`). Perkiraan kasar: satu game
  premium ≈ **2–3 kali kerja** game config biasa.
- **Seni tokoh** perlu dibuat: katak, Bu Beruang + kue, Detektif Kucing, Raja
  Singa (singa sudah ada), robot. Prompt gambarnya disiapkan per game.
- **Narasi lebih banyak** (tokoh berbicara) — tetap di bawah kuota gratis Azure.
- Animasi harus diuji di HP murah (CPU di-throttle 4–6× saat uji headless).

**Keputusan pemilik (2026-10-06):** arah premium jalan terus game per game;
berikutnya **Istana Bilangan** (selesai 2026-10-06), lalu **Lompat Katak**
(selesai 2026-10-06: bebas arah "asal tiba", bintang tetap dari salah, lompatan
hemat = lencana pujian), lalu **Detektif Bacaan** (selesai 2026-10-07, keputusan di bawah), sisa: Bagi Kue. **P2 hanya untuk game `sd2` baru**; P4 di game lama &
P5 belum. **Misi Robot & Lipat Kubus DITUNDA.** Isi slot Istana Bilangan
disetujui: bangun · baca balok · angka menyala · bentuk panjang · bandingkan ·
tukar · bulat puluhan · bulat ratusan · misi pinjam (urutan mengurutkan,
genap/ganjil, 399→400 dari rancangan lama dibuang).

**Keputusan pemilik Detektif Bacaan (2026-10-07):** 9 slot disetujui — siapa ·
di mana/kapan · apa yang terjadi · mengapa · urutan (yang PALING AWAL) · (kls 4)
ide pokok · makna kata (sentuh KATA) · fakta vs pendapat = **sentuh kalimat
PENDAPAT** (bukan tarik ke dua map) · misi besar (dua bukti ke papan, lalu tunjuk
tokohnya). Tokoh = hewan yang sudah berseni, teks informasi boleh tanpa tokoh;
"pelaku" = hewan yang lupa/salah ambil. **Papan bukti ikut, kaca pembesar
pengikut jari DITUNDA** (menutupi teks di HP 320 px). Seni Detektif Kucing
belum ada → mulai dengan pemandu 🔍; begitu `public/assets/ui/detektif-kucing.webp`
ada, isi konstanta `GUIDE` di config.

**Keputusan pemilik yang ditunggu (versi 2026-10-02, sudah terjawab di atas):**
1. Setuju arah premium ini untuk enam game sisa? (atau sebagian saja)
2. Lapisan premium P1–P5: mana yang dikerjakan, dan apakah boleh ikut mengubah
   game TK & SD Kelas 1 & 2 yang sudah dijual?
3. Dua game baru (Misi Robot, Lipat Kubus): ditambahkan, menggantikan, atau tidak?
4. Urutan: usulan di 2b.7.

### 2b.7 Urutan kerja yang disarankan

| Urutan | Pekerjaan | Kenapa di sini |
|---|---|---|
| 1 | **P1 "hidup" saat disentuh** | murah, langsung terasa di 25 game yang ada |
| 2 | **Waktu Tepat** (`clock-set`) + P3 proyek sesi | template baru termurah; jadi contoh pola premium untuk game berikutnya |
| 3 | **Istana Bilangan** (generalisasi `cashier`) | memakai ulang template yang sudah teruji |
| 4 | **Lompat Katak** (`number-hop`) + P2 petunjuk bertingkat | |
| 5 | **Susun Kalimat** (`word-train`) | template urutkan ini juga dipakai Kebun Ilmu |
| 6 | **Detektif Bacaan** (`read-find`) | butuh seni Detektif Kucing |
| 7 | **Bagi Kue** (`fraction-kitchen`) | paling mahal, paling akhir |
| 8 | P5 album stiker, P4 misi besar di game lama | |
| 9 | Misi Robot / Lipat Kubus (kalau disetujui) | |

---

## 3. Urutan pengerjaan

> **Untuk game yang belum dibuat, urutan terbaru ada di 2b.7.** Tabel di bawah
> adalah urutan awal 2026-09-29 (game bertanda ✅ di bagian 6 sudah selesai).

`sd2` baru bisa dirilis kalau punya demo, jadi **Toko Kembalian naik ke depan**.
Sisanya urut dari yang paling sedikit mengubah engine:

| Urutan | Game | Kerja engine | Catatan |
|---|---|---|---|
| 1 | Waktu Tepat | **nol** (kalender menyusul) | pemanasan, cepat jadi |
| 2 | **Toko Kembalian** | besar (drag-drop banyak-ke-satu) | **demo gratis — syarat rilis `sd2`** |
| 3 | Istana Bilangan | sedang (`Blocks.tsx`) | batas 1.000 |
| 4 | Lompat Katak | sedang (`NumberLine.tsx`) | batas 1.000 |
| 5 | Detektif Bacaan | kecil (`passage`) | banyak menulis teks |
| 6 | Susun Kalimat | sedang (`spell` berkeping kata) | |
| 7 | Bagi Kue | sedang (`Fraction.tsx`) | |
| 8 | Detektif Data | sedang (`Chart.tsx`) | |
| 9 | Ukur Yuk | sedang (`Ruler`, `Scale`, `Beaker`) | |
| 10 | Kebun Ilmu | besar (generalisasi `tap-picture`) | |

Syarat minimal sebelum `sd2` BOLEH dibicarakan untuk rilis (≥ 10 game): Kali
Kilat + sembilan di atas, dengan Toko Kembalian wajib termasuk. Terpenuhinya
syarat ini **bukan** izin rilis — keputusan melepas `draft` tetap di pemilik.

## 4. Aturan yang berlaku untuk SEMUA game di atas (ringkasan CLAUDE.md)

- Config = file `.ts` typed di `src/games/sd2/`, daftar di `registry.ts`.
- **Batas bilangan `sd2` = 1.000** (bilangan & hasil, termasuk kartu pengecoh dan
  angka di kalimat soal cerita). Pengecualian: nominal rupiah.
- **Narasi tanpa digit** — `terbilang()` / `rupiahWords()`; angka tampil di
  `equation`/papan. `npm run narasi` gagal kalau ada digit.
- **Soal tidak boleh memuat jawabannya** (teks, narasi, label diagram).
- **Pengecoh dihitung dari kesalahan khas**, bukan acak — tiap game di atas
  sudah menyebut kesalahan khasnya.
- Satu gambar satu arti; hewan = seni WebP; tanpa labu 🎃, tanpa benda empat musim.
- Tiap game ≥ 8 slot dengan kolam varian + `sessionLevels` — kecuali kalau
  kesulitannya harus naik berurutan (pelajaran Kartu Kembar): urutan slot tetap,
  variasinya dari kolam varian per slot.
- Muat tanpa scroll di **360×640** (320×568 minimal tidak patah); ukur **varian
  terburuk**, bukan yang keluar undian.
- **`sd2` tetap `draft` (development saja) sampai pemilik menyatakan siap rilis** — lihat bagian ⚠️ di atas. Menambah game `sd2` tidak pernah berarti melepas `draft`.
- Narasi baru dirender lewat workflow "Render narasi" (periksa kalimat yang naik
  ke `shared` — jangan pakai `only:` kalau ada).

## 5. Cadangan (kalau salah satu di atas diganti)

- **Faktor & Kelipatan** — faktor, kelipatan persekutuan (tap-answer; batas 1.000).
- **Keliling & Luas Kebun** — luas dengan persegi satuan (kalau Ukur Yuk terlalu padat).
- **Arah & Peta** — mata angin, membaca denah sederhana (path-trace).
- **Simetri Kupu** — garis simetri & pencerminan (puzzle/tap-picture).
- **Aturan & Keberagaman** — Pendidikan Pancasila (story-choice, bertokoh hewan).

## 6. Status

> Status narasi diperiksa 2026-10-07 dari `public/assets/voice/manifest.json` + berkasnya: 1.356/1.356 baris sebelum Detektif Bacaan punya entri manifest DAN mp3-nya ada; nol entri menunjuk berkas hilang. Detektif Bacaan menambah 272 baris (render #31).

| # | Game | id | Status |
|---|---|---|---|
| – | Kali Kilat | `kali-kilat` | ✅ sudah ada (2026-09-29), narasi SUDAH dirender (89 baris) |
| 1 | Istana Bilangan | `istana-bilangan` | ✅ sudah ada (2026-10-06) — versi premium "Pembangun Istana": template baru `place-value` (bangun bilangan dari balok, tukar otomatis 10→1, pecah pelat = meminjam) + isyarat `TapAnswerData.number` (balok, angka menyala, bukit pembulatan); 9 slot × 54 varian, urutan tetap, proyek sesi "Istana Raja Singa", **petunjuk bertingkat P2 menyala**; narasi 16 baris, render #29. |
| 2 | Lompat Katak | `lompat-katak` | ✅ sudah ada (2026-10-06) — versi premium "Katak Penjelajah": template baru `number-hop` (tombol lompat ±100/±10/±1 bebas arah, catatan lompatan, ↩️, lencana "Lompatan hemat!", menaksir dengan menyeret katak), 9 slot × 54 varian, urutan tetap, proyek sesi "Kolam Katak", P2 menyala; seni `frog` yang sudah ada; narasi 12 baris SUDAH dirender (render #30). Teruji 54 varian × 360×640, 320×568, 740×360 & 820×1180. |
| 3 | Bagi Kue | `bagi-kue` | rencana |
| 4 | Ukur Yuk | `ukur-yuk` | ✅ sudah ada (2026-09-30), narasi SUDAH dirender (render #21, 38 baris) — 9 slot × 55 varian, urutan tetap |
| 5 | Waktu Tepat | `waktu-tepat` | ✅ sudah ada (2026-10-02) — **versi premium pertama** "Sehari Bersama Kancil": template baru `clock-set` (putar jarum), 9 slot × 54 varian, urutan tetap, proyek sesi "Buku Harian Kancil" (P3); narasi SUDAH dirender (render #23, 41 baris). Kalender & hari–minggu belum. |
| 6 | Toko Kembalian | `toko-kembalian` | ✅ sudah ada (2026-09-30), narasi SUDAH dirender (render #20, 37 baris) — **demo gratis `sd2`**, belum masuk `FREE_GAME_IDS` |
| 7 | Detektif Data | `detektif-data` | ✅ sudah ada (2026-10-02), narasi SUDAH dirender (render #22, 47 baris) — 9 slot × 54 varian, urutan tetap; fitur engine `TapAnswerData.chart` / `TapChoice.chart` (`Chart.tsx`) |
| 8 | Detektif Bacaan | `detektif-bacaan` | ✅ sudah ada (2026-10-07) — versi premium "Kasus Detektif Kucing": template baru `read-find` (sentuh KALIMAT bukti di dalam bacaan, kalimat dibacakan saat disentuh; sentuh KATA untuk makna kata; misi besar = papan bukti + tunjuk tokohnya), 9 slot × 54 varian, urutan tetap, proyek sesi "Kasus Detektif Kucing", P2 menyala. Seni Detektif Kucing BELUM ada (pemandu sementara 🔍), kaca pembesar pengikut jari ditunda. Narasi 272 baris BELUM dirender (render #31). |
| 9 | Susun Kalimat | `susun-kalimat` | ✅ sudah ada (2026-10-06) — versi premium "Kereta Kata": template baru `word-train` (seret gerbong kata), 9 slot × 54 varian, urutan tetap, proyek sesi "Kereta Kata"; kalimat dibacakan saat kereta berangkat; narasi SUDAH dirender (render #28, 73 baris). |
| 10 | Kebun Ilmu | `kebun-ilmu` | ✅ sudah ada (2026-09-29), narasi SUDAH dirender (render #19, 63 baris) |
| – | Perisai Garuda (Pancasila) | `perisai-garuda` | ✅ sudah ada (2026-10-05) — game Pancasila pertama: lambang sila SVG engine (`Sila.tsx`), 9 slot × 55 varian, urutan tetap, proyek sesi "Perisai Garuda" (stempel = lambang sila); narasi SUDAH dirender (render #26, 57 baris). Rumah & pakaian adat belum. |

## 7. Prompt untuk memulai sesi baru

Salin ke sesi Claude Code baru, ganti `<Nama Game>` dengan judul dari tabel
Status (urutan kerja di bagian 3):

```
Kerjakan game "<Nama Game>" untuk SD Kelas 3 & 4 (kelompok sd2).
Patokannya docs/rencana-game-sd-kelas-3-4.md — baca dulu bagian ⚠️,
bagian 0, bagian 2b (versi premium), bagian 4, dan bagian game ini.

- Mulai dari branch main yang terbaru.
- sd2 MASIH DEVELOPMENT: draft di groups.json tetap terpasang, jangan
  sentuh FREE_GAME_IDS, backend, landing, atau pengumuman lonceng.
- Kalau butuh perubahan engine (komponen SVG baru, field baru), kerjakan
  sebagai fitur engine, bukan tambalan satu game.
- Uji headless di 360×640 dan 320×568 pakai build penguji, ukur varian
  terburuk, nol scroll, nol error console.
- Jalankan npm run narasi dan pastikan nol digit di narasi. Kalau ada baris
  narasi baru, perbarui .github/render-request.txt supaya dirender.
- Sesudah selesai, perbarui tabel Status di dokumen rencana dan catat di
  CLAUDE.md.
- Kalau ada yang ambigu soal isi soal, tanya saya dulu.
```
