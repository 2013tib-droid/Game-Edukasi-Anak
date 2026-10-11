# Prompt Ikon Mata Pelajaran

Sasaran: `SUBJECT_STYLE.<mapel>.pic` di `src/data/subjects.ts` → file
`public/assets/subjects/<id>.webp`. Satu file dipakai DUA tempat: judul halaman mapel
(`/kelompok/sd2/matematika`, tinggi 56 px) dan hiasan pojok kartu di layar "Pilih Mata
Pelajaran" (60 px, pudar 40%). Selama filenya belum ada, yang tampil emoji `deco`.

Pasang: potong dengan `python3 scripts/cut-item.py <gambar> public/assets/subjects/matematika.webp 320`,
tempel hasilnya di atas warna gelap dulu (lubang terkurung harus ditembus manual), lalu
tambahkan `pic: 'matematika'` di barisnya. Tak ada kode lain yang berubah.

## Kenapa diganti (2026-10-11)

Emoji 🔢 tampil sebagai kotak abu-abu bertulisan "1234" di iPhone — terbaca seperti
tombol keyboard, bukan pelajaran. Cadangannya sudah diganti 🧮 (sempoa); seni di bawah
menggantikan keduanya.

## Aturan khusus ikon mapel

- **Bukan tanda ×** — itu ikon Kali Kilat. **Bukan balok berangka** (Hitung Hebat), **bukan
  pita ukur** (Ukur Yuk), **bukan stopwatch** (Waktu Tepat). Ikon mapel mewakili SEMUA game
  di dalamnya, jadi jangan mirip salah satunya.
- **Tanpa angka sama sekali.** Di 56 px angka jadi noda, dan wajah yang menimpanya
  memudarkannya (pelajaran ketiga `prompt-ikon-game.md`).
- **Rasio hampir persegi** (≤ 1,3): judulnya berbagi baris dengan kata "Matematika" di HP
  320 px.
- Warna utama ikut kartunya: **biru-ungu** (`#4f56d6` → `#7a6cf0`).

## Blok gaya & ekor prompt

Pakai BLOK GAYA dan EKOR PROMPT dari `docs/prompt-ikon-game.md` apa adanya — ekornya WAJIB
ditempel di tiap pesan.

## Baris prompt — `matematika`

**Pilihan 1 (disarankan) — sempoa:**

> Buatkan: satu sempoa (abakus) kecil yang gemuk dan membulat, bingkainya kayu warna
> biru-ungu lavender pastel, dengan tiga baris manik-manik bulat berwarna peach, kuning
> krem, dan hijau mint. Wajah imut (mata besar berkilau, pipi merona, senyum kecil)
> digambar di batang bingkai bagian atas, TIDAK di manik-manik. Bentuk keseluruhan hampir
> persegi, tidak melebar. Tambahkan dua bintang kecil pastel di dekatnya. Tidak ada angka,
> huruf, atau tulisan apa pun.

**Pilihan 2 — empat tanda hitung jadi permen:**

> Buatkan: satu toples kaca bulat yang gemuk berwajah imut di badannya, berisi empat permen
> jeli berbentuk tanda tambah, tanda kurang, tanda bagi (garis dengan titik di atas dan
> bawahnya), dan tanda sama dengan, warnanya peach, kuning krem, hijau mint, dan biru muda.
> Tutup toplesnya warna biru-ungu lavender. Tidak ada tanda kali. Tidak ada angka, huruf,
> label, atau tulisan apa pun di toples maupun tutupnya.

Pilihan 2 rawan: toples bisa diberi label bertulisan, dan bagian dalam kaca yang putih bisa
terkurung (perlu ditembus manual). Coba Pilihan 1 dulu.
