# Prompt gambar: dua tokoh anak di layar "Pilih Mata Pelajaran"

Untuk layar mapel SD Kelas 3 & 4 dan SD Kelas 5 & 6 (mockup pemilik 2026-10-05).
Dua gambar TERPISAH (satu tokoh per gambar), supaya bisa ditaruh di sisi kiri
layar tablet dan cukup satu di HP.

## Blok gaya (tempel di depan kedua prompt)

> Ilustrasi 3D lembut gaya buku anak, karakter chibi anak SD Indonesia, mata
> besar berbinar, senyum ceria, warna pastel hangat, pencahayaan lembut.
> Latar PUTIH POLOS, tanpa bayangan di lantai, tanpa tulisan, tanpa logo,
> tanpa benda melayang di sekitar tokoh. Seluruh badan terlihat dari kepala
> sampai kaki, tidak terpotong. Rasio 2:3 (tegak).

## Tokoh 1 — anak laki-laki

> Anak laki-laki kelas 4 SD, rambut cokelat agak berantakan, seragam SD
> Indonesia (kemeja putih lengan pendek, celana merah, dasi merah), ransel
> merah, memeluk satu buku hijau di tangan kiri, tangan kanan mengepal
> semangat. Badan sedikit menghadap ke KANAN.

## Tokoh 2 — anak perempuan berhijab

> Anak perempuan kelas 4 SD berhijab putih/lavender lembut, seragam SD
> Indonesia (kemeja putih, rok merah), ransel merah, memeluk buku ungu
> bergambar hati di depan dada, tangan kanan melambai. Badan sedikit
> menghadap ke KANAN.

## Catatan

- **Jangan papan kayu bertulisan** seperti di mockup: tulisan di gambar AI
  sering salah eja, dan layar ini harus tetap terbaca di HP 320 px.
- Keduanya menghadap ke kanan karena akan berdiri di KIRI kartu mapel.
- Kirim apa adanya (JPEG/PNG latar putih); dipotong dengan `scripts/cut-soft.py`
  (render 3D lembut tanpa outline), bukan `cut-item.py`.
