# Prompt Gambar: Bangunan (rumah vs sekolah "sekilas mirip")

Laporan pemilik 2026-09-07 dari tangkapan layar **Kartu Kembar**, papan
`house · school · shop · hospital`: *"Sekilas mirip."*

Dokumen ini melanjutkan `prompt-gambar-gemini.md` (gaya asal seni item) — yang
di sini cuma bangunan, plus satu aturan baru yang lahir dari keluhan ini:
**satu bangunan = satu warna atap, dan warnanya tidak boleh dipakai bangunan lain.**

---

## Kenapa mirip (terukur, bukan perasaan)

`house.webp` dan `school.webp` berbagi **lima** ciri sekaligus:

| | atap | dinding | pintu | jendela | rasio |
|---|---|---|---|---|---|
| `house` (rumah) | genting **MERAH**, segitiga | krem | coklat, di tengah | biru, sepasang | 1,27 |
| `school` (sekolah) | genting **MERAH**, segitiga | krem | coklat, di tengah | biru | 1,37 |

Yang membedakan cuma dua benda **kecil**: jam bundar di kepala sekolah dan
tiang bendera tipis di sisinya. Di kartu Kartu Kembar gambarnya cuma
**±100 px** (kartu ±110 px, `.memory-face__img` 88%), jadi dua ciri kecil itu
hilang dan yang tersisa di mata anak: **kotak krem beratap merah** — dua kali.

Ini bukan cuma soal Kartu Kembar. Keduanya juga tampil **berdampingan** di
Pasang Kata slot `l10` (varian 1: rumah·sekolah·toko, varian 4: rumah·taman·
toko·sekolah) — dan di sana anak harus MEMBACA kata lalu menaruhnya di gambar
yang benar. Dua gambar yang nyaris sama membuat soal membaca itu jadi tebak-tebakan.

`shop` (tenda bergaris merah-putih) dan `hospital` (dinding putih + palang merah
besar) **sudah cukup beda** — jangan ikut diganti.

---

## Aturan pembeda (berlaku untuk bangunan baru mana pun)

Warna atap adalah satu-satunya ciri yang selamat di ukuran 100 px. Jadi ia
dibagi habis, satu warna satu bangunan:

| id | atap | dinding | siluet | ciri kunci |
|---|---|---|---|---|
| `house` | **merah** genting, segitiga curam | krem | **tinggi & sempit**, satu lantai | cerobong asap kecil |
| `school` | **hijau tua**, landai/rendah | **kuning gading** | **lebar & rendah**, dua lantai | tiang bendera merah-putih + deret jendela |
| `hospital` | biru | putih | sedang | palang merah besar |
| `shop` | tenda bergaris merah-putih | kayu/oranye | lebar rendah | etalase terbuka |
| `barn` | merah, kayu | kayu | terbuka, berpagar | rumah HEWAN — jangan ditukar dengan `house` |

Selain warna: **siluetnya juga harus berlawanan.** Rumah menjulang dan sempit,
sekolah melebar dan rendah. Kalau dua bangunan sama-sama "kotak beratap
segitiga", mengganti warna saja belum cukup.

---

## Yang perlu digambar

1. **`school` — WAJIB.** Ini yang menyelesaikan keluhannya.
2. **`house` — opsional.** Gambar rumah sekarang sudah terbaca sebagai rumah;
   ganti hanya kalau ingin sepasang yang gayanya seragam dengan sekolah baru.
   **Kalau diganti, atapnya WAJIB tetap MERAH** — `house` dipakai di banyak game
   (Taman Huruf, Ejaan Jitu, Pasang Kata, tujuan Jalan/Rute Kendaraan), dan anak
   sudah mengenalnya.

Nama file & id **tidak berubah** (`school.webp`, `house.webp`), jadi nol
perubahan kode, nol kalimat narasi, nol render suara Azure.

---

## BLOK GAYA (tempel SEKALI di awal chat Gemini)

