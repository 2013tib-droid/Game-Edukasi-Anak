# Fase 6 — Rilis: dari "backend siap" ke "bisa dijual"

Fase 5 sudah selesai & teruji di emulator (2026-08-11). Yang tersisa untuk
bisa menjual: **project Firebase-nya belum ada**, dan beberapa hal wajib
sebelum orang tua menyerahkan uang & email.

> **BAGIAN B SUDAH DIKERJAKAN (2026-09-16), KECUALI LANGKAH 1 & 6.** Langkah
> 2 (sinkron bintang), 3 (Privasi/S&K/refund), 4 (verifikasi email) dan 5
> (analytics) selesai & teruji — lihat "Status Pengerjaan" di `CLAUDE.md`.
>
> **Langkah 1 TERHALANG, dan karena itu langkah 6 (mode `'kunci'`) SENGAJA
> TIDAK dinyalakan.** Dua hal yang cuma bisa dikerjakan pemilik:
>
> 1. **Auth Email/Password ternyata BELUM aktif** di project
>    `petualangan-pintar` — terukur dari sesi: `accounts:signUp` menjawab
>    `OPERATION_NOT_ALLOWED` dan `accounts:signInWithPassword` menjawab
>    `PASSWORD_LOGIN_DISABLED`. Catatan Bagian A di bawah menyebutnya sudah
>    aktif; itu keliru. Nyalakan di **Authentication → Sign-in method →
>    Email/Password → Enable**.
> 2. **Kode aktivasi asli tidak ada di sesi** (artifact CSV-nya hanya di
>    komputer pemilik, dan kode = barang jualan yang tidak boleh ditempel ke
>    chat). Uji ujung-ke-ujung dengan kode asli karena itu tugas pemilik.
>
> **Backend juga perlu di-deploy ulang**: ada satu function BARU (`catatStat`)
> dan `firestore.rules` yang berubah (koleksi `stats` ditutup). Menjalankan
> deploy sungguhan diblokir classifier dari sesi Claude, jadi tombol Run
> workflow harus diklik pemilik (A4, `dry_run` dilepas).
>
> **SUDAH DIKERJAKAN (2026-09-16): SELURUH BAGIAN A.** Project Firebase
> `petualangan-pintar` hidup — ~~Auth Email/Password aktif~~ (**KELIRU, lihat
> di atas: providernya masih mati**), Firestore
> `(default)` di `asia-southeast2`, paket Blaze, tiga functions ter-deploy di
> `asia-southeast2`, `firestore.rules` terpasang, dan 2 kode aktivasi `tk`
> (batch `uji-sendiri2`) sudah tercetak. `.env` di akar repo sudah terisi.
> Bagian A di bawah tinggal jadi rujukan kalau project dibuat ulang — catatan
> izin di A3 WAJIB dibaca kalau itu terjadi.

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
3b. **Nyalakan juga provider Google** (jalur "Masuk dengan Google" di layar
   Masuk & Daftar): **Authentication → Sign-in method → Add new provider →
   Google → Enable**, isi *Project support email* dengan
   **`petualangsmart@gmail.com`** (email Console pemilik), lalu **Save**.
   - **Alamat itu DITAMPILKAN ke orang tua** di layar izin Google, jadi
     memang harus alamat yang pantas dibalas — bukan alamat pribadi yang
     tidak pernah dibuka.
   - **Sekalian periksa nama publik project-nya**: *Project settings →
     General → **Public-facing name***. Nama itulah yang dibaca orang tua di
     layar izin Google (“Pilih akun untuk melanjutkan ke …”). Kalau masih
     `petualangan-pintar` atau nomor project, ganti jadi **Petualangan
     Pintar** — orang tua yang melihat nama mentah di layar izin akan
     mengira tautannya salah. Tanpa langkah ini tombolnya tetap ada tapi menjawab *"Masuk
   dengan Google belum aktif di aplikasi ini"* — pesan itu memang sengaja
   dibuat supaya laporan yang masuk ke WhatsApp langsung bisa dikenali.
   - Lalu **Authentication → Settings → Authorized domains**: pastikan domain
     tempat app-nya disajikan ada di daftar. `localhost` dan
     `<project>.firebaseapp.com`/`.web.app` sudah ada sejak awal, tapi
     **`2013tib-droid.github.io` (build uji di GitHub Pages) dan domain
     produksi nanti HARUS ditambahkan sendiri.** Kalau tidak, tombolnya
     menjawab *"belum diizinkan untuk alamat situs ini"*.
   - **Tidak perlu menyentuh Google Cloud Console.** Firebase membuatkan
     OAuth client-nya sendiri, dan app ini hanya meminta profil dasar —
     tidak ada akses Gmail/Drive, jadi tidak ada proses verifikasi OAuth.
   - **Email + kata sandi tetap wajib menyala.** Google menolak alur OAuth di
     dalam browser-dalam-aplikasi (WhatsApp, Instagram, TikTok) dengan
     `disallowed_useragent` — padahal justru dari sanalah tautan promosi
     dibuka. Di situ formulir email adalah satu-satunya jalan masuk.
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

