# Prompt Gemini — gambar adegan Mata Jeli (SD Kelas 3 & 4)

> Dibuat 2026-11-01 (pemilik: Mata Jeli versi engine terasa "kayak buat anak TK").
> Keputusan: Gemini membuat **SATU gambar** yang ramai. Gambar kedua dibuat
> **mesin** dari gambar itu (tempel/pindah/kecilkan benda, ganti warna satu
> bagian), jadi jumlah perbedaannya PASTI. **Jangan minta Gemini membuat dua
> gambar berdampingan** — percobaan pertama (adegan kemah) ternyata berbeda di
> ±20 tempat, bukan 10, dan seluruh garisnya bergeser.

## Aturan gambar (kenapa promptnya begitu)

- **Mendatar 3:2** — di game, dua gambar ditumpuk atas-bawah di HP, tiap kotak 3:2.
- **Tanpa tulisan apa pun** (judul, papan nama, huruf di baju).
- **Suasana Indonesia, tanpa benda empat musim**: tanpa salju, gunung bersalju,
  pinus, tupai, jamur merah bertotol putih, labu, perapian.
- **Benda-benda tersebar merata dan BERJARAK**, tidak menumpuk. Mesin akan
  mengubah benda tertentu; benda yang saling menutupi tak bisa diubah rapi, dan
  tiap perbedaan butuh tempat sentuh ±60 px di HP 320 px.
- **Benda sedang-besar**, bukan detail mungil (kaus kaki, kancing) — yang mungil
  tak bisa disentuh jari anak.
- **Warna blok rata + garis luar tebal** — supaya satu bagian (kaus, tenda) bisa
  diganti warnanya tanpa sisa gradasi.
- **Langit & rumput cukup lega di beberapa tempat** — ruang kosong untuk
  menempelkan benda tambahan.
- Tanpa hewan berbentuk emoji; tokoh hewan boleh, gaya kartun seragam.

## Blok gaya (tempel di AKHIR setiap prompt tema)

```
Children's book illustration, flat cartoon style, bold dark outlines, solid flat
colors with almost no gradients or shading, bright cheerful palette, daytime.
Landscape 3:2 composition, wide scene filling the whole frame, no border.
Many separate objects spread evenly across the picture with clear empty space
between them; objects do not overlap each other. Objects are medium to large,
no tiny details. Some open sky and open grass areas.
Indonesian setting. NO text, NO letters, NO numbers, NO signs with writing,
NO watermark. NO snow, NO snowy mountains, NO pine trees, NO squirrels,
NO red-and-white spotted mushrooms, NO pumpkins.
Only ONE picture (not two panels side by side, not a "spot the difference" sheet).
```

## Prompt per tema (pilih satu, tempel blok gaya di belakangnya)

**1. Perkemahan pramuka**
```
A scout camp in an Indonesian forest clearing: two kids in brown scout uniforms
with red-and-white scarves, a yellow tent, a red-and-white flag on a bamboo pole,
a campfire with a cooking pot, a picnic mat with bananas, rambutan and a plate of
fried rice, a backpack, a water bottle, a flashlight, a bamboo bridge over a small
river with fish, banana trees and a big leafy tree, a rabbit, two butterflies,
birds in the sky, colorful flowers in the grass.
```

**2. Pasar tradisional**
```
A cheerful traditional Indonesian market: wooden stalls with striped awnings,
baskets of fruits (watermelon, bananas, oranges, mangoes), vegetables (carrots,
corn, tomatoes, cabbage), a stack of eggs, a seller woman with a headscarf, a kid
carrying a woven basket, a parked bicycle, a cat sitting under a stall, hanging
lanterns, a red umbrella, potted plants, clouds and birds in the sky.
```

**3. Pantai**
```
A sunny Indonesian beach: a small wooden boat, a colorful beach umbrella, two kids
building a sandcastle, a bucket and spade, a coconut tree with coconuts, a beach
ball, a crab, starfish and shells on the sand, a kite in the sky, seagulls, a
fishing net drying on a pole, a hut with a thatched roof, waves and a small island.
```

**4. Sawah & desa**
```
Indonesian rice fields and village: terraced green rice paddies, a farmer with a
conical hat, a water buffalo, a scarecrow, a small hut on stilts, ducks walking in
a line, a bicycle on a dirt path, a coconut tree, a house with a red tile roof,
a kite, birds, a small stream with a wooden bridge, flowers along the path.
```

**5. Taman bermain sekolah**
```
An Indonesian elementary school playground: kids in red-and-white school uniforms,
a slide, swings, a seesaw, a sandbox, a football, a skipping rope, a bench with a
lunchbox and a water bottle, a school building with a red-and-white flag, a mango
tree, a cat, potted flowers, a bicycle rack with two bicycles, clouds and birds.
```

## Sesudah gambarnya jadi

- Kirim gambar **asli** (resolusi penuh) ke sesi Claude; jangan di-screenshot.
- Satu tema dulu. Kalau hasilnya pas di game, baru lanjut tema berikutnya.
- Cek sebelum kirim: tak ada tulisan, tak ada salju, benda tidak bertumpuk.
