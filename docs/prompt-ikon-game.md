# Prompt Ikon Kartu Game

Sasaran: `GameMeta.pic` di `src/games/registry.ts` → file `public/assets/games/<id>.webp`.
Ikon ini dipakai DUA tempat sekaligus (kartu portal + layar intro), jadi satu file cukup.

## Status (2026-09-03) — SELESAI

**Ke-19 game sudah bergambar; tak ada lagi ikon emoji.** Terakhir masuk: `rute-kendaraan`
(jalan berkelok S + rambu berwajah imut), game SD baru yang sengaja dibuat "Jalan
Kendaraan tapi lebih sulit" — ikonnya sengaja BUKAN mobil, supaya tak tertukar dengan
ikon Jalan Kendaraan (mobil merah) walau judulnya mirip. Sebelum itu: `pola-pintar`
(ulat berbuku-buku), game SD yang ditambahkan belakangan (`77b9ca6`) sesudah batch ikon
lainnya selesai.

Jumlahnya 18, bukan 19, karena Cerita Nusantara dilebur ke Cerita Anak menjadi satu game
**"Baca Cerita"** (`d526672`).

`emoji` di registry tetap diisi semua — itu cadangan kalau file gagal dimuat, bukan sisa
yang boleh dibersihkan.

**`public/assets/games/cerita-nusantara.webp` kini YATIM** akibat peleburan itu — tak
dirujuk `pic` mana pun. Jangan buru-buru dihapus: ikon itu buku tertutup bermotif batik
**tanpa tulisan**, sedangkan ikon `cerita-kancil` yang masih terpakai justru bermasalah
(sampulnya bertulisan Inggris "My Story Adventures"). Memindahnya ke `cerita-kancil.webp`
menyelesaikan dua hal sekaligus tanpa menggambar apa pun. Baris prompt untuk menggambar
ikon baru tetap ada di `prompt-ikon-cerita-anak.md` kalau pemilik lebih suka gambar segar.

`emoji` di registry tetap diisi semua — itu cadangan kalau file gagal dimuat, bukan sisa yang
boleh dibersihkan.

`jam-pintar` tidak lagi memakai `iconClock` — barisnya dihapus dari registry karena ia menang
atas `pic`. Syaratnya tetap dipenuhi (muka jam berangka 1–12 lengkap & urut). Jam di dalam
SOAL tetap `Clock.tsx` dan tidak tersentuh.

Dokumen ini tetap berguna kalau nanti ada game baru atau ikon lama diganti — blok gaya, ekor
prompt, dan lima pelajarannya berlaku untuk ikon mana pun.

---

## DUA PELAJARAN DARI PERCOBAAN PERTAMA (2026-09-02) — jangan diulang

Percobaan pertama `pasang-kata` menghasilkan gambar yang **karakternya sudah benar**
(kawaii, peach & mint, outline coklat lembut, mata berkilau, pipi merona) tapi gagal di
tujuh hal sekaligus: ada tulisan **"Kiri"** dan **"Kanan"** di badan puzzle, latar kamar
tidur blur berbokeh, ada bingkai kartu, rasio 16:9, ada bayangan lantai, bintangnya ~10,
dan kilau glitter ala foto.

1. **Kata penunjuk LETAK ikut tertulis di gambar.** Baris promptnya menyebut "keping kiri
   warna peach dan keping kanan warna mint" — dan Gemini menuliskan "Kiri"/"Kanan" di
   badan puzzle-nya. Padahal sisi mana yang peach tidak penting sama sekali.
   **Aturan: jangan pernah menyebut kiri/kanan/atas/bawah kalau tidak benar-benar perlu.**
   Kalau terpaksa perlu, tulis "di sisi yang satu … di sisi lainnya".
2. **Blok gaya di awal chat TIDAK bertahan.** Gaya visualnya diikuti, tapi aturan teknis
   (latar, rasio, bingkai, bayangan) dilupakan mulai gambar pertama.
   **Aturan: tempel EKOR PROMPT di bawah ini pada SETIAP pesan**, jangan mengandalkan
   blok gaya awal saja.

