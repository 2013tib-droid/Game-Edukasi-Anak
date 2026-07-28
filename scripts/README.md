# Scripts

## `generate-codes.mjs` — generator kode aktivasi ✅ SELESAI

Membuat batch kode aktivasi sekali pakai untuk dijual lewat Mayar.id / Lynk.id.
Tanpa dependency baru dan **tanpa perlu project Firebase** — bisa dipakai
sekarang, jauh sebelum Cloud Function siap.

### Pakai

```bash
npm run gen:codes -- --group tk --count 100 --note "batch launching TikTok"
npm run gen:codes -- --help
```

| Opsi | Arti |
|---|---|
| `-g, --group <tk\|sd1>` | Kelompok yang dibuka kode ini. **Wajib.** |
| `-n, --count <jumlah>` | Banyak kode (1–100000). **Wajib.** |
| `-o, --out <folder>` | Folder keluaran (default `codes/`). |
| `--note <teks>` | Catatan batch, ikut tersimpan di file import. |
| `--dry-run` | Tampilkan contoh kode, tidak menulis file. |
| `--verify <kode>` | Cek satu kode (format + checksum). Exit 0 = valid. |

### Keluaran (3 file per batch, di `codes/`)

| File | Untuk apa |
|---|---|
| `<batch>.txt` | Satu kode per baris — **ini yang di-upload ke Mayar/Lynk** sebagai stok voucher produk digital. |
| `<batch>.csv` | Isi sama, dengan header `code` — kalau platform penjualan minta CSV. |
| `<batch>.import.json` | Dokumen siap-isi untuk koleksi Firestore `activation_codes` (`code`, `group`, `used`, `usedBy`, `usedAt`, `batch`, `note`, `createdAt`). Dipakai di Fase 5. |

> Header CSV Mayar belum diverifikasi terhadap template asli mereka. Kalau
> Mayar menolak filenya, samakan nama kolomnya dengan template yang mereka
> beri — isinya (satu kode per baris) sudah benar.

### Format kode

`TK-XXXX-XXXX` / `SD1-XXXX-XXXX` — 7 karakter acak + 1 karakter checksum.

- **Alfabet `ACDEFGHJKMNPQRTUVWXY34679`** (25 karakter). Karakter yang mudah
  tertukar saat orang tua membaca dari layar HP sengaja dibuang: tidak ada
  `O/0`, `I/1/L`, `S/5`, `Z/2`, `B/8`.
- **Kolam kode 25⁷ ≈ 6,1 miliar per kelompok** — menebak kode orang lain tidak
  praktis.
- **Checksum untuk menangkap salah ketik, BUKAN untuk keamanan.** Terukur:
  99,0% typo satu karakter dan 98,9% dua karakter tertukar langsung ditolak
  tanpa perlu query Firestore. Yang membuat kode tidak bisa ditebak adalah
  ukuran kolamnya, bukan checksum-nya.

### Jaminan keunikan

Script membaca **semua** file `.txt` di folder keluaran sebelum membuat batch
baru, jadi kode tidak pernah bertabrakan dengan batch mana pun sebelumnya.
Artinya: **jangan pindahkan/hapus file `.txt` lama dari `codes/`** — itu
satu-satunya catatan kode yang pernah dibuat sampai Firestore aktif.

### ⚠️ Kode aktivasi = rahasia

Folder `codes/` sudah masuk `.gitignore`. Kode yang bocor sama saja dengan
membagikan game gratis. Simpan salinannya di password manager atau drive
pribadi, jangan di repo dan jangan di chat.

### Dipakai ulang nanti

`generate-codes.mjs` meng-export `generateCode`, `verifyCode`, dan
`checksumChar`. Cloud Function `redeemActivationCode` (Fase 5) sebaiknya
memanggil `verifyCode` supaya kode salah ketik ditolak sebelum menyentuh
Firestore — jangan menyalin ulang algoritmanya, nanti dua versi bisa beda.

## Pipeline aset

Kompresi WebP + audio TTS — menyusul saat produksi konten.
