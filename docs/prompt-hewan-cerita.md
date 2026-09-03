# Prompt Gambar — Hewan & Tokoh Cerita (Cerita Anak + Cerita Nusantara)

Dokumen **siap tempel** untuk melengkapi gambar di dua game cerita:

- **Cerita Anak** (`src/games/sd1/cerita-kancil.ts`) — 3 fabel hewan.
- **Cerita Nusantara** (`src/games/sd1/cerita-nusantara.ts`) — 6 cerita rakyat & fabel.

Sekarang sebagian besar halaman kedua game itu masih memakai **emoji**. Ini
masalah yang sama persis dengan hewan di Hutan Hewan dulu: emoji hewan
**berbeda bentuk di tiap HP**, dan beberapa di antaranya salah untuk ceritanya
(🦌 itu rusa bertanduk, padahal tokohnya **kancil**).

Halaman cerita juga tempat gambar tampil **paling besar di seluruh app** —
sampai **280px** di halaman tanpa pilihan (aturan `.story-emoji__img`), jauh
lebih besar dari kartu jawaban biasa. Jadi di sinilah kualitas gambar paling
kelihatan.

> **Gaya = sama dengan `prompt-gambar-gemini.md`** (stiker: outline hitam
> tebal, warna flat). **Bukan** gaya maskot naga yang lembut tanpa outline.
> Hewan-hewan ini akan berdampingan di layar yang sama dengan gajah, kura-kura,
> kelinci & jalak yang sudah ada — kalau gayanya beda, langsung terlihat.

---

## Ringkasan: yang perlu kamu buat

| Batch | Isi | Jumlah | Perlu? |
|---|---|---|---|
| **A** | Hewan tokoh cerita | **8 gambar** | **WAJIB** — ini inti permintaannya |
| **B** | Benda yang jadi subjek halaman | 4 gambar | Opsional |
| **C** | Tokoh manusia & raksasa | 4 gambar | Opsional, paling akhir |

Kirim sebagian dulu juga tidak apa-apa — id yang belum ada gambarnya tetap
jalan dengan emoji, tanpa error apa pun di app.

---

## Sebelum menggambar: 6 hal ini SUDAH ada gambarnya

Halaman-halaman berikut bisa langsung dinaikkan ke seni premium **tanpa gambar
baru** — cukup satu kata di config, tinggal bilang saja kalau mau saya pasang:

| Cerita | Halaman | Sekarang | Seni yang sudah ada |
|---|---|---|---|
| Kura-kura dan Kelinci | kura-kura (+ kartunya) | 🐢 | `turtle` |
| Kura-kura dan Kelinci | kelinci | 🐰 | `rabbit` |
| Kura-kura dan Kelinci | pohon | 🌳 | `tree` |
| Semut dan Belalang | rumah semut | 🏠 | `house` |
| Semut dan Belalang | berbagi makanan | 🍚 | `rice` |
| Bawang Putih | sungai/pemandangan | 🏞️ | `park` |

Jalak (Cerita Anak) & gajah (Kancil dan Gajah) **sudah** memakai seninya.

---

## Cara Pakai (baca ini dulu, 1 menit)

1. Buka chat **baru** di Gemini.
2. **Lampirkan 2–3 aset hewan yang sudah ada** sebagai rujukan gaya — paling
   baik `public/assets/items/elephant.webp`, `turtle.webp`, dan `rabbit.webp`.
   Ini langkah paling menentukan: model jauh lebih patuh melihat contohnya
   daripada membaca deskripsi gayanya.
3. Tempel **BLOK GAYA** di bawah satu kali.
4. Kirim **satu baris prompt per pesan**, satu gambar per pesan — jangan minta
   delapan sekaligus, hasilnya jadi kolase yang tidak bisa dipotong.
5. Unduh, **beri nama persis seperti kolom `id`** (mis. `kancil.png`), kirim ke
   sini. Saya yang potong latar jadi transparan, resize, ekspor WebP,
   daftarkan di kodenya, dan uji.

