# Cloud Functions — sistem akses berbayar (Fase 5)

Semua keputusan "boleh main atau tidak" ada di sini, bukan di HP. Kode di
`src/index.ts`, tiga callable:

| Function | Gunanya |
|---|---|
| `redeemActivationCode` | Menukar kode aktivasi jadi akses kelompok. Satu transaksi Firestore, jadi satu kode tak bisa dipakai dua kali walau dua HP menekan bersamaan. |
| `registerDevice` | Mendaftarkan perangkat; menolak kalau sudah 3. Penolakannya membawa daftar perangkat supaya orang tua bisa memilih mana yang dilepas. |
| `removeDevice` | Melepas satu perangkat supaya slotnya bisa dipakai HP baru. |

Region: **asia-southeast2 (Jakarta)**. Client harus memakai region yang sama —
lihat `FUNCTIONS_REGION` di `src/auth/firebase.ts`.

## Perintah

```bash
npm ci          # pasang dependency
npm run build   # compile TypeScript ke lib/
npm run typecheck
```

## Menjalankan & menguji tanpa project Firebase

```bash
# dari akar repo
npx firebase emulators:start --only auth,firestore,functions --project demo-petualangan

# lalu build app-nya menunjuk emulator
VITE_USE_EMULATOR=1 VITE_LOCK_MODE=kunci \
VITE_FIREBASE_API_KEY=fake VITE_FIREBASE_PROJECT_ID=demo-petualangan \
VITE_FIREBASE_APP_ID=1:2:web:3 npm run build && npx vite preview
```

**JANGAN mengedit `firestore.rules` selagi emulator jalan.** File-watcher
Firebase CLI akan memuat ulang rules, dan di lingkungan yang permintaan
keluarnya dibatasi, CLI-nya mati dengan `Unable to parse JSON: "denied by..."`.
Hentikan emulator dulu, ubah rules, baru jalankan lagi.

## Membuat kode aktivasi

**Panduan lengkap langkah demi langkah untuk Windows/PowerShell — mulai dari
memasang Node.js sampai mengambil kunci Firebase — ada di
[`docs/cetak-kode-di-pc.md`](../docs/cetak-kode-di-pc.md).** Ringkasnya, dari
folder `functions`:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'
node scripts/generate-codes.mjs --group=tk --count=50 --batch=jual-01 --out=kode-tk.csv
```

Di macOS/Linux baris `$env:` diganti `GOOGLE_APPLICATION_CREDENTIALS=kunci.json`
di depan perintahnya. **Jangan pakai Git Bash di Windows** — MSYS menerjemahkan
nilai yang berbentuk path dan kuncinya jadi tak ketemu.

Coba dulu dengan `--dry-run` untuk melihat bentuk kodenya tanpa menyimpan.
Skripnya sengaja **tidak mencetak kodenya ke layar** — hanya jumlahnya.

> ⚠️ **Jangan mencetak kode jualan lewat GitHub Actions selama repo ini
> PUBLIK.** Log workflow (90 hari) dan artifact (7 hari) di repo publik bisa
> diunduh siapa saja tanpa login. Jalankan perintah di atas di komputer
> sendiri. Tombol Actions aman untuk `dry_run` saja.
>
> Batch yang terlanjur bocor dibatalkan dengan
> `node scripts/revoke-codes.mjs --batch=<nama>` (atau Actions → "Batalkan
> kode aktivasi"). Kode ditandai terpakai, bukan dihapus — dokumen yang
> dihapus bisa dibuat ulang oleh generator dan menghidupkan kode yang bocor.

Bentuknya **enam karakter**, dicetak `K7P-M4X`. Huruf & angka yang tidak bisa
tertukar (tanpa I, L, O, 0, 1) — jangan tambahkan karakter ambigu, tiap satu
berubah jadi tiket "kode saya tidak bisa" di WhatsApp.

Enam karakter itu aman karena penukaran direm di server (10 kegagalan per jam
per akun). Kalau rem itu dilonggarkan, panjang kodenya harus ditinjau ulang.

Orang tua tidak perlu mengetik tanda hubungnya: kolom di `/aktivasi`
menyisipkannya sendiri, dan server membuang semua pemisah sebelum mencocokkan.

## Deploy

Tab **Actions → "Deploy backend"**. Butuh secret `FIREBASE_SERVICE_ACCOUNT` dan
variable `FIREBASE_PROJECT_ID`. Jalankan sekali dengan "Cuma periksa" dulu.
