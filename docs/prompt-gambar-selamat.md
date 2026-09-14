# Prompt Gambar — Ikon Layar "Selamat!" (pengganti emoji 🎉)

Sasaran: **`public/assets/ui/selamat.webp`** — satu gambar saja.

## Status (2026-09-14) — MENUNGGU GAMBAR

**Gambar penggantinya belum pernah ada di mana pun.** Sudah dicek: tidak di `main`, dan
tidak di branch Pages (`app/assets/ui/` cuma berisi `tersendat.webp`), juga tak ada di
riwayat commit. Jadi kalau dulu sempat dibuat, hasilnya memang belum pernah ter-push — dan
kali ini tak ada berkas yang bisa dipulihkan seperti ikon Puzzle Gambar & Anggota Tubuh
(2026-09-08), yang waktu itu ternyata nyangkut di branch Pages.

**Kodenya SUDAH SIAP** (dipasang di sesi yang sama dengan dokumen ini): begitu filenya ada
di `public/assets/ui/selamat.webp`, layar hasil langsung memakainya. Kalau filenya belum
ada / gagal dimuat / HP-nya sedang offline, layarnya otomatis kembali ke emoji 🎉. Jadi
**tidak ada tahap "pasang kode" lagi** dan tidak ada risiko layar kosong.

Ini layar hasil `GameShell` (`screen === 'done'`) — layar yang paling sering dilihat anak,
muncul tiap kali satu game tamat, bersamaan dengan lagu kemenangan ±2,7 detik.

## Kenapa emoji 🎉 sebaiknya diganti

- **Emoji digambar berbeda-beda di tiap HP** — di satu HP terompet pesta keemasan miring, di
  HP lain kerucut warna lain dengan confetti yang lain. Seluruh app ini sudah pindah ke
  gambar sendiri justru karena alasan itu (hewan, ikon game, maskot, feedback, layar
  tersendat); layar hasil salah satu sisa terakhir yang masih emoji polos.
- Momennya besar: ini hadiah anak setelah menyelesaikan satu game penuh.

---

## Aturan teknis khusus layar ini (baca dulu — empat hal yang tidak ada di layar lain)

1. **NOL tulisan di dalam gambar.** Kata **"Selamat!"** ditulis HTML tepat di bawah
   gambarnya, dan di bawahnya lagi "Kamu dapat 21 dari 21 bintang!". Tulisan di gambar =
   kalimatnya dobel, dan tidak ikut terbaca pembaca layar. **Ini kebalikan dari overlay
   umpan balik** (`prompt-gambar-feedback.md`), yang kalimatnya memang sengaja digambar KE
   DALAM gambar — jangan tertukar.
2. **JANGAN bintang emas besar, dan jangan angka.** Persis di bawah gambar ada baris
   ⭐⭐⭐ berisi bintang yang benar-benar didapat anak. Bintang menonjol di dalam gambar akan
   terbaca sebagai bintang tambahan dan mengacaukan hitungan yang justru jadi inti layar
   ini. Percikan/kilau kecil pastel boleh; bintang emas sebesar confetti-nya jangan.
3. **Jangan naga, jangan maskot, jangan hewan berperan.** Kartu maskot ada di layar yang
   SAMA, beberapa sentimeter di bawahnya, dan yang tampil di situ adalah tahap maskot anak
   saat itu — bisa masih **telur 🥚**. Naga besar di atas + telur di bawah = dua pesan yang
   bertabrakan. (Alasan yang sama dengan 🐣 di layar tersendat: gambar yang kebetulan sama
   dengan salah satu tahap maskot terbaca seolah berhubungan dengan tahap anak.) Yang
   dicari di sini **benda perayaan**, bukan karakter.
4. **Tingginya dipatok 128px dan tidak boleh lebih.** Layar hasil ini **sudah** melebihi
   tinggi HP kecil (terukur 707px di layar 640px), jadi gambarnya tidak boleh menambah satu
   piksel pun — 128px itu persis 1px lebih pendek dari kotak emoji yang digantikannya.
   Konsekuensinya: **rasio harus mendekati persegi, komposisinya jangan melebar.** Confetti
   yang tersebar lebar membuat gambarnya kena pengaman `max-width` dan dirender lebih
   pendek dari 128px — terompetnya sendiri jadi sekecil kuku. Minta confetti **merapat di
   sekitar** benda utamanya, jangan menyebar ke seluruh bingkai.

