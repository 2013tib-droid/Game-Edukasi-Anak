# Prompt Ilustrasi — Baca Cerita (3 cerita aktif)

Dokumen **siap tempel** untuk membuat ilustrasi tiap halaman di game **Baca Cerita**
(`src/games/sd1/cerita-kancil.ts`), supaya tampilan ceritanya jadi seperti buku
cerita bergambar — bukan emoji besar di tengah layar.

Yang dibahas di sini **hanya 3 cerita yang aktif** per 2026-09-03:

| Level | Judul | Halaman | Sudah ada | Perlu dibuat |
|---|---|---|---|---|
| `l1` | **Kancil dan Pak Tani** | 5 | 0 | **5** |
| `l2` | **Jalak dan Kerbau** | 7 | 3 | **4** |
| `l3` | **Kancil dan Gajah** | 7 | 2 | **5** |
| | | **19** | **5** | **14** |

Enam cerita rakyat (`n1`–`n6`) masih `soon: true` — jangan digambar dulu.

Kirim sebagian dulu juga tidak apa-apa: halaman yang belum ada ilustrasinya tetap
jalan dengan emoji/item seperti sekarang, tanpa error apa pun di app.

---

## Beda dengan dua dokumen prompt yang lain (JANGAN tertukar)

| Dokumen | Gayanya | Latar | Isi |
|---|---|---|---|
| `prompt-gambar-gemini.md` · `prompt-hewan-cerita.md` | **stiker**: outline hitam tebal, warna flat | **putih polos**, dipotong transparan | SATU benda/hewan |
| **dokumen ini** | **lukisan buku cerita**: shading lembut, cat digital | **latarnya ikut digambar**, tidak dipotong | satu ADEGAN, boleh 2+ tokoh |

Dua gaya ini **tidak boleh dicampur dalam satu halaman**. Yang dipakai di sini
adalah gaya lukisan — mengikuti `jalak-kerbau.webp`, `kancil-rawa.webp` dan
`gajah-lumpur.webp` yang sudah dikirim pemilik.

---

## Cara Pakai (baca dulu, 2 menit)

1. Buka chat **baru** di Gemini **untuk tiap cerita** (jangan satu chat untuk tiga
   cerita — tokohnya akan tercampur).
2. **Lampirkan gambar rujukan** yang disebut di bagian cerita itu. Ini langkah
   paling menentukan: model jauh lebih patuh melihat contohnya daripada membaca
   deskripsi gayanya.
   - Cerita 1 belum punya rujukan sama sekali → **buat halaman 1 dulu**, setujui
     hasilnya, lalu **lampirkan gambar itu** untuk halaman 2–5.
3. Tempel **BLOK GAYA** (di bawah) satu kali.
4. Tempel **LEMBAR TOKOH** cerita itu satu kali.
5. Kirim **satu baris prompt per pesan**, satu gambar per pesan. Jangan minta lima
   sekaligus — hasilnya jadi kolase yang tidak bisa dipakai.
6. Unduh, **beri nama persis seperti kolom `id`** di tabelnya (mis.
   `kancil-tani-kebun.png`), kirim ke sini. Saya yang memperkecil, ekspor WebP,
   memasang di config, dan menguji di tiga ukuran layar.

Kalau hasilnya melenceng, balas:
*"Ulangi dengan aturan di awal chat: satu adegan utuh berlatar, gaya lukisan buku
cerita anak, tanpa teks, tanpa bingkai, tokohnya sama persis dengan gambar rujukan."*

---

## BLOK GAYA (tempel sekali di awal tiap chat)

