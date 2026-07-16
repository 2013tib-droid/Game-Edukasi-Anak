# CLAUDE.md — Platform Game Edukasi Anak Indonesia

## Ringkasan Proyek

Platform web berbayar berisi kumpulan mini-game edukasi untuk anak Indonesia, dijual per kelompok jenjang. Dibuat oleh kreator individu (solo dev), target pasar B2C: orang tua di Indonesia yang mengakses lewat **HP Android dan tablet**.

**Peran Claude Code:** membangun SEMUANYA — portal web + auth, migrasi game yang sudah ada, dan template/engine game agar penambahan konten cepat.

## Keputusan Produk (SUDAH FINAL — jangan diubah tanpa konfirmasi)

| Aspek | Keputusan |
|---|---|
| Scope rilis pertama | 2 kelompok: **TK (5–7 th)** dan **SD Awal (kelas 1–2)** |
| Jumlah game | 10–15 mini-game per kelompok (kualitas premium) |
| Platform | Web app: **React (Vite) + Firebase** (Auth, Firestore, Hosting) |
| Perangkat target | HP Android & tablet — mobile-first, touch-first |
| Demo gratis | 1–2 game gratis PENUH per kelompok (tanpa login) |
| Aset | Gambar AI-generated + narasi TTS Bahasa Indonesia |
| Harga | Naik per jenjang: TK ± Rp29rb, SD Awal ± Rp39rb (selalu < Rp50rb) |
| Update | Beli sekali = bugfix gratis; konten besar baru = ekspansi berbayar |
| Penjualan | **Pembayaran langsung di portal via payment gateway QRIS dinamis** (Tripay/Duitku — biaya ~0,7–1%, webhook otomatis; keputusan pemilik 2026-07, menggantikan Lynk.id/Mayar.id yang potongannya 3–5%) + itch.io untuk showcase demo |
| Promosi | TikTok/Reels organik |

## Sistem Akses (Anti-Pembajakan)

Prinsip: **jual AKSES, bukan file.** Game hanya bisa dimainkan setelah login dan validasi online.

Alur pembeli (jalur utama — otomatis penuh):
1. Daftar/login di portal dengan **Firebase Auth (email + password)**.
2. Di area orang tua: pilih kelompok → tombol Beli → Cloud Function membuat invoice **QRIS dinamis** di payment gateway (nominal terkunci; kode referral 50% dipotong di sini).
3. Pembeli scan & bayar dari aplikasi apa pun → gateway mengirim **webhook** → Cloud Function memverifikasi signature → set klaim akses kelompok di dokumen user + catat transaksi di koleksi `purchases`.
4. Game kelompok itu terbuka otomatis untuk akun tersebut — tanpa kode, tanpa konfirmasi manual.

Jalur sekunder — kode aktivasi: tetap ada untuk kode referral full-gratis, hadiah/giveaway, dan penjualan manual di luar portal. Redeem di halaman aktivasi → Cloud Function memvalidasi → tandai terpakai → set akses.

Aturan teknis:
- Webhook pembayaran wajib verifikasi signature/callback token dari gateway; jangan pernah set akses berdasarkan redirect halaman "sukses" di client.
- Kode aktivasi: sekali pakai, disimpan di koleksi `activation_codes` (field: `code`, `group`, `used`, `usedBy`, `usedAt`). Generate batch kode via script.
- Kode referral (lihat `docs/rencana-kode-referral.md`): koleksi `referral_codes`, 2 jenis — `full` (akses langsung) dan `half` (diskon 50% di checkout), sekali pakai, dilacak per referrer.
- **Batas perangkat: maksimal 3 device** per akun (simpan device fingerprint sederhana di `users/{uid}/devices`).
- Validasi akses dilakukan **saat game diluncurkan** (online check), bukan hanya saat login.
- Konten game premium TIDAK boleh ter-bundle di JS publik. Lazy-load per game, dan gate di level route + Firestore security rules.
- Firestore Security Rules wajib ketat: user hanya bisa baca dokumen miliknya; kode aktivasi hanya bisa diproses lewat Cloud Function.

## Arsitektur & Struktur Folder

```
/
├── CLAUDE.md
├── src/
│   ├── app/                  # routing, layout, splash
│   ├── auth/                 # login, register, aktivasi kode, device limit
│   ├── portal/               # beranda, pilih kelompok, pilih game, progress anak
│   ├── engine/               # ENGINE GAME REUSABLE (lihat bawah)
│   │   ├── core/             # game loop, scene manager, state
│   │   ├── ui/               # tombol besar, popup bintang, progress bar
│   │   ├── audio/            # manajer narasi TTS + SFX (lazy load)
│   │   └── templates/        # template tipe game (lihat daftar)
│   ├── games/
│   │   ├── tk/               # 10–15 game TK (tiap game = 1 folder, config + assets)
│   │   └── sd1/              # 10–15 game SD Awal
│   └── data/                 # konfigurasi soal/level per game (JSON)
├── functions/                # Cloud Functions: validasi kode, klaim akses
├── scripts/                  # generator kode aktivasi, pipeline aset
└── public/assets/            # gambar AI, audio TTS (terorganisir per game)
```

