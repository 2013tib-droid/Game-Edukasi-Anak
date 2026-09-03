# Prompt Gambar — Item "Mata" (Ejaan Jitu)

Sasaran: **`public/assets/items/eye.webp`** — satu gambar saja.

## Status (2026-09-03) — BELUM DIKERJAKAN

Item `eye` sudah terdaftar di `src/engine/ui/items.ts` dan dipakai sebagai isyarat kata
**MATA** di `src/games/sd1/ejaan-jitu.ts` (slot "Pakaian & tubuh"), tapi filenya belum ada —
sekarang tampil emoji 👁️ bawaan HP sebagai cadangan.

**Percobaan pertama sempat memakai foto mata manusia sungguhan** (dipotong jadi kartu
bersudut membulat), lalu **dibatalkan pemilik**: "bikin animasi aja" — foto close-up mata
asli, sekalipun dibingkai rapi, tetap terbaca seperti bola mata lepas yang menyeramkan untuk
game anak usia 6–8 tahun. Kodenya sudah dibalikkan; jangan diulang jalur foto.

**Yang dibutuhkan: ilustrasi kartun (gaya "animasi"), BUKAN foto** — persis gaya yang sudah
dipakai seluruh item lain di registry ini (topi, bola, buku, dst.): kawaii, outline hitam
tebal, warna flat. Mata yang digambar kartun dengan bulu mata & kilau di dalamnya jadi
terbaca sebagai bagian dari karakter yang ramah, bukan organ lepas.

---

## Cara Pakai

1. Buka chat baru di Gemini.
2. Tempel **BLOK GAYA** di bawah, lalu prompt utamanya.
3. Kalau hasilnya melenceng dari gaya (ada outline tipis, latar tidak putih polos, dsb.),
   balas: *"Ulangi dengan aturan gaya di awal: outline hitam tebal, warna flat, latar putih
   polos, satu objek saja."*
4. Unduh hasilnya sebagai `eye.png`, lalu potong & pasang:
   ```
   python scripts/cut-item.py eye.png public/assets/items/eye.webp
   ```
   (`cut-item.py`, BUKAN `cut-soft.py` — gambar ini beroutline tebal ala stiker, bukan
   render 3D lembut tanpa outline seperti maskot naga.)
5. **Lihat hasilnya di atas latar berwarna** sebelum dianggap selesai — flood-fill kadang
   memakan bagian putih di dalam objek (mis. kilau di mata) kalau tidak terkurung rapat.
6. Tidak ada kode yang perlu diubah — `eye` sudah terdaftar dan `ejaan-jitu.ts` sudah
   menunjuknya. Begitu file ada di path itu, gambarnya langsung terpakai; emoji 👁️ tetap
   jadi cadangan otomatis kalau suatu saat filenya gagal dimuat.

---

## BLOK GAYA (tempel sekali di awal chat Gemini)

> Kamu akan membantuku membuat satu ilustrasi untuk game edukasi anak usia 6–8 tahun. Gambar
> ini HARUS mengikuti gaya yang sama dengan ilustrasi item lain di game ini:
>
> - Gaya kartun kawaii yang imut dan ramah anak, sticker style.
> - **Outline hitam tebal** mengelilingi seluruh objek.
> - Warna **flat dan cerah**, shading lembut seminimal mungkin, tanpa gradasi rumit, tanpa
>   tekstur realistis, tanpa foto.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pantulan, tanpa bingkai, tanpa
>   pola.
> - **Hanya SATU objek per gambar**, di tengah, seluruh objek masuk penuh dengan sedikit
>   ruang kosong di tepi.
> - **Tanpa teks, tanpa huruf, tanpa angka, tanpa watermark** di dalam gambar.
> - Format **persegi (1:1)**, resolusi tinggi.

## Prompt utama

> Gambarkan **satu mata kartun yang lucu dan ramah**, bukan foto atau render realistis.
> Bentuknya mata besar berbentuk oval/almond dengan **bulu mata melengkung yang jelas** di
> sisi atas, **iris berwarna cerah** (coklat hangat atau biru cerah, pilih salah satu) dengan
> **satu titik kilau putih besar** di dalamnya supaya terlihat berbinar dan ceria — kesan
> "mata karakter kartun yang ramah", bukan bola mata organ yang menyeramkan.
>
> Aturan wajib:
>
> - **JANGAN menggambar wajah, alis, kulit, atau bagian tubuh lain** — hanya bentuk matanya
>   sendiri sebagai satu objek utuh, seperti ikon/stiker "mata", bukan potongan wajah orang.
> - **JANGAN dibuat menyipit, melotot, berdarah, atau ekspresi menyeramkan** apa pun.
>   Kesannya harus lucu dan bersahabat, seperti mata maskot kartun anak-anak.
> - Outline hitam tebal mengelilingi seluruh bentuk mata, termasuk garis bulu matanya.
> - Warna flat cerah, satu warna iris saja, tanpa gradasi realistis ala foto mata sungguhan.
> - Latar putih polos rata, tanpa bayangan, tanpa elemen lain di sekitarnya.
> - Format persegi 1:1, objek di tengah, resolusi tinggi.

### Versi Inggris (biasanya lebih patuh)

> Cute kawaii cartoon eye icon for a children's educational game (ages 6–8), NOT a
> photograph or realistic render. Big friendly almond-shaped eye with clearly curved
> eyelashes on top, bright flat-colored iris (warm brown or bright blue), one large white
> sparkle highlight inside to make it look cheerful and expressive — like a friendly cartoon
> mascot's eye, not a creepy detached eyeball. Do NOT draw a face, eyebrow, skin, or any
> other body part — only the eye shape itself as one standalone sticker-style icon. No
> squinting, no bloodshot, no scary expression of any kind. Thick black outline around the
> entire shape including the eyelash lines, flat bright colors, no realistic gradients,
> plain white background, no shadow, no text, centered, square 1:1, high resolution.

---

## Kalau hasilnya masih terasa "serem"

Mata kartun kadang tetap terasa aneh kalau digambar terlalu simetris/statis atau irisnya
terlalu besar sampai memenuhi seluruh bentuk (jadi terlihat melotot). Kalau itu terjadi,
balas di chat yang sama:

> Ulangi, tapi buat irisnya sedikit lebih kecil dengan lebih banyak bagian putih mata yang
> terlihat, dan lengkungkan sedikit bentuk matanya seperti sedang tersenyum — supaya
> kesannya ceria, bukan melotot.

Kalau setelah beberapa percobaan tetap tidak nyaman dilihat, opsi cadangan: minta Gemini
menggambarnya sebagai **bagian dari wajah kartun mini** (satu mata + sedikit pipi merona di
sekitarnya, tetap dalam bingkai persegi objek tunggal) — tapi coba dulu versi "mata saja" di
atas karena itu yang paling konsisten dengan gaya item lain (topi, bola, dll. juga cuma
menggambar satu benda tanpa konteks tambahan).
