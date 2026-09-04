# Prompt Gambar — Ikon Layar "Selamat!" (pengganti terompet 🎉)

Sasaran: **`public/assets/ui/selesai.webp`** — satu gambar saja.

Ini ikon besar di layar hasil (`GameShell`, layar `done`): muncul tiap kali satu game tamat,
bersamaan dengan lagu kemenangan ±2,7 detik. Sebelumnya emoji 🎉 (terompet pesta).

**Kodenya sudah siap** — begitu filenya ada di `public/assets/ui/selesai.webp`, gambarnya
langsung terpakai, ikut bergoyang mengikuti animasi yang sama. Kalau filenya belum ada /
gagal dimuat / HP sedang offline, layarnya otomatis kembali ke emoji 🎉. Jadi tidak ada
tahap "pasang kode" lagi, dan tidak ada risiko layar kosong.

## Kenapa 🎉 diganti

- **Di HP-nya terbaca sebagai corong emas polos**, bukan pesta. Emoji digambar berbeda-beda
  di tiap HP — alasan yang sama yang membuat seluruh app ini pindah ke gambar sendiri
  (hewan, buah, ikon game, maskot, layar tersendat).
- Ini **layar paling membanggakan di seluruh app** (bintang + lagu kemenangan + maskot
  tumbuh). Sekarang justru satu-satunya layar besar yang masih memakai emoji polos.

---

## PILIHAN 1 (disarankan) — terompet pesta berwajah imut, gaya stiker

Gayanya ikut **`prompt-ikon-game.md`** (stiker kawaii, outline coklat lembut, pastel) —
sama dengan ikon-ikon kartu game yang sudah dilihat anak sebelum masuk permainan.

**JANGAN memakai naga/maskot di gambar ini.** Tepat di bawahnya sudah ada kartu maskot
dengan avatarnya sendiri, dan maskot anak berganti-ganti mengikuti bintangnya (di
tangkapan layar pemilik: Unicorn Ajaib, bukan naga). Naga di atas + unicorn di bawah =
dua tokoh berbeda di satu layar.

### Cara pakai

1. Buka chat **baru** di Gemini.
2. Tempel **blok gaya** `prompt-ikon-game.md` (bagian "BLOK GAYA") satu kali.
3. Tempel baris prompt di bawah **beserta ekor promptnya** — ekor itu wajib ikut di pesan
   yang sama, blok gaya di awal chat terbukti tidak bertahan.

### Prompt (tempel utuh)

> Buatkan: satu terompet pesta (party popper) besar warna kuning krem dengan pita spiral
> merah muda melingkarinya, dalam posisi miring menghadap ke atas, sedang meletus
> mengeluarkan semburan confetti kecil-kecil warna pastel — merah muda, biru muda, hijau
> mint, dan ungu muda. Terompetnya berwajah imut: mata besar berkilau, pipi merona, senyum
> lebar gembira. Confettinya berkumpul rapat di sekitar mulut terompet, tidak ada yang
> melayang jauh ke tepi gambar.
>
> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa pemandangan, tanpa
> ruangan, tanpa meja, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa
> sudut membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter.
> **Tanpa bintang kuning besar dan tanpa piala.** JANGAN menuliskan kata, huruf, angka,
> label, judul, atau watermark apa pun di dalam gambar. Ilustrasi datar bergaya stiker,
> bukan foto.

### Versi Inggris (biasanya lebih patuh)

> A big cute kawaii party popper, cream-yellow cone with a pink spiral ribbon, tilted
> upward and bursting with small pastel confetti (pink, light blue, mint, lavender). The
> popper has a cute face: big sparkling eyes, blushing cheeks, wide happy smile. Confetti
> stays clustered close to the popper's mouth, nothing drifting to the edges. Flat sticker
> style illustration, soft brown outline (not black), pastel colors, plain white
> background, no floor shadow, no frame, no glitter, no big golden stars, no trophy, no
> text or watermark of any kind, square 1:1, high resolution.

---

## PILIHAN 2 (cadangan) — kotak kado meletus

Kalau terompetnya tetap terasa kurang meriah. Gaya & ekor prompt sama persis dengan
Pilihan 1.

