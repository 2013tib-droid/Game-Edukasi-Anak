# Prompt Ikon Kartu Game (yang masih emoji)

Sasaran: `GameMeta.pic` di `src/games/registry.ts` → file `public/assets/games/<id>.webp`.
Ikon ini dipakai DUA tempat sekaligus (kartu portal + layar intro), jadi satu file cukup.

## Yang masih emoji (semuanya kelompok SD Kelas 1 & 2)

| id | Judul | Ikon sekarang |
|---|---|---|
| `pasang-kata` | Pasang Kata | 🧩 |
| `hitung-hebat` | Hitung Hebat | 🔢 |
| `suku-kata` | Suku Kata | 📖 |
| `ejaan-jitu` | Ejaan Jitu | 🔤 |
| `pasangan-pintar` | Pasangan Pintar | 🤝 |
| `tulis-huruf` | Tulis Huruf | 🖊️ |
| `cerita-nusantara` | Cerita Nusantara | 📚 |
| `jam-pintar` | Jam Pintar | muka jam SVG (opsional diganti) |

Sudah bergambar: seluruh TK (8) + `cerita-kancil` + `tambah-tangkas`.

---

## BLOK GAYA (tempel sekali di awal chat Gemini)

> Kamu akan membantuku membuat ikon untuk game edukasi anak usia 4–8 tahun.
> Semua ikon HARUS mengikuti aturan gaya yang sama persis:
>
> - Gaya kartun **kawaii** yang imut dan ramah anak, sticker style.
> - Warna **PASTEL lembut** (peach, mint, biru muda, kuning krem, ungu muda),
>   shading halus, tanpa gradasi metalik, tanpa tekstur realistis.
> - Outline **tebal tapi lembut berwarna coklat/krem tua** — bukan hitam pekat.
> - Objek utamanya **berwajah imut**: mata besar berkilau, pipi merona, senyum kecil.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa bingkai, tanpa pola.
> - **Hanya SATU objek utama** di tengah. Hiasan kecil (bintang, percikan) boleh,
>   tapi jangan ramai.
> - **Tanpa teks, tanpa tulisan, tanpa watermark.** Pengecualian hanya kalau
>   huruf/angka itu memang BENTUK objeknya.
> - Format **persegi (1:1)**, resolusi tinggi.

## Baris prompt (kirim SATU per pesan)

| id file | Baris prompt |
|---|---|
| `pasang-kata` | Buatkan: dua keping puzzle besar yang sedang menyatu, keping kiri warna peach dan keping kanan warna mint, keduanya berwajah imut, dikelilingi 3–4 bintang kecil pastel. |
| `hitung-hebat` | Buatkan: tiga balok angka bertumpuk — angka 1 biru muda, angka 2 kuning krem, angka 3 hijau mint — balok paling depan berwajah imut, dikelilingi bintang kecil pastel. Angkanya harus jelas terbaca 1, 2, dan 3. |
| `suku-kata` | Buatkan: satu balon ucapan (speech bubble) besar warna biru muda berwajah imut, di dalamnya tiga bulatan kecil berjajar warna peach, kuning, dan mint, dikelilingi percikan bintang kecil. |
| `ejaan-jitu` | Buatkan: satu papan target bundar pastel (lingkaran merah muda, krem, mint) berwajah imut dengan satu anak panah bermata bintang menancap tepat di tengahnya, dikelilingi beberapa huruf kecil warna pastel yang beterbangan. |
| `pasangan-pintar` | Buatkan: dua lingkaran pastel besar yang dihubungkan garis lengkung bertitik-titik — lingkaran kiri warna peach berisi bintang kuning, lingkaran kanan warna mint berisi hati merah muda — kedua lingkaran berwajah imut. |
| `tulis-huruf` | Buatkan: satu pulpen warna biru muda berwajah imut berdiri miring, sedang menuliskan garis tinta lengkung yang membentuk huruf a kecil di bawahnya. Pulpen biru, BUKAN pensil kayu kuning. |
| `cerita-nusantara` | Buatkan: satu buku TERTUTUP bersampul hijau tosca bermotif batik sederhana warna krem, dengan pita pembatas merah muda menjuntai, buku itu berwajah imut, dan satu bintang kuning kecil melayang di atasnya. |
| `jam-pintar` (opsional) | Buatkan: satu jam dinding bulat pastel berwajah imut, angka 1 sampai 12 tertulis jelas dan urut di sekeliling muka jam, jarum pendek biru tua menunjuk angka 10 dan jarum panjang merah menunjuk angka 2. |

### Catatan per ikon
- **`cerita-nusantara` wajib buku TERTUTUP bermotif batik** — buku terbuka ungu sudah
  dipakai `cerita-kancil`, dua ikon buku yang mirip akan membingungkan.
- **`tulis-huruf` wajib pulpen biru** — pensil kayu kuning sudah dipakai `tulis-angka` (TK).
- **`pasang-kata` (puzzle) vs `pasangan-pintar` (dua lingkaran terhubung)** sengaja dibedakan
  bentuknya; keduanya game "menjodohkan", jangan sampai ikonnya sama-sama puzzle.
- **`hitung-hebat` bukan tanda tambah** — tanda tambah sudah jadi ikon `tambah-tangkas`.
- **`jam-pintar` opsional & berisiko**: mengganti ikonnya berarti melepas `iconClock`
  (muka jam SVG yang angkanya dijamin benar). Gambar AI sering salah menulis angka jam —
  kalau 1–12 tidak lengkap dan urut, JANGAN dipakai, biarkan SVG-nya.
- **`ejaan-jitu` alternatif** kalau papan target terasa terlalu "permainan panah":
  Buatkan: tiga balok huruf kayu pastel berdiri berjajar, balok tengah berwajah imut,
  dengan satu bintang kuning melayang di atasnya.

---

## Setelah gambarnya jadi

1. Beri nama file sesuai kolom `id` (mis. `pasang-kata.png`).
2. Potong latar + ekspor: `python scripts/cut-checkerboard.py <art> public/assets/games/<id>.webp 320`
   (`cut-item.py` kalau latarnya putih polos, bukan kotak-kotak palsu).
3. Tambah satu baris `pic: '<id>',` di entri game itu di `src/games/registry.ts`.
   `emoji` JANGAN dihapus — itu cadangan kalau file gagal dimuat.
4. Lihat dulu hasilnya di atas latar berwarna: bagian gambar yang terang paling rawan
   ikut terpotong flood-fill.

## Temuan sampingan
`public/assets/games/cerita-kancil.webp` **memuat tulisan bahasa Inggris** di dalam gambarnya
("My Story Adventures", "Every chapter is an adventure!"). Aplikasinya berbahasa Indonesia dan
aturan gaya melarang teks di dalam ikon — layak ikut diganti.
