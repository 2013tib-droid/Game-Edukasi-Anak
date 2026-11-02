"""Tempelan lukisan Mata Jeli "pasar" (pasar tradisional).

    python3 scripts/spot-photo/pasar.py <foto 1200x800.png> public/assets/spot/pasar

Sumber = kiriman pemilik (Gemini 2000x1342), dipotong 2000x1333 (buang 4 px
atas) lalu 1200x800 = foto.webp. Kotak = `SPOT_PHOTOS.pasar`.
"""
import sys
from lib import Photo

P = Photo(sys.argv[1], sys.argv[2])
P.hilang('burung1-hilang', (83.5, 11.5, 88.5, 14.6), P.notsky)
P.hilang('burung2-hilang', (91.5, 13, 96, 16.6), P.notsky)
P.hilang('awan-hilang', (94.5, 3, 118.5, 10.8), P.white, 2)
P.salin('burung-salin', (83.5, 11.5, 88.5, 14.6), P.notsky, 18, 2.5)
P.warna('payung-kuning', (81.5, 23.5, 116.5, 39), 345, 18, 48, 0.45, 1.3, lk=1.1)
P.warna('tenda-kuning-hijau', (0, 25, 24, 36.6), 40, 62, 80, 0.45, 0.65, lk=0.9)
P.warna('lampu-hijau-merah', (38, 36.5, 43.5, 47.2), 165, 215, 175, 0.3)
P.warna('lampu-merah-hijau', (71.5, 36.5, 77, 47.2), 345, 18, 120, 0.45, 0.7, lk=0.9)
P.warna('baju-anak-hijau', (84.8, 58.8, 94.2, 70.2), 345, 15, 120, 0.45, 0.8)
P.warna('pisang-hijau', (29, 82, 53.8, 94.5), 40, 62, 45, 0.45, 0.75)
P.warna('jeruk-hijau', (45.3, 64.3, 62.2, 72.6), 15, 42, 60, 0.6, 0.7, minval=0.85)
P.warna('tomat-kuning', (129, 50, 142.6, 59), 350, 12, 48, 0.5, minval=0.7)
P.warna('pot-tengah-biru', (94.5, 60.3, 102.6, 66.6), 0, 22, 190, 0.45, keep=P.poly([(94.5, 60.3), (102.3, 60.3), (101.4, 66.9), (95.6, 66.9)]))
P.warna('pot-kiri-biru', (2.8, 57.8, 12.8, 66.6), 0, 22, 190, 0.45, keep=P.poly([(3.3, 57.8), (12.7, 57.8), (11.6, 66.2), (4.6, 66.2)]))
P.hilang('sayur-gantung-hilang', (139.6, 38, 149.4, 49.6), P.ellipse(140.4, 39, 148.6, 49), 2, ('flat', (137.4, 42, 139.8, 46)))
P.warna('lampu-kanan-merah', (131, 37.8, 136.6, 46.2), 38, 62, -50, 0.3)
P.done()
