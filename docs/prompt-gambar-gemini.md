# Prompt Gambar untuk Gemini — Batch Aset Berikutnya

Dokumen ini berisi prompt **siap tempel** untuk membuat gambar di Gemini,
melanjutkan set seni hewan yang sudah ada (lihat `asset-generation-prompts.md`
untuk gaya asal + pipeline potong latar).

Total 60 gambar dalam 4 batch, diurutkan dari yang paling besar dampaknya.

---

## Cara Pakai

1. Buka chat baru di Gemini, **tempel BLOK GAYA di bawah satu kali** — itu jadi
   aturan untuk seluruh chat.
2. Lalu kirim **satu baris item per pesan** (misal: `Buatkan: apel merah…`).
   Satu gambar per pesan — jangan minta banyak sekaligus, hasilnya jadi kolase
   dan tidak bisa dipakai.
3. Kalau hasil melenceng dari gaya, balas: *"Ulangi dengan aturan gaya di awal
   chat: outline hitam tebal, warna flat, latar putih polos, satu objek saja."*
4. Unduh hasilnya, **beri nama sesuai kolom `id`** di tabel tiap batch
   (mis. `apple.png`) lalu kirim ke sini — aku yang potong latar, resize 512px,
   ekspor WebP, dan daftarkan ke `src/engine/ui/items.ts`.

Kalau satu batch belum selesai tidak apa-apa — kirim sebagian dulu juga bisa,
game tetap jalan (emoji jadi cadangan otomatis untuk id yang belum ada).

---

## BLOK GAYA (tempel sekali di awal chat Gemini)

> Kamu akan membantuku membuat serangkaian ilustrasi untuk game edukasi anak
> usia 4–8 tahun. Semua gambar HARUS mengikuti aturan gaya yang sama persis:
>
> - Gaya kartun kawaii yang imut dan ramah anak, sticker style.
> - **Outline hitam tebal** mengelilingi seluruh objek.
> - Warna **flat dan cerah**, shading lembut seminimal mungkin, tanpa gradasi
>   rumit, tanpa tekstur realistis.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pantulan, tanpa
>   bingkai, tanpa pola.
> - **Hanya SATU objek per gambar**, di tengah, seluruh objek masuk penuh
>   dengan sedikit ruang kosong di tepi.
> - **Tanpa teks, tanpa huruf, tanpa angka, tanpa watermark** di dalam gambar.
> - Format **persegi (1:1)**, resolusi tinggi.
> - Bentuk objek harus **jelas dan mudah dikenali dari siluetnya saja** —
>   hindari properti tambahan, tangan/kaki tambahan, atau aksesori yang
>   mengaburkan bentuk aslinya.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan objeknya satu per satu.

Contoh satu prompt utuh (kalau kamu lebih suka menempel lengkap tiap kali,
tanpa blok gaya di awal):

> Cute kawaii cartoon apple for a children's educational game, one single
> object, centered, full object visible, thick black outline, flat bright
> colors with minimal soft shading, simple happy face, plain white background,
> no shadow, no text, square 1:1, sticker style, high resolution.

---

## ❗ PALING MENDESAK — 3 gambar yang MEMPERBAIKI SOAL YANG SALAH BACA

Beda dari batch di bawah (yang isinya "emoji → gambar biar seragam"), tiga ini
memperbaiki soal yang **sekarang menyesatkan anak**. Ketiganya target di satu
varian Pasangan Pintar slot "benda & tempatnya" — dilaporkan pemilik 2026-09-03
dari tangkapan layar HP:

| id (nama file) | Sekarang | Kenapa salah |
|---|---|---|
| `pond` | 💧 "kolam" | Emojinya SATU TETES AIR, bukan kolam. Anak diminta menaruh ikan ke dalam tetesan air. Prompt: Batch 8. |
| `wardrobe` | 🗄️ "lemari" | Emojinya **lemari arsip kantor** (laci besi), bukan lemari pakaian. Prompt: Batch 9. |
| `road` | 🛣️ "jalan raya" | Di iPhone emoji ini digambar sebagai jalan tol Amerika **lengkap dengan papan hijau bertulisan "CUPERTINO"** — tulisan asing di game membaca Bahasa Indonesia. Prompt: Batch 9. |

Kirim tiga ini dulu kalau tidak sempat sekaligus sebatch; sisanya bisa menyusul
kapan saja.

---

## BATCH 1 — Buah (14 gambar) — ✅ SELESAI (2026-08-04)

> Sudah terpasang di `public/assets/items/`. Catatan hasilnya ada di
> `asset-generation-prompts.md` → "Pelajaran dari dua batch pertama".
> Ringkasnya: **satu gambar per file, latar putih polos** — papan berisi
> banyak objek dengan latar gelap bercahaya nyaris tidak bisa dipotong.

Dipakai `pasar-buah` di **5 tipe soal** sekaligus (beli buah, tebak buah, tebak
bayangan, keranjang warna, kartu buah), plus Pasang Kata, Taman Huruf, Suku
Kata, Ejaan Jitu.

