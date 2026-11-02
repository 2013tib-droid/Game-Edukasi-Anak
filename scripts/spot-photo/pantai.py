"""Tempelan lukisan Mata Jeli "pantai".

    python3 scripts/spot-photo/pantai.py <foto 1200x800.png> public/assets/spot/pantai

Sumber = kiriman pemilik (Gemini 2000x1342), dipotong 2000x1333 (buang 4 px
atas) lalu 1200x800 = foto.webp. Kotak = `SPOT_PHOTOS.pantai`.
"""
import sys
from lib import Photo, huein

P = Photo(sys.argv[1], sys.argv[2])


def notsand(sl):
    return ~(huein(P.hue[sl], 25, 45) & (P.sat[sl] > 0.2) & (P.sat[sl] < 0.55) & (P.mx[sl] > 0.85))


P.hilang('burung1-hilang', (83.5, 11.5, 88.5, 14.6), P.notsky)
P.hilang('burung2-hilang', (91.5, 13, 96, 16.6), P.notsky)
P.hilang('awan-hilang', (94.5, 3, 118.5, 10.8), P.white, 2)
P.salin('burung-salin', (83.5, 11.5, 88.5, 14.6), P.notsky, 125, 4)
P.hilang('camar-hilang', (98, 15, 109, 21), P.ellipse(98.4, 15.4, 108.6, 20.6), 1, 'rows')
KITE = P.poly([(70.4, 8.8), (78.8, 9.1), (77.2, 18.4), (68.1, 17.9)])
P.warna('layangan-warna', (67, 8, 80, 19.3), 0, 360, 130, 0.5, keep=KITE, grow=0)
P.warna('layar-biru', (53.5, 36.5, 67.5, 55.5), 345, 18, 200, 0.45)
P.warna('ember-biru', (22.3, 82.3, 30.3, 90.6), 345, 18, 200, 0.45)
P.hilang('kepiting-hilang', (32.4, 87, 47.8, 99.8), P.ellipse(32.8, 87.4, 47.4, 99.4), 1, 'rows')
P.hilang('bintang-oranye-hilang', (71.3, 87.8, 80.7, 95.3), P.ellipse(71.6, 88.1, 80.4, 95), 1, 'rows')
P.warna('bintang-merah-kuning', (56.5, 92.5, 64.5, 98.7), 345, 18, 45, 0.45)
P.warna('sekop-merah', (55.3, 87.3, 64, 92.7), 185, 225, 150, 0.35)
P.warna('bola-warna', (84.3, 79.3, 95.9, 91), 0, 360, 120, 0.35, keep=P.ellipse(84.5, 79.5, 95.7, 90.8))
P.warna('baju-perempuan-hijau', (59, 72, 69.5, 82.5), 25, 48, 75, 0.6, 0.75)
P.warna('baju-laki-merah', (31.5, 72, 43, 86), 190, 225, 165, 0.35)
P.hilang('pulau-hilang', (20.2, 36.6, 48, 44.6), P.ellipse(20.6, 36.8, 47.6, 45.4) & P.poly([(0, 0), (150, 0), (150, 44.1), (0, 44.1)]), 1, 'rows')
P.hilang('kerang-biru-hilang', (90.4, 92.9, 98.7, 99), P.ellipse(90.8, 93.2, 98.3, 98.7), 1, 'rows')
P.hilang('batu-hilang', (110.5, 94.8, 116, 98.3), P.ellipse(110.6, 94.9, 115.9, 98.2), 1, 'rows')
UMB = P.poly([(93.3, 67.4), (105, 64.2), (114.2, 64.3), (121.3, 73.8), (125.4, 82.3), (120.6, 82.6), (114, 80.8), (104, 75.8), (100.3, 75.1), (96.3, 70.2)])
P.warna('payung-depan-merah', (93, 63.8, 126, 83), 36, 62, -48, 0.6, keep=UMB)
P.warna('atap-gubuk-hijau', (114.5, 28, 150, 47.8), 25, 48, 55, 0.3, 0.75, minval=0.8)
P.done()