Risiko turunannya: **objek yang biasanya bertuliskan sesuatu di dunia nyata akan diberi
tulisan** — sampul buku dapat judul, balon ucapan dapat kalimat, papan dapat label. Objek
seperti itu wajib diberi "polos, tanpa judul, tanpa tulisan" di baris promptnya sendiri.

## PELAJARAN KETIGA (percobaan kedua, 2026-09-02)

Percobaan kedua lolos semua aturan di atas — nol tulisan liar, latar putih, persegi, tanpa
bingkai. `pasang-kata` langsung terpakai. Tapi `hitung-hebat` gagal karena hal baru:

3. **WAJAH DAN ANGKA/HURUF TIDAK BOLEH BERBAGI PERMUKAAN YANG SAMA.** Mata, pipi, dan senyum
   balok digambar tepat menimpa angka 3, jadi angkanya pudar dan setengah terhapus. Di kartu
   portal balok itu cuma setinggi ±24px — angkanya terbaca sebagai noda. Padahal angka itu
   INTI ikonnya. **Aturan: kalau objeknya membawa angka/huruf yang harus terbaca, sebutkan
   posisi angka dan posisi wajah secara terpisah, dan tegaskan keduanya tidak menimpa.**
   Jam Pintar aman dari ini (angka melingkar di pinggir, wajah di tengah), tapi apa pun yang
   berupa balok/kartu/papan berangka wajib diberi kalimat pemisah itu.

## PELAJARAN KEEMPAT & KELIMA (batch terakhir, 2026-09-02)

Batch terakhir (jam, pulpen, dua lingkaran, papan target) lolos semua aturan gaya, tapi dua
hal baru muncul di tahap POTONG dan tahap PASANG — bukan di tahap prompt:

4. **Latar putih yang TERKURUNG artwork tetap buram.** Lubang huruf "a" di ikon Tulis Huruf
   tidak terjangkau flood-fill dari tepi, jadi di atas latar berwarna tampak sebagai
   gumpalan putih, bukan huruf. Ini jebakan yang memang sudah tertulis di kepala
   `cut-item.py` (dan sengaja begitu — garis putih di sayap jalak harus selamat).
   **Aturan: sesudah memotong, SELALU tempel hasilnya di atas latar berwarna dan lihat.**
   Lubang yang perlu ditembus dikerjakan manual per gambar, jangan diotomatiskan.
   Objek yang rawan: huruf berlubang (a, e, o, d, p), angka 0/6/8/9, gembok, cincin.

5. **Ikon jangan lebih lebar dari rasio ±1,5.** `GameIcon` mengukur lewat TINGGI
   (`width: auto`), dan kotak isi kartu portal cuma **±116px** di HP 360px. Pasangan Pintar
   rasionya 2,08 → dirender 150px dan meluber keluar kartunya. Rekor lama cuma 1,50
   (`kartu-kembar`, 108px) — jadi selama ini pas-pasan aman tanpa ada yang sadar.
   Sekarang `GameIcon` punya `maxWidth: 100%` sebagai pengaman, tapi ikon yang kena
   pengaman itu dirender lebih pendek dari 72px. **Lebih baik dicegah di prompt: minta
   objeknya berdekatan/menumpuk, jangan berjajar melebar.**

### Yang TIDAK perlu dikhawatirkan (sudah diukur, jangan "diperbaiki")

- **Rasio menjulang itu aman.** Sempat dikira susunan tiga balok bertumpuk bermasalah karena
  `GameIcon` mengukur lewat TINGGI (`width: auto`). Terukur rasio isinya 0,71 — masih di dalam
  rentang ikon yang sudah ada (0,54 `tulis-angka` sampai 1,50 `kartu-kembar`). Tak perlu
  memaksa komposisi jadi melebar.
- **Garis putih tipis mengelilingi objek** (khas stiker die-cut) tidak jadi masalah: warnanya
  putih dan menyatu dengan latar, jadi ikut terbuang flood-fill sampai mentok ke outline
  coklatnya.

---

## BLOK GAYA (tempel sekali di awal chat Gemini)

