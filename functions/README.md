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

Lewat GitHub Actions: tab **Actions → "Buat kode aktivasi" → Run workflow**
(pilih kelompok & jumlah, hasilnya CSV yang bisa diunduh). Atau lokal:

```bash
GOOGLE_APPLICATION_CREDENTIALS=kunci.json \
  node scripts/generate-codes.mjs --group=tk --count=50 --out=kode.csv
```

Coba dulu dengan `--dry-run` untuk melihat bentuk kodenya tanpa menyimpan.

Kode memakai huruf & angka yang tidak bisa tertukar (tanpa I, L, O, 0, 1) —
jangan tambahkan karakter ambigu, tiap satu berubah jadi tiket "kode saya tidak
bisa" di WhatsApp.

## Deploy

Tab **Actions → "Deploy backend"**. Butuh secret `FIREBASE_SERVICE_ACCOUNT` dan
variable `FIREBASE_PROJECT_ID`. Jalankan sekali dengan "Cuma periksa" dulu.
