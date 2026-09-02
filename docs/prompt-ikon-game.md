# Prompt Ikon Kartu Game

Sasaran: `GameMeta.pic` di `src/games/registry.ts` → file `public/assets/games/<id>.webp`.
Ikon ini dipakai DUA tempat sekaligus (kartu portal + layar intro), jadi satu file cukup.

## Status (2026-09-03) — SELESAI

**Ke-18 game sudah bergambar; tak ada lagi ikon emoji.** Terakhir masuk: `pola-pintar`
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