> Kamu akan membantuku membuat ikon untuk game edukasi anak usia 4–8 tahun.
> Semua ikon HARUS mengikuti aturan gaya yang sama persis:
>
> - Gaya kartun **kawaii** yang imut dan ramah anak, sticker style, ilustrasi datar.
> - Warna **PASTEL lembut** (peach, mint, biru muda, kuning krem, ungu muda),
>   shading halus, tanpa gradasi metalik, tanpa tekstur realistis.
> - Outline **tebal tapi lembut berwarna coklat/krem tua** — bukan hitam pekat.
> - Objek utamanya **berwajah imut**: mata besar berkilau, pipi merona, senyum kecil.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa bingkai, tanpa pola.
> - **Hanya SATU objek utama** di tengah. Hiasan kecil (bintang, percikan) boleh,
>   tapi jangan ramai.
> - **Tanpa teks, tanpa tulisan, tanpa watermark.** Pengecualian hanya kalau
>   huruf/angka itu memang BENTUK objeknya.
> - Format **persegi (1:1)**, resolusi tinggi.

## EKOR PROMPT (WAJIB ditempel di TIAP pesan, sesudah baris objeknya)

> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa pemandangan, tanpa
> ruangan, tanpa meja, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa
> sudut membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter.
> JANGAN menuliskan kata, huruf, angka, label, judul, atau watermark apa pun di dalam
> gambar. Ilustrasi datar bergaya stiker, bukan foto.

## Baris prompt (kirim SATU per pesan, selalu + EKOR PROMPT)

| id file | Baris prompt |
|---|---|
| `pasang-kata` | Buatkan: dua keping puzzle besar yang saling menyatu, satu keping warna peach dan satunya warna hijau mint, keduanya berwajah imut, dengan tiga bintang kecil pastel di sekitarnya. |
| `hitung-hebat` | Buatkan: tiga balok mainan bertumpuk — balok berangka 1 warna biru muda, balok berangka 2 warna kuning krem, balok berangka 3 warna hijau mint. Angka besar tercetak jelas dan utuh di tengah permukaan tiap balok. Hanya balok paling bawah yang berwajah imut, dan wajahnya digambar KECIL di bagian bawah permukaan balok, di bawah angkanya — wajah dan angka tidak boleh saling menimpa. Tambahkan tiga bintang kecil pastel di sekitarnya. Angka 1, 2, dan 3 harus jelas terbaca; selain ketiga angka itu tidak boleh ada tulisan apa pun. |
| `suku-kata` | Buatkan: satu balon ucapan besar warna biru muda berwajah imut. Bagian dalam balonnya POLOS tanpa kalimat, hanya berisi tiga bulatan kecil berjajar warna peach, kuning, dan mint. Tambahkan tiga bintang kecil pastel di sekitarnya. |
| `ejaan-jitu` | Buatkan: satu papan target bundar pastel berlapis lingkaran merah muda, krem, dan mint, berwajah imut, dengan satu anak panah menancap tepat di titik tengahnya, dikelilingi lima huruf kapital pastel yang beterbangan. Huruf-huruf itu berdiri sendiri-sendiri dan tidak boleh merangkai kata. |
| `pasangan-pintar` | Buatkan: dua lingkaran pastel besar yang dihubungkan satu garis lengkung bertitik-titik — satu lingkaran warna peach berisi gambar bintang kuning, satu lingkaran warna hijau mint berisi gambar hati merah muda — kedua lingkaran berwajah imut. |
| `tulis-huruf` | Buatkan: satu pulpen bertutup warna biru muda berwajah imut dalam posisi miring, sedang menuliskan satu garis tinta biru melengkung yang membentuk huruf a kecil di bawahnya. Selain huruf a itu tidak boleh ada tulisan lain. |
| `cerita-nusantara` | Buatkan: satu buku tertutup bersampul hijau tosca berwajah imut, dengan pita pembatas merah muda menjuntai dari bawahnya dan satu bintang kuning kecil melayang di atasnya. Sampulnya berhias motif batik sederhana warna krem, POLOS tanpa judul dan tanpa tulisan apa pun. |
| `jam-pintar` (opsional) | Buatkan: satu jam dinding bulat pastel berwajah imut, dengan angka 1 sampai 12 tertulis jelas dan urut mengelilingi muka jam, jarum pendek biru tua menunjuk angka 10 dan jarum panjang merah menunjuk angka 2. Selain angka jam itu tidak boleh ada tulisan lain. |
| `pola-pintar` | Buatkan: satu ulat kecil yang lucu dan gemuk, badannya melengkung membentuk busur seperti sedang merayap. Ruas badannya berselang-seling mengikuti pola: hijau mint, kuning krem, hijau mint, kuning krem — lalu satu ruas terakhir KOSONG bergaris putus-putus, seolah ruas itu belum terpasang. Kepalanya hijau mint berwajah imut dengan dua antena kecil melengkung. Tinggi dan lebar ulatnya kira-kira sama. |
| `rute-kendaraan` | Buatkan: satu jalan raya berkelok membentuk huruf S dari atas ke bawah, aspal abu-abu dengan garis putus-putus putih di tengah dan pinggir jalan berwarna oranye lembut, dengan satu rambu penunjuk arah berbentuk bulat warna hijau mint menempel di ujung atas jalan. Rambunya berwajah imut — mata besar berkilau, pipi merona, senyum kecil. Tambahkan dua bintang kecil pastel melayang di sekitarnya. |
| `tangga-membaca` | Buatkan: satu tangga kayu mainan pendek warna kuning krem dengan TIGA anak tangga, berdiri tegak sedikit miring. Di tiap anak tangga menempel satu ubin huruf kecil pastel: huruf a di anak tangga bawah (peach), huruf i di tengah (hijau mint), huruf u di atas (biru muda). Di puncak tangga duduk satu bintang kuning kecil berwajah imut — mata besar berkilau, pipi merona, senyum kecil. Hanya bintang itu yang berwajah; tangga dan ubin hurufnya polos tanpa wajah. Selain huruf a, i, dan u itu tidak boleh ada tulisan apa pun. Tangganya gemuk dan pendek, tinggi gambarnya paling banyak satu setengah kali lebarnya. |