**Aturan khusus batch ini:** buah boleh punya **wajah tersenyum sederhana**
(mata + senyum kecil) supaya senada dengan hewan, TAPI **bentuk buahnya harus
bentuk klasik yang paling gampang dikenali** — tanpa tangan, tanpa kaki, tanpa
topi, tanpa piring/keranjang. Ini penting karena ada soal "tebak bayangan" yang
menampilkan buahnya sebagai siluet gelap: kalau bentuknya aneh, anak tidak bisa
menebaknya. Warnanya juga harus warna buah yang sebenarnya, karena ada soal
menyortir buah ke keranjang berdasarkan warna.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `apple` | apel | Buatkan: apel merah utuh dengan satu daun hijau kecil di tangkainya, wajah tersenyum sederhana. |
| `banana` | pisang | Buatkan: satu buah pisang kuning matang melengkung, ujungnya kecoklatan sedikit, wajah tersenyum sederhana. |
| `orange` | jeruk | Buatkan: satu buah jeruk oranye bulat utuh dengan daun hijau kecil di atas, wajah tersenyum sederhana. |
| `grapes` | anggur | Buatkan: setandan anggur ungu berbentuk segitiga dengan daun hijau di atas, wajah tersenyum sederhana. |
| `strawberry` | stroberi | Buatkan: satu buah stroberi merah dengan bintik biji kuning kecil dan mahkota daun hijau, wajah tersenyum sederhana. |
| `watermelon` | semangka | Buatkan: satu potong semangka berbentuk segitiga, daging merah dengan biji hitam dan kulit hijau bergaris, wajah tersenyum sederhana. |
| `mango` | mangga | Buatkan: satu buah mangga oranye kekuningan berbentuk oval, dengan daun hijau kecil, wajah tersenyum sederhana. |
| `pineapple` | nanas | Buatkan: satu buah nanas kuning dengan pola belah ketupat di kulitnya dan mahkota daun hijau di atas, wajah tersenyum sederhana. |
| `pear` | pir | Buatkan: satu buah pir hijau berbentuk khas pir dengan daun kecil, wajah tersenyum sederhana. |
| `kiwi` | kiwi | Buatkan: satu buah kiwi dibelah dua, daging hijau dengan biji hitam melingkar dan kulit coklat berbulu, wajah tersenyum sederhana. |
| `melon` | melon | Buatkan: satu buah melon bulat berwarna hijau muda dengan pola jaring di kulitnya, wajah tersenyum sederhana. |
| `cherry` | ceri | Buatkan: sepasang buah ceri merah yang tangkainya menyatu dengan satu daun hijau, wajah tersenyum sederhana. |
| `lemon` | lemon | Buatkan: satu buah lemon kuning berbentuk oval dengan ujung runcing dan daun hijau kecil, wajah tersenyum sederhana. |
| `avocado` | alpukat | Buatkan: satu buah alpukat dibelah dua, daging hijau muda dengan biji coklat bulat di tengah dan kulit hijau tua, wajah tersenyum sederhana. |

---

## BATCH 2 — Maskot 6 tahap (6 gambar) — ✅ SELESAI (2026-08-04)

> Sudah terpasang di `public/assets/mascot/`.

Maskot muncul **setiap kali anak membuka portal dan setiap kali menamatkan
game** — ini satu-satunya wajah tetap produkmu. Sekarang masih emoji, dan 🦄/🐲
paling berbeda-beda antar HP.

**Aturan khusus batch ini:** enam gambar harus terasa **satu karakter yang
sama, tumbuh bertahap** — warna dasar dan bentuk mata harus konsisten dari
tahap 1 ke tahap 6. Kirim keenamnya berurutan dalam satu chat yang sama, dan
sebelum gambar ke-2 tulis: *"Lanjutkan karakter yang sama, ini tahap
berikutnya dari makhluk yang sama."*

Gambar tahap 1 (telur) dulu, karena warnanya menentukan lima gambar sisanya.

| id (nama file) | Tahap | Baris prompt untuk dikirim |
|---|---|---|
| `mascot-1` | Telur Ajaib (0⭐) | Buatkan: sebutir telur ajaib berbentuk oval, cangkang putih krem dengan bintik-bintik warna pastel biru dan kuning, berkilau sedikit, tanpa wajah. Ini karakter maskot yang akan tumbuh bertahap di gambar berikutnya. |
| `mascot-2` | Si Menetas (10⭐) | Buatkan: telur yang sama, kini retak di bagian atas dan muncul kepala anak burung kuning mungil yang mengintip keluar, mata besar berbinar, pipi merah muda. |
| `mascot-3` | Anak Ayam (30⭐) | Buatkan: anak burung kuning yang sama, kini sudah keluar penuh dari cangkang dan berdiri, badan bulat berbulu halus, sayap kecil, mata besar berbinar, pipi merah muda, ceria. |
| `mascot-4` | Burung Hantu Pintar (50⭐) | Buatkan: karakter yang sama tumbuh jadi burung hantu muda, bulu kuning kecoklatan, mata besar bulat, alis ramah, sayap sedikit terbuka seperti mau terbang, tetap imut. |
| `mascot-5` | Unicorn Ajaib (70⭐) | Buatkan: karakter yang sama bertransformasi jadi makhluk ajaib bersayap dengan satu tanduk kecil berkilau di dahi, surai warna pelangi pastel, badan krem keemasan, mata besar berbinar, imut dan ramah. |
| `mascot-6` | Naga Jenius (100⭐) | Buatkan: karakter yang sama pada tahap terakhir, naga kecil yang ramah dan imut (bukan menyeramkan), sisik hijau kebiruan dengan perut krem, sayap kecil, tanduk kecil, senyum lebar, mata besar berbinar. |

---

## BATCH 3 — Kendaraan & Tujuan (20 gambar) · BERIKUTNYA

Untuk `jalan-kendaraan`, yang seluruh isinya kendaraan dan **diperbesar serta
diputar** mengikuti belokan jalan — di sinilah emoji paling ketahuan kasar.

**Aturan khusus kendaraan (WAJIB):**

- **Tampak samping penuh (side view), MENGHADAP KE KIRI.** Roda menempel di
  garis bawah yang tidak digambar, tanpa jalan, tanpa latar, tanpa bayangan.
  Sudut serong dilarang — engine memutar gambar mengikuti arah jalan, jadi
  kendaraan yang digambar serong akan terlihat miring aneh saat menanjak.
