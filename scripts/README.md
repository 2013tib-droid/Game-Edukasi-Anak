# Scripts

## Aset

- `cut-item-sheet.py` — memotong satu lembar gambar dari pemilik (grid benda
  + tulisan di bawahnya) jadi file WebP transparan per benda, siap ditaruh di
  `public/assets/items/`. Butuh `pillow numpy scipy`. Sesuaikan `NAMES`,
  `ART_ROWS` dan `HOLES` untuk lembar berikutnya, lalu **selalu lihat
  hasilnya di atas latar berwarna** sebelum dipakai.
- `check-item-ids.mjs` — `node scripts/check-item-ids.mjs`. Memeriksa semua id
  item yang dirujuk config game benar-benar terdaftar di `items.ts` dan
  asetnya ada. Id yang salah TIDAK kelihatan saat main (diam-diam jatuh ke
  emoji), jadi jalankan ini tiap kali menambah seni baru.

## Suara / narasi

- `extract-narration.mjs` — `npm run narasi`. Mengumpulkan SEMUA kalimat yang
  bisa diucapkan app (narasi tiap varian tiap slot, teks halaman cerita +
  pilihan A/B/C, kalimat tetap engine) ke `narration-lines.json`, lalu
  melaporkan jumlah baris, jumlah karakter, dan berapa besar porsinya
  terhadap kuota gratis Azure. Ini INPUT untuk skrip render TTS.
  Jalankan ulang tiap kali menambah/mengubah narasi — kalimat yang tidak
  berubah tetap memakai `key` yang sama, jadi audionya tidak perlu dirender
  ulang.
- `render-narration.mjs` — `npm run suara`. Merender tiap baris jadi
  `public/assets/voice/<scope>/<key>.mp3` lewat Azure Speech, lalu menulis
  `manifest.json` yang dibaca app. Butuh `AZURE_SPEECH_KEY` &
  `AZURE_SPEECH_REGION` di `.env` (lihat `.env.example`).
  - `-- --dry-run` melihat rencananya tanpa memanggil Azure.
  - `-- --only=hutan-hewan` merender satu game dulu — **dengarkan hasilnya
    sebelum merender semuanya.**
  - `-- --rpm=100` kalau memakai tier bayar (bawaan 20 = batas tier gratis).
  - `-- --prune` membuang file audio yang kalimatnya sudah dihapus dari config.
  - File yang sudah ada DILEWATI, jadi skrip ini aman diulang kalau koneksi
    putus — dan tidak memakan kuota dua kali.
  - Sesudah render: `npm run build` lalu deploy (folder `assets/voice/` ikut).

## Fase 5 (belum diimplementasikan)

- `generate-codes` — generator batch kode aktivasi (format `TK-XXXX-XXXX` /
  `SD1-XXXX-XXXX`), tulis ke koleksi `activation_codes` via Admin SDK.
- Pipeline aset (kompresi WebP + audio) menyusul saat produksi konten.