### Kalau hasilnya masih melenceng

Balas di chat yang sama dengan menyebut kesalahannya, jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, pertahankan karakter dan warnanya, tapi perbaiki: ganti
> latarnya jadi PUTIH POLOS rata tanpa ruangan dan tanpa blur, hapus semua tulisan,
> hapus bingkainya, hapus bayangan di lantai, dan buat formatnya persegi 1:1.

### Catatan per ikon
- **`cerita-nusantara` wajib buku TERTUTUP bermotif batik** — buku terbuka ungu sudah
  dipakai `cerita-kancil`, dua ikon buku yang mirip akan membingungkan. Sampul buku itu
  magnet tulisan; jangan hapus bagian "POLOS tanpa judul" dari baris promptnya.
- **`tulis-huruf` wajib pulpen biru** — pensil kayu kuning sudah dipakai `tulis-angka` (TK).
  Perbedaannya ditulis sebagai ciri POSITIF ("pulpen bertutup warna biru muda"), bukan
  sebagai larangan "bukan pensil": kata benda di dalam larangan sering justru ikut digambar.
- **`pasang-kata` (puzzle) vs `pasangan-pintar` (dua lingkaran terhubung)** sengaja dibedakan
  bentuknya; keduanya game "menjodohkan", jangan sampai ikonnya sama-sama puzzle.
- **`hitung-hebat` bukan tanda tambah** — tanda tambah sudah jadi ikon `tambah-tangkas`.
- **`suku-kata`**: balon ucapan itu magnet kalimat. Tiga bulatan di dalamnya = tiga suku kata.
- **`jam-pintar` opsional & berisiko**: mengganti ikonnya berarti melepas `iconClock`
  (muka jam SVG yang angkanya dijamin benar). Gambar AI sering salah menulis angka jam —
  kalau 1–12 tidak lengkap dan urut, JANGAN dipakai, biarkan SVG-nya.
