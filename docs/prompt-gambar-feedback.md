# Prompt Gambar — Overlay Salah "Coba lagi, kamu pasti bisa!"

Sasaran: **`public/assets/feedback/coba-lagi.webp`** — mengganti satu gambar yang sudah ada.

## Status (2026-09-05) — SELESAI

Gambar penggantinya **sudah terpasang**, dari percobaan pertama: kucing yang sama persis,
spanduk yang sama, cuma tulisannya jadi "Coba lagi! / Kamu pasti bisa!". 720×533, 75 kB.
Ejaannya sudah diperiksa huruf per huruf — `lagi` benar-benar huruf l kecil.

Dokumen ini disimpan untuk kalau gambarnya diganti lagi, **dan karena tahap POTONG-nya
ternyata berbeda dari dugaan awal**: gambar kiriman pemilik datang dengan **latar yang sudah
transparan**, bukan JPEG berlatar putih seperti gambar singa dulu. Lihat "Setelah gambarnya
jadi" di bawah — `cut-item.py` JUSTRU BERBAHAYA untuk berkas seperti itu.

## Kenapa diganti (2026-09-05, laporan pemilik)

Gambarnya bertuliskan **"Ayo semangat! Kamu pasti bisa!"** sementara narasinya berbunyi
**"Coba lagi, kamu pasti bisa!"**. Anak yang belum lancar membaca mendengar satu kalimat
sambil melihat kalimat lain — persis kebalikan dari gunanya overlay ini (kalimatnya memang
sengaja digambar KE DALAM gambar, lihat "Standar UX Anak" di `CLAUDE.md`).

Yang diluruskan adalah **gambarnya**, bukan suaranya: "Coba lagi, kamu pasti bisa!" adalah
kalimat resmi umpan balik di seluruh proyek (tertulis di `CLAUDE.md` sejak awal), sudah
direkam sebagai `engine/bba8e787ee7e.mp3`, dan dipakai **semua** game. Mengubah narasinya
memang bisa (satu baris, satu render Azure), tapi berarti mengubah kalimat resmi itu di
mana-mana demi satu gambar.

**Tidak ada kode yang perlu diubah.** `Feedback.tsx` sudah menunjuk file ini; kalau filenya
gagal dimuat, overlay-nya otomatis kembali ke emoji 💪 + teks. Jadi menimpa filenya saja
sudah cukup.

---

## Cara pakai (langkah 2 yang paling menentukan)

1. Buka chat **baru** di Gemini.
2. **Lampirkan `public/assets/feedback/coba-lagi.webp` yang sekarang.** Ini bukan gambar
   baru — ini gambar LAMA dengan tulisan yang diperbaiki. Model jauh lebih patuh melihat
   kucingnya daripada membaca deskripsinya, dan yang kita jaga justru supaya kucingnya
   tidak berubah sama sekali.
3. Tempel prompt di bawah ini utuh.
4. **Baca hasilnya huruf per huruf** sebelum diterima — lihat "Memeriksa tulisannya".

## Prompt (tempel utuh)

> Gambar yang kulampirkan adalah aset dari game edukasi anak yang sudah kupakai. Aku butuh
> **gambar yang SAMA PERSIS ini**, dengan **hanya SATU hal yang berubah: tulisan di dalam
> spanduknya**.
>
> Tulisan barunya, tepat dua baris:
>
> **Baris 1: `Coba lagi!`**
> **Baris 2: `Kamu pasti bisa!`**
>
> Aturan wajib:
>
> - **Kucingnya jangan diubah sedikit pun.** Bentuk kepala, telinga oranye-krem, satu mata
>   berkedip sebelah, mata cokelat besar berkilau, pipi merona, kumis, jempol teracung,
>   baju kuning berbintang — semuanya persis sama, pose sama, ukuran sama, posisi sama.
> - **Spanduknya juga jangan diubah:** kapsul putih bergaris tepi kuning tebal, dua hati
>   pink di ujung kiri dan kanan, garis-garis kuning kecil di sekitarnya, kilau kuning di
>   kanan atas. Yang berganti hanya kata-katanya.
> - **Huruf tebal membulat berwarna cokelat tua yang sama**, rata tengah, dua baris,
>   memenuhi lebar spanduk seperti sebelumnya. Baris kedua sedikit lebih besar/panjang dari
>   baris pertama, sama seperti aslinya.
> - **Ejaannya harus tepat, huruf per huruf: "Coba lagi!" dan "Kamu pasti bisa!"** Huruf C
>   dan K besar, sisanya huruf kecil. Bahasa Indonesia. Jangan menambah, mengurangi, atau
>   menerjemahkan satu kata pun.
> - **Tidak ada tulisan lain di mana pun** — tanpa judul, tanpa label, tanpa watermark,
>   tanpa tanda tangan.
> - **Latar putih polos rata.** Tanpa bayangan lantai, tanpa pemandangan, tanpa bingkai,
>   tanpa kotak atau lingkaran di belakangnya, tanpa blur, tanpa bokeh.
> - Ilustrasi datar bergaya stiker dengan outline lembut, ceria, bukan foto, bukan render 3D.
> - **Ekspresinya tetap ceria dan menyemangati** — jangan sedih, jangan menangis, jangan
>   cemberut, jangan menunduk. Ini muncul saat anak salah menjawab, dan seluruh gunanya
>   adalah membuat anak mau mencoba lagi.
> - Resolusi tinggi, komposisi mendatar kira-kira 4:3 seperti aslinya.

