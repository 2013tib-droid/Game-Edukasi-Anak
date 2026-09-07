# Prompt Gambar — Anak untuk game "Anggota Tubuh"

Sasaran: **`public/assets/kid/anak.webp`** — satu gambar saja.

## Status (2026-09-07) — BELUM ADA, masih gambar SVG sementara

Gambar anak yang sekarang tampil digambar sendiri oleh kode (`src/engine/ui/Kid.tsx`) supaya
gamenya bisa jalan tanpa menunggu aset. Itu penambal, bukan tujuan akhir.

**Ini BUKAN drop-in seperti prompt-prompt lain di folder ini.** Aset lain (ikon game, maskot,
ilustrasi cerita) begitu filenya ada langsung terpakai. Yang ini tidak bisa: gambarnya
merangkap **peta titik sentuh** — tiap anggota tubuh punya koordinat yang harus cocok dengan
gambarnya sampai ke pikselnya. Jadi alurnya: Anda kirim gambarnya → saya pasang di
`Kid.tsx` dan **setel ulang koordinat `BODY_PARTS` sekali**, mengikuti gambar itu. Tak satu
pun config game ikut berubah.

---

## Yang bikin gambar ini beda dari gambar hiasan

Anak menjawab soal dengan **menyentuh bagian tubuh di gambar ini**. Ada tiga belas bagian yang
ditanyakan, dan **semuanya harus benar-benar terlihat dan berjauhan** — bagian yang tertutup
atau berdempetan bikin daerah sentuhnya menciut sampai jari anak tak bisa mengenainya
(ada skrip yang mengukur ini dan menolak yang di bawah 60 px).

Tiga belas bagian itu: **rambut · kepala · mata · telinga · hidung · mulut · pipi · leher ·
pundak · tangan · perut · lutut · kaki**.

Dari situ lahir syarat-syarat di bawah. Yang bertanda ⚠️ paling sering salah.

- ⚠️ **Kedua telinga terlihat jelas, TIDAK tertutup rambut.** Ini yang paling sering gagal —
  rambut anak biasanya digambar menutupi telinga, dan telinga yang tak terlihat tak bisa
  disentuh.
- ⚠️ **Leher terlihat** — kerah bajunya rendah, jangan sampai lehernya tertelan baju.
- ⚠️ **Kaos LENGAN PENDEK dan CELANA PENDEK**, supaya lengan, siku, dan **lutut** terlihat.
- ⚠️ **TANPA ALAS KAKI (telanjang kaki).** Ini penting dan gambar saya yang sekarang justru
  salah di sini: ada soal *"Sepatu dipakai di mana?"* dan *"Sepatu melindungi apa?"* — kalau
  anaknya sudah memakai sepatu, jawabannya sudah tergambar dan anak tinggal mencocokkan
  gambar, bukan berpikir. Aturan yang sama pernah kena di seni profesi: montirnya tidak boleh
  sedang menggenggam kunci pas.
- ⚠️ **TANPA topi, tas, kacamata, jam, atau apa pun yang dipegang.** Alasannya sama persis —
  ada soal "topi dipakai di mana", "tas digendong di mana", "pensil dipegang pakai apa".
- **Kepala besar** (gaya chibi), kira-kira **sepertiga tinggi badan**. Ini bukan selera:
  kepala besar yang membuat mata, hidung, dan mulut cukup berjauhan untuk disentuh jari anak.
- **Kedua lengan sedikit menjauh dari badan** (badan membentuk huruf A), telapak tangan
  terbuka menghadap depan, tidak menempel di pinggang.
- **Kedua kaki sedikit terbuka**, tidak rapat — lutut kiri dan kanan harus jadi dua sasaran
  terpisah.
- **Hidung dan mulut digambar jelas**, bukan titik samar. Mulut tersenyum kecil.
- **Kedua pipi diberi rona merah muda lembut** — "pipi" salah satu bagian yang ditanyakan,
  jadi harus ada tandanya.
- **Rambut pendek dan rapi**, jelas terlihat sebagai rambut di atas kepala.
- **Tegak lurus menghadap depan, simetris, seluruh badan masuk** dari ujung rambut sampai
  ujung kaki, dengan sedikit ruang kosong di sekelilingnya.

---

## Cara pakai di Grok

1. Buka chat baru, minta **gambar potret (tegak), setinggi mungkin** — minimal sekitar
   1200 × 1600. Gambarnya nanti diperbesar saat soal wajah, jadi resolusi rendah langsung
   terlihat pecah.
2. Tempel prompt di bawah **utuh**.
3. Kalau hasilnya salah di satu-dua syarat (paling sering: telinga tertutup rambut, atau
   anaknya dikasih sepatu), minta perbaikan dengan menyebut syarat itu saja — jangan
   mengulang seluruh promptnya, biasanya malah berubah karakternya.

### Prompt (tempel utuh)