> Buatkan: satu kotak kado besar warna hijau mint dengan pita merah muda, tutupnya
> terlempar terbuka ke atas dan dari dalamnya menyembur confetti kecil-kecil warna pastel
> serta pita-pita melengkung. Kotaknya berwajah imut: mata besar berkilau, pipi merona,
> senyum lebar gembira. Semburannya berkumpul rapat di atas kotak, tidak melayang jauh ke
> tepi gambar. Tinggi dan lebar gambarnya kira-kira sama.

---

## PILIHAN 3 — kembang api (ditanyakan pemilik 2026-09-04; BUKAN yang disarankan)

Kembang api itu bahasa perayaan yang paling langsung, tapi di slot ini ia melawan tiga hal
sekaligus. Kalau tetap ingin dicoba, coba **berdampingan** dengan Pilihan 1 lalu bandingkan
di HP — jangan langsung dipasang.

**Kenapa berisiko di layar ini:**

- **Butuh langit gelap.** Kembang api terbaca karena percikan terang di atas gelap. Gambar
  ini dipotong transparan dan ditempel di atas gradien pastel TERANG — percikan kuning/putih
  langsung kehilangan kontras dan berubah jadi taburan confetti biasa. (Menambahkan panel
  langit gelap di belakangnya = bingkai, dan bingkai dilarang di ikon.)
- **Tampil cuma 132px.** Percikan tipis yang menyebar hilang di ukuran itu; yang tersisa
  titik-titik kecil, bukan objek. Lebih buruk lagi sesudah dipotong: **percikan terluar yang
  menentukan batas gambar**, jadi inti ledakannya dirender makin kecil (pelajaran yang sama
  dengan maskot naga di `prompt-maskot-naga.md`).
- **Bentuknya bintang memancar** — bentrok dengan baris ⭐⭐⭐ tepat di bawahnya yang
  mengabarkan NILAI anak.
- Ledakan tidak punya badan untuk wajah imut, jadi ia keluar dari bahasa gambar app ini.

**Kalau tetap dicoba, syaratnya (semuanya wajib):**

- Warnanya **pekat** (merah muda tua, ungu, biru, hijau mint) — **bukan kuning atau putih**,
  keduanya hilang di latar pastel terang.
- Percikannya **rapat dan pendek**, semua menempel ke inti ledakan; tidak ada percikan yang
  melayang jauh ke tepi gambar.
- **Bukan bintang bersudut runcing.** Percikan berujung bulat.
- Punya **satu inti besar** yang jelas, supaya ada siluet di 132px.

> Buatkan: satu ledakan kembang api besar yang imut, bentuknya bulat rapat dengan inti
> terang di tengah dan percikan pendek berujung bulat memancar ke segala arah. Warnanya
> merah muda tua, ungu muda, biru, dan hijau mint — tanpa kuning dan tanpa putih.
> Percikannya rapat menempel ke intinya, tidak ada yang melayang jauh. Intinya berwajah
> imut: mata besar berkilau, pipi merona, senyum lebar gembira. Percikannya berujung bulat,
> bukan bintang bersudut runcing.
>
> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa langit malam, tanpa
> pemandangan, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa sudut
> membulat di tepi gambar. Tanpa bayangan, tanpa pantulan, tanpa glitter. Tanpa bintang
> kuning. JANGAN menuliskan kata, huruf, angka, label, judul, atau watermark apa pun di
> dalam gambar. Ilustrasi datar bergaya stiker, bukan foto.

**Jalan tengahnya:** minta Pilihan 1 atau 2 (terompet / kotak kado) tapi semburannya diganti
percikan kembang api kecil berwarna pekat. Rasanya kembang api, tapi siluetnya tetap dipegang
satu objek padat berwajah imut.

---

## KENAPA PERCOBAAN PERTAMA BISA JELEK (2026-09-04)

Terompet pesta (Pilihan 1) **ditolak pemilik: hasil gambarnya jelek.** Sebabnya bukan
kalimat promptnya — subjeknya yang sulit untuk model gambar:

