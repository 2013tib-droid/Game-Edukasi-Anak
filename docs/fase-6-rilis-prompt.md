# Fase 6 — Rilis: dari "backend siap" ke "bisa dijual"

Fase 5 sudah selesai & teruji di emulator (2026-08-11). Yang tersisa untuk
bisa menjual: **project Firebase-nya belum ada**, dan beberapa hal wajib
sebelum orang tua menyerahkan uang & email.

Dokumen ini dua bagian:

- **Bagian A** — langkah yang HARUS dikerjakan pemilik sendiri (buka Firebase
  Console, isi secret). Claude tidak punya akses ke sana.
- **Bagian B** — prompt siap tempel untuk session Claude berikutnya.

---

# BAGIAN A — Yang dikerjakan pemilik (±30 menit, sekali seumur project)

## A1. Buat project Firebase

1. Buka <https://console.firebase.google.com> → **Add project**.
2. Nama: `petualangan-pintar` (atau bebas). Google Analytics boleh dimatikan.
3. Setelah jadi, masuk **Build → Authentication → Get started → Email/Password
   → Enable → Save.**
4. Masuk **Build → Firestore Database → Create database**:
   - Mulai dari **Production mode** (rules kita yang akan dipakai).
   - Lokasi: **`asia-southeast2` (Jakarta)** — samakan dengan region Cloud
     Functions, jangan pilih yang lain.
5. Masuk **Build → Functions**. Kalau diminta upgrade ke paket **Blaze**,
   lakukan — Cloud Functions memang butuh Blaze.
   - Blaze itu pay-as-you-go, **bukan langganan tetap**. Free tier-nya 2 juta
     panggilan/bulan; aktivasi kode & cek perangkat jumlahnya jauh di bawah
     itu, jadi praktis Rp0.
   - **Pasang budget alert** di Google Cloud Console (Billing → Budgets &
     alerts), mis. Rp50.000/bulan, supaya tidak ada kejutan.

## A2. Ambil kunci aplikasi

**Project settings (gerigi) → General → Your apps → Add app → Web (`</>`)**,
nama bebas, JANGAN centang Firebase Hosting di situ.

