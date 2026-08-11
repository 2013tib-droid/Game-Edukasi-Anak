# Prompt Gambar — 6 Tahap Maskot Naga (mascot-7 … mascot-12)

Dokumen **siap tempel** untuk membuat enam gambar maskot lanjutan.

Tangga maskot diperpanjang dari 6 jadi **12 tahap** (2026-08-09, lihat catatan
di `CLAUDE.md`). **Tahap 7–9 sudah punya seninya** (2026-08-11, ter-deploy);
tiga tahap sisanya (🌈🌟👑) masih tampil pakai emoji cadangan. Begitu kamu
kirim gambarnya, aku tinggal memasang file + satu kata di kodenya.

**Pelajaran dari batch 7–9 — pakai ini saat meminta tahap 10–12:**

- Percobaan yang langsung diterima selalu punya tiga hal: **latar putih polos
  tanpa bayangan lantai**, **tanpa partikel yang melayang jauh dari badan**
  (setelah autocrop, partikel terluar yang menentukan batas gambar, jadi
  naganya jadi mengecil), dan **sayap merapat ke badan**.
- **Warna elemen barunya harus PEKAT dengan garis tepi jelas.** Kristal pucat
  tembus pandang dan kilat setipis rambut sama-sama hilang di avatar 72px, dan
  yang nyaris seputih latar berisiko ikut termakan saat latarnya dipotong.
  Patokannya: sepekat api oranye di `mascot-7`.
- Elemen yang jauh lebih kecil dari sayap (tanduk bercahaya, percikan) **tidak
  perlu dikejar** — tak terlihat di 72px, dan menuntutnya cuma menambah putaran
  revisi.

> **Ini BUKAN gaya yang sama dengan `prompt-gambar-gemini.md`.** Aset benda &
> hewan di sana bergaya stiker: outline hitam tebal, warna flat. Maskot
> bergaya **lembut, empuk, seperti 3D render pastel** — tanpa outline hitam.
> Jangan tertukar, nanti naganya terlihat dari produk yang berbeda.

---

## Yang Perlu Dibuat

| File yang dikirim | Tahap | Bintang | Emoji sementara |
|---|---|---|---|
| ~~`mascot-7.png`~~ | Naga Api | 145 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| ~~`mascot-8.png`~~ | Naga Kristal | 200 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| ~~`mascot-9.png`~~ | Naga Petir | 265 ⭐ | ✅ **SUDAH ADA** (2026-08-11) |
| `mascot-10.png` | Naga Pelangi | 340 ⭐ | 🌈 |
| `mascot-11.png` | Naga Bintang | 440 ⭐ | 🌟 |
| `mascot-12.png` | Naga Legenda | 555 ⭐ | 👑 |

**Beri nama file persis seperti kolom pertama.** Kalau sebagian dulu juga tidak
apa-apa — tahap yang belum ada gambarnya tetap jalan dengan emoji, dan tidak
ada error apa pun di app.

---

## Cara Pakai (baca ini dulu, 1 menit)

1. Buka chat **baru** di Gemini.
2. **Lampirkan `public/assets/mascot/mascot-6.webp`** (Naga Jenius yang sudah
   ada) sebagai gambar rujukan. Ini langkah paling menentukan — model jauh
   lebih patuh melihat karakternya daripada membaca deskripsi warnanya.
3. Tempel **BLOK GAYA** di bawah satu kali.
4. Kirim **satu baris prompt per pesan**, berurutan dari tahap 7 ke 12. Satu
   gambar per pesan — jangan minta enam sekaligus, hasilnya jadi kolase yang
   tidak bisa dipakai.
5. Sebelum tiap gambar berikutnya, cukup tulis: *"Naga yang sama lagi, ini
   tahap berikutnya."*
6. Unduh, beri nama sesuai tabel di atas, kirim ke sini. Aku yang potong latar
   jadi transparan, resize, ekspor WebP, dan daftarkan di kodenya.

---

## BLOK GAYA (tempel sekali di awal chat)

> Aku sedang membuat maskot untuk game edukasi anak usia 4–8 tahun. Gambar yang
> kulampirkan adalah karakter naga bayi yang sudah ada — namanya Naga Jenius,
> tahap terakhir dari maskot yang tumbuh bertahap.
>
> Aku butuh **enam gambar lanjutan dari naga yang SAMA PERSIS ini**, makin
> megah di tiap tahap. Aturannya:
>
> - **Karakter yang sama, bukan naga baru.** Bentuk kepala, mata besar
>   berbinar, moncong pendek, perut krem, dan proporsi tubuh yang gemuk-imut
>   harus tetap sama di keenam gambar. Yang berubah hanya elemen baru yang
>   kusebut per tahap.
> - Gaya: **render 3D lembut ala mainan empuk**, warna pastel, shading halus
>   dan mengkilap, **tanpa outline hitam tebal**, tanpa gaya stiker datar.
> - Ekspresi **selalu ramah dan ceria** — ini teman belajar anak kecil.
>   Naganya tidak boleh terlihat garang, menyeramkan, bertaring tajam, atau
>   marah, sekalipun tahapnya "petir" atau "legenda".
> - **Seluruh badan masuk**, berdiri menghadap depan atau tiga-perempat, di
>   tengah gambar.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pemandangan, tanpa
>   bingkai, tanpa lingkaran di belakangnya.
> - **Tanpa teks, tanpa angka, tanpa watermark.**
> - Komposisi **kira-kira setinggi lebarnya** (mendekati persegi). Jangan
>   membuat sayap terbentang sangat lebar ke samping.
> - Resolusi tinggi.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan tahapnya satu per satu.

---

## Enam Baris Prompt