- **KIRI, bukan kanan** (dikoreksi 2026-08-04). `PathTrace` memasang
  `scaleX(-1)` sebelum memutar — aturan itu lahir dari emoji kendaraan yang
  menghadap kiri di hampir semua font. Jadi sumber yang menghadap kiri akan
  tampil menghadap kanan di layar dan berjalan maju; sumber yang menghadap
  kanan akan berjalan MUNDUR. Ke-12 aset yang sudah diterima semuanya
  menghadap kiri.
- **TANPA WAJAH.** Kendaraan yang sudah dikirim tidak bermata dan tidak
  bermulut — hanya bodi kartun berkilau. Ini beda dari aturan buah (yang
  memakai "simple happy face"); kendaraan bermata akan terlihat asing di
  antara set yang ada.
- **Bentuk kanvas boleh melebar (16:9), bukan wajib persegi.** Kendaraan itu
  objek lebar; di kanvas persegi separuh gambar jadi ruang kosong dan
  kendaraannya keluar dengan resolusi lebih kecil.
- **PNG transparan lebih baik daripada JPEG.** Kalau terpaksa JPEG, pastikan
  benar-benar **tanpa bayangan lembut di bawah roda** — bayangan itu tidak
  ikut terbuang saat latar putih dihapus dan tertinggal jadi noda putih di
  atas aspal (kejadian di bus sekolah, 2026-08-04).

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `car` | mobil | Buatkan: mobil sedan kecil warna merah, tampak samping penuh menghadap ke kanan, roda hitam, jendela biru muda, imut. |
| `bus` | bus | Buatkan: bus sekolah warna kuning, tampak samping penuh menghadap ke kanan, deretan jendela biru muda, roda hitam, imut. |
| `truck` | truk | Buatkan: truk pengangkut barang warna biru dengan bak kargo, tampak samping penuh menghadap ke kanan, roda hitam besar, imut. |
| `pickup` | mobil bak | Buatkan: mobil bak terbuka (pickup) warna hijau, tampak samping penuh menghadap ke kanan, bak belakang kosong, imut. |
| `tractor` | traktor | Buatkan: traktor pertanian warna hijau dengan roda belakang besar dan roda depan kecil, tampak samping penuh menghadap ke kanan, imut. |
| `bicycle` | sepeda | Buatkan: sepeda anak warna biru dengan dua roda dan keranjang di depan, tampak samping penuh menghadap ke kanan, imut. |
| `scooter` | motor/skuter | Buatkan: sepeda motor skuter warna merah muda, tampak samping penuh menghadap ke kanan, imut. |
| `ambulance` | ambulans | Buatkan: mobil ambulans putih dengan garis merah dan lampu sirene merah di atap, tampak samping penuh menghadap ke kanan, tanpa tulisan apa pun, imut. |
| `firetruck` | mobil pemadam | Buatkan: mobil pemadam kebakaran warna merah dengan tangga di atapnya, tampak samping penuh menghadap ke kanan, tanpa tulisan, imut. |
| `police` | mobil polisi | Buatkan: mobil polisi warna putih-biru dengan lampu sirene biru di atap, tampak samping penuh menghadap ke kanan, tanpa tulisan, imut. |
| `train` | kereta | Buatkan: lokomotif kereta api warna biru dengan cerobong asap, tampak samping penuh menghadap ke kanan, imut. |
| `bajaj` | bajaj | Buatkan: bajaj beroda tiga khas Indonesia warna oranye dengan atap tertutup, tampak samping penuh menghadap ke kanan, imut. |

> ✅ **Ke-12 baris di atas SUDAH diterima & terpasang** (2026-08-04). Baris
> promptnya sengaja dibiarkan apa adanya sebagai arsip — perhatikan bahwa
> semuanya tertulis "menghadap ke kanan", padahal aset yang benar-benar
> dikirim menghadap KIRI. Untuk permintaan baru pakai tabel di bawah, yang
> sudah diperbaiki.

### Kendaraan yang tadinya kurang (4 gambar) — ✅ SELESAI (2026-08-04)

Keempatnya paling sering muncul di kolam perjalanan `jalan-kendaraan` dan
masih memakai emoji. **Warnanya sengaja dipilih yang belum terpakai** di 12
aset yang sudah ada, supaya anak tidak tertukar saat gambarnya cuma setinggi
±50px di layar HP.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
> ✅ **Keempatnya sudah diterima & terpasang** pada percobaan KEDUA, setelah
> lembar acuan gaya dilampirkan. Prompt di bawah adalah versi yang berhasil —
> pakai polanya untuk batch kendaraan berikutnya.
>
> **WAJIB: lampirkan `docs/acuan-gaya-kendaraan.png`** ke chat Gemini sebelum
> meminta keempatnya, dengan kalimat: *"Ikuti gaya persis seperti gambar
> acuan ini — bodi gemuk membulat, kilau lembut, warna cerah, detail sedikit.
> Jangan pakai gaya vektor datar yang realistis."* Percobaan pertama
> (2026-08-04) gagal justru karena ini: promptnya benar, tapi tanpa acuan
> Gemini mengeluarkan clipart vektor realistis yang tak sepadan dengan 12
> aset yang sudah ada. Kata "imut" saja TIDAK cukup.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `jeep` | jip | Buatkan: mobil jip petualang warna cokelat muda cerah, bodi gemuk membulat dengan atap keras, ban hitam besar polos tanpa jeruji, ban serep menempel di pintu belakang, jendela biru muda, kilau lembut, detail sedikit, tampak samping penuh menghadap ke KIRI, tanpa wajah, tanpa tulisan, gaya mainan anak. |
| `taxi` | taksi | Buatkan: mobil taksi sedan warna biru cerah, bodi gemuk membulat, kotak lampu kecil POLOS TANPA TULISAN di atap, jendela biru muda, roda hitam polos, kilau lembut, tampak samping penuh menghadap ke KIRI, tanpa wajah, tanpa tulisan dan tanpa angka apa pun, gaya mainan anak. |
| `motorcycle` | motor | Buatkan: sepeda motor warna merah cerah bergaya mainan anak, bentuk SEDERHANA tanpa detail mesin yang rumit, dua roda hitam polos tanpa jeruji, setang di depan dan jok memanjang, tanpa pengendara, kilau lembut, tampak samping penuh menghadap ke KIRI, tanpa wajah, tanpa tulisan. |
| `racecar` | mobil balap | Buatkan: mobil balap mainan warna ungu cerah, bodi gemuk dan PENDEK (bukan mobil formula yang panjang rendah), sayap spoiler kecil di belakang, ban hitam polos, kilau lembut, tampak samping penuh menghadap ke KIRI, tanpa wajah, tanpa tulisan dan tanpa angka, gaya mainan anak. |