> Kamu akan membantuku membuat ilustrasi halaman buku cerita anak Indonesia usia
> 6–8 tahun. Gambar yang kulampirkan adalah ilustrasi yang sudah jadi — **ikuti
> gaya dan karakternya persis**. Semua gambar HARUS mengikuti aturan berikut:
>
> **Gaya**
> - Ilustrasi buku cerita anak, **cat digital lembut** — bukan stiker, bukan vektor
>   flat, bukan 3D render, bukan foto.
> - Garis luar tipis dan lembut, **shading halus**, warna hangat dan cerah,
>   pencahayaan siang tropis Indonesia.
> - Hewan digambar **kartun ramah**: mata besar berbinar, senyum kecil, proporsi
>   imut — tapi tetap terlihat seperti hewannya, bukan manusia berbaju.
>
> **Isi gambar**
> - **Satu adegan utuh berikut latarnya** (langit, tanah, pepohonan) — bukan objek
>   melayang di latar putih.
> - Latarnya alam Indonesia: hutan tropis, sawah, kebun, sungai berlumpur, pohon
>   kelapa, bakau, ilalang.
> - Tokoh utama **di tengah dan besar**, mengisi kira-kira sepertiga sampai
>   setengah lebar gambar. Jangan menaruh tokoh menempel di tepi.
>
> **Larangan mutlak**
> - **Tanpa teks, huruf, angka, balon kata, atau watermark** apa pun di dalam gambar.
> - **Tanpa bingkai, garis tepi, sudut membulat, atau vignette** — gambar mengisi
>   penuh sampai ke tepi (app yang membulatkan sudutnya sendiri).
> - **Tanpa tokoh yang menakutkan.** Buaya dan ular adalah tokoh cerita, bukan
>   monster: **mulut tertutup atau senyum kecil, tanpa taring runcing, tanpa mata
>   merah, tanpa darah, tanpa lidah menjulur mengancam.**
> - Tanpa panel komik, tanpa kolase, tanpa beberapa adegan dalam satu gambar.
> - Tanpa manusia tambahan yang tidak disebut di promptnya.
>
> **Format**
> - **Mendatar (landscape)**. Aku akan menyebut rasionya tiap gambar: **4:3** atau
>   **16:9**. Resolusi setinggi mungkin, jangan dikecilkan.
>
> Balas "siap" saja, lalu tunggu aku mengirim lembar tokoh dan adegannya satu per satu.

---

## Kenapa dua rasio (jangan diseragamkan)

Halaman cerita punya dua bentuk, dan tingginya dibatasi berbeda oleh app
(`.story-art` di `src/engine/ui/engine.css`):

| Jenis halaman | Batas tinggi | Rasio yang diminta | Alasan |
|---|---|---|---|
| Halaman biasa (gambar + teks + tombol Lanjut) | `46vh` | **4:3** | layar lapang, gambar boleh tinggi & besar |
| Halaman **keputusan** (gambar + pertanyaan + 2–3 kartu pilihan) | `28vh` | **16:9** | tingginya dijatah kartu pilihan |

Kalau halaman keputusan dikirim 4:3, app membatasinya lewat TINGGI — lebarnya ikut
menyusut jadi ±224px di HP 360, gambarnya tampak kecil di tengah. Yang 16:9 tetap
selebar ±318px. Jadi rasionya bukan selera, tapi hitungan layar.

---

# CERITA 1 — Kancil dan Pak Tani (`l1`)

**Rujukan yang dilampirkan:** belum ada. Buat halaman 1 dulu (`kancil-tani-lapar`),
setujui hasilnya, lalu **lampirkan gambar itu di tiap pesan berikutnya**.

## LEMBAR TOKOH (tempel sekali sesudah blok gaya)

> Cerita ini punya tiga tokoh tetap. **Bentuknya harus sama persis di kelima
> gambar** — anak mengenali tokohnya dari gambar, bukan dari tulisan.
>
> - **KANCIL** — pelanduk/mouse-deer khas Indonesia: rusa mungil bertubuh kecil
>   ramping seukuran kambing muda, bulu coklat muda kekuningan dengan perut putih,
>   **TANPA TANDUK SAMA SEKALI**, kaki langsing, telinga tegak membulat (bukan
>   panjang seperti kelinci), mata besar berbinar, ekspresi cerdik dan ceria.
>   **Tanpa baju, tanpa tas, tanpa syal, tanpa aksesori apa pun.**
> - **PAK TANI** — petani Indonesia yang ramah tersenyum, memakai **caping** (topi
>   bambu kerucut), baju lengan panjang sederhana warna coklat, celana digulung,
>   berdiri tegak. Selalu berwajah senang, tidak pernah marah.
> - **BUAYA** — buaya sungai hijau yang **gemuk pendek dan lucu**, sisik punggung
>   bergerigi tumpul, **mulut selalu tertutup tersenyum**, mata besar bulat,
>   **tanpa taring runcing, sama sekali tidak menyeramkan**.

