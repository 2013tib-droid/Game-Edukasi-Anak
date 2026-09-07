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

## Keputusan: 2 game gratis per kelompok

Yang menentukan bukan angka 2-nya, tapi **2 template yang berbeda**, karena
ada dua "penonton" sekaligus: yang membeli orang tua, yang bermain anak.

Satu game untuk **menyenangkan anak** (supaya dia minta lagi), satu untuk
**meyakinkan orang tua** (supaya kelihatan ini beneran belajar).

| Kelompok | Game gratis | Template | Perannya |
|---|---|---|---|
| `tk` | `hutan-hewan` | tap-answer | anak langsung bisa, nol friksi |
| `tk` | `tulis-angka` | **tracing** | orang tua melihat anaknya menulis pakai jari — pembeda dari game gratisan |
| `sd1` | `hitung-hebat` | tap-answer | inti yang dicari orang tua: berhitung |
| `sd1` | `cerita-kancil` | **story-choice** | paling nempel buat anak, paling beda dari kompetitor |

**Jangan dua-duanya tap-answer.** Kalau demo TK dan SD sama-sama "pilih gambar
yang benar", calon pembeli menyimpulkan seluruh 19 game isinya begitu semua —
padahal ada tracing, path-trace, drag-drop, spell, memory. Demo yang salah
pilih justru MENURUNKAN nilai yang dirasakan.

Rasio: 2 dari 9 (TK) dan 2 dari 10 (SD) ≈ 20%. Cukup.

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
perlu murah hati. **2 game per kelompok, tanpa login, tidak dipotong** sudah
pas.

## Cara mengeksekusi nanti (JANGAN dijalankan sekarang)

1. `src/data/access.ts` — ubah satu baris:
   ```ts
   export const FREE_GAME_IDS: readonly string[] = [
     'hutan-hewan', 'tulis-angka',      // TK
     'hitung-hebat', 'cerita-kancil',   // SD Kelas 1 & 2
   ];
   ```
2. Saat launching, barulah `DEFAULT_LOCK_MODE` diubah jadi `'kunci'`
   (atau build dengan `VITE_LOCK_MODE=kunci`).
3. Periksa layar gembok di `src/portal/GamePage.tsx` — apakah sudah berfungsi
   sebagai ajakan membeli, bukan sekadar pesan "terkunci". **Belum diperiksa.**
4. Verifikasi: buka `/kelompok/tk` dan `/kelompok/sd1` di mode `kunci` —
   masing-masing harus menampilkan tepat 2 game berlabel GRATIS tanpa gembok.

## Belum diputuskan

- Apakah progres game gratis benar-benar dibawa saat aktivasi (butuh cek
  apakah progres sekarang tersimpan per-perangkat atau per-akun).
- Isi persis layar gembok sebagai halaman jualan.
