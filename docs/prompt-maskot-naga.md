# Prompt Gambar — Tahap Maskot Naga (mascot-7 … mascot-20)

Dokumen **siap tempel** untuk membuat gambar maskot lanjutan.

Tangga maskot diperpanjang dari 6 jadi 12 tahap (2026-08-09), lalu jadi
**20 tahap** (2026-10-14, permintaan pemilik: akun berlaku selamanya, jadi
anak yang tumbuh dari Playgroup sampai SD Kelas 3 & 4 harus tetap punya
tahap baru untuk dikejar). **Tahap 7–9 sudah punya seninya**; tahap 10–20
masih tampil pakai emoji cadangan. Begitu kamu kirim gambarnya, aku tinggal
memasang file + satu kata di kodenya.

> **Tahap 12 berganti nama: "Naga Legenda" → "Naga Mahkota"** (emoji 👑 tetap).
> Nama "Legenda" pindah ke tahap 20, puncak yang baru.
>
> **Jangan pakai warna UNGU** di tahap mana pun (pemilik tidak suka ungu,
> 2026-10-11). Tahap malam/langit memakai biru tua + emas.

**Pelajaran dari batch 7–9 — pakai ini saat meminta tahap 10–12:**

- Percobaan yang langsung diterima selalu punya tiga hal: **latar putih polos
  tanpa bayangan lantai**, **tanpa partikel yang melayang jauh dari badan**
  (setelah autocrop, partikel terluar yang menentukan batas gambar, jadi
  naganya jadi mengecil), dan **sayap merapat ke badan**.
- **Warna elemen barunya harus PEKAT dengan garis tepi jelas.** Kristal pucat
  tembus pandang dan kilat setipis rambut sama-sama hilang di avatar 72px, dan
  yang nyaris seputih latar berisiko ikut termakan saat latarnya dipotong.
  Patokannya: sepekat api oranye di `mascot-7`.
- Elemen yang jauh lebih kecil dari sayap (tanduk bercahaya, percikan) **tidak
  perlu dikejar** — tak terlihat di 72px, dan menuntutnya cuma menambah putaran
  revisi.

> **Ini BUKAN gaya yang sama dengan `prompt-gambar-gemini.md`.** Aset benda &
> hewan di sana bergaya stiker: outline hitam tebal, warna flat. Maskot
> bergaya **lembut, empuk, seperti 3D render pastel** — tanpa outline hitam.
> Jangan tertukar, nanti naganya terlihat dari produk yang berbeda.

---

## Yang Perlu Dibuat

| File yang dikirim | Tahap | Bintang | Emoji sementara |
|---|---|---|---|
| ~~`mascot-7.png`~~ | Naga Api | 145 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| ~~`mascot-8.png`~~ | Naga Kristal | 200 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| ~~`mascot-9.png`~~ | Naga Petir | 265 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| `mascot-10.png` | Naga Pelangi | 340 ⭐ | 🌈 |
| `mascot-11.png` | Naga Bintang | 440 ⭐ | 🌟 |
| `mascot-12.png` | Naga Mahkota | 555 ⭐ | 👑 |
| `mascot-13.png` | Naga Samudra | 640 ⭐ | 🌊 |
| `mascot-14.png` | Naga Rimba | 730 ⭐ | 🍃 |
| `mascot-15.png` | Naga Bunga | 830 ⭐ | 🌸 |
| `mascot-16.png` | Naga Matahari | 940 ⭐ | ☀️ |
| `mascot-17.png` | Naga Bulan | 1.060 ⭐ | 🌙 |
| `mascot-18.png` | Naga Komet | 1.190 ⭐ | ☄️ |
| `mascot-19.png` | Naga Cahaya | 1.330 ⭐ | ✨ |
| `mascot-20.png` | Naga Legenda | 1.480 ⭐ | 🐉 |

**Beri nama file persis seperti kolom pertama.** Kalau sebagian dulu juga tidak
apa-apa — tahap yang belum ada gambarnya tetap jalan dengan emoji, dan tidak
ada error apa pun di app.

---

## Cara Pakai (baca ini dulu, 1 menit)

1. Buka chat **baru** di Gemini.
2. **Lampirkan `public/assets/mascot/mascot-6.webp`** (Naga Jenius yang sudah
   ada) sebagai gambar rujukan. Ini langkah paling menentukan — model jauh
   lebih patuh melihat karakternya daripada membaca deskripsi warnanya.
