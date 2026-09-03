# Prompt Gambar — Layar "Aduh, permainannya tersendat"

Sasaran: **`public/assets/ui/tersendat.webp`** — satu gambar saja.

## Status (2026-09-03) — SELESAI

Gambarnya **sudah terpasang**: naga Pilihan 1, dari percobaan pertama, langsung diterima.
237×384, 19 KB. Dokumen ini disimpan untuk kalau nanti gambarnya diganti lagi — dan karena
tahap POTONG-nya melahirkan satu skrip baru (`scripts/cut-soft.py`, lihat bagian bawah).

Ini layar `ErrorBoundary` (`src/app/ErrorBoundary.tsx`): layar terakhir yang muncul kalau ada
error runtime yang lolos, supaya anak tidak menatap layar putih. Sebelumnya ikonnya emoji 🐣.

**Kodenya sudah siap** — begitu filenya ada di `public/assets/ui/tersendat.webp`, gambarnya
langsung terpakai. Kalau filenya belum ada / gagal dimuat / HP-nya sedang offline, layarnya
otomatis kembali ke emoji 🐣, jadi tidak ada tahap "pasang kode" lagi dan tidak ada risiko
layar kosong.

## Kenapa emoji 🐣 sebaiknya diganti

- **🐣 itu emoji maskot tahap 2** (`Si Menetas`, 10 ⭐ di `mascot.ts`). Di layar error dia
  terbaca seolah ada hubungannya dengan tahap maskot anak — padahal tidak sama sekali.
- Emoji digambar berbeda-beda di tiap HP; seluruh app ini sudah pindah ke gambar sendiri
  justru karena alasan itu (hewan, ikon game, maskot, feedback).
- Layar ini muncul persis di saat anak sedang kecewa. Ini satu-satunya layar di app yang
  masih pakai emoji polos untuk momen sebesar itu.

---

## PILIHAN 1 (disarankan) — naganya sendiri, minta maaf

Naga = wajah app ini, sudah dilihat anak di beranda portal dan di tiap layar selesai. Yang
muncul saat ada yang rusak sebaiknya teman yang sudah dikenal, bukan karakter asing.

Gaya wajib mengikuti **`prompt-maskot-naga.md`** (render 3D lembut, pastel, TANPA outline
hitam) — **bukan** gaya stiker `prompt-ikon-game.md`. Kalau tertukar, naganya terlihat
datang dari produk yang berbeda.

### Cara pakai

1. Buka chat **baru** di Gemini.
2. **Lampirkan `public/assets/mascot/mascot-6.webp`** (Naga Jenius). Langkah paling
   menentukan — model jauh lebih patuh melihat karakternya daripada membaca deskripsinya.
3. Tempel blok gaya + baris promptnya sekaligus (cuma satu gambar, tidak perlu dicicil).

### Prompt (tempel utuh)

> Aku sedang membuat satu gambar untuk game edukasi anak usia 4–8 tahun. Gambar yang
> kulampirkan adalah maskot yang sudah ada — naga bayi bernama Naga Jenius. Aku butuh
> **naga yang SAMA PERSIS ini** dalam satu pose baru.
>
> **Posenya:** naga itu berdiri sambil **menggaruk belakang kepalanya dengan satu tangan**,
> kepala sedikit dimiringkan, senyum kecil malu-malu seperti sedang berkata "maaf ya,
> sebentar". Di dekat kakinya ada **satu balok mainan pastel yang terguling**. Ekspresinya
> **tetap ramah dan tenang — tidak sedih, tidak menangis, tidak panik, tidak marah**.
>
> Aturan wajib:
>
> - **Karakter yang sama, bukan naga baru.** Bentuk kepala, mata besar berbinar, moncong
>   pendek, perut krem, badan hijau mint, dan proporsi gemuk-imutnya harus persis sama.
> - Gaya **render 3D lembut ala mainan empuk**, warna pastel, shading halus dan mengkilap,
>   **tanpa outline hitam tebal**, bukan stiker datar.
> - **Seluruh badan masuk**, menghadap depan atau tiga-perempat, di tengah gambar.
>   **Sayap merapat ke badan**, jangan terbentang lebar ke samping.
> - **Latar putih polos rata.** Tanpa bayangan di lantai, tanpa pemandangan, tanpa ruangan,
>   tanpa bingkai, tanpa lingkaran atau aura kotak di belakangnya, tanpa blur, tanpa bokeh.
> - **Tanpa awan mendung, tanpa tanda seru, tanpa tanda silang, tanpa ikon peringatan.**
> - **JANGAN menuliskan kata, huruf, angka, label, atau watermark apa pun di dalam gambar.**
> - Tidak ada partikel yang melayang jauh dari badannya.
> - Komposisi **kira-kira setinggi lebarnya** (mendekati persegi), resolusi tinggi.

### Versi Inggris (biasanya lebih patuh)

> Same cute pastel mint baby dragon as the reference image, cream belly, big sparkling
> friendly eyes, chubby toy-like proportions, soft 3D render style, soft glossy shading, no
> black outline. **Pose:** standing, scratching the back of its head with one hand, head
> slightly tilted, small sheepish apologetic smile, one pastel toy block tipped over near
> its feet. Calm and friendly — not sad, not crying, not panicking. Full body visible,
> centered, wings folded close to the body, plain white background, no floor shadow, no
> scenery, no frame, no glow panel, no warning icons, no text or watermark of any kind,
> near-square composition, high resolution.