**Kenapa warna & bentuknya begitu — jangan diubah tanpa alasan:**

| Aset baru | Harus jelas beda dari | Pembedanya |
|---|---|---|
| `jeep` cokelat muda | `pickup` hijau, `car` merah | Cokelat belum dipakai; ban serep di belakang jadi penanda. Hijau sudah dipakai pikap DAN traktor. **Harus cokelat MUDA CERAH** — percobaan pertama memakai khaki gelap dan di layar 50px jadi blok gelap yang tak terbaca. |
| `taxi` biru | `truck`/`train` biru, `car` merah | Sama-sama biru tapi siluetnya sedan rendah, bukan truk/lokomotif. Kotak lampu di atap jadi penanda taksi tanpa perlu tulisan. |
| `motorcycle` merah | `scooter` merah muda, `bicycle` biru | Motor sport: mesin terlihat, roda tebal, bodi condong. Skuter: rangka rendah tempat kaki. Merah aman — tak ada kendaraan roda dua lain yang merah. |
| `racecar` ungu | `car` merah, `firetruck` merah | Ungu sama sekali belum dipakai di set ini. Mobil balap merah akan tertukar dengan sedan merah pada ukuran kecil. |

**Taksi biru itu disengaja** — taksi di Indonesia identik biru, jadi anak
Indonesia langsung mengenalinya. Taksi kuning kotak-kotak ala Amerika akan
bertabrakan dengan bus kuning, dan pola kotak-kotaknya terbaca seperti tulisan
pada ukuran kecil.

#### Percobaan pertama DITOLAK (2026-08-04) — jangan ulangi

Kiriman pertama keempat kendaraan ini ditolak. Arah hadapnya sudah benar
(kiri), tapi:

1. **Gaya tidak sepadan.** Hasilnya clipart vektor datar berproporsi
   realistis (jip Wrangler, motor cruiser, mobil F1) — garis tipis, tanpa
   kilau, detail banyak. Set yang ada bergaya mainan: bodi gemuk, kilau
   lembut, detail sedikit. → **Solusi: lampirkan lembar acuan gaya.**
2. **Detail halus jadi bubur di 50px.** Jeruji roda, sirip mesin motor, dan
   gril jip semuanya hilang. Minta ban POLOS dan bentuk SEDERHANA.
3. **Warna gelap tidak terbaca.** Khaki gelap dan ungu tua jadi blok gelap.
   Selalu minta versi CERAH.
4. **Masih ada tulisan "TAXI"** walau prompt sudah minta tanpa tulisan —
   model suka menambahkan label pada kendaraan yang "butuh" identitas. Tegaskan
   dua kali: *"kotak lampu POLOS TANPA TULISAN"* dan *"tanpa tulisan dan tanpa
   angka apa pun"*.
5. **Mobil balap terlalu panjang** (rasio 3,1:1; kendaraan lain ±1,8:1).
   Mobil formula realistis terlihat pipih di jalan dan janggal saat diputar
   mengikuti tikungan. Minta mobil balap MAINAN yang pendek dan gemuk.
6. **PNG tanpa kanal alpha.** Filenya PNG tapi pola kotak-kotak transparansi
   tergambar sebagai piksel biasa. Masih bisa dibuang (netral & saturasi
   rendah — lihat "Kasus khusus latar checkerboard" di
   `asset-generation-prompts.md`), tapi PNG ber-alpha asli lebih aman.

Bangunan & tempat tujuan di ujung jalan (dan dipakai juga di soal huruf).
**Tampak depan**, seluruh bangunan masuk, tanpa jalan dan tanpa latar langit:

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `house` | rumah | Buatkan: rumah kecil tampak depan, dinding krem, atap merah, satu pintu coklat dan dua jendela biru, imut. (Menggantikan aset rumah lama.) |
| `school` | sekolah | Buatkan: gedung sekolah tampak depan, dinding kuning muda, atap merah, jam bulat sederhana di atas pintu, tiang bendera kecil di samping, tanpa tulisan apa pun, imut. |
| `hospital` | rumah sakit | Buatkan: gedung rumah sakit tampak depan, dinding putih, atap biru, satu tanda palang merah besar di dinding, tanpa tulisan, imut. |
| `shop` | toko/warung | Buatkan: toko kecil tampak depan dengan tenda garis merah-putih di atas etalase, dinding krem, tanpa tulisan, imut. |
| `gas-station` | pom bensin | Buatkan: pompa bensin tampak depan, badan merah dengan selang hitam melingkar, atap kanopi kecil, tanpa tulisan atau angka, imut. |
| `farm` | sawah | Buatkan: petak sawah hijau dengan rumpun padi kuning keemasan berbaris dan gundukan tanah kecil, imut. |
| `tree` | pohon | Buatkan: satu pohon rindang dengan batang coklat dan mahkota daun hijau bulat, imut. |
| `park` | taman | Buatkan: taman bermain kecil berisi satu bangku taman dan satu pohon kecil di atas petak rumput hijau, imut. |