Salin nilainya ke file `.env` di akar repo (lihat `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Kunci ini **memang publik** (ikut terkirim ke browser) — yang menjaga data
adalah security rules & Cloud Functions, bukan kerahasiaan kunci ini.

## A3. Isi secret & variable di GitHub

**Project settings → Service accounts → Generate new private key** → sebuah
file JSON terunduh.

Lalu di GitHub: **Settings → Secrets and variables → Actions**

| Jenis | Nama | Isi |
|---|---|---|
| Secret | `FIREBASE_SERVICE_ACCOUNT` | SELURUH isi file JSON tadi |
| Variable | `FIREBASE_PROJECT_ID` | id project, mis. `petualangan-pintar` |

**File JSON itu kunci penuh ke project.** Jangan dikirim lewat WhatsApp,
jangan ditaruh di repo. Kalau pernah bocor, hapus key-nya di halaman Service
accounts lalu buat baru.

## A4. Deploy backend

Tab **Actions → "Deploy backend" → Run workflow**:

1. Jalankan **sekali dengan "Cuma periksa" (dry run) tetap tercentang.** Kalau
   ada yang salah, ketahuan di sini tanpa mengubah apa pun.
2. Kalau bersih, jalankan lagi dengan centang itu **dilepas**.

Sesudah itu, di Firebase Console harus terlihat 3 functions
(`redeemActivationCode`, `registerDevice`, `removeDevice`) di region
**asia-southeast2**.

## A5. Buat kode aktivasi untuk diri sendiri

Tab **Actions → "Buat kode aktivasi" → Run workflow**: kelompok `tk`,
jumlah `2`, centang "Cuma lihat contoh" **dilepas**. Unduh artifact CSV-nya —
kode-kode ini yang dipakai menguji pembelian sungguhan.

---

# BAGIAN B — Prompt untuk session Claude berikutnya

> Salin seluruh blok di bawah ini ke session baru sebagai instruksi tugas.
> Kerjakan Bagian A dulu; kalau belum, Claude akan mentok di langkah 1.

---

Lanjutkan proyek ini ke **Fase 6 (Rilis)**. Fase 1–5 sudah selesai: engine,
18 game, narasi suara, dan seluruh sistem akses berbayar (kode aktivasi,
batas 3 perangkat, gerbang akses) sudah jadi dan teruji di Firebase Emulator.

## PENTING SEBELUM MULAI

- **Baca `CLAUDE.md` sampai habis dan patuhi semuanya** — terutama "Sistem
  Kunci Game", "Status Pengerjaan" (entri Fase 5), "Standar UX Anak",
  "Branch & Alur Kerja", dan "Deploy Web".
- **Mulai dari `main`**: `git checkout main && git pull`, lalu cabang pendek
  `claude/<fitur>`. Jangan mencabang dari branch lama.
- Uji dengan **headless browser di 380×800 dan 360×640**, dan laporkan
  jumlah pemeriksaan yang lulus. Proyek ini menuntut bukti, bukan klaim.
- Kalau ada yang tidak bisa diverifikasi dari sesi (mis. URL live diblokir
  kebijakan jaringan), **katakan apa adanya** — jangan mengaku sudah
  terverifikasi.

## Urutan kerja (jangan diacak — nomor 1 memblokir sisanya)

### 1. Hidupkan project Firebase & uji dengan kode sungguhan
Pemilik sudah membuat project, mengisi `.env`, dan men-deploy backend
(lihat `docs/fase-6-rilis-prompt.md` Bagian A). Tugasmu:
- Pastikan `.env` terbaca dan `isFirebaseConfigured` bernilai true.
- Uji alur pembeli sungguhan dari awal sampai akhir: daftar akun → tukar
  kode aktivasi asli → game kelompok itu terbuka → kelompok lain tetap
  terkunci → kode yang sama ditolak untuk akun kedua.
- Uji batas perangkat sampai layar "Perangkat penuh" muncul, lalu lepas satu
  dan pastikan bisa masuk lagi.
- **JANGAN nyalakan mode `'kunci'` sebelum langkah ini lulus.**

### 2. Sinkron bintang ke Firestore
Sekarang progress cuma di `localStorage` (`src/engine/core/progress.ts`), jadi
ganti HP = maskot balik ke telur. Untuk produk berbayar dengan tangga maskot
sampai 555 ⭐, itu kehilangan yang menyakitkan.
- Rules `users/{uid}/progress` sudah siap menerima.
- **Gabungkan, jangan timpa**: bintang itu nilai TERBAIK per level, jadi
  penggabungan dua perangkat = ambil yang tertinggi per level. Anak yang main
  di tablet lalu di HP tidak boleh kehilangan apa pun.
- **Harus tetap jalan offline.** localStorage tetap jadi sumber utama saat
  main; Firestore cuma cadangan yang disinkronkan. Anak yang main tanpa
  sinyal tidak boleh kehilangan bintang atau menunggu jaringan.
- Tanyakan dulu ke pemilik: satu akun orang tua sering dipakai **dua anak** —
  apakah progress digabung jadi satu, atau perlu profil anak terpisah? Ini
  keputusan produk, jangan diputuskan sendiri.

### 3. Halaman Kebijakan Privasi, Syarat & Ketentuan, dan refund
Wajib sebelum menjual: app ini mengumpulkan email + kata sandi, sasarannya
anak, dan dijual lewat Lynk.id/Mayar.id yang lazim memintanya. UU PDP
No. 27/2022 berlaku.
- Route baru di area ORANG TUA (`/privasi`, `/ketentuan`), ditaut dari kaki
  landing page — **jangan** ditaruh di area anak (`/portal`, `/kelompok/*`,
  `/game/*`); standar UX anak melarang link keluar dari sana.
- Isinya harus jujur menyebut apa yang benar-benar dikumpulkan: email, kata
  sandi (di-hash Firebase), id perangkat acak, dan progress bintang. **Tidak
  ada** iklan, tidak ada pelacak pihak ketiga, tidak ada data anak.
- Kebijakan refund harus menyebut bahwa produknya kode akses digital.
- **Tulis draf, lalu katakan terus terang bahwa ini bukan nasihat hukum** dan
  sebaiknya dibaca ulang pemilik sebelum dipasang.

### 4. Verifikasi email
Supaya akun yang emailnya salah ketik tidak jadi akses berbayar yang tak
bisa dipulihkan. Jangan sampai memblokir anak bermain — verifikasi cukup
jadi syarat untuk **aktivasi kode**, bukan untuk masuk.

### 5. Analytics seadanya
Tanpa ini tidak akan ketahuan berapa yang membuka landing dan berapa yang
klik beli. Pilih yang ringan & tanpa cookie pihak ketiga (mis. Firebase
Analytics yang sudah ada, atau tanpa tambahan library sama sekali).
**Jangan pasang pelacak apa pun di area anak.**

### 6. Nyalakan mode `'kunci'` — LANGKAH TERAKHIR
Hanya setelah 1–5 lulus:
- Ubah `DEFAULT_LOCK_MODE` di `src/data/access.ts` jadi `'kunci'`.
- Build produksi **TANPA** `VITE_ALLOW_TEST_TOGGLE` (kalau ikut terbawa,
  pembeli bisa membuka semua game sendiri — ini lubang terbesar yang baru
  saja ditutup di Fase 5).
- Deploy ke Firebase Hosting dengan **`SITE_URL=https://<domain>/ npm run
  build`**, kalau tidak, link yang dibagikan di WhatsApp/TikTok akan menarik
  gambar pratinjau dari domain GitHub Pages yang lama.
- Verifikasi terakhir: buka `/kelompok/tk` & `/kelompok/sd1` — hanya Hutan
  Hewan tanpa gembok & berlabel GRATIS.

## Yang TIDAK termasuk tugas ini

- **Mengubah cara config game disajikan.** Chunk config premium masih file
  statis yang bisa diunduh siapa pun yang tahu URL-nya. Menutupnya =
  menyajikan config lewat Cloud Function bertoken, yang mengorbankan
  type-safety saat build dan menambah jeda tiap level. Itu keputusan
  arsitektur tersendiri — **tanyakan pemilik dulu**, jangan dikerjakan
  diam-diam.
- **Menambah game atau mengubah isi soal.** Fase 6 soal rilis, bukan konten.
- **Service worker / mode offline.** 21 MB file suara membuat ini keputusan
  tersendiri, bukan tambahan sambil lalu.

## Setelah selesai

- Perbarui `CLAUDE.md`: tandai Fase 6, catat keputusan & jebakan baru dengan
  gaya entri yang sudah ada (apa yang dicoba, apa yang ditolak, kenapa).
- Commit kecil-kecil dengan pesan deskriptif; push ke branch dev-mu.
- Laporkan apa yang **belum** bisa diverifikasi dari sesi, jangan disamarkan.