## Adegan (5 gambar)

| # | id (nama file) | Rasio | Halaman di cerita |
|---|---|---|---|
| 1 | `kancil-tani-lapar` | 4:3 | "Si Kancil berjalan di hutan. Perutnya lapar sekali." |
| 2 | `kancil-tani-kebun` | **16:9** | keputusan — "Kancil melihat kebun mentimun Pak Tani." |
| 3 | `kancil-tani-izin` | 4:3 | "Pak Tani senang Kancil jujur…" |
| 4 | `kancil-tani-buaya` | **16:9** | keputusan — "ada buaya menghalangi jalan pulang." |
| 5 | `kancil-tani-menyeberang` | 4:3 | "Buaya berbaris, Kancil melompat satu-satu…" |

### Baris prompt (kirim satu per pesan)

**1. `kancil-tani-lapar` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3: **seekor kancil berjalan sendirian
> di jalan setapak tengah hutan tropis Indonesia**. Hutannya rimbun dan cerah —
> pohon besar berakar, pakis, daun-daun lebar, seberkas cahaya matahari pagi
> menembus dedaunan. Kancil di tengah gambar, badannya menghadap tiga-perempat ke
> arah kita sambil melangkah, **perutnya terlihat kempes dan wajahnya sedikit lesu
> tapi tetap manis** — dia sedang lapar. Tidak ada hewan atau orang lain di gambar.

**2. `kancil-tani-kebun` — rasio 16:9**
> Buatkan ilustrasi buku cerita anak, rasio 16:9 (mendatar lebar): **kancil yang
> sama berdiri di tepi kebun mentimun sambil memandanginya**. Di sebelah kanan
> terbentang kebun mentimun yang subur — para-para bambu, sulur daun mentimun
> lebar, **mentimun hijau bergaris matang menggantung dan tergeletak di bedengan**.
> Kancil berdiri di sisi kiri di luar pagar bambu rendah, badan menyamping, kepala
> menoleh ke kebun, **matanya berbinar tertarik**. Suasana siang cerah. Tidak ada
> orang di gambar ini.

**3. `kancil-tani-izin` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3: **Pak Tani berjongkok ramah sambil
> memberikan sebuah mentimun kepada kancil**. Latarnya kebun mentimun yang sama
> dengan gambar sebelumnya. Pak Tani di kanan memakai caping, **tersenyum lebar dan
> menyodorkan mentimun dengan dua tangan**; kancil di kiri menengadah menerimanya,
> **wajahnya senang**. Keduanya berukuran sepadan — kancil setinggi lutut orang
> dewasa. Suasananya hangat dan bersahabat.

**4. `kancil-tani-buaya` — rasio 16:9**
> Buatkan ilustrasi buku cerita anak, rasio 16:9 (mendatar lebar): **kancil berdiri
> di tepi sungai, dan di air ada beberapa buaya gemuk yang lucu**. Kancil di tepi
> kiri, membawa sebuah mentimun di mulutnya, **berhenti melangkah sambil berpikir**.
> Di air, **tiga buaya hijau bermoncong lebar mengambang berjajar**, hanya punggung
> dan kepalanya di atas air, **semuanya bermulut TERTUTUP dan tersenyum kecil,
> tanpa gigi terlihat, sama sekali tidak menyeramkan** — mereka terlihat seperti
> hewan yang penasaran, bukan mengancam. Sungainya tenang, tepian hijau berumput,
> pohon-pohon di kejauhan.

