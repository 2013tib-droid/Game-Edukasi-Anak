# Rencana Trial / Demo Gratis

> **Status: RENCANA, BELUM DIEKSEKUSI.** Tidak ada kode yang diubah.
> Kondisi sekarang tetap pra-rilis: `DEFAULT_LOCK_MODE = 'buka'` (semua game
> terbuka) dan `FREE_GAME_IDS = ['hutan-hewan']`.
> Dicatat 2026-09-04 sebagai hasil diskusi pemilik; eksekusi menyusul saat
> mendekati launching.

## Masalah yang mau diperbaiki

`FREE_GAME_IDS` sekarang cuma berisi `hutan-hewan` (TK). Artinya saat mode
`kunci` dinyalakan:

- **TK** punya 1 game demo.
- **SD Kelas 1 & 2** punya **NOL** game demo.

Orang tua anak kelas 1 harus membayar Rp29rb tanpa pernah melihat apa pun.
Itu lubang yang paling merugikan — lebih penting daripada perdebatan 1 vs 2
game.

## Keputusan: 1 game gratis per kelompok (PEMILIK, 2026-09-22)

> Menggantikan keputusan 2026-09-04 di bawah ini yang memberi DUA game per
> kelompok. Yang TIDAK berubah: **tiap kelompok berbayar wajib punya tepat
> satu pintu masuk** — itu inti dokumen ini sejak awal.

| Kelompok | Game gratis | Template | Perannya |
|---|---|---|---|
| `tk` | `hutan-hewan` | tap-answer | anak langsung bisa, nol friksi |
| `sd1` | `tulis-huruf` | **tracing** | anak menulis huruf mengikuti rel pakai jari — paling kasatmata bedanya dari game gratisan |

**Jangan dua-duanya tap-answer** — aturan lama yang justru jadi LEBIH
mengikat sekarang. Dulu tiap kelompok punya dua template sendiri, jadi
variasinya aman di dalam kelompok. Dengan satu game per kelompok, dua game
gratis itulah SELURUH etalase: kalau keduanya "pilih jawaban yang benar",
calon pembeli menyimpulkan ke-19 game isinya begitu semua — padahal ada
tracing, path-trace, drag-drop, spell, memory, puzzle.

**Harga yang dibayar, dan itu disadari:** demo SD jadi bukan berhitung,
padahal itu yang paling dicari orang tua SD (`hitung-hebat` sempat jadi
pilihan justru karena itu). Ditukar dengan memperlihatkan kemampuan engine.
Kalau ternyata konversi SD seret, **inilah tuas pertama yang dicoba dibalik**
— tukar ke `hitung-hebat`, satu kata di `FREE_GAME_IDS`.

Rasio sekarang: 1 dari 11 (TK) dan 1 dari 10 (SD) ≈ 9%.

### Alasan versi 2 game per kelompok (2026-09-04, TIDAK BERLAKU LAGI)

Waktu itu yang menentukan bukan angka 2-nya, tapi **2 template berbeda**,
karena ada dua "penonton" sekaligus: yang membeli orang tua, yang bermain
anak. Satu game untuk **menyenangkan anak** (supaya dia minta lagi), satu
untuk **meyakinkan orang tua** (supaya kelihatan ini beneran belajar).
Pasangannya: TK `hutan-hewan` + `tulis-angka`, SD `hitung-hebat` +
`cerita-kancil`.

## Tiga aturan yang lebih menentukan daripada angka 2

1. **Game gratis TIDAK minta login.** Buka portal → langsung main. Login baru
   diminta saat mengetuk game yang tergembok. Minta email sebelum anak sempat
   senang = kehilangan mayoritas calon pembeli.
2. **Versi gratis JANGAN dipotong.** Level penuh, bintang penuh. Kalau yang
   gratis terasa setengah jadi, orang tua menilai yang berbayar juga setengah
   jadi. Yang dijual itu **keluasan** (19 game), bukan kedalaman per game.
3. **Progres anak di game gratis disimpan dan dibawa saat aktivasi.** Bintang
   yang sudah terkumpul jadi alasan tambahan untuk membayar — bukan mulai dari
   nol.

## Yang DITOLAK, beserta alasannya

- **Trial 3 hari full access.** Konversi teoritisnya paling tinggi, tapi butuh
  expiry di Cloud Function, akun sebelum ada nilai, dan beban support ("kok
  punya saya mati?"). Untuk solo dev di harga Rp19–29rb, tidak sepadan.
- **Semua game terbuka tapi hanya level 1.** Anak TK tidak paham konsep
  "sampel". Dia cuma tahu tiba-tiba mentok lalu kesal — dan rasa kesal itu
  dikaitkan orang tua dengan produkmu.

Di harga perkenalan Rp19–29rb hambatannya sudah impulsif, jadi trial tidak
perlu murah hati. **1 game per kelompok, tanpa login, tidak dipotong** sudah
pas.

## Cara mengeksekusi

1. ~~`src/data/access.ts` — isi `FREE_GAME_IDS`.~~ **SUDAH DIKERJAKAN
   2026-09-22**: `['hutan-hewan', 'tulis-huruf']`. Aman dilakukan lebih awal
   karena selama `DEFAULT_LOCK_MODE` masih `'buka'` daftar ini tidak dipakai
   sama sekali — dan menaruhnya sekarang berarti langkah launching tinggal
   SATU baris, bukan dua.
2. Saat launching, barulah `DEFAULT_LOCK_MODE` diubah jadi `'kunci'`
   (atau build dengan `VITE_LOCK_MODE=kunci`).
3. Periksa layar gembok di `src/portal/GamePage.tsx` — apakah sudah berfungsi
   sebagai ajakan membeli, bukan sekadar pesan "terkunci". **Belum diperiksa.**
4. Verifikasi: buka `/kelompok/tk` dan `/kelompok/sd1` di mode `kunci` —
   masing-masing harus menampilkan tepat 1 game berlabel GRATIS tanpa gembok.
   **Sudah diuji headless 2026-09-22** (lihat CLAUDE.md).

## Belum diputuskan

- Apakah progres game gratis benar-benar dibawa saat aktivasi (butuh cek
  apakah progres sekarang tersimpan per-perangkat atau per-akun).
- Isi persis layar gembok sebagai halaman jualan.
