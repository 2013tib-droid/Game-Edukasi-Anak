"""Cut ONE piece of SOFT-3D art (maskot / render pastel mengkilap) into a
transparent WebP.

    pip install pillow numpy
    python scripts/cut-soft.py <art> public/assets/ui/<name>.webp [max_px]

Kapan memakai ini, bukan `cut-item.py`:

  * `cut-item.py` menyusuri latar sambil MEMBANDINGKAN dengan tetangganya
    (toleransi 8 per langkah). Untuk seni stiker berpaling outline coklat itu
    aman. Untuk render 3D lembut TANPA outline, tepinya adalah landaian halus
    dari latar ke badan — rantai toleransi itu bisa menuruni landaiannya dan
    MASUK ke dalam badan. Terbukti di gambar naga "tersendat" (2026-09-03):
    perutnya yang krem termakan jadi bolong besar, karena perut nyaris seputih
    latar dan tersambung ke luar lewat celah sempit di antara lengan dan badan.
  * Di sini latar dinilai dengan AMBANG GLOBAL, lalu topeng latarnya di-ERODE
    dulu sebelum ditelusuri dari tepi gambar dan di-DILATE kembali (opening by
    reconstruction). Jembatan sempit hilang saat erosi, jadi kebocoran ke dalam
    badan tidak mungkin terjadi — dan justru karena itu ambangnya boleh longgar
    (205) sehingga BAYANGAN LANTAI yang pucat ikut terbuang.

Alpha-nya diberi feather 1px: siluet render lembut tanpa outline terlihat
bergerigi kalau alpha-nya keras, apalagi di layar yang menampilkannya besar.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image

SRC, DST = sys.argv[1], sys.argv[2]
MAX_PX = int(sys.argv[3]) if len(sys.argv) > 3 else 384
# Latar + bayangan = terang & nyaris tak berwarna. Badan naga hijau mint
# saturasinya jauh di atas 14, jadi ambang selonggar ini pun tak menyentuhnya.
LMIN = int(sys.argv[4]) if len(sys.argv) > 4 else 205
SMAX = int(sys.argv[5]) if len(sys.argv) > 5 else 14
# Radius erosi = lebar jembatan tersempit yang masih boleh diputus.
R = int(sys.argv[6]) if len(sys.argv) > 6 else 5
# Bercak sisa yang lebih kecil dari ini dibuang (kilau kecil yang terputus).
MIN_BLOB = 200

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
H, W, _ = a.shape
lum = a.max(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
light = (lum >= LMIN) & (sat <= SMAX)


def erode(m):
    out = m.copy()
    out[1:, :] &= m[:-1, :]
    out[:-1, :] &= m[1:, :]
    out[:, 1:] &= m[:, :-1]
    out[:, :-1] &= m[:, 1:]
    return out


def dilate(m):
    out = m.copy()
    out[1:, :] |= m[:-1, :]
    out[:-1, :] |= m[1:, :]
    out[:, 1:] |= m[:, :-1]
    out[:, :-1] |= m[:, 1:]
    return out


def flood_from_border(mask):
    """Bagian `mask` yang tersambung ke tepi gambar."""
    seen = np.zeros_like(mask)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


core = light.copy()
for _ in range(R):
    core = erode(core)
bg = flood_from_border(core)
for _ in range(R + 2):
    bg = dilate(bg) & light

obj = ~bg

# Buang bercak kecil yang berdiri sendiri (kilau latar yang terlanjur lolos).
labelled = np.zeros((H, W), np.int32)
next_id = 0
for sy in range(H):
    for sx in range(W):
        if obj[sy, sx] and labelled[sy, sx] == 0:
            next_id += 1
            size = 0
            q = deque([(sy, sx)])
            labelled[sy, sx] = next_id
            cells = []
            while q:
                y, x = q.popleft()
                size += 1
                cells.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and obj[ny, nx] and labelled[ny, nx] == 0:
                        labelled[ny, nx] = next_id
                        q.append((ny, nx))
            if size < MIN_BLOB:
                for y, x in cells:
                    obj[y, x] = False

ys, xs = np.where(obj)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
alpha = obj[y0:y1, x0:x1].astype(np.float32)

# Kikis 1px (membuang lingkar pucat sisa latar), lalu blur 3x3 = feather 1px.
trim = alpha.copy()
trim[1:, :] = np.minimum(trim[1:, :], alpha[:-1, :])
trim[:-1, :] = np.minimum(trim[:-1, :], alpha[1:, :])
trim[:, 1:] = np.minimum(trim[:, 1:], alpha[:, :-1])
trim[:, :-1] = np.minimum(trim[:, :-1], alpha[:, 1:])
p = np.pad(trim, 1, mode='edge')
alpha = sum(p[i:i + trim.shape[0], j:j + trim.shape[1]] for i in range(3) for j in range(3)) / 9.0

rgba = np.dstack([a[y0:y1, x0:x1].astype(np.uint8), (alpha * 255).astype(np.uint8)])
img = Image.fromarray(rgba, 'RGBA')
scale = min(1.0, MAX_PX / max(img.size))
if scale < 1.0:
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
img.save(DST, 'WEBP', quality=92, method=6)
print(f'{DST}: {img.size[0]}x{img.size[1]}, latar terbuang {bg.mean() * 100:.1f}%')
