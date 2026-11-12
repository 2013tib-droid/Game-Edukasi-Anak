# Brief Promo — Video Reels/TikTok (25–35 dtk, 9:16)

Dikumpulkan 2026-11-12 dari repo ini (commit `6484803`). Tidak ada kode game yang diubah.

## 1. Identitas

- **Nama:** **Petualangan Pintar** (dua kata, P besar di keduanya).
- **Tagline (dari landing):** "Belajar jadi menyenangkan, tanpa terasa seperti belajar." — `src/portal/LandingPage.tsx`
- **Label kecil di atas judul:** "Untuk anak Playgroup, TK & SD".
- **Platform:** web app (dibuka di browser HP Android/tablet, bisa "Tambahkan ke Layar Utama"). **Android/iOS store: belum ada.**
- **URL:** https://petualanganpintar.com
- **Warna brand** (`src/app/global.css`, `index.html`, `src/portal/landing.css`):
  - Latar gradien: `#FFE9A8` (kuning krem) → `#FFD1DC` (merah muda) → `#C9F0FF` (biru muda). `theme-color` = `#FFE9A8`.
  - Teks utama: `#3A2E20` (cokelat tua).
  - Tombol utama "Coba Gratis": gradien `#FFE066` → `#FFCC33` → `#FFB21F`, bingkai `#FFA51A`, bayangan `#F07A2A`, teks `#5A2A12`; bulatan panah `#FF8A3D` → `#F25C1F`.
  - ⚠️ Pemilik **tidak suka ungu**, jadi jangan dipakai sebagai warna dominan.
- **Font:** CSS menyebut `'Fredoka', 'Baloo 2', 'Segoe UI', system-ui`, **tetapi Fredoka tidak pernah dimuat**, jadi di HP yang tampil font sistem. Untuk video, Fredoka (Google Fonts) cocok dengan niat aslinya.
- **Logo/ikon:**
  - `public/assets/logo.svg` — logo kanonik (anak ayam + pelangi + bintang), juga favicon.
  - `public/assets/icon-512.png`, `icon-192.png`, `apple-touch-icon.png` — ikon PWA (latar krem pekat).
  - `public/assets/og-image.jpg` — gambar share 1200×630.
  - `public/assets/ui/petualang.webp` — maskot utama landing (anak ayam bertopi penjelajah).
  - `public/assets/mascot/mascot-1…20.webp` — 20 tahap maskot (telur → Naga Legenda).
  - `public/assets/games/*.webp` — ikon seni per game.

## 2. Penonton & masalah

- **Pemain:** anak **Playgroup & TK (4–7 th)**, **SD Kelas 1 & 2 (6–8 th)**, **SD Kelas 3 & 4 (8–10 th)**. SD Kelas 5 & 6 tampil "Segera hadir" (0 game).
- **Materi:** berhitung, mengenal & menulis huruf, membaca, warna & bentuk, logika/coding sederhana, jam, uang, pecahan, IPAS, Pancasila, Bahasa Indonesia, Bahasa Inggris, Seni Rupa.
- **Yang memutuskan & membayar:** **orang tua** (B2C, HP Android/tablet). Guru bukan target.
- **Masalah yang diselesaikan** (dari CLAUDE.md & landing):
  - Anak TK belum lancar membaca → **semua instruksi dibacakan suara Bahasa Indonesia**.
  - Game gratisan penuh iklan & tautan keluar → **tanpa iklan, tanpa tautan keluar di area anak**.
  - Belajar terasa membosankan → dibungkus game, maskot yang tumbuh, bintang.
  - Takut salah → "Coba lagi, kamu pasti bisa!" **tanpa hukuman**.
  - [TEBAKAN] Orang tua ingin waktu layar anak yang bermanfaat, bukan sekadar hiburan.

## 3. Fitur (sudah jalan di kode, urut dari paling menarik)

1. **Maskot tumbuh jadi naga** — bintang membuat teman belajarnya berevolusi.
2. **Semua soal dibacakan** — anak belum bisa membaca tetap bisa main.
3. **Menulis huruf mengikuti jalur** — jari menyusuri rel, urutan goresan benar.
4. **47 game, banyak cara main** — hitung, puzzle, labirin, coding, cerita.
5. **Salah itu boleh** — tanpa hukuman, anak berani mencoba lagi.
6. **Tanpa iklan, sekali bayar** — aman, tanpa langganan bulanan.

Fitur lain yang sudah jalan (cadangan): soal acak tiap main (anti-bosan), lanjutkan dari level terakhir, cerita interaktif bergambar, satu akun sampai 3 perangkat, progres tersimpan di cloud.

**Direncanakan / belum ada (jangan diklaim):** aplikasi di Play Store/App Store, mode offline, SD Kelas 5 & 6, profil anak terpisah per akun.

## 4. Bukti (angka nyata)

| Angka | Sumber |
|---|---|
| **47 game** (TK 14, SD Kelas 1 & 2 15, SD Kelas 3 & 4 18) | dihitung dari `src/games/registry.ts` (tak ada game `draft`) |
| **565 level** di semua game | dihitung dari config `src/games/{tk,sd1,sd2}/*.ts` (id level unik per game) |
| **±2.600 variasi soal** (2.646) | sama, jumlah varian di kolam soal tiap level |
| **2.167 kalimat narasi** direkam suara | `scripts/narration-lines.json` |
| **20 tahap maskot** (telur → Naga Legenda) | `src/engine/core/mascot.ts` |
| **4 game gratis** penuh tanpa login (Hutan Hewan, Tulis Huruf, Toko Kembalian, Kebun Ilmu) | `FREE_GAME_IDS` di `src/data/access.ts` |
| **3 perangkat** per akun | Cloud Function `registerDevice` (`functions/src/index.ts`) |

