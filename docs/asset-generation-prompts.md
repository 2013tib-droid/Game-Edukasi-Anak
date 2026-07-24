# Prompt Generasi Aset — Hewan (Game Edukasi Anak)

Dokumen ini melacak **aset gambar hewan** untuk board game (dipakai lewat
`src/engine/ui/items.ts` dan dirender dari `public/assets/items/<id>.<ext>`).
Pemilik proyek mengirim art final (AI-generated) bertahap; dokumen ini mencatat
gaya visual target, prompt per hewan, dan status pengiriman.

## Gaya Visual Target (WAJIB konsisten)

Ditetapkan dari dua aset pertama yang dikirim pemilik (gajah & singa):

- Kartun anak yang **imut/kawaii**, proporsi kepala besar, ekspresi ramah.
- **Outline hitam tebal** mengelilingi seluruh subjek (penting: memudahkan
  potong latar & konsisten di board warna apa pun).
- Warna **flat** dengan shading lembut minimal, pipi merah muda pada hewan lucu.
- **Latar polos** saat generate (putih atau satu warna) — akan dipotong jadi
  transparan.
- Satu hewan per gambar, menghadap depan / tiga-perempat, seluruh tubuh masuk.

### Pipeline pasca-generate (dari JPEG kiriman → aset game)

1. Potong latar jadi transparan (flood-fill dari tepi, dijaga saturasi+brightness
   agar tidak masuk ke badan; berhenti di outline hitam).
2. Autocrop ke bounding box subjek + padding kecil.
3. Resize sisi terpanjang → **512px** (cukup tajam, ringan untuk Android low-end).
4. Ekspor **WebP** (quality 90) transparan.

Skrip referensi: `scripts/` (lihat `process.py` pada handoff) — parameter
saturasi/brightness disetel per gambar karena warna latar berbeda.

**Kasus khusus — PNG sudah ber-alpha / latar gelap.** Bila kiriman berupa PNG
yang sudah punya kanal alpha (mis. panda: siluet sudah terpotong), JANGAN
key-out warna — pakai al-nya langsung. Kadang bagian putih subjek (wajah/perut
panda) ikut transparan karena dirancang untuk halaman putih; isi lubang
tertutup itu dengan putih (flood dari tepi menandai latar asli, sisanya =
lubang → putih). Ini yang dipakai untuk panda karena latarnya hitam dan tubuh
panda juga hitam (tak mungkin dipisah dari warna).

**Kasus khusus — latar checkerboard (JPEG).** Bila kiriman JPEG dengan latar
kotak-kotak transparansi (ter-flatten), latar itu abu-abu **saturasi rendah**
di semua tingkat kecerahan. Buang dengan flood dari tepi memakai gerbang
saturasi saja (`sat < ~20`), lalu ambil **blob terbesar** untuk membuang
coretan garis-gerak / teks ("MEOW!") / daun jatuh, dan isi lubang di dalam
subjek. Dipakai untuk bebek, kura-kura, kelinci, beruang, kucing.

## Registrasi

Setiap aset baru harus didaftarkan di `src/engine/ui/items.ts`:

```ts
elephant: { emoji: '🐘', label: 'gajah', ext: 'webp' },
```

- `id` (kunci) = nama Inggris, dipakai di config game: `{ item: 'elephant', count: 3 }`.
- `label` = Bahasa Indonesia (alt text / narasi).
- `emoji` = fallback bila gambar gagal dimuat.
- `ext: 'webp'` = wajib untuk aset kiriman (default registry adalah `svg`).

## Roster Hewan & Status

| id | Hewan (ID) | Emoji | Status | File |
|---|---|---|---|---|
| giraffe | jerapah | 🦒 | ✅ diterima (dipakai Hutan Hewan l1) | `public/assets/items/giraffe.webp` |
| elephant | gajah | 🐘 | ✅ diterima (dipakai Hutan Hewan l2) | `public/assets/items/elephant.webp` |
| lion | singa | 🦁 | ✅ diterima (dipakai Hutan Hewan l3) | `public/assets/items/lion.webp` |
| panda | panda | 🐼 | ✅ diterima (dipakai Hutan Hewan l5) | `public/assets/items/panda.webp` |
| rabbit | kelinci | 🐰 | ✅ diterima (dipakai Hutan Hewan l4) | `public/assets/items/rabbit.webp` |
| duck | bebek | 🦆 | ✅ diterima (dipakai Hutan Hewan l7) | `public/assets/items/duck.webp` |
| cat | kucing | 🐱 | ✅ diterima | `public/assets/items/cat.webp` |
| bear | beruang | 🐻 | ✅ diterima (belum dipakai di level) | `public/assets/items/bear.webp` |
| turtle | kura-kura | 🐢 | ✅ diterima (belum dipakai di level) | `public/assets/items/turtle.webp` |
| dog | anjing | 🐶 | ⏳ placeholder SVG | `dog.svg` |
| penguin | pinguin | 🐧 | ⏳ placeholder SVG | `penguin.svg` |
| chick | anak ayam | 🐥 | ⏳ placeholder SVG (Hutan Hewan l6) | `chick.svg` |

> "⏳ placeholder SVG" = flat art sementara dari Fase 3; akan diganti art kartun
> premium bergaya sama begitu pemilik mengirim ("sisa hewannya menyusul").
> Sisa: **anjing, pinguin, anak ayam**.

## Prompt per Hewan

Template prompt (isi `<HEWAN>`):

> Cute kawaii cartoon `<HEWAN>` for a children's educational game, full body,
> facing forward / three-quarter view, big friendly eyes, rosy cheeks, thick
> black outline, flat colors with soft minimal shading, plain white background,
> centered, high resolution, sticker style.

| id | Catatan prompt spesifik |
|---|---|
| giraffe | tubuh oranye-tan dengan bercak coklat, perut krem, tanduk (ossicone) kecil, melambai dua tangan. **✅ sesuai referensi.** |
| elephant | badan abu-abu kebiruan, telinga besar merah muda di dalam, melambai. **✅ sesuai referensi.** |
| lion | surai coklat, tubuh emas, ekspresi ceria/mengaum ramah. **✅ sesuai referensi.** |
| panda | hitam-putih, mata besar, pipi pink, memeluk bambu hijau. Latar hitam + tubuh hitam → pakai alpha PNG + isi lubang putih (lihat "Kasus khusus"). **✅ sesuai referensi.** |
| rabbit | putih/krem, telinga panjang, memeluk wortel, bandana biru. **✅ sesuai referensi.** |
| duck | bebek kuning, paruh oranye, bandana biru. **✅ sesuai referensi.** |
| cat | oranye-putih, mata biru, bandana biru. **✅ sesuai referensi.** |
| bear | beruang coklat, perut krem, bandana biru, melambai. **✅ sesuai referensi.** |
| turtle | kura-kura, tempurung hijau, wajah krem, bandana biru. **✅ sesuai referensi.** |
| dog | anak anjing, telinga jatuh, lidah kecil |
| penguin | pinguin, perut putih |
| chick | anak ayam kuning, paruh oranye |

Saat menambah hewan baru di luar daftar ini, ikuti gaya target di atas dan
daftarkan idnya di `items.ts` sebelum dipakai di config game.