---

## BATCH 4 — Benda Sehari-hari (20 gambar)

Ini isi soal huruf & ejaan (Taman Huruf, Kenal Huruf, Suku Kata, Ejaan Jitu,
Pasang Kata), dan di sana gambar tampil sebagai **cue tunggal besar di tengah
layar** — jadi kualitasnya paling terlihat.

**Aturan khusus batch ini:** benda mati **TANPA wajah** (beda dari buah), karena
di soal ejaan anak harus menebak nama bendanya — wajah malah mengalihkan
perhatian. Bentuknya harus versi paling umum dan paling gampang dikenali.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `ball` | bola | Buatkan: bola sepak hitam-putih, tanpa wajah. |
| `book` | buku | Buatkan: satu buku tertutup dengan sampul biru dan halaman putih terlihat di sisinya, sedikit miring, tanpa tulisan di sampul, tanpa wajah. |
| `pencil` | pensil | Buatkan: satu pensil kayu kuning dengan ujung runcing hitam dan penghapus merah muda di ujung lain, posisi diagonal, tanpa wajah. |
| `bag` | tas sekolah | Buatkan: tas ransel sekolah warna merah dengan dua tali bahu dan satu kantong depan, tampak depan, tanpa tulisan, tanpa wajah. |
| `key` | kunci | Buatkan: satu anak kunci logam warna emas dengan kepala bulat, posisi diagonal, tanpa wajah. |
| `umbrella` | payung | Buatkan: payung terbuka bergaris warna merah dan biru dengan gagang melengkung coklat, tanpa wajah. |
| `shoe` | sepatu | Buatkan: satu sepatu kets anak warna biru dengan tali putih, tampak samping, tanpa wajah. |
| `chair` | kursi | Buatkan: satu kursi kayu sederhana dengan sandaran, tampak tiga perempat, tanpa wajah. |
| `door` | pintu | Buatkan: satu pintu kayu coklat tertutup dengan gagang bulat emas, tampak depan, tanpa wajah. |
| `milk` | susu | Buatkan: satu gelas kaca berisi susu putih penuh, tampak depan, tanpa wajah. |
| `egg` | telur | Buatkan: satu butir telur ayam putih utuh berdiri, tanpa wajah, tanpa retakan. |
| `bread` | roti | Buatkan: satu roti tawar bulat panjang warna coklat keemasan, tampak samping, tanpa wajah. |
| `rice` | nasi | Buatkan: satu mangkuk putih berisi nasi putih menggunung, tampak depan, tanpa wajah. |
| `balloon` | balon | Buatkan: satu balon merah berbentuk tetes dengan tali putih melengkung di bawahnya, tanpa wajah. |
| `doll` | boneka | Buatkan: boneka beruang coklat duduk dengan pita merah di leher, mata kancing hitam, imut. |
| `flower` | bunga | Buatkan: satu bunga dengan lima kelopak merah muda, tengahnya kuning, tangkai hijau dengan dua daun, tanpa wajah. |
| `moon` | bulan | Buatkan: bulan sabit warna kuning muda dengan beberapa bintang kecil di sekitarnya, tanpa wajah. |
| `cloud` | awan | Buatkan: satu awan putih gembul dengan garis tepi hitam tebal, tanpa wajah. |
| `carrot` | wortel | Buatkan: satu wortel oranye dengan daun hijau di atasnya, posisi tegak, tanpa wajah. |
| `corn` | jagung | Buatkan: satu buah jagung kuning dengan kulit daun hijau terbuka sebagian, posisi tegak, tanpa wajah. |

---

## BATCH 5 — Benda yang paling sering muncul (25 gambar) · BERIKUTNYA

Daftar ini bukan tebakan: seluruh config game di-bundle lalu data levelnya
ditelusuri (semua varian tiap slot, bukan cuma yang keluar satu sesi) untuk
mencari emoji yang belum punya pasangan id gambar. Yang di batch ini adalah
yang **muncul di beberapa game sekaligus** dan menjadi **subjek soal** — anak
harus mengenali bendanya untuk bisa menjawab.

Kenapa ini yang didahulukan: sekarang benda yang sama bisa tampil bergambar di
satu game dan emoji di game lain (mis. ikan). Itu terlihat seperti dua benda
berbeda, dan justru mencolok di game membaca.

