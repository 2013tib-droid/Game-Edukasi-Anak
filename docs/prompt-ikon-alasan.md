# Prompt gambar: ikon "Kenapa orang tua memilih" (landing)

Enam kartu di landing (`reasons` di `src/portal/LandingPage.tsx`) dulu memakai
emoji (🎮 🔊 🚫 💪 🐣 💛). Emoji beda bentuk di tiap HP dan 🚫 terbaca seperti
rambu larangan, bukan kabar baik. Kartu **"Teman yang tumbuh"** sudah memakai
seni yang ada (`mascot/mascot-2.webp`, anak ayam menetas). Lima sisanya butuh
gambar baru.

## Aturan untuk kelimanya

- Tampil cuma **±40 px** di kotak pastel. Jadi: **SATU benda besar**, bentuk
  tebal & sederhana, tanpa detail halus, **tanpa tulisan/angka apa pun**.
- Gaya **sama dengan ikon game** (`public/assets/games/*.webp`): render 3D
  lembut, warna pastel cerah, benda berwajah imut (mata bulat, pipi merah muda,
  senyum).
- **Latar putih polos**, tanpa bayangan lantai, tanpa benda melayang di
  sekitarnya, tanpa bingkai/kotak di belakangnya (kotak pastelnya digambar
  halaman).
- **Jangan ungu** (pemilik tidak suka ungu).
- Satu gambar = satu permintaan; kalau AI-nya membuat lembar berisi banyak
  ikon, minta ulang satu per satu.

Ekor prompt (tempel di akhir tiap prompt di bawah):

> Gaya ilustrasi 3D lembut seperti ikon aplikasi anak, warna pastel cerah,
> benda berwajah imut dengan mata bulat dan pipi merah muda. Satu benda saja di
> tengah, latar putih polos, tanpa bayangan di lantai, tanpa tulisan, tanpa
> huruf, tanpa angka, tanpa benda lain di sekitarnya.

## Lima prompt

| Berkas | Kartu | Prompt |
|---|---|---|
| `game-edukatif.webp` | "… game edukatif" | Stik game (gamepad) berwarna biru muda dengan tombol warna-warni, tersenyum lebar. |
| `dipandu-suara.webp` | "Dipandu suara" | Pengeras suara (speaker) kecil berwarna kuning dengan tiga gelombang suara melengkung keluar dari depannya, tersenyum sambil "bernyanyi". |
| `tanpa-iklan.webp` | "Tanpa iklan" | Perisai (tameng) berwarna merah muda dengan hati putih di tengahnya, tersenyum tenang — kesan "aman dan terlindungi". JANGAN tanda larangan / lingkaran dicoret. |
| `salah-itu-boleh.webp` | "Salah itu boleh" | Pensil berwarna oranye dengan penghapus merah muda di ujungnya, sedang menghapus coretan kecil sambil tersenyum ramah. |
| `sekali-bayar.webp` | "Sekali bayar" | Kunci emas berbentuk gemuk dengan pita hijau muda berbentuk hati di pegangannya, tersenyum. |

## Setelah gambarnya datang

1. Kirim gambarnya ke sesi Claude.
2. Dipotong dengan **`scripts/cut-soft.py`** (render 3D lembut di latar putih),
   ±160 px, disimpan ke `public/assets/reasons/<berkas>.webp`. Kalau latarnya
   sudah transparan: `scripts/trim-alpha.py`.
3. Isi `art: 'reasons/<berkas>.webp'` di kartu yang sesuai — **hanya setelah
   berkasnya ada** (berkas yang belum ada = 404 di console). Emoji tetap jadi
   cadangan kalau gambarnya gagal dimuat.