Kalau hasilnya melenceng, balas: *"Ulangi dengan aturan gaya di awal chat:
outline hitam tebal, warna flat, latar putih polos, satu objek saja, tanpa
bayangan."*

---

## BLOK GAYA (tempel sekali di awal chat)

> Kamu akan membantuku membuat serangkaian ilustrasi hewan untuk game cerita
> anak usia 6–8 tahun. Gambar yang kulampirkan adalah aset yang sudah ada —
> ikuti gayanya persis. Semua gambar HARUS mengikuti aturan yang sama:
>
> - Gaya kartun kawaii yang imut dan ramah anak, sticker style.
> - **Outline hitam tebal** mengelilingi seluruh objek.
> - Warna **flat dan cerah**, shading lembut seminimal mungkin, tanpa gradasi
>   rumit, tanpa tekstur realistis.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pantulan, tanpa
>   bingkai, tanpa pola, tanpa rumput/pohon/pemandangan apa pun.
> - **Hanya SATU hewan per gambar**, di tengah, seluruh badan masuk penuh
>   dengan sedikit ruang kosong di tepi.
> - Menghadap **depan atau tiga-perempat**, badan tegak. Bukan tampak samping.
> - **Ekspresi selalu ramah dan ceria.** Ini cerita untuk anak kecil: tidak ada
>   hewan yang terlihat marah, menyeramkan, bertaring tajam, atau mengancam —
>   **sekalipun tokohnya buaya, ular, atau serigala.**
> - **Tanpa teks, tanpa huruf, tanpa angka, tanpa watermark.**
> - Format **persegi (1:1)**, resolusi tinggi.
> - Bentuk hewan harus **jelas dan mudah dikenali dari siluetnya saja** —
>   tanpa properti tambahan, tanpa topi, tanpa baju, tanpa aksesori.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan hewannya satu per satu.

---

## BATCH A — 8 Hewan Tokoh Cerita (WAJIB)

**Aturan khusus batch ini — hewan "menakutkan" harus ramah.** Buaya, ular, dan
serigala adalah tokoh cerita, bukan monster: di app ini tidak ada hukuman dan
tidak ada yang boleh membuat anak takut. Gambarnya harus tetap **lucu dan
tersenyum**, mulut tertutup atau senyum kecil, **tanpa taring runcing, tanpa
mata merah, tanpa lidah menjulur mengancam**.

| id (nama file) | Hewan | Baris prompt untuk dikirim |
|---|---|---|
| `kancil` | kancil | Buatkan: seekor kancil (pelanduk/mouse-deer khas Indonesia) — rusa mungil bertubuh kecil ramping, bulu coklat muda dengan perut putih, **tanpa tanduk sama sekali**, kaki kuning langsing, telinga tegak membulat, mata besar berbinar, ekspresi cerdik dan ceria. |
| `crocodile` | buaya | Buatkan: seekor buaya hijau yang lucu dan ramah, badan gemuk pendek dengan sisik punggung bergerigi tumpul, moncong lebar dengan **mulut tertutup tersenyum**, mata besar bulat, **tanpa taring runcing dan tidak menyeramkan**. |
| `buffalo` | kerbau | Buatkan: seekor kerbau air khas Indonesia, badan gemuk warna **abu-abu kebiruan**, sepasang **tanduk besar melengkung ke belakang seperti bulan sabit**, moncong lebar, mata besar ramah, ekor kecil berumbai. Bukan sapi — jangan ada bercak putih-hitam. |
| `snake` | ular | Buatkan: seekor ular hijau muda yang lucu, tubuhnya **melingkar rapi menumpuk** dengan kepala di atas, pola belang hijau tua sederhana di punggung, mata besar bulat, **senyum kecil ramah, lidah tidak terlihat, tanpa taring**. |
| `sheep` | domba | Buatkan: seekor domba dengan bulu putih tebal menggumpal, wajah dan kaki warna krem kecoklatan, telinga kecil menggantung di samping, mata besar berbinar, pipi merah muda, ceria. |
| `wolf` | serigala | Buatkan: seekor serigala **abu-abu** yang lucu, badan berbulu dengan dada putih, telinga runcing tegak, ekor tebal, mata besar bulat, **mulut tertutup, tidak menyeramkan dan tidak menyeringai**. |
| `ant` | semut | Buatkan: seekor semut hitam kemerahan yang imut, tiga ruas badan bulat, enam kaki tipis, dua antena melengkung di kepala, mata besar berbinar, tersenyum, berdiri menghadap depan. |
| `grasshopper` | belalang | Buatkan: seekor belalang hijau muda yang imut, kaki belakang besar melipat, sayap hijau tertutup di punggung, dua antena panjang melengkung, mata besar berbinar, tersenyum, menghadap tiga-perempat. |

