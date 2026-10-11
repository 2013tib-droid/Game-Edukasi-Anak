# Prompt Ikon Kelompok (SD Kelas 3 & 4, SD Kelas 5 & 6)

Sasaran: field `pic` di `src/data/groups.json` → file `public/assets/groups/<pic>.webp`.
Satu file dipakai DUA tempat (`GroupPic`): kartu di `/portal` (dalam lingkaran putih)
dan judul halaman `/kelompok/:id`. Emoji (`📚`, `🎓`) tetap cadangan.

Sudah ada: `tk.webp` (unicorn pastel memeluk bintang) dan `sd1.webp` (tas sekolah merah
berwajah). Dua ikon baru harus terbaca SATU KELUARGA dengan keduanya.

## Status (2026-10-11) — SELESAI

Kedua ikon sudah terpasang dari percobaan pertama: `sd2.webp` (buku hijau mint +
pensil, 189×256, 13 kB) dan `sd3.webp` (toga biru tua, 256×255, 18 kB), dipotong
`cut-item.py`. Bayangan stiker samar tersisa di tepinya — hanya terlihat di atas warna
gelap, tak terlihat di lingkaran putih kartu. Prompt di bawah tetap untuk penggantian.

## Blok gaya (tempel di awal tiap prompt)

```
Ilustrasi stiker kawaii untuk aplikasi belajar anak Indonesia. Satu objek tunggal
di tengah, digambar penuh (tidak terpotong), garis luar cokelat tua tebal dan rapi,
pewarnaan lembut bergradasi dengan sorot putih, wajah imut di badan objek: dua mata
besar berbinar dengan kilau bintang kecil, pipi merah muda, senyum terbuka.
Latar PUTIH POLOS, tanpa bayangan lantai, tanpa bingkai, tanpa tulisan, tanpa huruf,
tanpa angka. Rasio persegi 1:1.
```

## SD Kelas 3 & 4 (`sd2`, warna kartu ungu-biru)

```
[blok gaya] Objek: sebuah buku tebal yang terbuka sedikit berdiri tegak, sampul
HIJAU MINT, dengan pensil kuning kecil terselip di samping. Wajah imut ada di sampul
depan buku. Halamannya krem, polos tanpa tulisan. Dua-tiga bintang kecil kuning
melayang DEKAT di atas buku (menempel, tidak jauh).
```

Kenapa hijau mint, bukan ungu: kartunya sudah ungu-biru — ikon ungu akan tenggelam
walau berlatar lingkaran putih. Kenapa buku, bukan tas: tas sudah dipakai `sd1`.

## SD Kelas 5 & 6 (`sd3`, warna kartu hijau)

```
[blok gaya] Objek: sebuah topi toga wisuda kecil yang gemuk dan bulat, papan atas
berwarna BIRU TUA LEMBUT (bukan hitam), rumbai kuning keemasan menjuntai ke samping.
Wajah imut ada di bagian bawah topi (badan topi). Dua-tiga bintang kecil kuning
melayang DEKAT di atasnya.
```

Kenapa biru tua, bukan hitam: toga hitam di lingkaran putih terbaca seperti siluet
berat dan wajahnya tidak kelihatan. Kenapa bukan mikroskop/bola dunia: keduanya
sudah dipakai sebagai hiasan pudar di kartu itu (`GROUP_STYLE` di `HomePage.tsx`).

## Aturan yang berlaku untuk keduanya

- **Nol tulisan/angka** — AI hampir selalu salah ketik, dan judul kelompok sudah
  ditulis HTML di sebelahnya. Kalau hasilnya memuat huruf, minta ulang.
- **Bintang menempel dekat objek.** Sesudah dipotong, partikel terluar menentukan
  batas gambar; bintang yang jauh membuat objeknya mengecil di lingkaran 118 px.
- Objek **gemuk & bulat**, wajah di bidang datar terbesar (pelajaran ikon terompet).

## Memasangnya

```
python3 scripts/cut-item.py <gambar.png> public/assets/groups/sd2.webp 256
python3 scripts/cut-item.py <gambar.png> public/assets/groups/sd3.webp 256
```

256 px sisi terpanjang, sama dengan `tk`/`sd1`. Lalu tambahkan `"pic": "sd2"` /
`"pic": "sd3"` di `groups.json`. Tempel hasil potong di atas warna mencolok dulu —
bagian putih yang terkurung (halaman buku, sorot) harus utuh, dan lubang tertutup
(mis. celah antara pensil & buku) mungkin perlu ditembus manual.
Kalau latarnya datang transparan, pakai `scripts/trim-alpha.py`, jangan `cut-item.py`.