3. Tempel **BLOK GAYA** di bawah satu kali.
4. Kirim **satu baris prompt per pesan**, berurutan dari tahap 10 ke 20. Satu
   gambar per pesan — jangan minta banyak sekaligus, hasilnya jadi kolase yang
   tidak bisa dipakai.
5. Sebelum tiap gambar berikutnya, cukup tulis: *"Naga yang sama lagi, ini
   tahap berikutnya."*
6. Unduh, beri nama sesuai tabel di atas, kirim ke sini. Aku yang potong latar
   jadi transparan, resize, ekspor WebP, dan daftarkan di kodenya.

---

## Makin tinggi tahap, makin JOMPLANG (keputusan pemilik 2026-10-14)

Pemilik ingin seperti emblem rank Mobile Legends: tahap kecil dan tahap besar
harus kelihatan beda jauh, dari **ukuran badan** dan **kemegahan desainnya**.
Jadi mulai tahap 10 naganya **bukan lagi bayi yang sama ditempeli hiasan**,
tapi ikut TUMBUH. Wajah, warna hijau mint, perut krem & mata besar tetap sama
supaya anak tahu ini temannya yang sama.

| Tahap | Rank (bingkai di app) | Wujud badan yang diminta |
|---|---|---|
| 10–12 | Emas | Anak naga: badan sedikit lebih tinggi dari Naga Jenius, sayap lebih besar, mulai pakai aksesori (mahkota/jubah kecil) |
| 13–16 | Berlian | Naga remaja: leher & ekor lebih panjang, sayap lebar penuh dengan sisik tegas, berdiri gagah, pelindung dada/bahu kecil berkilau |
| 17–19 | Legenda | Naga muda perkasa: badan besar, sayap terbentang megah (tetap dalam bingkai persegi), baju zirah emas ringan, aura menyala |
| 20 | Mitos | Naga legenda puncak: paling besar & paling megah, zirah emas penuh bertatah permata merah-biru-hijau, mahkota besar, aura api emas, tetap tersenyum ramah |

**Bingkai rank (perak, emas, berlian, api) DIGAMBAR APP, bukan di gambarnya.**
Jangan minta bingkai/lingkaran di gambar — latar tetap putih polos.

## BLOK GAYA (tempel sekali di awal chat)

> Aku sedang membuat maskot untuk game edukasi anak usia 4–8 tahun. Gambar yang
> kulampirkan adalah karakter naga bayi yang sudah ada — namanya Naga Jenius,
> tahap terakhir dari maskot yang tumbuh bertahap.
>
> Aku butuh **beberapa gambar lanjutan dari naga yang SAMA PERSIS ini**, makin
> megah di tiap tahap. Aturannya:
>
> - **Karakter yang sama, bukan naga baru.** Bentuk kepala, mata besar
>   berbinar, moncong pendek, warna hijau mint dan perut krem harus tetap
>   sama. TAPI badannya TUMBUH tiap tahap: makin tinggi, sayap makin lebar,
>   pakaian/zirah makin megah — seperti emblem rank game yang makin keren.
>   Tahap terakhir harus terlihat jauh lebih hebat dari tahap pertama.
>   Tiap pesan aku sebutkan wujud badannya.
> - Gaya: **render 3D lembut ala mainan empuk**, warna pastel, shading halus
>   dan mengkilap, **tanpa outline hitam tebal**, tanpa gaya stiker datar.
> - **Jangan pakai warna ungu** sama sekali.
> - Ekspresi **selalu ramah dan ceria** — ini teman belajar anak kecil.
>   Naganya tidak boleh terlihat garang, menyeramkan, bertaring tajam, atau
>   marah, sekalipun tahapnya "petir" atau "legenda".
> - **Seluruh badan masuk**, berdiri menghadap depan atau tiga-perempat, di
>   tengah gambar.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pemandangan, tanpa
>   bingkai, tanpa lingkaran di belakangnya.
> - **Tanpa teks, tanpa angka, tanpa watermark.**
> - Komposisi **kira-kira setinggi lebarnya** (mendekati persegi). Jangan
>   membuat sayap terbentang sangat lebar ke samping.
> - Resolusi tinggi.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan tahapnya satu per satu.

---

## ⭐ KUNCI GAYA MULAI `mascot-12` (WAJIB — ditulis sesudah `mascot-11` jadi, 2026-10-14)