- Bentuknya **corong + ledakan yang berserakan**. Model menggambar corongnya jadi logam
  berkilau berantakan dan confettinya jadi taburan acak; di 132px hasilnya cuma noda.
- **Wajahnya tak punya tempat duduk yang jelas.** Corong itu permukaan miring menyempit,
  jadi wajahnya sering melenceng ke tepi atau tumpang tindih pita.

**Aturan untuk ide penggantinya:** pilih objek yang **BULAT/GEMUK, SATU BADAN, dan punya
bidang datar besar untuk wajah**. Itu yang selalu berhasil di gaya stiker (lihat ikon-ikon
kartu game yang sudah jadi: ulat, balon ucapan, papan target, jam). Hiasan seperti confetti
maksimal **beberapa butir yang menempel di badan objeknya**, bukan taburan sepenuh gambar.

**Satu langkah yang sangat membantu:** lampirkan **satu ikon game yang sudah jadi** (mis.
`public/assets/games/pola-pintar.webp` atau `suku-kata.webp`) ke chat Gemini sebagai contoh
gaya, lalu tulis *"ikuti gaya gambar ini persis"*. Model jauh lebih patuh melihat contoh
daripada membaca deskripsi gaya — pelajaran yang sama dengan `prompt-maskot-naga.md`.

---

## PILIHAN 4 (disarankan sesudah terompet ditolak) — balon udara

Paling nyambung dengan nama app-nya (**Petualangan Pintar**) dan dengan gagasan maskot yang
tumbuh: anak baru saja menyelesaikan satu perjalanan. Bentuknya bulat gemuk — jenis objek
yang paling aman digambar model DAN yang siluetnya paling terbaca di 132px. Tidak bentrok
dengan gambar item mana pun (`balloon` di registry itu balon karet satu buah, bentuknya
berbeda jauh).

> Buatkan: satu balon udara panas yang imut dan gemuk, badan balonnya bergaris-garis lebar
> warna pastel — krem, merah muda, hijau mint, dan biru muda — dengan keranjang rotan kecil
> warna coklat muda menggantung di bawahnya. Wajah imutnya digambar besar di bagian tengah
> bawah badan balon: mata besar berkilau, pipi merona, senyum lebar gembira. Tambahkan
> empat confetti pastel kecil yang menempel dekat keranjangnya. Balon udaranya satu-satunya
> objek, digambar besar memenuhi gambar.
>
> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa langit, tanpa awan, tanpa
> pemandangan, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa sudut
> membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter. Tanpa
> bintang kuning, tanpa piala, tanpa bendera bertulisan. JANGAN menuliskan kata, huruf,
> angka, label, judul, atau watermark apa pun di dalam gambar. Ilustrasi datar bergaya
> stiker, bukan foto.

## PILIHAN 5 — peti harta karun terbuka

Bahasa "hadiah setelah berusaha" yang langsung dimengerti anak, dan siluetnya kotak gemuk
— paling kuat di ukuran kecil. Wajahnya duduk enak di badan peti.

> Buatkan: satu peti harta karun kayu kecil yang imut dan gemuk, warna coklat muda dengan
> ban logam krem, tutupnya terbuka lebar ke belakang. Dari dalam peti keluar cahaya lembut
> kuning krem dan beberapa confetti pastel kecil yang menempel di dekat mulut peti. Wajah
> imutnya digambar besar di badan depan peti: mata besar berkilau, pipi merona, senyum
> lebar gembira. **Isinya hanya cahaya dan confetti — tanpa koin, tanpa uang, tanpa
> perhiasan, tanpa mahkota.**
>
> Aturan wajib: (sama seperti Pilihan 4)

## PILIHAN 6 — roket meluncur

Paling "meledak-ledak" tanpa jadi berantakan, karena semburannya digambar sebagai satu
gumpalan padat, bukan percikan berserakan.

> Buatkan: satu roket mainan gemuk yang imut sedang meluncur ke atas, badannya warna krem
> dengan ujung kerucut merah muda dan tiga sirip biru muda. Di bawahnya ada satu gumpalan
> asap pastel membulat yang padat dan menempel ke ekor roket. Wajah imutnya digambar besar
> di badan roket: mata besar berkilau, pipi merona, senyum lebar gembira. Roketnya tegak
> lurus menghadap ke atas dan jadi satu-satunya objek.
>
> Aturan wajib: (sama seperti Pilihan 4) — ditambah: tanpa bintang, tanpa planet, tanpa
> luar angkasa, tanpa api menyembur panjang.