**5. `kancil-tani-menyeberang` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3: **kancil melompat riang di atas
> barisan punggung buaya untuk menyeberangi sungai**. **Empat sampai lima buaya
> hijau berbaris rapi berjajar dari tepi kiri ke tepi kanan** seperti jembatan
> hidup, punggungnya di atas permukaan air, semuanya bermulut tertutup dan
> tersenyum ramah. Kancil sedang melompat di punggung buaya ketiga, **kaki
> terangkat, wajah gembira**, membawa mentimun. Percikan air kecil di sekitarnya.
> Suasana siang cerah dan lucu, sama sekali tidak menegangkan.

---

# CERITA 2 — Jalak dan Kerbau (`l2`)

**Rujukan yang WAJIB dilampirkan di tiap pesan:**
`public/assets/story/jalak-kerbau.webp`, `jalak-kerbau-jawab.webp`,
`jalak-kerbau-kutu.webp` (ketiganya kiriman pemilik, sudah dipakai di app).

Empat gambar baru di bawah harus terlihat **satu buku** dengan ketiganya.

## LEMBAR TOKOH (tempel sekali sesudah blok gaya)

> Dua tokoh cerita ini sudah ada di gambar yang kulampirkan. **Gambar barunya harus
> memakai kerbau dan burung yang sama persis** — warna, bentuk tanduk, dan wajahnya
> jangan diubah:
>
> - **KERBAU** — kerbau air Indonesia bertubuh gemuk, kulit **abu-abu kehitaman**,
>   sepasang **tanduk besar melengkung ke belakang seperti bulan sabit** dengan
>   guratan melintang, telinga lebar menjuntai ke samping berwarna merah muda di
>   dalamnya, moncong lebar, **mata besar ramah dan tersenyum kecil**, ekor berumbai.
>   Bukan sapi — jangan ada bercak putih-hitam.
> - **BURUNG JALAK** — burung kecil berbulu **hitam legam**, **paruh dan kaki kuning
>   oranye terang**, **garis putih kecil di sayapnya**, mata bulat kuning berbinar,
>   ekspresi ceria. Ukurannya sepantasnya burung jalak — kira-kira sebesar moncong
>   kerbau.
>
> Latarnya selalu **sawah/padang rumput Indonesia**: rumput hijau, petak sawah dan
> genangan air di kejauhan, pepohonan rimbun di tepi, gunung samar di kaki langit,
> langit biru berawan putih — sama seperti gambar rujukan.

## Adegan (4 gambar baru)

| # | id (nama file) | Rasio | Halaman di cerita | Status |
|---|---|---|---|---|
| 1 | `jalak-kerbau-kubang` | 4:3 | "Kerbau berkubang di sawah. Punggungnya gatal…" | **baru** |
| 2 | `jalak-kerbau` | — | "…burung jalak hinggap di pagar." | sudah ada |
| 3 | `jalak-kerbau-jawab` | — | keputusan — "Apa yang sebaiknya kerbau jawab?" | sudah ada |
| 4 | `jalak-kerbau-kutu` | — | "Jalak mematuki kutu di punggung kerbau…" | sudah ada |
| 5 | `jalak-kerbau-ular` | **16:9** | keputusan — "jalak melihat ular besar mendekat." | **baru** |
| 6 | `jalak-kerbau-lari` | 4:3 | "Kerbau cepat-cepat menjauh dari rawa…" | **baru** |
| 7 | `jalak-kerbau-sahabat` | 4:3 | "Sejak itu jalak dan kerbau selalu bersama…" | **baru** |

### Baris prompt (kirim satu per pesan, gambar rujukan tetap dilampirkan)

**1. `jalak-kerbau-kubang` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, memakai **kerbau yang sama persis
> dengan gambar yang kulampirkan**: **kerbau sedang berkubang di kubangan lumpur di
> tepi sawah**. Badannya separuh terendam air berlumpur, hanya punggung, kepala dan
> tanduknya yang terlihat. **Wajahnya menunjukkan gatal dan tidak nyaman — mata
> setengah menyipit, kepala sedikit miring seperti ingin menggaruk**, tapi tetap
> lucu dan tidak sedih. Titik-titik kutu kecil di punggungnya boleh terlihat samar.
> Latar sawah hijau, air keruh, langit biru cerah. **Belum ada burung sama sekali di
> gambar ini.**