Kendaraan (`motorcycle`, `ship`, `plane`) ikut aturan khusus Batch 3, dengan
satu koreksi penting di bawah tabel.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `fish` | ikan | Buatkan: satu ikan oranye tampak samping menghadap ke kiri, sirip dan ekor jelas, mata besar ramah, imut. |
| `ship` | kapal | Buatkan: kapal laut warna putih-biru dengan cerobong merah, tampak samping penuh menghadap ke kiri, mengapung tanpa air digambar, imut. |
| `motorcycle` | motor | Buatkan: sepeda motor bebek warna biru, tampak samping penuh menghadap ke kiri, roda hitam, imut. |
| `plane` | pesawat | Buatkan: pesawat terbang penumpang warna putih-merah, tampak samping penuh menghadap ke kiri, sayap dan ekor jelas, imut. |
| `leaf` | daun | Buatkan: satu helai daun hijau dengan tulang daun terlihat dan tangkai pendek, posisi diagonal, tanpa wajah. |
| `rain` | hujan | Buatkan: satu awan abu-abu muda dengan beberapa tetes air biru jatuh di bawahnya, tanpa wajah. |
| `sea` | laut | Buatkan: gelombang ombak laut biru dengan buih putih di puncaknya, tanpa perahu, tanpa wajah. |
| `mountain` | gunung | Buatkan: dua gunung hijau bersebelahan dengan puncak putih, tanpa matahari, tanpa awan, tanpa wajah. |
| `beach` | pantai | Buatkan: sepotong pantai berpasir kuning dengan satu pohon kelapa dan garis ombak biru kecil, tanpa wajah. |
| `river` | sungai | Buatkan: sungai biru berkelok di antara dua tepi rumput hijau, tampak dari atas-samping, tanpa jembatan, tanpa wajah. |
| `city` | kota | Buatkan: deretan tiga gedung bertingkat warna abu-abu dan biru dengan banyak jendela kecil, tampak depan, tanpa tulisan, tanpa wajah. |
| `honey` | madu | Buatkan: satu toples kaca berisi madu kuning keemasan dengan tutup kain kotak-kotak merah, tanpa tulisan, tanpa wajah. |
| `shirt` | baju | Buatkan: satu kaos anak lengan pendek warna biru, tampak depan terbentang, tanpa tulisan atau gambar di dadanya, tanpa wajah. |
| `pants` | celana | Buatkan: satu celana panjang anak warna biru denim, tampak depan terbentang, tanpa wajah. |
| `crocodile` | buaya | Buatkan: buaya hijau tampak samping menghadap ke kiri, moncong panjang dengan gigi kecil, ekspresi ramah, imut. |
| `octopus` | gurita | Buatkan: gurita ungu dengan delapan tentakel, mata besar ramah, tampak depan, imut. |
| `cucumber` | timun | Buatkan: satu buah mentimun hijau utuh, posisi diagonal, tanpa wajah. |
| `lamp` | lampu | Buatkan: satu bola lampu pijar menyala warna kuning dengan ulir logam abu-abu, tanpa wajah. |
| `crayon` | krayon | Buatkan: satu krayon warna merah dengan pembungkus kertas, ujung tumpul, posisi diagonal, tanpa tulisan, tanpa wajah. |
| `pen` | pena | Buatkan: satu pulpen warna biru dengan tutup dan penjepit, posisi diagonal, tanpa tulisan, tanpa wajah. |
| `ruler` | penggaris | Buatkan: satu penggaris lurus warna kuning transparan dengan garis-garis ukur kecil di tepinya, posisi diagonal, tanpa angka, tanpa wajah. |
| `scissors` | gunting | Buatkan: satu gunting dengan bilah logam abu-abu dan pegangan merah, posisi terbuka sedikit, tanpa wajah. |
| `cookie` | kue | Buatkan: satu kue kering bulat warna coklat muda dengan butiran coklat, tanpa wajah. |
| `grass` | rumput | Buatkan: seikat rumput hijau segar dengan beberapa helai daun panjang, tanpa tanah, tanpa wajah. |
| `window` | jendela | Buatkan: satu jendela kayu coklat dengan empat kaca biru muda dan daun jendela terbuka, tampak depan, tanpa wajah. |

**KOREKSI ARAH KENDARAAN (berlaku juga untuk Batch 3 ke depan).** Batch 3
tertulis "menghadap ke KANAN", tapi aset yang benar-benar dipakai sekarang
**menghadap KIRI** (lihat `car.webp`), dan itu yang cocok dengan engine:
`PathTrace` mencerminkan gambar dengan `scaleX(-1)` sebelum memutarnya
mengikuti arah jalan. Kendaraan baru **wajib menghadap kiri** — kalau
menghadap kanan, di dalam game ia akan berjalan mundur.

**Jebakan nama:** `glass` (gelas) belum ada di batch ini karena `milk` sudah
berupa gelas berisi susu. Kalau nanti dibuat, gelasnya harus **kosong atau
berisi air bening** — satu gambar tidak boleh punya dua arti.

---

## BATCH 6 — Alat musik (5 gambar)

Dipakai slot "alat musik & mainan" di Pasang Kata dan Pasangan Pintar. Emoji
alat musik termasuk yang paling sering salah dikenali anak (🎺 terompet pernah
tertukar dengan seruling di config lama).

Benda mati, **tanpa wajah**, tampak depan/samping paling khas.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `guitar` | gitar | Buatkan: satu gitar akustik kayu coklat dengan lubang suara bulat dan enam senar, tampak depan, tanpa wajah. |
| `drum` | drum | Buatkan: satu drum tabung merah-putih dengan dua stik kayu bersilang di atasnya, tampak depan, tanpa wajah. |
| `trumpet` | terompet | Buatkan: satu terompet kuningan mengilap dengan corong lebar dan tiga tombol, tampak samping, tanpa wajah. |
| `piano` | piano | Buatkan: satu piano kecil warna hitam dengan tuts putih dan hitam terlihat jelas, tampak depan, tanpa wajah. |
| `violin` | biola | Buatkan: satu biola kayu coklat dengan empat senar dan penggeseknya di samping, tampak depan, tanpa wajah. |

---

## BATCH 7 — Profesi & alatnya (13 gambar) — `wrench` PALING DICARI

> **2026-09-03**: kartu "kunci" di Pasangan Pintar (soal montir) dulu memakai
> gambar kunci PINTU (`key`) — salah, dan pemilik menandainya lewat tangkapan
> layar. Kode sudah dialihkan ke id `wrench` (jatuh ke emoji 🔧 sampai
> gambarnya ada) — begitu `wrench.png` dikirim, ini yang paling cepat
> terlihat bedanya.

