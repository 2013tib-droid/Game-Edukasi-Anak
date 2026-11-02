"""Tempelan lukisan Mata Jeli "sawah" (sawah & desa).

    python3 scripts/spot-photo/sawah.py <foto 1200x800.png> public/assets/spot/sawah

Sumber = kiriman pemilik (Gemini 2000x1342), dipotong 2000x1333 (buang 4 px
atas) lalu 1200x800 = foto.webp. Kotak = `SPOT_PHOTOS.sawah`.
"""
import sys
from lib import Photo, huein

P = Photo(sys.argv[1], sys.argv[2])


def notpath(sl):
    return ~(huein(P.hue[sl], 22, 45) & (P.sat[sl] > 0.2) & (P.sat[sl] < 0.6) & (P.mx[sl] > 0.78))


P.hilang('burung1-hilang', (83.5, 11.5, 88.5, 14.6), P.notsky)
P.hilang('burung2-hilang', (91.5, 13, 96, 16.6), P.notsky)
P.salin('burung-salin', (83.5, 11.5, 88.5, 14.6), P.notsky, 10, 4)
KITE = P.poly([(68.2, 13.8), (71.6, 10.1), (76.5, 10.1), (74.4, 17.6)])
P.warna('layangan-warna', (67.6, 9.6, 77, 18), 0, 360, 130, 0.5, keep=KITE, grow=0)
SHIRT = P.poly([(49.6, 46.5), (62, 45.7), (62, 49.5), (60.5, 50), (60.8, 56.8), (52.8, 56.8), (53.2, 50), (49.6, 50.2)])
P.warna('orangan-baju-hijau', (48, 45.5, 63.5, 57), 345, 20, 120, 0.45, 0.8, keep=SHIRT)
P.warna('caping-merah', (15.8, 48.2, 28.4, 54.8), 30, 55, -40, 0.3, keep=P.poly([(16, 54.6), (21.5, 48.3), (23.5, 48.3), (28.3, 54.6)]))
ROOF = P.poly([(104.6, 46.3), (108.4, 33.8), (136.6, 33.8), (138.4, 36.6), (137, 37.4), (140.6, 41), (137.6, 44.6), (131, 44.6), (131, 46.3)])
P.warna('atap-biru', (104.4, 33.5, 141, 46.5), 0, 16, 200, 0.45, keep=ROOF)
P.hilang('bebek-hilang', (112, 89.4, 121, 99), lambda sl: notpath(sl) & P.ellipse(112.4, 89.8, 120.6, 98.6)[sl], 2, 'rows')
P.salin('bebek-salin', (112.4, 89.8, 120.6, 98.6), lambda sl: notpath(sl) & P.ellipse(112.4, 89.8, 120.6, 98.6)[sl], 105, 63.5)
P.warna('bunga-merah-biru', (125.3, 87.6, 130.7, 92.7), 345, 20, -150, 0.45)
P.warna('heliconia-kuning', (143.3, 78, 150, 89.5), 345, 20, 45, 0.45)
P.warnai('baju-petani-biru', (9.5, 54, 25, 73), 215, 0.45, P.poly([(10, 54.5), (23, 54.5), (24.5, 66), (19, 72.5), (10, 72.5)]), 0.32)
P.warnai('sepeda-merah', (111.5, 72, 137.5, 88.5), 0, 0.6, P.poly([(111.5, 72), (137.5, 72), (137.5, 88.5), (111.5, 88.5)]), 0.28, 0.45, 0.92)
P.warna('jembatan-merah', (66.5, 78.2, 100, 86.6), 12, 42, -22, 0.35, 1.3, keep=P.poly([(66.8, 80.6), (77, 78.4), (99.8, 80), (97.2, 86.4), (69.8, 84.6)]))
P.done()
