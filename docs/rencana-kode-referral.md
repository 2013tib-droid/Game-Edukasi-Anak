# Rencana Fitur: Kode Referral

Status: DISETUJUI pemilik (2026-07) — pembayaran memakai **payment gateway
QRIS dinamis** (Tripay/Duitku), bukan Lynk.id/Mayar.id dan bukan QRIS statis
manual. Implementasi menunggu fondasi Fase 1 (Firebase) tersedia.

## Ringkasan

Sistem kode referral untuk promosi, menumpang pada sistem akses di CLAUDE.md.
Ada 2 jenis kode:

| Jenis | Efek | Cara kerja |
|---|---|---|
| **Full gratis (100%)** | Akses kelompok langsung terbuka tanpa bayar | Redeem di halaman aktivasi → Cloud Function set akses di dokumen user |
| **Diskon 50%** | Bayar setengah harga | Kode dimasukkan di halaman checkout portal → nominal QRIS dinamis otomatis dipotong 50% → bayar → webhook membuka akses |

Sifat kode:
- **Dinamis / banyak**: di-generate batch via script, tiap kode unik, tiap
  batch ditandai sumbernya (`referrer`) — misal tiap teman/influencer/
  kampanye TikTok punya batch sendiri, sehingga terlihat kode siapa yang
  paling banyak dipakai.
- **Sekali pakai**: begitu terpakai, ditandai `used` secara atomik
  (transaksi Firestore). Input ulang ditolak: "Kode sudah terpakai".

## Alur Pembayaran (konteks — jalur utama portal)

1. Orang tua login → area orang tua → pilih kelompok → Beli.
2. Cloud Function `createPayment` membuat invoice QRIS dinamis di gateway
   (nominal terkunci di server, bukan dari client).
3. Pembeli scan & bayar dari aplikasi apa pun.
4. Gateway kirim webhook → Cloud Function `paymentWebhook` verifikasi
   signature → set `users/{uid}.access.<group> = true` + catat di
   `purchases`. Tidak ada langkah manual.

## Model Data (Firestore)

Koleksi `referral_codes` (terpisah dari `activation_codes`):

```
referral_codes/{code}
  code:        "REF-TK-F-7K3M9Q"       // juga jadi doc ID
  type:        "full" | "half"
  group:       "tk" | "sd1"
  referrer:    "tiktok-jan26" | "budi"  // sumber/batch, diisi saat generate
  batchId:     "2026-07-16-001"
  status:      "available" | "reserved" | "used"
  reservedBy:  null | uid               // half: saat invoice dibuat
  reservedAt:  null | <timestamp>       // reservasi kedaluwarsa 24 jam
  usedBy:      null | uid
  usedAt:      null | <timestamp>
  createdAt:   <timestamp>
```

Format kode: `REF-<GROUP>-<F|H>-<6 char acak>` (tanpa karakter membingungkan
seperti 0/O, 1/I). 6 karakter dari 31 simbol ≈ 887 juta kombinasi — aman dari
tebak-tebakan, tetap mudah diketik di HP.

Di dokumen user: `referralRedeemed: { tk: "REF-...", sd1: null }` untuk
membatasi 1 redeem referral per akun per kelompok.

## Alur Redeem

**Kode full (100%)** — Cloud Function `redeemReferralCode`, wajib login,
satu transaksi Firestore:
1. Kode tidak ada → "Kode tidak ditemukan".
2. `status != "available"` → "Kode sudah terpakai".
3. User sudah pernah redeem kelompok itu → tolak.
4. Set `status: "used"`, `usedBy`, `usedAt` + `access.<group> = true`.

**Kode half (50%)** — menempel di alur checkout:
1. Di halaman checkout ada kolom "Punya kode referral?". Kode divalidasi
   oleh `createPayment`: harus `available` (atau `reserved` oleh user yang
   sama & belum kedaluwarsa — supaya bisa coba bayar ulang).
2. `createPayment` membuat invoice dengan nominal 50% dan set kode ke
   `reserved` (bukan langsung `used` — kalau tidak jadi bayar, kode tidak
   hangus; reservasi kedaluwarsa otomatis 24 jam lalu kembali `available`).
3. Webhook pembayaran sukses → kode jadi `used` + akses terbuka, dalam
   transaksi yang sama dengan pencatatan `purchases`.

Anti-abuse:
- Rate limit ±5 percobaan kode gagal per akun per jam (anti brute force).
- Koleksi `referral_codes` tidak bisa dibaca/ditulis client sama sekali —
  hanya lewat Cloud Function.
- Nominal invoice selalu dihitung di server dari harga kelompok + status
  kode; client tidak pernah mengirim angka harga.

## Generator Kode

`scripts/generate-referral-codes.js` (Node + firebase-admin):

```
node scripts/generate-referral-codes.js --type=half --group=tk \
  --count=50 --referrer=tiktok-jan26
```

Menulis N kode unik ke Firestore + ekspor CSV untuk dibagikan. Bisa
dijalankan kapan saja → stok kode tidak terbatas, batch baru per kampanye.

## UI (area orang tua)

- **Halaman aktivasi**: satu kolom input menerima kode aktivasi maupun kode
  referral full (dibedakan dari prefiks `REF-`). Sukses → "Selamat! Paket
  TK terbuka 🎉".
- **Halaman checkout**: kolom opsional kode referral 50% → harga coret
  Rp29.000 → Rp14.500 → tampil QRIS dinamis.
- Gagal → pesan jelas: kode salah / sudah terpakai / sudah pernah pakai.
- Semua di balik gerbang orang tua, tidak tersentuh area anak.

## Prasyarat & Urutan Kerja

Butuh fondasi yang belum ada di repo (masih HTML standalone): Firebase Auth
+ Firestore + portal (Fase 1), Cloud Functions (Blaze plan — perlu kartu,
praktis Rp0 di volume kecil), dan akun payment gateway (Tripay/Duitku,
pendaftaran perorangan cukup KTP).

1. Fondasi Fase 1: project Firebase, Auth, portal dasar.
2. Daftar akun gateway → dapatkan API key + merchant code (simpan di
   secret/config Functions, JANGAN di repo).
3. `createPayment` + `paymentWebhook` (jalur beli normal, tanpa referral).
4. Koleksi `referral_codes` + security rules + `redeemReferralCode` (full).
5. Dukungan kode half di `createPayment`/`paymentWebhook` (reserve → used).
6. Script generator + ekspor CSV.
7. UI aktivasi & checkout.
8. Uji end-to-end di sandbox gateway: bayar normal, bayar dengan kode 50%,
   kode dipakai 2x, reservasi kedaluwarsa, brute force (rate limit),
   redeem kedua di akun sama.
