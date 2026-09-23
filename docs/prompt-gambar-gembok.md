# Prompt Gambar — Layar Game Terkunci (ganti emoji 🔒)

Sasaran: **`public/assets/ui/terkunci.webp`** — satu gambar saja.

## Status (2026-09-23) — PROMPT SAJA, gambarnya belum ada

Layarnya `src/portal/GamePage.tsx` (cabang `perlu-masuk` / `perlu-aktivasi`): yang muncul
kalau anak mengetuk game berbayar sesudah mode `'kunci'` menyala — jadi sejak launching ini
**salah satu layar yang paling sering dilihat calon pembeli**. Sekarang isinya emoji 🔒
polos setinggi 110px.

**Kodenya SENGAJA belum dipasang** (beda dari layar "tersendat" & "Selamat!"): selama
filenya belum ada, `<img>` yang menunjuk ke situ akan menembakkan **404 di tiap layar
gembok**. Snippet siap-tempelnya ada di bagian "Setelah gambarnya jadi" — pasang bersamaan
dengan filenya, satu commit.

## Kenapa 🔒 sebaiknya diganti

- **Gemboknya digambar berbeda di tiap HP.** Di iPhone (tangkapan layar pemilik) ia jadi
  gembok logam kuning-zaitun berkilau, realistis dan berat. Seluruh app ini sudah pindah ke
  gambar sendiri justru karena alasan itu — hewan, ikon game, maskot, feedback, layar
  tersendat, layar Selamat.
- **Nadanya bertolak belakang dengan kalimatnya.** Di bawahnya tertulis "Minta bantuan
  Ayah/Bunda untuk membukanya ya!" — ajakan yang ramah. Gembok logam besar terbaca sebagai
  penolakan, bukan undangan.
- Ini **satu-satunya layar besar di app yang masih pakai emoji polos**, dan kebetulan ia
  duduk persis di jalur jualan: anak yang tertarik → layar ini → orang tua → aktivasi.

**Gembok kecil di kartu portal (`GroupPage.tsx`, 22px di sudut kartu) TETAP emoji 🔒** —
ilustrasi sedetail apa pun jadi noda di ukuran itu, dan di sana gemboknya memang cuma
penanda, bukan subjek. Jangan sekalian diganti.

---

## PILIHAN 1 (disarankan) — gembok pastel berwajah ramah, gaya stiker

Paling kecil risikonya: maknanya tetap terbaca seketika ("terkunci", bukan "rusak" atau
"habis"), tidak bergantung pada konsistensi karakter, dan gayanya sama dengan 19 ikon kartu
game yang sudah ada.

Gaya wajib mengikuti **`prompt-ikon-game.md`** (stiker kawaii, pastel, outline coklat lembut
— **bukan** hitam pekat, **bukan** render 3D). Tempel **BLOK GAYA** dari dokumen itu sekali
di awal chat, lalu baris di bawah ini + **EKOR PROMPT**-nya.

### Baris prompt

> Buatkan: satu gembok besar berwajah imut, badan gemboknya warna kuning krem lembut dengan
> gagang melengkung warna biru muda di atasnya. Di tengah badan gembok ada lubang kunci
> berbentuk bulat kecil warna coklat lembut. Wajahnya digambar di bagian bawah badan gembok,
> DI BAWAH lubang kuncinya — wajah dan lubang kunci tidak boleh saling menimpa. Ekspresinya
> ramah dan sabar: mata besar berkilau, pipi merona, senyum kecil tertutup. Di sampingnya ada
> satu kunci emas kecil yang melayang, ujungnya mengarah ke lubang kunci. Tambahkan dua
> bintang kecil pastel di sekitarnya. Gembok dan kuncinya polos, tanpa angka dan tanpa
> tulisan apa pun.

Lalu **EKOR PROMPT** dari `prompt-ikon-game.md` (latar putih polos, persegi, tanpa bingkai,
tanpa bayangan lantai, tanpa tulisan…) — **wajib ikut di pesan yang sama**, jangan
mengandalkan blok gaya awal saja (pelajaran 2026-09-02).

### Versi Inggris (biasanya lebih patuh)

> Cute kawaii sticker illustration of a friendly padlock character, soft pastel colors, cream
> yellow lock body with a light blue shackle, a small round brown keyhole in the middle of the
> body, a small cute face drawn BELOW the keyhole (face and keyhole must not overlap), big
> sparkling eyes, blushing cheeks, small closed smile, patient and welcoming — not sad, not
> angry, not stern. A small floating golden key beside it, pointing toward the keyhole. Two
> small pastel stars around it. Soft brown outline, not black. Flat sticker style, plain white
> background, no floor shadow, no frame, no scenery, no glitter, no text, letters, numbers or
> watermark of any kind, square 1:1 composition, high resolution.

