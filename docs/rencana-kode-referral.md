# Rencana Fitur: Kode Referral

Status: RENCANA — menunggu konfirmasi pemilik proyek sebelum implementasi.

## Ringkasan

Sistem kode referral untuk promosi, menumpang pada infrastruktur kode aktivasi
(CLAUDE.md, bagian "Sistem Akses"). Ada 2 jenis kode:

| Jenis | Efek | Cara kerja |
|---|---|---|
| **Full gratis (100%)** | Akses kelompok langsung terbuka tanpa bayar | Sama seperti kode aktivasi: redeem di portal → akses di-set di dokumen user |
| **Diskon 50%** | Bayar setengah harga | Redeem di portal → portal menampilkan link checkout khusus harga 50% di Lynk.id/Mayar.id → setelah bayar, pembeli menerima kode aktivasi normal |

Sifat kode:
- **Dinamis / banyak**: kode di-generate batch via script, tiap kode unik.
  Setiap batch bisa ditandai sumber referensinya (`referrer`) — misal tiap
  teman/influencer/kampanye TikTok punya batch kodenya sendiri, sehingga bisa
  dilacak kode siapa yang paling banyak dipakai.
- **Sekali pakai**: begitu kode terpakai, ditandai `used: true` secara atomik
  (transaksi Firestore di Cloud Function). Input ulang kode yang sama ditolak
  dengan pesan "Kode sudah terpakai".

## Keputusan yang perlu dikonfirmasi

1. **Mekanisme diskon 50%.** Karena pembayaran lewat Lynk.id/Mayar.id
   (eksternal), diskon tidak bisa dipotong di dalam aplikasi. Usulan:
   buat **produk terpisah berharga 50%** di Lynk.id/Mayar.id yang link
   checkout-nya TIDAK dipublikasikan. Link hanya ditampilkan setelah kode
   referral 50% tervalidasi (dan kode langsung ditandai terpakai).
   Alternatif: pakai fitur voucher bawaan Lynk.id/Mayar.id — tapi status
   "terpakai" jadi dikelola platform mereka, tidak bisa kita lacak/batasi
   sendiri.
2. **Cakupan kode**: satu kode berlaku untuk 1 kelompok (TK atau SD Awal)
   saja, atau boleh ada kode "semua kelompok"? Usulan: per kelompok, sama
   seperti kode aktivasi.
3. **Batas per akun**: maksimal 1 redeem kode referral per akun per kelompok
   (mencegah orang menimbun kode gratis). Usulan: ya, dibatasi.
4. Cloud Functions butuh Firebase **Blaze plan** (pay-as-you-go; praktis
   Rp0 pada volume kecil, tapi perlu kartu). Ini juga sudah jadi kebutuhan
   Fase 5 (validasi kode aktivasi), bukan tambahan baru.

## Model Data (Firestore)

Koleksi baru `referral_codes` (dipisah dari `activation_codes` agar laporan
dan aturan berbeda tidak bercampur):

```
referral_codes/{code}
  code:        "REF-TK-F-7K3M9Q"       // juga jadi doc ID
  type:        "full" | "half"          // full gratis | diskon 50%
  group:       "tk" | "sd1"
  referrer:    "tiktok-jan26" | "budi"  // sumber/batch, bebas diisi saat generate
  batchId:     "2026-07-16-001"
  used:        false
  usedBy:      null                      // uid setelah terpakai
  usedAt:      null
  createdAt:   <timestamp>
```

Format kode: `REF-<GROUP>-<F|H>-<6 char acak>` (huruf/angka tanpa karakter
membingungkan seperti 0/O, 1/I). 6 karakter dari 31 simbol ≈ 887 juta
kombinasi — cukup aman dari tebak-tebakan, tetap mudah diketik di HP.

Tambahan di dokumen user:

```
users/{uid}
  access: { tk: true, ... }             // sudah ada di desain aktivasi
  referralRedeemed: { tk: "REF-...", sd1: null }   // untuk batas 1x per kelompok
```

## Alur Redeem (Cloud Function `redeemReferralCode`)

Callable function, wajib login. Dalam **satu transaksi Firestore**:

1. Ambil dokumen kode. Tidak ada → tolak: "Kode tidak ditemukan".
2. `used == true` → tolak: "Kode sudah terpakai".
3. User sudah pernah redeem untuk kelompok itu → tolak.
4. Tandai `used: true, usedBy, usedAt` + catat di `users/{uid}.referralRedeemed`.
5. Efek sesuai jenis:
   - `full` → set `users/{uid}.access.<group> = true` → game langsung terbuka.
   - `half` → kembalikan URL checkout produk 50% (disimpan di config server,
     bukan di bundle JS publik) → portal menampilkan tombol "Bayar Rp X (50%)".

Anti-abuse:
- **Rate limit**: maksimal ±5 percobaan kode gagal per akun per jam
  (counter di `users/{uid}/private/rateLimit`), supaya kode tidak bisa
  di-brute-force.
- **Security rules**: koleksi `referral_codes` sama sekali tidak bisa
  dibaca/ditulis client — hanya lewat Cloud Function.

## Generator Kode

`scripts/generate-referral-codes.js` (Node + firebase-admin):

```
node scripts/generate-referral-codes.js --type=half --group=tk \
  --count=50 --referrer=tiktok-jan26
```

- Menulis N kode unik ke Firestore + ekspor CSV (untuk dibagikan/dikirim
  ke referrer).
- Bisa dijalankan kapan saja → inilah sifat "dinamis": stok kode tidak
  terbatas, tinggal generate batch baru per kampanye/orang.

## UI (halaman aktivasi, area orang tua)

- Satu kolom input kode di halaman aktivasi menerima **kode aktivasi maupun
  kode referral** (dibedakan dari prefiks `REF-`), jadi orang tua tidak
  bingung memilih form.
- Sukses full → popup "Selamat! Paket TK terbuka 🎉".
- Sukses 50% → tampilkan harga coret + tombol menuju checkout diskon.
- Gagal → pesan jelas: kode salah / sudah terpakai / sudah pernah pakai.
- Tetap di balik gerbang orang tua, tidak tersentuh area anak.

## Ketergantungan & Urutan Kerja

Fitur ini butuh fondasi yang belum ada di repo (masih HTML standalone):
Firebase Auth + Firestore + portal (Fase 1) dan Cloud Functions (Fase 5).
Urutan implementasi saat dikerjakan:

1. Fondasi Fase 1 minimal (kalau belum ada): project Firebase, Auth, portal.
2. Koleksi `referral_codes` + security rules.
3. Cloud Function `redeemReferralCode` (transaksi + rate limit).
4. Script generator + ekspor CSV.
5. UI halaman aktivasi (input kode gabungan).
6. Produk 50% di Lynk.id/Mayar.id + simpan URL-nya di config Functions.
7. Uji: kode valid, kode terpakai 2x, kode salah berulang (rate limit),
   redeem kedua di akun sama.
