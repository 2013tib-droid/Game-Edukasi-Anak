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

## Fase 5 (belum diimplementasikan)

- `generate-codes` — generator batch kode aktivasi (format `TK-XXXX-XXXX` /
  `SD1-XXXX-XXXX`), tulis ke koleksi `activation_codes` via Admin SDK.
- Pipeline aset (kompresi WebP + audio) menyusul saat produksi konten.