**2. `jalak-kerbau-ular` — rasio 16:9**
> Buatkan ilustrasi buku cerita anak, rasio 16:9 (mendatar lebar), memakai **kerbau
> dan burung jalak yang sama persis dengan gambar yang kulampirkan**: **jalak
> berdiri tegak di punggung kerbau sambil melihat ke kejauhan, dan dari rerumputan
> di sisi kanan muncul seekor ular hijau besar yang mendekat**. Kerbau berdiri
> tenang di sisi kiri, **belum menyadari apa-apa**. Jalak di punggungnya
> **mengangkat kepala waspada, sayap sedikit terangkat**. Ularnya **hijau muda
> berpola belang hijau tua, kepalanya membulat lucu, MULUT TERTUTUP, tanpa taring,
> tanpa lidah menjulur, tanpa mata merah** — terlihat seperti hewan biasa yang
> sedang merayap, bukan monster. Latar tepi rawa berumput tinggi, siang cerah.

**3. `jalak-kerbau-lari` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, memakai kerbau dan jalak yang sama:
> **kerbau berlari menjauh dari rawa dengan jalak masih bertengger erat di
> punggungnya**. Kerbau digambar dari samping sedang berlari, **kaki terangkat,
> telinga ke belakang, ekor melambai, wajah kaget tapi lucu** (bukan ketakutan yang
> menyeramkan). Jalak menunduk berpegangan di punggungnya, sayap sedikit mengembang.
> Sedikit percikan lumpur dan debu di bawah kaki. Di kejauhan sebelah belakang,
> **ular hijau kecil terlihat merayap pergi ke arah berlawanan**. Latar padang rumput
> dan sawah, langit cerah.

**4. `jalak-kerbau-sahabat` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, memakai kerbau dan jalak yang sama:
> **potret persahabatan — kerbau berdiri tenang menghadap ke arah kita dengan jalak
> bertengger santai di punggungnya, keduanya tersenyum senang**. Suasana **sore
> keemasan**: matahari rendah, langit oranye kekuningan bergradasi ke biru muda,
> rumput tersorot cahaya hangat. Latar sawah yang sama seperti gambar sebelumnya.
> Komposisinya tenang dan manis — ini halaman penutup cerita. **Tanpa teks, tanpa
> hati, tanpa bintang berkilau berlebihan.**

---

# CERITA 3 — Kancil dan Gajah (`l3`)

**Rujukan yang WAJIB dilampirkan di tiap pesan:**
`public/assets/items/kancil-rawa.webp` dan `public/assets/items/gajah-lumpur.webp`.

⚠️ **Satu koreksi yang perlu diminta ke Gemini:** kancil di `kancil-rawa.webp`
digambar **bertanduk dan memakai syal + tas** — itu rusa, bukan kancil, dan
bertabrakan dengan aturan proyek (kancil tidak bertanduk). Untuk lima gambar baru,
lembar tokoh di bawah sengaja meminta **kancil tanpa tanduk dan tanpa aksesori**.
Kalau pemilik ingin seluruh cerita seragam, cara paling rapi adalah **menggambar
ulang `kancil-rawa` juga** (prompt penggantinya ada di akhir bagian ini).

## LEMBAR TOKOH (tempel sekali sesudah blok gaya)