- **`pola-pintar` = ulat berbuku-buku. Konsepnya sudah DUA KALI ditolak — baca dulu
  sebelum mengusulkan yang lain.**
  - **Deret mendatar terlarang.** Itu bahasa gambar paling jelas untuk "lanjutkan polanya",
    tapi empat ubin berjajar rasionya ±3 — jauh melewati batas ±1,5 (Pelajaran Kelima),
    jadi ikonnya mengecil sendiri kena pengaman `maxWidth` dan kalah menonjol dari
    tetangganya. Apa pun konsepnya, deretnya harus MELENGKUNG supaya tinggi ≈ lebar.
  - **Usulan 1: empat ubin dalam grid 2×2 — ditolak, "kaku".** Grid itu bahasa gambar
    spreadsheet, bukan mainan anak.
  - **Usulan 2: untaian manik-manik melengkung — ditolak, "lebih ke cewe".** Manik memang
    alat latihan pola yang klasik, tapi gambarnya terbaca sebagai KALUNG. Ikon game harus
    netral: yang main anak laki-laki maupun perempuan, dan kartu ini duduk di daftar yang
    sama dengan mobil, jam, dan papan target.
  - **Yang dipakai: ulat.** Netral, jelas mainan anak, dan sinyal polanya justru paling
    kuat — BADANNYA SENDIRI yang jadi deretnya, bukan hiasan yang ditempel pada objek lain.
    Badan yang merayap melengkung otomatis memenuhi syarat rasio.
  - Bedakan dari `pasangan-pintar` (DUA lingkaran besar dihubungkan garis putus-putus): di
    sini garis putus-putusnya cuma di SATU ruas badan yang belum terpasang. Bedakan juga
    dari `labirin-warna` (palet cat kayu, kelompok TK).
  - Kalau ulat pun ditolak, alternatif berikutnya yang netral & melengkung: **layang-layang
    dengan ekor berpita berselang-seling** (satu pita kosong bergaris putus-putus). Sinyal
    polanya lebih lemah — polanya di ekor, bukan di badan utamanya — jadi ini cadangan.
- **`tangga-membaca` (2026-10-05) = tangga, BUKAN buku.** Buku sudah dipakai dua ikon cerita
  (`cerita-kancil`, `cerita-nusantara`), dan tangga adalah nama game-nya sendiri: naik satu
  anak tangga = buka satu tahap di peta. Tiga ubin **a · i · u** = suku kata terbuka, tahap
  pertama game ini. Wajahnya SENGAJA di bintang, bukan di tangga: wajah yang ditaruh di anak
  tangga akan menimpa ubin hurufnya (Pelajaran Ketiga). Tangga cenderung MENJULANG kurus —
  kalau hasilnya rasio < 0,5 (lebih kurus dari pensil `tulis-angka`), minta ulang "lebih
  gemuk dan pendek". Lubang di antara anak tangga itu latar TERKURUNG: wajib ditembus manual
  sesudah dipotong (Pelajaran Keempat).
- **`ejaan-jitu` alternatif** kalau papan target terasa terlalu "permainan panah":
  Buatkan: tiga balok huruf kayu pastel berdiri berjajar, balok tengah berwajah imut,
  dengan satu bintang kuning melayang di atasnya.

---

## Setelah gambarnya jadi

1. Beri nama file sesuai kolom `id` (mis. `pasang-kata.png`).
2. Potong latar + ekspor: `python scripts/cut-checkerboard.py <art> public/assets/games/<id>.webp 320`
   (`cut-item.py` kalau latarnya putih polos, bukan kotak-kotak palsu).
3. Tambah satu baris `pic: '<id>',` di entri game itu di `src/games/registry.ts`.
   `emoji` JANGAN dihapus — itu cadangan kalau file gagal dimuat.
4. Lihat dulu hasilnya di atas latar berwarna: bagian gambar yang terang paling rawan
   ikut terpotong flood-fill.

## Temuan sampingan
`public/assets/games/cerita-kancil.webp` **memuat tulisan bahasa Inggris** di dalam gambarnya
("My Story Adventures", "Every chapter is an adventure!"). Aplikasinya berbahasa Indonesia dan
aturan gaya melarang teks di dalam ikon — layak ikut diganti. Kalau dibuat ulang, pakai
EKOR PROMPT di atas supaya sampul & halamannya polos.

---

## Ikon SD Kelas 3 & 4 (`sd2`) — disusun 2026-09-30

