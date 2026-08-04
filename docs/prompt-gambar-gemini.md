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

### Kendaraan yang MASIH KURANG (4 gambar) · giliran berikutnya

Keempatnya paling sering muncul di kolam perjalanan `jalan-kendaraan` dan
masih memakai emoji. **Warnanya sengaja dipilih yang belum terpakai** di 12
aset yang sudah ada, supaya anak tidak tertukar saat gambarnya cuma setinggi
±50px di layar HP.

| id (nama file) | Objek | Baris prompt untuk dikirim |
|---|---|---|
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

## Batch Menyusul (belum mendesak)

Untuk kelompok SD, yang baru dirilis setelah TK sukses launching:

- **Profesi** (Pasangan Pintar): dokter, polisi, guru, koki, petani, pemadam
  kebakaran, tukang cukur, sopir. Emoji orang (👩👨🧑) adalah yang paling tidak
  konsisten antar HP, jadi ini akan terasa besar — tapi tunggu TK beres dulu.
- **Alat musik & benda sekolah tambahan**: gitar, drum, penggaris, penghapus,
  krayon.
- **Latar cerita** (Cerita Nusantara / Si Kancil): butuh fitur engine baru
  (gambar latar per halaman cerita), bukan sekadar aset — bahas terpisah kalau
  mau.

---

## Ringkasan Jumlah

| Batch | Isi | Jumlah | Kenapa penting |
|---|---|---|---|
| 1 | Buah | 14 | Dipakai 5 tipe soal di Pasar Buah + 4 game lain |
| 2 | Maskot | 6 | Dilihat tiap buka portal & tiap tamat game; identitas produk |
| 3 | Kendaraan & tujuan | 20 | Seluruh isi Jalan Kendaraan; gambar diperbesar & diputar |
| 4 | Benda sehari-hari | 20 | Cue besar di semua game huruf & ejaan |
| | **Total** | **60** | |
