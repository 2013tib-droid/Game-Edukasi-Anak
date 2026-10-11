# Prompt Ikon Mata Pelajaran

Sasaran: `SUBJECT_STYLE.<mapel>.pic` di `src/data/subjects.ts` → file
`public/assets/subjects/<id>.webp`. Satu file dipakai DUA tempat: judul halaman mapel
(`/kelompok/sd2/matematika`, tinggi 56 px) dan hiasan pojok kartu di layar "Pilih Mata
Pelajaran" (60 px, pudar 40%). Selama filenya belum ada, yang tampil emoji `deco`.

Pasang: potong dengan `python3 scripts/cut-item.py <gambar> public/assets/subjects/matematika.webp 320`,
tempel hasilnya di atas warna gelap dulu (lubang terkurung harus ditembus manual), lalu
tambahkan `pic: 'matematika'` di barisnya. Tak ada kode lain yang berubah.

## Status

| mapel | file | status |
|---|---|---|
| `matematika` | `matematika.webp` (320×269, 20 kB) | ✅ terpasang 2026-10-11 — sempoa Pilihan 1. Empat bidang putih di jendela sempoa (terkurung, tak terjangkau flood-fill) ditembus manual; kilau mata dibiarkan. |
| `bahasa-indonesia` · `ipas` · `pancasila` · `seni-rupa` · `bahasa-inggris` | — | prompt di bawah, masih emoji |

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

## Baris prompt — mapel lainnya (kirim SATU per pesan, selalu + EKOR PROMPT)

Ikon yang SUDAH dipakai game di mapel itu dihindari, supaya ikon mapel tidak terbaca
sebagai salah satu game-nya.

| id file | hindari | Baris prompt |
|---|---|---|
| `bahasa-indonesia` | kereta (Susun Kalimat), kaca pembesar (Detektif Bacaan) | Buatkan: satu buku terbuka yang gemuk dan membulat, sampulnya warna ungu lavender pastel, dengan pita pembatas buku warna peach menjuntai dari tengahnya. Halaman-halamannya POLOS krem, tanpa tulisan, tanpa garis kalimat, tanpa gambar. Wajah imut digambar di sampul bagian bawah depan, tidak di halaman. Bentuk keseluruhan hampir persegi. Tambahkan dua bintang kecil pastel di dekatnya. |
| `ipas` | kecambah dalam pot (Kebun Ilmu), bola dunia (Sahabat Bumi), kaca pembesar | Buatkan: satu mikroskop mainan kecil yang gemuk dan membulat warna hijau mint pastel, dengan satu daun kecil hijau muda di atas meja kacanya. Wajah imut digambar di badan mikroskop yang lebar, tidak di lensanya. Bentuk keseluruhan menjulang dan ringkas, tidak melebar. Tambahkan dua bintang kecil pastel di dekatnya. |
| `pancasila` | burung garuda & lambang sila (Perisai Garuda — lambang negara tidak boleh dikarang) | Buatkan: satu bendera kecil berkibar di tiang kayu pendek, bendera itu terdiri dari DUA warna saja: merah di setengah bagian atas dan putih di setengah bagian bawah, tanpa gambar atau simbol apa pun di benderanya. Wajah imut digambar di bulatan emas di puncak tiang, tidak di benderanya. Bentuk keseluruhan hampir persegi. Tambahkan dua bintang kecil pastel di dekatnya. |
| `seni-rupa` | palet cat (Labirin Warna), kuas & palet (Sanggar Warna), gunting (Studio Kolase) | Buatkan: satu kanvas lukis kecil berdiri di atas penyangga lukisan (easel) kayu, kanvasnya berisi lukisan pelangi lembut warna merah muda, kuning, dan mint di atas langit biru muda. Wajah imut digambar di papan kayu penyangga di bawah kanvas, tidak di lukisannya. Bentuk keseluruhan menjulang dan ringkas. Tambahkan dua bintang kecil pastel di dekatnya. |
| `bahasa-inggris` | perahu layar (Kapten Kata), bola dunia | Buatkan: satu balon ucapan bulat yang gemuk warna biru muda pastel, di dalamnya tiga huruf kapital besar A, B, dan C berjajar, warna peach, kuning krem, dan hijau mint. Wajah imut digambar KECIL di bagian bawah balon, di bawah hurufnya — wajah dan huruf tidak boleh saling menimpa. Selain huruf A, B, dan C tidak boleh ada tulisan apa pun. Tambahkan dua bintang kecil pastel di dekatnya. |

Catatan per gambar:

- **`pancasila`: cek urutan warnanya** — MERAH di atas, putih di bawah. Bendera terbalik
  (putih di atas) itu bendera Polandia; jangan dipakai walau gambarnya lucu.
- **`bahasa-inggris`: huruf A dan B punya lubang terkurung** — tembus manual sesudah dipotong
  (pelajaran keempat `prompt-ikon-game.md`).
- **`ipas` & `seni-rupa`**: celah di antara kaki penyangga/mikroskop juga terkurung —
  periksa di atas latar gelap.