### Kalau hasilnya melenceng

Balas di chat yang sama, sebut kesalahannya saja — jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, pertahankan karakter dan warnanya, tapi perbaiki: latarnya jadi
> PUTIH POLOS rata tanpa ruangan dan tanpa blur, hapus semua tulisan, hapus bingkainya,
> hapus bayangan di lantai, rapatkan sayapnya ke badan, dan buat komposisinya mendekati
> persegi.

---

## PILIHAN 2 (cadangan) — anak ayam menetas, gaya stiker

Kalau ingin tetap dekat dengan 🐣 yang sekarang. Gayanya ikut **`prompt-ikon-game.md`**
(stiker kawaii, outline coklat lembut) — konsisten dengan ikon-ikon kartu game, tapi
**tidak** dengan maskot. Jangan campur dua gaya di satu gambar.

> Buatkan: satu anak ayam kuning kecil yang lucu, baru menetas dan masih memakai separuh
> cangkang telur di kepalanya seperti topi, badannya sedikit miring, mata besar berkilau,
> pipi merona, senyum kecil malu-malu. Di sampingnya ada satu pecahan cangkang telur kecil.
> Anak ayamnya tetap ceria, tidak sedih dan tidak menangis.
>
> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa pemandangan, tanpa
> ruangan, tanpa meja, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa
> sudut membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter.
> JANGAN menuliskan kata, huruf, angka, label, judul, atau watermark apa pun di dalam
> gambar. Ilustrasi datar bergaya stiker, bukan foto.

---

## Aturan teknis khusus layar ini

- **Gambarnya tampil BESAR** — 176px (dibatasi 52% lebar layar di HP kecil), jauh lebih
  besar dari ikon kartu game (±72–116px). Jadi detail halus di sini justru terlihat; yang
  penting tetap siluet dan latar yang bersih.
- **Nol tulisan di dalam gambar.** Kalimat "Aduh, permainannya tersendat · Bukan salahmu
  kok!" ditulis oleh HTML tepat di bawah gambarnya. Tulisan di gambar = kalimatnya dobel,
  dan tidak ikut terbaca pembaca layar.
- **Jangan bahasa gambar "error".** Tanda seru, silang merah, awan mendung, layar retak,
  kabel putus — semuanya memberi tahu anak bahwa ADA YANG RUSAK, padahal seluruh isi layar
  ini justru dirancang untuk bilang "bukan salahmu, ayo coba lagi".
- **Jangan naga/ayam yang menangis.** Anaknya sudah kecewa duluan; gambar sedih menambah,
  bukan menenangkan. Malu-malu = pas, sedih = tidak.
- Rasio mendekati persegi. Beda dengan ikon kartu game, di sini rasio menjulang tidak
  masalah — batas ±1,5 di `prompt-ikon-game.md` itu soal lebar kartu portal, bukan layar ini.

## Setelah gambarnya jadi

1. Simpan sebagai `tersendat.png`.
2. Potong latar + ekspor — **pakai `cut-soft.py`, BUKAN `cut-item.py`**:
   `python scripts/cut-soft.py <art> public/assets/ui/tersendat.webp 384`
3. **Lihat hasilnya di atas latar berwarna dulu**, jangan percaya angka "latar terbuang".
4. Tidak ada kode yang perlu diubah. `ErrorBoundary` sudah menunjuk file itu, dengan emoji
   🐣 sebagai cadangan otomatis.
5. Deploy seperti biasa; pastikan `dist/assets/ui/` ikut tersalin ke folder `app/` di branch
   Pages.

---

## PELAJARAN POTONG (2026-09-03) — kenapa ada `scripts/cut-soft.py`

`cut-item.py` **merusak** gambar naga ini, dan rusaknya tidak kelihatan dari angka yang
dicetaknya ("latar terbuang 78,6%" — terdengar wajar):

- Skrip itu menyusuri latar sambil membandingkan tiap piksel dengan **tetangganya**
  (toleransi 8 per langkah). Untuk seni stiker beroutline coklat itu aman.
- Render 3D lembut **tidak punya outline**: tepinya landaian halus dari latar ke badan.
  Rantai toleransi itu menuruni landaiannya, masuk lewat **celah sempit antara lengan dan
  badan**, lalu melahap perut krem yang memang nyaris seputih latar. Hasilnya perut naganya
  **bolong besar** dengan tepi berbintik — baru terlihat setelah ditempel di atas latar
  berwarna.
- `cut-soft.py` menilai latar dengan **ambang global**, lalu meng-**erode** topeng latarnya
  sebelum ditelusuri dari tepi gambar dan men-**dilate**-nya kembali. Jembatan sempit putus
  saat erosi, jadi kebocoran ke dalam badan mustahil.
- Justru karena aman itu, ambangnya boleh **longgar (205)** — dan itu sekaligus membuang
  **bayangan lantai** yang pucat, yang di `cut-item.py` malah ikut terbawa sebagai noda abu
  di antara kaki. (Bayangan lantai tetap dilarang di prompt: yang di sini cuma jaring
  pengaman, bukan izin.)
- Alpha-nya diberi **feather 1px**; siluet render lembut tanpa outline terlihat bergerigi
  kalau alpha-nya keras, apalagi di layar ini yang menampilkannya 180px.

**Pakai `cut-soft.py` juga untuk maskot tahap 10–12** (`prompt-maskot-naga.md`) — sumber
masalahnya sama persis: naga pastel tanpa outline, perut krem, latar nyaris putih.