### Tiga pasangan yang WAJIB terlihat berbeda

Gambar-gambar ini muncul berdampingan dengan seni yang sudah ada. Kalau
bentuknya mirip, anak tidak bisa membedakan tokoh ceritanya:

- **`kancil` vs `rabbit` (kelinci) yang sudah ada** — kancil bertelinga
  **pendek membulat** dan berkaki panjang langsing; kelinci bertelinga panjang.
  Kancil juga **tidak boleh bertanduk** (itu yang salah dari emoji 🦌 sekarang).
- **`buffalo` vs `cow` (sapi) yang sudah ada** — kerbau abu-abu polos,
  tanduknya besar melengkung ke belakang. Sapi sudah ada dan berbercak.
- **`wolf` vs anjing** — serigala abu-abu, telinga runcing tegak. Proyek ini
  memang tidak memakai anjing (keputusan lama), jadi jangan digambar seperti
  anjing peliharaan berkalung.

### Kalau lebih suka prompt bahasa Inggris

Tempel utuh, satu per pesan, tetap dengan aset rujukan terlampir:

> Cute kawaii cartoon animal for a children's storybook game, one single
> animal, centered, full body visible, front or three-quarter view, thick black
> outline, flat bright colors with minimal soft shading, friendly smiling face,
> big sparkling eyes, plain white background, no shadow, no scenery, no text,
> square 1:1, sticker style, high resolution. **This animal:** _[isi salah satu]_
>
> - `kancil` — a tiny Indonesian mouse-deer (chevrotain): small slender body, light brown fur, white belly, **no antlers at all**, thin legs, small rounded ears, clever cheerful expression.
> - `crocodile` — a chubby friendly green crocodile, blunt rounded back scales, **closed smiling mouth, no sharp fangs, not scary at all**.
> - `buffalo` — an Indonesian water buffalo, **blue-grey** chunky body, large crescent horns curving backwards, broad muzzle, gentle eyes. Not a dairy cow, no black-and-white patches.
> - `snake` — a cute light-green snake **coiled up in a neat stack** with its head on top, simple darker green stripes, **small friendly smile, no fangs, no flicking tongue**.
> - `sheep` — a fluffy white woolly sheep, cream-brown face and legs, small floppy ears, rosy cheeks, cheerful.
> - `wolf` — a cute **grey** wolf, white chest fur, pointed upright ears, bushy tail, **closed mouth, friendly, not snarling**.
> - `ant` — a cute black-red ant, three round body segments, six thin legs, two curved antennae, smiling, front view.
> - `grasshopper` — a cute light-green grasshopper, big folded hind legs, closed green wings on the back, two long curved antennae, smiling, three-quarter view.

---

## BATCH B — 4 Benda Subjek Halaman (opsional)

Ini benda yang **jadi subjek halamannya sendiri**, bukan sekadar hiasan.
Aturan benda mati (sama dengan Batch 4 di `prompt-gambar-gemini.md`):
**tanpa wajah**, bentuk paling umum yang gampang dikenali.

