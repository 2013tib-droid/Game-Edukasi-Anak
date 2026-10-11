# Prompt gambar: Anak Ayam Petualang (hero landing)

Untuk bagian paling atas landing (`/`), diambil dari mockup ChatGPT pemilik
(2026-10-11). Latar tamannya sudah digambar engine (`src/portal/HeroGarden.tsx`);
yang belum ada cuma tokohnya.

## Kenapa dasarnya `mascot-3`

Anak ayam di mockup itu SAMA dengan maskot tahap 3 "Si Anak Ayam"
(`public/assets/mascot/mascot-3.webp`) — render 3D lembut, kuning, pipi merah
muda. Pakai tokoh yang SAMA, cuma didandani jadi petualang, supaya anak yang
melihat landing lalu membuka portal bertemu teman yang sama. Jangan buat anak
ayam baru dengan wajah lain.

**Cara memakainya:** unggah `mascot-3.webp` ke ChatGPT/Gemini sebagai gambar
acuan, lalu tempel prompt di bawah.

## Prompt (Bahasa Indonesia)

> Gambar ulang anak ayam pada gambar acuan ini dengan gaya, warna, dan wajah
> yang SAMA persis (render 3D lembut, bulu kuning halus, mata besar berkilau,
> pipi merah muda). Sekarang ia berdandan sebagai **penjelajah cilik**: memakai
> **topi safari krem/khaki** dengan pita cokelat, dan **ransel kecil cokelat**
> di punggung (talinya terlihat di depan bahu). Pose: berdiri, satu sayap
> melambai ke atas, mata **mengedip satu** dan tersenyum lebar, badan sedikit
> menyerong ke kanan. Seluruh badan terlihat dari kepala sampai kaki.
> Latar **putih polos**, tanpa bayangan di lantai, tanpa awan, tanpa pelangi,
> tanpa benda melayang, tanpa tulisan apa pun. Satu tokoh saja, berada di
> tengah, dengan sedikit ruang kosong di sekelilingnya.

## Prompt (English, kalau hasil Bahasa Indonesia meleset)

> Redraw the chick in the reference image with the exact same style, colours
> and face (soft 3D render, fluffy yellow feathers, big sparkly eyes, pink
> cheeks). Dress it as a **little explorer**: a **cream/khaki safari hat** with
> a brown band and a **small brown backpack** (straps visible over the
> shoulders). Pose: standing, one wing waving up, **winking one eye** with a
> big smile, body turned slightly to the right, full body head to feet.
> **Plain white background**, no floor shadow, no clouds, no rainbow, no
> floating objects, no text. One character only, centred, with some empty
> space around it.

## Yang WAJIB dihindari

- **Tulisan** apa pun (balon kata "Ayo berpetualang bersama!" di mockup ditulis
  HTML kalau mau dipakai, bukan digambar — tulisan AI sering salah eja).
- **Benda melayang** (kubus ABC, angka, pensil, bintang): sekelilingnya sudah
  ada ikon game yang melayang di landing; benda tambahan di gambar akan
  bertabrakan dan membuat gambarnya kecil setelah dipotong.
- **Pelangi/awan di belakang tokoh**: logo kita sudah anak ayam + pelangi.
- **Bayangan lantai**: tertinggal sebagai noda abu-abu sesudah latarnya dibuang.
- Warna **ungu** (pemilik tidak suka ungu).

## Setelah gambarnya datang

1. Kirim gambarnya ke sesi Claude.
2. Dipotong dengan **`scripts/cut-soft.py`** (render 3D lembut di latar putih —
   BUKAN `cut-item.py`, yang melahap bagian krem/putih dari tokoh tanpa garis
   luar), lalu disimpan ke `public/assets/ui/petualang.webp` (±512 px).
3. Dipasang di hero: tokohnya menggantikan lingkaran logo di tengah, logo
   pindah jadi lencana kecil — tata letaknya dicoba dulu di 320/360/1024 px.