## Versi Inggris (biasanya lebih patuh untuk tulisan)

> Recreate the attached sticker illustration **exactly**, changing **only the words inside
> the banner**. Keep the same cute white cat: same head shape, cream-orange ears, one eye
> winking, big sparkling brown eye, pink blush cheeks, whiskers, thumbs-up paw, yellow star
> shirt, same pose, same size, same position. Keep the same white rounded banner with the
> thick yellow outline, the two pink hearts at both ends, the small yellow motion strokes
> and the yellow sparkle.
>
> The banner must read, on exactly two centered lines, in the same bold rounded dark-brown
> lettering:
>
> Line 1: **Coba lagi!**
> Line 2: **Kamu pasti bisa!**
>
> Spell it letter for letter: "Coba lagi!" and "Kamu pasti bisa!" — Indonesian, capital C
> and capital K only, everything else lowercase. No other text anywhere, no watermark. Plain
> white background, no floor shadow, no scenery, no frame, no blur. Flat sticker-style
> illustration, cheerful and encouraging — not sad, not crying. High resolution, landscape
> composition about 4:3.

## Kalau hasilnya melenceng

Balas di chat yang sama, sebut kesalahannya saja — jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, jangan ubah kucing dan spanduknya, tapi perbaiki tulisannya jadi
> tepat dua baris: "Coba lagi!" lalu "Kamu pasti bisa!". Periksa ejaannya huruf per huruf.
> Hapus tulisan lain, buat latarnya putih polos rata.

---

## Memeriksa tulisannya (JANGAN dilewati)

Model gambar rutin salah mengeja, dan salahnya halus — di gambar setinggi 460px kesalahan
itu terbaca jelas oleh orang tua, dan anak yang sedang belajar membaca ikut melihatnya.
Yang paling sering:

- **`Iagi` bukan `lagi`** — huruf L kecil dijadikan I besar. Ini jebakan nomor satu.
- **`bisal` / `bisa!`** tertukar — tanda seru menempel jadi huruf l.
- `Coba` jadi `Coha`/`Cobo`; `pasti` jadi `pastl`.
- Tulisannya jadi **satu baris** atau **tiga baris**, jadi lebarnya tidak lagi seimbang.
- Model diam-diam menerjemahkan jadi "Try again!".

Cara memeriksa: perbesar gambarnya, baca **satu huruf demi satu huruf**, jangan membaca
kalimatnya sekilas — mata otomatis membetulkan sendiri kata yang hampir benar.

## Setelah gambarnya jadi

1. Simpan berkasnya (nama sumbernya bebas).
2. **Lihat dulu latarnya sudah transparan atau belum** — ini yang menentukan skripnya, dan
   sempat salah duga di dokumen ini:

   - **Latar sudah transparan** (yang terjadi 2026-09-05):
     `python scripts/trim-alpha.py <art> public/assets/feedback/coba-lagi.webp 720`
     Skrip itu cuma memangkas pinggiran kosong, merapikan alpha, dan mengecilkan — tak ada
     yang ditebak.
   - **Latar putih polos** (seperti gambar singa dulu):
     `python scripts/cut-item.py <art> public/assets/feedback/coba-lagi.webp 720`

   **JANGAN menjalankan `cut-item.py` pada berkas yang latarnya sudah transparan.** Skrip
   itu mencari latar PUTIH — sedangkan di gambar ini bagian putih yang tersisa justru milik
   gambarnya (badan kucing DAN spanduknya), jadi yang terbuang bisa isi gambarnya sendiri.
   Ini gambar paling rawan potong-latar di seluruh proyek.

   (720 = lebar file yang sekarang; overlay-nya tampil maksimal 460px, jadi 720 sudah cukup
   tajam untuk layar 1,5×. Tingginya ikut rasio gambar — 533 px untuk yang sekarang.)
3. **Lihat hasilnya di atas latar berwarna dulu**, jangan di atas putih dan jangan percaya
   angka yang dicetak skripnya. Cara cepat: tempel gambarnya di atas beberapa pita warna
   sekaligus (krem, oranye, hijau muda, abu tua, hampir hitam) — sisa piksel putih atau
   bolong di badan kucingnya langsung terlihat, dan tak akan terlihat di atas putih.
4. Tidak ada kode yang perlu diubah.
5. Deploy seperti biasa; pastikan `dist/assets/feedback/` ikut tersalin ke folder `app/` di
   branch Pages.

## Kalau nanti gambar "Hebat kamu benar!" juga diganti

Pasangannya (`hebat-benar.webp`, singa) tulisannya **sudah cocok** dengan narasinya
("Hebat! Kamu benar!") — jangan ikut diubah tanpa alasan. Kalau suatu saat perlu:
gayanya beda (spanduk biru, huruf biru + pink, konfeti), dan aturan mainnya sama —
lampirkan gambar lamanya, ubah hanya tulisannya, periksa ejaannya huruf per huruf.

**Aturan tetap untuk kedua gambar: kalimat di dalam gambar harus sama persis dengan
kalimat yang diucapkan** (`ENGINE_LINES` di `scripts/extract-narration.mjs`). Kalau
salah satunya diubah, yang lain wajib ikut.
