# Memindahkan riwayat pesanan dari dasbor Mayar ke database kita

Ada **dua jalur** data Mayar masuk ke Firestore `orders`:

| Jalur | Untuk apa | Status |
|---|---|---|
| **Webhook** (`mayarWebhook`) | Pembayaran BARU — otomatis tiap ada yang bayar, sekalian membuat & mengirim kode | Sudah ada, lihat `docs/kirim-kode-otomatis.md` |
| **Tarik via API** (`functions/scripts/import-mayar.mjs`) | Pembayaran LAMA yang terjadi sebelum webhook terpasang | Panduan ini |

Keduanya menulis ke koleksi yang sama dengan **id transaksi Mayar** sebagai id dokumen,
jadi satu pembayaran tidak pernah tercatat dua kali.

## Yang dilakukan skrip impor — dan yang TIDAK

- ✅ Mengambil semua transaksi **lunas** dari Mayar (`GET /hl/v2/transactions`, endpoint yang sama dengan `mayar tx list`).
- ✅ Mencatatnya di `orders/{id}` dengan `source: "mayar-impor"`, kelompoknya, nominal, email, dan tanggal bayar asli (`paidAt`).
- ❌ **Tidak membuat kode aktivasi dan tidak mengirim email.** Pembeli lama sudah Anda layani manual — kode baru untuk mereka = akses gratis kedua. Karena `code: null`, pesanan impor juga tidak muncul di lonceng "Aktifkan sekarang".
- ❌ **Tidak pernah menimpa** pesanan yang sudah ada (yang dari webhook memegang kode yang sudah terkirim).
- ❌ Tidak menaikkan angka statistik harian.

> ⚠️ **JANGAN memakai "Retry" di riwayat webhook Mayar untuk pembayaran lama.** Itu memanggil webhook sungguhan, yang **membuat kode baru dan mengirim email** ke tiap pembeli lama.

## Dijalankan di komputer sendiri

Sama seperti mencetak kode: jangan lewat GitHub Actions. Hasilnya memuat email pembeli,
dan log Actions di repo publik bisa dibaca siapa saja.

Persiapan (Node.js, salinan repo, `npm ci` di folder `functions`, file `kunci.json`) sama
persis dengan `docs/cetak-kode-di-pc.md` bagian "Sekali saja" — kalau sudah pernah mencetak
kode, tinggal lanjut.

Tambahannya cuma **API key Mayar**: web.mayar.id → **Integration → API Key** → salin.
Simpan seperti kata sandi — kunci ini bisa membaca semua transaksi Anda.

## Langkahnya (PowerShell, dari folder `functions`)

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'
$env:MAYAR_API_KEY = 'tempel-api-key-mayar-di-sini'

# 1. Coba dulu — TIDAK menulis apa pun, cuma melapor
node scripts/import-mayar.mjs
```

Laporannya berbentuk angka, misalnya:

```
Diambil dari Mayar    : 42 transaksi
Dilewati, status UNPAID: 3
Pesanan lunas         : 39
  tk               30 pesanan · Rp570.000
  sd1               9 pesanan · Rp261.000
Sudah ada di Firestore : 5 · akan dicatat baru: 34
```

Cocokkan jumlah & rupiahnya dengan dasbor Mayar. Kalau sudah pas:

```powershell
# 2. Tulis sungguhan
node scripts/import-mayar.mjs --write
```

Aman dijalankan berulang kali — yang sudah ada dilewati.

### Pilihan tambahan

| Pilihan | Arti |
|---|---|
| `--since=2026-09-01` | hanya transaksi sejak tanggal ini (WIB) |
| `--until=2026-09-25` | hanya sampai tanggal ini (WIB, termasuk hari itu) |
| `--sandbox` | memakai akun uji `api.mayar.club` |

Contoh: kalau webhook mulai jalan 26 September, cukup
`node scripts/import-mayar.mjs --until=2026-09-25 --write`. (Tanpa batas pun tidak apa-apa:
pesanan dari webhook terlewati sendiri.)

## Kalau ada "produknya tidak dikenal"

Skrip menebak kelompok dari nama produk (sama dengan webhook). Kalau tidak bisa, id
transaksinya dicetak dan pesanan tetap dicatat dengan `problem: "produk-tidak-dikenal"`.

Perbaikannya: di Firebase Console → Firestore → dokumen `config/mayar_products`, tambahkan
`"<id produk Mayar>": "tk"` (atau `"sd1"`), lalu jalankan `--write` lagi — pesanan impor yang
tadinya tanpa kelompok akan diberi kelompoknya.

## Kalau ada pesan error

| Pesan | Artinya |
|---|---|
| `MAYAR_API_KEY belum diisi` | baris `$env:MAYAR_API_KEY = …` belum dijalankan di jendela PowerShell ini |
| `API Mayar menolak kuncinya (401)` | API key salah/kedaluwarsa, atau key sandbox dipakai tanpa `--sandbox` (dan sebaliknya) |
| `Could not load the default credentials` | `kunci.json` tidak ditemukan — lihat `docs/cetak-kode-di-pc.md` |