| id (nama file) | Objek | Dipakai di | Baris prompt untuk dikirim |
|---|---|---|---|
| `cucumber` | mentimun | Kancil dan Pak Tani · **Timun Mas** | Buatkan: satu buah mentimun hijau utuh memanjang dengan kulit bergaris hijau tua dan ujung bertangkai kecil, posisi diagonal, tanpa wajah. |
| `pumpkin` | labu | Bawang Putih (labu hadiah) | Buatkan: satu buah labu oranye bulat gemuk dengan alur vertikal dan tangkai hijau pendek di atas, tanpa wajah, **bukan labu Halloween — tanpa ukiran wajah sama sekali**. |
| `broom` | sapu | Bawang Putih (membersihkan rumah) | Buatkan: satu sapu ijuk tradisional dengan gagang kayu coklat dan bulu sapu warna coklat kehitaman, posisi diagonal, tanpa wajah. |

`cucumber` paling berguna — dipakai **dua cerita** di dua game berbeda, dan
"Timun Mas" itu judul yang timunnya memang harus terlihat.

---

## BATCH C — 4 Tokoh Manusia & Raksasa (opsional, paling akhir)

Boleh dilewati: halaman-halaman ini tetap masuk akal dengan emoji, dan tokoh
manusia paling sulit dibuat konsisten. Kalau dibuat, aturannya:

- **Satu orang per gambar**, seluruh badan, berdiri menghadap depan, ekspresi
  ramah tersenyum.
- Berpakaian **sopan dan sederhana ala Indonesia**, tanpa properti berlebihan.
- **Jangan pernah menggambar dua tokoh dalam satu gambar** — halaman cerita
  hanya menampilkan satu gambar, dan dua tokoh berdampingan bisa terbaca
  sebagai hubungan yang tidak dimaksud (pelajaran dari cerita yang ditolak
  pemilik, 2026-08-09).

| id (nama file) | Tokoh | Dipakai di | Baris prompt untuk dikirim |
|---|---|---|---|
| `farmer` | Pak Tani | Kancil dan Pak Tani | Buatkan: seorang petani Indonesia yang ramah tersenyum, memakai caping (topi bambu kerucut), baju lengan panjang sederhana warna coklat, berdiri menghadap depan, seluruh badan masuk, tanpa alat apa pun di tangan. |
| `shepherd` | anak gembala | Anak Gembala dan Serigala | Buatkan: seorang anak laki-laki gembala yang ceria, baju sederhana warna hijau, memegang tongkat kayu panjang, berdiri menghadap depan, seluruh badan masuk. |
| `granny` | nenek | Timun Mas · Bawang Putih | Buatkan: seorang nenek Indonesia yang ramah tersenyum, rambut putih disanggul, memakai kebaya sederhana warna biru muda dan kain batik, berdiri menghadap depan, seluruh badan masuk. |
| `giant` | raksasa | Timun Mas | Buatkan: raksasa kartun yang **lucu dan tidak menakutkan**, kulit hijau, badan besar gemuk, rambut hitam berantakan, memakai rompi coklat sederhana, **mulut tertutup tersenyum kecil, tanpa taring, tanpa mata merah, tanpa darah** — ini untuk cerita anak kecil. |

Tokoh lain (Rani, satpam, bapak pemilik dompet) sengaja tidak masuk daftar:
mereka hanya muncul sekali dan emoji sudah cukup.

---

## Setelah Gambarnya Terpasang: yang berubah di kode

Buat catatan saya sendiri — kamu tidak perlu melakukan apa pun:

| Cerita | Halaman | Sekarang | Jadi |
|---|---|---|---|
| **Kancil dan Pak Tani** | kartu pemilih + halaman 1 | 🦌 | `kancil` |
| | kebun mentimun | 🥒 | `cucumber` |
| | Pak Tani | 👨‍🌾 | `farmer` |
| | buaya di sungai | 🐊 | `crocodile` |
| **Jalak dan Kerbau** | kerbau berkubang | 🐃 | `buffalo` |
| | ular mendekat | 🐍 | `snake` |
| **Kancil dan Gajah** | halaman 1 | 🦌 | `kancil` |
| | teman-teman datang | 🐃 | `buffalo` |
| **Anak Gembala** | kartu pemilih + domba | 🐑 | `sheep` |
| | anak gembala | 🧒 | `shepherd` |
| | serigala datang | 🐺 | `wolf` |
| **Semut dan Belalang** | kartu pemilih + semut | 🐜 | `ant` |
| | belalang bernyanyi | 🦗 | `grasshopper` |
| | rumah semut · berbagi makanan | 🏠 🍚 | `house` · `rice` **(sudah ada)** |
| **Kura-kura dan Kelinci** | kura-kura · kelinci · pohon | 🐢 🐰 🌳 | `turtle` · `rabbit` · `tree` **(sudah ada)** |
| **Timun Mas** | ladang timun | 🥒 | `cucumber` |
| | Mbok Srini | 👵 | `granny` |
| | raksasa | 👹 | `giant` |
| **Bawang Putih** | nenek | 👵 | `granny` |
| | membersihkan rumah | 🧹 | `broom` |
| | labu hadiah | 🎁 | `pumpkin` |
| | sungai/pemandangan | 🏞️ | `park` **(sudah ada)** |

Langkah kerjanya:

1. Potong latar jadi transparan (`scripts/cut-item.py`), autocrop, resize sisi
   terpanjang 512px, ekspor WebP transparan ke `public/assets/items/<id>.webp`.
2. Daftarkan di `src/engine/ui/items.ts` (`kancil: { emoji: '🦌', label: 'kancil', ext: 'webp' }`).
3. `cerita-nusantara.ts` belum punya helper `pic()` seperti `cerita-kancil.ts`
   — tambahkan (satu baris), lalu ganti halaman yang ada di tabel atas.
   Kartu pemilih cerita ikut: `card: { label, item }`.
4. Jalankan `node scripts/check-item-ids.mjs` (semua id yang dirujuk config
   harus terdaftar & asetnya ada), lalu uji headless 360×640, 380×800 &
   820×1180: tiap cerita dimainkan sampai layar hasil, semua WebP terambil 200,
   tanpa scroll & nol error console.

**NOL file suara baru.** Gambar tidak menyentuh satu pun kalimat narasi, jadi
manifest suara tidak berubah dan tidak ada yang perlu dirender ulang lewat
Azure.

---

## Aturan Teknis yang Menentukan Hasil Dipakai atau Tidak

- **Latar putih polos, tanpa bayangan lantai dan tanpa pemandangan.** Halaman
  cerita sudah punya latarnya sendiri (hutan/sawah/sungai digambar engine di
  `src/engine/ui/Scene.tsx`) — hewan yang datang membawa rumput atau langit
  sendiri akan terlihat seperti stiker tertempel di atas latar yang lain.
- **Tanpa partikel yang melayang jauh dari badan** (daun jatuh, garis gerak,
  percikan). Setelah autocrop, benda terluar yang menentukan batas gambar, jadi
  hewannya jadi tampil kecil di tengah.
- **Jangan tampak samping.** Ini beda dari kendaraan di `prompt-gambar-gemini.md`
  yang wajib side view karena engine memutarnya mengikuti jalan; gambar cerita
  dipasang diam menghadap anak.
- **Gambarnya dikotakkan persegi** di app (`object-fit: contain`), jadi hewan
  yang sangat memanjang ke samping (ular terentang lurus, buaya menjulur) akan
  tampil kecil di tengah. Karena itu ular diminta **melingkar menumpuk** dan
  buaya diminta **berbadan gemuk pendek**.
- Kirim resolusi penuhnya — jangan repot mengecilkan sendiri.