- Jumlah pemain/unduhan/rating: **tidak tercatat di repo** (statistik ada di Firestore, tidak bisa dibaca dari sini). Penjualan pertama 2026-10-01 tercatat di CLAUDE.md, tapi angkanya kecil — jangan dipakai.
- Penghargaan: **tidak ada.**
- Testimoni asli: **tidak ada.** (Landing sengaja tidak memasang testimoni/rating karangan.)
- ⚠️ `index.html` (og:description) masih menulis "18 game" — itu angka lama; yang benar 47.

## 5. Ajakan (CTA)

- **Tindakan utama:** "**Coba Gratis**" di **petualanganpintar.com** — langsung main tanpa daftar.
- **Model:** **freemium**. 1–2 game gratis per kelompok; sisanya **sekali bayar** per kelompok (harga perkenalan):
  - Playgroup & TK **Rp19.000** (normal Rp39.000)
  - SD Kelas 1 & 2 **Rp29.000** (normal Rp49.000)
  - SD Kelas 3 & 4 **Rp39.000** (normal Rp59.000)
  - Bayar via Mayar.id (QRIS/e-wallet), kode aktivasi dikirim otomatis ke email.
- **Kontak:** WhatsApp `+62 851-1737-8557`, email `petualangsmart@gmail.com` (`src/data/contact.ts`).
- **Handle medsos (TikTok/Instagram):** **belum ada di repo — mohon isi.**

## 6. Screenshot (`docs/promo/screens/`, 780×1688 = 390×844 @2x, JPEG)

Diambil dari dev server lokal. Saklar penguji 🔒 disembunyikan; bel notifikasi di landing menampilkan angka build dev.

- `01-landing.jpg` — Anak ayam penjelajah, judul, tagline, dan tombol besar "Coba Gratis"; bagus sebagai frame pembuka/penutup.
- `02-menu-tk.jpg` — Papan kayu "Playgroup dan TK" dengan kartu game bergambar dan label GRATIS; memperlihatkan banyaknya pilihan.
- `03-gameplay-benar.jpg` — Singa "Hebat kamu benar!" dengan konfeti setelah menjawab soal hitung; momen hadiah yang ceria.
- `04-gameplay-tulis.jpg` — Huruf "z" sedang ditulis: pensil mengikuti jalur dan tinta oranye mengisi rel; cara main paling khas.
- `05-selamat.jpg` — Layar "Selamat!" dengan piala, tiga bintang, bonus rajin, dan maskot Naga Mahkota level 12. **Progres disemai untuk screenshot** (622 ⭐), bukan data pemain asli.

## 7. Ejaan khusus untuk TTS

| Tulisan | Dibaca |
|---|---|
| TK | "té-ka" |
| SD | "és-dé" |
| Playgroup | "plé-grup" |
| petualanganpintar.com | "petualangan pintar titik kom" |
| Mayar.id | "ma-yar titik ai-di" |
| QRIS | "kris" |
| e-wallet | "i-wolet" (atau ganti "dompet digital") |
| IPAS | "i-pas" |
| Rp19.000 / Rp29.000 / Rp39.000 | "sembilan belas ribu rupiah" dst. |
| Angka apa pun (mis. 47) | **tulis dengan kata** ("empat puluh tujuh") — Azure membaca digit dengan bahasa Inggris ("six") |

- Suara yang dipakai app: Azure **`id-ID-Gadis:DragonHDLatestNeural`**, `rate -15%` (narasi), **`id-ID-ArdiNeural`**, `rate -8%` (cerita). Kata ber-e taling/pepet yang sudah dikoreksi ada di `scripts/pronounce.mjs` (mis. bebek → bébék, sentuh → IPA səntuh).
- Kalimat umpan balik resmi (sudah ada rekamannya): "Hebat! Kamu benar!", "Coba lagi, kamu pasti bisa!", "Selamat! Kamu hebat sekali!" — `public/assets/voice/engine/`.

## Catatan untuk tim video

- Jangan tampilkan **Toko Kembalian** (memakai foto specimen uang BI) tanpa keputusan pemilik.
- Jangan tampilkan wajah/nama anak sungguhan tanpa izin tertulis.
- Klaim yang **tidak boleh** dipakai: "bisa offline", "update gratis selamanya", rating/jumlah pengguna.

## Status brief — yang masih kosong / perlu dicek

**Masih kosong (perlu diisi pemilik):**
- Handle TikTok/Instagram — tidak ada di repo.
- Jumlah pemain, unduhan, rating — tidak tercatat di repo.
- Testimoni asli & penghargaan — belum ada.
- App store (Android/iOS) — belum ada; game ini web app.

**Ditandai [TEBAKAN]:** satu poin di bagian 2 ("orang tua ingin waktu layar anak yang bermanfaat"). Poin masalah lain diambil dari dokumen proyek.

**Perlu diketahui:**
- Deskripsi share-preview di `index.html` (og/twitter description) masih menulis "18 game"; yang benar 47. Belum diubah.
- Font Fredoka disebut di CSS tapi tidak pernah dimuat, jadi di HP tampil font sistem. Untuk video, pakai Fredoka.
- Cara baca "QRIS" dan "e-wallet" di bagian 7 masih perkiraan ucapan umum — dengarkan dulu sebelum render, atau ganti "e-wallet" dengan "dompet digital".
- Screenshot `05-selamat.jpg` memakai progres yang diisi khusus (622 ⭐), bukan data pemain asli.
