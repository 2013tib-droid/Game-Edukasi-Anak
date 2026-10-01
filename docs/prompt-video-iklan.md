# Prompt Video Iklan — Gemini (Veo)

Satu prompt untuk membuat video iklan pendek Petualangan Pintar lewat Gemini
(fitur video / Veo). Hasilnya ±8 detik, vertikal 9:16 untuk TikTok/Reels.

## Aturan yang sengaja dipasang di prompt

- **Nol tulisan, nol logo di video.** Video AI hampir selalu salah ketik
  ("Petualagan Pintr") dan logo buatannya tidak akan sama dengan
  `public/assets/logo.svg`. Nama, harga & link ditambahkan sendiri di CapCut.
- **Layar HP tidak diperlihatkan dari depan.** Veo tidak bisa menggambar
  tampilan app yang asli — layar yang dikarang AI terbaca seperti produk lain.
  Kalau mau memperlihatkan isi game, sambung dengan rekaman layar sungguhan.
- **Anak dan orang tua Indonesia, rumah Indonesia**, HP Android biasa (bukan
  iPhone/tablet mahal) — sesuai pasar.
- **Narasi Bahasa Indonesia, pendek.** Kalimat panjang dipotong di 8 detik.
- **Tanpa iklan yang berlebihan** ("anak jadi jenius", "nilai naik 100%"):
  janji yang tak bisa dibuktikan.

## PROMPT (salin semuanya ke Gemini)

```
Create an 8-second vertical video (9:16) for a children's educational app ad, warm and cheerful, shot like a cozy lifestyle commercial.

Scene: A bright, tidy Indonesian living room in the late afternoon, soft golden sunlight through the window, a rattan mat on the floor and a few colorful toys. A 5-year-old Indonesian girl with a short ponytail sits cross-legged on the floor holding an ordinary Android phone in both hands. Her mother (Indonesian, early 30s, casual home clothes, hijab) sits beside her, leaning in, smiling.

Action: The camera slowly pushes in from a medium shot. The girl taps the phone screen with one finger, concentrating, then her face lights up — she gasps happily, raises both arms and cheers. Her mother laughs and gives her a gentle high-five. End on a close-up of the girl's proud, happy face looking at the camera.

Camera and look: smooth handheld dolly-in, shallow depth of field, soft natural light, warm pastel color grade (cream, soft yellow, peach, mint), friendly and premium, not flashy.

Audio: light, playful ukulele and soft xylophone music; a soft cheerful "ding" sound when the girl cheers. A warm female Indonesian voice-over says, in Indonesian, slowly and clearly: "Belajar berhitung dan membaca, sambil bermain. Petualangan Pintar."

Important: the phone screen faces the child, never the camera. No text, no captions, no subtitles, no logos, no brand names, no watermarks anywhere in the video. Real, natural-looking people and hands with five fingers. No other children's apps or characters.
```

## Sesudah videonya jadi (di CapCut)

1. Tambahkan logo dari `public/assets/logo.svg` + tulisan **"Petualangan Pintar"**
   di 2 detik terakhir.
2. Teks harga perkenalan: **TK Rp19.000 · SD Kelas 1 & 2 Rp29.000** (cek dulu
   `LandingPage.tsx`, harga bisa berubah).
3. Ajakan: **"Coba gratis di petualanganpintar.com"** — ada 1 game gratis per
   kelompok, tanpa login.
4. Kalau suara narasi dari Gemini kurang jelas/logatnya aneh, matikan suaranya
   dan rekam sendiri, atau pakai narasi teks-ke-suara CapCut.

## Variasi cepat (ganti satu baris di prompt)

- **Anak laki-laki SD**: ganti tokohnya jadi *"a 7-year-old Indonesian boy in a
  white-and-red school uniform, at a wooden study table"* dan narasinya jadi
  *"Latihan berhitung, membaca, dan menulis — seru setiap hari. Petualangan
  Pintar."*
- **Ayah**: ganti *"Her mother (… hijab)"* jadi *"Her father (Indonesian, early
  30s, casual t-shirt)"*.