### A3b. Beri peran ke service account-nya (KALAU TIDAK, A4 GAGAL 3×)

Kunci hasil "Generate new private key" secara bawaan **hanya** punya peran
Firebase Admin SDK — tidak cukup untuk men-deploy. Ini ditemukan 2026-09-16
lewat tiga kegagalan berturut-turut, masing-masing satu izin yang kurang.

Google Cloud Console (**bukan** Firebase Console) →
`console.cloud.google.com/iam-admin/iam?project=<project-id>` → pilih project
dulu di dropdown atas → cari principal `firebase-adminsdk-…` → ikon pensil →
**+ ADD ANOTHER ROLE** untuk tiap peran ini:

| Peran | Tanpa ini, gagalnya berbunyi |
|---|---|
| Firebase Admin | `403 The caller does not have permission` saat cek `firestore.rules` |
| Cloud Functions Admin | gagal membuat/memperbarui function |
| Service Account User | gagal memakai service account saat deploy |
| Cloud Datastore Owner | gagal melepas rules ke Firestore |
| **Service Usage Admin** | `Permissions denied enabling artifactregistry.googleapis.com` |

Peran terakhir itu yang membuat Firebase CLI boleh menyalakan sendiri API yang
dibutuhkan Functions gen-2 (artifactregistry, cloudbuild, run, eventarc,
pubsub, storage). Tanpa itu, API-nya harus dinyalakan manual satu per satu —
berulang tiap kali ada yang baru dibutuhkan.

Satu API TIDAK ikut dinyalakan otomatis dan harus diklik manual sekali:

- **Cloud Billing API** —
  `console.cloud.google.com/apis/library/cloudbilling.googleapis.com?project=<project-id>`
  → **Enable**. Gagalnya berbunyi `Cloud Billing API has not been used in
  project … before or it is disabled`, dan **dry run tidak menangkapnya**
  karena dry run tidak membaca status billing. Perubahan IAM/API butuh 1–2
  menit untuk menyebar sebelum dicoba lagi.

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
jumlah `2` (**defaultnya `50` — wajib diubah**), penanda batch bebas.

Jalankan **dua kali**, seperti A4: sekali dengan "Cuma lihat contoh"
**tercentang** (tidak menulis apa pun ke Firestore, hanya membuktikan skrip &
kredensialnya jalan), lalu sekali dengan centang itu **dilepas**.

Unduh artifact CSV-nya — kode-kode ini yang dipakai menguji pembelian
sungguhan. Artifact-nya **hangus dalam 7 hari**, jadi unduh hari itu juga.
Log workflow mencetak CSV-nya lengkap; kode = barang jualan, jangan ditempel
ke chat atau dikirim lewat WhatsApp.

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