---

## PILIHAN 2 (cadangan) — naga memegang kunci emas

Lebih hangat, dan naga = wajah app ini (sudah dilihat anak di beranda portal & tiap layar
selesai). Risikonya dua: karakternya harus persis sama dengan maskot yang ada, dan gemboknya
tak boleh sampai kalah menonjol — kalau lubang kunci/gembok hilang, layar ini berhenti
mengabarkan "terkunci".

Gaya wajib mengikuti **`prompt-maskot-naga.md`** (render 3D lembut, pastel, TANPA outline
hitam) — **bukan** gaya stiker Pilihan 1. Kalau tertukar, naganya terlihat datang dari
produk lain.

**Lampirkan `public/assets/mascot/mascot-6.webp`** (Naga Jenius) di chat baru. Langkah paling
menentukan — model jauh lebih patuh melihat karakternya daripada membaca deskripsinya.

> Aku sedang membuat satu gambar untuk game edukasi anak usia 4–8 tahun. Gambar yang
> kulampirkan adalah maskot yang sudah ada — naga bayi bernama Naga Jenius. Aku butuh
> **naga yang SAMA PERSIS ini** dalam satu pose baru.
>
> **Posenya:** naga itu duduk di samping **satu gembok pastel besar** (kuning krem, gagang
> biru muda, lubang kunci bulat kecil di tengahnya) yang tingginya kira-kira sama dengan
> naganya. Satu tangannya memegang **kunci emas kecil** dan diangkat sedikit, seperti sedang
> menawarkan kuncinya kepada yang melihat. Ekspresinya **ceria dan mengundang — tidak sedih,
> tidak menjaga, tidak melarang**.
>
> Aturan wajib:
>
> - **Karakter yang sama, bukan naga baru.** Bentuk kepala, mata besar berbinar, moncong
>   pendek, perut krem, badan hijau mint, dan proporsi gemuk-imutnya harus persis sama.
> - Gaya **render 3D lembut ala mainan empuk**, warna pastel, shading halus, **tanpa outline
>   hitam tebal**, bukan stiker datar.
> - **Gemboknya harus jelas terlihat utuh** berikut lubang kuncinya, tidak tertutup badan
>   naga. Gemboknya polos, tanpa angka dan tanpa tulisan.
> - Naga dan gembok **muat seluruhnya di dalam gambar**, di tengah, **sayap merapat ke
>   badan**.
> - **Latar putih polos rata.** Tanpa bayangan di lantai, tanpa pemandangan, tanpa ruangan,
>   tanpa bingkai, tanpa lingkaran atau aura kotak di belakangnya, tanpa blur, tanpa bokeh.
> - **Tanpa rantai, tanpa jeruji, tanpa tanda silang, tanpa tanda dilarang, tanpa tanda
>   seru.**
> - **JANGAN menuliskan kata, huruf, angka, label, atau watermark apa pun di dalam gambar.**
> - Komposisi **kira-kira setinggi lebarnya** (mendekati persegi), resolusi tinggi.

---

## Aturan teknis khusus layar ini

- **Maknanya harus tetap terbaca dalam sekejap: TERKUNCI, bisa dibuka.** Yang membawanya
  cuma dua benda — **lubang kunci** dan **kunci**. Apa pun versinya, keduanya (atau minimal
  lubang kuncinya) wajib besar dan tak tertutupi. Gambar lucu yang kehilangan lubang kunci =
  anak tak tahu kenapa gamenya tak terbuka.
- **Jangan bahasa "dilarang/hukuman".** Rantai, jeruji, tanda silang merah, tanda dilarang,
  gembok berwajah marah atau cemberut, tangan menolak — semuanya memberi tahu anak bahwa ia
  melakukan kesalahan. Layar ini justru dirancang untuk bilang "tinggal minta dibukakan".
- **Jangan yang sedih atau menangis.** Sama dengan aturan di layar "tersendat": anaknya sudah
  kecewa duluan, gambar sedih menambah, bukan menenangkan.
- **Nol tulisan di dalam gambar.** Judul game + "Game ini bagian dari versi lengkap…" ditulis
  HTML tepat di bawahnya. Tulisan di gambar = kalimatnya dobel, dan tidak ikut terbaca
  pembaca layar. (Kebalikan dari overlay feedback singa/kucing, yang kalimatnya memang
  tergambar di dalam gambar.)
- **Jangan uang, dompet, kartu, harga, atau keranjang belanja.** Ini area ANAK; standar UX
  melarang pembelian tampil di situ, dan gambar berbau bayar mengubah layar ajakan jadi
  layar jualan.
