# Prompt Gambar Judul (Sampul Kartu) — Baca Cerita

Dokumen **siap tempel** untuk membuat **gambar judul** tiap cerita di game
**Baca Cerita** (`src/games/sd1/cerita-kancil.ts`) — gambar yang tampil di
KARTU pemilih cerita, bukan di halaman ceritanya.

Bedanya dengan `prompt-ilustrasi-baca-cerita.md`:

| | `prompt-ilustrasi-baca-cerita.md` | **dokumen ini** |
|---|---|---|
| Dipakai di | halaman cerita (`StoryPage.art`) | **kartu pemilih** (`LevelCard.art`) |
| Isinya | satu ADEGAN yang menerangkan kalimat halaman itu | **satu gambar pengundang** — "cerita ini tentang siapa" |
| Jumlah | satu per halaman (19 halaman) | **satu per cerita (9 gambar)** |
| Rasio | 4:3 (halaman biasa) / 16:9 (halaman keputusan) | **16:9, selalu** |
| Tampil selebar | ±340px | **±160px (HP) – 220px (tablet)** |

Gayanya SAMA (lukisan buku cerita), jadi blok gaya di bawah sengaja mengikuti
dokumen itu — yang berbeda cuma aturan komposisinya.

---

## Keadaan sekarang (per 2026-09-03, sore) — SELESAI

**Semua cerita sudah punya sampulnya sendiri.** Delapan gambar kiriman pemilik
hari ini sudah diperkecil ke 640px dan terpasang di config:

| Level | Judul | Sampul |
|---|---|---|
| `l1` | Kancil dan Pak Tani | `sampul-kancil-tani` |
| `l2` | Jalak dan Kerbau | `sampul-jalak-kerbau` |
| `l3` | Kancil dan Gajah | `sampul-kancil-gajah` |
| `n1` | Anak Gembala dan Serigala | `sampul-gembala` |
| `n2` | Semut dan Belalang | `sampul-semut-belalang` |
| `n3` | Timun Mas | `sampul-timun-mas` |
| `n5` | Kura-kura dan Kelinci | `sampul-kura-kelinci` |
| `n6` | Bawang Putih | `sampul-bawang-putih` |

Tak ada lagi kartu beremoji dan tak ada lagi ilustrasi halaman yang dipinjam
jadi sampul. `n1`-`n3`, `n5`, `n6` tetap `soon` (redup + gembok): sampulnya
sudah ada, ceritanya yang belum dibuka.

**`n4` "Dompet di Jalan" DIHAPUS** (permintaan pemilik 2026-09-03 sore) —
ceritanya, 18 baris narasinya dan 18 file suaranya sudah dibuang, jadi
`sampul-dompet` tidak perlu dibuat. Promptnya di bawah dicoret, tidak dihapus,
supaya jelas ini keputusan dan bukan kelupaan.

Dokumen ini tinggal jadi CATATAN: kalau nanti ada cerita baru, ikuti aturan
komposisi & blok gaya di bawah dan tulis promptnya dengan pola yang sama.

---

## Aturan komposisi (INI yang membedakan sampul dari ilustrasi halaman)

App merender sampul dengan `object-fit: cover` di kotak **16:9** — artinya
gambarnya **dipotong** mengikuti kotak itu, bukan dikecilkan sampai muat.
Akibatnya:

1. **Kirim 16:9.** Rasio lain akan terpotong di sisi yang lebih panjang.
2. **Tokoh di TENGAH, jangan di tepi.** Sisakan ruang kosong ±8% di keempat
   tepi; apa pun yang menempel di tepi berisiko hilang.
3. **Tokohnya BESAR — mengisi setengah sampai dua pertiga tinggi gambar.**
   Ini beda paling penting dari ilustrasi halaman: kartunya cuma selebar
   ±160px di HP, jadi pemandangan luas dengan tokoh sebesar jempol akan
   terbaca sebagai bercak hijau. Adegan lengkap urusan halaman cerita; sampul
   cukup **tokohnya**.
4. **Maksimal DUA tokoh.** Tiga atau lebih membuat tiap tokoh terlalu kecil.
5. **Latar sederhana** — satu warna suasana (hijau hutan, kuning sawah, biru
   sungai) plus siluet pohon. Latar ramai membuat tokohnya hilang di ukuran
   sekecil itu.
6. **Tanpa teks apa pun.** Judulnya ditulis app di bawah gambar; huruf di
   dalam gambar akan tertindih tombol 🔊 dan tak terbaca.
7. **Sudut kanan atas & kiri bawah ditempeli app** (tombol 🔊 dan bintang),
   jadi jangan menaruh wajah tokoh persis di dua sudut itu.

---

## BLOK GAYA (tempel sekali di awal chat)