---

## Cara pakai

1. Buka chat **baru** di Gemini.
2. **Lampirkan satu ikon kartu game yang sudah ada sebagai contoh gaya** — mis.
   `public/assets/games/pasar-buah.webp` atau `hutan-hewan.webp`. Model jauh lebih patuh
   melihat contohnya daripada membaca deskripsi gayanya.
3. Tempel **BLOK GAYA**, lalu **satu baris prompt** di bawah ini — dan **EKOR PROMPT wajib
   ikut ditempel di pesan itu juga** (blok gaya di awal chat tidak bertahan; ini pelajaran
   kedua di `prompt-ikon-game.md`).

Gayanya mengikuti **`prompt-ikon-game.md`** (stiker kawaii, outline coklat lembut) —
konsisten dengan ikon-ikon kartu game dan dengan overlay feedback. **Bukan** gaya render 3D
lembut maskot (`prompt-maskot-naga.md`); jangan campur dua gaya di satu gambar.

### BLOK GAYA (tempel sekali di awal chat)

> Kamu akan membantuku membuat satu gambar untuk game edukasi anak usia 4–8 tahun.
> Gambarnya HARUS mengikuti aturan gaya ini:
>
> - Gaya kartun **kawaii** yang imut dan ramah anak, sticker style, ilustrasi datar.
> - Warna **PASTEL lembut** (peach, mint, biru muda, kuning krem, ungu muda), shading
>   halus, tanpa gradasi metalik, tanpa tekstur realistis.
> - Outline **tebal tapi lembut berwarna coklat/krem tua** — bukan hitam pekat.
> - Objek utamanya **berwajah imut**: mata besar berkilau, pipi merona, senyum kecil.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa bingkai, tanpa pola.
> - **Hanya SATU objek utama** di tengah. Hiasan kecil boleh, tapi jangan ramai.
> - **Tanpa teks, tanpa tulisan, tanpa watermark.**
> - Format **persegi (1:1)**, resolusi tinggi.

### PILIHAN 1 (disarankan) — terompet pesta yang meletus

Paling dekat dengan 🎉 yang sekarang, jadi anak yang sudah hafal layar ini tidak merasa ada
yang hilang. "Terompet pesta" = kerucut party popper, benda yang memang digambar emoji itu.

> Buatkan: satu **terompet pesta** (kerucut party popper) berwarna kuning krem bergaris
> ungu muda melingkar, dimiringkan ke atas, **berwajah imut** di badan kerucutnya — mata
> besar berkilau, pipi merona, senyum lebar gembira. Dari mulut kerucutnya menyembur
> **confetti pastel** berupa potongan-potongan kecil warna peach, mint, biru muda, dan ungu
> muda, **merapat di sekitar mulut kerucut** dan tidak menyebar jauh, ditambah dua pita
> serpentin melengkung pendek. Tinggi dan lebar gambarnya kira-kira sama.
>
> Confetti-nya berwarna pastel semua, **jangan ada confetti putih**. Jangan menggambar
> bintang emas, jangan bintang besar, jangan angka. Suasananya gembira dan bangga.

### PILIHAN 2 — terompet tiup dengan not musik

Pakai ini kalau yang dibayangkan pemilik memang **terompet tiup** (alat musik), bukan
kerucut party popper. Bonusnya: layar ini memang memutar lagu kemenangan ±2,7 detik, jadi
not musiknya jujur menggambarkan apa yang terdengar.

> Buatkan: satu **terompet tiup kecil** berwarna kuning krem keemasan lembut (pastel, tidak
> metalik) yang **berwajah imut** di badan terompetnya — mata besar berkilau, pipi merona,
> senyum kecil gembira. Terompetnya dimiringkan ke atas, dan dari mulut corongnya keluar
> **tiga not musik pastel** kecil (mint, peach, ungu muda) beserta beberapa potongan
> confetti pastel kecil, semuanya **merapat di sekitar corong** dan tidak menyebar jauh.
> Tinggi dan lebar gambarnya kira-kira sama.
>
> Jangan ada confetti putih. Jangan menggambar bintang emas, jangan bintang besar, jangan
> angka, jangan garis paranada. Suasananya gembira dan bangga.