## Engine & Template Game

Buat engine sehingga **menambah game baru = menulis file config JSON + aset**, bukan menulis kode dari nol. Template tipe game yang dibutuhkan:

1. **Tap-jawab** (pilih jawaban benar dari 2–4 gambar/angka/huruf)
2. **Drag & drop** (pasangkan, urutkan, kelompokkan)
3. **Tracing** (menulis huruf/angka dengan jari)
4. **Memory/mencocokkan kartu**
5. **Hitung & ketuk** (counting objek)
6. **Cerita interaktif** (narasi + pilihan)

Setiap game dideklarasikan lewat config: `{ id, group, title, template, freeDemo (bool), levels[], assets{} }`.

## Standar UX Anak (WAJIB)

- Tombol besar (min 64px), target sentuh lega, tanpa teks kecil.
- **Semua instruksi dinarasikan audio Bahasa Indonesia** (anak TK belum lancar membaca). Teks hanya pendamping.
- Feedback positif selalu: salah = "Coba lagi, kamu pasti bisa!" — tidak ada hukuman.
- Progresi: bintang per level + maskot yang berkembang (lanjutkan konsep dari game "Petualangan Pintar" yang sudah ada).
- Tidak ada iklan, tidak ada link keluar, tidak ada pembelian di dalam area anak. Area orang tua (akun, pembelian) dipisah di balik "gerbang orang tua" (mis. soal matematika sederhana).
- Performa: harus mulus di Android low-mid end. Bundle kecil, lazy-load aset per game, gambar WebP, audio terkompresi.
- Responsif portrait & landscape untuk HP + tablet.

## Fase Pengerjaan

1. **Fase 1 — Fondasi:** setup Vite + React + Firebase, routing, Auth, halaman portal dasar, Firestore rules.
2. **Fase 2 — Engine:** core engine + 6 template game + sistem audio/narasi + progress bintang.
3. **Fase 3 — Migrasi:** porting game "Petualangan Pintar" (HTML standalone yang sudah ada) ke format engine sebagai game pertama kelompok TK.
4. **Fase 4 — Konten:** produksi 10–15 game per kelompok via config + aset. Tandai 1–2 game per kelompok sebagai `freeDemo: true`.
5. **Fase 5 — Monetisasi:** integrasi payment gateway QRIS dinamis (Cloud Function buat invoice + webhook), kode referral, Cloud Function validasi kode aktivasi, script generator kode, device limit, halaman aktivasi.
6. **Fase 6 — Rilis:** deploy Firebase Hosting, build versi demo untuk itch.io, sanity test di Android asli.

Kerjakan bertahap, satu fase selesai & teruji dulu sebelum lanjut. Selalu tanyakan konfirmasi sebelum keputusan arsitektur besar di luar dokumen ini.

## Konvensi

- Bahasa UI & narasi: Indonesia. Nama variabel/komentar kode: Inggris.
- Semua konten soal/level di file JSON `src/data/` — jangan hardcode di komponen.
- Commit kecil dan sering, pesan commit deskriptif.
- Jangan tambah library berat tanpa alasan kuat (target device low-end).

## Deploy Web (PENTING)

- **GitHub Pages menyajikan situs dari branch `claude/web-demo-html-wa4dr9`** (folder root), BUKAN dari branch default. Perubahan apa pun yang harus tampil di web WAJIB di-merge dan di-push ke branch itu — push ke branch lain tidak memicu build Pages.
- `index.html` adalah redirect ke `petualangan-pintar.html` (satu-satunya file game; jangan buat salinan duplikat).
- URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/`. Setelah push, build Pages butuh ±1–2 menit; browser HP sering menyimpan cache versi lama.

## Aturan Desain Soal (dari pemilik proyek)

- **Soal tidak boleh monoton satu jenis item.** Contoh: soal "ketuk N buah" harus selalu mencampur buah target dengan 2–3 jenis buah pengecoh, dan jumlah buah target dilebihkan dari yang diminta — anak harus mengenali item yang benar DAN berhenti menghitung di angka yang diminta. Terapkan prinsip campuran/pengecoh yang sama saat membuat tipe soal baru agar tetap menantang.

## File Sumber yang Tersedia dari Pemilik Proyek

- `petualangan-pintar.html` — game standalone yang sudah jadi (vanilla JS, localStorage): sumber untuk Fase 3.
- (Opsional) versi React component dari game yang sama.
- Folder aset AI (gambar) & audio TTS akan ditambahkan bertahap di `public/assets/`.
