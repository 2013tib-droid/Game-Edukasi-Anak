#!/usr/bin/env python3
"""Rapikan seni yang latarnya SUDAH transparan, lalu ekspor jadi WebP.

    python scripts/trim-alpha.py <sumber.png> <tujuan.webp> [lebar]

Saudara ketiga dari dua pemotong yang sudah ada — pilih sesuai bahan:

  cut-item.py   seni stiker beroutline di atas latar PUTIH (flood fill dari tepi)
  cut-soft.py   render 3D lembut tanpa outline di atas latar putih (erode/dilate)
  trim-alpha.py latarnya SUDAH transparan — tidak ada yang perlu ditebak

Menjalankan cut-item.py pada berkas yang sudah transparan itu berbahaya: ia
mencari latar PUTIH, sedangkan di sini bagian putih yang tersisa justru milik
gambarnya (badan kucing, spanduk) — jadi yang terbuang bisa isi gambarnya.

Yang dikerjakan:
  1. Memangkas pinggiran yang sepenuhnya transparan, supaya gambarnya mengisi
     berkasnya. CSS mengukur aset ini lewat LEBAR berkas, jadi margin kosong
     diam-diam mengecilkan gambar di layar.
  2. Menaikkan alpha yang nyaris opak (>= 250) jadi 255. Sebagian penghasil
     gambar menyimpan badan gambarnya di alpha 253-254; tak terlihat, tapi
     tak ada gunanya dibiarkan setengah tembus.
  3. Mengecilkan ke lebar yang diminta (LANCZOS) dan menyimpan WebP.
"""

import sys
from PIL import Image

ALPHA_SNAP = 250  # alpha >= ini dianggap opak penuh


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    src, dst = sys.argv[1], sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 720

    im = Image.open(src).convert("RGBA")
    before = im.size

    box = im.getbbox()
    if box is None:
        print("Gambarnya kosong (semua piksel transparan).")
        return 1
    im = im.crop(box)

    alpha = im.split()[3].point(lambda v: 255 if v >= ALPHA_SNAP else v)
    im.putalpha(alpha)

    if im.width != width:
        height = round(im.height * width / im.width)
        im = im.resize((width, height), Image.LANCZOS)

    im.save(dst, "WEBP", quality=92, method=6)

    kb = round(len(open(dst, "rb").read()) / 1024)
    print(f"{src} {before[0]}x{before[1]}  ->  {dst} {im.width}x{im.height}, {kb} kB")
    print(f"dipangkas: kiri {box[0]}, atas {box[1]}, kanan {before[0] - box[2]}, bawah {before[1] - box[3]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