`mascot-10` & `mascot-11` jadi PATOKAN. Dua pelajaran yang mengikat:

1. **Gemini cenderung membuat naga KURUS/ramping.** Tiap prompt wajib menyebut
   "chubby, round belly, thick short legs" DAN melarang "slim, skinny, long
   thin neck/legs". Naga TUMBUH lewat ukuran, zirah & sayap — **bukan dengan
   memanjangkan leher atau kaki**.
2. **Gaya "mahal" = hijau MUTIARA + detail EMAS** (`mascot-11`): kulit mint
   berkilau seperti mutiara, tanduk/cakar/zirah/sisik punggung emas. Badan
   tetap mint (teman yang sama). **Badan emas penuh HANYA di `mascot-20`.**

Cara kirim: **lampirkan gambar tahap SEBELUMNYA** (mis. `mascot-11` untuk
membuat 12), lalu tempel blok ini + baris tahapnya:

> Use the attached dragon as the SAME character, one stage older and a bit
> bigger. BODY: very chubby, plump, round and squishy like a premium plush
> toy — big round belly, chubby cheeks, thick short stubby legs, short thick
> arms. NOT slim, NOT skinny, NO long thin neck, NO long thin legs. LOOK:
> pearlescent shimmering mint-green skin with a soft gold sheen, cream belly,
> polished gold horns and claws, gold spine scales, gold armor that is grander
> than the previous stage. Big friendly eyes, happy proud smile. STYLE: soft
> 3D render, glossy pastel shading, no black outline, NO purple. Full body,
> centered, wings folded close to the body, plain pure white background, no
> floor shadow, no frame, no circle, no text, nothing floating far from the
> body. **This stage:** _[tempel baris tahapnya dari daftar bahasa Inggris di bawah]_

Kalau hasilnya masih kurus, kirim susulan: *"Make it much chubbier: rounder
belly, fatter cheeks, shorter and thicker legs. Keep everything else the same."*

## Baris Prompt per Tahap

