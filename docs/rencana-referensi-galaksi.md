# Rencana: ide dari referensi "Peta Galaksi" (2026-10-02)

> Pemilik mengirim tangkapan layar game edukasi lain (tema luar angkasa gelap, 4 layar)
> dan bertanya apakah perlu diterapkan. Keputusan pemilik: **"Update aja di file md,
> nanti dikerjakan bertahap."** Dokumen ini daftar kerjanya. Belum ada yang dikerjakan.

## Ringkasan keputusan

| Layar referensi | Keputusan | Tahap |
|---|---|---|
| Tulis A sebanyak 3 kali (nomor goresan + ulang 3×) | **Ambil dua detailnya** | 1 |
| Peta Galaksi (jenjang membaca berurutan) | **Ambil idenya** → game baru "Tangga Membaca" | 2 |
| Lengkapi kata (seret huruf UFO ke slot kosong) | Tidak perlu | – |
| Ayo Mengucap (pengenalan suara) | **Ditolak** | – |
| Tema gelap luar angkasa | **Ditolak** | – |

## Tahap 1 — Tracing: nomor goresan + ulangi huruf (kecil, kerjakan dulu)

> **✅ SELESAI 2026-10-04.** Yang dibangun (dan yang menyimpang dari rencana di bawah):
> - Nomor goresan di titik mulai **goresan yang BELUM giliran saja**. Goresan yang sedang
>   ditulis sudah ditandai pensil, dan nomor yang titik mulainya tepat di bawah pensil
>   (B, D, P, angka 4: goresan ke-2 mulai di titik yang sama) **disembunyikan** — "2" di
>   bawah pensil terbaca "mulai di sini dengan goresan 2" (ketahuan dari tangkapan layar).
>   Nomor goresan yang sudah selesai tidak "meredup", tapi hilang bersama giliran.
> - `TracingData.repeat` + tiga bulatan "1 2 3" di atas panggung. Tulis Angka & Tulis
>   Huruf memakai `repeat: 3`, dan `sessionLevels` keduanya turun **7 → 5** (15 tulisan
>   per sesi, dulu 7).
> - Satu kalimat baru scope `engine`: **"Bagus! Tulis sekali lagi!"** (render #24).

Berlaku untuk template `tracing` (Tulis Angka TK & Tulis Huruf SD — **Tulis Huruf itu demo
gratis SD**, jadi perbaikannya langsung terlihat calon pembeli).

1. **Nomor 1-2-3 di titik MULAI tiap goresan**, terlihat sejak awal (sekarang cuma pensil di
   goresan yang aktif). Bulatan kecil bernomor; goresan yang sudah selesai nomornya meredup.
   - Data titik mulai sudah ada: titik pertama tiap goresan di `glyphStrokes.ts`.
   - Jaga jangan menutupi rel di glyph rapat (palang "f", "t", "E"): ukur di HP 320 px.
2. **Ulangi glyph yang sama 2–3 kali** dalam satu level, tiga bulatan penanda di atas panggung
   (1 ✓ · 2 · 3). Usul: field opsional `TracingData.repeat?: number` (bawaan 1, jadi game
   lama tak berubah sampai config-nya diisi).
   - Bintang tetap per level (bukan per ulangan). Salah di ulangan ke-2 cuma mengulang
     goresan itu, seperti sekarang.
   - Pertimbangkan `sessionLevels` dikurangi kalau satu level jadi 3× lebih lama.
3. Narasi: kalau ada kalimat baru ("Bagus! Tulis sekali lagi!"), tulis dengan kata, cek
   `npm run narasi`, lalu render (scope `engine`/`shared`).

Kriteria selesai: `check-glyphs.mjs` lulus, uji headless 320×568 / 380×800 / 740×360,
nol scroll, sesi penuh sampai "Selamat!".

## Tahap 2 — "Tangga Membaca" (game baru SD Kelas 1 & 2) — SELESAI 2026-10-05

Yang berharga dari Peta Galaksi bukan galaksinya, tapi **jenjang membaca yang berurutan**
dengan progres per tahap, sehingga orang tua tahu anaknya sudah sampai mana.

**Keputusan pemilik (2026-10-05):** game BARU (Suku Kata & Ejaan Jitu tetap berdiri sendiri),
tahap **terkunci berurutan**, **peta jalan berkelok pastel**, **6 soal per tahap**.

Isinya (`src/games/sd1/tangga-membaca.ts`, 8 tahap × 6 slot = 48 slot, 92 varian):
1. Suku Kata (BU KU, SU SU — papan menulis kata terpisah per suku)
2. Kata Pendek (dua suku terbuka: sapu, gigi)
3. Tiga Suku (sepatu, kamera)
4. Suku Tertutup (kursi, wortel)
5. Diftong (pantai, pulau, kerbau…)
6. NG dan NY (bunga, tangga)
7. Klaster (truk, drum, planet)
8. Kalimat ("Adik minum susu." → gambar susu)

Tiap tahap berselang-seling dua arah: **baca tulisan → pilih gambar** dan **lihat gambar →
pilih tulisan**. Narasi TIDAK PERNAH membacakan kata/kalimatnya (kalau dibacakan, yang
dilatih mendengar, bukan membaca). Pengecoh dari kesalahan membaca khas: vokal tertukar,
huruf akhir hilang (APEL→APE), NG kehilangan G, klaster disisipi vokal (TRUK→TURUK),
diftong kehilangan vokal kedua (CABAI→CABA). Bentuk lisan (CABE, PULO, RANTE) SENGAJA
tidak dijadikan pengecoh — itu ejaan yang dilihat anak sehari-hari.

## Yang ditolak & alasannya (jangan diusulkan ulang tanpa alasan baru)

- **Pengenalan suara ("Ayo Mengucap")**: merekam suara anak & mengirimnya ke server Google
  (Kebijakan Privasi menjanjikan tidak ada data begitu); akurasi buruk untuk suara anak
  berbahasa Indonesia → anak yang benar dinilai salah, melanggar "tidak ada hukuman";
  butuh internet; dukungan iPhone tak stabil.
- **Tema gelap luar angkasa**: teks soal kita cokelat tua di latar pastel dan semua seni
  dibuat untuk latar terang (alasan yang sama dengan latar `malam` yang sengaja tidak gelap).
- **Seret huruf ke slot kosong**: isinya sudah tercakup Suku Kata & Ejaan Jitu; diseret
  vs diketuk tidak menambah pelajaran.