**Cara memilih:** minta ketiganya di chat yang sama (satu gambar per pesan), lalu lihat
bertiga dalam ukuran ±132px — sekitar setinggi ibu jari di layar HP. Yang masih terbaca
jelas di ukuran itu yang menang; jangan menilai dari tampilan besarnya di laptop.

---

## Aturan teknis khusus layar ini

- **Gambarnya tampil 132px** — setinggi kotak emoji 110px yang digantikannya. Layar hasil
  ini SUDAH pas-pasan di HP 360×640 (bug lama, tercatat di `CLAUDE.md`: isinya 707px untuk
  layar 640px), jadi ukurannya tidak boleh dinaikkan. Karena kecil, **yang menentukan itu
  siluet**, bukan detail halus.
- **Komposisi mendekati persegi.** Diukur lewat TINGGI (`width: auto`), jadi gambar yang
  melebar akan mentok `max-width: 70vw` lalu dirender lebih pendek dari 132px. Batas aman
  rasio ±1,5 — aturan yang sama dengan ikon kartu game.
- **Gambarnya BERGOYANG** (`party-pop`: membesar 1,16× dan miring ±7°, 4× selama lagu
  kemenangan berbunyi). Jadi objeknya harus tetap masuk akal saat dimiringkan: satu objek
  di tengah, tidak ada bagian yang menjulur jauh ke tepi (ujungnya akan terlihat keluar
  masuk saat membesar).
- **JANGAN menggambar bintang kuning besar.** Tepat di bawah gambar ini ada baris ⭐⭐⭐
  yang MENGABARKAN NILAI anak. Bintang mencolok di gambarnya membuat anak menghitung
  bintang yang salah. Confetti pastel kecil tidak masalah.
- **Nol tulisan di dalam gambar.** Kata "Selamat!" ditulis HTML tepat di bawahnya —
  tulisan di gambar = kalimatnya dobel, dan tidak ikut terbaca pembaca layar.
- **Jangan piala/medali.** Ini bukan lomba dan tidak ada yang dikalahkan; seluruh app
  memakai bahasa "hebat, kamu bisa", bukan bahasa juara.
- **Jangan naga/maskot** (alasan di Pilihan 1).

## Setelah gambarnya jadi

1. Simpan sebagai `selesai.png`.
2. Potong latar + ekspor:
   - Pilihan 1 & 2 (**gaya stiker, ada outline coklat**):
     `python3 scripts/cut-item.py <art> public/assets/ui/selesai.webp 384`
   - Kalau hasilnya ternyata render 3D lembut **tanpa outline**:
     `python3 scripts/cut-soft.py <art> public/assets/ui/selesai.webp 384`
     (`cut-item.py` bocor ke dalam badan gambar tanpa outline — lihat pelajaran di
     `prompt-gambar-tersendat.md`.)
3. **Lihat hasilnya di atas latar berwarna dulu**, jangan percaya angka "latar terbuang".
   Confetti kecil berwarna terang rawan ikut terbuang; kalau ada yang hilang, kecilkan
   ambangnya atau pilih gambar yang confettinya lebih pekat.
4. Tidak ada kode yang perlu diubah. `GameShell` sudah menunjuk file itu, dengan emoji 🎉
   sebagai cadangan otomatis.
5. Deploy seperti biasa; pastikan `dist/assets/ui/` ikut tersalin ke folder `app/` di
   branch Pages.

### Kalau hasilnya melenceng

Balas di chat yang sama, sebut kesalahannya saja — jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, pertahankan objek dan warnanya, tapi perbaiki: latarnya jadi
> PUTIH POLOS rata tanpa ruangan dan tanpa blur, hapus semua tulisan, hapus bingkainya,
> hapus bayangan di lantai, hapus bintang kuning besarnya, dekatkan confettinya ke
> terompet, dan buat formatnya persegi 1:1.