| File | Baris prompt untuk dikirim |
|---|---|
| `mascot-7` | Naga yang sama, kini **Naga Api**: sayapnya menyala jadi api oranye-kuning lembut, ada nyala api kecil di ujung ekornya, dan sedikit cahaya hangat di sekitar tubuhnya. Warna badan tetap hijau mint seperti aslinya. Tetap ceria dan ramah. |
| `mascot-8` | Naga yang sama, kini **Naga Kristal**: duri di punggungnya berubah jadi kristal biru muda yang bening berkilau, sayapnya seperti kaca kristal tembus pandang, ada serpihan kristal kecil melayang di sekitarnya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-9` | Naga yang sama, kini **Naga Petir**: ada motif kilat kuning cerah di sayapnya, percikan listrik kecil melayang di sekelilingnya, dan tanduknya bercahaya kuning. Warna badan tetap hijau mint. Tetap ceria dan ramah, **jangan terlihat marah atau garang**. |
| `mascot-10` | Wujud: anak naga, sedikit lebih tinggi dari gambar rujukan, sayap lebih besar. Naga yang sama, kini **Naga Pelangi**: sayapnya bergradasi warna pelangi pastel, ada surai kecil warna pelangi di sepanjang punggungnya, dan pelangi lembut kecil melengkung di belakang bahunya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-11` | **GEMOY, bukan kurus** (Gemini cenderung membuat naga ramping — sebut "chubby, round belly, thick short legs" + larang "slim, skinny, long thin neck", dan lampirkan `mascot-10` sebagai acuan). Wujud: anak naga, sayap lebih besar. Naga yang sama, kini **Naga Bintang**: tubuhnya bertabur kerlip bintang kecil keemasan, ada satu bintang besar bercahaya di dahinya, dan sayapnya seperti langit malam berbintang warna biru tua dengan bintik emas (bukan ungu). Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-12` | Wujud: anak naga yang mulai gagah. Naga yang sama, kini **Naga Mahkota**: memakai mahkota emas yang terlihat jelas di kepalanya dan jubah kecil merah di punggungnya. Warna badan tetap hijau mint. Tetap ceria dan ramah, terlihat bangga tapi lucu. |
| `mascot-13` | Wujud: naga REMAJA — badan lebih BESAR (tetap gemoy, JANGAN memanjangkan leher/kaki), sayap lebar, pelindung bahu kecil. Naga yang sama, kini **Naga Samudra**: sayapnya berbentuk sirip besar biru laut, ada gelombang air biru tegas melingkar di ekornya, dan beberapa gelembung besar menempel dekat badannya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-14` | Wujud: naga remaja, berdiri gagah. Naga yang sama, kini **Naga Rimba**: sayapnya berupa daun-daun besar hijau tua, ada sulur tanaman melilit lembut di ekornya, dan mahkota kecil dari daun di kepalanya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-15` | Wujud: naga remaja, berdiri gagah. Naga yang sama, kini **Naga Bunga**: sayapnya seperti kelopak bunga besar merah muda, ada rangkaian bunga merah muda dan kuning di lehernya seperti kalung, dan satu bunga besar di atas kepalanya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-16` | Wujud: naga remaja yang hampir dewasa, pelindung dada kecil berkilau. Naga yang sama, kini **Naga Matahari**: ada lingkaran sinar matahari emas-oranye yang tegas menempel di belakang kepalanya seperti surai singa, sayapnya keemasan, dan badannya bercahaya hangat. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-17` | Wujud: naga MUDA PERKASA — badan besar & gempal (tetap gemoy), sayap besar tapi merapat, zirah emas ringan. Naga yang sama, kini **Naga Bulan**: ada bulan sabit perak-kuning besar di dahinya, sayapnya biru tua seperti langit malam dengan tepi perak, dan ia memeluk bantal kecil berbentuk awan. Warna badan tetap hijau mint. Tetap ceria dan ramah (bukan mengantuk sedih). |
| `mascot-18` | Wujud: naga muda perkasa, zirah emas ringan. Naga yang sama, kini **Naga Komet**: ekornya menjadi ekor komet panjang berwarna biru dan oranye menyala yang melengkung di belakangnya (tidak melebar ke samping), dan sayapnya bergaris biru-emas. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-19` | Wujud: naga muda perkasa, zirah emas berkilau. Naga yang sama, kini **Naga Cahaya**: seluruh tubuhnya bercahaya putih-keemasan lembut, sayapnya seperti cahaya emas berlapis, dan ada lingkaran cahaya emas tipis di atas kepalanya. Warna badan tetap hijau mint, tepi tubuh tetap jelas. Tetap ceria dan ramah. |
| `mascot-20` | Wujud: PALING BESAR dan paling megah dari semuanya, zirah emas penuh. Naga yang sama, kini **Naga Legenda**, tahap tertinggi: memakai mahkota emas berhias permata merah-biru-hijau, sayap besar keemasan, jubah merah kecil, dan memegang tongkat kecil berujung bintang. **Badannya berubah jadi EMAS mutiara berkilau** — satu-satunya tahap berbadan emas, hadiah puncak (keputusan pemilik 2026-10-14). Mata, wajah, perut krem tetap sama. Tetap ceria dan ramah, terlihat bangga tapi lucu. |

### Kalau lebih suka prompt bahasa Inggris

Model gambar biasanya lebih patuh dalam bahasa Inggris. Tempel utuh, satu per
pesan, tetap dengan `mascot-6.webp` terlampir:

> Same cute pastel mint baby dragon as the reference image, cream belly, big
> sparkling friendly eyes, chubby toy-like proportions, soft 3D render style,
> soft glossy shading, no black outline, standing front view, full body
> visible, centered, plain white background, no shadow, no text, near-square
> composition, high resolution. **This stage:** _[isi salah satu]_
>
> - `mascot-7` — glowing orange-yellow flame wings, small flame at tail tip, warm soft glow around the body.
> - `mascot-8` — light-blue translucent crystal wings, crystal spikes along the back, small floating crystal shards.
> - `mascot-9` — bright yellow lightning patterns on the wings, small electric sparks around it, softly glowing horns. Still smiling and friendly, not fierce.
> - `mascot-10` — pastel rainbow gradient wings, small rainbow mane along the back, soft little rainbow arc behind its shoulders.
> - `mascot-11` — tiny golden star sparkles across its body, one big glowing star on its forehead, wings like a dark-blue starry night sky with gold dots (no purple).
> - `mascot-12` — small golden crown clearly visible, small red cape. Proud but still cute.
> - `mascot-13` — large sea-blue fin-shaped wings, a bold blue water wave curling around its tail, a few big bubbles close to its body.
> - `mascot-14` — wings made of big dark-green leaves, soft vine wrapped around its tail, small leaf crown.
> - `mascot-15` — pink flower-petal wings, a necklace of pink and yellow flowers, one big flower on its head.
> - `mascot-16` — bold golden-orange sun-ray halo behind its head like a lion mane, golden wings, warm glow.
> - `mascot-17` — big silver-yellow crescent moon on its forehead, dark-blue night-sky wings with silver edges, hugging a small cloud pillow. Happy, not sad.
> - `mascot-18` — tail becomes a long blue-and-orange glowing comet tail curving behind it (not spreading sideways), blue-gold striped wings.
> - `mascot-19` — whole body softly glowing white-gold, layered golden light wings, thin golden halo above its head; body edges still clear.
> - `mascot-20` — final legendary stage: the biggest and grandest of all, full golden armor, golden crown with red/blue/green gems, large golden wings, small red cape, holding a little star-tipped wand. Its body turns shimmering pearl GOLD (the only gold-bodied stage). Same face, eyes and cream belly. Proud but still cute.
>
> Never use purple.
---