Sebelas game (`docs/rencana-game-sd-kelas-3-4.md`). Empat sudah ada di registry dan
sekarang masih emoji: **Kali Kilat ✖️, Kebun Ilmu 🌱, Toko Kembalian 🏪, Ukur Yuk 📏**.
Tujuh sisanya masih rencana, jadi ikonnya boleh dibuat duluan — filenya menunggu gamenya.

Memasang `pic` di game `sd2` **tidak** merilis `sd2`: kelompoknya tetap `draft` dan
tersembunyi di produksi.

Pakai **BLOK GAYA** dan **EKOR PROMPT** yang sama di atas (tempel ekornya di TIAP pesan).
Tiap baris di bawah sudah memuat aturan yang lahir dari lima pelajaran di atas:
objek bertulisan wajib "polos", wajah dan angka tak berbagi permukaan, dan
komposisinya rapat supaya rasio ≤ 1,5.

### Yang sudah dipakai ikon lain — JANGAN diulang

Sebelas ikon baru ini duduk di portal yang sama dengan tetangga SD Kelas 1 & 2, dan orang
tua bisa memegang dua kelompok sekaligus. Bentuk yang sudah terpakai: singa · tenda huruf ·
palet cat · semangka · huruf A · **pensil kuning** · mobil merah · sepasang kartu · puzzle
dua keping · **balok berangka 1-2-3** · balon ucapan · papan target · dua lingkaran
terhubung · pulpen biru · **buku ungu** · **jam dinding** · ulat · jalan berkelok S.

Karena itu: Ukur Yuk **bukan penggaris/pensil** (dekat pensil kuning Tulis Angka),
Waktu Tepat **bukan jam dinding**, Istana Bilangan **bukan balok berangka**,
Detektif Bacaan **bukan buku**, dan hanya SATU dari dua "detektif" yang memegang
kaca pembesar.

### Baris prompt (SATU per pesan, selalu + EKOR PROMPT)