> Ikuti **gaya, warna dan latar rawa** dari gambar yang kulampirkan, tapi tokohnya
> pakai aturan ini:
>
> - **KANCIL** — pelanduk/mouse-deer Indonesia: tubuh kecil ramping, bulu coklat
>   muda kekuningan, perut putih, **TANPA TANDUK**, **tanpa syal, tanpa tas, tanpa
>   baju apa pun**, telinga tegak membulat, mata besar berbinar, wajah cerdik dan
>   ceria. (Gambar rujukan sempat menggambarnya bertanduk dan berkalung syal —
>   **jangan diikuti**.)
> - **GAJAH** — gajah Asia berkulit abu-abu, telinga sedang, **gading kecil atau
>   tanpa gading**, mata besar ramah, badan gemuk lucu. Di beberapa adegan badannya
>   berlepotan lumpur coklat.
> - **TEMAN-TEMAN HEWAN** — kerbau abu-abu bertanduk sabit, rusa coklat bertanduk
>   kecil, dan beberapa hewan hutan Indonesia lain (monyet, burung). Semuanya
>   ramah dan tersenyum.
>
> Latarnya selalu **rawa hutan tropis yang sama seperti gambar rujukan**: jalan
> setapak tanah, pohon bakau berakar tunjang, air tenang, daun teratai dan bunga
> teratai merah muda, pohon kelapa dan bukit samar di kejauhan.

## Adegan (5 gambar baru)

| # | id (nama file) | Rasio | Halaman di cerita | Status |
|---|---|---|---|---|
| 1 | `kancil-rawa` | — | "Pagi itu Kancil berjalan di tepi rawa." | sudah ada |
| 2 | `gajah-lumpur` | — | "Ada gajah terperosok di lumpur…" | sudah ada |
| 3 | `kancil-gajah-pikir` | **16:9** | keputusan — "Apa yang sebaiknya Kancil lakukan?" | **baru** |
| 4 | `kancil-gajah-teman` | 4:3 | "Kancil memanggil kerbau, rusa, dan teman-teman lain." | **baru** |
| 5 | `kancil-gajah-ranting` | **16:9** | keputusan — "Lumpurnya licin sekali. Pakai apa?" | **baru** |
| 6 | `kancil-gajah-tarik` | 4:3 | "Semua menarik bersama-sama…" | **baru** |
| 7 | `kancil-gajah-selamat` | 4:3 | "Badan kecil pun bisa menolong…" | **baru** |

### Baris prompt (kirim satu per pesan, gambar rujukan tetap dilampirkan)

**1. `kancil-gajah-pikir` — rasio 16:9**
> Buatkan ilustrasi buku cerita anak, rasio 16:9 (mendatar lebar), latar rawa yang
> sama dengan gambar yang kulampirkan: **kancil berdiri di tepi lumpur sambil
> berpikir, memandangi gajah yang terperosok**. Gajah di sisi kanan **terbenam
> sampai separuh badan di lumpur coklat, belalai terangkat sedikit, wajahnya sedih
> tapi lucu — bukan kesakitan**. Kancil di sisi kiri berdiri di tanah kering,
> **satu kaki depan terangkat, kepala sedikit miring, alis berkerut seperti sedang
> mencari akal**. Jarak keduanya terlihat jelas. Pagi cerah, kabut tipis di
> kejauhan.

**2. `kancil-gajah-teman` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, latar rawa yang sama: **kancil
> berdiri di atas batu kecil sambil memanggil, dan dari arah hutan datang
> rombongan hewan yang mau menolong**. Kancil di depan kiri, **kepala mendongak,
> mulut terbuka seperti berseru, kaki depan terangkat memanggil**. Dari kanan dan
> belakang datang **seekor kerbau abu-abu bertanduk sabit, seekor rusa coklat, dan
> dua-tiga hewan hutan lain (monyet, burung)** — semuanya berjalan mendekat dengan
> wajah bersemangat dan ramah. Gajah yang terjebak lumpur terlihat samar di latar
> belakang kanan. Suasananya ramai dan penuh semangat gotong royong.

**3. `kancil-gajah-ranting` — rasio 16:9**
> Buatkan ilustrasi buku cerita anak, rasio 16:9 (mendatar lebar), latar rawa yang
> sama: **kancil dan teman-temannya berdiri di tepi lumpur sambil memandangi
> tumpukan ranting dan daun besar yang sudah mereka kumpulkan**. Di tengah bawah
> gambar ada **setumpuk ranting kayu dan daun pisang/daun lebar hijau**. Kancil di
> dekat tumpukan itu, di sebelahnya kerbau dan rusa. **Permukaan lumpur di sisi
> kanan terlihat basah dan licin mengilap**, dengan gajah masih terbenam di sana.
> Semua hewan berwajah serius tapi ceria — mereka sedang menyiapkan rencana.