## Aturan Teknis yang Menentukan Hasil Dipakai atau Tidak

- **Naganya tampil kecil.** Di kartu maskot avatarnya cuma **72px** bulat. Jadi
  yang menentukan bagus-tidaknya adalah **siluet dan warna besar**, bukan
  detail halus. Motif kilat setipis rambut atau tulisan di mahkota akan hilang
  total — minta elemennya besar dan tegas.
- **Jangan sayap terbentang lebar.** Gambar dipasang `object-fit: contain` di
  dalam lingkaran, jadi gambar yang sangat lebar bikin badan naganya tampil
  kecil di tengah. Burung hantu (tahap 4) adalah yang terlebar yang masih
  aman — jangan melebihi itu.
- **Potong latarnya dengan `scripts/cut-soft.py`, BUKAN `cut-item.py`**
  (2026-09-03). `cut-item.py` menyusuri latar sambil membandingkan dengan
  tetangganya, dan pada render lembut tanpa outline ia menuruni landaian
  tepinya lalu **melahap perut krem naganya dari dalam** — terbukti di gambar
  layar "tersendat". Ceritanya di `prompt-gambar-tersendat.md`.
- **Latar harus polos putih**, tanpa lingkaran/aura berbentuk kotak di
  belakang. Aura cahaya menempel di badan naganya tidak apa-apa; latar
  bercahaya penuh susah dipotong (pelajaran dari batch aset sebelumnya:
  glow latar sering lebih terang dari garis luar objeknya sendiri).
- **Enam gambar harus terasa satu keluarga.** Kalau tahap 9 tiba-tiba jadi naga
  dewasa berotot sementara tahap 8 masih bayi gemuk, anak akan merasa maskotnya
  berganti makhluk — dan itu justru merusak inti sistem maskot ini: satu teman
  yang tumbuh bersama dia.
- Ukuran akhir aset ±250–512px; **jangan repot mengecilkan sendiri**, kirim saja
  resolusi penuhnya.

---

## Setelah Kamu Kirim

Yang aku kerjakan (kamu tidak perlu melakukan apa pun):

1. Potong latar jadi transparan (`scripts/cut-soft.py`).
2. Autocrop + resize + ekspor WebP transparan ke
   `public/assets/mascot/mascot-10.webp` … `mascot-20.webp`.
3. Tambahkan `pic: 'mascot-10'` dst. di `MASCOTS` (`src/engine/core/mascot.ts`)
   — satu kata per baris, tidak ada kode lain yang berubah.
4. Uji headless di 380×800, 360×640 & 820×1180, lalu deploy.

---

## Kalau Nanti Tangganya Diperpanjang Lagi

Tahap ke-20 (1.480 ⭐) duduk 53 ⭐ di bawah langit-langit app (**1.533 ⭐** —
seluruh game TK + SD 1-2 + SD 3-4, 511 slot level × 3, diukur 2026-10-14).
Satu kelompok saja (plus demo gratis kelompok lain) berhenti di sekitar tahap
11–12; puncaknya untuk anak yang ikut tumbuh ke kelompok berikutnya. Tangga
baru hanya masuk akal kalau game bertambah (mis. SD Kelas 5 & 6): hitung ulang
langit-langitnya dulu, dan **jangan pernah menaikkan ambang tahap yang sudah
ada** — anak yang sudah mencapainya akan turun tahap.