| File | Baris prompt untuk dikirim |
|---|---|
| `mascot-7` | Naga yang sama, kini **Naga Api**: sayapnya menyala jadi api oranye-kuning lembut, ada nyala api kecil di ujung ekornya, dan sedikit cahaya hangat di sekitar tubuhnya. Warna badan tetap hijau mint seperti aslinya. Tetap ceria dan ramah. |
| `mascot-8` | Naga yang sama, kini **Naga Kristal**: duri di punggungnya berubah jadi kristal biru muda yang bening berkilau, sayapnya seperti kaca kristal tembus pandang, ada serpihan kristal kecil melayang di sekitarnya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-9` | Naga yang sama, kini **Naga Petir**: ada motif kilat kuning cerah di sayapnya, percikan listrik kecil melayang di sekelilingnya, dan tanduknya bercahaya kuning. Warna badan tetap hijau mint. Tetap ceria dan ramah, **jangan terlihat marah atau garang**. |
| `mascot-10` | Naga yang sama, kini **Naga Pelangi**: sayapnya bergradasi warna pelangi pastel, ada surai kecil warna pelangi di sepanjang punggungnya, dan pelangi lembut kecil melengkung di belakang bahunya. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-11` | Naga yang sama, kini **Naga Bintang**: tubuhnya bertabur kerlip bintang kecil keemasan, ada satu bintang bercahaya di dahinya, dan sayapnya seperti langit malam berbintang warna ungu-biru pastel. Warna badan tetap hijau mint. Tetap ceria dan ramah. |
| `mascot-12` | Naga yang sama, kini **Naga Legenda**, tahap tertinggi: memakai mahkota emas kecil, sayapnya lebih besar dan megah dengan ujung keemasan, ada aura cahaya emas lembut mengelilinginya, dan kalung permata kecil di lehernya. Warna badan tetap hijau mint. Tetap ceria dan ramah, terlihat bangga tapi lucu. |

### Kalau lebih suka prompt bahasa Inggris

Model gambar biasanya lebih patuh dalam bahasa Inggris. Tempel utuh, satu per
pesan, tetap dengan `mascot-6.webp` terlampir:

> Same cute pastel mint baby dragon as the reference image, cream belly, big
> sparkling friendly eyes, chubby toy-like proportions, soft 3D render style,
> soft glossy shading, no black outline, standing front view, full body
> visible, centered, plain white background, no shadow, no text, near-square
> composition, high resolution. **This stage:** _[isi salah satu]_
>
> - `mascot-7` — glowing orange-yellow flame wings, small flame at tail tip, warm soft glow around the body.
> - `mascot-8` — light-blue translucent crystal wings, crystal spikes along the back, small floating crystal shards.
> - `mascot-9` — bright yellow lightning patterns on the wings, small electric sparks around it, softly glowing horns. Still smiling and friendly, not fierce.
> - `mascot-10` — pastel rainbow gradient wings, small rainbow mane along the back, soft little rainbow arc behind its shoulders.
> - `mascot-11` — tiny golden star sparkles across its body, one glowing star on its forehead, wings like a pastel purple-blue starry night sky.
> - `mascot-12` — small golden crown, larger majestic wings with golden tips, soft golden aura, small jewel necklace. Proud but still cute.

---

## Aturan Teknis yang Menentukan Hasil Dipakai atau Tidak

- **Naganya tampil kecil.** Di kartu maskot avatarnya cuma **72px** bulat. Jadi
  yang menentukan bagus-tidaknya adalah **siluet dan warna besar**, bukan
  detail halus. Motif kilat setipis rambut atau tulisan di mahkota akan hilang
  total — minta elemennya besar dan tegas.
- **Jangan sayap terbentang lebar.** Gambar dipasang `object-fit: contain` di
  dalam lingkaran, jadi gambar yang sangat lebar bikin badan naganya tampil
  kecil di tengah. Burung hantu (tahap 4) adalah yang terlebar yang masih
  aman — jangan melebihi itu.
- **Latar harus polos putih**, tanpa lingkaran/aura berbentuk kotak di
  belakang. Aura cahaya menempel di badan naganya tidak apa-apa; latar
  bercahaya penuh susah dipotong (pelajaran dari batch aset sebelumnya:
  glow latar sering lebih terang dari garis luar objeknya sendiri).
- **Enam gambar harus terasa satu keluarga.** Kalau tahap 9 tiba-tiba jadi naga
  dewasa berotot sementara tahap 8 masih bayi gemuk, anak akan merasa maskotnya
  berganti makhluk — dan itu justru merusak inti sistem maskot ini: satu teman
  yang tumbuh bersama dia.
- Ukuran akhir aset ±250–512px; **jangan repot mengecilkan sendiri**, kirim saja
  resolusi penuhnya.

---

## Setelah Kamu Kirim

Yang aku kerjakan (kamu tidak perlu melakukan apa pun):

1. Potong latar jadi transparan (`scripts/cut-item.py`).
2. Autocrop + resize + ekspor WebP transparan ke
   `public/assets/mascot/mascot-7.webp` … `mascot-12.webp`.
3. Tambahkan `pic: 'mascot-7'` dst. di `MASCOTS` (`src/engine/core/mascot.ts`)
   — satu kata per baris, tidak ada kode lain yang berubah.
4. Uji headless di 380×800, 360×640 & 820×1180, lalu deploy.

---

## Kalau Nanti Tangganya Diperpanjang Lagi

Tahap ke-12 (555 ⭐) duduk 6 ⭐ di bawah langit-langit app sekarang
(**561 ⭐** — 18 game, 187 slot level × 3). Tangga baru hanya masuk akal kalau
game bertambah; hitung ulang langit-langitnya dulu, jangan menambah tahap yang
tak mungkin dicapai anak mana pun.