**4. `kancil-gajah-tarik` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, latar rawa yang sama: **semua hewan
> menarik gajah bersama-sama keluar dari lumpur**. Ranting dan daun sudah
> **dihamparkan di atas lumpur sebagai alas** supaya tidak licin. Kerbau menarik di
> depan, rusa dan hewan lain ikut di belakangnya, **kancil kecil ikut menarik di
> paling depan dengan sekuat tenaga**. Gajah mulai terangkat, **belalainya
> berpegangan, badannya berlepotan lumpur, wajahnya penuh harap**. Semua hewan
> menegang tapi tetap tersenyum — ini adegan kerja sama, bukan adegan panik.
> Percikan lumpur kecil di sekitar.

**5. `kancil-gajah-selamat` — rasio 4:3**
> Buatkan ilustrasi buku cerita anak, rasio 4:3, latar rawa yang sama: **gajah sudah
> berdiri di tanah kering dan semua hewan bersorak gembira**. Gajah di tengah,
> **berdiri tegak dengan belalai terangkat tinggi kegirangan**, badannya masih
> berbercak lumpur. Kancil kecil berdiri di depannya, **kaki terangkat, wajah
> gembira**; kerbau, rusa dan hewan-hewan lain mengelilingi sambil tersenyum.
> Matahari pagi bersinar hangat menembus pepohonan, air rawa berkilau di belakang.
> Suasananya lega dan bahagia — ini halaman penutup cerita. **Tanpa teks, tanpa
> konfeti, tanpa bintang berkilau berlebihan.**

### (Opsional) Menggambar ulang `kancil-rawa` supaya kancilnya konsisten

> Buatkan ilustrasi buku cerita anak, rasio 16:9, **komposisi dan latar persis
> seperti gambar yang kulampirkan** (jalan setapak tanah di tepi rawa, bakau
> berakar tunjang, teratai, pohon kelapa, matahari pagi di kejauhan): **seekor
> kancil berjalan di jalan setapak itu**. Bedanya dengan gambar rujukan: kancilnya
> **TANPA TANDUK sama sekali**, **tanpa syal dan tanpa tas**, telinga tegak
> membulat, tubuh lebih kecil dan ramping — pelanduk Indonesia, bukan rusa.
> Ekspresinya ceria dan bersemangat.

---

## Aturan Teknis yang Menentukan Hasil Dipakai atau Tidak

- **Latarnya harus ikut digambar penuh sampai tepi.** Ilustrasi ini dipasang
  sebagai panel bergambar; latar engine (`Scene.tsx`) tetap terlihat di
  sekelilingnya, jadi tempat di gambar harus **cocok dengan latar halamannya**
  (hutan/kebun/sungai/sawah). Panel bersuasana kota di atas latar sawah akan
  terlihat salah tempel.
- **Jangan ada bingkai, garis tepi, sudut membulat, atau vignette gelap.** App
  memasang `border-radius: 18px` sendiri; sudut membulat bawaan gambar akan
  terlihat dobel.
- **Jangan ada teks, huruf, angka, atau balon kata** — ini game untuk anak yang
  sedang belajar membaca; tulisan asing di gambar membingungkan.
- **Rasio harus mendatar.** Gambar tegak (portrait) akan dibatasi tinggi dan tampil
  sangat kecil di tengah layar.
- **Tokoh utama jangan menempel di tepi gambar.** Sisakan sedikit ruang; di HP
  kecil panelnya menyusut dan tokoh di tepi jadi terpotong secara visual.
- **Jangan ada hewan yang terlihat mengancam.** Buaya & ular tetap tersenyum,
  mulut tertutup, tanpa taring. Aturan proyek: **tidak ada yang boleh membuat anak
  takut** (CLAUDE.md — tidak ada hukuman, umpan balik selalu positif).
