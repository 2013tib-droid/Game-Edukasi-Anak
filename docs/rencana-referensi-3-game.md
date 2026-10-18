# Rencana: 3 referensi game (2026-10-18)

> **STATUS: CATATAN SAJA — BELUM DIPRODUKSI.** Keputusan pemilik 2026-10-18:
> *"Catat dulu aja nanti kalo aku bilang kerjakan game nya baru kita produksi."*
> Jangan mulai membuat config, template, atau aset dari dokumen ini sebelum
> pemilik bilang "kerjakan".

Pemilik mengirim tangkapan layar tiga game dari luar. Arahan pemilik:
**cara mainnya boleh mirip, tapi bentuknya JANGAN disamakan — gambar dan
metodenya kita ganti.** Ini sejalan dengan pelajaran "EduQuest" (2026-10-11,
lihat CLAUDE.md): desain/teks situs orang lain cuma arah, tidak disalin
bentuk, warna, tata letak, maupun kalimatnya.

**Asal tangkapan layarnya belum diketahui** (game siapa). Tanyakan ke pemilik
sebelum produksi kalau belum dijawab.

## Yang TIDAK diambil dari ketiga referensi (berlaku untuk semuanya)

- **Maskot hewan bertopi safari** (kucing, panda) di kiri layar — kita punya
  tokoh & seni sendiri; pemandu cukup seni registry yang sudah ada atau tanpa
  pemandu.
- **Kepala soal "lingkaran nomor + papan kayu judul + kalimat kecil di bawahnya"**
  dan **pil bintang enam** di atas — kita tetap memakai baris atas `GameShell`
  (⬅️, titik level / halaman proyek, 🔊).
