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
| 1 | Akun Mayar terverifikasi (KYC: KTP + rekening bank) | ⬜ belum | **pemilik** |
| 2 | Project Firebase dibuat, `.env` diisi | ⬜ belum | **pemilik** |
| 3 | Firebase paket **Blaze** (Cloud Functions butuh billing) | ⬜ belum | **pemilik** |
| 4 | Generator kode aktivasi | ✅ selesai | `scripts/generate-codes.mjs` |
| 5 | Cloud Function `redeemActivationCode` | ✅ selesai | `functions/src/index.ts` |
| 6 | Halaman aktivasi tersambung ke function | ✅ selesai | `src/auth/ActivationPage.tsx` |
| 7 | Batas 3 device per akun | ✅ selesai | `verifyAccess` + `src/auth/device.ts` |
| 8 | Gerbang akses online saat game diluncurkan | ✅ selesai | `src/portal/GamePage.tsx` |

Semua kode Fase 5 sudah jadi dan teruji lawan Firebase Emulator (42
assertion, `npm run test:emulator`). **Yang tersisa murni pekerjaan akun
pemilik** — begitu `.env` diisi dan Blaze aktif, tinggal `firebase deploy`.

> Catatan Blaze: sekarang dibutuhkan juga untuk jalur A, karena validasi kode
> berjalan di Cloud Function. Praktiknya tetap gratis di skala kita — kuota
> gratis Blaze jauh di atas beberapa ribu pemanggilan per bulan — tapi kartu
> kredit/debit tetap harus terpasang.

## Dua jalur koneksi

### Jalur A — voucher pre-generated (dipilih untuk rilis pertama)

1. Jalankan `npm run gen:codes -- -g tk -n 100`.
2. Upload `codes/<batch>.txt` ke Mayar sebagai **stok voucher produk digital**.
3. Mayar mengirim satu kode otomatis ke tiap pembeli setelah bayar.
4. Portal memvalidasi kode lewat `redeemActivationCode`.

**Kelebihan:** tidak butuh webhook, tidak butuh integrasi API Mayar sama
sekali, dan tidak ada kode yang dibuat otomatis saat pembayaran — jadi tidak
ada yang bisa rusak di jam ramai. **Kekurangan:** stok kode di Mayar harus
di-isi ulang manual saat menipis — pantau, jangan sampai pembeli dapat "stok
habis".

Cocok untuk 100–200 pembeli pertama.

> **Koreksi (2026-07-28):** perkiraan awal "jalur A tidak butuh Blaze" TIDAK
> berlaku lagi. Penukaran kode divalidasi Cloud Function (satu-satunya cara
> menjaga `activation_codes` tetap tertutup dari browser), dan Cloud
> Functions mensyaratkan Blaze. Biayanya tetap praktis nol di skala kita,
> tapi kartu harus terpasang sebelum bisa menjual.

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