| id file | Status game | Baris prompt |
|---|---|---|
| `kali-kilat` | sudah ada | Buatkan: satu tanda kali besar berbentuk silang tebal dan empuk seperti bantal, warna ungu muda, dengan wajah imut di titik silangnya, ditemani satu petir kecil warna kuning krem di sampingnya dan dua bintang kecil pastel. Tanda silangnya berdiri miring seperti tanda kali di buku hitungan, bukan huruf. Selain bentuk tanda kali itu tidak boleh ada angka atau tulisan apa pun. |
| `kebun-ilmu` | sudah ada | Buatkan: satu pot tanah liat kecil warna peach berwajah imut, dari tanahnya tumbuh satu kecambah hijau mint dengan dua daun bulat, satu tetes air biru muda melayang di atas daunnya dan satu matahari kecil kuning krem di dekatnya. Tinggi dan lebar gambarnya kira-kira sama. |
| `toko-kembalian` | sudah ada | Buatkan: satu mesin kasir mainan warna hijau mint berwajah imut di badan depannya, laci bawahnya sedikit terbuka berisi beberapa koin emas bulat POLOS. Layar kecil di atas mesin kasirnya kosong berwarna biru muda. Koin dan layar tidak boleh bertuliskan angka, harga, atau lambang mata uang apa pun. |
| `ukur-yuk` | sudah ada | Buatkan: satu meteran gulung bundar warna kuning krem berwajah imut di badan bundarnya, pita meterannya yang oranye lembut keluar melengkung ke bawah seperti ekor. Pita itu hanya bergaris-garis skala pendek, TANPA angka. Tambahkan dua bintang kecil pastel. Pita jangan menjulur lurus panjang ke samping — biarkan melengkung dekat badannya supaya tinggi dan lebar gambarnya kira-kira sama. |
| `waktu-tepat` | rencana | Buatkan: satu stopwatch bundar warna biru muda dengan tombol kecil di atasnya, berwajah imut di tengah muka stopwatch-nya. Pinggiran mukanya hanya bergaris-garis kecil, TANPA angka. Satu jarum merah pendek. Dua garis gerak kecil di sisinya seperti sedang berdetak. |
| `istana-bilangan` | rencana | Buatkan: satu istana mungil warna krem dan ungu muda dengan tiga menara beratap lancip dan bendera kecil peach di puncak menara tengah, pintu gerbangnya berwajah imut. Dinding istana polos tanpa angka dan tanpa tulisan. Tinggi dan lebar gambarnya kira-kira sama. |
| `lompat-katak` | rencana | Buatkan: satu katak kecil hijau mint berwajah imut sedang melompat dari satu daun teratai ke daun teratai lain, dengan garis lengkung putus-putus menunjukkan lintasan lompatannya. Daun teratai polos tanpa angka. Kedua daun berdekatan supaya gambarnya tidak melebar. |
| `bagi-kue` | sudah ada (2026-10-08) | Buatkan: satu kue tart bulat warna merah muda dengan krim putih dan satu stroberi di atasnya, sudah terpotong jadi empat bagian SAMA BESAR dengan garis potong lurus dari tengah, satu potongnya sedikit bergeser keluar ke kanan bawah di atas piring kecil putih. Wajah imut digambar di sisi depan tart. Tanpa lilin, tanpa tulisan di atas kue, tanpa pisau. Tinggi dan lebar gambarnya kira-kira sama. |
| `detektif-data` | rencana | Buatkan: satu diagram batang mainan dengan tiga batang tegak berbeda tinggi — biru muda, kuning krem, hijau mint — berdiri di atas satu garis dasar. Batang paling tinggi berwajah imut dan memakai topi detektif coklat kecil. Batang-batang polos tanpa angka dan tanpa label. |
| `detektif-bacaan` | rencana | Buatkan: satu kaca pembesar bergagang peach berwajah imut di gagangnya, lensanya diarahkan ke selembar kertas krem bergaris-garis. Garis di kertas hanya garis abu-abu tipis, TIDAK boleh ada huruf atau kata. Tinggi dan lebar gambarnya kira-kira sama. |
| `susun-kalimat` | rencana | Buatkan: satu kereta mainan kecil yang menanjak miring — lokomotif warna biru muda berwajah imut di depan, diikuti dua gerbong pendek warna peach dan hijau mint, tiap gerbong mengangkut satu kartu putih bergaris KOSONG. Kartu tidak boleh berisi huruf atau kata. Keretanya menanjak diagonal, bukan berjajar mendatar panjang. |
| `sanggar-warna` | sudah ada (2026-10-08) | Buatkan: satu mangkuk cat bundar kecil warna putih krem berwajah imut di badan depannya, tiga tetes cat besar berbentuk tetesan air — satu merah, satu kuning, satu biru — sedang jatuh ke dalam mangkuk dari atas, dan cat di dalam mangkuk berpusar warna oranye, hijau, dan ungu. Satu kuas kecil bergagang kayu bersandar di tepi mangkuk. Tanpa palet cat, tanpa tulisan. Tinggi dan lebar gambarnya kira-kira sama. |
| `sahabat-bumi` | sudah ada (2026-10-09) | Buatkan: satu bola bumi kecil yang bulat berwajah imut tersenyum, benua hijau dan laut biru muda, memeluk satu tunas daun hijau di tangannya yang mungil. Di sampingnya satu tong sampah kecil hijau. Dua bintang kecil pastel. Tanpa tulisan, tanpa panah daur ulang. Tinggi dan lebar gambarnya kira-kira sama. |
| `studio-kolase` | rencana (2026-10-09) | Buatkan: selembar kertas gambar persegi warna krem berwajah imut di pojok bawahnya, di atasnya menempel kolase seekor ikan kecil yang tersusun dari sobekan kertas warna-warni (biru, kuning, merah muda) bertepi robek tidak rata. Satu sobekan kertas hijau melayang di sampingnya dan satu botol lem putih kecil berdiri di dekatnya. Tanpa gunting, tanpa kuas, tanpa palet, tanpa tulisan. Tinggi dan lebar gambarnya kira-kira sama. |

### Catatan per ikon

- **Uang di `toko-kembalian` wajib koin POLOS.** Game-nya memakai foto uang SPECIMEN BI
  dan izin BI belum diurus; ikon yang menggambar uang kertas bernominal (atau lambang "Rp")
  menambah masalah yang sama. Koin emas bulat tanpa tulisan sudah cukup terbaca "uang".