> Kamu akan membantuku membuat ilustrasi untuk game edukasi anak usia 4–8 tahun.
> Semua gambar HARUS mengikuti aturan gaya yang sama persis:
>
> - Gaya kartun kawaii yang imut dan ramah anak, sticker style.
> - **Outline hitam tebal** mengelilingi seluruh objek.
> - Warna **flat dan cerah**, shading lembut seminimal mungkin, tanpa gradasi
>   rumit, tanpa tekstur realistis, tanpa efek 3D mengilap.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa pantulan, tanpa
>   bingkai, tanpa pola.
> - **Hanya SATU objek per gambar**, di tengah, seluruh objek masuk penuh
>   dengan sedikit ruang kosong di tepi.
> - **Tanpa teks, tanpa huruf, tanpa angka, tanpa watermark** di dalam gambar.
> - Format **persegi (1:1)**, resolusi tinggi.
> - Bentuknya harus **jelas dikenali dari siluetnya saja**.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan objeknya satu per satu.

## EKOR PROMPT (tempel di SETIAP pesan, jangan andalkan blok gaya saja)

> Gaya: kartun kawaii, outline hitam tebal, warna flat cerah, latar putih polos,
> tanpa bayangan, tanpa bingkai, **tanpa tulisan/huruf/angka apa pun**, satu
> objek di tengah, persegi 1:1, resolusi tinggi.

Blok gaya di awal chat **tidak bertahan** — pelajaran dari `prompt-ikon-game.md`.
Aturan teknis (latar, rasio, tulisan) mulai dilupakan sejak gambar pertama.

---

## PROMPT 1 — `school` (sekolah) — WAJIB

> Buatkan gedung **sekolah dasar Indonesia** tampak depan.
> Bangunannya **melebar dan rendah, dua lantai**, dindingnya **kuning gading**,
> atapnya **HIJAU TUA** dan landai (bukan segitiga curam, bukan merah).
> Tiap lantai punya **deretan jendela persegi biru muda yang banyak dan sejajar**
> (empat atau lima jendela sebaris). Pintunya **pintu ganda lebar** di tengah,
> dengan beberapa anak tangga kecil di depannya.
> Di halaman depan ada **tiang bendera dengan bendera merah-putih** yang jelas.
> **Tidak ada papan nama, tidak ada tulisan, tidak ada jam.**
> Gaya: kartun kawaii, outline hitam tebal, warna flat cerah, latar putih polos,
> tanpa bayangan, tanpa bingkai, tanpa tulisan/huruf/angka apa pun, satu objek di
> tengah, persegi 1:1, resolusi tinggi.

Versi Inggris (kalau hasil dari prompt Indonesianya melenceng):

> Cute kawaii cartoon Indonesian elementary school building, front view, wide and
> low two-storey building, **ivory yellow walls**, **dark green low-pitched roof**
> (not red, not a steep triangle), a long row of four or five square light-blue
> windows on each floor, wide double door in the middle with small steps, a
> flagpole with a red-and-white flag in the front yard, **no signboard, no clock,
> no text of any kind**, one single object centered, thick black outline, flat
> bright colors with minimal soft shading, plain white background, no shadow,
> square 1:1, sticker style, high resolution.

**Kenapa hijau, bukan biru:** biru sudah milik atap rumah sakit. Merah sudah
milik rumah & kandang. Hijau satu-satunya yang belum terpakai di keluarga ini.

**Kenapa jamnya dibuang:** jam bundar di ukuran 100 px cuma jadi bulatan kotor,
dan Gemini hampir selalu menuliskan angka berantakan di situ (pelajaran ketiga
di `prompt-ikon-game.md`: wajah/angka jangan berbagi permukaan). Yang membuat
anak Indonesia mengenali "sekolah" itu **tiang bendera + deret jendela**, bukan
jamnya.

## PROMPT 2 — `house` (rumah) — opsional

> Buatkan **rumah tinggal** sederhana tampak depan.
> Bangunannya **kecil, agak menjulang dan sempit, satu lantai**, dindingnya krem,
> atapnya **genting MERAH berbentuk segitiga curam**, dengan **cerobong asap
> kecil** di atasnya. Ada **satu pintu coklat** di tengah dan **dua jendela**
> kecil di kiri-kanannya. Sedikit rumput hijau di kakinya.
> **Tanpa tiang bendera, tanpa papan nama, tanpa tulisan.**
> Gaya: kartun kawaii, outline hitam tebal, warna flat cerah, latar putih polos,
> tanpa bayangan, tanpa bingkai, tanpa tulisan/huruf/angka apa pun, satu objek di
> tengah, persegi 1:1, resolusi tinggi.

