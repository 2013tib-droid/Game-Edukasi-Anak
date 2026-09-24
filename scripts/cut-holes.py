"""Tembus LATAR YANG TERKURUNG di dalam seni yang sudah dipotong.

    pip install pillow numpy
    python scripts/cut-holes.py <in.webp> --list
    python scripts/cut-holes.py <in.webp> <out.webp> --hole=x,y [--hole=x,y ...] [max_px]

Kenapa perlu: semua pemotong di repo ini (`cut-item.py`, `cut-soft.py`,
`cut-item-sheet.py`, `cut-gradient.py`) menelusuri latar DARI TEPI gambar. Latar
yang terkurung garis luar artwork — lubang ring kunci pas, lubang gantungan tali
terompet, rongga di bawah gagang gembok — tak pernah terjangkau, jadi ia tetap
PUTIH OPAK. Di atas latar app yang krem-merah muda itu terbaca sebagai gumpalan
pejal, bukan lubang. Cacatnya TIDAK kelihatan di atas kertas putih.

Lubangnya disebut SATU PER SATU dengan `--hole`, tidak pernah otomatis — persis
seperti daftar `HOLES` di `cut-item-sheet.py` dan `--hole` di `cut-gradient.py`.
Alasannya: bidang terkurung yang TERBESAR belum tentu lubang. Di piala
`selamat.webp`, bidang terbesar justru sorot krem di badan mangkuknya, sementara
dua lubang pegangannya lebih kecil — tak ada ambang ukuran yang memisahkannya.
Jalankan `--list` dulu, LIHAT bbox-nya, baru pilih.

AMBANGNYA SENGAJA KETAT (near-white: min kanal >= 238, sat <= 8). Sempat dicoba
longgar (lum >= 200, sat <= 22) waktu memotong `terkunci.webp`, dan rantainya
merambat ke **gagang gembok biru muda** yang pucat dan kurang jenuh — sisi dalam
gagangnya termakan bergerigi. Yang boleh dibuang di sini cuma latar yang benar-
benar putih; warna pastel apa pun, sepucat apa pun, milik gambarnya.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image

args = [a for a in sys.argv[1:]]
holes = [tuple(int(v) for v in a.split('=', 1)[1].split(',')) for a in args if a.startswith('--hole=')]
listing = '--list' in args
rest = [a for a in args if not a.startswith('--')]
SRC = rest[0]
DST = rest[1] if len(rest) > 1 and not listing else None
MAX_PX = int(rest[2]) if len(rest) > 2 else None
# Near-white saja — lihat catatan ambang di kepala berkas.
LMIN, SMAX = 238, 8
# Bercak lebih kecil dari ini tidak pernah dilaporkan: itu kilau mata, sorot
# badan, pantulan gigi — milik gambarnya.
MIN_BLOB = 150

im = Image.open(SRC).convert('RGBA')
a = np.asarray(im).copy()
H, W, _ = a.shape
rgb = a[:, :, :3].astype(np.int16)
alpha = a[:, :, 3]
mn = rgb.min(axis=2)
mx = rgb.max(axis=2)
white = (alpha > 128) & (mn >= LMIN) & ((mx - mn) <= SMAX)


def blob(sy, sx):
    """Piksel near-white yang tersambung ke (sy, sx)."""
    if not white[sy, sx]:
        return None
    m = np.zeros_like(white)
    m[sy, sx] = True
    q = deque([(sy, sx)])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and white[ny, nx] and not m[ny, nx]:
                m[ny, nx] = True
                q.append((ny, nx))
    return m


if listing or not holes:
    seen = np.zeros_like(white)
    found = []
    for sy in range(H):
        for sx in range(W):
            if white[sy, sx] and not seen[sy, sx]:
                m = blob(sy, sx)
                seen |= m
                ys, xs = np.where(m)
                if len(ys) >= MIN_BLOB:
                    found.append((len(ys), int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()),
                                  int(xs[len(xs) // 2]), int(ys[len(ys) // 2])))
    found.sort(reverse=True)
    print(f'{SRC}: {W}x{H}')
    print('  px      bbox (x0,y0,x1,y1)        --hole=')
    for n, x0, y0, x1, y1, cx, cy in found:
        print(f'  {n:<8} ({x0},{y0},{x1},{y1})'.ljust(36) + f'--hole={cx},{cy}')
    print('\nLIHAT dulu bbox-nya: yang terbesar belum tentu lubang.')
    sys.exit(0)

mask = np.zeros_like(white)
for x, y in holes:
    m = blob(y, x)
    if m is None:
        sys.exit(f'--hole={x},{y} bukan piksel near-white (mungkin sudah tembus, atau salah titik)')
    mask |= m
    print(f'lubang di ({x},{y}): {int(m.sum())} px')

# Feather 1px di tepi lubang — sama dengan yang dilakukan pemotongnya di tepi
# luar, supaya lubangnya tidak bergerigi saat gambar dikecilkan.
keep = (~mask).astype(np.float32)
p = np.pad(keep, 1, mode='edge')
soft = sum(p[i:i + H, j:j + W] for i in range(3) for j in range(3)) / 9.0
a[:, :, 3] = np.minimum(alpha, (soft * 255).astype(np.uint8))

out = Image.fromarray(a, 'RGBA')
if MAX_PX:
    scale = min(1.0, MAX_PX / max(out.size))
    if scale < 1.0:
        out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
out.save(DST, quality=86, method=6)
print(f'{DST}: {out.width}x{out.height}')
print('TEMPEL hasilnya di atas warna gelap dan lihat sebelum percaya.')