- **Kirim resolusi penuhnya**, jangan dikecilkan sendiri — saya yang memperkecil
  ke 900px dan mengompres.
- **Satu adegan per gambar.** Jangan minta "buatkan 5 halaman cerita sekaligus":
  hasilnya kolase dalam satu file yang tidak bisa dipakai.

---

## Setelah Gambarnya Terkumpul: yang saya kerjakan

Catatan untuk saya sendiri — pemilik tidak perlu melakukan apa pun.

1. **Perkecil & ekspor**, satu perintah per gambar:

   ```
   python scripts/story-art.py <kiriman.png> public/assets/story/<id>.webp 900
   ```

   (Skrip ini **tidak memotong latar** — memang latarnya yang dipakai. Berbeda
   dengan `cut-item.py` yang untuk stiker transparan.)

2. **Pasang di config** `src/games/sd1/cerita-kancil.ts` — halaman biasa memakai
   helper `art()`, halaman keputusan memakai bentuk `ask({ art, emoji }, …)`.
   `emoji`/`item` yang sekarang **tetap ditulis sebagai cadangan** kalau file-nya
   gagal dimuat:

   | Cerita | Halaman | Sekarang | Jadi |
   |---|---|---|---|
   | Kancil dan Pak Tani | hutan lapar | 🦌 | `art('kancil-tani-lapar')` |
   | | kebun mentimun (keputusan) | 🥒 | `ask({ art: 'kancil-tani-kebun', emoji: '🥒' }, …)` |
   | | Pak Tani memberi | 👨‍🌾 | `art('kancil-tani-izin')` |
   | | buaya di sungai (keputusan) | 🐊 | `ask({ art: 'kancil-tani-buaya', emoji: '🐊' }, …)` |
   | | menyeberang | 🎉 | `art('kancil-tani-menyeberang')` |
   | Jalak dan Kerbau | kerbau berkubang | 🐃 | `art('jalak-kerbau-kubang')` |
   | | ular mendekat (keputusan) | 🐍 | `ask({ art: 'jalak-kerbau-ular', emoji: '🐍' }, …)` |
   | | kerbau menjauh | 🏃 | `art('jalak-kerbau-lari')` |
   | | penutup | ⭐ | `art('jalak-kerbau-sahabat')` |
   | Kancil dan Gajah | keputusan menolong | 🤔 | `ask({ art: 'kancil-gajah-pikir', emoji: '🤔' }, …)` |
   | | teman-teman datang | 🐃 | `art('kancil-gajah-teman')` |
   | | ranting & daun (keputusan) | 🌿 | `ask({ art: 'kancil-gajah-ranting', emoji: '🌿' }, …)` |
   | | menarik bersama | 💪 | `art('kancil-gajah-tarik')` |
   | | penutup | ⭐ | `art('kancil-gajah-selamat')` |

3. **Rapikan `kancil-rawa` & `gajah-lumpur`.** Dua ilustrasi adegan itu sekarang
   terdaftar di registry **benda** (`src/engine/ui/items.ts`) dan dipakai lewat
   `pic()` — pengecualian yang memang sudah ditandai di komentar registry. Begitu
   halaman lain punya ilustrasi, keduanya dipindah ke `public/assets/story/` dan
   ikut memakai `art()` supaya satu cerita satu mekanisme. Entri registry-nya
   dihapus setelah itu.

4. **Uji** headless 360×640, 380×800 & 820×1180 + sekali mendatar (740×380): tiap
   cerita dimainkan sampai layar hasil termasuk menekan pilihan yang kurang tepat
   dulu, semua WebP terambil 200, tanpa scroll & nol error console. Lalu
   `node scripts/check-item-ids.mjs`.

5. **NOL file suara baru.** Gambar tidak menyentuh satu pun kalimat narasi, jadi
   `npm run narasi` tetap sama, manifest tidak berubah, dan tidak ada yang perlu
   dirender ulang lewat Azure. **Jangan sekalian "merapikan" kalimat ceritanya saat
   memasang gambar** — kunci file suara = hash isi kalimatnya.