### EKOR PROMPT (WAJIB ditempel di pesan yang sama)

> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa pemandangan, tanpa
> ruangan, tanpa meja, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa
> sudut membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter.
> JANGAN menuliskan kata, huruf, angka, label, judul, atau watermark apa pun di dalam
> gambar. Ilustrasi datar bergaya stiker, bukan foto.

### Kalau hasilnya masih melenceng

Balas di chat yang sama dengan menyebut kesalahannya saja, jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, pertahankan bentuk dan warnanya, tapi perbaiki: ganti latarnya
> jadi PUTIH POLOS rata tanpa ruangan dan tanpa blur, hapus semua tulisan, hapus
> bingkainya, hapus bayangan di lantai, rapatkan confetti-nya supaya tinggi dan lebar
> gambarnya kira-kira sama, dan buat formatnya persegi 1:1.

---

## Setelah gambarnya jadi

1. Simpan hasilnya (mis. `selamat.png`).
2. **Potong latarnya — pilih skripnya sesuai BAHANNYA, jangan asal `cut-item.py`:**

   | Bahan yang datang | Skrip |
   |---|---|
   | Latar **putih polos**, stiker beroutline (yang diminta prompt di atas) | `python scripts/cut-item.py <art> public/assets/ui/selamat.webp 320` |
   | Latar **kotak-kotak palsu** (khas Gemini, seolah transparan) | `python scripts/cut-checkerboard.py <art> public/assets/ui/selamat.webp 320` |
   | Latarnya **sudah transparan** sungguhan | `python scripts/trim-alpha.py <art> public/assets/ui/selamat.webp 320` |
   | Render 3D lembut **tanpa outline** (kalau gaya maskot dipilih) | `python scripts/cut-soft.py <art> public/assets/ui/selamat.webp 320` |

   320px cukup: gambarnya tampil 128px, jadi masih ±2,5× untuk layar HP ber-DPR tinggi.
   `cut-item.py` pada berkas yang latarnya sudah transparan **berbahaya** — ia mencari latar
   PUTIH, dan bagian putih di gambar seperti itu justru milik gambarnya.
3. **Tempel hasilnya di atas latar BERWARNA dan lihat**, jangan percaya angka "latar
   terbuang" yang dicetak skripnya. Yang paling rawan di gambar ini: **confetti yang
   terang/putih** dan **kilau putih di badan terompet** — keduanya bisa ikut terbuang
   flood-fill. Kalau ada confetti yang hilang, minta ulang gambarnya dengan confetti pastel
   yang lebih pekat; jangan ditambal dengan mengubah toleransi skripnya.
4. **Tidak ada kode yang perlu diubah.** `GameShell` (komponen `PartyPic`) sudah menunjuk
   file itu, dengan emoji 🎉 sebagai cadangan otomatis, dan animasi "berpesta"-nya sudah
   berlaku untuk gambar maupun emoji.
5. Deploy seperti biasa; pastikan `dist/assets/ui/` ikut tersalin ke folder `app/` di branch
   Pages. **Jangan menaruh asetnya langsung di branch Pages** — itu yang membuat dua ikon
   kartu game nyaris hilang (2026-09-08). Aset masuk ke `public/assets/**` di `main` dulu.

## Ukuran yang sudah terverifikasi (jangan diubah tanpa mengukur ulang)

Diukur headless di build produksi (`vite preview`), layar hasil Hutan Hewan dimainkan sampai
"Selamat!":

| Layar | Emoji 🎉 (sebelum) | Gambar 128px (sesudah) |
|---|---|---|
| 320×568 | luber 192px | luber **191px** |
| 360×640 | luber 67px | luber **66px** |
| 380×800 | 0 | **0** |
| 820×1180 | 0 | **0** |

Luber di HP kecil itu **bug lama** layar hasil (sudah tercatat sejak 2026-08-08, isinya 707px
untuk layar 640px) — bukan akibat gambar ini; gambarnya justru 1px lebih pendek. Kalau suatu
saat layar itu dirapikan, yang perlu dikecilkan ikon/kartu maskotnya, bukan gambar ini.