> Buatkan satu ilustrasi untuk game edukasi anak usia 4–7 tahun di Indonesia.
>
> **Subjeknya:** seorang anak Indonesia yang ceria, digambar **seluruh badan, menghadap lurus
> ke depan, berdiri tegak dan simetris**, seperti gambar di buku belajar "anggota tubuh".
>
> **Proporsinya sengaja gaya chibi:** kepala besar dan bulat, kira-kira sepertiga tinggi
> badannya, badan pendek dan gemuk. Wajahnya ramah: mata besar berbinar, alis tipis, hidung
> kecil tapi jelas terlihat, mulut tersenyum kecil, dan **rona merah muda lembut di kedua
> pipi**.
>
> **Posenya:** kedua lengan sedikit terentang menjauh dari badan sehingga tubuhnya membentuk
> huruf A, kedua telapak tangan terbuka menghadap depan dan tidak menempel ke badan. Kedua
> kaki sedikit terbuka, tidak rapat.
>
> **Pakaiannya:** kaos oblong lengan pendek berwarna cerah dengan kerah rendah, dan celana
> pendek. **Telanjang kaki, tanpa sepatu dan tanpa kaus kaki.**
>
> **Yang WAJIB terlihat jelas** (gambar ini dipakai untuk mengajarkan nama anggota tubuh):
> rambut, kedua telinga, kedua mata, hidung, mulut, kedua pipi, leher, kedua pundak, kedua
> tangan, perut, kedua lutut, dan kedua telapak kaki.
>
> **Rambutnya pendek dan rapi, dan TIDAK BOLEH menutupi telinga** — kedua telinga harus
> terlihat penuh di sisi kepala. Kerah bajunya rendah supaya lehernya terlihat.
>
> **Jangan menggambar:** topi, kacamata, tas, sepatu, jam tangan, atau benda apa pun yang
> dipegang atau dipakai anak itu. Tangannya kosong.
>
> **Gayanya:** ilustrasi vektor datar yang lembut untuk anak kecil — bentuk membulat, warna
> pastel hangat, tanpa garis tepi hitam yang tebal, tanpa tekstur, tanpa gradien yang ramai.
> Ramah dan sederhana.
>
> **Latarnya putih polos**, tanpa bayangan di lantai, tanpa pola, tanpa tulisan atau tanda
> air. Seluruh badan masuk dalam gambar dari ujung rambut sampai ujung kaki, dengan sedikit
> ruang kosong di sekelilingnya. Gambar tegak (potret), resolusi setinggi mungkin.

### Versi Inggris (kalau hasil Bahasa Indonesia kurang patuh)

> One illustration for a children's educational game (ages 4–7, Indonesia).
>
> A cheerful Indonesian child, **full body, facing straight forward, standing upright and
> symmetrical**, like a "parts of the body" chart in a kids' learning book.
>
> **Chibi proportions on purpose:** big round head, roughly one third of the total height,
> short chubby body. Friendly face: big bright eyes, thin eyebrows, a small but clearly drawn
> nose, a small smile, and **soft pink blush on both cheeks**.
>
> **Pose:** both arms held slightly away from the body so the figure forms an A shape, both
> palms open and facing forward, not touching the body. Feet slightly apart, not together.
>
> **Clothes:** a bright short-sleeved t-shirt with a low neckline, and short trousers.
> **Barefoot — no shoes, no socks.**
>
> **Must be clearly visible** (this picture is used to teach body-part names): hair, both
> ears, both eyes, nose, mouth, both cheeks, neck, both shoulders, both hands, tummy, both
> knees, both feet.
>
> **Short tidy hair that does NOT cover the ears** — both ears fully visible on the sides of
> the head. Low collar so the neck is visible.
>
> **Do not draw:** hat, glasses, bag, shoes, watch, or anything held or worn. Empty hands.
>
> **Style:** soft flat vector illustration for young children — rounded shapes, warm pastel
> colours, no thick black outlines, no texture, no busy gradients. Friendly and simple.
>
> **Plain white background**, no floor shadow, no pattern, no text or watermark. The whole
> body fits in frame from hair to feet with a little empty margin. Portrait orientation,
> highest resolution possible.

---

## Kalau mau DUA anak (laki-laki & perempuan)

Boleh, dan variannya praktis gratis — **tapi keduanya harus digambar dalam pose dan bingkai
yang SAMA PERSIS** (tinggi kepala sama, posisi tangan sama, kaki sama terbuka). Satu set
koordinat titik sentuh dipakai untuk dua gambar; kalau posenya beda sedikit saja, titik
sentuhnya harus disetel dua kali dan gampang menyimpang.

Cara paling aman: hasilkan yang pertama, lalu minta *"anak yang sama, pose dan bingkai persis
sama, tapi anak perempuan berambut sebahu"* — dan rambut sebahu itu pun **tetap tidak boleh
menutupi telinga**.

---

## Sesudah gambarnya jadi

Kirim filenya, lalu saya yang kerjakan:

1. **Potong latarnya** — `python3 scripts/cut-item.py <gambar> public/assets/kid/anak.webp`
   (latar putih polos). Kalau gaya gambarnya ternyata lembut tanpa garis tepi, pakai
   `scripts/cut-soft.py`; kalau latarnya sudah transparan, `scripts/trim-alpha.py`. Salah
   pilih skrip itu berbahaya — `cut-item.py` mencari latar PUTIH, dan pada gambar transparan
   ia malah memakan bagian putih milik gambarnya.
2. **Pasang di `Kid.tsx`** menggantikan gambar SVG-nya, dan **setel ulang `BODY_PARTS`**
   mengikuti gambar barunya.
3. **Ukur ulang** dengan `node scripts/check-body-parts.mjs` (semua varian, HP terkecil) lalu
   main sungguhan headless di lima ukuran layar — daerah sentuh tiap bagian harus tetap di
   atas 60 px, kalau tidak posenya perlu diperbaiki (biasanya: kaki kurang terbuka atau
   kepala kurang besar).
