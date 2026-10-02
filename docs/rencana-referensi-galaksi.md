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

## Tahap 2 — "Tangga Membaca" (game baru SD Kelas 1 & 2) — USULAN, perlu keputusan pemilik

Yang berharga dari Peta Galaksi bukan galaksinya, tapi **jenjang membaca yang berurutan**
dengan progres per tahap ("17/17"), sehingga orang tua tahu anaknya sudah sampai mana.
SD1 sekarang punya Suku Kata & Ejaan Jitu, tapi belum ada jenjang membaca berurutan.

Usulan tahap (bahasa Indonesia, bukan fonik Inggris):
1. Suku kata terbuka (ba-bi-bu, BU-KU)
2. Kata dua suku terbuka (bola, sapi)
3. Suku kata tertutup (ban, kur-si)
4. Diftong (ai, au, oi: pantai, pulau)
5. Gabungan huruf (ng, ny: nyanyi, bunga)
6. Klaster (tr, pr, bl: truk, putri, blus)
7. Kata panjang / tiga-empat suku
8. Kalimat pendek

Hal yang perlu diputuskan pemilik sebelum dibangun:
- Nama game & ikon; berapa soal per tahap.
- Tampilan **peta jalan** (pastel, senada app — bukan galaksi gelap) di atas pemilih level
  `chooseLevel`, atau cukup kartu bertahap biasa dulu.
- Tahap berikutnya terkunci sampai tahap sebelumnya selesai, atau bebas dipilih.
- Tipe soal per tahap: memakai template yang ada (tap-answer, spell, drag-drop) — nol
  template baru kalau bisa.
- Hubungannya dengan Suku Kata & Ejaan Jitu (dilebur, atau berdampingan).

## Yang ditolak & alasannya (jangan diusulkan ulang tanpa alasan baru)

- **Pengenalan suara ("Ayo Mengucap")**: merekam suara anak & mengirimnya ke server Google
  (Kebijakan Privasi menjanjikan tidak ada data begitu); akurasi buruk untuk suara anak
  berbahasa Indonesia → anak yang benar dinilai salah, melanggar "tidak ada hukuman";
  butuh internet; dukungan iPhone tak stabil.
- **Tema gelap luar angkasa**: teks soal kita cokelat tua di latar pastel dan semua seni
  dibuat untuk latar terang (alasan yang sama dengan latar `malam` yang sengaja tidak gelap).
- **Seret huruf ke slot kosong**: isinya sudah tercakup Suku Kata & Ejaan Jitu; diseret
  vs diketuk tidak menambah pelajaran.