Satu slot utuh di Pasangan Pintar (profesi ↔ alat kerjanya) yang **seluruhnya**
masih emoji. Emoji orang (👩‍⚕️👨‍🍳🧑‍🔧) adalah yang paling tidak konsisten antar HP —
sebagian Android bahkan tidak punya emoji profesi gabungan dan menampilkannya
sebagai dua gambar terpisah atau kotak kosong.

**Aturan khusus batch ini:** orang digambar **setengah badan tampak depan**,
ramah, dengan seragam/atribut yang menjelaskan profesinya, **tanpa memegang
alat kerjanya** — alat itu jadi kartu jawaban terpisah, jadi kalau orangnya
sudah memegang alat, jawabannya bocor.

> **2026-09-05, setelah 11 gambar masuk — dua pelajaran:**
>
> - **"Tanpa memegang" saja tidak cukup: alatnya juga tak boleh DIPAKAI.**
>   `doctor` yang sudah masuk MEMAKAI stetoskop di leher sementara pasangannya
>   memang kotak "stetoskop" — jawabannya tetap bocor. Pemilik memilih
>   memakainya dulu karena emoji lamanya juga begitu (jadi bukan kemunduran),
>   tapi untuk gambar berikutnya sebut eksplisit benda yang dilarang: pelukis
>   **tanpa kuas DAN tanpa palet**, dokter **tanpa stetoskop di leher**.
> - **Sebut bentuk alatnya, jangan cuma namanya.** Kartu montir dulu memakai
>   gambar kunci PINTU. Karena itu baris `wrench` sekarang menyebut "dua ujung
>   terbuka berbentuk U" — tanpa itu yang keluar gampang jadi kunci inggris,
>   benda yang berbeda lagi.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `doctor` | dokter | Buatkan: dokter perempuan setengah badan tampak depan, jas putih, tersenyum ramah, tanpa memegang alat apa pun, imut. |
| `stethoscope` | stetoskop | Buatkan: satu stetoskop dokter warna biru dengan kepala logam bulat, tanpa wajah. |
| `teacher` | guru | Buatkan: guru perempuan setengah badan tampak depan, baju rapi, tersenyum ramah, tanpa memegang apa pun, imut. |
| `chef` | koki | Buatkan: koki laki-laki setengah badan tampak depan, topi koki putih tinggi dan baju koki putih, tersenyum, tanpa memegang alat, imut. |
| `pan` | wajan | Buatkan: satu wajan penggorengan hitam dengan gagang panjang, tampak sedikit dari atas, tanpa isi, tanpa wajah. |
| `farmer` | petani | Buatkan: petani laki-laki setengah badan tampak depan, topi caping anyaman dan baju lengan panjang, tersenyum ramah, tanpa memegang alat, imut. |
| `hoe` | cangkul | Buatkan: satu cangkul dengan gagang kayu panjang dan mata logam abu-abu, posisi diagonal, tanpa wajah. |
| `police-officer` | polisi | Buatkan: polisi laki-laki setengah badan tampak depan, seragam coklat dan topi polisi, tersenyum ramah, tanpa tulisan di seragam, imut. |
| `firefighter` | pemadam kebakaran | Buatkan: petugas pemadam kebakaran setengah badan tampak depan, helm merah dan jaket kuning bergaris pantul, tersenyum, tanpa memegang selang, imut. |
| `mechanic` | montir | Buatkan: montir laki-laki setengah badan tampak depan, baju kerja biru dan topi, tersenyum ramah, tanpa memegang alat, imut. |
| `wrench` | kunci pas | Buatkan: satu kunci pas logam abu-abu dengan dua ujung terbuka berbentuk U, posisi diagonal, tampak datar dari samping, seluruh alat masuk penuh, tanpa wajah, tanpa tangan yang memegang. |
| `painter` | pelukis | Buatkan: pelukis perempuan setengah badan tampak depan, memakai celemek dan baret, tersenyum ramah, kedua tangan di depan badan, tanpa memegang kuas, tanpa palet, tanpa alat apa pun, imut. |
| `brush` | kuas | Buatkan: satu kuas lukis dengan gagang kayu dan bulu kuas berwarna, ujungnya berlumur cat merah, posisi diagonal, tanpa wajah. |

> `police-officer` sengaja BUKAN `police` — id `police` sudah dipakai untuk
> **mobil** polisi di Jalan Kendaraan.

---

## BATCH 8 — Hewan & rumahnya (8 gambar)

Slot "hewan ↔ tempat tinggalnya" di Pasangan Pintar. Sebagian pasangannya sudah
punya seni (kucing, kambing, ikan lewat Batch 5), tinggal sisanya.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `bird` | burung | Buatkan: satu burung kecil warna biru dengan paruh oranye, tampak samping menghadap ke kiri, mata besar ramah, imut. |
| `nest` | sarang | Buatkan: satu sarang burung dari ranting coklat berisi dua telur putih kecil, tampak depan, tanpa burung, tanpa wajah. |
| `spider` | laba-laba | Buatkan: satu laba-laba hitam kecil dengan delapan kaki dan mata besar ramah, tampak depan, imut. |
| `web` | jaring laba-laba | Buatkan: satu jaring laba-laba putih berbentuk lingkaran dengan benang halus, tanpa laba-laba, tanpa wajah. |
| `camel` | unta | Buatkan: unta coklat berpunuk satu, tampak samping menghadap ke kiri, mata besar ramah, imut. |
| `desert` | gurun | Buatkan: gurun pasir kuning dengan dua bukit pasir dan satu kaktus hijau, tanpa matahari, tanpa wajah. |
| `pond` | kolam | Buatkan: satu kolam air biru berbentuk bulat dengan tepi rumput hijau dan satu daun teratai, tanpa ikan, tanpa wajah. |
| `snow` | salju | Buatkan: satu butir kepingan salju putih-biru muda berujung enam, tanpa wajah. |