> Kamu akan membantuku membuat **gambar sampul** untuk kartu pilihan cerita di
> aplikasi buku cerita anak Indonesia usia 6–8 tahun. Semua tokohnya
> **karakter orisinal**, bukan tokoh dari film, kartun, atau buku mana pun.
> Semua gambar HARUS mengikuti aturan berikut:
>
> **Gaya**
> - Ilustrasi buku cerita anak, **cat digital lembut** — bukan stiker, bukan
>   vektor flat, bukan 3D render, bukan foto.
> - Garis luar tipis dan lembut, **shading halus**, warna hangat dan cerah,
>   pencahayaan siang tropis Indonesia.
> - Hewan digambar **kartun ramah**: mata besar berbinar, senyum kecil,
>   proporsi imut — tapi tetap terlihat seperti hewannya, bukan manusia
>   berbaju.
>
> **Komposisi (ini gambar SAMPUL, bukan halaman cerita)**
> - **Mendatar, rasio 16:9**, resolusi setinggi mungkin.
> - **Satu atau dua tokoh saja**, ditaruh **di tengah** dan **besar** —
>   mengisi setengah sampai dua pertiga tinggi gambar. Wajahnya terlihat jelas.
> - Sisakan ruang kosong sekitar 8% di keempat tepi; jangan ada bagian tokoh
>   yang menempel ke tepi gambar.
> - **Latar sederhana**: satu suasana tempat (hutan, sawah, sungai, padang)
>   dengan siluet pohon/rumput yang lembut dan agak kabur. Jangan ramai,
>   jangan banyak benda kecil — gambarnya akan ditampilkan sekecil kartu.
>
> **Larangan mutlak**
> - **Tanpa teks, huruf, angka, balon kata, atau watermark** apa pun.
> - **Tanpa bingkai, garis tepi, sudut membulat, atau vignette** — gambar
>   mengisi penuh sampai ke tepi (app yang membulatkan sudutnya sendiri).
> - **Tanpa tokoh yang menakutkan.** Serigala, raksasa, buaya dan ular adalah
>   tokoh cerita, bukan monster: **mulut tertutup atau senyum kecil, tanpa
>   taring runcing, tanpa mata merah, tanpa darah, tanpa lidah menjulur
>   mengancam.**
> - Tanpa panel komik, tanpa kolase, tanpa beberapa adegan dalam satu gambar.
> - Tanpa manusia tambahan yang tidak disebut di promptnya.
>
> Balas "siap" saja, lalu tunggu aku mengirim sampulnya satu per satu.

---

## Prompt per cerita (satu pesan = satu gambar)

Kirim **satu baris ini per pesan**. Kalau ceritanya sudah punya ilustrasi
halaman (`l1`–`l3`), **lampirkan salah satu ilustrasinya** supaya tokohnya
konsisten — model jauh lebih patuh melihat contoh daripada membaca deskripsi
gayanya.

**1 · `l3` Kancil dan Gajah → `sampul-kancil-gajah`** *(✅ sudah terpasang)*

> Sampul: seekor **kancil** kecil bertubuh cokelat berbintik putih berdiri
> tegak di sebelah kiri tengah, dan seekor **gajah** abu-abu berkaki
> belepotan lumpur di sebelah kanan tengah, keduanya saling memandang dengan
> ramah. Latar rawa hutan tropis yang lembut dan agak kabur. Dua tokoh itu
> mengisi dua pertiga tinggi gambar.

**2 · `n1` Anak Gembala dan Serigala → `sampul-gembala`** *(✅ sudah terpasang)*

> Sampul: seorang **anak laki-laki gembala** Indonesia bertopi jerami
> tersenyum sambil memegang tongkat, dan seekor **domba putih** berdiri di
> sebelahnya. Keduanya di tengah dan besar. Latar padang rumput hijau luas
> dengan bukit lembut di kejauhan. Tanpa serigala.

**3 · `n2` Semut dan Belalang → `sampul-semut-belalang`** *(✅ sudah terpasang)*

> Sampul: seekor **semut** merah menggendong sebutir biji-bijian di
> punggungnya, dan seekor **belalang** hijau memegang sehelai daun seperti
> gitar, berdiri berhadapan di tengah gambar dan digambar BESAR — seukuran
> tokoh utama, bukan serangga kecil di kejauhan. Latar kebun berumput hijau
> yang lembut.

**4 · `n3` Timun Mas → `sampul-timun-mas`** *(✅ sudah terpasang)*

> Sampul: seorang **anak perempuan Indonesia** berkebaya sederhana, rambut
> hitam dikuncir, tersenyum sambil memeluk sebuah **timun besar berwarna
> keemasan**. Ia di tengah gambar dan besar. Latar kebun timun hijau dengan
> pondok kayu kecil yang kabur di kejauhan. Tanpa raksasa.

