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
