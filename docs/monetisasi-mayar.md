# Monetisasi & Koneksi Mayar.id (Fase 5)

Dokumen kerja untuk Fase 5. CLAUDE.md memegang keputusan produk; detail
teknis penjualan ada di sini.

## Jawaban singkat: perlu domain sendiri?

**Tidak.** Domain sendiri bukan syarat teknis untuk apa pun di alur ini.

- Mayar memberi subdomain gratis (`namatoko.myr.id`) untuk halaman produk &
  checkout. Domain kustom di Mayar itu fitur kosmetik paket berbayar.
- Sisi kita cuma butuh **URL HTTPS publik**, dan itu sudah/akan ada gratis:
  - sekarang: `https://2013tib-droid.github.io/Game-Edukasi-Anak/app/`
  - produksi: `https://<project>.web.app` (Firebase Hosting)
  - webhook nanti: `https://<region>-<project>.cloudfunctions.net/mayarWebhook`

Beli domain `.com` murni keputusan marketing (biar rapi di bio TikTok), bisa
ditambahkan kapan saja tanpa mengubah kode.

## Yang benar-benar jadi prasyarat

| # | Prasyarat | Status | Siapa |
|---|---|---|---|
| 1 | Akun Mayar terverifikasi (KYC: KTP + rekening bank) | ⬜ belum | pemilik |
| 2 | Project Firebase dibuat, `.env` diisi | ⬜ belum | pemilik |
| 3 | Firebase paket **Blaze** (Cloud Functions butuh billing) | ⬜ belum | pemilik — **hanya untuk jalur B** |
| 4 | Generator kode aktivasi | ✅ selesai | `scripts/generate-codes.mjs` |
| 5 | Cloud Function `redeemActivationCode` | ⬜ belum | Fase 5 |
| 6 | Halaman aktivasi tersambung ke function | ⬜ belum | `src/auth/ActivationPage.tsx` masih stub |
| 7 | Batas 3 device per akun | ⬜ belum | Fase 5 |

## Dua jalur koneksi

### Jalur A — voucher pre-generated (dipilih untuk rilis pertama)

1. Jalankan `npm run gen:codes -- -g tk -n 100`.
2. Upload `codes/<batch>.txt` ke Mayar sebagai **stok voucher produk digital**.
3. Mayar mengirim satu kode otomatis ke tiap pembeli setelah bayar.
4. Portal memvalidasi kode lewat `redeemActivationCode`.

**Kelebihan:** tidak butuh webhook, tidak butuh Blaze untuk menjual, bisa
jalan segera. **Kekurangan:** stok kode di Mayar harus di-isi ulang manual
saat menipis — pantau, jangan sampai pembeli dapat "stok habis".

Cocok untuk 100–200 pembeli pertama.

### Jalur B — webhook (tujuan akhir, nanti)

Mayar mengirim notifikasi pembayaran ke Cloud Function → kode dibuat
on-the-fly, disimpan ke `activation_codes`, dikirim via email. Otomatis penuh,
tanpa stok. Butuh Blaze + verifikasi signature webhook. Naik ke sini setelah
penjualan stabil.

## Catatan implementasi Fase 5

- **`activation_codes` doc id = kode itu sendiri.** `firestore.rules` sudah
  menutup koleksi ini total dari client (`allow read, write: if false`) —
  hanya Admin SDK di Cloud Function yang boleh menyentuh. Jangan longgarkan.
- **Penukaran harus transaksional**: baca kode → tolak kalau `used == true` →
  set `used/usedBy/usedAt` + tambah group ke `users/{uid}.groups`, semuanya
  dalam satu `runTransaction`. Tanpa ini, dua tab bisa menukar kode yang sama.
- **Panggil `verifyCode` dari `scripts/generate-codes.mjs`** sebelum query
  Firestore — kode salah ketik ditolak gratis. Jangan salin ulang algoritma
  checksum-nya ke tempat lain.
- **Impor batch ke Firestore**: `<batch>.import.json` sudah berbentuk dokumen
  final, tinggal loop `batch.set(db.doc('activation_codes/' + d.code), d)`
  (maks 500 per batch write).
- Rate-limit percobaan penukaran per akun supaya kode tidak bisa di-brute
  force, walaupun kolam 25⁷ sudah membuatnya tidak praktis.