**~~5 · `n4` Dompet di Jalan → `sampul-dompet`~~** *(DIBATALKAN — ceritanya dihapus 2026-09-03)*

> Sampul: seorang **anak perempuan Indonesia** berseragam sekolah dasar
> (atasan putih, rok merah) berdiri di tengah, menunduk memandang sebuah
> **dompet kecil** yang tergeletak di trotoar di depan kakinya; wajahnya
> berpikir dan ramah. Latar jalan kota kecil yang lembut dan kabur.

**6 · `n5` Kura-kura dan Kelinci → `sampul-kura-kelinci`** *(✅ sudah terpasang)*

> Sampul: seekor **kura-kura** bercangkang hijau kecokelatan dan seekor
> **kelinci** putih berdiri berdampingan seperti di garis start, keduanya
> tersenyum, di tengah gambar dan besar. Latar tepi hutan berumput hijau yang
> lembut.

**7 · `n6` Bawang Putih → `sampul-bawang-putih`** *(✅ sudah terpasang)*

> Sampul: seorang **anak perempuan Indonesia** berkain sederhana, rambut
> disanggul, tersenyum lembut sambil membawa **bakul anyaman berisi cucian**
> di pinggangnya. Ia di tengah gambar dan besar. Latar tepi sungai jernih
> dengan pepohonan hijau yang kabur.

**8 · `l1` Kancil dan Pak Tani → `sampul-kancil-tani`** *(✅ sudah terpasang)*

> Sampul: seekor **kancil** kecil bertubuh cokelat berbintik putih berdiri
> tegak di tengah sambil menggigit sehelai daun timun, wajahnya cerdik dan
> ramah. Latar kebun timun hijau yang lembut dan agak kabur.

**9 · `l2` Jalak dan Kerbau → `sampul-jalak-kerbau`** *(✅ sudah terpasang)*

> Sampul: seekor **kerbau** abu-abu gelap bertanduk melengkung berdiri di
> tengah, dan seekor **burung jalak** berbadan hitam, berparuh & berkaki
> kuning, dengan garis putih di sayap, bertengger di punggungnya. Latar sawah
> hijau yang lembut dan agak kabur.

Kalau hasilnya melenceng, balas:
*"Ulangi dengan aturan di awal chat: rasio 16:9, satu-dua tokoh saja di tengah
dan besar, latar sederhana, tanpa teks, tanpa bingkai."*

---

## Sesudah gambarnya jadi

1. Unduh, **beri nama persis seperti nama file di judul promptnya** (mis.
   `sampul-kancil-gajah.png`), kirim ke sini.
2. Saya yang memperkecil & mengekspor:

   ```
   python scripts/story-art.py sampul-kancil-gajah.png \
     public/assets/story/sampul-kancil-gajah.webp 640
   ```

   **640px, bukan 900px** seperti ilustrasi halaman: sampul cuma tampil
   selebar ±220px, jadi 640 sudah ±3× dan filenya tinggal ±35 kB. Delapan
   sampul 900px akan menambah ±700 kB yang harus diunduh anak sebelum sempat
   memilih cerita.

   **Ukuran akhirnya HARUS 640×360 persis** (16:9 bulat), bukan 640×357 yang
   keluar kalau kiriman aslinya sedikit lebih lebar: kotak sampulnya
   `aspect-ratio: 16/9`, dan gambar yang rasionya beda dipotong sendiri oleh
   `object-fit: cover` — potongannya tak bisa diatur dan tokoh yang mepet tepi
   bisa hilang.

   **Kalau ada ruang kosong di atas tokohnya, potong dulu bagian atas itu**
   sebelum diperkecil (2026-09-03, laporan pemilik: tokohnya "kayak nyisa" di
   kartu). Model gambar suka menyisakan langit/tajuk pohon 5–15% di atas
   kepala; di kartu selebar 160px ruang itu terbaca sebagai bercak kosong.
   Potong atasnya lalu ambil jendela 16:9 dari sisanya (lebarnya ikut menyusut,
   dibagi rata kiri-kanan) — jangan menggencet gambarnya. Sisakan ±3% di atas
   bagian tertinggi tokoh: antena, telinga, tanduk, dan topi jerami paling
   sering terpotong.
3. Saya pasang di config — satu kata per cerita:
   `{ label: 'Kancil dan Gajah', item: 'elephant', art: 'sampul-kancil-gajah' }`.
4. Kalau ada cerita rakyat yang sekalian mau **dibuka** (tidak `soon` lagi),
   sebutkan — itu tinggal menghapus satu baris `soon: true`, tapi keputusannya
   di pemilik.

**Tidak ada file suara baru** untuk pekerjaan ini: sampul tidak menambah satu
kalimat pun, jadi `npm run narasi` tidak berubah dan rekaman lama tetap
terpakai.