- **Ukurannya ±128px** (dibatasi 62% lebar layar di HP kecil) — setara kotak emoji 110px yang
  digantikannya. Detail halus hilang di ukuran itu; yang menentukan **siluet**. Uji dengan
  mengecilkan hasilnya ke 128px dan lihat: masih terbaca gembok?
- **Jangan lebih tinggi dari 128px.** Layar ini sudah padat (ikon + judul + 3 baris kalimat +
  2 tombol) dan di HP 320×568 nyaris tak bersisa. Rasio mendekati persegi; gambar yang lebih
  lebar dari tinggi aman (`max-width` + `contain` yang menjaganya), gambar menjulang tidak.

## Setelah gambarnya jadi

1. Simpan mentahnya, lalu potong latar + ekspor sesuai BAHANNYA — **skripnya beda-beda,
   jangan asal `cut-item.py`**:

   | Bahannya | Skrip |
   |---|---|
   | Stiker beroutline di latar putih (Pilihan 1) | `python scripts/cut-item.py <art> public/assets/ui/terkunci.webp 320` |
   | Render 3D lembut tanpa outline di latar putih (Pilihan 2) | `python scripts/cut-soft.py <art> public/assets/ui/terkunci.webp 320` |
   | Latarnya sudah transparan | `python scripts/trim-alpha.py …` |
   | Datang sebagai mockup layar penuh | `python scripts/cut-gradient.py …` |

2. **LUBANG KUNCINYA TERKURUNG GARIS LUAR, jadi flood-fill tak menjangkaunya** — ia akan
   tetap putih opak dan di atas latar krem-merah muda layar ini terbaca sebagai gumpalan,
   bukan lubang. Persis kasus lubang ring kunci pas (Batch 7) dan lubang gantungan tali
   terompet. Tembus **per lokasi**, bukan per ukuran: kilau mata & sorot badan gembok juga
   bidang terkurung, dan ukurannya bisa tumpang tindih dengan lubang kuncinya.
3. **Tempel hasilnya di atas warna gelap DAN di atas gradien layar ini pada 128px yang
   sungguhan sebelum percaya.** Angka "latar terbuang sekian persen" tidak membuktikan apa
   pun — cacat lubang kunci cuma kelihatan di atas warna, dan yang hilang di 128px cuma
   kelihatan di 128px.
4. Pasang kodenya (belum ada, sengaja — lihat "Status"):

   **`src/portal/GamePage.tsx`** — ganti `<div className="game-big-emoji">🔒</div>` di
   cabang `perlu-masuk` / `perlu-aktivasi` dengan `<LockPic />`, lalu tambahkan komponennya
   (pola yang sama persis dengan `PartyPic` di `GameShell.tsx` — emoji tetap jadi cadangan
   otomatis lewat `onError`, jadi tak pernah ada layar tanpa ikon):

   ```tsx
   function LockPic() {
     const [failed, setFailed] = useState(false);
     if (failed) {
       return (
         <div className="game-big-emoji" aria-hidden>
           🔒
         </div>
       );
     }
     return (
       <img
         className="game-big-lock"
         src={`${import.meta.env.BASE_URL}assets/ui/terkunci.webp`}
         alt=""
         aria-hidden
         draggable={false}
         onError={() => setFailed(true)}
       />
     );
   }
   ```

   **`src/engine/ui/engine.css`** — di dekat `.game-big-pic--party`:

   ```css
   /* Layar game terkunci (`public/assets/ui/terkunci.webp`). 128px, setara
      kotak emoji 🔒 di font-size 110px — layar ini padat, jadi gambarnya tak
      boleh menambah satu piksel pun. `max-width` + `contain` menjaga seni yang
      lebih lebar daripada tingginya (kontrak yang sama dengan `GameIcon`). */
   .game-center .game-big-lock {
     height: 128px;
     max-width: 62vw;
     object-fit: contain;
     filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.14));
   }
   ```

5. Ujinya: build produksi (bukan dev server) dalam mode `'kunci'`, buka game berbayar mana
   pun tanpa login — mis. `/game/rute-kendaraan` — lalu ukur **nol scroll tegak di 320×568**
   dan pastikan gambarnya benar-benar termuat (`naturalWidth > 0`, **bukan** sekadar ada
   `<img>`: berkas 404 tetap merender elemennya).
6. Deploy seperti biasa; pastikan `dist/assets/ui/` ikut tersalin ke folder `app/` di branch
   Pages, dan bandingkan dulu isi keduanya (aturan 2026-09-08 — berkas yang ada di branch
   Pages tapi tidak di `dist/` = ada pekerjaan yang tak pernah sampai ke `main`).