- **Empat baris sengaja menyebut "TANPA angka"** (Ukur Yuk, Waktu Tepat, Istana Bilangan,
  Lompat Katak) walau gamenya soal bilangan: Gemini sering salah menulis angka di skala,
  dan skala penuh angka di kotak ±116 px cuma terbaca noda (Pelajaran Ketiga). Satu-satunya
  ikon yang boleh berangka tetap `hitung-hebat`.
- **Kali Kilat: tanda × harus terbaca TANDA KALI, bukan huruf X** — itu sebabnya ditulis
  "empuk seperti bantal" dan "miring seperti di buku hitungan". Kalau hasilnya tetap mirip
  huruf X, ganti petirnya jadi yang dominan (awan kecil berwajah imut menjatuhkan petir
  berbentuk ×).
- **Susun Kalimat & Lompat Katak rawan MELEBAR** (kereta dan dua daun cenderung berjajar
  mendatar). Kalau rasionya lewat ±1,5, minta ulang: "rapatkan, tinggi dan lebar kira-kira
  sama". Jangan dipasang sebelum diukur — ikon selebar itu meluber keluar kartu portal
  (Pelajaran Kelima).
- **Detektif Bacaan & Detektif Data sengaja beda benda**: kaca pembesar HANYA di Bacaan,
  topi detektif HANYA di Data. Dua kaca pembesar berdampingan di satu daftar akan
  tertukar.
- **Bagi Kue: empat potongnya WAJIB sama besar** (game ini justru memakai potongan TIDAK
  sama besar sebagai pengecoh "apakah ini seperempat?" — ikon yang potongannya miring
  mengajarkan kebalikannya). Tanpa pisau (benda tajam di kartu anak) dan tanpa Bu Beruang:
  beruang sudah jadi tokoh di dalam game lewat seni `bear`, dan kue lebih cepat terbaca
  "pecahan" di kotak ±116 px. Periksa celah putih di antara potongan yang bergeser — kalau
  terkurung, tembus manual sesudah `cut-item.py` (pelajaran ring kunci pas).
- **Katak = hewan, tapi di ikon boleh digambar bebas** (bukan seni `frog.webp`): aturan
  "hewan wajib seni WebP" berlaku untuk SOAL, tempat anak harus mengenali bentuknya.
  Ikon kartu sejak awal digambar Gemini (singa Hutan Hewan juga begitu).

- **Sanggar Warna: JANGAN palet cat** — palet sudah jadi ikon Labirin Warna (TK), dan
  orang tua yang memegang dua kelompok melihat keduanya. Mangkuk pencampur + tiga tetes
  primer justru inti game ini (merah + kuning = oranye di mangkuk). Tiga tetes WAJIB
  merah, kuning, biru yang pekat — kalau Gemini memberi tetes pastel, kuning & oranye di
  pusarannya tak terbedakan di kotak ±116 px (pelajaran Labirin Warna). Periksa lubang
  terkurung di antara gagang kuas & tepi mangkuk sesudah `cut-item.py`.

- **Studio Kolase: JANGAN gunting, kuas, atau palet.** Gunting = benda tajam di kartu
  anak; kuas & palet sudah milik Sanggar Warna dan Labirin Warna. Yang membuat ikon ini
  terbaca "kolase" adalah TEPI ROBEK sobekannya — kalau Gemini memberi potongan bertepi
  lurus rapi, itu terbaca mozaik/stiker; minta ulang "tepi sobekan kertasnya robek,
  bergerigi tidak rata".

### Memasangnya

Sama dengan langkah "Setelah gambarnya jadi" di atas: `scripts/cut-item.py <art>
public/assets/games/<id>.webp 320` (latar putih polos) → tempel di atas latar berwarna
dan periksa lubang terkurung (roda kereta, gagang kaca pembesar, lubang pot) → tambah
`pic: '<id>',` di entri registry. Untuk tujuh game yang belum ada, simpan file-nya saja;
`pic` ditambahkan saat entri registry-nya dibuat.
