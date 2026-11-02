"""Tempelan lukisan Mata Jeli "sekolah" (halaman bermain SD).

    python3 scripts/spot-photo/sekolah.py <foto 1200x800.png> public/assets/spot/sekolah

Sumber = kiriman pemilik (Gemini 2000x1342), dipotong 2000x1333 (buang 4 px
atas) lalu 1200x800 = foto.webp. Kotak = `SPOT_PHOTOS.sekolah`.
Bendera Merah Putih & seragam merah putih TIDAK pernah diubah.
"""
import sys
from lib import Photo

P = Photo(sys.argv[1], sys.argv[2])
P.hilang('burung1-hilang', (83.5, 11.5, 88.5, 14.6), P.notsky)
P.hilang('burung2-hilang', (91.5, 13, 96, 16.6), P.notsky)
P.hilang('awan-hilang', (94.5, 3, 118.5, 10.8), P.white, 2)
P.salin('burung-salin', (83.5, 11.5, 88.5, 14.6), P.notsky, 30, 5)
SLIDE = P.poly([(18.5, 48.5), (27, 48), (48, 69), (47, 75.5), (37, 76), (18.5, 56)])
P.warna('perosotan-merahmuda', (18, 47, 48, 76.5), 38, 60, -70, 0.45, keep=SLIDE)
P.warna('ember-merah', (24.5, 81.5, 31, 90), 190, 225, 150, 0.4, 1.2)
P.warna('ember-biru', (17.3, 80.7, 22.7, 86.3), 40, 62, 160, 0.6, grow=0)
P.warna('jungkat-merah', (64.8, 66.8, 73, 74.8), 180, 215, 165, 0.35, 1.3)
P.hilang('bola-hilang', (62.6, 89, 69.8, 96.2), P.ellipse(63, 89.3, 69.4, 96.6), 2)
CAT = (P.ellipse(127.2, 77.9, 137.6, 89.6) | P.ellipse(127.2, 77.4, 130.4, 80.8)) & ~P.poly([(124, 87.9), (129.8, 87.9), (129.8, 92), (124, 92)])
P.hilang('kucing-hilang', (127, 77.6, 137.8, 89.8), lambda sl: CAT[sl] & ~(P.color(sl, 38, 62, 0.5) | P.color(sl, 345, 20, 0.5)), 1, ('flat', (121, 81, 125.5, 84)))
P.warna('botol-merah', (106.2, 81.7, 109.4, 88.7), 185, 230, 160, 0.15, 1.6)
BOX = P.poly([(98.3, 85.4), (100, 84.5), (103.3, 84.5), (105.4, 85.4), (105.4, 88.3), (98.3, 88.3)])
P.warna('bekal-merahmuda', (97.6, 84.3, 105.9, 90), 15, 45, -45, 0.4, keep=BOX, minval=0.8)
P.warna('pintu-biru', (115.6, 40.6, 124.4, 57.8), 10, 40, 185, 0.25)
P.warna('bunga-kuning-merah', (126, 53.5, 131.5, 58.6), 38, 62, -48, 0.45)
P.warna('bunga-oranye-biru', (134, 51.8, 140, 57.6), 18, 55, 180, 0.35, keep=P.ellipse(134.2, 52.1, 139.7, 57.3), minval=0.6)
P.warna('bunga-pot-kuning', (84.5, 45.3, 90.2, 52.6), 345, 25, 40, 0.45)
P.warna('bunga-kiri-kuning', (0.8, 78, 8.2, 88.5), 345, 25, 42, 0.45)
P.warna('bunga-bawah-biru', (124.7, 87.5, 130.6, 92.6), 345, 25, -150, 0.45)
SWING = P.poly([(40.2, 62), (43.4, 36.8), (46.2, 36.8), (48.4, 62.2)]) | P.poly([(68.4, 61.8), (70.9, 36.8), (73.2, 36.8), (76.7, 61.8)])
P.warna('ayunan-biru', (40, 36.5, 77, 62.5), 355, 22, 200, 0.45, keep=SWING)
P.done()