---

## BATCH 9 — Benda sisa (18 gambar)

Nilai per gambarnya paling kecil (rata-rata muncul sekali), tapi kalau batch ini
selesai, **tidak ada lagi benda yang tampil sebagai emoji** di soal mana pun.
Benda mati, tanpa wajah.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
| `kite` | layang-layang | Buatkan: satu layang-layang belah ketupat warna merah-kuning dengan ekor pita panjang, tanpa wajah. |
| `puzzle` | puzzle | Buatkan: satu keping puzzle warna biru, tampak depan, tanpa wajah. |
| `glass` | gelas | Buatkan: satu gelas kaca bening berisi air putih, tampak depan, tanpa wajah. |
| `plate` | piring | Buatkan: satu piring makan putih bulat dengan tepi biru, tampak sedikit dari atas, kosong, tanpa wajah. |
| `spoon` | sendok | Buatkan: satu sendok makan logam mengilap, posisi diagonal, tanpa wajah. |
| `candy` | permen | Buatkan: satu permen bulat merah dengan bungkus plastik terpuntir di kedua ujungnya, tanpa wajah. |
| `donut` | donat | Buatkan: satu donat dengan lapisan gula merah muda dan taburan warna-warni, tampak depan, tanpa wajah. |
| `sunflower` | bunga matahari | Buatkan: satu bunga matahari dengan kelopak kuning dan tengah coklat, tangkai hijau dengan dua daun, tanpa wajah. |
| `tulip` | bunga tulip | Buatkan: satu bunga tulip merah dengan tangkai hijau dan dua daun panjang, tanpa wajah. |
| `shell` | kerang | Buatkan: satu kerang laut warna merah muda berbentuk kipas dengan garis-garis, tampak depan, tanpa wajah. |
| `fridge` | kulkas | Buatkan: satu kulkas dua pintu warna putih dengan gagang abu-abu, tampak depan, tertutup, tanpa tulisan, tanpa wajah. |
| `wardrobe` | lemari | Buatkan: satu lemari pakaian kayu coklat dua pintu dengan gagang bulat, tampak depan, tertutup, tanpa wajah. |
| `trash` | tempat sampah | Buatkan: satu tempat sampah hijau dengan tutup dan pegangan, tampak depan, tertutup, tanpa wajah. |
| `jacket` | jaket | Buatkan: satu jaket anak warna merah dengan resleting depan, tampak depan terbentang, tanpa wajah. |
| `coconut` | kelapa | Buatkan: satu buah kelapa utuh warna coklat berserat, tanpa wajah. |
| `road` | jalan raya | Buatkan: sepotong jalan raya aspal abu-abu dengan garis putus-putus putih di tengah, tepinya rumput hijau, tampak dari depan-atas seperti jalan menjauh, **tanpa rambu, tanpa papan nama, tanpa tulisan apa pun**, tanpa kendaraan, tanpa wajah. |
| `bookshelf` | rak buku | Buatkan: satu rak buku kayu coklat dua tingkat berisi beberapa buku warna-warni berdiri, tampak depan, tanpa tulisan di punggung buku, tanpa wajah. |
| `litter` | sampah | Buatkan: satu gumpalan kertas kusut warna putih keabuan, tanpa wajah. |

---

## Yang Sengaja TIDAK Perlu Digambar

Supaya tidak terbuang membuat gambar yang tak akan dipakai:

- **Titik warna keranjang** 🔴🟢🟡🟣🟠 di Pasar Buah — itu label warna, bukan
  subjek soal. Membesarkannya justru membuat layar 360×640 ikut scroll.
- **Huruf & angka** (Kenal Huruf, Tulis Angka, Tulis Huruf) — engine
  menggambarnya sendiri sebagai goresan tulisan tangan, dan itu memang harus
  begitu supaya bentuk panduannya benar.
- **Simbol** ⭐ 🎉 ➕ dan ikon kartu game di portal.
- **Tujuan hiasan di Jalan Kendaraan** (halte, pabrik, gedung, istana,
  jembatan, tugu, ±25 buah) — itu cuma titik akhir jalan, bukan yang
  ditanyakan. Kerjakan paling akhir kalau masih ada tenaga.
- **Adegan cerita** (Cerita Nusantara / Si Kancil) — emoji di sana adalah
  ilustrasi halaman cerita, bukan benda yang ditanyakan. Menggambarnya butuh
  fitur engine baru (gambar per halaman cerita) dan gaya yang berbeda
  (pemandangan, bukan objek tunggal) — bahas terpisah kalau mau.

---

## Ringkasan Jumlah

| Batch | Isi | Jumlah | Kenapa penting |
|---|---|---|---|
| 1 | Buah | 14 | Dipakai 5 tipe soal di Pasar Buah + 4 game lain |
| 2 | Maskot | 6 | Dilihat tiap buka portal & tiap tamat game; identitas produk |
| 3 | Kendaraan & tujuan | 20 | Seluruh isi Jalan Kendaraan; gambar diperbesar & diputar |
| 4 | Benda sehari-hari | 20 | Cue besar di semua game huruf & ejaan |
| 5 | Benda paling sering muncul | 25 | Muncul di beberapa game; sekarang emoji di satu game & bergambar di game lain |
| 6 | Alat musik | 5 | Emoji alat musik paling sering salah dikenali |
| 7 | Profesi & alatnya | 13 | Satu slot utuh Pasangan Pintar; emoji orang paling tidak konsisten antar HP |
| 8 | Hewan & rumahnya | 8 | Melengkapi slot pasangan hewan–tempat tinggal |
| 9 | Benda sisa | 15 | Menutup sisa emoji terakhir di semua soal |
| | **Total** | **126** | |