- **Kalimat instruksinya** ("Mencari gambar yang hilang", "Menyusun bentuk sesuai
  contoh", "Asyik, betul! +10") — tulis kalimat sendiri; dan instruksi kita
  WAJIB dinarasikan.
- **Skor poin "+10"** — kita memakai bintang per level (salah = bintang berkurang,
  tanpa hukuman). Jangan menambah sistem poin.
- **Ungu** (popup "Asyik, betul!" di referensi 2) — pemilik tidak suka ungu.
- Tombol jeda ⏸️ — app ini tak punya layar jeda; jangan ditambah hanya karena
  ada di referensi.

---

## Referensi 1 — "Gambar yang hilang" dalam deretan pola

**Yang terlihat:** deretan 5 mobil (hijau, merah, hijau, ?, hijau) di atas rel,
empat kartu mobil berwarna di bawahnya, anak memilih yang mengisi "?".

**PERINGATAN TUMPANG TINDIH — sudah ada di app kita:**
- TK: slot "Pola Ajaib" di **Labirin Warna** (tap-answer `sequence`, AB/AAB/ABC).
- SD: **Pola Pintar** (bentuk, warna, bangun ruang, bilangan).
Keduanya persis "pilih kartu yang mengisi ?". Membuat game ketiga yang sama =
anak merasa game kita isinya itu-itu saja. Jadi yang diambil HANYA intinya
(melengkapi pola), dengan metode yang berbeda:

**Usulan versi kita — "Taman Pola" (TK) / "Kereta Pola" (SD):**
- **Metode: SERET benda ke celah**, bukan ketuk kartu (deretan = barisan pot
  bunga / gerbong kereta, celahnya pot/gerbong kosong).
- **Lebih dari satu celah** dalam satu deret (SD: 2–3 celah, termasuk celah di
  awal deret — bukan selalu "berikutnya").
- **Mode "perbaiki pola"**: deret sudah penuh tapi ada SATU benda yang salah;
  anak menyentuh yang salah lalu menyeret penggantinya.
- **Ciri polanya bukan cuma warna**: besar-kecil, menghadap kiri-kanan, jumlah
  (1-2-1-2), dan untuk SD gabungan dua ciri.
- **Bunyi**: tiap benda punya nada (kereta "tut", bunga "ting"), deret yang
  lengkap dimainkan sebagai irama — pola terdengar, bukan hanya terlihat
  (pakai `tones.ts` Lab Cahaya & Bunyi, terdengar di iPhone senyap).
- Gambar: seni item registry (kendaraan, buah, bunga) — nol aset baru.
- Calon engine: bisa jadi mode baru `drag-drop` atau template kecil sendiri;
  putuskan saat produksi.

## Referensi 2 — Hubungkan lingkaran sesuai urutan warna

**Yang terlihat:** urutan target di atas (biru → abu → hijau → oranye), papan
3×3 lingkaran warna, anak menarik garis dari lingkaran ke lingkaran sesuai
urutan (seperti pola kunci HP).

**Usulan versi kita — "Jejak Lebah" (TK) / "Jejak Rahasia" (SD):**
- **Metode: satu goresan jari menyambung benda bergambar**, bukan lingkaran
  warna polos: lebah mengunjungi bunga, kupu-kupu ke buah, dsb. Garis jejaknya
  digambar SVG engine (rAF langsung ke DOM, pelajaran PathTrace — jangan state
  React per gerakan jari).
- **TK**: urutan 2–3 benda, contoh urutan TETAP terlihat dan DIBACAKAN
  ("Bunga merah, lalu apel, lalu matahari"); salah sambung = garis memudar
  senyap, mulai lagi dari benda terakhir yang benar.
- **SD**: (a) **urutan disembunyikan** sesudah diperlihatkan beberapa detik
  (latihan ingatan urutan), (b) **urutan dari aturan, bukan contoh**:
  sambung 1-2-3-4, A-B-C, kelipatan dua, dari terkecil ke terbesar,
  urutan daur hidup/kegiatan pagi.
- Papan tidak selalu 3×3 kisi — boleh tersebar seperti taman (titiknya tetap
  ≥ 64 px target sentuh).
- Bedanya dengan **Petak Ajaib / Panah Warna (`color-path`)**: di sana anak
  memasang aturan panah; di sini anak sendiri yang menarik jalurnya.
- Nol aset baru (seni item + SVG engine).

## Referensi 3 — Susun bentuk sesuai contoh

**Yang terlihat:** gambar contoh rumah (segitiga merah, dua persegi panjang
hijau, persegi kuning & biru), papan kayu bersiluet putus-putus tiap keping,
baki keping di kanan; anak menyeret keping ke tempatnya.

**PERINGATAN TUMPANG TINDIH:** **Puzzle Gambar** (TK, potongan gambar) dan
**Studio Kolase** (SD, tiru rancangan) — jangan dibuat jadi puzzle gambar
kedua. Intinya di sini: **bangun datar menyusun benda**.

**Usulan versi kita — "Bengkel Bentuk" (TK) / "Arsitek Cilik" (SD):**
- **Bahan = bangun datar SVG engine** (`Shape.tsx`). **TK hanya bentuk yang
  akrab** (lingkaran, kotak, persegi panjang, segitiga, setengah lingkaran bila
  dibuat) — keputusan 2026-07-28, trapesium/segilima/segienam DILARANG di TK.
- **TK**: siluet tiap keping tergambar di papan (seperti referensi), tapi benda
  yang disusun beda: roket, perahu, pohon, kereta, robot, kue ulang tahun.
  Keping yang ditaruh di siluet yang salah kembali senyap (pola Puzzle Gambar).
  Selesai = bendanya hidup (roket meluncur, perahu berlayar) — ini hadiahnya.
- **SD**: hanya **garis luar siluet** (tanpa garis dalam) + **keping bisa
  diputar** (ketuk = putar 90°) + keping pengecoh di baki; pertanyaan penutup
  "berapa segitiga yang kamu pakai?" (menyambung ke materi bangun datar).
- **Tanpa panel "Contoh" terpisah di TK** kalau siluetnya sudah berwarna samar
  (hemat lebar layar HP 320 px); SD justru memakai contoh kecil karena
  siluetnya polos.
- Nol aset baru.

---

## Saat pemilik bilang "kerjakan"

1. Tanyakan dulu: referensi mana yang dikerjakan, untuk kelompok mana
   (TK / SD 1-2 / SD 3-4), dan nama gamenya.
2. Tunjukkan tumpang tindih di atas sekali lagi, terutama referensi 1.
3. Ikuti alur biasa: narasi tanpa digit, uji headless 320×568 / 360×640 /
   740×360 / 820×1180, Deploy development dulu (`docs/alur-deploy.md`).