Cerobong asap itu ciri "rumah tinggal" yang bertahan di ukuran kecil — dan
sekolah tidak punya. Kalau `house` tidak digambar ulang, biarkan apa adanya:
begitu sekolahnya jadi hijau & melebar, keduanya sudah tidak bisa tertukar.

---

## Batas yang gampang kelewat: JANGAN terlalu memanjang

Gambar item selalu dimasukkan ke **kotak PERSEGI** (`.choice-img`,
`.memory-face__img`, `.dd-img` — semuanya `object-fit: contain`), jadi gambar
yang lebar dirender **lebih pendek**, bukan lebih besar. Terukur: `park` rasio
2,00 dan `field` 2,33 — keduanya tampil separuh tinggi kartunya, dan memang
terlihat paling kecil di layar.

**Rasio aman untuk bangunan: maksimal ±1,4 : 1** (hari ini rumah 1,27 · sekolah
1,37 · rumah sakit 1,39). Jadi "lebar & rendah" untuk sekolah itu **relatif
terhadap rumah**, bukan seperti panorama. Kalau hasilnya terlalu pipih, balas:
*"Buat bangunannya sedikit lebih tinggi supaya gambarnya mendekati persegi."*

## Jebakan tulisan (paling sering kena justru di gedung sekolah)

Gedung sekolah di dunia nyata selalu bertuliskan sesuatu, jadi Gemini akan
menambahkannya sendiri: papan nama "SCHOOL", "SD", huruf di atas pintu, angka
di jam. Game ini berbahasa Indonesia dan anaknya belum lancar membaca — tulisan
asing di gambar soal itu gangguan, bukan hiasan.

Kalau hasilnya bertulisan, **jangan diedit sendiri** — balas ke Gemini:

> Ulangi, hilangkan SEMUA tulisan, huruf, dan angka dari gambar. Papan di atas
> pintu harus polos tanpa tulisan.

---

## Sesudah gambarnya jadi

Kirim file PNG-nya ke sesi Claude (nama bebas), nanti aku yang:

1. Potong latar & ekspor:
   `python3 scripts/cut-item.py school.png public/assets/items/school.webp 256`
   (256 px mengikuti bangunan lain di batch ini — di layar cuma ±100 px.)
2. **Tempel hasilnya di atas latar berwarna dan lihat.** Latar putih yang
   TERKURUNG artwork — kaca jendela putih, celah di bawah atap, sela tiang
   bendera — tidak terjangkau flood-fill dan akan tampak sebagai bercak putih
   di atas kartu biru. Ditembus manual per gambar, jangan diotomatiskan.
3. Uji berdampingan di ukuran sesungguhnya (papan `house · school · shop ·
   hospital` di Kartu Kembar, 380×800 & 360×640).

Tidak ada yang perlu diubah di `items.ts`, config game, maupun narasi — id-nya
sama. Satu-satunya efek samping: nama file yang sama berarti **cache**. Di
`firebase.json` folder `items` sengaja `max-age=86400`, jadi HP yang sudah
pernah membuka game bisa masih melihat gambar lama sampai sehari (atau sampai
hard-refresh) — itu normal, bukan deploy yang gagal.

## Checklist terima / tolak

- [ ] Atap sekolah **hijau tua**, bukan merah dan bukan biru.
- [ ] Dinding kuning gading, jelas beda dari krem rumah.
- [ ] Bangunan **melebar & dua lantai**, tapi rasio masih ≤ ±1,4 : 1.
- [ ] Ada tiang bendera merah-putih yang terbaca.
- [ ] **Nol tulisan, nol huruf, nol angka** di seluruh gambar.
- [ ] Latar putih polos, tanpa bayangan lantai, tanpa bingkai.
- [ ] Dilihat sekilas dari jarak sejengkal: masih jelas bukan rumah.
